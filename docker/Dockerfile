#  Base image: node + npm
FROM node:20-slim

# cd /app (makedir too if nonexistent)
WORKDIR /app

# Copy package(-lock).json (for layer caching)
COPY ../package*.json ./

# Install dependencies via package(-lock).json
RUN npm install

# Copy source code over
COPY ../ ./

# Expose port 3000 on image run
EXPOSE 3000

# Run server with "npm start" terminal CMD
CMD ["npm", "start"]