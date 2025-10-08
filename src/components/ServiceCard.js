import React from 'react';
import { getServiceCardStyle } from '../themes/themeConfig';

const ServiceCard = ({ 
  service: { name, url, icon_url, ip, port }, 
  showDetails = true, 
  mode = "light_mode", 
  status,
  fontFamily = "Arial, sans-serif",
  fontSize = "14px",
  iconSize = "32px"
}) => {
  // Get theme-specific card styling
  const cardStyle = getServiceCardStyle(mode, status);

  return (
    <button
      onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
      style={{
        ...cardStyle,
        borderRadius: '10px',
        boxShadow: cardStyle.boxShadow || '0 2px 8px rgba(0,0,0,0.1)',
        padding: '20px',
        minWidth: '220px',
        maxWidth: '250px',
        textAlign: 'center',
        border: 'none',
        cursor: 'pointer',
        fontFamily,
        fontSize,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px'
      }}
    >
      {icon_url && (
        <img 
          src={icon_url} 
          alt={name}
          style={{
            width: iconSize,
            height: iconSize,
            objectFit: 'contain'
          }}
        />
      )}
      <div>{name}</div>
      {showDetails && ip && port && (
        <div style={{ fontSize: '0.8em', opacity: 0.8 }}>{ip}:{port}</div>
      )}
    </button>
  );
};

export default ServiceCard;
