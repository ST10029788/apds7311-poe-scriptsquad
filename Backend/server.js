const express = require('express');
const cors = require('cors');
const https = require('https');
const fs = require('fs');
const app = express();
const PORT = 3001; // Port server will run on
const user = require("./routes/user"); // Import user route handler
const payment = require("./routes/payment"); // Import payment route handler
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
        key: fs.readFileSync('./keys/privatekey.pem'),     // Read the private key from a file
        cert: fs.readFileSync('./keys/certificate.pem')    // Read the SSL certificate from a file
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
app.use('/user', user); // Route for user-related API endpoints
app.route("/user", user); // Another definition of the user route
app.use('/payment', payment); // Route for payment-related API endpoints
app.route('/payment', payment); // Another definition of the payment route

// Create and start an HTTPS server with the provided options (SSL keys)
https.createServer(options, app).listen(PORT, () => {
    console.log(`Server is running on https://localhost:${PORT}`); // Log a message when the server starts successfully
});

//------------------------------------------END OF FILE-----------------------------------//