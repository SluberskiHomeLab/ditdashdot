import React from 'react';
import { Box } from '@mui/material';
import WeatherWidget from './WeatherWidget';
import SunPositionWidget from './SunPositionWidget';
import DateTimeWidget from './DateTimeWidget';

const WidgetContainer = ({ widgets, themeStyles, displayType = 'all' }) => {
  const renderWidget = (widget, isSmall = false) => {
    const scale = isSmall ? 0.5 : 1;
    const transform = isSmall ? 'scale(0.5)' : 'none';
    const transformOrigin = isSmall ? 'center' : 'initial';
    
    const widgetProps = {
      key: widget.id,
      config: widget.config,
      themeStyles: themeStyles,
      isSmall: isSmall
    };

    let widgetComponent;
    switch (widget.type) {
      case 'weather':
        widgetComponent = <WeatherWidget {...widgetProps} />;
        break;
      case 'sun_position':
        widgetComponent = <SunPositionWidget {...widgetProps} />;
        break;
      case 'datetime':
        widgetComponent = <DateTimeWidget {...widgetProps} />;
        break;
      default:
        return null;
    }

    if (isSmall) {
      return (
        <Box
          key={widget.id}
          sx={{
            transform: transform,
            transformOrigin: transformOrigin,
            margin: '-25px', // Compensate for scaling
          }}
        >
          {widgetComponent}
        </Box>
      );
    }

    return widgetComponent;
  };

  if (!widgets || widgets.length === 0) {
    return null;
  }

  const enabledWidgets = widgets
    .filter(widget => widget.enabled !== false)
    .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

  if (displayType === 'datetime') {
    // Only show datetime widgets
    const datetimeWidgets = enabledWidgets.filter(widget => widget.type === 'datetime');
    
    if (datetimeWidgets.length === 0) return null;
    
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center',
          mb: 3
        }}
      >
        {datetimeWidgets.map(widget => renderWidget(widget, false))}
      </Box>
    );
  }

  if (displayType === 'other') {
    // Only show non-datetime widgets, made smaller
    const otherWidgets = enabledWidgets.filter(widget => widget.type !== 'datetime');
    
    if (otherWidgets.length === 0) return null;
    
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 1, 
          justifyContent: 'center',
          mb: 4
        }}
      >
        {otherWidgets.map(widget => renderWidget(widget, true))}
      </Box>
    );
  }

  // Legacy: show all widgets (fallback)
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: 2, 
        justifyContent: 'center',
        mb: 4 
      }}
    >
      {enabledWidgets.map(widget => renderWidget(widget, false))}
    </Box>
  );
};

export default WidgetContainer;