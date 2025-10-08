#!/bin/bash
# Migration script for alert system (005_add_alerts.sql)
# This adds alert and notification functionality to DitDashDot

CONTAINER_NAME="ditdashdot-db-1"

echo "Applying migration 005_add_alerts.sql..."

# Check if running in docker-compose setup
if docker ps | grep -q "$CONTAINER_NAME"; then
    docker exec -i $CONTAINER_NAME psql -U ditdashdot -d ditdashdot < 005_add_alerts.sql
    echo "Migration applied successfully!"
else
    echo "Database container not found. Please ensure docker-compose is running."
    echo "You can also apply this migration manually using:"
    echo "  psql -U ditdashdot -d ditdashdot < 005_add_alerts.sql"
    exit 1
fi
