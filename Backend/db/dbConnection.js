// Import modules
const mongoose = require('mongoose'); // MongoDB
const dotenv = require('dotenv'); // Load environment variables from .env

// Load from .env f
dotenv.config();

// Get MongoDB connection string from env or set to an empty string if not found
const connectionString = process.env.MONGO_URI || "";

console.log("MongoDB Connection String:", connectionString); // Log the connection string for debugging 

// Connect to database
const connectToDatabase = async () => {
    try {
        // Connect to MongoDB using Mongoose with the provided connection string
        await mongoose.connect(connectionString, {
            useNewUrlParser: true, // Use the new MongoDB URL parser
            useUnifiedTopology: true, // Use the new topology engine for more stable connections
        });
        console.log('MongoDB IS CONNECTED'); // Log success message when connected
        
    } catch (e) {
        // If there’s an error connecting, log the error and throw it to stop the execution
        console.error('Database connection error:', e);
        throw e; // Re-throw the error to ensure the process halts on failure
    }
};

// Export the connectToDatabase function to be used in other parts of the application
module.exports = { connectToDatabase };
