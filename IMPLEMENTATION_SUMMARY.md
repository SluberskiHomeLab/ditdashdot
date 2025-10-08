# Alert Notification System - Implementation Summary

## Overview
This implementation adds a comprehensive alert and notification system to DitDashDot, allowing users to receive real-time notifications when services go down or recover. The system integrates seamlessly with the existing Service Mode theme.

## Architecture

### Data Flow
```
Service Ping (every 60s)
    ↓
Status Change Detection
    ↓
Alert History Check
    ↓
Threshold Evaluation (default: 300s)
    ↓
Webhook Notification
    ↓
History Update
```

### Components

#### 1. Database Layer (PostgreSQL)
**dashboard_config table** (extended)
- `alerts_enabled`: BOOLEAN - Master switch for alerts
- `alerts_paused`: BOOLEAN - Temporary pause switch
- `webhook_url`: TEXT - Destination for notifications
- `alert_threshold_seconds`: INTEGER - Time before alerting

**alert_history table** (new)
- `id`: SERIAL PRIMARY KEY
- `service_id`: INTEGER - Reference to service
- `service_name`: TEXT - Service identifier
- `service_ip`: TEXT - Service IP address
- `service_port`: INTEGER - Service port
- `status`: TEXT - Current status (down/up/recovered)
- `down_since`: TIMESTAMP - When service went down
- `up_since`: TIMESTAMP - When service recovered
- `notification_sent`: BOOLEAN - Notification tracking
- `created_at`: TIMESTAMP - Record creation time

#### 2. Backend Layer (Node.js/Express)

**Enhanced Endpoints:**
- `PUT /api/settings` - Save alert configuration
- `POST /api/ping` - Monitor services and trigger alerts

**New Endpoints:**
- `GET /api/alerts/history?limit=100` - Fetch alert history
- `DELETE /api/alerts/history` - Clear all history
- `POST /api/alerts/test` - Send test notification

**Helper Functions:**
- `handleServiceStatusChange()` - Track status transitions
- `sendWebhookNotification()` - Send down alerts
- `sendRecoveryNotification()` - Send up alerts

#### 3. Frontend Layer (React)

**ConfigurationPage.js** - New Alerts Tab
- Enable/disable alerts toggle
- Pause alerts toggle
- Webhook URL input
- Threshold configuration
- Test notification button
- Clear history button
- Payload documentation

## Alert Logic

### Service Down Detection
1. Ping service fails
2. Check last known status
3. If newly down, create history record
4. If still down, check elapsed time
5. If elapsed > threshold and not yet notified:
   - Send webhook notification
   - Mark as notified

### Service Recovery Detection
1. Ping service succeeds
2. Check last known status
3. If was down:
   - Update history record to "recovered"
   - If notification was sent, send recovery notification
   - Create new "up" status record

### Smart Alerting
- Only ONE notification per downtime event
- Prevents alert spam during intermittent failures
- Recovery notifications only if down notification was sent
- Threshold prevents alerts for brief outages

## Webhook Integration

### Supported Protocols
- HTTP
- HTTPS

### Payload Format

**Service Down:**
```json
{
  "type": "service_down",
  "service_name": "Service Name",
  "service_ip": "192.168.1.1",
  "service_port": 80,
  "service_url": "http://service.local",
  "down_duration_seconds": 300,
  "timestamp": "2024-01-01T12:00:00.000Z",
  "message": "Service has been down for 300 seconds"
}
```

**Service Recovery:**
```json
{
  "type": "service_recovered",
  "service_name": "Service Name",
  "service_ip": "192.168.1.1",
  "service_port": 80,
  "service_url": "http://service.local",
  "timestamp": "2024-01-01T12:05:00.000Z",
  "message": "Service has recovered and is now up"
}
```

### Compatible Services
- Discord (via webhook URL)
- Slack (via webhook URL)
- Microsoft Teams (via webhook URL)
- Custom endpoints
- Webhook.site for testing
- Any service accepting JSON POST requests

## Configuration

### Default Values
- Alerts Enabled: `false`
- Alerts Paused: `false`
- Webhook URL: `null`
- Alert Threshold: `300 seconds` (5 minutes)

### Constraints
- Minimum threshold: 60 seconds
- Ping interval: 60 seconds (hardcoded in App.js)
- Only works with Service Mode theme
- Requires service IP and port to be configured

## Migration Process

### Applying the Migration
```bash
cd migrations
chmod +x run_005_migration.sh
./run_005_migration.sh
```

Or manually:
```bash
docker exec -i ditdashdot-db-1 psql -U ditdashdot -d ditdashdot < migrations/005_add_alerts.sql
```

### Rollback (if needed)
```sql
-- Remove alert columns from dashboard_config
ALTER TABLE dashboard_config 
  DROP COLUMN IF EXISTS alerts_enabled,
  DROP COLUMN IF EXISTS alerts_paused,
  DROP COLUMN IF EXISTS webhook_url,
  DROP COLUMN IF EXISTS alert_threshold_seconds;

-- Drop alert_history table
DROP TABLE IF EXISTS alert_history CASCADE;
```

## Security Considerations

### Webhook URL Validation
- No input validation on URL format (by design for flexibility)
- Supports any HTTP/HTTPS endpoint
- Network errors are caught and logged

### Data Privacy
- Webhook payloads include service IP/port
- Consider using internal webhook endpoints
- No sensitive data (passwords, keys) in notifications

### Error Handling
- Webhook failures are logged but don't crash the server
- Ping endpoint continues working even if alerts fail
- Database errors are isolated from main application

## Performance

### Database Impact
- Minimal: 1 query per ping cycle to get alert settings
- 1-2 queries per status change (insert/update in alert_history)
- Indexes on alert_history for fast lookups

### Network Impact
- Webhook calls are non-blocking (Promise-based)
- Failures don't affect service monitoring
- HTTP timeout handled by Node.js

### Memory Impact
- No in-memory state tracking
- All state stored in PostgreSQL
- Scales with number of services

## Testing

### Unit Testing (Manual)
1. Enable alerts and configure webhook
2. Add unreachable service
3. Wait for threshold
4. Verify webhook receives notification
5. Make service reachable
6. Verify recovery notification

### Integration Testing
1. Test with Discord webhook
2. Test with Slack webhook
3. Test with custom endpoint
4. Test pause functionality
5. Test threshold variations
6. Test history clearing

### Edge Cases Covered
- Service with no IP/port (skipped)
- Webhook URL unreachable (logged, no crash)
- Database connection lost (error handled)
- Multiple status changes within threshold (single alert)
- Alert paused mid-downtime (no notification)
- Threshold increased after downtime started (still triggers)

## Future Enhancements (Not Implemented)

Possible improvements for future versions:
1. Multiple webhook URLs
2. Alert templates/customization
3. Email notifications
4. SMS notifications
5. Alert rules per service
6. Notification scheduling (quiet hours)
7. Alert escalation
8. Dashboard widget showing alert count
9. Export alert history as CSV
10. Alert statistics and reporting

## Files Modified

1. `migrations/005_add_alerts.sql` - Database schema changes
2. `migrations/run_005_migration.sh` - Migration helper script
3. `server/index.js` - Backend logic and API endpoints
4. `src/components/config/ConfigurationPage.js` - UI for alert management
5. `README.md` - User documentation
6. `.gitignore` - Exclude build artifacts
7. `TESTING_ALERTS.md` - Testing guide
8. `UI_DOCUMENTATION.md` - UI reference

## Code Quality

### ESLint
- No new linting errors introduced
- Follows existing code style
- Uses async/await pattern consistently

### Error Handling
- Try/catch blocks on all async operations
- Errors logged to console
- User-friendly error messages
- Graceful degradation

### Code Organization
- Helper functions clearly named
- Comments for complex logic
- Consistent with existing codebase
- Follows single responsibility principle

## Conclusion

This implementation provides a robust, production-ready alert notification system that:
- Integrates seamlessly with existing architecture
- Follows established patterns in the codebase
- Provides comprehensive user documentation
- Handles edge cases gracefully
- Scales with the application
- Is easy to test and verify

The system is ready for production use and can be extended with additional features as needed.
