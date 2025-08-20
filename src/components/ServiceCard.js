import React from 'react';

const ServiceCard = ({ service, showDetails = true }) => {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: '10px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        padding: '20px',
        minWidth: '220px',
        maxWidth: '250px',
        textAlign: 'center',
        position: 'relative'
      }}
    >
      <img
        src={service.iconUrl}
        alt={service.name}
        style={{ width: '48px', height: '48px', marginBottom: '10px' }}
      />
      <h2 style={{ fontSize: '1.2em', margin: '10px 0' }}>{service.name}</h2>
      <a
        href={service.url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-block',
          marginBottom: '10px',
          color: '#007bff',
          textDecoration: 'none'
        }}
      >
        Open
      </a>
      {showDetails && (
        <div style={{ marginTop: '10px', fontSize: '0.95em' }}>
          <div>
            <strong>IP:</strong> {service.ip}
          </div>
          <div>
            <strong>Port:</strong> {service.port}
          </div>
          <div>
            <strong>Status:</strong>{' '}
            <span style={{ color: service.statusColor || (service.status === 'online' ? '#00cc00' : '#cc0000') }}>
              {service.status}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceCard;
