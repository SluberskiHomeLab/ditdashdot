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
      'UPDATE dashboard_config SET title = $1, tab_title = $2, favicon_url = $3, background_url = $4, mode = $5, show_details = $6, font_family = $7, font_size = $8, icon_size = $9',
      [settings.title, settings.tab_title, settings.favicon_url, settings.background_url, settings.mode, settings.show_details, settings.font_family, settings.font_size, settings.icon_size]
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

// Enhanced service status check endpoint with alert handling
app.post('/api/ping', async (req, res) => {
  try {
    const { services } = req.body;
    const results = {};
    
    // Get alert settings - handle case where table doesn't exist
    let alertSettings = {};
    try {
      const alertSettingsResult = await pool.query('SELECT * FROM alert_settings ORDER BY id LIMIT 1');
      alertSettings = alertSettingsResult.rows[0] || { enabled: false, down_threshold_minutes: 5 };
    } catch (error) {
      // Table doesn't exist yet, use defaults
      alertSettings = { enabled: false, down_threshold_minutes: 5 };
    }
    
    // Check if alerts are paused
    const alertsPaused = alertSettings.paused_until && new Date(alertSettings.paused_until) > new Date();
    
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
        
        // Handle alert logic if alerts are enabled and not paused
        if (alertSettings.enabled && !alertsPaused && service.alert_enabled !== false) {
          const serviceKey = `service_${service.id}`;
          const previousStatus = serviceStatusHistory.get(serviceKey);
          const now = new Date();
          
          // Initialize or update service status history
          if (!previousStatus) {
            serviceStatusHistory.set(serviceKey, {
              status: status,
              lastCheck: now,
              downSince: status === false ? now : null
            });
          } else {
            const wasDown = previousStatus.status === false;
            const isNowDown = status === false;
            const isNowUp = status === true;
            
            // Service went down
            if (!wasDown && isNowDown) {
              serviceStatusHistory.set(serviceKey, {
                status: false,
                lastCheck: now,
                downSince: now
              });
            }
            // Service came back up
            else if (wasDown && isNowUp) {
              serviceStatusHistory.set(serviceKey, {
                status: true,
                lastCheck: now,
                downSince: null
              });
              
              // Send recovery alert immediately
              if (alertSettings.webhook_enabled && alertSettings.webhook_url) {
                const alertData = {
                  service_id: service.id,
                  service_name: service.name,
                  service_ip: service.ip,
                  service_port: service.port,
                  alert_type: 'service_up',
                  message: `🟢 Service "${service.name}" is back online!`
                };
                
                const webhookResult = await sendWebhook(alertSettings.webhook_url, alertData);
                await logAlert(alertData, webhookResult);
              }
            }
            // Service still down - check if threshold reached
            else if (wasDown && isNowDown && previousStatus.downSince) {
              const downDuration = (now - previousStatus.downSince) / (1000 * 60); // minutes
              const threshold = service.down_threshold_minutes || alertSettings.down_threshold_minutes || 5;
              const cooldownKey = `alert_${service.id}`;
              
              // Check if we haven't sent an alert recently (cooldown)
              const lastAlert = alertCooldowns.get(cooldownKey);
              const cooldownMinutes = 30; // Don't spam alerts more than every 30 minutes
              
              if (downDuration >= threshold && 
                  (!lastAlert || (now - lastAlert) / (1000 * 60) >= cooldownMinutes)) {
                
                if (alertSettings.webhook_enabled && alertSettings.webhook_url) {
                  const alertData = {
                    service_id: service.id,
                    service_name: service.name,
                    service_ip: service.ip,
                    service_port: service.port,
                    alert_type: 'service_down',
                    message: `🔴 Service "${service.name}" has been down for ${Math.round(downDuration)} minutes!`
                  };
                  
                  const webhookResult = await sendWebhook(alertSettings.webhook_url, alertData);
                  await logAlert(alertData, webhookResult);
                  alertCooldowns.set(cooldownKey, now);
                }
              }
              
              // Update last check time
              serviceStatusHistory.set(serviceKey, {
                ...previousStatus,
                lastCheck: now
              });
            }
            else {
              // Update last check time for stable services
              serviceStatusHistory.set(serviceKey, {
                ...previousStatus,
                lastCheck: now
              });
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

// Test webhook endpoint
app.post('/api/test-webhook', async (req, res) => {
  try {
    const { webhook_url } = req.body;
    
    if (!webhook_url) {
      return res.status(400).json({ error: 'Webhook URL is required' });
    }
    
    const testAlert = {
      service_name: 'Test Service',
      service_ip: '192.168.1.100',
      service_port: 80,
      alert_type: 'service_down',
      message: '🔴 This is a test alert from DitDashDot!'
    };
    
    const result = await sendWebhook(webhook_url, testAlert);
    
    if (result.success) {
      res.json({ success: true, message: 'Test webhook sent successfully!' });
    } else {
      res.status(400).json({ success: false, error: result.response });
    }
  } catch (err) {
    console.error('Error testing webhook:', err);
    res.status(500).json({ error: `Error testing webhook: ${err.message}` });
  }
});

// Alert Settings routes
app.get('/api/alert-settings', async (req, res) => {
  try {
    // Ensure table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS alert_settings (
        id SERIAL PRIMARY KEY,
        enabled BOOLEAN DEFAULT true,
        webhook_url TEXT,
        webhook_enabled BOOLEAN DEFAULT false,
        down_threshold_minutes INTEGER DEFAULT 5,
        paused_until TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    const result = await pool.query('SELECT * FROM alert_settings ORDER BY id LIMIT 1');
    
    // Return default values if no settings exist
    if (result.rows.length === 0) {
      res.json({
        enabled: true,
        webhook_url: '',
        webhook_enabled: false,
        down_threshold_minutes: 5,
        paused_until: null
      });
    } else {
      res.json(result.rows[0]);
    }
  } catch (err) {
    console.error('Error fetching alert settings:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/alert-settings', async (req, res) => {
  try {
    console.log('Received alert settings update request:', req.body);
    const { enabled, webhook_url, webhook_enabled, down_threshold_minutes, paused_until } = req.body;
    
    // Ensure table exists and create default record if needed
    await pool.query(`
      CREATE TABLE IF NOT EXISTS alert_settings (
        id SERIAL PRIMARY KEY,
        enabled BOOLEAN DEFAULT true,
        webhook_url TEXT,
        webhook_enabled BOOLEAN DEFAULT false,
        down_threshold_minutes INTEGER DEFAULT 5,
        paused_until TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Check if any settings exist
    const existingResult = await pool.query('SELECT id FROM alert_settings ORDER BY id LIMIT 1');
    
    let result;
    if (existingResult.rows.length > 0) {
      // Update existing record
      result = await pool.query(`
        UPDATE alert_settings SET 
          enabled = $1,
          webhook_url = $2,
          webhook_enabled = $3,
          down_threshold_minutes = $4,
          paused_until = $5,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $6
        RETURNING *`,
        [enabled, webhook_url, webhook_enabled, down_threshold_minutes, paused_until, existingResult.rows[0].id]
      );
    } else {
      // Insert new record
      result = await pool.query(`
        INSERT INTO alert_settings (enabled, webhook_url, webhook_enabled, down_threshold_minutes, paused_until) 
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *`,
        [enabled, webhook_url, webhook_enabled, down_threshold_minutes, paused_until]
      );
    }
    
    console.log('Alert settings updated successfully:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating alert settings:', err);
    res.status(500).json({ error: `Database error: ${err.message}` });
  }
});

// Alert History routes
app.get('/api/alert-history', async (req, res) => {
  try {
    // Ensure alert_history table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS alert_history (
        id SERIAL PRIMARY KEY,
        service_id INTEGER,
        service_name TEXT NOT NULL,
        service_ip TEXT,
        service_port INTEGER,
        alert_type VARCHAR(50) NOT NULL,
        message TEXT,
        webhook_sent BOOLEAN DEFAULT false,
        webhook_response TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    const limit = req.query.limit || 50;
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

app.delete('/api/alert-history', async (req, res) => {
  try {
    // Ensure table exists before trying to clear it
    await pool.query(`
      CREATE TABLE IF NOT EXISTS alert_history (
        id SERIAL PRIMARY KEY,
        service_id INTEGER,
        service_name TEXT NOT NULL,
        service_ip TEXT,
        service_port INTEGER,
        alert_type VARCHAR(50) NOT NULL,
        message TEXT,
        webhook_sent BOOLEAN DEFAULT false,
        webhook_response TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await pool.query('DELETE FROM alert_history');
    console.log('Alert history cleared');
    res.json({ message: 'Alert history cleared successfully' });
  } catch (err) {
    console.error('Error clearing alert history:', err);
    res.status(500).json({ error: `Database error: ${err.message}` });
  }
});

// Enhanced service status check with alert handling
let serviceStatusHistory = new Map(); // Track service status over time
let alertCooldowns = new Map(); // Prevent spam alerts

const sendWebhook = async (webhookUrl, alertData) => {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'DitDashDot',
        content: alertData.message,
        embeds: [{
          title: `Service Alert: ${alertData.service_name}`,
          description: alertData.message,
          color: alertData.alert_type === 'service_down' ? 15158332 : 3066993, // Red for down, green for up
          fields: [
            {
              name: 'Service',
              value: alertData.service_name,
              inline: true
            },
            {
              name: 'Status',
              value: alertData.alert_type === 'service_down' ? '🔴 Down' : '🟢 Up',
              inline: true
            },
            {
              name: 'Location',
              value: alertData.service_ip && alertData.service_port ? 
                     `${alertData.service_ip}:${alertData.service_port}` : 
                     'N/A',
              inline: true
            }
          ],
          timestamp: new Date().toISOString()
        }]
      })
    });

    return {
      success: response.ok,
      status: response.status,
      response: response.ok ? await response.text() : `Error: ${response.statusText}`
    };
  } catch (error) {
    console.error('Webhook send error:', error);
    return {
      success: false,
      response: `Error: ${error.message}`
    };
  }
};

const logAlert = async (alertData, webhookResult = null) => {
  try {
    // Ensure alert_history table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS alert_history (
        id SERIAL PRIMARY KEY,
        service_id INTEGER,
        service_name TEXT NOT NULL,
        service_ip TEXT,
        service_port INTEGER,
        alert_type VARCHAR(50) NOT NULL,
        message TEXT,
        webhook_sent BOOLEAN DEFAULT false,
        webhook_response TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await pool.query(`
      INSERT INTO alert_history 
      (service_id, service_name, service_ip, service_port, alert_type, message, webhook_sent, webhook_response)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      alertData.service_id,
      alertData.service_name,
      alertData.service_ip,
      alertData.service_port,
      alertData.alert_type,
      alertData.message,
      webhookResult?.success || false,
      webhookResult?.response || null
    ]);
  } catch (error) {
    console.error('Error logging alert:', error);
  }
};

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
