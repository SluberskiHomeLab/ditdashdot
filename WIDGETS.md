# Widget Configuration Guide

This document explains how to configure the different widget types available in the dashboard.

## Available Widget Types

### 1. Date/Time Widget (`datetime`)

Displays current date and time with customizable formatting options.

**Configuration Options:**
```json
{
  "showSeconds": true,
  "format12Hour": false,
  "showGreeting": true,
  "showWeekday": true,
  "showTimezone": true,
  "dateFormat": "long",
  "locale": "en-US",
  "timezone": "America/New_York"
}
```

**Configuration Details:**
- `showSeconds` (boolean): Show seconds in time display
- `format12Hour` (boolean): Use 12-hour format with AM/PM
- `showGreeting` (boolean): Show greeting based on time of day
- `showWeekday` (boolean): Show day of the week in date
- `showTimezone` (boolean): Display timezone information
- `dateFormat` (string): "short" or "long" date format
- `locale` (string): Locale for formatting (e.g., "en-US", "es-ES")
- `timezone` (string): IANA timezone identifier

### 2. Weather Widget (`weather`)

Displays current weather information using OpenWeatherMap API.

**Configuration Options:**
```json
{
  "apiKey": "your-openweathermap-api-key",
  "location": "New York, NY",
  "units": "metric"
}
```

**Configuration Details:**
- `apiKey` (string, required): OpenWeatherMap API key
- `location` (string, required): City name or "City, Country"
- `units` (string): "metric" (Celsius), "imperial" (Fahrenheit), or "kelvin"

**Getting an API Key:**
1. Visit [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for a free account
3. Generate an API key
4. Use the key in your widget configuration

### 3. Sun Position Widget (`sun_position`)

Shows sunrise/sunset times and daylight progress.

**Configuration Options:**
```json
{
  "latitude": 40.7128,
  "longitude": -74.0060,
  "timezone": "America/New_York"
}
```

**Configuration Details:**
- `latitude` (number, required): Geographic latitude
- `longitude` (number, required): Geographic longitude
- `timezone` (string): IANA timezone identifier for time display

**Finding Your Coordinates:**
- Use [LatLong.net](https://www.latlong.net/) or Google Maps
- Right-click on your location in Google Maps to get coordinates

## Widget Management

### Adding Widgets

1. Go to `/config` in your dashboard
2. Click the "Widgets" tab
3. Click "Add Widget"
4. Select widget type
5. Choose the page where the widget will appear
6. Configure widget settings (JSON format)
7. Set display order
8. Save the widget

### Widget Configuration Format

Widget configurations are stored as JSON. Common patterns:

```json
{
  "setting1": "value1",
  "setting2": true,
  "setting3": 123
}
```

### Display Order

Widgets are displayed in order of their `display_order` value:
- Lower numbers appear first
- Same numbers are ordered by creation time
- Negative numbers are allowed

### Page Assignment

Each widget is assigned to a specific page:
- Widgets only appear on their assigned page
- Each page can have multiple widgets
- Widgets are displayed above the service groups

## Example Configurations

### Simple Date/Time Widget
```json
{
  "showSeconds": false,
  "format12Hour": true,
  "showGreeting": true
}
```

### Weather Widget for London
```json
{
  "apiKey": "abc123def456",
  "location": "London, UK",
  "units": "metric"
}
```

### Sun Position for San Francisco
```json
{
  "latitude": 37.7749,
  "longitude": -122.4194,
  "timezone": "America/Los_Angeles"
}
```

## Troubleshooting

### Widget Not Displaying
- Check that the widget is enabled
- Verify the page assignment is correct
- Check browser console for JavaScript errors

### Weather Widget Errors
- Verify API key is correct and active
- Check location format (try just city name)
- Ensure API key has sufficient quota

### Sun Position Widget Issues
- Verify latitude/longitude are correct decimals
- Check timezone identifier is valid
- Coordinates should be: -90 to 90 for latitude, -180 to 180 for longitude

### Configuration JSON Errors
- Validate JSON syntax using a JSON validator
- Check for missing quotes around strings
- Ensure boolean values are `true`/`false` (lowercase)
- Numbers should not be quoted

## Future Widgets

The widget system is extensible. Future widget types may include:
- System status/monitoring
- RSS feed reader
- Calendar/events
- Network speed test
- Custom API integrations