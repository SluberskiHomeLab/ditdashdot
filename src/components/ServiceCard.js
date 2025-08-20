import React from 'react';

const ServiceCard = ({ service }) => {
  return (
    <a
      href={service.url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        textDecoration: 'none',
        color: 'inherit',
        border: '2px solid #ccc',
        borderRadius: '10px',
        padding: '15px',
        width: '200px',
        backgroundColor: service.status === 'online' ? '#e0ffe0' : '#ffe0e0',
        boxShadow: '2px 2px 8px rgba(0,0,0,0.1)',
        transition: 'transform 0.2s',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: 'pointer'
      }}
      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
    >
      <div style={{ position: 'relative' }}>
        <img
          src={service.iconUrl}
          alt={`${service.name} icon`}
          style={{ width: '128px', height: '128px', objectFit: 'contain' }}
        />
        <div style={{
          position: 'absolute',
          bottom: '5px',
          right: '5px',
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          backgroundColor: service.statusColor || '#999'
        }} />
      </div>
      <h3 style={{ margin: '10px 0 5px 0' }}>{service.name}</h3>
      <p><strong>IP:</strong> {service.ip}</p>
      <p><strong>Port:</strong> {service.port}</p>
      <p><strong>Status:</strong> {service.status}</p>
    </a>
  );
};

export default ServiceCard;
