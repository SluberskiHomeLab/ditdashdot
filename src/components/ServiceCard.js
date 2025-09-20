import React from 'react';

const ServiceCard = ({ 
  service: { name, url, icon_url, ip, port }, 
  showDetails = true, 
  mode = "light_mode", 
  status,
  fontFamily = "Arial, sans-serif",
  fontSize = "14px",
  iconSize = "32px"
}) => {
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
  } else if (mode === "service_mode") {
    if (status === undefined) {
      background = "#bbb";
      color = "#222";
    } else if (status) {
      background = "#82ff82ff";
      color = "#fff";
    } else {
      background = "#ff5959ff";
      color = "#fff";
    }
  } else {
    background = "#fff";
    color = "#1a1616ff";
  }

  return (
    <button
      onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
      style={{
        background,
        color,
        borderRadius: '10px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
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
      {showDetails && (
        <div style={{ fontSize: '0.8em', opacity: 0.8 }}>{ip}:{port}</div>
      )}
    </button>
  );
};

export default ServiceCard;
