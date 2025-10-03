import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  IconButton,
  Typography,
  Divider,
  Box
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';

const NavigationMenu = ({ open, onClose, pages, themeStyles }) => {
  const location = useLocation();

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 250,
          backgroundColor: themeStyles.backgroundColor,
          color: themeStyles.color,
        }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Navigation
        </Typography>
        <IconButton 
          onClick={onClose}
          sx={{ color: themeStyles.color }}
        >
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider />
      <List>
        {pages.map((page) => (
          <ListItem key={page.id} disablePadding>
            <ListItemButton
              component={Link}
              to={`/page/${page.id}`}
              selected={location.pathname === `/page/${page.id}`}
              onClick={onClose}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: themeStyles.color === '#fff' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                },
                '&:hover': {
                  backgroundColor: themeStyles.color === '#fff' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                }
              }}
            >
              <ListItemText 
                primary={page.title}
                sx={{ color: themeStyles.color }}
              />
            </ListItemButton>
          </ListItem>
        ))}
        {pages.length === 0 && (
          <ListItem>
            <ListItemText 
              primary="No pages configured"
              sx={{ color: themeStyles.color, opacity: 0.7 }}
            />
          </ListItem>
        )}
      </List>
    </Drawer>
  );
};

export default NavigationMenu;