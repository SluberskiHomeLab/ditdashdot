# Changelog

All notable changes to DitDashDot will be documented in this file.

## [1.2.0] - 2025-09-16

### Added
- Font customization support through `config.yml`
  - `font_family`: Customize the font used throughout the dashboard
  - `font_size`: Control the base text size for the dashboard
  - `icon_size`: Adjust the size of service icons

### Changed
- Updated ServiceCard component to support customizable fonts and sizes
- Enhanced configuration documentation in README.md with new appearance settings

### Developer Changes
- Added new state variables in App.js for font settings
- Improved prop passing for style customization in ServiceCard component
- Extended configuration loading to support appearance customization options