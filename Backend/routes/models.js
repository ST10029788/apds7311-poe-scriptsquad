// Import mongoose to interact with MongoDB
const mongoose = require("mongoose");

// Schema for the Transaction model
const transactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the User who initiated the transaction
    recipientName: String, // Recipient's name
    recipientsBank: String, // Name of the recipient's bank
    recipientsAccountNumber: String, // Recipient's account number
    amountToTransfer: Number, // Amount to be transferred
    swiftCode: String, // SWIFT code for international transfers
    transactionType: String, // Type of transaction (e.g., deposit, withdrawal)
    status: String, // Status of the transaction (e.g., pending, completed)
    date: { type: Date, default: Date.now } // Date of the transaction (defaults to the current date)
});

// Create the Transaction model using the transaction schema
const Transaction = mongoose.model('Transaction', transactionSchema);

// Schema for the User model
const UserSchema = new mongoose.Schema({
    firstName: { type: String, required: true }, // User's first name
    lastName: { type: String, required: true }, // User's last name
    email: { type: String, required: true, unique: true }, // User's email address (must be unique)
    username: { type: String, required: true, unique: true }, // Username (must be unique)
    password: { type: String, required: true }, // User's password
    accountNumber: { type: String }, // User's account number (optional)
    idNumber: { type: String, required: true }, // User's ID number
    role: { type: String, enum: ["user", "employee", "admin"], default: "user" } // Role of the user (default is 'user')
});

// Create the User model using the User schema
const User = mongoose.model('User', UserSchema);

// Schema for the Employee model
const EmployeeSchema = new mongoose.Schema({
    firstName: { type: String, required: true }, // Employee's first name
    lastName: { type: String, required: true }, // Employee's last name
    email: { type: String, required: true, unique: true }, // Employee's email (must be unique)
    username: { type: String, required: true, unique: true }, // Username (must be unique)
    password: { type: String, required: true }, // Employee's password
    idNumber: { type: String, required: true }, // Employee's ID number
    role: { 
        type: String, 
        enum: ["employee", "manager"], // Allowed roles for employee
        default: "employee" // Default role is 'employee'
    }
});

// Create the Employee model using the Employee schema
const Employee = mongoose.model('Employee', EmployeeSchema);

// Schema for the Account model
const AccountSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to the associated user
    balance: { type: Number, default: 0.0 }, // User's account balance (defaults to 0.0)
    accountNumber: { type: String, required: true } // Account number (required)
});

// Create the Account model using the Account schema
const Account = mongoose.model('Account', AccountSchema);

// Schema for the Admin model
const AdminSchema = new mongoose.Schema({
    firstName: { type: String, required: true }, // Admin's first name
    lastName: { type: String, required: true }, // Admin's last name
    email: { type: String, required: true, unique: true }, // Admin's email (must be unique)
    username: { type: String, required: true, unique: true }, // Username (must be unique)
    password: { type: String, required: true }, // Admin's password
    idNumber: { type: String, required: true }, // Admin's ID number
    role: { type: String, default: "admin" }  // Fixed role as 'admin'
});

// Create the Admin model using the Admin schema
const Admin = mongoose.model('Admin', AdminSchema);

// Schema for the Manager model
const ManagerSchema = new mongoose.Schema({
    firstName: { type: String, required: true }, // Manager's first name
    lastName: { type: String, required: true }, // Manager's last name
    email: { type: String, required: true, unique: true }, // Manager's email (must be unique)
    username: { type: String, required: true, unique: true }, // Username (must be unique)
    password: { type: String, required: true }, // Manager's password
    idNumber: { type: String, required: true }, // Manager's ID number
    role: { type: String, default: "manager" }  // Fixed role as 'manager'
});

// Create the Manager model using the Manager schema
const Manager = mongoose.model('Manager', ManagerSchema);

// Export all models to be used in other parts of the application
module.exports = { User, Account, Transaction, Employee, Admin, Manager };

//-------------------------------END OF FILE--------------------//
