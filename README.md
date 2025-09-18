<img width="1900" height="947" alt="Screenshot 2025-08-21 at 10-31-25 Homelab Dashboard" src="https://github.com/user-attachments/assets/5398a7e6-40f5-4a7a-a37c-a70897ab3df4" />

# DitDashDot

**DitDashDot** is a simple, clean, and easy-to-configure services dashboard designed specifically for homelabs. Built with React.js and containerized with Docker, it provides a central hub to view and manage your homelab services.

*Release 1.1 is out now with changes.  Changelog can be found in the pull request*
## Features

- Simple and intuitive dashboard interface
- Built with React.js for a fast and modern web experience
- Runs in Docker for easy deployment and management
- Clean design focused on usability
- Web-based configuration interface
- PostgreSQL database for configuration storage
- Integrated Service pings
- Service_Mode theme for ping visibility
- Dark mode support
- Quick access icons
- Real-time configuration updates

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/) installed on your host machine
- [Docker Compose](https://docs.docker.com/compose/) 

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/SluberskiHomeLab/ditdashdot.git
   cd ditdashdot
   ```
   
2. Build and start the services:
   ```bash
   docker-compose up -d --build
   ```

This will start three services:
- Frontend Dashboard (accessible at http://localhost:80)
- Backend API Server
- PostgreSQL Database

3. Access the dashboard:
   - Main dashboard: http://localhost:80
   - Configuration interface: http://localhost:80/config

2. Create your configuration files:
   ```bash
   # Copy and edit the sample config files
   cp config.sample.yml config.yml
   cp barconfig.sample.yml barconfig.yml
   ```

3. Build the Docker image:
   ```bash
   docker build -t ditdashdot .
   ```

4. Run the container:
   ```bash
   docker run -d \
     -p 80:80 \
     -v $(pwd)/config.yml:/usr/share/nginx/html/config.yml \
     -v $(pwd)/barconfig.yml:/usr/share/nginx/html/barconfig.yml \
     --name ditdashdot \
     ditdashdot
   ```

2. Build the Docker image:
   ```bash
   docker build -t ditdashdot .
   ```

3. Run the container:
   ```bash
   docker run -d \
     -p 80:80 \
     -v $(pwd)/config.yml:/usr/share/nginx/html/config.yml \
     -v $(pwd)/barconfig.yml:/usr/share/nginx/html/barconfig.yml \
     --name ditdashdot \
     ditdashdot
   ```

After installation using either method, open your browser and navigate to `http://localhost:80` to view your dashboard.

## Configuration

DitDashDot now features a web-based configuration interface that makes it easy to manage your dashboard settings. 

### Web Configuration Interface

Access the configuration interface by navigating to `http://localhost:80/config`. Here you can:
- Modify dashboard appearance and behavior
- Manage service groups and services
- Configure quick access icons
- Preview changes in real-time

All configuration is stored in a PostgreSQL database, providing:
- Persistent storage
- Backup capabilities
- Multi-user access
- Change history

### Initial Setup

When first starting the application, the database will be initialized with default settings. You can then use the configuration interface to customize your dashboard.
There are several customization options available in the config.yml to make your dashboard exactly how you want it.  

##### Appearance Settings
You can customize the appearance of your dashboard using these settings:
```yml
font_family: "Arial, sans-serif" # Custom font for the dashboard
font_size: "14px"               # Base font size for text
icon_size: "32px"              # Size of service icons
```

##### Title and Browser Settings
You can customize both the dashboard title and browser-specific elements:
```yml
# Dashboard title shown at the top of the page
title: Homelab Dashboard

# Browser tab title
tab_title: "My Homelab Dashboard"

# Custom favicon URL
favicon_url: "https://example.com/favicon.ico"
```

##### Theme
DitDashDot has 4 themes to choose from. This should give you a bit of freedom with color combos and readability.

```yml
mode: dark_mode # Cards are dark grey, Text is white
```
```yml
mode: light_mode # Cards are white, Text is black
```
```yml
mode: trans_light # Cards are transparent, Text is black
```
```yml
mode: trans_dark # Cards are transparent, Text is white
```
```yml
mode: service_mode # Cards change color based on if the service is reachable by the dashboard
```

##### Show Details
Show Details will either show or hide information like ip address and port on the card.

```yml
show_details: true #This will show ip address and port on the card
```
```yml
show_details: false #This will hide the ip address and port on the card
```

##### Background URL
Changing the Background URL will set the picture of the Dashboard background.  By default, it will be grey.  I have tested this with links to .jpg and .png images so far.

```yml
background_url: https://your-image-url.com/background.jpg # Set this to any image url Currently supports png and jpg
```
##### Groups
Groups are Separate sections intended to improve organization.  Each group that is listed is horizontal and has a centered title

Example of a service within a group with a title:
```yml
groups: # each group will be a separate vertical section in the dashboard
  - title: Home Automation
    services:
      - iconUrl: https://www.home-assistant.io/images/favicon.ico
        ip: 192.168.1.10
        name: Home Assistant
        port: 8123
        url: http://192.168.1.10:8123
```

##### barconfig.yml
Barconfig.yml is the config for your quick access icons.  You can configure these to your hearts desire.  I do not reccomend putting more than about 10 for sizing reasons.

```yml
  - iconUrl: https://cdn.jsdelivr.net/gh/selfhst/icons/png/github.png # URL to the icon you wish to display
    link: https://github.com/SluberskiHomelab # Link that clicking on the icon goes to
    alt: GitHub # Service name.  will display when hovering over the icon.
```

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
