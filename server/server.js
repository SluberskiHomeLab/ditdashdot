const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');

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

// Function to read and parse YAML files for initial migration
const readYamlFile = (filePath) => {
  try {
    const fileContents = fs.readFileSync(filePath, 'utf8');
    return yaml.load(fileContents);
  } catch (e) {
    console.error(`Error reading ${filePath}:`, e);
    return null;
  }
};

// Migrate data from YAML files to database
const migrateYamlToDb = async () => {
  try {
    // Check if migration has already been done
    const settingsCheck = await pool.query('SELECT COUNT(*) FROM settings');
    if (settingsCheck.rows[0].count > 0) {
      console.log('Data already migrated, skipping...');
      return;
    }

    const configYml = readYamlFile(path.join(__dirname, '../config.yml'));
    const barConfigYml = readYamlFile(path.join(__dirname, '../barconfig.yml'));

    if (configYml) {
      // Insert global settings
      await pool.query(
        `INSERT INTO settings (
          title, tab_title, favicon_url, mode, show_details, background_url,
          font_family, font_size, icon_size
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          configYml.title,
          configYml.tab_title,
          configYml.favicon_url,
          configYml.mode,
          configYml.show_details,
          configYml.background_url,
          configYml.font_family,
          configYml.font_size,
          configYml.icon_size
        ]
      );

      // Insert groups and services
      for (const group of configYml.groups) {
        const groupResult = await pool.query(
          'INSERT INTO groups (title) VALUES ($1) RETURNING id',
          [group.title]
        );
        const groupId = groupResult.rows[0].id;

        // Insert services for this group
        for (const service of group.services) {
          await pool.query(
            'INSERT INTO services (group_id, name, icon_url, ip, port, url) VALUES ($1, $2, $3, $4, $5, $6)',
            [groupId, service.name, service.iconUrl, service.ip, service.port, service.url]
          );
        }
      }
    }

    if (barConfigYml) {
      // Insert icons from barconfig.yml
      for (const icon of barConfigYml.icons) {
        await pool.query(
          'INSERT INTO icons (icon_url, link, alt) VALUES ($1, $2, $3)',
          [icon.iconUrl, icon.link, icon.alt]
        );
      }
    }

    console.log('Data migration completed successfully');
  } catch (err) {
    console.error('Migration error:', err);
  }
};

// API Endpoints

// Global settings endpoints
app.get('/api/settings', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM settings ORDER BY id LIMIT 1');
    res.json(result.rows[0] || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/settings', async (req, res) => {
  try {
    const {
      title,
      tab_title,
      favicon_url,
      mode,
      show_details,
      background_url,
      font_family,
      font_size,
      icon_size
    } = req.body;

    const result = await pool.query(
      `INSERT INTO settings 
       (title, tab_title, favicon_url, mode, show_details, background_url, font_family, font_size, icon_size)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT ((SELECT MIN(id) FROM settings)) DO UPDATE SET
       title = $1, tab_title = $2, favicon_url = $3, mode = $4, show_details = $5,
       background_url = $6, font_family = $7, font_size = $8, icon_size = $9
       RETURNING *`,
      [title, tab_title, favicon_url, mode, show_details, background_url, font_family, font_size, icon_size]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Groups endpoints
app.get('/api/groups', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM groups ORDER BY display_order');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/groups', async (req, res) => {
  try {
    const { title, display_order } = req.body;
    const result = await pool.query(
      'INSERT INTO groups (title, display_order) VALUES ($1, $2) RETURNING *',
      [title, display_order]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
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
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/groups/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM groups WHERE id = $1', [id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Services endpoints
app.get('/api/services', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM services ORDER BY group_id, display_order');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/services', async (req, res) => {
  try {
    const { group_id, name, icon_url, ip, port, url, display_order } = req.body;
    const result = await pool.query(
      'INSERT INTO services (group_id, name, icon_url, ip, port, url, display_order) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [group_id, name, icon_url, ip, port, url, display_order]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/services/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { group_id, name, icon_url, ip, port, url, display_order } = req.body;
    const result = await pool.query(
      'UPDATE services SET group_id = $1, name = $2, icon_url = $3, ip = $4, port = $5, url = $6, display_order = $7 WHERE id = $8 RETURNING *',
      [group_id, name, icon_url, ip, port, url, display_order, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/services/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM services WHERE id = $1', [id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Icons endpoints
app.get('/api/icons', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM icons ORDER BY display_order');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/icons', async (req, res) => {
  try {
    const { icon_url, link, alt, display_order } = req.body;
    const result = await pool.query(
      'INSERT INTO icons (icon_url, link, alt, display_order) VALUES ($1, $2, $3, $4) RETURNING *',
      [icon_url, link, alt, display_order]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/icons/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { icon_url, link, alt, display_order } = req.body;
    const result = await pool.query(
      'UPDATE icons SET icon_url = $1, link = $2, alt = $3, display_order = $4 WHERE id = $5 RETURNING *',
      [icon_url, link, alt, display_order, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/icons/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM icons WHERE id = $1', [id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
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

// Initialize database and start server
const initializeApp = async () => {
  try {
    await pool.connect();
    console.log('Connected to PostgreSQL database');

    // Run migrations
    const migrationSQL = fs.readFileSync(path.join(__dirname, './migrations/001_initial_schema.sql'), 'utf8');
    await pool.query(migrationSQL);
    console.log('Database schema created');

    // Migrate data from YAML files
    await migrateYamlToDb();

    // Start the server
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (err) {
    console.error('Error initializing app:', err);
    process.exit(1);
  }
};

initializeApp();