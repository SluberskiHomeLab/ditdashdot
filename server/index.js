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
    const { title, display_order } = req.body;
    const result = await pool.query(
      'INSERT INTO groups (title, display_order) VALUES ($1, $2) RETURNING *',
      [title, display_order]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/groups/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, display_order } = req.body;
    const result = await pool.query(
      'UPDATE groups SET title = $1, display_order = $2 WHERE id = $3 RETURNING *',
      [title, display_order, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
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
    const { name, url, icon_url, group_id, display_order, ip, port } = req.body;
    const result = await pool.query(
      'INSERT INTO services (name, url, icon_url, group_id, display_order, ip, port) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [name, url, icon_url, group_id, display_order, ip, port]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/services/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, url, icon_url, group_id, display_order, ip, port } = req.body;
    const result = await pool.query(
      'UPDATE services SET name = $1, url = $2, icon_url = $3, group_id = $4, display_order = $5, ip = $6, port = $7 WHERE id = $8 RETURNING *',
      [name, url, icon_url, group_id, display_order, ip, port, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
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
    res.json(result.rows);
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
    res.json(result.rows[0]);
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
    res.json(result.rows[0]);
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

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
