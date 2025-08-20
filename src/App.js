import React, { useState, useEffect } from 'react';
import yaml from 'js-yaml';
import ServiceCard from './components/ServiceCard';

const App = () => {
  const [groups, setGroups] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dashboardTitle, setDashboardTitle] = useState("Homelab Dashboard");
  const [showDetails, setShowDetails] = useState(true);
  const [mode, setMode] = useState("light_mode"); // default mode

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch('/config.yml');
        const text = await response.text();
        const data = yaml.load(text);
        if (data.title) setDashboardTitle(data.title);
        if (data.groups) setGroups(data.groups);
        if (data.mode) setMode(data.mode); // get mode from config
      } catch (err) {
        console.error("Failed to load config.yml:", err);
      }
    };
    loadConfig();
  }, []);

  const themeStyles = {
    backgroundColor:
      mode === "dark_mode" ? "#222"
      : mode === "light_mode" ? "#fff"
      : "transparent",
    color:
      mode === "trans_dark" ? "#fff"
      : "#1a1616ff",
    minHeight: '100vh',
    backgroundImage: 'url(/background.jpg)',
    backgroundSize: 'cover'
  };

  const filterServices = (services) =>
    services.filter(service =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div style={{ padding: '0px', fontFamily: 'Arial, sans-serif', ...themeStyles }}>
      <div style={{ backgroundColor: 'transparent', padding: '10px', textAlign: 'center' }}>
        <h1 style={{ margin: 0 }}>{dashboardTitle}</h1>
        <button
          onClick={() => setShowDetails(!showDetails)}
          style={{
            marginLeft: '10px',
            padding: '5px 10px',
            borderRadius: '8px',
            border: 'none',
            background: '#eee',
            cursor: 'pointer',
            minWidth: '40px',
            minHeight: '40px',
            fontWeight: 'bold',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
          }}
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
                <ServiceCard key={index} service={service} showDetails={showDetails} mode={mode} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default App;
