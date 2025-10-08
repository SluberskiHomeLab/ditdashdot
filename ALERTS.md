# Alert Management Setup Guide

This guide explains how to configure and use the alert management features in DitDashDot.

## Overview

DitDashDot's alert system monitors your services and sends notifications when they go down or come back online. The system works seamlessly with the Service Status theme mode to provide visual and automated notifications.

## Prerequisites

1. **Service Status Theme**: Alert functionality requires the dashboard to be set to "Service Status Mode"
2. **Service Monitoring**: Services must have IP addresses and ports configured for monitoring
3. **Webhook URL**: A Discord webhook URL or compatible webhook endpoint for notifications

## Setting Up Alerts

### 1. Enable Service Status Mode

1. Go to `/config` in your dashboard
2. Click on "General Settings" tab
3. Set Theme Mode to "Service Status Mode"
4. Save settings

### 2. Configure Alert Settings

1. Go to `/config` in your dashboard
2. Click on "Alerts" tab
3. Configure the following:

#### Global Alert Settings
- **Enable Alerts**: Toggle alerts on/off globally
- **Down Threshold**: How long services must be down before alerting (default: 5 minutes)

#### Webhook Configuration
- **Enable Webhook Notifications**: Toggle webhook alerts on/off
- **Discord Webhook URL**: Your Discord webhook URL (see Discord setup below)
- **Test Webhook**: Button to send a test alert to verify configuration

### 3. Discord Webhook Setup

1. In Discord, go to your server
2. Right-click on the channel where you want alerts
3. Select "Edit Channel" → "Integrations" → "Webhooks"
4. Click "New Webhook"
5. Give it a name (e.g., "DitDashDot Alerts")
6. Copy the webhook URL
7. Paste the URL into the DitDashDot alert configuration

### 4. Per-Service Configuration

Each service can have individual alert settings:

1. Go to `/config` → "Services" tab
2. Edit a service
3. In the Alert Settings section:
   - **Enable alerts for this service**: Override global enable/disable
   - **Down Threshold**: Override global threshold for this specific service

## Alert Features

### Alert Types

- **Service Down**: Sent when a service has been unreachable for the configured threshold
- **Service Recovery**: Sent immediately when a service comes back online

### Alert Pausing

Temporarily pause alerts during maintenance:
- **1 Hour**: Quick maintenance window
- **4 Hours**: Extended maintenance
- **24 Hours**: Major maintenance or planned downtime

### Alert History

View complete alert history including:
- Service name and location (IP:Port)
- Alert type (down/recovery)
- Timestamp
- Webhook delivery status

## Example Alert Messages

### Service Down Alert
```
🔴 Service "Plex Media Server" has been down for 5 minutes!
Service: Plex Media Server
Status: 🔴 Down
Location: 192.168.1.100:32400
```

### Service Recovery Alert
```
🟢 Service "Plex Media Server" is back online!
Service: Plex Media Server
Status: 🟢 Up
Location: 192.168.1.100:32400
```

## Troubleshooting

### Alerts Not Working
1. Verify Service Status Mode is enabled
2. Check that services have IP addresses and ports configured
3. Ensure alert system is enabled in alert settings

### Webhooks Not Delivering
1. Use the "Test Webhook" button to verify configuration
2. Check webhook URL is correct and active
3. Verify Discord channel permissions allow webhook messages

### Too Many/Few Alerts
1. Adjust the down threshold (higher = fewer alerts, lower = more sensitive)
2. Use per-service thresholds for critical vs non-critical services
3. Use alert pausing during maintenance windows

## Best Practices

1. **Start Conservative**: Begin with a 5-10 minute threshold to avoid false positives
2. **Use Per-Service Settings**: Set shorter thresholds for critical services
3. **Test Configuration**: Always use the test webhook feature before relying on alerts
4. **Plan for Maintenance**: Use alert pausing during planned downtime
5. **Monitor Alert History**: Review alert patterns to optimize thresholds

## Advanced Configuration

### Custom Webhook Formats

While designed for Discord, the webhook system sends JSON with the following structure:
```json
{
  "username": "DitDashDot",
  "content": "Alert message",
  "embeds": [{
    "title": "Service Alert: Service Name",
    "description": "Detailed message",
    "color": 15158332,  // Red for down, green for up
    "fields": [
      {"name": "Service", "value": "Service Name", "inline": true},
      {"name": "Status", "value": "🔴 Down", "inline": true},
      {"name": "Location", "value": "192.168.1.100:32400", "inline": true}
    ],
    "timestamp": "2025-10-08T10:30:00Z"
  }]
}
```

This format is compatible with Discord and many other webhook services.

## Need Help?

If you encounter issues with the alert system, see [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for detailed troubleshooting steps.