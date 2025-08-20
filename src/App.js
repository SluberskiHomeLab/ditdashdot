import React, { useState, useEffect } from 'react';
import yaml from 'js-yaml';
import UploadYAML from './components/UploadYAML';
import ServiceCard from './components/ServiceCard';
import ConfigEditor from './components/ConfigEditor';

const App = () => {
  const [services, setServices] = useState([]);

  useEffect(() => {
    const savedConfig = localStorage.getItem("homelabConfig");
    if (savedConfig) {
      setServices(JSON.parse(savedConfig));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("homelabConfig", JSON.stringify(services));
  }, [services]);

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
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Homelab Dashboard</h1>
      <UploadYAML setServices={setServices} />
      <ConfigEditor services={services} setServices={setServices} />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginTop: '20px' }}>
        {services.map((service, index) => (
          <ServiceCard key={index} service={service} />
        ))}
      </div>
    </div>
  );
};

export default App;
