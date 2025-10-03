import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { WbSunny, Cloud, CloudQueue, Grain, Thunderstorm } from '@mui/icons-material';

const WeatherWidget = ({ config, themeStyles, isSmall = false }) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeather = async () => {
      if (!config.apiKey || !config.location) {
        setError('Weather API key and location required');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(config.location)}&appid=${config.apiKey}&units=${config.units || 'metric'}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch weather data');
        }
        
        const data = await response.json();
        setWeather(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 600000); // Update every 10 minutes

    return () => clearInterval(interval);
  }, [config]);

  const getWeatherIcon = (weather) => {
    const main = weather?.weather?.[0]?.main?.toLowerCase();
    switch (main) {
      case 'clear': return <WbSunny />;
      case 'clouds': return <CloudQueue />;
      case 'rain': return <Grain />;
      case 'thunderstorm': return <Thunderstorm />;
      default: return <Cloud />;
    }
  };

  const getTemperatureUnit = () => {
    return config.units === 'imperial' ? '°F' : '°C';
  };

  if (loading) {
    return (
      <Card sx={{ backgroundColor: themeStyles.backgroundColor, color: themeStyles.color }}>
        <CardContent>
          <Typography>Loading weather...</Typography>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ backgroundColor: themeStyles.backgroundColor, color: themeStyles.color }}>
        <CardContent>
          <Typography color="error">Weather Error: {error}</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ 
      backgroundColor: themeStyles.backgroundColor, 
      color: themeStyles.color,
      minWidth: isSmall ? 100 : 200,
      border: `1px solid ${themeStyles.color}20`
    }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="body1" component="div" sx={{ fontSize: isSmall ? '10pt' : '12pt' }}>
              {weather?.name}
            </Typography>
            <Typography variant="h5" component="div" sx={{ fontSize: isSmall ? '12pt' : '14pt' }}>
              {Math.round(weather?.main?.temp)}{getTemperatureUnit()}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8, fontSize: isSmall ? '8pt' : '10pt' }}>
              {weather?.weather?.[0]?.description}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.6, fontSize: isSmall ? '8pt' : '9pt' }}>
              Feels like {Math.round(weather?.main?.feels_like)}{getTemperatureUnit()}
            </Typography>
          </Box>
          <Box sx={{ fontSize: isSmall ? '1.5rem' : '2.5rem', opacity: 0.8 }}>
            {getWeatherIcon(weather)}
          </Box>
        </Box>
        <Box display="flex" justifyContent="space-between" mt={1}>
          <Typography variant="body2" sx={{ opacity: 0.8, fontSize: isSmall ? '8pt' : '9pt' }}>
            Humidity: {weather?.main?.humidity}%
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8, fontSize: isSmall ? '8pt' : '9pt' }}>
            Wind: {weather?.wind?.speed} {config.units === 'imperial' ? 'mph' : 'm/s'}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default WeatherWidget;