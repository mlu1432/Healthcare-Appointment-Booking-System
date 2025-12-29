/**
 * Centralized API Configuration for Healthcare Frontend
 * 
 * @file lib/api.js
 * @description API client configuration with environment-aware endpoints
 * 
 * @version 2.0.0
 * @module api
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

/**
 * API Configuration
 */
export const apiConfig = {
    baseUrl: API_BASE,
    endpoints: {
        auth: {
            login: `${API_BASE}/api/auth/signin`,
            register: `${API_BASE}/api/auth/signup`,
            logout: `${API_BASE}/api/auth/logout`,
            refresh: `${API_BASE}/api/auth/refresh`,
            google: `${API_BASE}/api/auth/google`,
            verify: `${API_BASE}/api/auth/verify`,
            me: `${API_BASE}/api/auth/me`
        },
        users: {
            base: `${API_BASE}/api/users`,
            me: `${API_BASE}/api/users/me`,
            profile: {
                complete: `${API_BASE}/api/users/profile/complete`,
                medical: `${API_BASE}/api/users/profile/medical`
            }
        },
        healthcare: {
            facilities: `${API_BASE}/api/healthcare/facilities`,
            doctors: `${API_BASE}/api/healthcare/doctors`,
            location: {
                nearby: `${API_BASE}/api/healthcare/location/nearby`,
                district: `${API_BASE}/api/healthcare/location/district`
            }
        },
        appointments: {
            base: `${API_BASE}/api/appointments`,
            book: `${API_BASE}/api/appointments/book`,
            cancel: `${API_BASE}/api/appointments/cancel`
        },
        system: {
            health: `${API_BASE}/api/health`,
            info: `${API_BASE}/api/system/info`
        }
    },
    headers: {
        json: {
            'Content-Type': 'application/json'
        },
        auth: (token) => ({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        })
    }
};

/**
 * Enhanced fetch wrapper with error handling
 */
export const apiFetch = async (url, options = {}) => {
    const defaultOptions = {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    };

    try {
        console.log(`API Call: ${options.method || 'GET'} ${url}`);

        const response = await fetch(url, defaultOptions);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({
                error: 'Unknown error',
                message: `HTTP ${response.status} ${response.statusText}`
            }));

            throw {
                status: response.status,
                statusText: response.statusText,
                data: errorData,
                url
            };
        }

        return await response.json();
    } catch (error) {
        console.error('API Fetch Error:', error);
        throw error;
    }
};

/**
 * Check if backend is available
 */
export const checkBackendHealth = async () => {
    try {
        const response = await fetch(apiConfig.endpoints.system.health);
        return response.ok;
    } catch {
        return false;
    }
};

/**
 * Get current environment info
 */
export const getEnvironmentInfo = () => ({
    apiBaseUrl: API_BASE,
    isProduction: process.env.NEXT_PUBLIC_DEV_MODE === 'false',
    nodeEnv: process.env.NODE_ENV,
    frontendUrl: typeof window !== 'undefined' ? window.location.origin : 'SSR'
});