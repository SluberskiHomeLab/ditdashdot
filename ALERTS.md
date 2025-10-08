# Alert Management System

The Alert Management System provides comprehensive monitoring and notification capabilities for services running in Service Mode. This feature helps you stay informed about service outages through webhook notifications.

## Features

- **Webhook Notifications**: Send HTTP POST notifications when services go down
- **Custom Thresholds**: Configure downtime thresholds per service (default 5 minutes)
- **Pause/Resume**: Temporarily pause alerts without disabling them completely
- **Service Mode Integration**: Works exclusively with the Service Mode theme
- **Per-Service Configuration**: Configure alerts individually for each service
- **Alert History**: Track all alerts sent with timestamps and status

## Requirements

- Theme must be set to **Service Mode** in General Settings
- Services must have IP and Port configured for monitoring
- Valid webhook URL (per-service or global)

## Configuration

### Global Alert Settings

Navigate to **Configuration > General Settings** and scroll to the Alert Settings section:

1. **Enable Alerts**: Toggle to activate the alert system (requires Service Mode)
2. **Global Alert Webhook URL**: Default webhook URL for all services
3. **Default Alert Threshold**: Minutes a service must be down before triggering an alert

### Per-Service Alert Configuration

Navigate to **Configuration > Alerts** tab:

1. Select a service to configure
2. Toggle **Enable Alerts for this Service**
3. Set service-specific **Webhook URL** (optional, overrides global)
4. Set service-specific **Alert Threshold** (in minutes)
5. Use the pause button (⏸️) to temporarily suspend alerts

## Webhook Payload

When a service goes down and exceeds the threshold, the system sends a POST request with the following JSON payload:

```json
{
  "service": {
    "id": 1,
    "name": "My Service",
    "url": "https://example.com",
    "ip": "192.168.1.100",
    "port": 8080
  },
  "status": "down",
  "downtime_minutes": 5,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "message": "Service \"My Service\" has been down for 5 minutes"
}
```

## Integration Examples

### Discord Webhook

Discord webhooks expect a different format. You'll need a middleware service or use a Discord webhook proxy that can transform the payload.

### Slack Webhook

Similar to Discord, Slack has its own format. Consider using a webhook proxy or middleware.

### Custom API Endpoint

Create your own endpoint that receives the above JSON format and performs custom actions (email, SMS, logging, etc.)

### Webhook Testing Services

For testing, you can use services like:
- https://webhook.site
- https://requestbin.com
- https://httpbin.org/post

## Alert Behavior

### How Alerts are Triggered

1. Service monitoring runs every 60 seconds (configured in App.js)
2. When a service fails to respond:
   - System records the downtime start time
   - Continues monitoring
3. When downtime exceeds the configured threshold:
   - System sends ONE alert notification
   - Alert is logged to history
4. No additional alerts are sent for the same downtime period
5. When service recovers:
   - Downtime timer resets
   - Service marked as "up"

### Pausing Alerts

When you pause alerts for a service:
- Existing downtime tracking continues
- No new alerts will be sent
- Alert configuration is preserved
- Can be resumed at any time

### Disabling Alerts

When you disable alerts for a service:
- Downtime tracking stops
- Alert configuration is removed
- Must be re-configured if re-enabled

## Database Schema

The alert system uses three additional tables:

### alert_config
- `service_id`: Service this alert config belongs to
- `enabled`: Whether alerts are enabled
- `paused`: Whether alerts are temporarily paused
- `threshold_minutes`: Minutes before alert triggers
- `webhook_url`: Service-specific webhook URL

### alert_history
- `service_id`: Service that triggered the alert
- `alert_type`: Type of alert (currently "service_down")
- `message`: Alert message content
- `webhook_url`: URL where alert was sent
- `status`: Whether alert was sent successfully
- `response_status`: HTTP status code from webhook

### service_status
- `service_id`: Service being monitored
- `is_up`: Current status
- `downtime_started_at`: When current downtime began
- `last_checked_at`: Last ping timestamp

## Troubleshooting

### Alerts Not Sending

1. Verify Service Mode is enabled in General Settings
2. Confirm "Enable Alerts" is toggled ON in General Settings
3. Check that the service has IP and Port configured
4. Verify webhook URL is valid and accessible
5. Check that alerts are not paused for the service
6. Review alert history for error messages

### Webhook Failures

- Check webhook URL is publicly accessible
- Verify webhook endpoint accepts POST requests
- Review alert_history table for response codes
- Test webhook URL with curl or Postman

### Alert Not Triggering at Expected Time

- Default ping interval is 60 seconds
- Threshold is checked at each ping
- Alert only sent once per downtime period
- Check system time synchronization

## API Endpoints

The following endpoints are available:

### Alert Configuration
- `GET /api/alert-config` - Get all alert configurations
- `GET /api/alert-config/:serviceId` - Get config for specific service
- `POST /api/alert-config` - Create/update alert configuration
- `PUT /api/alert-config/:id` - Update alert configuration
- `PATCH /api/alert-config/:serviceId/pause` - Pause/unpause alerts
- `DELETE /api/alert-config/:id` - Delete alert configuration

### Alert History
- `GET /api/alert-history` - Get alert history (query params: serviceId, limit)

### Service Status
- `GET /api/service-status` - Get all service statuses
- `GET /api/service-status/:serviceId` - Get status for specific service

## Security Considerations

- Webhook URLs may contain sensitive tokens/keys
- Store webhook URLs securely
- Consider using environment variables for sensitive URLs
- Validate webhook endpoints before saving
- Use HTTPS webhooks when possible
- Implement rate limiting on webhook endpoints
