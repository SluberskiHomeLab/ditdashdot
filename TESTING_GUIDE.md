# Testing Guide for Alert Management System

## Prerequisites

Before testing, ensure you have:
1. DitDashDot running with PostgreSQL database
2. Service Mode theme enabled
3. At least one service configured with IP and port
4. A webhook endpoint for testing (recommendations below)

## Setting Up Test Webhook Endpoints

### Option 1: webhook.site (Easiest)
1. Visit https://webhook.site
2. Copy your unique URL
3. Use this URL in alert configuration
4. See real-time webhook payloads in the browser

### Option 2: RequestBin
1. Visit https://requestbin.com
2. Create a new bin
3. Use the bin URL for testing
4. View all received webhooks

### Option 3: Local Testing Server
```bash
# Simple Python webhook receiver
python3 -m http.server 8888
```

## Test Scenarios

### Test 1: Database Migration
```bash
# Run the migration script
cd /home/runner/work/ditdashdot/ditdashdot
docker-compose exec db psql -U $POSTGRES_USER -d $POSTGRES_DB -f /app/migrations/005_add_alerts.sql
```

Verify tables were created:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('alert_config', 'alert_history', 'service_status');
```

### Test 2: Enable Alerts Globally
1. Navigate to `/config`
2. Go to "General Settings" tab
3. Ensure "Theme Mode" is set to "Service Mode"
4. Scroll to "Alert Settings" section
5. Toggle "Enable Alerts" ON
6. Set "Global Alert Webhook URL" to your test webhook
7. Set "Default Alert Threshold" to 1 minute (for faster testing)
8. Click "Save Settings"

### Test 3: Configure Per-Service Alert
1. Stay in `/config`
2. Click on "Alerts" tab
3. Find a service with IP/Port configured
4. Click the edit icon (✏️) next to the service
5. Toggle "Enable Alerts for this Service" ON
6. Optionally override webhook URL
7. Set threshold to 1 minute
8. Click "Save"

### Test 4: Trigger an Alert
1. Note the IP and Port of the test service
2. Stop that service or block the port
3. Wait for next ping cycle (60 seconds)
4. Wait for threshold (1 minute from first failed ping)
5. Check your webhook endpoint for the alert payload
6. Verify alert appears in browser console (if configured)

Expected webhook payload:
```json
{
  "service": {
    "id": 1,
    "name": "Test Service",
    "url": "http://example.com",
    "ip": "192.168.1.100",
    "port": 8080
  },
  "status": "down",
  "downtime_minutes": 1,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "message": "Service \"Test Service\" has been down for 1 minutes"
}
```

### Test 5: Verify Alert History
Query the alert_history table:
```sql
SELECT * FROM alert_history ORDER BY created_at DESC LIMIT 10;
```

Should see:
- service_id matching your test service
- alert_type: 'service_down'
- message with service name and downtime
- webhook_url used
- status: 'sent' or 'failed'
- response_status: HTTP status code

### Test 6: Test Pause Functionality
1. In `/config` > "Alerts" tab
2. Find the service with active alert
3. Click the pause button (⏸️)
4. Status should show "⏸️ Paused"
5. Service continues to be monitored but no alerts sent
6. Click play button (▶️) to resume
7. Status should show "✓ Alert enabled"

### Test 7: Test Service Recovery
1. Start the previously stopped service
2. Wait for next ping cycle (60 seconds)
3. Service status should change to up
4. Verify service_status table shows is_up = true
5. No additional alerts should be sent

### Test 8: Test Multiple Services
1. Configure alerts for multiple services
2. Stop 2-3 services at different times
3. Verify each service gets its own alert
4. Check that downtime is tracked independently

### Test 9: Verify Service Mode Requirement
1. Change theme to "Light Mode" or "Dark Mode"
2. Alerts tab should show warning message
3. Alert settings should be disabled
4. No alerts should be sent even if services are down
5. Change back to "Service Mode" to re-enable

### Test 10: Edge Cases

#### No IP/Port Service
- Service without IP/Port should be disabled in Alerts tab
- Cannot configure alerts

#### Invalid Webhook URL
- Configure alert with invalid URL (e.g., "not-a-url")
- Check alert_history for failed status
- Verify error is logged

#### Very Short Threshold
- Set threshold to 0 minutes
- Should alert immediately on first down detection

#### Very Long Threshold
- Set threshold to 60 minutes
- Service must be down for full hour before alert

## Troubleshooting Testing Issues

### Issue: No alerts received
**Check:**
- Is Service Mode enabled?
- Is global alerts enabled?
- Is service alert enabled?
- Is alert paused?
- Does service have IP and port?
- Is webhook URL valid and accessible?

### Issue: Multiple alerts for same downtime
**This shouldn't happen. If it does:**
- Check alert_history table for duplicate entries
- Review downtime_started_at in service_status table
- Report as bug

### Issue: Alerts sent when not in Service Mode
**This is a bug:**
- Check dashboard_config.mode value
- Review server logs
- Report with reproduction steps

### Issue: Database errors
**Check:**
- Was migration run successfully?
- Are all three new tables present?
- Check PostgreSQL logs

## Performance Testing

### Test 11: Many Services
1. Configure 50+ services with alerts
2. Stop multiple services
3. Monitor system performance
4. Check ping duration
5. Verify alerts still sent properly

### Test 12: High Frequency
1. Set threshold to 0 minutes
2. Configure 10 services
3. Stop and start services repeatedly
4. Check for alert_history growth
5. Monitor database size

## Cleanup After Testing

```sql
-- Clear test data
DELETE FROM alert_history;
DELETE FROM service_status;
DELETE FROM alert_config;

-- Reset global settings
UPDATE dashboard_config 
SET alerts_enabled = false, 
    alert_webhook_url = '', 
    alert_threshold_minutes = 5;
```

## Success Criteria

The implementation is successful if:
- [x] All database tables created properly
- [x] Global alert settings can be saved
- [x] Per-service alert configs can be created/edited
- [x] Webhooks are sent when threshold exceeded
- [x] Only one alert sent per downtime period
- [x] Alerts can be paused and resumed
- [x] Alerts only work in Service Mode
- [x] Alert history is tracked correctly
- [x] Service recovery stops alerts
- [x] Multiple services work independently

## Report Issues

If you find bugs or issues during testing:
1. Check server logs: `docker-compose logs server`
2. Check database state: Query relevant tables
3. Note exact reproduction steps
4. Capture any error messages
5. Report with as much detail as possible
