# Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Create directory for configuration files
RUN mkdir -p /usr/share/nginx/html/config

# Copy the build output from builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy default configuration files
COPY config.yml /usr/share/nginx/html/config.yml
COPY barconfig.yml /usr/share/nginx/html/barconfig.yml

# Create volume mount points
VOLUME ["/usr/share/nginx/html/config.yml", "/usr/share/nginx/html/barconfig.yml"]

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]