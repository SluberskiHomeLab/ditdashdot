# ditdashdot

**ditdashdot** is a simple, clean, and easy-to-configure services dashboard designed specifically for homelabs. Built with React.js and containerized with Docker, it provides a central hub to view and manage your homelab services.

***THIS IS A WORK IN PROGRESS AND IS FAR FROM COMPLETE! THIS IS IN DEVELOPMENT SO USE AT YOUR OWN RISK***
***THERE IS NO REGISTRY ENTRY AS OF YET.  ONCE RELASE 1.0 IS OUT, I WILL CREATE A REGISTRY ENTRY***
## Features

- Simple and intuitive dashboard interface
- Built with React.js for a fast and modern web experience
- Runs in Docker for easy deployment and management
- Clean design focused on usability
- Easily configurable to fit your homelab setup
- Yaml file uploads vs pointing to a directory

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/) installed on your host machine
- [Docker Compose](https://docs.docker.com/compose/) (optional, for Compose setup)

### Quick Start (Docker)

1. Clone the repository:
   ```bash
   git clone https://github.com/SluberskiHomeLab/ditdashdot.git
   cd ditdashdot
   ```

2. Build and run the container:
   ```bash
   docker build -t ditdashdot .
   docker run -d -p 80:80 ditdashdot
   ```

3. Open your browser and navigate to `http://localhost:80` to view your dashboard.

### Quick Start (Docker Compose)

1. Clone the repository:
   ```bash
   git clone https://github.com/SluberskiHomeLab/ditdashdot.git
   cd ditdashdot
   ```

2. Start the services:

   ```bash
   docker-compose up --build -d
   ```

3. Open your browser and navigate to `http://localhost:80` to view your dashboard.

## Configuration

Configuration is designed to be straightforward. Additional documentation can be found below.

## Technologies Used

- JavaScript (React.js)
- Docker
- HTML

## Contributing

Contributions are welcome! Feel free to submit issues or pull requests to improve the project.

## License

This project is licensed under the [MIT License](LICENSE).
