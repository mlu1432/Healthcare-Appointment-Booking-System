/**
 * _utils/securityUtils.js
 * Password Strength Utility
 * @description Calculates password strength based on complexity
 * Scoring:
 *
 * - Length: 0-50 points
 * - Character variety: 0-30 points
 * - Special characters: 0-20 points
 *
 *   @param {string} password - Password to evaluate
 *   @returns {number} Strength percentage (0-100)
 */
export const getPasswordStrength = (password) => {
	if (!password) return 0;

	let strength = 0;

	// length score (max 50)
	strength += Math.min(password.length * 5, 50);

	// character variety (max30)
	if (/[A-Z]/.test(password)) strength += 10;
	if (/[a-z]/.test(password)) strength += 10;
	if (/[0-9]/.test(password)) strength += 10;

	// special characters (max 20)
	if (/[^A-Za-z0-9]/.test(password)) strength += 20;
		return Math.min(strength, 100);
};

export default { getPasswordStrength };
