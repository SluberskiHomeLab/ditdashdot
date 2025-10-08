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
  Alert,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Home as HomeIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { THEMES } from '../../themes/themeConfig';

const API_URL = '/api'; // Using relative URL

const TabPanel = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const ConfigurationPage = () => {
  const [tabValue, setTabValue] = useState(0);
  const [settings, setSettings] = useState({
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
  const [pages, setPages] = useState([]);
  const [groups, setGroups] = useState([]);
  const [services, setServices] = useState([]);
  const [widgets, setWidgets] = useState([]);
  const [icons, setIcons] = useState([]);
  const [alertSettings, setAlertSettings] = useState({
    enabled: true,
    webhook_url: '',
    webhook_enabled: false,
    down_threshold_minutes: 5,
    paused_until: null
  });
  const [alertHistory, setAlertHistory] = useState([]);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [settingsRes, groupsRes, servicesRes, iconsRes, pagesRes, widgetsRes, alertSettingsRes, alertHistoryRes] = await Promise.all([
        axios.get(`${API_URL}/settings`),
        axios.get(`${API_URL}/groups`),
        axios.get(`${API_URL}/services`),
        axios.get(`${API_URL}/icons`),
        axios.get(`${API_URL}/pages`),
        axios.get(`${API_URL}/widgets`),
        axios.get(`${API_URL}/alert-settings`).catch(() => ({ data: {} })),
        axios.get(`${API_URL}/alert-history?limit=100`).catch(() => ({ data: [] }))
      ]);

      setSettings(settingsRes.data || {});
      setPages(pagesRes.data || []);
      setGroups(groupsRes.data || []);
      setServices(servicesRes.data || []);
      setWidgets(widgetsRes.data || []);
      setIcons(iconsRes.data || []);
      setAlertSettings(alertSettingsRes.data || {
        enabled: true,
        webhook_url: '',
        webhook_enabled: false,
        down_threshold_minutes: 5,
        paused_until: null
      });
      setAlertHistory(alertHistoryRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
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
      await axios.put(`${API_URL}/settings`, settings);
      setAlert({
        open: true,
        message: 'Settings saved successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      setAlert({
        open: true,
        message: 'Error saving configuration',
        severity: 'error'
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleAdd = (type) => {
    setDialogType(type);
    const newItem = { display_order: 0 };
    
    // Set default page_id for groups and widgets if pages exist
    if ((type === 'groups' || type === 'widgets') && pages.length > 0) {
      newItem.page_id = pages[0].id;
    }
    
    // Set default values for widgets
    if (type === 'widgets') {
      newItem.type = 'datetime';
      newItem.enabled = true;
      newItem.config = {};
    }
    
    setEditingItem(newItem);
    setDialogOpen(true);
  };

  const handleEdit = (type, item) => {
    setDialogType(type);
    // Clear any temporary configString when editing
    const cleanItem = { ...item };
    if ('configString' in cleanItem) {
      delete cleanItem.configString;
    }
    setEditingItem(cleanItem);
    setDialogOpen(true);
  };

  const handleDelete = async (type, id) => {
    try {
      await axios.delete(`${API_URL}/${type}/${id}`);
      fetchData();
      setAlert({
        open: true,
        message: 'Item deleted successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting item:', error);
      setAlert({
        open: true,
        message: 'Error deleting item',
        severity: 'error'
      });
    }
  };

  const handleDialogSave = async () => {
    try {
      // Validate required fields
      if (dialogType === 'groups' && (!editingItem.title || !editingItem.page_id)) {
        setAlert({
          open: true,
          message: 'Group name and page are required',
          severity: 'error'
        });
        return;
      }
      
      if (dialogType === 'pages' && !editingItem.title) {
        setAlert({
          open: true,
          message: 'Page title is required',
          severity: 'error'
        });
        return;
      }
      
      if (dialogType === 'widgets' && (!editingItem.type || !editingItem.page_id)) {
        setAlert({
          open: true,
          message: 'Widget type and page are required',
          severity: 'error'
        });
        return;
      }
      
      if (dialogType === 'widgets' && editingItem.configString !== undefined) {
        setAlert({
          open: true,
          message: 'Widget configuration contains invalid JSON. Please fix the JSON syntax.',
          severity: 'error'
        });
        return;
      }
      
      // Log the data being sent
      console.log('Saving item:', {
        type: dialogType,
        data: editingItem
      });
      
      const endpoint = `${API_URL}/${dialogType}`;
      const method = editingItem.id ? 'put' : 'post';
      const url = editingItem.id ? `${endpoint}/${editingItem.id}` : endpoint;

      const response = await axios[method](url, editingItem);
      console.log('Server response:', response.data);
      
      setDialogOpen(false);
      fetchData();
      setAlert({
        open: true,
        message: 'Item saved successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error saving item:', error);
      console.error('Error details:', error.response?.data || error.message);
      setAlert({
        open: true,
        message: error.response?.data?.error || 'Error saving item',
        severity: 'error'
      });
    }
  };

  // Alert management functions
  const handleAlertSettingsChange = (field, value) => {
    setAlertSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAlertSettingsSave = async () => {
    try {
      console.log('Saving alert settings:', alertSettings);
      const response = await axios.put(`${API_URL}/alert-settings`, alertSettings);
      console.log('Alert settings save response:', response.data);
      
      // Update local state with saved data
      setAlertSettings(response.data);
      
      setAlert({
        open: true,
        message: 'Alert settings saved successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error saving alert settings:', error);
      console.error('Error details:', error.response?.data);
      
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message ||
                          'Error saving alert settings - please check server logs';
      
      setAlert({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    }
  };

  const handlePauseAlerts = async (hours) => {
    try {
      const pauseUntil = new Date();
      pauseUntil.setHours(pauseUntil.getHours() + hours);
      
      const updatedSettings = {
        ...alertSettings,
        paused_until: pauseUntil.toISOString()
      };
      
      await axios.put(`${API_URL}/alert-settings`, updatedSettings);
      setAlertSettings(updatedSettings);
      
      setAlert({
        open: true,
        message: `Alerts paused for ${hours} hour${hours > 1 ? 's' : ''}`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Error pausing alerts:', error);
      setAlert({
        open: true,
        message: 'Error pausing alerts',
        severity: 'error'
      });
    }
  };

  const handleResumeAlerts = async () => {
    try {
      const updatedSettings = {
        ...alertSettings,
        paused_until: null
      };
      
      await axios.put(`${API_URL}/alert-settings`, updatedSettings);
      setAlertSettings(updatedSettings);
      
      setAlert({
        open: true,
        message: 'Alerts resumed',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error resuming alerts:', error);
      setAlert({
        open: true,
        message: 'Error resuming alerts',
        severity: 'error'
      });
    }
  };

  const handleClearAlertHistory = async () => {
    try {
      await axios.delete(`${API_URL}/alert-history`);
      setAlertHistory([]);
      setAlert({
        open: true,
        message: 'Alert history cleared successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error clearing alert history:', error);
      setAlert({
        open: true,
        message: 'Error clearing alert history',
        severity: 'error'
      });
    }
  };

  const handleTestWebhook = async () => {
    try {
      const response = await axios.post(`${API_URL}/test-webhook`, {
        webhook_url: alertSettings.webhook_url
      });
      
      setAlert({
        open: true,
        message: response.data.message || 'Test webhook sent successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error testing webhook:', error);
      setAlert({
        open: true,
        message: error.response?.data?.error || 'Error testing webhook',
        severity: 'error'
      });
    }
  };

  const formatAlertTime = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const isAlertsPaused = () => {
    return alertSettings.paused_until && new Date(alertSettings.paused_until) > new Date();
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, position: 'relative' }}>
        <Link to="/" style={{ 
          position: 'absolute',
          right: '20px',
          top: '20px',
          textDecoration: 'none'
        }}>
          <IconButton 
            style={{ 
              color: 'inherit',
              padding: '8px'
            }}
            title="Return to dashboard"
          >
            <HomeIcon />
          </IconButton>
        </Link>
        <Typography variant="h4" gutterBottom>
          Dashboard Configuration
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="General Settings" />
            <Tab label="Pages" />
            <Tab label="Groups" />
            <Tab label="Services" />
            <Tab label="Widgets" />
            <Tab label="Icons" />
            <Tab label="Alerts" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                label="Dashboard Title"
                name="title"
                value={settings.title}
                onChange={handleChange}
                fullWidth
              />
              
              <TextField
                label="Browser Tab Title"
                name="tab_title"
                value={settings.tab_title}
                onChange={handleChange}
                fullWidth
              />
              
              <TextField
                label="Favicon URL"
                name="favicon_url"
                value={settings.favicon_url}
                onChange={handleChange}
                fullWidth
              />
              
              <TextField
                select
                label="Theme Mode"
                name="mode"
                value={settings.mode}
                onChange={handleChange}
                fullWidth
              >
                {Object.entries(THEMES).map(([key, theme]) => (
                  <MenuItem key={key} value={key}>{theme.name}</MenuItem>
                ))}
              </TextField>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.show_details}
                    onChange={handleSwitchChange}
                    name="show_details"
                  />
                }
                label="Show Details"
              />
              
              <TextField
                label="Background URL"
                name="background_url"
                value={settings.background_url}
                onChange={handleChange}
                fullWidth
              />
              
              <TextField
                label="Font Family"
                name="font_family"
                value={settings.font_family}
                onChange={handleChange}
                fullWidth
              />
              
              <TextField
                label="Font Size"
                name="font_size"
                value={settings.font_size}
                onChange={handleChange}
                fullWidth
              />
              
              <TextField
                label="Icon Size"
                name="icon_size"
                value={settings.icon_size}
                onChange={handleChange}
                fullWidth
              />
              
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
              >
                Save Settings
              </Button>
            </Box>
          </form>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleAdd('pages')}
            >
              Add Page
            </Button>
          </Box>
          <List>
            {pages.map((page) => (
              <ListItem key={page.id}>
                <ListItemText 
                  primary={page.title}
                  secondary={`Display Order: ${page.display_order}`}
                />
                <ListItemSecondaryAction>
                  <IconButton onClick={() => handleEdit('pages', page)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete('pages', page.id)}>
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box sx={{ mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleAdd('groups')}
            >
              Add Group
            </Button>
          </Box>
          <List>
            {groups.map((group) => {
              const page = pages.find(p => p.id === group.page_id);
              return (
                <ListItem key={group.id}>
                  <ListItemText 
                    primary={group.title}
                    secondary={page ? `Page: ${page.title}` : 'No page assigned'}
                  />
                  <ListItemSecondaryAction>
                    <IconButton onClick={() => handleEdit('groups', group)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete('groups', group.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              );
            })}
          </List>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Box sx={{ mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleAdd('services')}
            >
              Add Service
            </Button>
          </Box>
          <List>
            {services.map((service) => (
              <ListItem key={service.id}>
                <ListItemText 
                  primary={service.name}
                  secondary={service.ip && service.port ? `${service.url} (${service.ip}:${service.port})` : service.url}
                />
                <ListItemSecondaryAction>
                  <IconButton onClick={() => handleEdit('services', service)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete('services', service.id)}>
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          <Box sx={{ mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleAdd('widgets')}
            >
              Add Widget
            </Button>
          </Box>
          <List>
            {widgets.map((widget) => {
              const page = pages.find(p => p.id === widget.page_id);
              return (
                <ListItem key={widget.id}>
                  <ListItemText 
                    primary={widget.title || widget.type}
                    secondary={`Type: ${widget.type}${page ? `, Page: ${page.title}` : ''}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton onClick={() => handleEdit('widgets', widget)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete('widgets', widget.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              );
            })}
          </List>
        </TabPanel>

        <TabPanel value={tabValue} index={5}>
          <Box sx={{ mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleAdd('icons')}
            >
              Add Icon
            </Button>
          </Box>
          <List>
            {icons.map((icon) => (
              <ListItem key={icon.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                  <img 
                    src={icon.iconUrl} 
                    alt={icon.alt} 
                    style={{ 
                      width: '32px', 
                      height: '32px', 
                      objectFit: 'contain' 
                    }} 
                  />
                  <ListItemText 
                    primary={icon.alt}
                    secondary={`Link: ${icon.link}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton onClick={() => handleEdit('icons', icon)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete('icons', icon.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </Box>
              </ListItem>
            ))}
          </List>
        </TabPanel>

        <TabPanel value={tabValue} index={6}>
          <Typography variant="h6" gutterBottom>
            Alert Settings
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Note: Alerts only work when Service Mode theme is enabled.
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 4 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={alertSettings.enabled}
                  onChange={(e) => handleAlertSettingsChange('enabled', e.target.checked)}
                />
              }
              label="Enable Alerts"
            />
            
            <TextField
              label="Down Threshold (minutes)"
              type="number"
              value={alertSettings.down_threshold_minutes || 5}
              onChange={(e) => handleAlertSettingsChange('down_threshold_minutes', parseInt(e.target.value) || 5)}
              helperText="How long a service must be down before sending an alert"
              inputProps={{ min: 1, max: 1440 }}
            />
            
            <Divider />
            
            <Typography variant="h6">Webhook Notifications</Typography>
            
            <FormControlLabel
              control={
                <Switch
                  checked={alertSettings.webhook_enabled}
                  onChange={(e) => handleAlertSettingsChange('webhook_enabled', e.target.checked)}
                />
              }
              label="Enable Webhook Notifications"
            />
            
            <TextField
              label="Discord Webhook URL"
              fullWidth
              value={alertSettings.webhook_url || ''}
              onChange={(e) => handleAlertSettingsChange('webhook_url', e.target.value)}
              placeholder="https://discord.com/api/webhooks/..."
              helperText="Discord webhook URL for sending notifications"
              disabled={!alertSettings.webhook_enabled}
            />
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                onClick={handleAlertSettingsSave}
              >
                Save Alert Settings
              </Button>
              <Button
                variant="outlined"
                onClick={handleTestWebhook}
                disabled={!alertSettings.webhook_enabled || !alertSettings.webhook_url}
              >
                Test Webhook
              </Button>
            </Box>
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Typography variant="h6">
              Alert Control
            </Typography>
            {isAlertsPaused() && (
              <Typography variant="body2" color="warning.main">
                Alerts paused until {formatAlertTime(alertSettings.paused_until)}
              </Typography>
            )}
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 4 }}>
            {!isAlertsPaused() ? (
              <>
                <Button
                  variant="outlined"
                  onClick={() => handlePauseAlerts(1)}
                  disabled={!alertSettings.enabled}
                >
                  Pause 1 Hour
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => handlePauseAlerts(4)}
                  disabled={!alertSettings.enabled}
                >
                  Pause 4 Hours
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => handlePauseAlerts(24)}
                  disabled={!alertSettings.enabled}
                >
                  Pause 24 Hours
                </Button>
              </>
            ) : (
              <Button
                variant="contained"
                color="success"
                onClick={handleResumeAlerts}
              >
                Resume Alerts
              </Button>
            )}
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Alert History ({alertHistory.length} alerts)
            </Typography>
            <Button
              variant="outlined"
              color="error"
              onClick={handleClearAlertHistory}
              disabled={alertHistory.length === 0}
            >
              Clear History
            </Button>
          </Box>
          
          <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
            {alertHistory.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No alerts recorded yet
              </Typography>
            ) : (
              <List>
                {alertHistory.map((alert) => (
                  <ListItem key={alert.id} divider>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              bgcolor: alert.alert_type === 'service_down' ? 'error.main' : 'success.main'
                            }}
                          />
                          <Typography variant="body1">
                            {alert.service_name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            ({alert.service_ip}:{alert.service_port})
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2">
                            {alert.message}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatAlertTime(alert.created_at)} • 
                            Webhook: {alert.webhook_sent ? '✅ Sent' : '❌ Failed'}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </TabPanel>
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>
          {editingItem ? `Edit ${dialogType.slice(0, -1)}` : `Add ${dialogType.slice(0, -1)}`}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {dialogType === 'pages' && (
              <>
                <TextField
                  autoFocus
                  label="Page Title"
                  fullWidth
                  value={editingItem?.title || ''}
                  onChange={(e) => setEditingItem(prev => ({ ...prev, title: e.target.value }))}
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="Display Order"
                  type="number"
                  fullWidth
                  value={editingItem?.display_order || 0}
                  onChange={(e) => setEditingItem(prev => ({ ...prev, display_order: parseInt(e.target.value, 10) }))}
                />
              </>
            )}
            {dialogType === 'groups' && (
              <>
                <TextField
                  autoFocus
                  label="Group Name"
                  fullWidth
                  value={editingItem?.title || ''}
                  onChange={(e) => setEditingItem(prev => ({ ...prev, title: e.target.value }))}
                  sx={{ mb: 2 }}
                />
                <TextField
                  select
                  label="Page"
                  fullWidth
                  value={editingItem?.page_id || ''}
                  onChange={(e) => setEditingItem(prev => ({ ...prev, page_id: parseInt(e.target.value, 10) }))}
                  sx={{ mb: 2 }}
                >
                  {pages.map((page) => (
                    <MenuItem key={page.id} value={page.id}>
                      {page.title}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Display Order"
                  type="number"
                  fullWidth
                  value={editingItem?.display_order || 0}
                  onChange={(e) => setEditingItem(prev => ({ ...prev, display_order: parseInt(e.target.value, 10) }))}
                />
              </>
            )}
            {dialogType === 'services' && (
              <>
                <TextField
                  autoFocus
                  label="Service Name"
                  fullWidth
                  value={editingItem?.name || ''}
                  onChange={(e) => setEditingItem(prev => ({ ...prev, name: e.target.value }))}
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="Service URL"
                  fullWidth
                  value={editingItem?.url || ''}
                  onChange={(e) => setEditingItem(prev => ({ ...prev, url: e.target.value }))}
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="Icon URL"
                  fullWidth
                  value={editingItem?.icon_url || ''}
                  onChange={(e) => setEditingItem(prev => ({ ...prev, icon_url: e.target.value }))}
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="IP Address (optional)"
                  fullWidth
                  value={editingItem?.ip ?? ''}
                  onChange={(e) => setEditingItem(prev => ({ ...prev, ip: e.target.value || null }))}
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="Port (optional)"
                  type="number"
                  fullWidth
                  value={editingItem?.port ?? ''}
                  onChange={(e) => setEditingItem(prev => ({ ...prev, port: e.target.value ? parseInt(e.target.value, 10) : null }))}
                  sx={{ mb: 2 }}
                />
                <TextField
                  select
                  label="Group"
                  fullWidth
                  value={editingItem?.group_id || ''}
                  onChange={(e) => setEditingItem(prev => ({ ...prev, group_id: parseInt(e.target.value, 10) }))}
                  sx={{ mb: 2 }}
                >
                  {groups.map((group) => (
                    <MenuItem key={group.id} value={group.id}>
                      {group.title}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Display Order"
                  type="number"
                  fullWidth
                  value={editingItem?.display_order || 0}
                  onChange={(e) => setEditingItem(prev => ({ ...prev, display_order: parseInt(e.target.value, 10) }))}
                  sx={{ mb: 2 }}
                />
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Alert Settings</Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={editingItem?.alert_enabled !== false}
                      onChange={(e) => setEditingItem(prev => ({ ...prev, alert_enabled: e.target.checked }))}
                    />
                  }
                  label="Enable alerts for this service"
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="Down Threshold (minutes) - Leave empty to use global default"
                  type="number"
                  fullWidth
                  value={editingItem?.down_threshold_minutes || ''}
                  onChange={(e) => setEditingItem(prev => ({ ...prev, down_threshold_minutes: e.target.value ? parseInt(e.target.value, 10) : null }))}
                  helperText="Override global down threshold for this service"
                  inputProps={{ min: 1, max: 1440 }}
                />
              </>
            )}
            {dialogType === 'widgets' && (
              <>
                <TextField
                  select
                  label="Widget Type"
                  fullWidth
                  value={editingItem?.type || ''}
                  onChange={(e) => setEditingItem(prev => ({ ...prev, type: e.target.value }))}
                  sx={{ mb: 2 }}
                >
                  <MenuItem value="datetime">Date/Time</MenuItem>
                  <MenuItem value="weather">Weather</MenuItem>
                  <MenuItem value="sun_position">Sun Position</MenuItem>
                </TextField>
                <TextField
                  label="Widget Title (optional)"
                  fullWidth
                  value={editingItem?.title || ''}
                  onChange={(e) => setEditingItem(prev => ({ ...prev, title: e.target.value }))}
                  sx={{ mb: 2 }}
                />
                <TextField
                  select
                  label="Page"
                  fullWidth
                  value={editingItem?.page_id || ''}
                  onChange={(e) => setEditingItem(prev => ({ ...prev, page_id: parseInt(e.target.value, 10) }))}
                  sx={{ mb: 2 }}
                >
                  {pages.map((page) => (
                    <MenuItem key={page.id} value={page.id}>
                      {page.title}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Display Order"
                  type="number"
                  fullWidth
                  value={editingItem?.display_order || 0}
                  onChange={(e) => setEditingItem(prev => ({ ...prev, display_order: parseInt(e.target.value, 10) }))}
                  sx={{ mb: 2 }}
                />
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Widget Configuration (JSON)</Typography>
                  <TextField
                    multiline
                    rows={4}
                    fullWidth
                    value={editingItem?.configString !== undefined ? editingItem.configString : (editingItem?.config ? JSON.stringify(editingItem.config, null, 2) : '{}')}
                    onChange={(e) => {
                      const value = e.target.value;
                      try {
                        const config = JSON.parse(value);
                        setEditingItem(prev => ({ ...prev, config, configString: undefined }));
                      } catch (err) {
                        // Invalid JSON, keep the string for user to fix
                        setEditingItem(prev => ({ ...prev, configString: value }));
                      }
                    }}
                    placeholder='{"apiKey": "your-api-key", "location": "City, Country"}'
                    helperText="Enter widget configuration as JSON. See documentation for widget-specific options."
                    error={editingItem?.configString !== undefined}
                  />
                </Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={editingItem?.enabled !== false}
                      onChange={(e) => setEditingItem(prev => ({ ...prev, enabled: e.target.checked }))}
                    />
                  }
                  label="Enabled"
                />
              </>
            )}
            {dialogType === 'icons' && (
              <>
                <TextField
                  autoFocus
                  label="Icon Name"
                  fullWidth
                  value={editingItem?.alt || ''}
                  onChange={(e) => setEditingItem(prev => ({ ...prev, alt: e.target.value }))}
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="Icon URL"
                  fullWidth
                  value={editingItem?.iconUrl || ''}
                  onChange={(e) => setEditingItem(prev => ({ ...prev, iconUrl: e.target.value }))}
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="Link URL"
                  fullWidth
                  value={editingItem?.link || ''}
                  onChange={(e) => setEditingItem(prev => ({ ...prev, link: e.target.value }))}
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="Display Order"
                  type="number"
                  fullWidth
                  value={editingItem?.display_order || 0}
                  onChange={(e) => setEditingItem(prev => ({ ...prev, display_order: parseInt(e.target.value, 10) }))}
                />
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDialogSave} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

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