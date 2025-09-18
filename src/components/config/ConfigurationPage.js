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
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';

const API_URL = '/api'; // Using relative URL

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
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
  const [groups, setGroups] = useState([]);
  const [services, setServices] = useState([]);
  const [icons, setIcons] = useState([]);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [settingsRes, groupsRes, servicesRes, iconsRes] = await Promise.all([
        axios.get(`${API_URL}/settings`),
        axios.get(`${API_URL}/groups`),
        axios.get(`${API_URL}/services`),
        axios.get(`${API_URL}/icons`)
      ]);

      setSettings(settingsRes.data || {});
      setGroups(groupsRes.data || []);
      setServices(servicesRes.data || []);
      setIcons(iconsRes.data || []);
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
    setEditingItem({});
    setDialogOpen(true);
  };

  const handleEdit = (type, item) => {
    setDialogType(type);
    setEditingItem(item);
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
      const endpoint = `${API_URL}/${dialogType}`;
      const method = editingItem ? 'put' : 'post';
      const url = editingItem ? `${endpoint}/${editingItem.id}` : endpoint;

      await axios[method](url, editingItem);
      setDialogOpen(false);
      fetchData();
      setAlert({
        open: true,
        message: 'Item saved successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error saving item:', error);
      setAlert({
        open: true,
        message: 'Error saving item',
        severity: 'error'
      });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Dashboard Configuration
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="General Settings" />
            <Tab label="Groups" />
            <Tab label="Services" />
            <Tab label="Icons" />
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
                <MenuItem value="light_mode">Light Mode</MenuItem>
                <MenuItem value="dark_mode">Dark Mode</MenuItem>
                <MenuItem value="trans_light">Transparent Light</MenuItem>
                <MenuItem value="trans_dark">Transparent Dark</MenuItem>
                <MenuItem value="service_mode">Service Mode</MenuItem>
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
              onClick={() => handleAdd('groups')}
            >
              Add Group
            </Button>
          </Box>
          <List>
            {groups.map((group) => (
              <ListItem key={group.id}>
                <ListItemText 
                  primary={group.name}
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
            ))}
          </List>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
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
                  secondary={service.url}
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

        <TabPanel value={tabValue} index={3}>
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
                <ListItemText 
                  primary={icon.name}
                  secondary={icon.url}
                />
                <ListItemSecondaryAction>
                  <IconButton onClick={() => handleEdit('icons', icon)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete('icons', icon.id)}>
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </TabPanel>
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>
          {editingItem ? `Edit ${dialogType.slice(0, -1)}` : `Add ${dialogType.slice(0, -1)}`}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {dialogType === 'groups' && (
              <TextField
                autoFocus
                label="Group Name"
                fullWidth
                value={editingItem?.name || ''}
                onChange={(e) => setEditingItem(prev => ({ ...prev, name: e.target.value }))}
              />
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
                  select
                  label="Group"
                  fullWidth
                  value={editingItem?.group_id || ''}
                  onChange={(e) => setEditingItem(prev => ({ ...prev, group_id: e.target.value }))}
                >
                  {groups.map((group) => (
                    <MenuItem key={group.id} value={group.id}>
                      {group.name}
                    </MenuItem>
                  ))}
                </TextField>
              </>
            )}
            {dialogType === 'icons' && (
              <>
                <TextField
                  autoFocus
                  label="Icon Name"
                  fullWidth
                  value={editingItem?.name || ''}
                  onChange={(e) => setEditingItem(prev => ({ ...prev, name: e.target.value }))}
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="Icon URL"
                  fullWidth
                  value={editingItem?.url || ''}
                  onChange={(e) => setEditingItem(prev => ({ ...prev, url: e.target.value }))}
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