# Alert Notification System - UI Overview

## Configuration Page - Alerts Tab

The new Alerts tab has been added to the Configuration page at `/config`, providing a comprehensive interface for managing service notifications.

### UI Elements

#### 1. Alert Settings Header
- **Title**: "Alert Management"
- **Description**: "Configure notifications for service status changes. Alerts are only active when using Service Mode theme."

#### 2. Main Controls

**Enable Alert Notifications**
- Switch toggle to enable/disable the entire alert system
- When disabled, no alerts will be sent regardless of other settings

**Pause All Alerts** (Only visible when alerts are enabled)
- Switch toggle to temporarily pause notifications
- Useful during maintenance windows
- Does not disable tracking, only notification sending

#### 3. Configuration Fields (Visible when alerts are enabled)

**Webhook URL**
- Text input field
- Accepts HTTP or HTTPS URLs
- Helper text: "Enter the webhook URL to receive alert notifications (supports HTTP/HTTPS)"
- Placeholder: "https://your-webhook-endpoint.com/alerts"

**Alert Threshold**
- Number input field (in seconds)
- Default value: 300 (5 minutes)
- Minimum value: 60 (1 minute)
- Step: 60 seconds
- Helper text: "Time in seconds before sending an alert for a downed service (default: 300 seconds / 5 minutes)"

#### 4. Action Buttons

**Send Test Notification**
- Outlined button
- Disabled when webhook URL is empty
- Sends a test payload to verify webhook configuration
- Shows success/error message via snackbar

**Clear Alert History**
- Outlined button with warning color
- Confirmation dialog before execution
- Clears all alert history from the database
- Shows success/error message via snackbar

**Save Alert Settings**
- Contained (primary) button
- Saves all alert configuration to database
- Shows success/error message via snackbar

#### 5. Documentation Section

**Webhook Payload Format**
- Displays example JSON payloads for both service down and recovery notifications
- Formatted in a code block with monospace font
- Shows the exact structure of webhook notifications

### Visual Layout

```
┌─────────────────────────────────────────────────────┐
│ Alert Management                                     │
│ Configure notifications for service status changes. │
│ Alerts are only active when using Service Mode...   │
├─────────────────────────────────────────────────────┤
│                                                       │
│ ☑ Enable Alert Notifications                        │
│                                                       │
│ ☐ Pause All Alerts                                  │
│                                                       │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Webhook URL                                     │ │
│ │ https://your-webhook-endpoint.com/alerts        │ │
│ └─────────────────────────────────────────────────┘ │
│ Enter the webhook URL to receive alert notifications │
│                                                       │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Alert Threshold (seconds)                       │ │
│ │ 300                                             │ │
│ └─────────────────────────────────────────────────┘ │
│ Time in seconds before sending an alert...          │
│                                                       │
│ [Send Test Notification] [Clear Alert History]      │
│                                                       │
│ [Save Alert Settings]                                │
│                                                       │
│ ─────────────────────────────────────────────────   │
│                                                       │
│ Webhook Payload Format                               │
│ ┌─────────────────────────────────────────────────┐ │
│ │ // Service Down Notification                    │ │
│ │ {                                               │ │
│ │   "type": "service_down",                       │ │
│ │   "service_name": "Service Name",               │ │
│ │   ...                                           │ │
│ │ }                                               │ │
│ └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### User Workflow

1. User navigates to `/config`
2. Clicks on "Alerts" tab (7th tab)
3. Toggles "Enable Alert Notifications"
4. Enters webhook URL
5. Optionally adjusts alert threshold
6. Clicks "Send Test Notification" to verify
7. Clicks "Save Alert Settings"
8. Switches theme to "Service Mode" in General Settings
9. Services will now be monitored and alerts sent when down

### Integration with Existing UI

The Alerts tab seamlessly integrates with the existing configuration interface:
- Uses Material-UI components consistent with other tabs
- Follows the same layout patterns (switches, text fields, buttons)
- Uses the same success/error notification system (Snackbar)
- Maintains the same visual hierarchy and spacing

### Responsive Design

- All elements stack vertically on mobile devices
- Buttons adjust to screen width
- Code block in documentation section scrolls horizontally if needed
- Maintains readability across all screen sizes

## Backend Integration

The frontend communicates with three new API endpoints:

1. **PUT /api/settings** - Saves alert configuration
2. **POST /api/alerts/test** - Sends test notification
3. **DELETE /api/alerts/history** - Clears alert history

All API calls show loading states and success/error feedback to the user.
