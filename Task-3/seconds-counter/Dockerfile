# Use official Node.js LTS image
FROM node:18

# Set working directory inside container
WORKDIR /app

# Copy package.json (and package-lock.json if exists)
COPY package*.json ./

# Install dependencies (none here, but keeps Docker happy)
RUN npm install

# Copy the rest of the app
COPY . .

# Command to run your script
CMD ["node", "index.js"]
