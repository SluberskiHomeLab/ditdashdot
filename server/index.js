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
      'UPDATE dashboard_config SET title = $1, tab_title = $2, favicon_url = $3, background_url = $4, mode = $5, show_details = $6, font_family = $7, font_size = $8, icon_size = $9, alerts_enabled = $10, alerts_paused = $11, webhook_url = $12, alert_threshold_seconds = $13',
      [settings.title, settings.tab_title, settings.favicon_url, settings.background_url, settings.mode, settings.show_details, settings.font_family, settings.font_size, settings.icon_size, settings.alerts_enabled || false, settings.alerts_paused || false, settings.webhook_url || null, settings.alert_threshold_seconds || 300]
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
app.post('/api/ping', async (req, res) => {
  try {
    const { services } = req.body;
    const results = {};
    
    // Get alert settings
    const settingsResult = await pool.query('SELECT alerts_enabled, alerts_paused, webhook_url, alert_threshold_seconds FROM dashboard_config LIMIT 1');
    const alertSettings = settingsResult.rows[0] || {};
    
    // Use Promise.allSettled to ping all services concurrently
    const pingPromises = services.map(async (service) => {
      if (!service.ip || !service.port) {
        return { key: `${service.id}`, status: null, service }; // No IP/port to ping
      }
      
      const key = `${service.ip}:${service.port}`;
      const net = require('net');
      
      return new Promise((resolve) => {
        const socket = new net.Socket();
        const timeout = 3000;
        
        socket.setTimeout(timeout);
        socket.on('connect', () => {
          socket.destroy();
          resolve({ key, status: true, service });
        });
        
        socket.on('timeout', () => {
          socket.destroy();
          resolve({ key, status: false, service });
        });
        
        socket.on('error', () => {
          socket.destroy();
          resolve({ key, status: false, service });
        });
        
        socket.connect(service.port, service.ip);
      });
    });
    
    const pingResults = await Promise.allSettled(pingPromises);
    
    // Process results and handle alerts
    for (const result of pingResults) {
      if (result.status === 'fulfilled' && result.value.key) {
        const { key, status, service } = result.value;
        results[key] = status;
        
        // Handle alert tracking if alerts are enabled
        if (alertSettings.alerts_enabled && service.id) {
          await handleServiceStatusChange(service, status, alertSettings);
        }
      }
    }
    
    res.json(results);
  } catch (err) {
    console.error('Error in ping endpoint:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to handle service status changes and send alerts
async function handleServiceStatusChange(service, currentStatus, alertSettings) {
  try {
    // Check the last known status from alert_history
    const lastStatusQuery = await pool.query(
      'SELECT * FROM alert_history WHERE service_id = $1 ORDER BY created_at DESC LIMIT 1',
      [service.id]
    );
    
    const lastStatus = lastStatusQuery.rows[0];
    const now = new Date();
    
    if (currentStatus === false) {
      // Service is down
      if (!lastStatus || lastStatus.status !== 'down') {
        // Service just went down, create new record
        await pool.query(
          'INSERT INTO alert_history (service_id, service_name, service_ip, service_port, status, down_since) VALUES ($1, $2, $3, $4, $5, $6)',
          [service.id, service.name, service.ip, service.port, 'down', now]
        );
      } else {
        // Service is still down, check if we need to send alert
        const downSince = new Date(lastStatus.down_since);
        const downDuration = (now - downSince) / 1000; // seconds
        
        if (!lastStatus.notification_sent && 
            downDuration >= (alertSettings.alert_threshold_seconds || 300) &&
            !alertSettings.alerts_paused &&
            alertSettings.webhook_url) {
          // Send webhook notification
          await sendWebhookNotification(service, downDuration, alertSettings.webhook_url);
          
          // Mark notification as sent
          await pool.query(
            'UPDATE alert_history SET notification_sent = true WHERE id = $1',
            [lastStatus.id]
          );
        }
      }
    } else if (currentStatus === true) {
      // Service is up
      if (lastStatus && lastStatus.status === 'down') {
        // Service just came back up
        await pool.query(
          'UPDATE alert_history SET status = $1, up_since = $2 WHERE id = $3',
          ['recovered', now, lastStatus.id]
        );
        
        // Create new "up" record
        await pool.query(
          'INSERT INTO alert_history (service_id, service_name, service_ip, service_port, status) VALUES ($1, $2, $3, $4, $5)',
          [service.id, service.name, service.ip, service.port, 'up']
        );
        
        // Send recovery notification if previous notification was sent
        if (lastStatus.notification_sent && !alertSettings.alerts_paused && alertSettings.webhook_url) {
          await sendRecoveryNotification(service, alertSettings.webhook_url);
        }
      }
    }
  } catch (err) {
    console.error('Error handling service status change:', err);
  }
}

// Helper function to send webhook notification
async function sendWebhookNotification(service, downDuration, webhookUrl) {
  try {
    const https = require('https');
    const http = require('http');
    const url = require('url');
    
    const parsedUrl = url.parse(webhookUrl);
    const protocol = parsedUrl.protocol === 'https:' ? https : http;
    
    const payload = JSON.stringify({
      type: 'service_down',
      service_name: service.name,
      service_ip: service.ip,
      service_port: service.port,
      service_url: service.url,
      down_duration_seconds: Math.floor(downDuration),
      timestamp: new Date().toISOString(),
      message: `Service "${service.name}" (${service.ip}:${service.port}) has been down for ${Math.floor(downDuration)} seconds`
    });
    
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };
    
    return new Promise((resolve, reject) => {
      const req = protocol.request(options, (res) => {
        console.log(`Webhook notification sent for ${service.name}, status code: ${res.statusCode}`);
        resolve();
      });
      
      req.on('error', (err) => {
        console.error('Error sending webhook notification:', err);
        reject(err);
      });
      
      req.write(payload);
      req.end();
    });
  } catch (err) {
    console.error('Error in sendWebhookNotification:', err);
  }
}

// Helper function to send recovery notification
async function sendRecoveryNotification(service, webhookUrl) {
  try {
    const https = require('https');
    const http = require('http');
    const url = require('url');
    
    const parsedUrl = url.parse(webhookUrl);
    const protocol = parsedUrl.protocol === 'https:' ? https : http;
    
    const payload = JSON.stringify({
      type: 'service_recovered',
      service_name: service.name,
      service_ip: service.ip,
      service_port: service.port,
      service_url: service.url,
      timestamp: new Date().toISOString(),
      message: `Service "${service.name}" (${service.ip}:${service.port}) has recovered and is now up`
    });
    
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };
    
    return new Promise((resolve, reject) => {
      const req = protocol.request(options, (res) => {
        console.log(`Recovery notification sent for ${service.name}, status code: ${res.statusCode}`);
        resolve();
      });
      
      req.on('error', (err) => {
        console.error('Error sending recovery notification:', err);
        reject(err);
      });
      
      req.write(payload);
      req.end();
    });
  } catch (err) {
    console.error('Error in sendRecoveryNotification:', err);
  }
}

// Alert history routes
app.get('/api/alerts/history', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const result = await pool.query(
      'SELECT * FROM alert_history ORDER BY created_at DESC LIMIT $1',
      [limit]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching alert history:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/alerts/history', async (req, res) => {
  try {
    await pool.query('DELETE FROM alert_history');
    res.json({ message: 'Alert history cleared successfully' });
  } catch (err) {
    console.error('Error clearing alert history:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/alerts/test', async (req, res) => {
  try {
    const { webhook_url } = req.body;
    
    if (!webhook_url) {
      return res.status(400).json({ error: 'Webhook URL is required' });
    }
    
    // Send test notification
    const testService = {
      name: 'Test Service',
      ip: '192.168.1.1',
      port: 80,
      url: 'http://test.example.com'
    };
    
    await sendWebhookNotification(testService, 300, webhook_url);
    res.json({ message: 'Test notification sent successfully' });
  } catch (err) {
    console.error('Error sending test notification:', err);
    res.status(500).json({ error: 'Failed to send test notification' });
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

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
