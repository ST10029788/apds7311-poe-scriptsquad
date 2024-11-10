require('dotenv').config({ path: './Backend/.env' });

const express = require('express');
const cors = require('cors');
const https = require('https');
const fs = require('fs');
const app = express();
const PORT = 3001; // Port server will run on
const user = require("./routes/users"); // Import user route handler
const payment = require("./routes/payments"); // Import payment route handler
const { connectToDatabase } = require('./db/dbConnection'); // Import database connection 
const helmet = require('helmet'); // Helmet middleware for securing HTTP headers

// connect to database
connectToDatabase().catch(err => {
    console.error('Failed to connect to the database', err); // Log error if connection fails
    process.exit(1); // Exit application if the database connection fails
});

// Store SSL certificate and private key
let options;
try {
    options = {
        key: fs.readFileSync('keys/privatekey.pem'),  // Relative path
        cert: fs.readFileSync('keys/certificate.pem') // Relative path
    };
    
    
    console.log("Keys added"); // Log that the keys have been successfully loaded
} catch (error) {
    console.error('Error loading SSL certificate or key:', error); // Log error if the certificate or key cannot be loaded
    process.exit(1); // Exit the application if there’s an error loading the keys for security
}

// Set up middleware and routes
app.use(cors()); 
app.use(helmet()); // Add security headers to the HTTP response
app.use(express.json()); // Middleware 

// Define routes for user and payment
app.use('/users', user); // Route for user-related API endpoints
app.use('/payments', payment); // Route for payment-related API endpoints

// Create and start an HTTPS server with the provided options (SSL keys)
https.createServer(options, app).listen(PORT, () => {
    console.log(`Server is running on https://localhost:${PORT}`); // Log a message when the server starts successfully
});

