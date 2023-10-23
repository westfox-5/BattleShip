FROM node:21.0.0-bullseye-slim

# Create app directory and assign to node user
RUN mkdir /app && chown -R node:node /app
WORKDIR /app

# Switch to node user
USER node

# Install app dependencies
COPY package*.json ./

# clean install production deps
RUN npm ci --only=production && npm cache clean --force

# Bundle app source
COPY . .

EXPOSE 8080

CMD [ "npm", "run", "start" ]
