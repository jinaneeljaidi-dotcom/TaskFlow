# Builds the Node.js Express backend image for TaskFlow

# Use official Node LTS image as base
FROM node:20-alpine

# Set working directory inside the container
WORKDIR /app

# Copy dependency manifests first for better layer caching
COPY package*.json ./

# Install production dependencies only
RUN npm install --omit=dev

# Copy application source code
COPY . .

# Expose the API port
EXPOSE 5000

# Start the Express server
CMD ["node", "server.js"]
