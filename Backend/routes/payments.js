// Import necessary modules
const express = require("express");
const { User, Account, Transaction } = require('./models');  // Import models (User, Account, Transaction)
const checkAuth = require('../authMiddleware');  // Import authentication middleware
const helmet = require("helmet");  // Import helmet for security headers
const validationchecks = require('../utils/validationchecks');  // Import validation utilities
const router = express.Router();  // Initialize the Express router

// Use helmet middleware for security headers
router.use(helmet());

//------------------------------------------------------//
// Route to handle international payment request
router.post('/internationalpayment', checkAuth, async (req, res) => {
    // Destructure necessary fields from the request body
    const { recipientName, recipientsBank, recipientsAccountNumber, amountToTransfer, swiftCode, transactionType, status } = req.body;

    // Validate inputs using validation utility functions
    if (!validationchecks.validateName(recipientName)) {
        return res.status(400).send({ error: "Invalid recipient name. It must contain only letters and be between 1 and 50 characters." });
    }
    if (!validationchecks.validateName(recipientsBank)) {
        return res.status(400).send({ error: "Invalid recipient bank. It must contain only letters and be between 1 and 50 characters." });
    }
    if (!validationchecks.validateAccountNumber(recipientsAccountNumber)) {
        return res.status(400).send({ error: "Invalid recipient account number." });
    }
    if (!validationchecks.validateAmount(amountToTransfer)) {
        return res.status(400).send({ error: "Invalid amount. It must be a positive number." });
    }
    if (!validationchecks.validateSwiftCode(swiftCode)) {
        return res.status(400).send({ error: "Invalid SWIFT code. It must be 8 or 11 alphanumeric characters." });
    }

    try {
        // Find the sender based on the authenticated user's ID from the token
        const sender = await User.findById(req.user.id);
        if (!sender) {
            return res.status(404).send({ error: "User not found" });
        }

        // Find the sender's account
        const senderAccount = await Account.findOne({ userId: sender._id });
        if (!senderAccount) {
            return res.status(404).send({ error: "Sender's account not found" });
        }

        // Check if the sender has sufficient balance for the transfer
        if (senderAccount.balance < amountToTransfer) {
            return res.status(400).send({ error: "Insufficient balance" });
        }

        // Deduct the amount from the sender's account
        senderAccount.balance -= amountToTransfer;
        await senderAccount.save();

        // Transaction logic (recipient part commented out)
        // const recipientAccount = await Account.findOne({ accountNumber: recipientsAccountNumber });
        // if (!recipientAccount) {
        //     return res.status(404).send({ error: "Recipient's account not found" });
        // }
        // recipientAccount.balance += amountToTransfer;
        // await recipientAccount.save();

        // Create a new transaction record in the database
        const transaction = new Transaction({
            userId: sender._id,  // Sender's user ID
            recipientName,
            recipientsBank,
            recipientsAccountNumber,
            amountToTransfer,
            swiftCode,
            transactionType,
            status,
            date: new Date()  // Current date
        });

        // Save the transaction
        await transaction.save();

        // Send response with the updated balance and transaction ID
        res.status(201).send({
            senderNewBalance: senderAccount.balance,
            transactionId: transaction._id  // Send back the transaction ID as a reference
        });
        console.log('Payment and transaction saved successfully');
    } catch (error) {
        console.error('Error processing payment:', error);
        res.status(400).send({ error: "Failed to process payment" });
    }
});
//------------------------------------------------------//

// Route to add balance to the user's account
router.post('/add-balance', checkAuth, async (req, res) => {
    const { amount } = req.body;

    // Validate amount
    if (!validationchecks.validateAmount(amount)) {
        return res.status(400).send({ error: "Invalid amount. Please enter a valid number." });
    }

    try {
        // Find the account for the authenticated user
        const account = await Account.findOne({ userId: req.user.id });
        if (!account) {
            return res.status(404).send({ error: "Account not found" });
        }

        // Add the specified amount to the user's balance
        account.balance += amount;
        await account.save();

        // Respond with the updated balance
        res.status(200).send({ message: "Balance updated successfully", newBalance: account.balance });
    } catch (error) {
        console.error('Error updating balance:', error);
        res.status(500).send({ error: "Failed to update balance" });
    }
});
//------------------------------------------------------//

// Route to fetch transaction history for the logged-in user
router.get('/transactions', checkAuth, async (req, res) => {
    try {
        // Find the user using the ID from the authentication token
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).send({ error: "User not found" });
        }

        // Fetch transactions related to the user, sorted by date in descending order
        const transactions = await Transaction.find({ userId: user._id }).sort({ date: -1 });
        res.status(200).json(transactions);  // Return the transactions in JSON format
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).send({ error: "Failed to fetch transactions" });
    }
});

// Route to update the status of a transaction (confirmed/denied/flagged)
router.put('/transaction/:id/status', checkAuth, async (req, res) => {
    const { id } = req.params;  // Get the transaction ID from the URL parameter
    const { status } = req.body;  // Get the new status from the request body

    // Validate the status input
    const validStatuses = ['confirmed', 'denied', 'flagged'];
    if (!validStatuses.includes(status)) {
        return res.status(400).send({ error: "Invalid status. Status must be one of: 'confirmed', 'denied', 'flagged'." });
    }

    try {
        // Find the transaction by ID
        const transaction = await Transaction.findById(id);
        if (!transaction) {
            return res.status(404).send({ error: "Transaction not found" });
        }

        // Update the transaction's status and save it
        transaction.status = status;
        await transaction.save();

        // Send response with the updated status
        res.status(200).send({ message: `Transaction status updated to ${status}` });
    } catch (error) {
        console.error('Error updating transaction status:', error);
        res.status(500).send({ error: "Failed to update transaction status" });
    }
});
//------------------------------------------------------//

// Route to fetch all transactions with a "pending" status
router.get('/transactions/pending', checkAuth, async (req, res) => {
    try {
        // Fetch transactions that have a 'Pending' status, sorted by date in descending order
        const transactions = await Transaction.find({ status: 'Pending' }).sort({ date: -1 });
        res.status(200).json(transactions);  // Return the pending transactions in JSON format
    } catch (error) {
        console.error('Error fetching pending transactions:', error);
        res.status(500).send({ error: "Failed to fetch pending transactions" });
    }
});
//------------------------------------------------------//

// Route to fetch all transactions, regardless of user ID
router.get('/transactions/all', checkAuth, async (req, res) => {
    try {
        // Fetch all transactions, sorted by date in descending order
        const transactions = await Transaction.find().sort({ date: -1 });
        res.status(200).json(transactions);  // Return all transactions in JSON format
    } catch (error) {
        console.error('Error fetching all transactions:', error);
        res.status(500).send({ error: "Failed to fetch all transactions" });
    }
});
//------------------------------------------------------//

// Export the router to be used in other parts of the application
module.exports = router;
//----------------------------------END OF FILE---------------------------//
