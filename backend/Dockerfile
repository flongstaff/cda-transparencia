FROM node:18-alpine

# Create app directory
WORKDIR /app

# Create data directory and set permissions
RUN mkdir -p /app/data /app/logs
RUN chmod 755 /app/data /app/logs

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY src/ ./src/

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership of app directory including data and logs
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3001

# Start the application
CMD ["node", "src/server.js"]