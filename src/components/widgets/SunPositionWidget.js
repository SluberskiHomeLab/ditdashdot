import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Box, LinearProgress } from '@mui/material';
import { WbSunny, Brightness3 } from '@mui/icons-material';

const SunPositionWidget = ({ config, themeStyles, isSmall = false }) => {
  const [sunData, setSunData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSunData = async () => {
      if (!config.latitude || !config.longitude) {
        setError('Latitude and longitude required');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `https://api.sunrise-sunset.org/json?lat=${config.latitude}&lng=${config.longitude}&formatted=0`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch sun position data');
        }
        
        const data = await response.json();
        if (data.status === 'OK') {
          setSunData(data.results);
          setError(null);
        } else {
          throw new Error('Invalid location data');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSunData();
    const interval = setInterval(fetchSunData, 3600000); // Update every hour

    return () => clearInterval(interval);
  }, [config]);

  const calculateSunProgress = () => {
    if (!sunData) return 0;

    const now = new Date();
    const sunrise = new Date(sunData.sunrise);
    const sunset = new Date(sunData.sunset);

    if (now < sunrise) return 0; // Before sunrise
    if (now > sunset) return 100; // After sunset

    const totalDaylight = sunset - sunrise;
    const currentProgress = now - sunrise;
    return (currentProgress / totalDaylight) * 100;
  };

  const isDaytime = () => {
    if (!sunData) return true;
    const now = new Date();
    const sunrise = new Date(sunData.sunrise);
    const sunset = new Date(sunData.sunset);
    return now >= sunrise && now <= sunset;
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: config.timezone || 'local'
    });
  };

  const getDaylightDuration = () => {
    if (!sunData) return '';
    const sunrise = new Date(sunData.sunrise);
    const sunset = new Date(sunData.sunset);
    const duration = sunset - sunrise;
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <Card sx={{ backgroundColor: themeStyles.backgroundColor, color: themeStyles.color }}>
        <CardContent>
          <Typography>Loading sun data...</Typography>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ backgroundColor: themeStyles.backgroundColor, color: themeStyles.color }}>
        <CardContent>
          <Typography color="error">Sun Position Error: {error}</Typography>
        </CardContent>
      </Card>
    );
  }

  const progress = calculateSunProgress();
  const isDay = isDaytime();

  return (
    <Card sx={{ 
      backgroundColor: themeStyles.backgroundColor, 
      color: themeStyles.color,
      minWidth: isSmall ? 125 : 250,
      border: `1px solid ${themeStyles.color}20`
    }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="body1" component="div" sx={{ fontSize: isSmall ? '10pt' : '12pt' }}>
            Sun Position
          </Typography>
          <Box sx={{ fontSize: isSmall ? '1.2rem' : '1.8rem', opacity: 0.8 }}>
            {isDay ? <WbSunny /> : <Brightness3 />}
          </Box>
        </Box>
        
        <Box mb={2}>
          <Typography variant="body2" sx={{ mb: 1, opacity: 0.8, fontSize: isSmall ? '8pt' : '9pt' }}>
            {isDay ? 'Daytime Progress' : 'Sun has set'}
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ 
              height: isSmall ? 6 : 8, 
              borderRadius: 4,
              backgroundColor: `${themeStyles.color}20`,
              '& .MuiLinearProgress-bar': {
                backgroundColor: isDay ? '#ffa726' : '#424242'
              }
            }} 
          />
          <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.6, fontSize: isSmall ? '7pt' : '8pt' }}>
            {Math.round(progress)}% complete
          </Typography>
        </Box>

        <Box display="flex" justifyContent="space-between" mb={1}>
          <Box textAlign="center">
            <Typography variant="body2" sx={{ opacity: 0.8, fontSize: isSmall ? '8pt' : '9pt' }}>
              Sunrise
            </Typography>
            <Typography variant="body2" sx={{ fontSize: isSmall ? '9pt' : '10pt' }}>
              {formatTime(sunData.sunrise)}
            </Typography>
          </Box>
          <Box textAlign="center">
            <Typography variant="body2" sx={{ opacity: 0.8, fontSize: isSmall ? '8pt' : '9pt' }}>
              Sunset
            </Typography>
            <Typography variant="body2" sx={{ fontSize: isSmall ? '9pt' : '10pt' }}>
              {formatTime(sunData.sunset)}
            </Typography>
          </Box>
        </Box>

        <Box textAlign="center">
          <Typography variant="body2" sx={{ opacity: 0.8, fontSize: isSmall ? '8pt' : '9pt' }}>
            Daylight Duration: {getDaylightDuration()}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default SunPositionWidget;