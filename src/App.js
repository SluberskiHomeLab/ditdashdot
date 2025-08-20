import React, { useState, useEffect } from 'react';
import yaml from 'js-yaml';
import ServiceCard from './components/ServiceCard';

const App = () => {
  const [services, setServices] = useState([]);

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

  return (
    <div style={{ padding: '0px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ backgroundColor: '#ccc', padding: '10px', textAlign: 'center' }}>
        <h1 style={{ margin: 0 }}>Homelab Dashboard</h1>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginTop: '20px', justifyContent: 'center' }}>
        {services.map((service, index) => (
          <ServiceCard key={index} service={service} />
        ))}
      </div>
    </div>
  );
};

export default App;
