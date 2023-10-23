# Stage 1: Compile and Build angular codebase

# Use official node image as the base image
FROM node:18-bullseye-slim as build

# Set the working directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./

# Clean install production deps
RUN npm ci && npm cache clean --force

# Bundle app source
COPY . .

# Generate the build of the application
RUN npm run build:production


# Stage 2: Serve app with nginx server

# Use official nginx image as the base image
FROM nginx:latest

# Copy the build output to replace the default nginx contents.
COPY --from=build /app/dist/BattleShip /usr/share/nginx/html

# Expose port 80
EXPOSE 80