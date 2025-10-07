<img width="1900" height="947" alt="Screenshot 2025-08-21 at 10-31-25 Homelab Dashboard" src="https://github.com/user-attachments/assets/5398a7e6-40f5-4a7a-a37c-a70897ab3df4" />

# DitDashDot

**DitDashDot** is a modern, feature-rich homelab dashboard that provides a centralized hub for monitoring and accessing your services. Built with React.js and powered by a robust Node.js backend, it offers an intuitive interface for managing complex homelab environments with advanced widgets, multi-page support, and comprehensive customization options.

*🚀 Version 2.2  is now available with comprehensive widgets system! *

*Partially Vibe-Coded*

## ✨ Features

### 🎛️ Core Dashboard Features
- **Multi-Page Support**: Organize services across multiple pages with seamless navigation
- **Collapsible Navigation Menu**: Hamburger menu with page switching and clean URL routing
- **Real-Time Service Monitoring**: TCP-based health checks with visual status indicators
- **Advanced Search**: Instant filtering across all services and pages
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

### 📊 Comprehensive Widgets System
- **Weather Widget**: Real-time weather conditions with OpenWeatherMap integration
  - Current temperature, humidity, wind speed
  - Weather icons and detailed forecasts
  - Configurable units (metric/imperial) and locations
- **Sun Position Widget**: Solar tracking with sunrise/sunset times
  - Daylight duration calculation
  - Real-time progress bars showing day/night status
  - Configurable latitude/longitude coordinates
- **Date/Time Widget**: Customizable clock and calendar display
  - Horizontal layout with time-first prominence
  - Configurable timezones, formats, and greeting messages
  - Real-time updates with compact 12pt font design

### 🛠️ Configuration & Management
- **Intuitive Web Interface**: Complete dashboard configuration at `/config`
- **JSON Configuration Editor**: Advanced widget settings with real-time validation
- **CRUD Operations**: Full Create, Read, Update, Delete for all components
- **Live Preview**: See changes instantly without restarts
- **Import/Export**: Backup and restore configurations easily

### 🎨 Appearance & Theming
- **Multiple Theme Modes**:
  - Light Mode - Clean and bright interface
  - Dark Mode - Easy on the eyes for 24/7 monitoring
  - Transparent Light/Dark - Overlay your custom backgrounds
  - Service Status Mode - Color-coded based on service health
- **Custom Styling**: Fonts, sizes, colors, and backgrounds
- **Flexible Layout**: Configurable widget positioning and sizing
- **Brand Customization**: Custom favicons, titles, and branding

### 🔧 Service Management
- **Flexible Service Configuration**: Optional IP/port fields for diverse service types
- **Group Organization**: Logical categorization with drag-and-drop ordering
- **Icon Support**: Custom icons for services and quick-access toolbar
- **Health Monitoring**: Automated ping checks with customizable intervals
- **Service Cards**: Rich information display with status indicators

## 🚀 Getting Started

### Prerequisites

- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) v2+
- 512MB+ available RAM
- Modern web browser (Chrome, Firefox, Safari, Edge)

### 📦 Quick Deployment

**\Docker Compose (Recommended)**

1. Create your project directory:
   ```bash
   mkdir ditdashdot && cd ditdashdot
   ```

2. Download the production-ready docker-compose.yml:
   ```bash
   curl -O https://raw.githubusercontent.com/SluberskiHomeLab/ditdashdot/main/docker-compose.yml
   ```

3. Launch your dashboard:
   ```bash
   docker compose up -d
   ```


### 🎯 Access Your Dashboard

After deployment, access your services at:
- **Main Dashboard**: http://localhost (or your server's IP)
- **Configuration Interface**: http://localhost/config
- **API Documentation**: http://localhost:3001/api

The system automatically creates:
- PostgreSQL database with persistent storage
- Default "Home" page ready for customization
- Sample configuration to get you started

### 🔧 First-Time Setup

1. **Navigate to Configuration**: Visit `/config` to begin setup
2. **Add Your Services**: Use the Services tab to add your homelab services
3. **Configure Widgets**: Set up weather, time, and solar widgets in the Widgets tab
4. **Customize Appearance**: Choose your theme and styling in General Settings
5. **Create Pages**: Organize services across multiple pages as needed

## ⚙️ Configuration

DitDashDot provides a powerful, intuitive web-based configuration interface that makes managing complex homelab setups effortless.

#### You can find Documentation about running and configuring DitDashDot in the Wiki

##### (Wiki)[https://github.com/SluberskiHomeLab/ditdashdot/wiki]

### 🔄 Configuration Best Practices

- **Regular Backups**: Export configurations before major changes
- **Environment Variables**: Use secrets for API keys in production
- **Testing**: Validate widget configurations in development first
- **Documentation**: Keep notes on custom configurations and API keys
- **Monitoring**: Check widget API quotas and service availability

## 🏗️ Architecture & Technologies

### **Frontend Stack**
- **React 18**: Modern hooks-based architecture with concurrent features
- **Material-UI v5**: Comprehensive component library with theming
- **React Router v6**: Client-side routing with clean URL patterns
- **Axios**: HTTP client with interceptors and error handling
- **CSS-in-JS**: Dynamic theming and responsive design

### **Backend Stack**
- **Node.js 18**: Modern JavaScript runtime with ES modules
- **Express.js**: Lightweight, fast web framework
- **PostgreSQL 14**: Enterprise-grade database with JSONB support
- **RESTful API**: Clean, predictable endpoint design
- **TCP Socket Health Checks**: Reliable service monitoring

### **Infrastructure & Deployment**
- **Docker Multi-Stage Builds**: Optimized production images
- **Nginx**: High-performance reverse proxy and static file serving
- **Docker Hub**: Official images with semantic versioning
- **Database Migrations**: Automated schema updates

### **Third-Party Integrations**
- **OpenWeatherMap API**: Real-time weather data
- **Sunrise-Sunset API**: Solar position calculations
- **Custom Icon Support**: External image hosting compatibility

## 🛠️ Development

### Local Development Setup

1. **Clone and prepare**:
   ```bash
   git clone https://github.com/SluberskiHomeLab/ditdashdot.git
   cd ditdashdot
   ```

2. **Development with Docker** (Recommended):
   ```bash
   docker compose up -d --build
   ```

3. **Native development**:
   ```bash
   # Frontend
   npm install
   npm start
   
   # Backend (separate terminal)
   cd server
   npm install
   npm run dev
   ```

### 🧪 Testing & Quality

- **ESLint**: Code quality and consistency
- **Prettier**: Automated code formatting
- **Docker Health Checks**: Container monitoring
- **API Testing**: Endpoint validation and error handling

## 🤝 Contributing

We welcome contributions from the homelab community! Here's how to get involved:

### 🐛 **Bug Reports**
- Use GitHub Issues with detailed reproduction steps
- Include environment details (Docker version, OS, browser)
- Attach logs and screenshots when applicable

### 💡 **Feature Requests**
- Describe the use case and expected behavior
- Consider backward compatibility
- Propose implementation approach if possible

### 🔧 **Pull Requests**
1. Fork the repository and create a feature branch
2. Follow existing code style and conventions
3. Test thoroughly in different environments
4. Update documentation and changelog
5. Submit PR with clear description

### 📋 **Development Guidelines**
- Keep changes focused and atomic
- Maintain backward compatibility when possible
- Follow semantic versioning for releases
- Write clear commit messages

## 📄 License

This project is licensed under the [MIT License](LICENSE) - see the file for details.

*Star ⭐ this repository if DitDashDot helps organize your homelab!*
