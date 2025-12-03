/**
 * Password Utility Functions for Healthcare Appointment Booking System
 * 
 * @file src/utils/passwordUtils.js
 * @description Handles password hashing, verification, and strength validation
 * 
 * Security Features:
 * - bcrypt for secure password hashing
 * - Salt rounds configuration
 * - Password strength validation
 * - Secure comparison timing
 * 
 * @version 2.0.0
 * @module PasswordUtils
 */

import bcrypt from 'bcryptjs';

/**
 * Hash a plain text password
 * 
 * @param {string} password - Plain text password to hash
 * @returns {Promise<string>} Hashed password
 * @throws {Error} If hashing fails
 */
export const hashPassword = async (password) => {
    try {
        if (!password || typeof password !== 'string') {
            throw new Error('Password must be a non-empty string');
        }

        const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        return hashedPassword;
    } catch (error) {
        console.error('Password hashing error:', error);
        throw new Error('Failed to hash password');
    }
};

/**
 * Verify a password against its hash
 * 
 * @param {string} password - Plain text password to verify
 * @param {string} hashedPassword - Hashed password to compare against
 * @returns {Promise<boolean>} True if password matches, false otherwise
 * @throws {Error} If verification fails
 */
export const verifyPassword = async (password, hashedPassword) => {
    try {
        if (!password || !hashedPassword) {
            return false;
        }

        const isMatch = await bcrypt.compare(password, hashedPassword);
        return isMatch;
    } catch (error) {
        console.error('Password verification error:', error);
        throw new Error('Failed to verify password');
    }
};

/**
 * Validate password strength
 * 
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with score and feedback
 */
export const validatePasswordStrength = (password) => {
    const result = {
        isValid: false,
        score: 0,
        feedback: [],
        strength: 'very weak'
    };

    if (!password || password.length < 8) {
        result.feedback.push('Password must be at least 8 characters long');
        return result;
    }

    let score = 0;

    // Length check
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;

    // Character variety checks
    if (/[a-z]/.test(password)) score += 1; // lowercase
    if (/[A-Z]/.test(password)) score += 1; // uppercase
    if (/[0-9]/.test(password)) score += 1; // numbers
    if (/[^A-Za-z0-9]/.test(password)) score += 1; // special characters

    // Pattern checks (negative scoring)
    if (/(.)\1{2,}/.test(password)) {
        score -= 1; // repeated characters
        result.feedback.push('Avoid repeated characters');
    }

    if (/12345|qwerty|password/i.test(password)) {
        score -= 2; // common patterns
        result.feedback.push('Avoid common patterns and dictionary words');
    }

    // Determine strength level
    if (score >= 6) {
        result.strength = 'strong';
        result.isValid = true;
    } else if (score >= 4) {
        result.strength = 'medium';
        result.isValid = true;
        result.feedback.push('Consider adding more character variety for stronger security');
    } else if (score >= 2) {
        result.strength = 'weak';
        result.feedback.push('Password is weak. Add uppercase letters, numbers, or special characters');
    } else {
        result.strength = 'very weak';
        result.feedback.push('Password is very weak. Use a longer password with more character variety');
    }

    result.score = score;

    return result;
};

/**
 * Generate a random temporary password
 * 
 * @param {number} length - Length of the password (default: 12)
 * @returns {string} Generated password
 */
export const generateTemporaryPassword = (length = 12) => {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';

    // Ensure at least one of each character type
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // uppercase
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // lowercase
    password += '0123456789'[Math.floor(Math.random() * 10)]; // number
    password += '!@#$%^&*'[Math.floor(Math.random() * 8)]; // special character

    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
        password += charset[Math.floor(Math.random() * charset.length)];
    }

    // Shuffle the password
    password = password.split('').sort(() => 0.5 - Math.random()).join('');

    return password;
};

export default {
    hashPassword,
    verifyPassword,
    validatePasswordStrength,
    generateTemporaryPassword
};