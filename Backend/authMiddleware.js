
const jwt = require("jsonwebtoken"); // JWT tokens
require('dotenv').config(); // Load variables from .env file

//------------------------------------------------------//
// Middleware function to check if the user's token is authorized 
const checkAuth = (req, res, next) => {
    try {
        // Retrieve authorization header from incoming request
        const authHeader = req.headers.authorization;

        // Check authorization header missing
        if (!authHeader) {
            return res.status(401).json({ message: "Authorization header missing" });
        }

        // Split authorization header to extract token
        const token = authHeader.split(" ")[1];

        // Check if token missing
        if (!token) {
            return res.status(401).json({ message: "Token missing" });
        }

        // Verify token using JWT and secret key stored in env
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach decoded token data to request object
        req.user = decoded;

        // Call next middleware or route handler
        next(); 
    } catch (error) {
        // If the token is invalid or expired, send a 401 Unauthorized response with an error message
        res.status(401).json({
            message: "Token invalid or expired", // Message for the client
            error: error.message,  // Detailed error message from JWT verification
        });
    }
};
//------------------------------------------------------//

// Export the checkAuth function to be used in other parts of the application
module.exports = checkAuth;

//--------------------------END OF FILE----------------------------//
