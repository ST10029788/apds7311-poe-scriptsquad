const express = require("express"); 
const bcrypt = require("bcrypt"); //Hashing passwords
const jwt = require("jsonwebtoken"); //JSON Web Tokens
const rateLimit = require("express-rate-limit"); // Middleware for rate limiting requests
const ExpressBrute = require("express-brute"); // Middleware to prevent brute force attacks
const { User, Account, Employee, Admin, Manager } = require('./models'); // Import models for User, Account, etc.
const checkAuth = require("../authMiddleware"); // Middleware to check authentication
require('dotenv').config(); // Load env
const validationchecks = require('../utils/validationchecks'); // Utility functions for validation
const helmet = require("helmet"); // Middleware for securing HTTP headers
const checkRole = require('../RoleMiddleware/roleMiddleware'); // Middleware to check user roles
const express = require("express"); // Required to initialize router

const router = express.Router(); // Initialize router for handling routes
router.use(helmet()); // Use Helmet to secure headers
const store = new ExpressBrute.MemoryStore(); // Store for brute-force attempts tracking
//const bruteforce = new ExpressBrute(store); // Initialize brute-force prevention (not currently in use)

// Rate limiting for registration and login to prevent abuse
const registrationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Max 5 attempts
    message: "Too many registration attempts, please try again later." // Error message
});

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Max 10 attempts
    message: "Too many login attempts, please try again later." // Error message
});

// Brute force prevention settings
const bruteforce = new ExpressBrute(store, 
    {
        freeRetries: 5, // Number of free retries before applying rate-limiting
        minWait: 5 * 60 * 1000, // 5 minutes before retrying after failed attempts
        maxWait: 15 * 60 * 1000 // Max 15 minutes wait time
    }
);

//------------------------------------------------------//
// Registration route (POST /register)
const validatePassword = (password) => {
    const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/; // Password validation: 8+ characters, letters, numbers, special chars
    return passwordPattern.test(password);
};

router.post('/register', registrationLimiter, bruteforce.prevent, async (req, res) => {
    const { firstName, lastName, email, username, password, idNumber, role } = req.body;
    
    // Validate password
    if (!validatePassword(password)) {
        return res.status(400).send({ error: "Password must be at a minimum of 8 characters long and contain both letters and numbers." });
    }

    // Validate input fields using utility functions
    if (!validationchecks.validateName(firstName) || !validationchecks.validateName(lastName)) {
        return res.status(400).send({ error: "Invalid first or last name. Only letters can be used." });
    }
    if (!validationchecks.validateEmail(email)) {
        return res.status(400).send({ error: "Invalid email format." });
    }
    if (!validationchecks.validateUsername(username)) {
        return res.status(400).send({ error: "Invalid username. Use only 3 to 20 alphanumeric characters." });
    }
    if (!validationchecks.validateIDNumber(idNumber)) {
        return res.status(400).send({ error: "Invalid South African ID number. Must be 13 digits." });
    }

    try {
        const crypto = require('crypto');

        // Securely generate a random account number with a fixed length
        const generateAccountNumber = () => {
            const randomNumber = crypto.randomInt(1000000000, 9999999999); // Generates a secure random 10-digit number
            return 'AC' + randomNumber.toString();
        };
        
        const accountNumber = generateAccountNumber();
        console.log(accountNumber); // Example output: 'AC1234567890'
        
        // Hash the password before saving
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const user = new User({ 
            firstName, 
            lastName, 
            email, 
            username, 
            password: hashedPassword, 
            idNumber,
            role: role || "user" // Default role is "user"
        });
        
        const savedUser = await user.save(); // Save user to the database

        // Create account linked to user
        const account = new Account({
            userId: savedUser._id,
            accountNumber,
            balance: 0.0 // Default balance
        });

        const savedAccount = await account.save(); // Save account to the database

        res.status(201).send({ user: savedUser, account: savedAccount });
    } catch (error) {
        console.error('Error saving user or creating account:', error);
        res.status(400).send({ error: "Failed to register user or create account" });
    }
});

//------------------------------------------------------//

// Login route (POST /login)
router.post('/login', loginLimiter, bruteforce.prevent, async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find user by username
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).send({ error: "Invalid username or password" });
        }

        // Compare provided password with stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).send({ error: "Invalid username or password" });
        }

        // Generate a JWT for the user, including their role in the payload
        const token = jwt.sign(
            { 
                id: user._id, 
                username: user.username,
                role: user.role 
            }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' } // Token expires in 1 hour
        );

        // Fetch the user's account information
        const account = await Account.findOne({ userId: user._id });

        // Send the response with user info, account details, and JWT
        res.status(200).send({ token, user: { id: user._id, username: user.username, role: user.role }, account });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).send({ error: "Internal server error" });
    }
});

//------------------------------------------------------//

// Protected route to fetch user data (GET /getUser)
router.get('/getUser', checkAuth, async (req, res) => {
    try {
        const userId = req.user.id; // Get user ID from the verified token
        const user = await User.findById(userId).select('-password'); // Exclude password
        const account = await Account.findOne({ userId: user._id });

        if (!user || !account) {
            return res.status(404).send({ error: "User or account not found" });
        }

        res.status(200).send({
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                username: user.username,
                idNumber: user.idNumber,
            },
            account: {
                accountNumber: account.accountNumber,
                balance: account.balance,
            }
        });
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).send({ error: "Failed to retrieve user data" });
    }
});

// Create Employee route (POST /createEmployee) - Admin/Manager only
router.post('/createEmployee', checkAuth, checkRole(['admin', 'manager']), async (req, res) => {
    const { firstName, lastName, email, username, password, idNumber, role } = req.body;

    // Simple role validation before creating employee
    if (role && !['admin', 'manager', 'employee'].includes(role)) {
        return res.status(400).send({ error: "Invalid role specified" });
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const employee = new Employee({
            firstName,
            lastName,
            email,
            username,
            password: hashedPassword,
            idNumber,
            role
        });

        const savedEmployee = await employee.save(); // Save employee to the database
        res.status(201).send({ user: savedEmployee });
    } catch (error) {
        console.error('Error saving employee:', error);
        res.status(400).send({ error: "Failed to register employee" });
    }
});

// Create Admin route (POST /createAdmin) - Admin only
router.post('/createAdmin', checkAuth, checkRole(['admin']), async (req, res) => {
    const { firstName, lastName, email, username, password, idNumber } = req.body;

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const admin = new Admin({
            firstName,
            lastName,
            email,
            username,
            password: hashedPassword,
            idNumber,
        });

        const savedAdmin = await admin.save(); // Save admin to the database
        res.status(201).send({ admin: savedAdmin });
    } catch (error) {
        console.error('Error creating admin:', error);
        res.status(400).send({ error: "Failed to create admin" });
    }
});

// Create Manager route (POST /createManager) - Admin only
router.post('/createManager', checkAuth, checkRole(['admin']), async (req, res) => {
    const { firstName, lastName, email, username, password, idNumber } = req.body;

    // Validate role before creating manager
    if (role && !['admin', 'manager', 'employee'].includes(role)) {
        return res.status(400).send({ error: "Invalid role specified" });
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const manager = new Manager({
            firstName,
            lastName,
            email,
            username,
            password: hashedPassword,
            idNumber
        });

        const savedManager = await manager.save(); // Save manager to the database
        res.status(201).send({ manager: savedManager });
    } catch (error) {
        console.error('Error creating manager:', error);
        res.status(400).send({ error: "Failed to create manager" });
    }
});

module.exports = router; // Export the router
//---------------------------------END OF FILE------------------------------//
