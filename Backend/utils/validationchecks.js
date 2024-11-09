/**
 * The ValidationChecks class contains a set of static methods used to validate various user inputs.
 * These methods ensure that the inputs conform to predefined formats and restrictions, and they help 
 * prevent security risks such as SQL injection and invalid data entry.
 * 
 * The class includes validation methods for:
 * - Name: Only allows alphabetic characters and spaces (1-50 characters).
 * - Username: Accepts any characters within the 3-20 character range.
 * - Email: Validates basic email format.
 * - ID Number: Ensures the ID follows the South African 13-digit format.
 * - Account Number: Ensures alphanumeric values between 5-20 characters.
 * - Amount: Ensures the value is a positive number.
 * - SWIFT Code: Validates an 8-11 character alphanumeric SWIFT code.
 * 
 * The class also includes a method `validateAgainstBlacklist` that checks input for potentially harmful 
 * characters like SQL injection attempts, scripts, or other attack vectors.
 * 
 * These validation checks ensure data integrity, security, and proper formatting before data is used in
 * the application.
 */



class ValidationChecks {
    // Validates that the name contains only letters and spaces, with a length between 1 and 50 characters
    static validateName(name) {
        const nameRegex = /^[a-zA-Z\s]{1,50}$/;
        if (!nameRegex.test(name)) {
            return false;
        }
        return this.validateAgainstBlacklist(name);
    }

    // Validates that the username is between 3 and 20 characters, allowing any characters
    static validateUsername(username) {
        const usernameRegex = /^.{3,20}$/;
        if (!usernameRegex.test(username)) {
            return false;
        }
        return this.validateAgainstBlacklist(username);
    }

    // Performs basic validation for email format
    static validateEmail(email) {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    }

    // Validates that the ID number follows the South African format (13 digits)
    static validateIDNumber(idNumber) {
        const idRegex = /^\d{13}$/;
        if (!idRegex.test(idNumber)) {
            return false;
        }
        return this.validateAgainstBlacklist(idNumber);
    }

    // Validates that the account number is alphanumeric and between 5 and 20 characters long
    static validateAccountNumber(accountNumber) {
        const accountNumberRegex = /^[a-zA-Z0-9]{5,20}$/;
        return accountNumberRegex.test(accountNumber);
    }
    
    // Ensures the amount is a positive number greater than zero
    static validateAmount(amount) {
        return amount > 0;
    }

    // Validates that the SWIFT code consists of 8 to 11 alphanumeric characters
    static validateSwiftCode(swiftCode) {
        const swiftCodeRegex = /^[A-Za-z0-9]{8,11}$/i;
        return swiftCodeRegex.test(swiftCode);
    }

    // Ensures input does not contain potentially harmful characters to prevent SQL injection or other attacks
    static validateAgainstBlacklist(input) {
        const blacklistRegex = /[`<>;"'(){}[\]]/;  
        return !blacklistRegex.test(input);  
    }
}

module.exports = ValidationChecks;
