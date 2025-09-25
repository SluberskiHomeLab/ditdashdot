<img width="1900" height="947" alt="Screenshot 2025-08-21 at 10-31-25 Homelab Dashboard" src="https://github.com/user-attachments/assets/5398a7e6-40f5-4a7a-a37c-a70897ab3df4" />

# DitDashDot

**DitDashDot** is a simple, clean, and easy-to-configure services dashboard designed specifically for homelabs. Built with React.js and containerized with Docker, it provides a central hub to view and manage your homelab services.

*Version 2.0.0 is out now with major improvements! See the [CHANGELOG.md](CHANGELOG.md) for details.*

*Partially Vibe-Coded*

## Features

### Core Features
- Simple and intuitive dashboard interface
- Clean, modern design focused on usability
- Real-time service status monitoring
- Fully web-based configuration interface
- PostgreSQL database for reliable configuration storage

### Dashboard Features
- Group services into logical categories
- Customizable service cards with icons
- Quick access bar for frequently used links
- Real-time service health status
- Search functionality for quick service access

### Configuration Features
- Web-based configuration interface at /config
- Live preview of changes
- Group management
- Service configuration
- Quick access icon management
- Theme customization

### Appearance Options
- Multiple theme modes:
  - Light Mode
  - Dark Mode
  - Transparent Light
  - Transparent Dark
  - Service Status Mode
- Customizable fonts and sizes
- Custom background support
- Configurable favicon and page titles

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/) installed on your host machine
- [Docker Compose](https://docs.docker.com/compose/) v2 or higher

### Quick Start

1. Create a new directory for your dashboard:
   ```bash
   mkdir ditdashdot
   cd ditdashdot
   ```

2. Create a `docker-compose.yml` file:
   ```bash
   curl -O https://raw.githubusercontent.com/SluberskiHomeLab/ditdashdot/main/docker-compose.yml
   ```

3. Start the services:
   ```bash
   docker compose up -d
   ```

This will start three services:
- Frontend Dashboard (accessible at http://localhost:80)
- Backend API Server
- PostgreSQL Database

4. Access your dashboard:
   - Main dashboard: http://localhost:80
   - Configuration interface: http://localhost:80/config

### Advanced Installation

For development or custom deployments, you can clone the repository:

```bash
git clone https://github.com/SluberskiHomeLab/ditdashdot.git
cd ditdashdot
docker compose up -d
```

## Configuration

DitDashDot features a comprehensive web-based configuration interface that makes it easy to manage your dashboard settings.

### Using the Configuration Interface

Access the configuration interface at `http://localhost:80/config`. The interface is divided into several sections:

#### General Settings
- Dashboard title and browser tab title
- Favicon URL
- Theme selection
- Font settings
- Background customization

#### Groups Management
- Create and organize service groups
- Set group display order
- Edit or remove existing groups

#### Services Management
- Add services with URLs and icons
- Assign services to groups
- Configure service monitoring
- Set service display order

#### Quick Access Icons
- Add frequently used links to the top bar
- Upload custom icons
- Set icon order and appearance

### Data Persistence

All configuration is stored in a PostgreSQL database, providing:
- Persistent storage across restarts
- Automatic backups with Docker volumes
- Data integrity and reliability
- Change history tracking

### Initial Setup

When first starting the application, the database is initialized with default settings. Use the configuration interface to customize your dashboard according to your needs. All changes are applied in real-time and automatically persisted.

##### Show Details
Show Details will either show or hide information like ip address and port on the card.

##### Background URL
Changing the Background URL will set the picture of the Dashboard background.  By default, it will be grey.  I have tested this with links to .jpg and .png images so far.

##### Groups
Groups are Separate sections intended to improve organization.  Each group that is listed is horizontal and has a centered title


#### Additional notes

- There are updates coming for the project.  I will track them here in GitHub.

## Technologies Used

- Frontend:
  - React.js
  - Material-UI
  - React Router

- Backend:
  - Node.js/Express
  - PostgreSQL
  - RESTful API

- Infrastructure:
  - Docker
  - Docker Compose
  - Nginx

## Development

To work on DitDashDot locally:

1. Clone the repository
2. Install dependencies:
   ```bash
   # Install frontend dependencies
   npm install

   # Install backend dependencies
   cd server
   npm install
   ```

3. Start the development environment:
   ```bash
   docker-compose up -d --build
   ```

4. Make your changes
5. Test thoroughly
6. Submit a pull request

## Contributing

Contributions are welcome! Feel free to submit issues to give me suggestions on how to improve the project. 

## License

This project is licensed under the [MIT License](LICENSE).
