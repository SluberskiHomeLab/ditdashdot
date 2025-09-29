-- Make ip and port optional in services table
ALTER TABLE services ALTER COLUMN ip DROP NOT NULL;
ALTER TABLE services ALTER COLUMN port DROP NOT NULL;
