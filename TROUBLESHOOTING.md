# Alert System Troubleshooting Guide

This guide helps diagnose and fix common issues with the DitDashDot alert system.

## Error: "Error saving alert settings"

This error typically occurs when there are database connectivity issues or table schema problems.

### Troubleshooting Steps

1. **Check if containers are running:**
   ```bash
   docker compose ps
   ```
   All services (dashboard, api, db) should be "Up"

2. **Check API server logs:**
   ```bash
   docker compose logs api
   ```
   Look for database connection errors or SQL errors

3. **Check database logs:**
   ```bash
   docker compose logs db
   ```
   Look for PostgreSQL startup issues

4. **Restart the containers:**
   ```bash
   docker compose down
   docker compose up -d
   ```

5. **Check database connection:**
   ```bash
   docker compose exec db psql -U ditdashdot -d ditdashdot -c "SELECT version();"
   ```

### Manual Database Setup

If automatic table creation fails, you can manually create the tables:

1. **Connect to database:**
   ```bash
   docker compose exec db psql -U ditdashdot -d ditdashdot
   ```

2. **Create alert_settings table:**
   ```sql
   CREATE TABLE IF NOT EXISTS alert_settings (
       id SERIAL PRIMARY KEY,
       enabled BOOLEAN DEFAULT true,
       webhook_url TEXT,
       webhook_enabled BOOLEAN DEFAULT false,
       down_threshold_minutes INTEGER DEFAULT 5,
       paused_until TIMESTAMP NULL,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

3. **Create alert_history table:**
   ```sql
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
   );
   ```

4. **Add alert columns to services table:**
   ```sql
   ALTER TABLE services ADD COLUMN IF NOT EXISTS alert_enabled BOOLEAN DEFAULT true;
   ALTER TABLE services ADD COLUMN IF NOT EXISTS down_threshold_minutes INTEGER NULL;
   ```

5. **Exit database:**
   ```sql
   \q
   ```

### Test API Endpoints

Use the included test script to verify API functionality:

```bash
# Make sure containers are running first
docker compose up -d

# Wait for services to start
sleep 10

# Run the test script
node test-alerts.js
```

### Common Error Messages

**"Database error: relation 'alert_settings' does not exist"**
- The alert_settings table hasn't been created
- Follow manual database setup steps above
- Check if migrations ran properly: `docker compose logs db | grep alert`

**"Error connecting to the database"**
- Database container might not be running
- Check container status: `docker compose ps`
- Restart containers: `docker compose restart`

**"Internal server error"**
- Check API server logs: `docker compose logs api`
- Verify all environment variables are set correctly
- Ensure database is accessible from API container

**"Network error" or "ERR_NETWORK"**
- API server might not be running on port 3001
- Check if port is bound: `docker compose ps`
- Verify nginx configuration is routing /api requests correctly

### Browser Developer Tools

1. Open browser developer tools (F12)
2. Go to Network tab
3. Try saving alert settings
4. Check the API request:
   - URL should be `/api/alert-settings`
   - Method should be `PUT`
   - Status should be `200` for success
   - Response should contain the saved settings

### Reset Alert System

If all else fails, you can reset the alert system:

1. **Stop containers:**
   ```bash
   docker compose down
   ```

2. **Remove database volume (WARNING: This deletes all data!):**
   ```bash
   docker volume rm ditdashdot_postgres_data
   ```

3. **Start fresh:**
   ```bash
   docker compose up -d
   ```

4. **Wait for initialization:**
   ```bash
   docker compose logs -f db
   ```
   Wait for "database system is ready to accept connections"

5. **Reconfigure dashboard:**
   - Go to http://localhost/config
   - Set up your services again
   - Configure alerts in the Alerts tab

### Getting Help

If problems persist:

1. Collect the following information:
   - Output of `docker compose ps`
   - Output of `docker compose logs api`
   - Output of `docker compose logs db`
   - Browser console errors (F12 → Console)
   - Network errors (F12 → Network)

2. Check the GitHub issues page for similar problems

3. Create a new issue with all the collected information