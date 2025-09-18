import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Switch,
  FormControlLabel,
  MenuItem,
  Snackbar,
  Alert
} from '@mui/material';
import axios from 'axios';

const API_URL = '/api'; // Using relative URL

const ConfigurationPage = () => {
  const [config, setConfig] = useState({
    title: '',
    tab_title: '',
    favicon_url: '',
    mode: 'light_mode',
    show_details: true,
    background_url: '',
    font_family: 'Arial, sans-serif',
    font_size: '14px',
    icon_size: '32px'
  });
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/config`);
      setConfig(response.data.config);
    } catch (error) {
      console.error('Error fetching config:', error);
      setAlert({
        open: true,
        message: 'Error loading configuration',
        severity: 'error'
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/api/config/dashboard`, config);
      setAlert({
        open: true,
        message: 'Configuration saved successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error saving config:', error);
      setAlert({
        open: true,
        message: 'Error saving configuration',
        severity: 'error'
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Dashboard Configuration
        </Typography>
        
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="Dashboard Title"
              name="title"
              value={config.title}
              onChange={handleChange}
              fullWidth
            />
            
            <TextField
              label="Browser Tab Title"
              name="tab_title"
              value={config.tab_title}
              onChange={handleChange}
              fullWidth
            />
            
            <TextField
              label="Favicon URL"
              name="favicon_url"
              value={config.favicon_url}
              onChange={handleChange}
              fullWidth
            />
            
            <TextField
              select
              label="Theme Mode"
              name="mode"
              value={config.mode}
              onChange={handleChange}
              fullWidth
            >
              <MenuItem value="light_mode">Light Mode</MenuItem>
              <MenuItem value="dark_mode">Dark Mode</MenuItem>
              <MenuItem value="trans_light">Transparent Light</MenuItem>
              <MenuItem value="trans_dark">Transparent Dark</MenuItem>
              <MenuItem value="service_mode">Service Mode</MenuItem>
            </TextField>
            
            <FormControlLabel
              control={
                <Switch
                  checked={config.show_details}
                  onChange={handleSwitchChange}
                  name="show_details"
                />
              }
              label="Show Details"
            />
            
            <TextField
              label="Background URL"
              name="background_url"
              value={config.background_url}
              onChange={handleChange}
              fullWidth
            />
            
            <TextField
              label="Font Family"
              name="font_family"
              value={config.font_family}
              onChange={handleChange}
              fullWidth
            />
            
            <TextField
              label="Font Size"
              name="font_size"
              value={config.font_size}
              onChange={handleChange}
              fullWidth
            />
            
            <TextField
              label="Icon Size"
              name="icon_size"
              value={config.icon_size}
              onChange={handleChange}
              fullWidth
            />
            
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
            >
              Save Configuration
            </Button>
          </Box>
        </form>
      </Paper>
      
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={() => setAlert({ ...alert, open: false })}
      >
        <Alert
          onClose={() => setAlert({ ...alert, open: false })}
          severity={alert.severity}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ConfigurationPage;