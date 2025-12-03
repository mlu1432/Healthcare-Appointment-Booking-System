// Create: /lib/userService.js
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

export const userService = {
    // Get current user
    getCurrentUser: async () => {
        const response = await fetch(`${API_BASE}/api/users/me`, {
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch user: ${response.status}`);
        }

        return response.json();
    },

    // Complete user profile
    completeProfile: async (profileData) => {
        const response = await fetch(`${API_BASE}/api/users/profile/complete`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(profileData),
        });

        if (!response.ok) {
            throw new Error(`Failed to complete profile: ${response.status}`);
        }

        return response.json();
    },

    // Update medical profile
    updateMedicalProfile: async (medicalData) => {
        const response = await fetch(`${API_BASE}/api/users/profile/medical`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(medicalData),
        });

        if (!response.ok) {
            throw new Error(`Failed to update medical profile: ${response.status}`);
        }

        return response.json();
    },

    // Update user profile
    updateProfile: async (userId, profileData) => {
        const response = await fetch(`${API_BASE}/api/users/${userId}`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(profileData),
        });

        if (!response.ok) {
            throw new Error(`Failed to update profile: ${response.status}`);
        }

        return response.json();
    },

    // Get user by ID
    getUserById: async (userId) => {
        const response = await fetch(`${API_BASE}/api/users/${userId}`, {
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch user: ${response.status}`);
        }

        return response.json();
    }
};