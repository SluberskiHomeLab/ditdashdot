#!/bin/bash
# Migration script for Alert Management System
# This script applies the 005_add_alerts.sql migration

echo "Running Alert Management System migration..."

# Check if PostgreSQL environment variables are set
if [ -z "$POSTGRES_HOST" ] || [ -z "$POSTGRES_DB" ] || [ -z "$POSTGRES_USER" ]; then
    echo "Error: PostgreSQL environment variables not set"
    echo "Please set POSTGRES_HOST, POSTGRES_DB, POSTGRES_USER, and POSTGRES_PASSWORD"
    exit 1
fi

# Run the migration
PGPASSWORD=$POSTGRES_PASSWORD psql -h $POSTGRES_HOST -U $POSTGRES_USER -d $POSTGRES_DB -f /app/migrations/005_add_alerts.sql

if [ $? -eq 0 ]; then
    echo "Migration completed successfully!"
else
    echo "Migration failed!"
    exit 1
fi
