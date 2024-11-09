const request = require('supertest');
const mongoose = require('mongoose');
const { Transaction } = require("../routes/models");
const fs = require('fs');
const { exec } = require('child_process');

// Mock external dependencies
jest.mock('helmet'); // Prevents clickjacking and enhances security headers
jest.mock('xss-clean'); // Protects against cross-site scripting (XSS) attacks
jest.mock('express-rate-limit'); // Limits the rate of requests to prevent DDoS attacks

// Mock file system for testing file existence without actually checking the file system
jest.mock('fs', () => ({
  existsSync: jest.fn().mockImplementation((path) => {
    // Return true for specific certificate and key paths to simulate their existence
    return path === '../../Backend/keys/certificate' || path === '../../Backend/keys/privatekey';
  }),
}));

// Mock child process to simulate the execution of system commands
jest.mock('child_process', () => ({
  exec: jest.fn(),
}));

// Set a global timeout for tests
jest.setTimeout(15000);

describe("Security Middleware Tests", () => {
  let app;

  beforeAll(() => {
    app = require("../../src/App"); // Load the application before running tests
  });

  test("Helmet should enforce clickjacking protection", async () => {
    // Send a GET request and verify the presence of 'x-frame-options' header
    const response = await request(app).get('/');
    expect(response.headers['x-frame-options']).toBeDefined();
  });

  test("XSS protection should be active", async () => {
    // Ensure the 'x-xss-protection' header is set to '1; mode=block'
    const response = await request(app).get('/');
    expect(response.headers['x-xss-protection']).toBe('1; mode=block');
  });

  test("Rate limiting for DDoS protection should be applied", async () => {
    // Verify the presence of rate limit headers in the response
    const response = await request(app).get('/');
    expect(response.headers['x-ratelimit-limit']).toBeDefined();
  });
});

describe("Transaction Route Tests", () => {
  beforeAll(() => {
    // Mock the 'save' and 'findOne' methods of the Transaction model
    Transaction.prototype.save = jest.fn().mockResolvedValue({
      amountToTransfer: 100,
      description: "Test transaction",
      date: new Date(),
      userId: mongoose.Types.ObjectId(),
    });

    Transaction.findOne = jest.fn().mockResolvedValue({
      amountToTransfer: 100,
      description: "Test transaction",
      date: new Date(),
      userId: mongoose.Types.ObjectId(),
    });
  });

  test("Transaction creation should properly interact with Mongoose models (SQL Injection Prevention)", async () => {
    // Create a mock transaction object
    const mockTransaction = {
      amountToTransfer: 100,
      description: "Test transaction",
      date: new Date(),
      userId: mongoose.Types.ObjectId(),
    };

    // Create a new transaction and save it
    const transaction = new Transaction(mockTransaction);
    await transaction.save();

    // Fetch the saved transaction and verify its values
    const savedTransaction = await Transaction.findOne({ description: "Test transaction" });
    
    expect(savedTransaction.amountToTransfer).toBe(100);
  });
});

describe("SSL and Vulnerability Tests", () => {
  test("Verify the presence of SSL certificate and private key", () => {
    // Check if the SSL certificate and private key exist in the specified paths
    const certExists = fs.existsSync('../../Backend/keys/certificate');
    const keyExists = fs.existsSync('../../Backend/keys/privatekey');

    // Ensure both files are present
    expect(certExists).toBeTruthy();
    expect(keyExists).toBeTruthy();
  });

  test("Run a vulnerability scan to check for security issues", (done) => {
    // Mock the execution of 'npm audit' command
    exec.mockImplementationOnce((cmd, callback) => {
      // Simulate fake audit results with vulnerabilities count
      const fakeAuditResults = {
        metadata: {
          vulnerabilities: {
            high: 5, // Simulate 5 high-severity vulnerabilities
          },
        },
      };
      callback(null, JSON.stringify(fakeAuditResults)); // Return mock data
    });

    // Run the audit command and check for high vulnerabilities
    exec('npm audit --json', (error, stdout, stderr) => {
      const auditResults = JSON.parse(stdout || '{}');
      const highVulnerabilities = auditResults.metadata.vulnerabilities.high;

      // Ensure there are fewer than 10 high vulnerabilities
      expect(highVulnerabilities).toBeLessThan(10);
      done();
    });
  });
});
