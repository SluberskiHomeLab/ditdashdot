-- Create alert_settings table for global alert configuration
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

-- Create alert_history table for tracking alert events
CREATE TABLE IF NOT EXISTS alert_history (
    id SERIAL PRIMARY KEY,
    service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
    service_name TEXT NOT NULL,
    service_ip TEXT,
    service_port INTEGER,
    alert_type VARCHAR(50) NOT NULL, -- 'service_down', 'service_up'
    message TEXT,
    webhook_sent BOOLEAN DEFAULT false,
    webhook_response TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add service_alert_settings to services table for per-service overrides
ALTER TABLE services ADD COLUMN IF NOT EXISTS alert_enabled BOOLEAN DEFAULT true;
ALTER TABLE services ADD COLUMN IF NOT EXISTS down_threshold_minutes INTEGER NULL;

-- Create trigger for alert_settings updated_at
CREATE OR REPLACE FUNCTION update_alert_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    return NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_alert_settings_updated_at
    BEFORE UPDATE ON alert_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_alert_settings_updated_at();

-- Insert default alert settings
INSERT INTO alert_settings (enabled, down_threshold_minutes)
SELECT true, 5
WHERE NOT EXISTS (SELECT 1 FROM alert_settings);