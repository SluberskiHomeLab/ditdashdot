# Alert Management UI - Visual Guide

## Configuration Page Changes

### 1. General Settings Tab - Alert Settings Section

Added at the bottom of the General Settings form:

```
┌─────────────────────────────────────────────────────────┐
│                                                           │
│  ────────────────────────────────────────────────────   │
│                                                           │
│  Alert Settings (Service Mode Only)                      │
│                                                           │
│  [x] Enable Alerts (Service Mode required)               │
│                                                           │
│  Global Alert Webhook URL                                │
│  ┌─────────────────────────────────────────────────┐    │
│  │ https://webhook.site/your-unique-id             │    │
│  └─────────────────────────────────────────────────┘    │
│  Default webhook URL for all services                    │
│                                                           │
│  Default Alert Threshold (minutes)                       │
│  ┌─────────────────────────────────────────────────┐    │
│  │ 5                                                │    │
│  └─────────────────────────────────────────────────┘    │
│  Send alert when service is down for this many minutes   │
│                                                           │
│           [ Save Settings ]                              │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

**Features:**
- Toggle switch for enabling/disabling alerts
- Disabled when not in Service Mode (shows warning)
- Global webhook URL field (optional, per-service can override)
- Default threshold setting (applied to new alert configs)

### 2. New Alerts Tab

Added as the 7th tab in the Configuration page:

```
[ General Settings ] [ Pages ] [ Groups ] [ Services ] [ Widgets ] [ Icons ] [ Alerts ]
                                                                                 ^^^^^^^^
```

### 3. Alerts Tab Content

When Service Mode is NOT enabled:
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                   │
│  ⚠️ Alerts are only available in Service Mode.                  │
│  Please change the theme to Service Mode in General Settings.    │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

When Service Mode IS enabled:
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                   │
│  Configure alert notifications for individual services below.     │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                                                             │  │
│  │  My Service                                        ⏸️ ✏️  │  │
│  │  192.168.1.100:8080                                        │  │
│  │  ✓ Alert enabled (5min threshold)                         │  │
│  │                                                             │  │
│  ├───────────────────────────────────────────────────────────┤  │
│  │                                                             │  │
│  │  Another Service                                      ✏️  │  │
│  │  192.168.1.101:8081                                        │  │
│  │  No IP/Port configured                                     │  │
│  │                                                             │  │
│  ├───────────────────────────────────────────────────────────┤  │
│  │                                                             │  │
│  │  Paused Service                                    ▶️ ✏️  │  │
│  │  192.168.1.102:8082                                        │  │
│  │  ⏸️ Paused                                                 │  │
│  │                                                             │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

**Features:**
- List of all services
- Visual indicators:
  - ✓ Green checkmark = Alert enabled and active
  - ⏸️ Orange pause icon = Alert paused
  - ⚠️ Yellow warning = No IP/Port (cannot configure)
- Control buttons:
  - ⏸️ Pause button (when active) / ▶️ Play button (when paused)
  - ✏️ Edit button to configure alert settings

### 4. Alert Configuration Dialog

Clicking the edit (✏️) button opens:

```
┌────────────────────────────────────────────────────┐
│  Alert Configuration for: My Service                │
├────────────────────────────────────────────────────┤
│                                                      │
│  [x] Enable Alerts for this Service                 │
│                                                      │
│  Webhook URL                                        │
│  ┌──────────────────────────────────────────────┐  │
│  │ https://webhook.site/xyz                     │  │
│  └──────────────────────────────────────────────┘  │
│  Leave empty to use global webhook URL             │
│                                                      │
│  Alert Threshold (minutes)                          │
│  ┌──────────────────────────────────────────────┐  │
│  │ 5                                             │  │
│  └──────────────────────────────────────────────┘  │
│  Alert will be sent when service is down for        │
│  this many minutes                                   │
│                                                      │
│           [ Cancel ]  [ Save ]                      │
│                                                      │
└────────────────────────────────────────────────────┘
```

**Features:**
- Toggle to enable/disable alerts for specific service
- Webhook URL field (overrides global if set)
- Threshold setting (in minutes)
- Helper text explaining behavior

## Service Mode Visual Indicators

When theme is set to Service Mode, service cards show status colors:

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│              │  │              │  │              │
│   [icon]     │  │   [icon]     │  │   [icon]     │
│              │  │              │  │              │
│  My Service  │  │   Down Svc   │  │  Unknown     │
│              │  │              │  │              │
│ 192.168.1.1  │  │ 192.168.1.2  │  │ 192.168.1.3  │
│              │  │              │  │              │
└──────────────┘  └──────────────┘  └──────────────┘
  🟢 Green           🔴 Red            ⚪ Gray
  (Service Up)       (Service Down)    (Unknown)
```

When a service is down and alert is triggered, the webhook receives notification.

## Alert Status Indicators

In the Alerts tab, service status is shown with emojis:

- ✓ (Green) = Alert enabled and active
- ⏸️ (Orange) = Alert paused
- ⚫ (Gray) = Alert disabled
- ⚠️ (Yellow) = Cannot configure (no IP/Port)

## User Flow

### Setting Up Alerts

1. Go to /config
2. Click "General Settings" tab
3. Select "Service Mode" from Theme dropdown
4. Scroll down to "Alert Settings"
5. Toggle "Enable Alerts" ON
6. Enter webhook URL (e.g., from webhook.site)
7. Set default threshold (e.g., 5 minutes)
8. Click "Save Settings"
9. Click "Alerts" tab
10. Click edit (✏️) next to a service
11. Toggle "Enable Alerts for this Service" ON
12. Optionally customize webhook URL or threshold
13. Click "Save"

### Using Pause/Resume

1. Go to /config > Alerts tab
2. Find service with active alert (✓ shown)
3. Click pause button (⏸️)
4. Alert status changes to "⏸️ Paused"
5. Service continues to be monitored
6. No alerts sent while paused
7. Click play button (▶️) to resume
8. Alert status returns to "✓ Alert enabled"

### Viewing Alert History

Currently done via database query:
```sql
SELECT * FROM alert_history 
ORDER BY created_at DESC 
LIMIT 20;
```

Shows:
- Service ID and name
- Alert message
- Webhook URL used
- Status (sent/failed)
- HTTP response code
- Timestamp

## Responsive Design

The UI uses Material-UI components and follows the existing design patterns:
- Full-width layout on desktop
- Responsive grid on mobile
- Touch-friendly button sizes
- Clear visual hierarchy
- Consistent with existing tabs

## Accessibility

- All controls have proper labels
- Toggle switches are keyboard accessible
- Helper text provides context
- Error states are clearly shown
- Color indicators have text backups
