import React from 'react';

const ServiceCard = ({ service, showDetails = true, mode = "light_mode" }) => {
  let background, color;
  if (mode === "dark_mode") {
    background = "#222";
    color = "#fff";
  } else if (mode === "light_mode") {
    background = "#fff";
    color = "#1a1616ff";
  } else if (mode === "trans_light") {
    background = "transparent";
    color = "#000";
  } else if (mode === "trans_dark") {
    background = "transparent";
    color = "#fff";
  } else {
    background = "#fff";
    color = "#1a1616ff";
  }

  return (
    <button
      onClick={() => window.open(service.url, '_blank', 'noopener,noreferrer')}
      style={{
        background,
        color,
        borderRadius: '10px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        padding: '20px',
        minWidth: '220px',
        maxWidth: '250px',
        textAlign: 'center',
        position: 'relative',
        border: 'none',
        cursor: 'pointer',
        transition: 'box-shadow 0.2s',
        outline: 'none'
      }}
      title={`Open ${service.name}`}
    >
      <img
        src={service.iconUrl}
        alt={service.name}
        style={{ width: '48px', height: '48px', marginBottom: '10px' }}
      />
      <h2 style={{ fontSize: '1.2em', margin: '10px 0' }}>{service.name}</h2>
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
    </button>
  );
};

export default ServiceCard;
