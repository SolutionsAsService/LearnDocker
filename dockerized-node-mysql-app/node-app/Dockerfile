# Use official Node.js image from Docker Hub
FROM node:14

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install the dependencies defined in package.json
RUN npm install

# Copy the rest of the application
COPY . .

# Expose the port that the app will run on
EXPOSE 8080

# Command to run the app
CMD ["node", "index.js"]
