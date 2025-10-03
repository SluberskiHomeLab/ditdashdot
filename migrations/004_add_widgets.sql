-- Create widgets table
CREATE TABLE IF NOT EXISTS widgets (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255),
    config JSONB DEFAULT '{}',
    page_id INTEGER REFERENCES pages(id) ON DELETE CASCADE,
    display_order INTEGER NOT NULL DEFAULT 0,
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert some default widgets
INSERT INTO widgets (type, title, config, page_id, display_order, enabled) 
SELECT 
    'datetime',
    'Current Time',
    '{"showSeconds": true, "format12Hour": false, "showGreeting": true, "showTimezone": true}',
    (SELECT id FROM pages ORDER BY display_order LIMIT 1),
    0,
    true
WHERE NOT EXISTS (SELECT 1 FROM widgets WHERE type = 'datetime');