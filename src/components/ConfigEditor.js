import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Switch,
  FormControlLabel,
  Button,
  Box,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  Divider
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon, DragHandle as DragHandleIcon } from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const API_BASE_URL = '/api';

const ConfigEditor = () => {
  const [settings, setSettings] = useState({});
  const [groups, setGroups] = useState([]);
  const [services, setServices] = useState([]);
  const [icons, setIcons] = useState([]);
  const [openDialog, setOpenDialog] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [settingsRes, groupsRes, servicesRes, iconsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/settings`),
        fetch(`${API_BASE_URL}/groups`),
        fetch(`${API_BASE_URL}/services`),
        fetch(`${API_BASE_URL}/icons`)
      ]);

      const [settingsData, groupsData, servicesData, iconsData] = await Promise.all([
        settingsRes.json(),
        groupsRes.json(),
        servicesRes.json(),
        iconsRes.json()
      ]);

      setSettings(settingsData);
      setGroups(groupsData);
      setServices(servicesData);
      setIcons(iconsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSettingsChange = async (field, value) => {
    const newSettings = { ...settings, [field]: value };
    setSettings(newSettings);
    try {
      await fetch(`${API_BASE_URL}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  const handleGroupSubmit = async (groupData) => {
    try {
      const method = groupData.id ? 'PUT' : 'POST';
      const url = groupData.id ? `${API_BASE_URL}/groups/${groupData.id}` : `${API_BASE_URL}/groups`;
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(groupData)
      });
      fetchAllData();
      setOpenDialog(null);
    } catch (error) {
      console.error('Error saving group:', error);
    }
  };

  const handleServiceSubmit = async (serviceData) => {
    try {
      const method = serviceData.id ? 'PUT' : 'POST';
      const url = serviceData.id ? `${API_BASE_URL}/services/${serviceData.id}` : `${API_BASE_URL}/services`;
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serviceData)
      });
      fetchAllData();
      setOpenDialog(null);
    } catch (error) {
      console.error('Error saving service:', error);
    }
  };

  const handleIconSubmit = async (iconData) => {
    try {
      const method = iconData.id ? 'PUT' : 'POST';
      const url = iconData.id ? `${API_BASE_URL}/icons/${iconData.id}` : `${API_BASE_URL}/icons`;
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(iconData)
      });
      fetchAllData();
      setOpenDialog(null);
    } catch (error) {
      console.error('Error saving icon:', error);
    }
  };

  const handleDelete = async (type, id) => {
    try {
      await fetch(`${API_BASE_URL}/${type}/${id}`, { method: 'DELETE' });
      fetchAllData();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const items = Array.from(result.type === 'group' ? groups : result.type === 'service' ? services : icons);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update display_order for all items
    const updatedItems = items.map((item, index) => ({ ...item, display_order: index }));

    if (result.type === 'group') {
      setGroups(updatedItems);
    } else if (result.type === 'service') {
      setServices(updatedItems);
    } else {
      setIcons(updatedItems);
    }

    // Update the database
    try {
      await Promise.all(updatedItems.map(item =>
        fetch(`${API_BASE_URL}/${result.type}s/${item.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item)
        })
      ));
    } catch (error) {
      console.error('Error updating order:', error);
      fetchAllData(); // Reload the original order if there's an error
    }
  };

  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Typography variant="h4" gutterBottom>
          Dashboard Configuration
        </Typography>

        {/* Global Settings */}
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Global Settings
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Dashboard Title"
                value={settings.title || ''}
                onChange={(e) => handleSettingsChange('title', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Browser Tab Title"
                value={settings.tab_title || ''}
                onChange={(e) => handleSettingsChange('tab_title', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Favicon URL"
                value={settings.favicon_url || ''}
                onChange={(e) => handleSettingsChange('favicon_url', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Background URL"
                value={settings.background_url || ''}
                onChange={(e) => handleSettingsChange('background_url', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Mode</InputLabel>
                <Select
                  value={settings.mode || 'dark_mode'}
                  onChange={(e) => handleSettingsChange('mode', e.target.value)}
                  label="Mode"
                >
                  <MenuItem value="dark_mode">Dark Mode</MenuItem>
                  <MenuItem value="light_mode">Light Mode</MenuItem>
                  <MenuItem value="trans_light">Transparent Light</MenuItem>
                  <MenuItem value="trans_dark">Transparent Dark</MenuItem>
                  <MenuItem value="service_mode">Service Mode</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Font Family"
                value={settings.font_family || ''}
                onChange={(e) => handleSettingsChange('font_family', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Font Size"
                value={settings.font_size || ''}
                onChange={(e) => handleSettingsChange('font_size', e.target.value)}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Groups */}
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Groups</Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => {
                setEditingItem(null);
                setOpenDialog('group');
              }}
            >
              Add Group
            </Button>
          </Box>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="groups" type="group">
              {(provided) => (
                <List {...provided.droppableProps} ref={provided.innerRef}>
                  {groups.map((group, index) => (
                    <Draggable key={group.id} draggableId={`group-${group.id}`} index={index}>
                      {(provided) => (
                        <ListItem
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <DragHandleIcon sx={{ mr: 2 }} />
                          <ListItemText primary={group.title} />
                          <ListItemSecondaryAction>
                            <IconButton
                              edge="end"
                              onClick={() => {
                                setEditingItem(group);
                                setOpenDialog('group');
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              edge="end"
                              onClick={() => handleDelete('groups', group.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </List>
              )}
            </Droppable>
          </DragDropContext>
        </Paper>

        {/* Services */}
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Services</Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => {
                setEditingItem(null);
                setOpenDialog('service');
              }}
            >
              Add Service
            </Button>
          </Box>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="services" type="service">
              {(provided) => (
                <List {...provided.droppableProps} ref={provided.innerRef}>
                  {services.map((service, index) => (
                    <Draggable key={service.id} draggableId={`service-${service.id}`} index={index}>
                      {(provided) => (
                        <ListItem
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <DragHandleIcon sx={{ mr: 2 }} />
                          <ListItemText
                            primary={service.name}
                            secondary={`Group: ${groups.find(g => g.id === service.group_id)?.title || 'None'}`}
                          />
                          <ListItemSecondaryAction>
                            <IconButton
                              edge="end"
                              onClick={() => {
                                setEditingItem(service);
                                setOpenDialog('service');
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              edge="end"
                              onClick={() => handleDelete('services', service.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </List>
              )}
            </Droppable>
          </DragDropContext>
        </Paper>

        {/* Icons */}
        <Paper elevation={3} sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Icons</Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => {
                setEditingItem(null);
                setOpenDialog('icon');
              }}
            >
              Add Icon
            </Button>
          </Box>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="icons" type="icon">
              {(provided) => (
                <List {...provided.droppableProps} ref={provided.innerRef}>
                  {icons.map((icon, index) => (
                    <Draggable key={icon.id} draggableId={`icon-${icon.id}`} index={index}>
                      {(provided) => (
                        <ListItem
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <DragHandleIcon sx={{ mr: 2 }} />
                          <ListItemText primary={icon.alt} secondary={icon.link} />
                          <ListItemSecondaryAction>
                            <IconButton
                              edge="end"
                              onClick={() => {
                                setEditingItem(icon);
                                setOpenDialog('icon');
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              edge="end"
                              onClick={() => handleDelete('icons', icon.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </List>
              )}
            </Droppable>
          </DragDropContext>
        </Paper>

        {/* Dialogs */}
        <Dialog open={openDialog === 'group'} onClose={() => setOpenDialog(null)}>
          <DialogTitle>{editingItem ? 'Edit Group' : 'Add Group'}</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Group Title"
              fullWidth
              defaultValue={editingItem?.title || ''}
              onBlur={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(null)}>Cancel</Button>
            <Button onClick={() => handleGroupSubmit(editingItem || { title: '' })}>Save</Button>
          </DialogActions>
        </Dialog>

        <Dialog open={openDialog === 'service'} onClose={() => setOpenDialog(null)}>
          <DialogTitle>{editingItem ? 'Edit Service' : 'Add Service'}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Group</InputLabel>
                  <Select
                    value={editingItem?.group_id || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, group_id: e.target.value })}
                    label="Group"
                  >
                    {groups.map((group) => (
                      <MenuItem key={group.id} value={group.id}>
                        {group.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Service Name"
                  defaultValue={editingItem?.name || ''}
                  onBlur={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Icon URL"
                  defaultValue={editingItem?.icon_url || ''}
                  onBlur={(e) => setEditingItem({ ...editingItem, icon_url: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="IP Address"
                  defaultValue={editingItem?.ip || ''}
                  onBlur={(e) => setEditingItem({ ...editingItem, ip: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Port"
                  type="number"
                  defaultValue={editingItem?.port || ''}
                  onBlur={(e) => setEditingItem({ ...editingItem, port: parseInt(e.target.value) })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="URL"
                  defaultValue={editingItem?.url || ''}
                  onBlur={(e) => setEditingItem({ ...editingItem, url: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(null)}>Cancel</Button>
            <Button onClick={() => handleServiceSubmit(editingItem || {})}>Save</Button>
          </DialogActions>
        </Dialog>

        <Dialog open={openDialog === 'icon'} onClose={() => setOpenDialog(null)}>
          <DialogTitle>{editingItem ? 'Edit Icon' : 'Add Icon'}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Icon URL"
                  defaultValue={editingItem?.icon_url || ''}
                  onBlur={(e) => setEditingItem({ ...editingItem, icon_url: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Link"
                  defaultValue={editingItem?.link || ''}
                  onBlur={(e) => setEditingItem({ ...editingItem, link: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Alt Text"
                  defaultValue={editingItem?.alt || ''}
                  onBlur={(e) => setEditingItem({ ...editingItem, alt: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(null)}>Cancel</Button>
            <Button onClick={() => handleIconSubmit(editingItem || {})}>Save</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default ConfigEditor;