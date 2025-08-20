# DitDashDot

**DitDashDot** is a simple, clean, and easy-to-configure services dashboard designed specifically for homelabs. Built with React.js and containerized with Docker, it provides a central hub to view and manage your homelab services.

***This is a work in progress.  I am not a developer, this is a passion project***
## Features

- Simple and intuitive dashboard interface
- Built with React.js for a fast and modern web experience
- Runs in Docker for easy deployment and management
- Clean design focused on usability
- Easily configurable to fit your homelab setup
- Simple yaml configuration
- Integrated Service pings
- Dark mode support

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/) installed on your host machine
- [Docker Compose](https://docs.docker.com/compose/) (optional, for Compose setup)

### Quick Start (Docker)

Run the below command to spin up DitDashDot in docker.
```bash
docker run -d \
  -p 80:80 \
  -v "$(pwd)/config.yml:/usr/share/nginx/html/config.yml" \
  -v "$(pwd)/background.jpg:/usr/share/nginx/html/background.jpg" \
  --name ditdashdot \
  sluberskihomelab/ditdashdot:latest
```

To edit your config.yml and background.jpg files, 
Exec into the docker container
```bash
docker exec doashboard bash
```
Navigate to /usr/share/nginx/html \
You will find the config files there.
#### Custom directory ***Reccomended***
If you want to list a custom directory for your config.yml or background.jpg files for whatever reason, you can do so with the docker run below.
```bash
docker run -d \
  -p 80:80 \
  -v "/path/to/your/config.yml:/usr/share/nginx/html/config.yml" \
  -v "/path/to/ypur/background.jpg:/usr/share/nginx/html/background.jpg" \
  --name ditdashdot \
  sluberskihomelab/ditdashdot:latest
```

3. Open your browser and navigate to `http://localhost:80` to view your dashboard.

### Quick Start (Docker Compose)

1. Clone the repository:
   ```bash
   git clone https://github.com/SluberskiHomeLab/ditdashdot.git
   cd ditdashdot
   ```

   Or create a docker-compose.yml file in your preferred directory using the below code.
   ```yml
   services:
     dashboard:
       image: sluberskihomelab/ditdashdot:latest
       ports:
         - "80:80"
       volumes:
         - /path/to/your/config.yml:/usr/share/nginx/html/config.yml
         - /path/to/ypur/background.jpg:/usr/share/nginx/html/background.jpg
       restart: always
   ```
   
2. Start the service:

   ```bash
   docker-compose up -d
   ```

4. Open your browser and navigate to `http://localhost:80` to view your dashboard.

## Configuration

Configuration is designed to be straightforward. 

#### config.yml

Config.yml is the primary configuration file for the dashboard.  This is where the services configuration is layed out.  I have included a sample config.yml file in this repo.  Place this config in the root of the project folder.  

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
mode: dark_mode #Cards are dark grey, Text is white
```
```yml
mode: light_mode #Cards are white, Text is black
```
```yml
mode: trans_light #Cards are transparent, Text is black
```
```yml
mode: trans_dark #Cards are transparent, Text is white
```

##### Show Details
Show Details will either show or hide information like ip address and port on the card.

```yml
show_details: true #This will show ip address and port on the card
```
```yml
show_details: false #This will hide the ip address and port on the card
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

#### Background Image

If you wish to use a different image for the background of your dashboard, replace the background.jpg file with your own. This must be a jpg image at the moment since the code specifically looks for the .jpg file extension.

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
