import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { AccessTime, Today } from '@mui/icons-material';

const DateTimeWidget = ({ config, themeStyles, isSmall = false }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = () => {
    const options = {
      hour: '2-digit',
      minute: '2-digit',
      second: config.showSeconds ? '2-digit' : undefined,
      hour12: config.format12Hour || false,
      timeZone: config.timezone || undefined
    };
    return currentTime.toLocaleTimeString(config.locale || 'en-US', options);
  };

  const formatDate = () => {
    const options = {
      weekday: config.showWeekday ? 'long' : undefined,
      year: 'numeric',
      month: config.dateFormat === 'short' ? 'short' : 'long',
      day: 'numeric',
      timeZone: config.timezone || undefined
    };
    return currentTime.toLocaleDateString(config.locale || 'en-US', options);
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 6) return 'Good Night';
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    if (hour < 21) return 'Good Evening';
    return 'Good Night';
  };

  return (
    <Card sx={{ 
      backgroundColor: themeStyles.backgroundColor, 
      color: themeStyles.color,
      minWidth: isSmall ? 200 : 350,
      maxWidth: isSmall ? 250 : 500,
      border: `1px solid ${themeStyles.color}20`
    }}>
      <CardContent sx={{ py: isSmall ? 1 : 2 }}>
        <Box 
          display="flex" 
          alignItems="center" 
          justifyContent="center"
          gap={isSmall ? 2 : 4}
          flexWrap="wrap"
        >
          {/* Time Section */}
          <Box display="flex" alignItems="center" gap={1}>
            <AccessTime sx={{ opacity: 0.8, fontSize: isSmall ? '14px' : '18px' }} />
            <Box textAlign="center">
              <Typography 
                variant={isSmall ? "h6" : "h5"}
                component="div" 
                sx={{ 
                  fontFamily: 'monospace',
                  fontWeight: 'bold',
                  lineHeight: 1,
                  fontSize: isSmall ? '12pt' : '14pt'
                }}
              >
                {formatTime()}
              </Typography>
              {config.showGreeting && (
                <Typography variant="caption" sx={{ opacity: 0.7, fontSize: '10pt' }}>
                  {getGreeting()}
                </Typography>
              )}
            </Box>
          </Box>

          {/* Vertical Divider - Hidden on small screens */}
          <Box 
            sx={{ 
              height: isSmall ? '30px' : '40px',
              width: '1px', 
              backgroundColor: themeStyles.color, 
              opacity: 0.3,
              display: { xs: 'none', sm: 'block' }
            }} 
          />

          {/* Date Section */}
          <Box display="flex" alignItems="center" gap={1}>
            <Today sx={{ opacity: 0.8, fontSize: isSmall ? '14px' : '18px' }} />
            <Box textAlign="center">
              <Typography 
                variant={isSmall ? "body1" : "h6"}
                component="div" 
                sx={{ 
                  fontWeight: 'medium',
                  opacity: 0.9,
                  fontSize: isSmall ? '10pt' : '12pt'
                }}
              >
                {formatDate()}
              </Typography>
              {config.showTimezone && (
                <Typography variant="caption" sx={{ opacity: 0.6, fontSize: '9pt' }}>
                  {config.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default DateTimeWidget;