const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3001;

// Database connection
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: 5432,
});

app.use(cors());
app.use(express.json());

// Connect to the database and log success
pool.connect()
  .then(() => {
    console.log('Connected to PostgreSQL database');
  })
  .catch(err => {
    console.error('Error connecting to the database:', err);
  });

// API Routes

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Settings routes
app.get('/api/settings', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM dashboard_config');
    res.json(result.rows[0] || {});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/settings', async (req, res) => {
  try {
    const settings = req.body;
    await pool.query(
      'UPDATE dashboard_config SET title = $1, tab_title = $2, favicon_url = $3, background_url = $4, mode = $5, show_details = $6, font_family = $7, font_size = $8, icon_size = $9, alerts_enabled = $10, alert_webhook_url = $11, alert_threshold_minutes = $12',
      [settings.title, settings.tab_title, settings.favicon_url, settings.background_url, settings.mode, settings.show_details, settings.font_family, settings.font_size, settings.icon_size, settings.alerts_enabled, settings.alert_webhook_url, settings.alert_threshold_minutes]
    );
    res.json({ message: 'Settings updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Groups routes
app.get('/api/groups', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM groups ORDER BY display_order');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/groups', async (req, res) => {
  try {
    console.log('Received group creation request:', req.body);
    const { title, display_order, page_id } = req.body;
    
    // Validate required fields
    if (!title || !page_id) {
      console.log('Validation failed:', { title, page_id });
      return res.status(400).json({ error: 'Title and Page are required' });
    }

    const orderValue = display_order || 0;

    const result = await pool.query(
      'INSERT INTO groups (title, display_order, page_id) VALUES ($1, $2, $3) RETURNING *',
      [title, orderValue, page_id]
    );
    console.log('Group created successfully:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error creating group:', err);
    if (err.code === '23503') {
      res.status(400).json({ error: 'Invalid page ID' });
    } else {
      res.status(500).json({ error: `Database error: ${err.message}` });
    }
  }
});

app.put('/api/groups/:id', async (req, res) => {
  try {
    console.log('Received group update request:', { id: req.params.id, body: req.body });
    const { id } = req.params;
    const { title, display_order, page_id } = req.body;
    
    // Validate required fields
    if (!title || !page_id) {
      console.log('Validation failed:', { title, page_id });
      return res.status(400).json({ error: 'Title and Page are required' });
    }

    const orderValue = display_order || 0;

    const result = await pool.query(
      'UPDATE groups SET title = $1, display_order = $2, page_id = $3 WHERE id = $4 RETURNING *',
      [title, orderValue, page_id, id]
    );

    if (result.rows.length === 0) {
      console.log('Group not found:', id);
      return res.status(404).json({ error: 'Group not found' });
    }

    console.log('Group updated successfully:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating group:', err);
    if (err.code === '23503') {
      res.status(400).json({ error: 'Invalid page ID' });
    } else {
      res.status(500).json({ error: `Database error: ${err.message}` });
    }
  }
});

app.delete('/api/groups/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM groups WHERE id = $1', [id]);
    res.json({ message: 'Group deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Services routes
app.get('/api/services', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM services ORDER BY display_order');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/services', async (req, res) => {
  try {
    console.log('Received service creation request:', req.body);
    const { name, url, icon_url, group_id, display_order, ip, port } = req.body;
    
    // Validate required fields
    if (!name || !url || !group_id) {
      console.log('Validation failed:', { name, url, group_id });
      return res.status(400).json({ error: 'Name, URL, and Group are required' });
    }

    // Ensure display_order is a number
    const orderValue = display_order || 0;

    const result = await pool.query(
      'INSERT INTO services (name, url, icon_url, group_id, display_order, ip, port) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [name, url, icon_url || null, group_id, orderValue, ip || null, port ? Number(port) : null]
    );
    console.log('Service created successfully:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error creating service:', err);
    if (err.code === '23503') {
      res.status(400).json({ error: 'Invalid group ID' });
    } else {
      res.status(500).json({ error: `Database error: ${err.message}` });
    }
  }
});

app.put('/api/services/:id', async (req, res) => {
  try {
    console.log('Received service update request:', { id: req.params.id, body: req.body });
    const { id } = req.params;
    const { name, url, icon_url, group_id, display_order, ip, port } = req.body;
    
    // Validate required fields
    if (!name || !url || !group_id) {
      console.log('Validation failed:', { name, url, group_id });
      return res.status(400).json({ error: 'Name, URL, and Group are required' });
    }

    // Ensure display_order is a number
    const orderValue = display_order || 0;

    const result = await pool.query(
      'UPDATE services SET name = $1, url = $2, icon_url = $3, group_id = $4, display_order = $5, ip = $6, port = $7 WHERE id = $8 RETURNING *',
      [name, url, icon_url || null, group_id, orderValue, ip || null, port ? Number(port) : null, id]
    );

    if (result.rows.length === 0) {
      console.log('Service not found:', id);
      return res.status(404).json({ error: 'Service not found' });
    }

    console.log('Service updated successfully:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating service:', err);
    if (err.code === '23503') {
      res.status(400).json({ error: 'Invalid group ID' });
    } else {
      res.status(500).json({ error: `Database error: ${err.message}` });
    }
  }
});

app.delete('/api/services/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM services WHERE id = $1', [id]);
    res.json({ message: 'Service deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Icons routes
app.get('/api/icons', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM bar_icons ORDER BY display_order');
    // Transform the response to match frontend field names
    const transformedRows = result.rows.map(row => ({
      id: row.id,
      iconUrl: row.icon_url,
      link: row.link,
      alt: row.alt,
      display_order: row.display_order
    }));
    res.json(transformedRows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/icons', async (req, res) => {
  try {
    const { alt, link, iconUrl, display_order } = req.body;
    const result = await pool.query(
      'INSERT INTO bar_icons (alt, link, icon_url, display_order) VALUES ($1, $2, $3, $4) RETURNING *',
      [alt, link, iconUrl, display_order]
    );
    // Transform the response to match frontend field names
    const transformedRow = {
      id: result.rows[0].id,
      iconUrl: result.rows[0].icon_url,
      link: result.rows[0].link,
      alt: result.rows[0].alt,
      display_order: result.rows[0].display_order
    };
    res.json(transformedRow);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/icons/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { alt, link, iconUrl, display_order } = req.body;
    const result = await pool.query(
      'UPDATE bar_icons SET alt = $1, link = $2, icon_url = $3, display_order = $4 WHERE id = $5 RETURNING *',
      [alt, link, iconUrl, display_order, id]
    );
    // Transform the response to match frontend field names
    const transformedRow = {
      id: result.rows[0].id,
      iconUrl: result.rows[0].icon_url,
      link: result.rows[0].link,
      alt: result.rows[0].alt,
      display_order: result.rows[0].display_order
    };
    res.json(transformedRow);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/icons/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM bar_icons WHERE id = $1', [id]);
    res.json({ message: 'Icon deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Pages routes
app.get('/api/pages', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM pages ORDER BY display_order');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching pages:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/pages', async (req, res) => {
  try {
    console.log('Received page creation request:', req.body);
    const { title, display_order } = req.body;
    
    if (!title) {
      console.log('Validation failed: title is required');
      return res.status(400).json({ error: 'Title is required' });
    }

    const orderValue = display_order || 0;

    const result = await pool.query(
      'INSERT INTO pages (title, display_order) VALUES ($1, $2) RETURNING *',
      [title, orderValue]
    );
    console.log('Page created successfully:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error creating page:', err);
    res.status(500).json({ error: `Database error: ${err.message}` });
  }
});

app.put('/api/pages/:id', async (req, res) => {
  try {
    console.log('Received page update request:', { id: req.params.id, body: req.body });
    const { id } = req.params;
    const { title, display_order } = req.body;
    
    if (!title) {
      console.log('Validation failed: title is required');
      return res.status(400).json({ error: 'Title is required' });
    }

    const orderValue = display_order || 0;

    const result = await pool.query(
      'UPDATE pages SET title = $1, display_order = $2 WHERE id = $3 RETURNING *',
      [title, orderValue, id]
    );

    if (result.rows.length === 0) {
      console.log('Page not found:', id);
      return res.status(404).json({ error: 'Page not found' });
    }

    console.log('Page updated successfully:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating page:', err);
    res.status(500).json({ error: `Database error: ${err.message}` });
  }
});

app.delete('/api/pages/:id', async (req, res) => {
  try {
    console.log('Received page deletion request:', req.params.id);
    const { id } = req.params;
    
    // Check if there are groups associated with this page
    const groupCheck = await pool.query('SELECT COUNT(*) FROM groups WHERE page_id = $1', [id]);
    if (parseInt(groupCheck.rows[0].count) > 0) {
      return res.status(400).json({ error: 'Cannot delete page with associated groups' });
    }
    
    const result = await pool.query('DELETE FROM pages WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      console.log('Page not found:', id);
      return res.status(404).json({ error: 'Page not found' });
    }

    console.log('Page deleted successfully:', result.rows[0]);
    res.json({ message: 'Page deleted successfully' });
  } catch (err) {
    console.error('Error deleting page:', err);
    res.status(500).json({ error: `Database error: ${err.message}` });
  }
});

// Service status check endpoint
// Helper function to send webhook alert
async function sendWebhookAlert(webhookUrl, service, downMinutes) {
  const fetch = require('node-fetch');
  const payload = {
    service: {
      id: service.id,
      name: service.name,
      url: service.url,
      ip: service.ip,
      port: service.port
    },
    status: 'down',
    downtime_minutes: downMinutes,
    timestamp: new Date().toISOString(),
    message: `Service "${service.name}" has been down for ${downMinutes} minutes`
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      timeout: 5000
    });

    // Log alert to history
    await pool.query(
      'INSERT INTO alert_history (service_id, alert_type, message, webhook_url, status, response_status) VALUES ($1, $2, $3, $4, $5, $6)',
      [service.id, 'service_down', payload.message, webhookUrl, 'sent', response.status]
    );

    console.log(`Alert sent for service ${service.name}: ${response.status}`);
    return { success: true, status: response.status };
  } catch (error) {
    console.error(`Error sending alert for service ${service.name}:`, error);
    
    // Log failed alert to history
    await pool.query(
      'INSERT INTO alert_history (service_id, alert_type, message, webhook_url, status) VALUES ($1, $2, $3, $4, $5)',
      [service.id, 'service_down', payload.message, webhookUrl, 'failed']
    );
    
    return { success: false, error: error.message };
  }
}

app.post('/api/ping', async (req, res) => {
  try {
    const { services } = req.body;
    const results = {};
    
    // Get global settings for alert checking
    const settingsResult = await pool.query('SELECT mode, alerts_enabled FROM dashboard_config LIMIT 1');
    const settings = settingsResult.rows[0] || {};
    const isServiceMode = settings.mode === 'service_mode';
    const alertsEnabled = settings.alerts_enabled === true;
    
    // Use Promise.allSettled to ping all services concurrently
    const pingPromises = services.map(async (service) => {
      if (!service.ip || !service.port) {
        return { key: `${service.id}`, status: null, serviceId: service.id }; // No IP/port to ping
      }
      
      const key = `${service.ip}:${service.port}`;
      const net = require('net');
      
      return new Promise((resolve) => {
        const socket = new net.Socket();
        const timeout = 3000;
        
        socket.setTimeout(timeout);
        socket.on('connect', () => {
          socket.destroy();
          resolve({ key, status: true, serviceId: service.id, service });
        });
        
        socket.on('timeout', () => {
          socket.destroy();
          resolve({ key, status: false, serviceId: service.id, service });
        });
        
        socket.on('error', () => {
          socket.destroy();
          resolve({ key, status: false, serviceId: service.id, service });
        });
        
        socket.connect(service.port, service.ip);
      });
    });
    
    const pingResults = await Promise.allSettled(pingPromises);
    
    // Process results and update service status
    for (const result of pingResults) {
      if (result.status === 'fulfilled' && result.value.key) {
        const { key, status, serviceId, service } = result.value;
        results[key] = status;
        
        // Update service_status table and check for alerts
        if (serviceId && isServiceMode && alertsEnabled) {
          // Get current status from database
          const statusResult = await pool.query(
            'SELECT * FROM service_status WHERE service_id = $1',
            [serviceId]
          );
          
          const now = new Date();
          
          if (status === false) {
            // Service is down
            if (statusResult.rows.length === 0) {
              // First time seeing this service down
              await pool.query(
                'INSERT INTO service_status (service_id, is_up, downtime_started_at, last_checked_at) VALUES ($1, $2, $3, $4)',
                [serviceId, false, now, now]
              );
            } else {
              const currentStatus = statusResult.rows[0];
              if (currentStatus.is_up) {
                // Service just went down
                await pool.query(
                  'UPDATE service_status SET is_up = $1, downtime_started_at = $2, last_checked_at = $3 WHERE service_id = $4',
                  [false, now, now, serviceId]
                );
              } else {
                // Service still down, check if we need to send alert
                const downtimeMinutes = (now - new Date(currentStatus.downtime_started_at)) / (1000 * 60);
                
                // Get alert config for this service
                const alertConfigResult = await pool.query(
                  'SELECT * FROM alert_config WHERE service_id = $1 AND enabled = true AND paused = false',
                  [serviceId]
                );
                
                if (alertConfigResult.rows.length > 0) {
                  const alertConfig = alertConfigResult.rows[0];
                  const thresholdMinutes = alertConfig.threshold_minutes || 5;
                  const webhookUrl = alertConfig.webhook_url;
                  
                  // Check if downtime exceeds threshold and we haven't sent an alert recently
                  if (downtimeMinutes >= thresholdMinutes && webhookUrl) {
                    // Check if we've already sent an alert for this downtime period
                    const recentAlertResult = await pool.query(
                      'SELECT * FROM alert_history WHERE service_id = $1 AND created_at > $2 ORDER BY created_at DESC LIMIT 1',
                      [serviceId, currentStatus.downtime_started_at]
                    );
                    
                    if (recentAlertResult.rows.length === 0) {
                      // Send alert - this is the first alert for this downtime period
                      await sendWebhookAlert(webhookUrl, service, Math.floor(downtimeMinutes));
                    }
                  }
                }
                
                // Update last checked time
                await pool.query(
                  'UPDATE service_status SET last_checked_at = $1 WHERE service_id = $2',
                  [now, serviceId]
                );
              }
            }
          } else {
            // Service is up
            if (statusResult.rows.length === 0) {
              await pool.query(
                'INSERT INTO service_status (service_id, is_up, downtime_started_at, last_checked_at) VALUES ($1, $2, $3, $4)',
                [serviceId, true, null, now]
              );
            } else {
              await pool.query(
                'UPDATE service_status SET is_up = $1, downtime_started_at = $2, last_checked_at = $3 WHERE service_id = $4',
                [true, null, now, serviceId]
              );
            }
          }
        }
      }
    }
    
    res.json(results);
  } catch (err) {
    console.error('Error in ping endpoint:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Widgets routes
app.get('/api/widgets', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM widgets ORDER BY display_order');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching widgets:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/widgets', async (req, res) => {
  try {
    console.log('Received widget creation request:', req.body);
    const { type, title, config, page_id, display_order, enabled } = req.body;
    
    if (!type) {
      console.log('Validation failed: type is required');
      return res.status(400).json({ error: 'Widget type is required' });
    }

    const orderValue = display_order || 0;
    const enabledValue = enabled !== undefined ? enabled : true;
    const configValue = config || {};

    const result = await pool.query(
      'INSERT INTO widgets (type, title, config, page_id, display_order, enabled) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [type, title, JSON.stringify(configValue), page_id, orderValue, enabledValue]
    );
    console.log('Widget created successfully:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error creating widget:', err);
    res.status(500).json({ error: `Database error: ${err.message}` });
  }
});

app.put('/api/widgets/:id', async (req, res) => {
  try {
    console.log('Received widget update request:', { id: req.params.id, body: req.body });
    const { id } = req.params;
    const { type, title, config, page_id, display_order, enabled } = req.body;
    
    if (!type) {
      console.log('Validation failed: type is required');
      return res.status(400).json({ error: 'Widget type is required' });
    }

    const orderValue = display_order || 0;
    const enabledValue = enabled !== undefined ? enabled : true;
    const configValue = config || {};

    const result = await pool.query(
      'UPDATE widgets SET type = $1, title = $2, config = $3, page_id = $4, display_order = $5, enabled = $6 WHERE id = $7 RETURNING *',
      [type, title, JSON.stringify(configValue), page_id, orderValue, enabledValue, id]
    );

    if (result.rows.length === 0) {
      console.log('Widget not found:', id);
      return res.status(404).json({ error: 'Widget not found' });
    }

    console.log('Widget updated successfully:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating widget:', err);
    res.status(500).json({ error: `Database error: ${err.message}` });
  }
});

app.delete('/api/widgets/:id', async (req, res) => {
  try {
    console.log('Received widget deletion request:', req.params.id);
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM widgets WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      console.log('Widget not found:', id);
      return res.status(404).json({ error: 'Widget not found' });
    }

    console.log('Widget deleted successfully:', result.rows[0]);
    res.json({ message: 'Widget deleted successfully' });
  } catch (err) {
    console.error('Error deleting widget:', err);
    res.status(500).json({ error: `Database error: ${err.message}` });
  }
});

// Alert configuration routes
app.get('/api/alert-config', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM alert_config ORDER BY service_id');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching alert configs:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/alert-config/:serviceId', async (req, res) => {
  try {
    const { serviceId } = req.params;
    const result = await pool.query('SELECT * FROM alert_config WHERE service_id = $1', [serviceId]);
    if (result.rows.length === 0) {
      return res.json(null);
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching alert config:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/alert-config', async (req, res) => {
  try {
    const { service_id, enabled, threshold_minutes, webhook_url } = req.body;
    
    if (!service_id) {
      return res.status(400).json({ error: 'service_id is required' });
    }

    const result = await pool.query(
      `INSERT INTO alert_config (service_id, enabled, threshold_minutes, webhook_url)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (service_id) 
       DO UPDATE SET enabled = $2, threshold_minutes = $3, webhook_url = $4
       RETURNING *`,
      [service_id, enabled !== false, threshold_minutes || 5, webhook_url]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error creating/updating alert config:', err);
    res.status(500).json({ error: `Database error: ${err.message}` });
  }
});

app.put('/api/alert-config/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { enabled, paused, threshold_minutes, webhook_url } = req.body;
    
    const result = await pool.query(
      'UPDATE alert_config SET enabled = $1, paused = $2, threshold_minutes = $3, webhook_url = $4 WHERE id = $5 RETURNING *',
      [enabled, paused, threshold_minutes, webhook_url, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Alert config not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating alert config:', err);
    res.status(500).json({ error: `Database error: ${err.message}` });
  }
});

app.patch('/api/alert-config/:serviceId/pause', async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { paused } = req.body;
    
    const result = await pool.query(
      'UPDATE alert_config SET paused = $1 WHERE service_id = $2 RETURNING *',
      [paused, serviceId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Alert config not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error pausing/unpausing alert:', err);
    res.status(500).json({ error: `Database error: ${err.message}` });
  }
});

app.delete('/api/alert-config/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM alert_config WHERE id = $1', [id]);
    res.json({ message: 'Alert config deleted successfully' });
  } catch (err) {
    console.error('Error deleting alert config:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Alert history routes
app.get('/api/alert-history', async (req, res) => {
  try {
    const { serviceId, limit } = req.query;
    let query = 'SELECT * FROM alert_history';
    let params = [];
    
    if (serviceId) {
      query += ' WHERE service_id = $1';
      params.push(serviceId);
    }
    
    query += ' ORDER BY created_at DESC';
    
    if (limit) {
      query += ` LIMIT $${params.length + 1}`;
      params.push(parseInt(limit));
    }
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching alert history:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Service status routes
app.get('/api/service-status', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM service_status');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching service status:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/service-status/:serviceId', async (req, res) => {
  try {
    const { serviceId } = req.params;
    const result = await pool.query('SELECT * FROM service_status WHERE service_id = $1', [serviceId]);
    if (result.rows.length === 0) {
      return res.json(null);
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching service status:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
