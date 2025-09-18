# Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Show Node.js and npm versions for debugging
RUN node -v && npm -v

# Copy package files
COPY package*.json ./

# Install dependencies with verbose logging
RUN npm install --verbose

# Set environment for React build
ENV NODE_ENV=production
ENV CI=false
ENV GENERATE_SOURCEMAP=false
ENV PUBLIC_URL=/

# Copy source code
COPY . .

# List files for debugging
RUN ls -la

# Build the application with verbose output
RUN npm run build || (echo "Build failed" && ls -la && exit 1)

# Production stage
FROM nginx:alpine

# Copy the build output from builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# No config files needed as we're using PostgreSQL now

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]