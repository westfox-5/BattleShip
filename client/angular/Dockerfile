# Stage 1: Compile and Build angular codebase

# Use official node image as the base image
FROM node:18-bullseye-slim as build

# Set the working directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./

# Clean install production deps
RUN npm install

# Bundle app source
COPY . .

# Generate the build of the application
CMD [ "npm", "run", "start" ]