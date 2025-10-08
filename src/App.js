import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams, Navigate } from 'react-router-dom';
import ServiceCard from './components/ServiceCard';
import ConfigEditor from './components/ConfigEditor';
import { Box, CircularProgress, Typography, IconButton, Drawer, List, ListItem, ListItemText, AppBar, Toolbar, Alert } from '@mui/material';
import { Settings as SettingsIcon, Menu as MenuIcon } from '@mui/icons-material';
import ConfigurationPage from './components/config/ConfigurationPage';
import NavigationMenu from './components/NavigationMenu';
import RootRedirect from './components/RootRedirect';
import WidgetContainer from './components/widgets/WidgetContainer';
import { getTheme, getServiceCardStyle } from './themes/themeConfig';
import './themes/backgrounds.css';

const Dashboard = () => {
  const { pageId } = useParams();
  const [pages, setPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(null);
  const [groups, setGroups] = useState([]);
  const [widgets, setWidgets] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dashboardTitle, setDashboardTitle] = useState("Homelab Dashboard");
  const [tabTitle, setTabTitle] = useState("Homelab Dashboard");
  const [faviconUrl, setFaviconUrl] = useState("");
  const [mode, setMode] = useState("light_mode");
  const [showDetails, setShowDetails] = useState(true);
  const [statuses, setStatuses] = useState({});
  const [backgroundUrl, setBackgroundUrl] = useState("");
  const [barIcons, setBarIcons] = useState([]); // new state for bar icons
  const [fontFamily, setFontFamily] = useState("Arial, sans-serif");
  const [fontSize, setFontSize] = useState("14px");
  const [iconSize, setIconSize] = useState("32px");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [alertSettings, setAlertSettings] = useState({ enabled: false });

  // Effect to update document title and favicon
  useEffect(() => {
    // Update document title
    document.title = tabTitle;

    // Update favicon
    if (faviconUrl) {
      const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'shortcut icon';
      link.href = faviconUrl;
      document.getElementsByTagName('head')[0].appendChild(link);
    }
  }, [tabTitle, faviconUrl]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        setLoading(true);
        const [settingsRes, groupsRes, servicesRes, iconsRes, pagesRes, widgetsRes, alertSettingsRes] = await Promise.all([
          fetch('/api/settings'),
          fetch('/api/groups'),
          fetch('/api/services'),
          fetch('/api/icons'),
          fetch('/api/pages'),
          fetch('/api/widgets'),
          fetch('/api/alert-settings').catch(() => ({ json: () => Promise.resolve({}) }))
        ]);

        const [settingsData, groupsData, servicesData, iconsData, pagesData, widgetsData, alertSettingsData] = await Promise.all([
          settingsRes.json(),
          groupsRes.json(),
          servicesRes.json(),
          iconsRes.json(),
          pagesRes.json(),
          widgetsRes.json(),
          alertSettingsRes.json()
        ]);

        console.log('Loaded data:', { settingsData, groupsData, servicesData, iconsData, pagesData, widgetsData });

        // Set pages
        setPages((pagesData || []).sort((a, b) => a.display_order - b.display_order));

        // Find current page
        let targetPageId = pageId;
        if (!targetPageId && pagesData && pagesData.length > 0) {
          targetPageId = pagesData.sort((a, b) => a.display_order - b.display_order)[0].id.toString();
        }
        
        const currentPageData = pagesData ? pagesData.find(p => p.id.toString() === targetPageId) : null;
        setCurrentPage(currentPageData);

        if (settingsData) {
          setDashboardTitle(settingsData.title || "Homelab Dashboard");
          setTabTitle(settingsData.tab_title || "Homelab Dashboard");
          setFaviconUrl(settingsData.favicon_url || "");
          setMode(settingsData.mode || "light_mode");
          setShowDetails(settingsData.show_details !== false);
          setBackgroundUrl(settingsData.background_url || "");
          setFontFamily(settingsData.font_family || "Arial, sans-serif");
          setFontSize(settingsData.font_size || "14px");
          setIconSize(settingsData.icon_size || "32px");
        }

        // Filter groups, services, and widgets by current page
        let filteredGroupsData = groupsData || [];
        let filteredServicesData = servicesData || [];
        let filteredWidgetsData = widgetsData || [];
        
        if (currentPageData) {
          filteredGroupsData = (groupsData || []).filter(group => group.page_id === currentPageData.id);
          filteredServicesData = (servicesData || []).filter(service => {
            const serviceGroup = (groupsData || []).find(g => g.id === service.group_id);
            return serviceGroup && serviceGroup.page_id === currentPageData.id;
          });
          filteredWidgetsData = (widgetsData || []).filter(widget => widget.page_id === currentPageData.id);
        }

        // Group services by their group_id
        const groupedServices = {};
        filteredServicesData.forEach(service => {
          if (!groupedServices[service.group_id]) {
            groupedServices[service.group_id] = [];
          }
          groupedServices[service.group_id].push(service);
        });

        // Attach services to their groups
        const groupsWithServices = filteredGroupsData.map(group => ({
          ...group,
          services: groupedServices[group.id] || []
        }));

        setGroups(groupsWithServices);
        setWidgets(filteredWidgetsData);
        setBarIcons(iconsData || []);
        setAlertSettings(alertSettingsData || { enabled: false });
        setError(null);
      } catch (err) {
        console.error("Failed to load configuration:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadConfig();
  }, [pageId]);

  useEffect(() => {
    const intervalRef = { current: null };

    const pingServices = async () => {
      try {
        // Collect all services that have IP and port
        const servicesToPing = [];
        for (const group of groups) {
          for (const service of group.services || []) {
            if (service.ip && service.port) {
              servicesToPing.push(service);
            }
          }
        }

        if (servicesToPing.length === 0) {
          setStatuses({});
          return;
        }

        // Use server-side ping endpoint
        const response = await fetch('/api/ping', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ services: servicesToPing }),
        });

        if (response.ok) {
          const results = await response.json();
          setStatuses(results);
        } else {
          console.error('Failed to ping services:', response.statusText);
        }
      } catch (error) {
        console.error('Error pinging services:', error);
      }
    };

    if (groups.length > 0) {
      pingServices();
      intervalRef.current = setInterval(pingServices, 60000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [groups]);

  // Get theme configuration
  const currentTheme = getTheme(mode);
  
  const themeStyles = {
    backgroundColor: currentTheme.backgroundColor,
    color: currentTheme.color,
    minHeight: '100vh',
    backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : currentTheme.backgroundImage ? `url(${currentTheme.backgroundImage})` : undefined,
    backgroundSize: 'cover',
    backgroundAttachment: 'fixed',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    // Apply custom theme styles
    ...(currentTheme.cardStyle && { 
      fontFamily: currentTheme.cardStyle.fontFamily 
    })
  };
  
  // Add CSS class for special background effects
  const themeClass = mode === 'matrix' ? 'matrix-bg' : 
                    mode === 'retro' ? 'retro-bg' : 
                    mode === 'nuclear' ? 'nuclear-bg' : 
                    mode === 'high_contrast_light' ? 'high-contrast-light-bg' :
                    mode === 'high_contrast_dark' ? 'high-contrast-dark-bg' : '';

  const filterServices = (services) =>
    services.filter(service =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div 
      className={themeClass}
      style={{ 
        padding: '0px', 
        fontFamily: currentTheme.cardStyle?.fontFamily || 'Arial, sans-serif', 
        ...themeStyles, 
        position: 'relative' 
      }}
    >
      <NavigationMenu 
        open={drawerOpen} 
        onClose={() => setDrawerOpen(false)} 
        pages={pages}
        themeStyles={themeStyles}
      />
      <div style={{ backgroundColor: 'transparent', padding: '10px', textAlign: 'center', color: themeStyles.color, position: 'relative' }}>
        <IconButton 
          onClick={() => setDrawerOpen(true)}
          style={{ 
            position: 'absolute', 
            left: '20px', 
            top: '50%', 
            transform: 'translateY(-50%)',
            color: themeStyles.color,
            width: iconSize,
            height: iconSize,
            padding: '8px'
          }} 
          title="Navigation Menu"
        >
          <MenuIcon style={{ 
            width: '100%', 
            height: '100%' 
          }} />
        </IconButton>
        <h1 style={{ margin: 0 }}>{currentPage ? currentPage.title : dashboardTitle}</h1>
        <Link to="/config" style={{ 
          position: 'absolute', 
          right: '20px', 
          top: '50%', 
          transform: 'translateY(-50%)',
          textDecoration: 'none'
        }}>
          <IconButton 
            style={{ 
              color: themeStyles.color,
              width: iconSize,
              height: iconSize,
              padding: '8px'
            }} 
            title="Edit config"
          >
            <SettingsIcon style={{ 
              width: '100%', 
              height: '100%' 
            }} />
          </IconButton>
        </Link>
      </div>
      
      {/* Alert notification banner */}
      {alertSettings.enabled && mode !== "service_mode" && (
        <div style={{ padding: '10px 20px' }}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Alerts are enabled but will only work when using "Service Mode" theme. 
            <Link to="/config" style={{ textDecoration: 'none', marginLeft: '8px' }}>
              Change to Service Mode
            </Link>
          </Alert>
        </div>
      )}
      
      {/* DateTime widgets displayed prominently below title */}
      {widgets && widgets.length > 0 && (
        <WidgetContainer 
          widgets={widgets} 
          themeStyles={themeStyles} 
          displayType="datetime"
        />
      )}
      
      <div style={{ textAlign: 'center', margin: '5px 0', color: themeStyles.color }}>
        <input
          type='text'
          placeholder='Search services...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: '8px', width: '300px', borderRadius: '5px', border: '1px solid #ccc', color: themeStyles.color, background: 'transparent' }}
        />
        {barIcons.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '18px', margin: '18px 0 0 0' }}>
            {barIcons.map((icon, idx) => (
              <button
                key={idx}
                onClick={() => window.open(icon.link, '_blank', 'noopener,noreferrer')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  width: '32px',
                  height: '32px'
                }}
                title={icon.alt || ''}
              >
                <img
                  src={icon.iconUrl}
                  alt={icon.alt || ''}
                  style={{ width: '32px', height: '32px', display: 'block' }}
                />
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Other widgets displayed smaller */}
      {widgets && widgets.length > 0 && (
        <WidgetContainer 
          widgets={widgets} 
          themeStyles={themeStyles} 
          displayType="other"
        />
      )}
      
      {groups.map((group, idx) => {
        const filtered = filterServices(group.services || []);
        if (filtered.length === 0) return null;
        return (
          <div key={idx} style={{ margin: '40px 0 0 0' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '20px', color: themeStyles.color }}>{group.title}</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
              {filtered.map((service, index) => {
                const key = `${service.ip}:${service.port}`;
                return (
                  <ServiceCard
                    key={index}
                    service={service}
                    showDetails={showDetails}
                    mode={mode}
                    status={statuses[key]}
                    fontFamily={fontFamily}
                    fontSize={fontSize}
                    iconSize={iconSize}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
      <div
        style={{
          position: 'fixed',
          left: '10px',
          bottom: '10px',
          fontSize: '0.8em',
          color: '#bbb',
          zIndex: 1000,
          pointerEvents: 'none'
        }}
      >
        Created by SluberskiHomelab on GitHub
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/page/:pageId" element={<Dashboard />} />
        <Route path="/config" element={<ConfigurationPage />} />
      </Routes>
    </Router>
  );
};

export default App;
