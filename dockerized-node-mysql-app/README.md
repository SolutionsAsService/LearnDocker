# Dockerized Node.js and MySQL Application

This is a simple project that demonstrates how to create a multi-container Dockerized web application with a Node.js backend and MySQL database.

## Project Structure

- **docker-compose.yml**: Defines the multi-container Docker setup (Node.js and MySQL).
- **node-app/Dockerfile**: Dockerfile for the Node.js application.
- **node-app/index.js**: Simple Express application that connects to MySQL and returns data.
- **db/init.sql**: Initializes the MySQL database with a `users` table and some sample data.

## Prerequisites

- Docker and Docker Compose installed on your system.

## How to Run

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/dockerized-node-mysql-app.git
   cd dockerized-node-mysql-app
