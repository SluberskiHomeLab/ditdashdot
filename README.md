# DitDashDot

**DitDashDot** is a simple, clean, and easy-to-configure services dashboard designed specifically for homelabs. Built with React.js and containerized with Docker, it provides a central hub to view and manage your homelab services.

*Release 1.1 is out now with changes.  Changelog can be found in the pull request*
## Features

- Simple and intuitive dashboard interface
- Built with React.js for a fast and modern web experience
- Runs in Docker for easy deployment and management
- Clean design focused on usability
- Easily configurable to fit your homelab setup
- Simple yaml configuration
- Integrated Service pings
- Service_Mode theme for ping visibility
- Dark mode support
- Quick access icons

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/) installed on your host machine
- [Docker Compose](https://docs.docker.com/compose/) 

### Quick Start (Docker Compose)

1. Clone the repository:
   ```bash
   git clone https://github.com/SluberskiHomeLab/ditdashdot.git
   cd ditdashdot
   ```
   
2. Start the service:

   ```bash
   docker-compose up -d
   ```

3. Open your browser and navigate to `http://localhost:80` to view your dashboard.

## Configuration

Configuration is designed to be straightforward. 

#### config

Config.yml is the primary configuration file for the dashboard.  This is where the services configuration is layed out.  I have included a sample config.yml file in this repo. 
\
BarConfig.yml is the configuration file for the small quick access icons below the search bar.  I have also included a sample of this file.
\
By default, DitDashDot looks for the config.yml and barconfig.yml in jthe root of the project folder that the docker compose file is in.  
\
There are a few things that you can customize in the config.yml to make your dashboard exactly how you want it.  

##### Title
Change this variable to set the title of your page
```yml
title: Homelab Dashboard
```
*If you want to set the tab title, you can change that in index.html on the <title> section
```html
<title>Homelab Dashboard</title>
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

- JavaScript (React.js)
- Docker
- HTML
- yaml

## Contributing

Contributions are welcome! Feel free to submit issues to give me suggestions on how to improve the project. 

## License

This project is licensed under the [MIT License](LICENSE).
