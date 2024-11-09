// Import modules
const mongoose = require('mongoose'); // MongoDB
const dotenv = require('dotenv'); // Load environment variables from .env

// Load environment variables from .env file
dotenv.config();

// Get MongoDB connection string from env or set to an empty string if not found
const connectionString = process.env.MONGO_URI || "";

if (!connectionString) {
    console.error('MongoDB URI is not set in .env file.');
    process.exit(1); // Exit if MONGO_URI is not provided
}

// Log the connection string for debugging (avoid in production)
console.log("MongoDB connection String:", connectionString);

// Connect to the database
const connectToDatabase = async () => {
    try {
        // Connect to MongoDB using Mongoose with the provided connection string
        await mongoose.connect(connectionString, {
            useNewUrlParser: true, // Optional for newer versions of Mongoose
            useUnifiedTopology: true, // Optional for newer versions of Mongoose
        });
        console.log('MongoDB is connected'); // Log success message when connected
        
    } catch (e) {
        // If there’s an error connecting, log the error and stop execution
        console.error('Database Connection error:', e);
        throw e; // Re-throw the error to ensure the process halts on failure
    }
};

// Export the connectToDatabase function to be used in other parts of the application
module.exports = { connectToDatabase };
