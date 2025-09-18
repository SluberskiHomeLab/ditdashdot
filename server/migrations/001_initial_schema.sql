-- Create settings table for global configuration
CREATE TABLE settings (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL DEFAULT 'New Homelab Dashboard',
    tab_title TEXT NOT NULL DEFAULT 'Homelab Dashboard',
    favicon_url TEXT,
    mode TEXT NOT NULL DEFAULT 'dark_mode',
    show_details BOOLEAN NOT NULL DEFAULT true,
    background_url TEXT,
    font_family TEXT NOT NULL DEFAULT 'Arial, sans-serif',
    font_size TEXT NOT NULL DEFAULT '14px',
    icon_size TEXT NOT NULL DEFAULT '32px',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create groups table
CREATE TABLE groups (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create services table
CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    group_id INTEGER REFERENCES groups(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    icon_url TEXT,
    ip TEXT,
    port INTEGER,
    url TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create icons table for the top bar
CREATE TABLE icons (
    id SERIAL PRIMARY KEY,
    icon_url TEXT NOT NULL,
    link TEXT NOT NULL,
    alt TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updating timestamps
CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON settings
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

CREATE TRIGGER update_icons_updated_at
    BEFORE UPDATE ON icons
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();