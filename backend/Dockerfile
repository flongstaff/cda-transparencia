# Use the official Node.js runtime as the base image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY backend/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy the rest of the backend code
COPY backend/ .

# Expose the port the app runs on
EXPOSE 8080

# Define the command to run the application
CMD ["node", "server.js"]