
# International Payments Portal

## Table of Contents
1. [Group Members](#group-members)
2. [Project Overview](#project-overview)
3. [Technologies Used](#technologies-used)
4. [Features](#features)
5. [Security Measures](#security-measures)
6. [Getting Started](#getting-started)
7. [Installation Instructions](#installation-instructions)
8. [Troubleshooting](#troubleshooting)
9. [Additional Resources](#additional-resources)

---

## 1. Group Members
- **Katalika Lalla** (ST: ST10030992)
- **Kelisha Naidoo** (ST: ST10100775)
- **Aariya Singh** (ST: ST10029788)

---

## 2. Project Overview
The **International Payments Portal** provides a secure, user-friendly platform for processing international bank transactions. Customers can register, log in, and complete payments through a streamlined interface, while bank employees can review and approve transactions before they are securely processed via the SWIFT network. This system prioritizes both ease of use and robust security to facilitate reliable cross-border payments.

---

## 3. Technologies Used
- **Frontend**: React
- **Backend**: Node.js with Express
- **Database**: MongoDB

---

## 4. Features

### Customer Portal
- **User Registration**: Customers register with required details (full name, ID number, account number, and password) securely.
- **Login**: Customers can authenticate using their username, account number, and password.

### International Payment
- **Transaction Options**: Customers select the payment amount, currency, and provider (e.g., SWIFT).
- **Payee Details**: Required fields include payee’s account information and SWIFT code.
- **Finalization**: Customers review and finalize payment details to initiate a secure transaction.

### Employee Portal
- **Payment Verification**: Bank employees have a verification process for international payments, adding a layer of security.
- **Transaction Management**: Tools for employees to review, validate, and process transactions.

---

## 5. Security Measures
Security is a core aspect of the portal, encompassing the following:

- **Password Hashing**: Utilizes secure hashing and salting for password storage.
- **Brute-Force Protection**: Prevents unauthorized access with Express Brute for failed login attempts.
- **Input Validation**: Enforces input security with RegEx-based whitelisting, mitigating SQL injection and XSS risks.
- **SSL Encryption**: All communications are SSL-encrypted to secure data in transit.
- **Session Management**: Secured session handling prevents unauthorized access or session hijacking.

---

## 6. Getting Started

To set up the application locally, follow these preliminary steps:

### Browser Configuration for HTTPS Testing
1. Open **Google Chrome**.
2. Go to `chrome://flags/#allow-insecure-localhost`.
3. Enable "Allow invalid certificates for resources loaded from localhost" to bypass SSL warnings on localhost (only for testing).

### Required Tools
- **Visual Studio Code**: IDE for editing and managing code.
- **Node.js**: Required for backend server functionality.
- **MongoDB**: Database setup (either locally or via MongoDB Atlas).

---

## 7. Installation Instructions

### Step-by-Step Guide

1. **Clone the Repository**  
   ```bash
   git clone https://github.com/IIEWFL/apds7311-poe-scriptsquad.git
   ```

2. **Install Dependencies**  
   - **Backend**:  
     ```bash
     cd backend
     npm install
     ```
   - **Frontend**:  
     ```bash
     cd international-payments-portal
     npm install
     ```

3. **Configure Environment Variables**  
   - In the backend directory, create a `.env` file with necessary environment variables, such as database URIs and API keys.

4. **Start MongoDB**  
   - If using a local MongoDB instance, ensure it’s running; otherwise, verify your MongoDB Atlas connection.

5. **Run the Application**  
   - **Backend**:  
     ```bash
     cd backend
     npm start
     ```
   - **Frontend**:  
     ```bash
     cd frontend
     npm start
     ```

6. **Access the Application**  
   - **Frontend**: [http://localhost:3000](http://localhost:3000)
   - **Backend**: [http://localhost:3001](http://localhost:3001)

---

## 8. Troubleshooting

### Common Issues

1. **Invalid Port**: Ensure the backend runs on port 3001 and the frontend on port 3000.
2. **MongoDB Connection Errors**: Confirm MongoDB is active locally or check your MongoDB Atlas connection string.
3. **JWT Authentication Issues**: Confirm the token is properly included in the `Authorization` header (`Bearer <token>`).
4. **CORS Policy Errors**: Check CORS configurations in `server.js` to allow frontend-backend communication.
5. **Environment Variables Not Set**: Ensure that `.env` is correctly configured and loaded in your backend.

---

## 9. Additional Resources

- **Demo Video**: [Google Drive Link](https://drive.google.com/drive/folders/11AD3YWT0dndtYNnAnZRbUBEXp8TcqOZE?usp=sharing)  
- **React Documentation**: [React](https://reactjs.org/docs/getting-started.html)
- **Node.js Documentation**: [Node.js](https://nodejs.org/en/docs/)
- **MongoDB Documentation**: [MongoDB](https://docs.mongodb.com/)

For further assistance, please contact any of the group members listed in the [Group Members](#group-members) section.