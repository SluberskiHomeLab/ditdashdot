#!/bin/bash
set -e

# Run the migration
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Make ip and port optional in services table
    ALTER TABLE services ALTER COLUMN ip DROP NOT NULL;
    ALTER TABLE services ALTER COLUMN port DROP NOT NULL;
EOSQL
