# Testing Alert Notification System

This document describes how to test the alert notification system for DitDashDot.

## Prerequisites

1. DitDashDot must be running with Service Mode theme enabled
2. Database migration 005_add_alerts.sql must be applied
3. A webhook endpoint to receive notifications (can use RequestBin, webhook.site, or a custom endpoint)

## Test Steps

### 1. Apply Database Migration

```bash
cd migrations
chmod +x run_005_migration.sh
./run_005_migration.sh
```

Or manually:
```bash
docker exec -i ditdashdot-db-1 psql -U ditdashdot -d ditdashdot < migrations/005_add_alerts.sql
```

### 2. Configure Alerts

1. Navigate to http://localhost/config
2. Click on the "Alerts" tab
3. Toggle "Enable Alert Notifications" to ON
4. Enter a webhook URL (e.g., https://webhook.site/your-unique-url)
5. Set alert threshold (default: 300 seconds = 5 minutes)
6. Click "Send Test Notification" to verify webhook is working
7. Click "Save Alert Settings"

### 3. Configure Service Mode Theme

1. In the "General Settings" tab
2. Set "Theme Mode" to "Service Mode"
3. Click "Save Settings"

### 4. Test Service Down Alert

1. Add a test service in the "Services" tab with IP and port
2. Use an IP/port that is unreachable (e.g., 192.168.1.254:9999)
3. Wait for the configured threshold period (default: 5 minutes)
4. Check your webhook endpoint for the alert notification

Expected payload:
```json
{
  "type": "service_down",
  "service_name": "Test Service",
  "service_ip": "192.168.1.254",
  "service_port": 9999,
  "service_url": "http://test.local",
  "down_duration_seconds": 300,
  "timestamp": "2024-01-01T12:00:00.000Z",
  "message": "Service \"Test Service\" (192.168.1.254:9999) has been down for 300 seconds"
}
```

### 5. Test Service Recovery Alert

1. Make the service available (or change to a working IP/port)
2. Wait for the next ping cycle (60 seconds)
3. Check your webhook endpoint for the recovery notification

Expected payload:
```json
{
  "type": "service_recovered",
  "service_name": "Test Service",
  "service_ip": "192.168.1.254",
  "service_port": 9999,
  "service_url": "http://test.local",
  "timestamp": "2024-01-01T12:05:00.000Z",
  "message": "Service \"Test Service\" (192.168.1.254:9999) has recovered and is now up"
}
```

### 6. Test Pause Alerts

1. Toggle "Pause All Alerts" to ON
2. Service down/up events should not trigger webhook notifications
3. Toggle back to OFF to resume alerts

### 7. Test Alert History

1. Click "Clear Alert History" to reset all alert tracking
2. This will clear the alert_history table
3. All services will be treated as if they are being checked for the first time

## Verification Checklist

- [ ] Database migration applied successfully
- [ ] Alerts tab visible in configuration page
- [ ] Test notification sends successfully
- [ ] Service down alert triggers after threshold
- [ ] Service recovery alert triggers
- [ ] Pause alerts functionality works
- [ ] Clear history functionality works
- [ ] Only one notification per downtime event
- [ ] Service Mode theme shows color-coded status

## Troubleshooting

### Alert not triggering

1. Verify alerts are enabled and not paused
2. Check that Service Mode theme is active
3. Ensure service has IP and port configured
4. Verify threshold time has passed
5. Check server logs: `docker logs ditdashdot-api-1`

### Webhook not receiving notifications

1. Verify webhook URL is correct and accessible
2. Use "Send Test Notification" button to test webhook
3. Check webhook endpoint logs for errors
4. Verify firewall/network allows outbound HTTPS/HTTP

### Database errors

1. Ensure migration was applied successfully
2. Check database logs: `docker logs ditdashdot-db-1`
3. Verify database schema includes new columns:
   ```sql
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'dashboard_config' 
   AND column_name LIKE '%alert%';
   ```

## Notes

- Alerts only work with Service Mode theme
- Services must have IP and port configured for monitoring
- Ping checks run every 60 seconds
- Default alert threshold is 300 seconds (5 minutes)
- Only one notification is sent per downtime event
- Recovery notifications are sent only if down notification was sent
