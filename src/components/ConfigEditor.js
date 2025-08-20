import React from 'react';

const ConfigEditor = ({ services, setServices }) => {
  const handleChange = (index, field, value) => {
    const updated = [...services];
    updated[index][field] = value;
    setServices(updated);
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <h2>Edit Configuration</h2>
      {services.map((service, index) => (
        <div key={index} style={{ marginBottom: '10px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
          <input
            type="text"
            value={service.name}
            onChange={(e) => handleChange(index, 'name', e.target.value)}
            placeholder="Name"
            style={{ marginRight: '10px' }}
          />
          <input
            type="text"
            value={service.ip}
            onChange={(e) => handleChange(index, 'ip', e.target.value)}
            placeholder="IP"
            style={{ marginRight: '10px' }}
          />
          <input
            type="text"
            value={service.port}
            onChange={(e) => handleChange(index, 'port', e.target.value)}
            placeholder="Port"
            style={{ marginRight: '10px' }}
          />
          <input
            type="text"
            value={service.url}
            onChange={(e) => handleChange(index, 'url', e.target.value)}
            placeholder="URL"
            style={{ marginRight: '10px' }}
          />
          <input
            type="text"
            value={service.iconUrl}
            onChange={(e) => handleChange(index, 'iconUrl', e.target.value)}
            placeholder="Icon URL"
          />
        </div>
      ))}
    </div>
  );
};

export default ConfigEditor;
