-- Add alert settings to dashboard_config table
ALTER TABLE dashboard_config 
ADD COLUMN IF NOT EXISTS alerts_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS alerts_paused BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS webhook_url TEXT,
ADD COLUMN IF NOT EXISTS alert_threshold_seconds INTEGER DEFAULT 300;

-- Create alert_history table to track service status changes
CREATE TABLE IF NOT EXISTS alert_history (
    id SERIAL PRIMARY KEY,
    service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
    service_name TEXT NOT NULL,
    service_ip TEXT,
    service_port INTEGER,
    status TEXT NOT NULL,
    down_since TIMESTAMP,
    up_since TIMESTAMP,
    notification_sent BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_alert_history_service_id ON alert_history(service_id);
CREATE INDEX IF NOT EXISTS idx_alert_history_status ON alert_history(status);
CREATE INDEX IF NOT EXISTS idx_alert_history_created_at ON alert_history(created_at);

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_alert_history_updated_at
    BEFORE UPDATE ON alert_history
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
