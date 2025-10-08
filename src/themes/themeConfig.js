// Theme configuration for DitDashDot
// This module defines all available themes and their properties

export const THEMES = {
  light_mode: {
    name: "Light Mode",
    backgroundColor: "#fff",
    color: "#1a1616ff",
    backgroundImage: null,
    cardShadow: "0 2px 8px rgba(0,0,0,0.1)",
    border: "none"
  },
  
  dark_mode: {
    name: "Dark Mode",
    backgroundColor: "#222",
    color: "#fff",
    backgroundImage: null,
    cardShadow: "0 2px 8px rgba(0,0,0,0.3)",
    border: "none"
  },
  
  trans_light: {
    name: "Transparent Light",
    backgroundColor: "transparent",
    color: "#000",
    backgroundImage: null,
    cardShadow: "0 2px 8px rgba(0,0,0,0.1)",
    border: "none"
  },
  
  trans_dark: {
    name: "Transparent Dark",
    backgroundColor: "transparent", 
    color: "#fff",
    backgroundImage: null,
    cardShadow: "0 2px 8px rgba(0,0,0,0.3)",
    border: "none"
  },
  
  service_mode_light: {
    name: "Service Mode Light",
    backgroundColor: "#fff",
    color: "#1a1616ff",
    backgroundImage: null,
    cardShadow: "0 2px 8px rgba(0,0,0,0.1)",
    border: "none",
    serviceColors: {
      unknown: { background: "#bbb", color: "#222" },
      up: { background: "#82ff82ff", color: "#fff" },
      down: { background: "#ff5959ff", color: "#fff" }
    }
  },
  
  service_mode_dark: {
    name: "Service Mode Dark",
    backgroundColor: "#222",
    color: "#fff",
    backgroundImage: null,
    cardShadow: "0 2px 8px rgba(0,0,0,0.3)",
    border: "none",
    serviceColors: {
      unknown: { background: "#555", color: "#ccc" },
      up: { background: "#2d5a2d", color: "#90ee90" },
      down: { background: "#5a2d2d", color: "#ffb3b3" }
    }
  },
  
  retro: {
    name: "Retro",
    backgroundColor: "#f2f0e6",
    color: "#2c1810",
    backgroundImage: "/themes/retro-bg.jpg",
    cardShadow: "2px 2px 4px rgba(0,0,0,0.3)",
    border: "2px solid #8b4513",
    cardStyle: {
      fontFamily: "'Courier New', monospace",
      borderRadius: "0px",
      background: "linear-gradient(145deg, #f5f5dc, #ddd8c0)"
    }
  },
  
  matrix: {
    name: "Matrix",
    backgroundColor: "#000000",
    color: "#00ff00",
    backgroundImage: "/themes/matrix-bg.gif",
    cardShadow: "0 0 10px rgba(0,255,0,0.3)",
    border: "1px solid #00ff00",
    cardStyle: {
      fontFamily: "'Courier New', monospace",
      borderRadius: "0px",
      background: "rgba(0,0,0,0.8)",
      border: "1px solid #00ff00",
      boxShadow: "0 0 10px rgba(0,255,0,0.2), inset 0 0 10px rgba(0,255,0,0.1)"
    },
    inputStyle: {
      background: "rgba(0,0,0,0.8)",
      border: "1px solid #00ff00",
      color: "#00ff00"
    }
  },
  
  nuclear: {
    name: "Nuclear",
    backgroundColor: "#1a1a0d",
    color: "#ffff99",
    backgroundImage: "/themes/nuclear-bg.jpg",
    cardShadow: "0 0 15px rgba(255,215,0,0.3)",
    border: "2px solid #ffd700",
    cardStyle: {
      fontFamily: "'Roboto Condensed', sans-serif",
      borderRadius: "5px",
      background: "linear-gradient(145deg, #2a2a1a, #1a1a0d)",
      border: "2px solid #ffd700",
      boxShadow: "0 0 15px rgba(255,215,0,0.2), inset 0 0 10px rgba(255,215,0,0.1)"
    },
    inputStyle: {
      background: "rgba(26,26,13,0.9)",
      border: "1px solid #ffd700",
      color: "#ffff99"
    }
  },
  
  high_contrast_light: {
    name: "High Contrast Light",
    backgroundColor: "#ffffff",
    color: "#000000",
    backgroundImage: null,
    cardShadow: "none",
    border: "4px solid #000000",
    cardStyle: {
      borderRadius: "8px",
      background: "#ffffff",
      border: "4px solid #000000",
      boxShadow: "none",
      fontWeight: "bold"
    },
    inputStyle: {
      background: "#ffffff",
      border: "4px solid #000000",
      color: "#000000",
      fontWeight: "bold"
    }
  },
  
  high_contrast_dark: {
    name: "High Contrast Dark",
    backgroundColor: "#000000",
    color: "#ffffff", 
    backgroundImage: null,
    cardShadow: "none",
    border: "4px solid #ffffff",
    cardStyle: {
      borderRadius: "8px",
      background: "#000000",
      border: "4px solid #ffffff",
      boxShadow: "none",
      fontWeight: "bold"
    },
    inputStyle: {
      background: "#000000",
      border: "4px solid #ffffff",
      color: "#ffffff",
      fontWeight: "bold"
    }
  }
};

// Helper function to get theme configuration
export const getTheme = (themeName) => {
  return THEMES[themeName] || THEMES.light_mode;
};

// Helper function to get all theme names for dropdown
export const getThemeNames = () => {
  return Object.keys(THEMES);
};

// Helper function to get service card styles for service mode themes
export const getServiceCardStyle = (themeName, status) => {
  const theme = getTheme(themeName);
  
  // Handle service mode themes
  if (theme.serviceColors) {
    if (status === undefined) {
      return theme.serviceColors.unknown;
    } else if (status) {
      return theme.serviceColors.up;
    } else {
      return theme.serviceColors.down;
    }
  }
  
  // Default card styling
  return {
    background: theme.backgroundColor,
    color: theme.color
  };
};