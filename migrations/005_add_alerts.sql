-- Create alert_config table to store alert configurations per service
CREATE TABLE IF NOT EXISTS alert_config (
    id SERIAL PRIMARY KEY,
    service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
    enabled BOOLEAN DEFAULT true,
    paused BOOLEAN DEFAULT false,
    threshold_minutes INTEGER DEFAULT 5,
    webhook_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(service_id)
);

-- Create alert_history table to track when alerts were sent
CREATE TABLE IF NOT EXISTS alert_history (
    id SERIAL PRIMARY KEY,
    service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    webhook_url TEXT,
    status VARCHAR(20) DEFAULT 'sent',
    response_status INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create service_status table to track service uptime/downtime
CREATE TABLE IF NOT EXISTS service_status (
    id SERIAL PRIMARY KEY,
    service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
    is_up BOOLEAN NOT NULL,
    downtime_started_at TIMESTAMP WITH TIME ZONE,
    last_checked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(service_id)
);

-- Add global alert settings to dashboard_config
ALTER TABLE dashboard_config ADD COLUMN IF NOT EXISTS alert_webhook_url TEXT;
ALTER TABLE dashboard_config ADD COLUMN IF NOT EXISTS alert_threshold_minutes INTEGER DEFAULT 5;
ALTER TABLE dashboard_config ADD COLUMN IF NOT EXISTS alerts_enabled BOOLEAN DEFAULT false;

-- Add triggers for updated_at timestamps
CREATE TRIGGER update_alert_config_updated_at
    BEFORE UPDATE ON alert_config
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_status_updated_at
    BEFORE UPDATE ON service_status
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
