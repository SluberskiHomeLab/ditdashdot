# Changelog

All notable changes to DitDashDot will be documented in this file.

## [B2.0.1] - 2025-09-18

### Fixed
- Fixed syntax errors in ConfigurationPage.js causing build failures
- Fixed ESLint warnings in React components:
  - Removed unused props spread in TabPanel component
  - Improved interval management using useRef
  - Enhanced timeout cleanup in service ping functionality
  - Added proper error handling for fetch requests
- Fixed API endpoint issues:
  - Corrected column name mismatch between frontend and backend for settings
  - Aligned group API field names with database schema
  - Added proper error handling and response messages
- Improved React component cleanup and memory management
- Enhanced error handling in configuration interface

## [B2.0.0] - 2025-09-18

### Added
- PostgreSQL database backend for storing configuration
- Web-based configuration interface at /config endpoint
- RESTful API for managing dashboard settings
- Material-UI based configuration GUI
- Real-time configuration updates
- Docker Compose setup with database and API services

### Changed
- Configuration management moved from YAML files to database
- Updated Docker setup to include PostgreSQL and API server
- Improved configuration workflow with web interface

## [B1.1.5] - 2025-09-17

### Added
- Added support for customizing browser tab title through config.yml
- Added support for customizing favicon through config.yml
- Updated documentation with new configuration options

## [B1.1.4] - 2025-09-17

### Fixed
- Fixed Dockerfile keyword casing to follow Docker style conventions
- Fixed "AS" keyword capitalization in multi-stage build

## [B1.1.3] - 2025-09-17

### Fixed
- Fixed Dockerfile configuration for proper config file handling
- Improved nginx configuration for better performance and security
- Added proper volume mounts for configuration files
- Updated Docker build and run instructions in README.md

## [B1.1.2] - 2025-09-17

### Added
- Dockerfile for direct Docker build and deployment
- Updated README.md with Docker build instructions

## [B1.1.1] - 2025-09-16

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