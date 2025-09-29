FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy source code
COPY . .

# Expose the API port
EXPOSE 3001

# Start the API server
CMD ["node", "index.js"]
