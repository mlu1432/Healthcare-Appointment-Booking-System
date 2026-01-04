/**
 * Healthcare User Service - Enhanced with Smart Session Management
 * 
 * @file lib/userService.js
 * @description Centralized API client for user-related operations with intelligent
 * session handling and optimized error management
 * 
 * Key Features:
 * - Smart endpoint selection (verifies before fetching full profile)
 * - Comprehensive error recovery and fallback strategies
 * - Detailed logging for debugging
 * - Optimized for production deployment
 * 
 * @version 3.0.0
 * @module userService
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * Healthcare User Service
 */
export const userService = {
    /**
     * Get current authenticated user with smart session verification
     * 
     * Strategy:
     * 1. First check session via /api/auth/verify (doesn't require auth)
     * 2. If authenticated, fetch full profile via /api/auth/me
     * 3. Gracefully handle all error states
     * 
     * @returns {Promise<Object>} User data with authentication status
     * @throws {Error} Only for critical network failures
     */
    getCurrentUser: async () => {
        console.log(`[userService] Starting user verification from: ${API_BASE}`);

        try {
            // Step 1: Check session status without requiring authentication
            console.log('[userService] Checking session via /api/auth/verify...');

            const verifyResponse = await fetch(`${API_BASE}/api/auth/verify`, {
                method: 'GET',
                credentials: 'include', // Essential for cookies
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                cache: 'no-store',
                mode: 'cors'
            });

            console.log(`[userService] Verify response status: ${verifyResponse.status}`);

            if (!verifyResponse.ok) {
                console.log(`[userService] Session verification failed: ${verifyResponse.status}`);
                return {
                    user: null,
                    authenticated: false,
                    message: 'Session verification failed'
                };
            }

            const verifyData = await verifyResponse.json();
            console.log(`[userService] Session verification result: ${verifyData.authenticated ? 'AUTHENTICATED' : 'NOT AUTHENTICATED'}`);

            // Step 2: If authenticated, fetch full user profile
            if (verifyData.authenticated && verifyData.user) {
                console.log('[userService] Fetching full user profile via /api/auth/me...');

                const profileResponse = await fetch(`${API_BASE}/api/auth/me`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    cache: 'no-store'
                });

                if (profileResponse.ok) {
                    const profileData = await profileResponse.json();
                    console.log('[userService] Full profile fetched successfully');
                    return {
                        ...profileData,
                        authenticated: true
                    };
                } else {
                    console.log(`[userService] Profile fetch failed: ${profileResponse.status}, returning verify data`);
                    return {
                        user: verifyData.user,
                        authenticated: true,
                        message: 'Partial profile data (full fetch failed)'
                    };
                }
            }

            // Step 3: Return not authenticated state
            return {
                user: null,
                authenticated: false,
                message: 'No active session'
            };

        } catch (error) {
            console.error('[userService] Critical error:', error);

            // Don't throw for network errors - return graceful failure state
            return {
                user: null,
                authenticated: false,
                error: 'Network error or service unavailable',
                details: error.message
            };
        }
    },

    /**
     * Complete user profile setup via authentication endpoint
     * 
     * @param {Object} profileData - Profile completion data
     * @returns {Promise<Object>} Updated user data
     */
    completeProfile: async (profileData) => {
        console.log('[userService] Completing user profile...');

        try {
            const response = await fetch(`${API_BASE}/api/auth/profile`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(profileData),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('[userService] Profile completion failed:', response.status, errorData);
                throw new Error(
                    `Profile completion failed: ${response.status}`,
                    { cause: errorData }
                );
            }

            const result = await response.json();
            console.log('[userService] Profile completed successfully');
            return result;

        } catch (error) {
            console.error('[userService] Complete profile error:', error.message);
            throw error;
        }
    },

    /**
     * Update user medical profile via users endpoint
     * 
     * @param {Object} medicalData - Medical profile data
     * @returns {Promise<Object>} Updated medical profile
     */
    updateMedicalProfile: async (medicalData) => {
        console.log('[userService] Updating medical profile...');

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
                console.error('[userService] Medical profile update failed:', response.status);
                throw new Error(
                    `Medical profile update failed: ${response.status}`,
                    { cause: errorData }
                );
            }

            return await response.json();

        } catch (error) {
            console.error('[userService] Update medical profile error:', error.message);
            throw error;
        }
    },

    /**
     * Update general user profile
     * 
     * @param {string} userId - User ID
     * @param {Object} profileData - Profile data to update
     * @returns {Promise<Object>} Updated user data
     */
    updateProfile: async (userId, profileData) => {
        console.log(`[userService] Updating profile for user: ${userId}`);

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
                console.error('[userService] Profile update failed:', response.status);
                throw new Error(
                    `Profile update failed: ${response.status}`,
                    { cause: errorData }
                );
            }

            return await response.json();

        } catch (error) {
            console.error('[userService] Update profile error:', error.message);
            throw error;
        }
    },

    /**
     * Test backend connection (for debugging)
     * 
     * @returns {Promise<Object>} Health check response
     */
    testConnection: async () => {
        console.log('[userService] Testing backend connection...');

        try {
            const response = await fetch(`${API_BASE}/api/health`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            console.log('[userService] Connection test result:', data.status);
            return data;

        } catch (error) {
            console.error('[userService] Connection test error:', error.message);
            throw error;
        }
    },

    /**
     * Get API base URL (for debugging)
     * 
     * @returns {string} Current API base URL
     */
    getApiBaseUrl: () => {
        console.log(`[userService] API Base URL: ${API_BASE}`);
        return API_BASE;
    },

    /**
     * Check if running in production mode
     * 
     * @returns {boolean} True if production environment
     */
    isProduction: () => {
        const isProd = process.env.NEXT_PUBLIC_DEV_MODE === 'false' ||
            process.env.NODE_ENV === 'production';
        console.log(`[userService] Production mode: ${isProd}`);
        return isProd;
    }
};