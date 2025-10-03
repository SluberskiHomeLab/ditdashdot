-- Create pages table
CREATE TABLE IF NOT EXISTS pages (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add page_id to groups table
ALTER TABLE groups ADD COLUMN IF NOT EXISTS page_id INTEGER REFERENCES pages(id) ON DELETE CASCADE;

-- Create default page if none exist
INSERT INTO pages (title, display_order) 
SELECT 'Home', 0 
WHERE NOT EXISTS (SELECT 1 FROM pages);

-- Update existing groups to use the default page
UPDATE groups SET page_id = (SELECT id FROM pages ORDER BY display_order LIMIT 1) WHERE page_id IS NULL;