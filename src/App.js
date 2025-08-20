import React, { useState, useEffect } from 'react';
import yaml from 'js-yaml';
import ServiceCard from './components/ServiceCard';

const App = () => {
  const [services, setServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  const themeStyles = {
    backgroundColor: darkMode ? '#121212' : '#ffffff',
    color: darkMode ? '#ffffff' : '#000000',
    minHeight: '100vh',
    backgroundImage: 'url(/background.png)',
    backgroundSize: 'cover'
  };

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch('/config.yml');
        const text = await response.text();
        const data = yaml.load(text);
        setServices(data.services || []);
      } catch (err) {
        console.error("Failed to load config.yml:", err);
      }
    };
    loadConfig();
  }, []);

  useEffect(() => {
    const updateStatuses = async () => {
      const updated = await Promise.all(
        services.map(async (service) => {
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
      setServices(updated);
    };
    updateStatuses();
  }, [services]);

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: '0px', fontFamily: 'Arial, sans-serif', ...themeStyles }}>
      <div style={{ backgroundColor: '#ccc', padding: '10px', textAlign: 'center' }}>
        <h1 style={{ margin: 0 }}>Homelab Dashboard</h1>
        <button onClick={() => setDarkMode(!darkMode)} style={{ marginLeft: '20px', padding: '5px 10px' }}>
          {darkMode ? 'Light Mode' : 'Dark Mode'}
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
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginTop: '20px', justifyContent: 'center' }}>
        {filteredServices.map((service, index) => (
          <ServiceCard key={index} service={service} />
        ))}
      </div>
    </div>
  );
};

export default App;
