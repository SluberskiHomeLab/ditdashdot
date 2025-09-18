import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ServiceCard from './components/ServiceCard';
import ConfigEditor from './components/ConfigEditor';
import { Box, CircularProgress, Typography } from '@mui/material';

const Dashboard = () => {
  const [groups, setGroups] = useState([]);
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
        const [settingsRes, groupsRes, servicesRes, iconsRes] = await Promise.all([
          fetch('/api/settings'),
          fetch('/api/groups'),
          fetch('/api/services'),
          fetch('/api/icons')
        ]);

        const [settingsData, groupsData, servicesData, iconsData] = await Promise.all([
          settingsRes.json(),
          groupsRes.json(),
          servicesRes.json(),
          iconsRes.json()
        ]);

        console.log('Loaded data:', { settingsData, groupsData, servicesData, iconsData });

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

        setGroups(groupsData || []);
        setBarIcons(iconsData || []);
        setError(null);
      } catch (err) {
        console.error("Failed to load configuration:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadConfig();
  }, []);

  useEffect(() => {
    let intervalId;

    const pingServices = async () => {
      const newStatuses = {};
      for (const group of groups) {
        for (const service of group.services || []) {
          const key = `${service.ip}:${service.port}`;
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);
            const response = await fetch(service.url, { method: 'HEAD', signal: controller.signal });
            clearTimeout(timeoutId);
            newStatuses[key] = response.ok;
          } catch {
            newStatuses[key] = false;
          }
        }
      }
      setStatuses(newStatuses);
    };

    if (groups.length > 0) {
      pingServices();
      intervalId = setInterval(pingServices, 60000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [groups]);

  const themeStyles = {
    backgroundColor:
      mode === "dark_mode" ? "#222"
      : mode === "light_mode" ? "#fff"
      : "transparent",
    color:
      mode === "dark_mode" ? "#fff"
      : mode === "light_mode" ? "#1a1616ff"
      : mode === "trans_dark" ? "#fff"
      : mode === "trans_light" ? "#000"
      : "#1a1616ff",
    minHeight: '100vh',
    backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : undefined,
    backgroundSize: 'cover'
  };

  const filterServices = (services) =>
    services.filter(service =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div style={{ padding: '0px', fontFamily: 'Arial, sans-serif', ...themeStyles, position: 'relative' }}>
      <div style={{ backgroundColor: 'transparent', padding: '10px', textAlign: 'center', color: themeStyles.color }}>
        <h1 style={{ margin: 0 }}>{dashboardTitle}</h1>
      </div>
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
        <Route path="/" element={<Dashboard />} />
        <Route path="/config" element={<ConfigurationPage />} />
      </Routes>
    </Router>
  );
};

export default App;
