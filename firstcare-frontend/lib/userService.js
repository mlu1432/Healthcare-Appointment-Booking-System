// user service with environment-aware API base URL
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

/**
 * Healthcare User Service
 * Centralized API client for user-related operations with enhanced error handling
 * 
 * @version 2.0.0
 * @module userService
 */
export const userService = {
    /**
     * Get current authenticated user
     * 
     * @returns {Promise<Object>} User data response
     * @throws {Error} When API request fails
     */
    getCurrentUser: async () => {
        console.log(`Fetching user from: ${API_BASE}/api/users/me`);

        try {
            const response = await fetch(`${API_BASE}/api/users/me`, {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                cache: 'no-store'
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                    `Failed to fetch user: ${response.status} ${response.statusText}`,
                    { cause: errorData }
                );
            }

            const data = await response.json();
            console.log('User data fetched successfully:', data.user ? 'User found' : 'No user');
            return data;
        } catch (error) {
            console.error('User service error:', error.message);
            throw error;
        }
    },

    /**
     * Complete user profile setup
     * 
     * @param {Object} profileData - Profile completion data
     * @returns {Promise<Object>} Updated user data
     * @throws {Error} When API request fails
     */
    completeProfile: async (profileData) => {
        try {
            const response = await fetch(`${API_BASE}/api/users/profile/complete`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(profileData),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                    `Failed to complete profile: ${response.status} ${response.statusText}`,
                    { cause: errorData }
                );
            }

            return response.json();
        } catch (error) {
            console.error('Complete profile error:', error.message);
            throw error;
        }
    },

    /**
     * Update user medical profile
     * 
     * @param {Object} medicalData - Medical profile data
     * @returns {Promise<Object>} Updated medical profile
     * @throws {Error} When API request fails
     */
    updateMedicalProfile: async (medicalData) => {
        try {
            const response = await fetch(`${API_BASE}/api/users/profile/medical`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(medicalData),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                    `Failed to update medical profile: ${response.status} ${response.statusText}`,
                    { cause: errorData }
                );
            }

            return response.json();
        } catch (error) {
            console.error('Update medical profile error:', error.message);
            throw error;
        }
    },

    /**
     * Update general user profile
     * 
     * @param {string} userId - User ID
     * @param {Object} profileData - Profile data to update
     * @returns {Promise<Object>} Updated user data
     * @throws {Error} When API request fails
     */
    updateProfile: async (userId, profileData) => {
        try {
            const response = await fetch(`${API_BASE}/api/users/${userId}`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(profileData),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                    `Failed to update profile: ${response.status} ${response.statusText}`,
                    { cause: errorData }
                );
            }

            return response.json();
        } catch (error) {
            console.error('Update profile error:', error.message);
            throw error;
        }
    },

    /**
     * Get user by ID
     * 
     * @param {string} userId - User ID
     * @returns {Promise<Object>} User data
     * @throws {Error} When API request fails
     */
    getUserById: async (userId) => {
        try {
            const response = await fetch(`${API_BASE}/api/users/${userId}`, {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                    `Failed to fetch user: ${response.status} ${response.statusText}`,
                    { cause: errorData }
                );
            }

            return response.json();
        } catch (error) {
            console.error('Get user by ID error:', error.message);
            throw error;
        }
    },

    /**
     * Test backend connection
     * 
     * @returns {Promise<Object>} Health check response
     */
    testConnection: async () => {
        try {
            const response = await fetch(`${API_BASE}/api/health`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            return response.json();
        } catch (error) {
            console.error('Connection test error:', error.message);
            throw error;
        }
    },

    /**
     * Get API base URL (for debugging)
     * 
     * @returns {string} Current API base URL
     */
    getApiBaseUrl: () => API_BASE,

    /**
     * Check if running in production mode
     * 
     * @returns {boolean} True if production environment
     */
    isProduction: () => process.env.NEXT_PUBLIC_DEV_MODE === 'false' ||
        process.env.NODE_ENV === 'production'
};