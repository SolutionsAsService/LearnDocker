const express = require('express');
const mysql = require('mysql');

// Create an instance of Express
const app = express();
const port = 8080;

// Create a connection to the MySQL database
const db = mysql.createConnection({
  host: process.env.MYSQL_HOST,  // MySQL host (defined in docker-compose.yml)
  user: process.env.MYSQL_USER,  // MySQL user (defined in docker-compose.yml)
  password: process.env.MYSQL_PASSWORD,  // MySQL password (defined in docker-compose.yml)
  database: process.env.MYSQL_DB  // MySQL database name (defined in docker-compose.yml)
});

// Connect to the database
db.connect((err) => {
  if (err) throw err;
  console.log('Connected to the MySQL database!');
});

// Define a route for fetching users
app.get('/', (req, res) => {
  db.query('SELECT * FROM users', (err, results) => {
    if (err) throw err;
    res.json(results);  // Send the query results as JSON
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Node.js app listening at http://localhost:${port}`);
});
