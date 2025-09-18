import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import yaml from 'js-yaml';
import ServiceCard from './components/ServiceCard';
import ConfigurationPage from './components/config/ConfigurationPage';

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

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch('/config.yml');
        const text = await response.text();
        const data = yaml.load(text);
        if (data.title) setDashboardTitle(data.title);
        if (data.tab_title) setTabTitle(data.tab_title);
        if (data.favicon_url) setFaviconUrl(data.favicon_url);
        if (data.groups) setGroups(data.groups);
        if (data.mode) setMode(data.mode);
        if (typeof data.show_details === "boolean") setShowDetails(data.show_details);
        if (data.background_url) setBackgroundUrl(data.background_url);
        if (data.font_family) setFontFamily(data.font_family);
        if (data.font_size) setFontSize(data.font_size);
        if (data.icon_size) setIconSize(data.icon_size);
      } catch (err) {
        console.error("Failed to load config.yml:", err);
      }
    };
    loadConfig();
  }, []);

  useEffect(() => {
    const loadBarConfig = async () => {
      try {
        const response = await fetch('/barconfig.yml');
        const text = await response.text();
        const data = yaml.load(text);
        if (Array.isArray(data.icons)) setBarIcons(data.icons);
      } catch (err) {
        // If barconfig.yml doesn't exist, just ignore
      }
    };
    loadBarConfig();
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
