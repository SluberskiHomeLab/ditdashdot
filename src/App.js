import React, { useState, useEffect } from 'react';
import yaml from 'js-yaml';
import ServiceCard from './components/ServiceCard';

const App = () => {
  const [groups, setGroups] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [dashboardTitle, setDashboardTitle] = useState("Homelab Dashboard");
  const [showDetails, setShowDetails] = useState(true);

  const themeStyles = {
    backgroundColor: darkMode ? '#1a1616ff' : '#ffffff',
    color: darkMode ? '#ffffff' : '#1a1616ff',
    minHeight: '100vh',
    backgroundImage: 'url(/background.jpg)',
    backgroundSize: 'cover'
  };

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch('/config.yml');
        const text = await response.text();
        const data = yaml.load(text);
        if (data.title) setDashboardTitle(data.title);
        if (data.groups) setGroups(data.groups);
      } catch (err) {
        console.error("Failed to load config.yml:", err);
      }
    };
    loadConfig();
  }, []);

  useEffect(() => {
    const updateStatuses = async () => {
      const updatedGroups = await Promise.all(
        groups.map(async (group) => {
          const updatedServices = await Promise.all(
            (group.services || []).map(async (service) => {
              try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 2000);
                const response = await fetch(service.url, { signal: controller.signal });
                clearTimeout(timeoutId);
                return {
                  ...service,
                  status: response.ok ? "online" : "offline",
                  statusColor: response.ok ? "#00cc00" : "#cc0000"
                };
              } catch {
                return {
                  ...service,
                  status: "offline",
                  statusColor: "#cc0000"
                };
              }
            })
          );
          return { ...group, services: updatedServices };
        })
      );
      setGroups(updatedGroups);
    };
    updateStatuses();
    // eslint-disable-next-line
  }, [groups.length]);

  const filterServices = (services) =>
    services.filter(service =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div style={{ padding: '0px', fontFamily: 'Arial, sans-serif', ...themeStyles }}>
      <div style={{ backgroundColor: '#ccc', padding: '10px', textAlign: 'center' }}>
        <h1 style={{ margin: 0 }}>{dashboardTitle}</h1>
        <button onClick={() => setDarkMode(!darkMode)} style={{ marginLeft: '20px', padding: '5px 10px' }}>
          {darkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
        <button
          onClick={() => setShowDetails(!showDetails)}
          style={{ marginLeft: '10px', padding: '5px 10px' }}
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
        </button>
      </div>
      <div style={{ textAlign: 'center', margin: '5px 0' }}>
        <input
          type='text'
          placeholder='Search services...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: '8px', width: '300px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
      </div>
      {groups.map((group, idx) => {
        const filtered = filterServices(group.services || []);
        if (filtered.length === 0) return null;
        return (
          <div key={idx} style={{ margin: '40px 0 0 0' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>{group.title}</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
              {filtered.map((service, index) => (
                <ServiceCard key={index} service={service} showDetails={showDetails} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default App;
