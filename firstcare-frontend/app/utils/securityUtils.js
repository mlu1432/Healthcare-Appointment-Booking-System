/**
 * Security Utilities for Healthcare Appointment Booking System
 * 
 * @file app/utils/securityUtils.js
 * @description Password strength evaluation and security utilities
 * 
 * Scoring System:
 * - Length: 0-50 points
 * - Character variety: 0-30 points  
 * - Special characters: 0-20 points
 * 
 * @param {string} password - Password to evaluate
 * @returns {number} Strength percentage (0-100)
 */

/**
 * Calculate password strength based on complexity criteria
 */
export const getPasswordStrength = (password) => {
	if (!password) return 0;

	let strength = 0;

	// Length score (max 50 points)
	strength += Math.min(password.length * 5, 50);

	// Character variety (max 30 points)
	if (/[A-Z]/.test(password)) strength += 10;
	if (/[a-z]/.test(password)) strength += 10;
	if (/[0-9]/.test(password)) strength += 10;

	// Special characters (max 20 points)
	if (/[^A-Za-z0-9]/.test(password)) strength += 20;

	return Math.min(strength, 100);
};

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
};

/**
 * Check if password meets minimum requirements
 */
export const meetsPasswordRequirements = (password) => {
	if (!password || password.length < 8) return false;

	const hasUpperCase = /[A-Z]/.test(password);
	const hasLowerCase = /[a-z]/.test(password);
	const hasNumbers = /[0-9]/.test(password);
	const hasSpecialChar = /[^A-Za-z0-9]/.test(password);

	return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
};

export default { getPasswordStrength, isValidEmail, meetsPasswordRequirements };