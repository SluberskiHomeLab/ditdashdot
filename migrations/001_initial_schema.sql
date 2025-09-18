-- Create dashboard_config table
CREATE TABLE dashboard_config (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL DEFAULT 'Homelab Dashboard',
    tab_title TEXT,
    favicon_url TEXT,
    mode TEXT DEFAULT 'light_mode',
    show_details BOOLEAN DEFAULT true,
    background_url TEXT,
    font_family TEXT DEFAULT 'Arial, sans-serif',
    font_size TEXT DEFAULT '14px',
    icon_size TEXT DEFAULT '32px',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create groups table
CREATE TABLE groups (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    display_order INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create services table
CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    group_id INTEGER REFERENCES groups(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    icon_url TEXT,
    ip TEXT NOT NULL,
    port INTEGER NOT NULL,
    url TEXT NOT NULL,
    display_order INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create bar_icons table
CREATE TABLE bar_icons (
    id SERIAL PRIMARY KEY,
    icon_url TEXT NOT NULL,
    link TEXT NOT NULL,
    alt TEXT,
    display_order INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add triggers to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_dashboard_config_updated_at
    BEFORE UPDATE ON dashboard_config
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_groups_updated_at
    BEFORE UPDATE ON groups
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at
    BEFORE UPDATE ON services
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bar_icons_updated_at
    BEFORE UPDATE ON bar_icons
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default dashboard configuration
INSERT INTO dashboard_config (title, mode, show_details)
VALUES ('Homelab Dashboard', 'light_mode', true);