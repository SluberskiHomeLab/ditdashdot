require('dotenv').config();
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

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'DitDashDot API Server' });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Get dashboard configuration
app.get('/api/config', async (req, res) => {
  try {
    const dashboardConfig = await pool.query('SELECT * FROM dashboard_config ORDER BY id LIMIT 1');
    const groups = await pool.query('SELECT * FROM groups ORDER BY display_order');
    const services = await pool.query('SELECT * FROM services ORDER BY group_id, display_order');
    const barIcons = await pool.query('SELECT * FROM bar_icons ORDER BY display_order');

    // Structure the response
    const config = {
      ...dashboardConfig.rows[0],
      groups: groups.rows.map(group => ({
        ...group,
        services: services.rows.filter(service => service.group_id === group.id)
      }))
    };

    res.json({
      config,
      barIcons: barIcons.rows
    });
  } catch (error) {
    console.error('Error fetching configuration:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update dashboard configuration
app.put('/api/config/dashboard', async (req, res) => {
  const { title, tab_title, favicon_url, mode, show_details, background_url, font_family, font_size, icon_size } = req.body;
  
  try {
    const result = await pool.query(
      `UPDATE dashboard_config 
       SET title = $1, tab_title = $2, favicon_url = $3, mode = $4, 
           show_details = $5, background_url = $6, font_family = $7,
           font_size = $8, icon_size = $9
       WHERE id = (SELECT id FROM dashboard_config LIMIT 1)
       RETURNING *`,
      [title, tab_title, favicon_url, mode, show_details, background_url, font_family, font_size, icon_size]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating dashboard config:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add more endpoints for managing groups, services, and bar icons
// ... (Groups CRUD endpoints)
app.post('/api/config/groups', async (req, res) => {
  const { title } = req.body;
  try {
    const maxOrder = await pool.query('SELECT MAX(display_order) FROM groups');
    const newOrder = (maxOrder.rows[0].max || 0) + 1;
    
    const result = await pool.query(
      'INSERT INTO groups (title, display_order) VALUES ($1, $2) RETURNING *',
      [title, newOrder]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ... (Services CRUD endpoints)
app.post('/api/config/services', async (req, res) => {
  const { group_id, name, icon_url, ip, port, url } = req.body;
  try {
    const maxOrder = await pool.query(
      'SELECT MAX(display_order) FROM services WHERE group_id = $1',
      [group_id]
    );
    const newOrder = (maxOrder.rows[0].max || 0) + 1;
    
    const result = await pool.query(
      `INSERT INTO services 
       (group_id, name, icon_url, ip, port, url, display_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [group_id, name, icon_url, ip, port, url, newOrder]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ... (Bar Icons CRUD endpoints)
app.post('/api/config/bar-icons', async (req, res) => {
  const { icon_url, link, alt } = req.body;
  try {
    const maxOrder = await pool.query('SELECT MAX(display_order) FROM bar_icons');
    const newOrder = (maxOrder.rows[0].max || 0) + 1;
    
    const result = await pool.query(
      'INSERT INTO bar_icons (icon_url, link, alt, display_order) VALUES ($1, $2, $3, $4) RETURNING *',
      [icon_url, link, alt, newOrder]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating bar icon:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Handle 404s
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`
  });
});

// Connect to database and start server
pool.connect()
  .then(() => {
    console.log('Connected to PostgreSQL database');
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch(err => {
    console.error('Database connection error:', err);
    process.exit(1);
  });