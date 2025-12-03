/**
 * JWT Utility Functions
 * 
 * @file src/utils/jwtUtils.js
 * @description Handles JWT token generation, verification, and refresh token management
 * 
 * Security Features:
 * - Secure token generation with environment secrets
 * - Token expiration handling
 * - Refresh token rotation
 * - Cookie security configuration
 */

import jwt from 'jsonwebtoken';

/**
 * Generate access token
 */
export const generateAccessToken = (userId, email, roles = ['patient']) => {
    if (!process.env.JWT_ACCESS_SECRET) {
        throw new Error('JWT_ACCESS_SECRET is not defined in environment variables');
    }

    return jwt.sign(
        {
            userId,
            email,
            roles,
            type: 'access'
        },
        process.env.JWT_ACCESS_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m',
            issuer: 'firstcare-backend',
            audience: 'firstcare-frontend'
        }
    );
};

/**
 * Generate refresh token
 */
export const generateRefreshToken = (userId) => {
    if (!process.env.JWT_REFRESH_SECRET) {
        throw new Error('JWT_REFRESH_SECRET is not defined in environment variables');
    }

    return jwt.sign(
        {
            userId,
            type: 'refresh'
        },
        process.env.JWT_REFRESH_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d',
            issuer: 'firstcare-backend',
            audience: 'firstcare-frontend'
        }
    );
};

/**
 * Verify access token
 */
export const verifyAccessToken = (token) => {
    if (!process.env.JWT_ACCESS_SECRET) {
        throw new Error('JWT_ACCESS_SECRET is not defined in environment variables');
    }

    return jwt.verify(token, process.env.JWT_ACCESS_SECRET, {
        issuer: 'firstcare-backend',
        audience: 'firstcare-frontend'
    });
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token) => {
    if (!process.env.JWT_REFRESH_SECRET) {
        throw new Error('JWT_REFRESH_SECRET is not defined in environment variables');
    }

    return jwt.verify(token, process.env.JWT_REFRESH_SECRET, {
        issuer: 'firstcare-backend',
        audience: 'firstcare-frontend'
    });
};

/**
 * Decode token without verification (for inspection)
 */
export const decodeToken = (token) => {
    return jwt.decode(token);
};

/**
 * Check if token is expired without verification
 */
export const isTokenExpired = (token) => {
    try {
        const decoded = decodeToken(token);
        if (!decoded || !decoded.exp) return true;

        return Date.now() >= decoded.exp * 1000;
    } catch (error) {
        return true;
    }
};

/**
 * Set secure HTTP-only cookies
 */
export const setAuthCookies = (res, accessToken, refreshToken) => {
    const isProduction = process.env.NODE_ENV === 'production';

    // Access token cookie (short-lived)
    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'strict' : 'lax',
        maxAge: 15 * 60 * 1000, // 15 minutes
        path: '/',
        domain: isProduction ? process.env.COOKIE_DOMAIN : undefined
    });

    // Refresh token cookie (longer-lived)
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'strict' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/api/auth/refresh',
        domain: isProduction ? process.env.COOKIE_DOMAIN : undefined
    });

    // Additional cookie for client-side access token reference (non-httpOnly)
    res.cookie('authStatus', 'authenticated', {
        httpOnly: false,
        secure: isProduction,
        sameSite: isProduction ? 'strict' : 'lax',
        maxAge: 15 * 60 * 1000, // 15 minutes
        path: '/'
    });
};

/**
 * Clear auth cookies
 */
export const clearAuthCookies = (res) => {
    const isProduction = process.env.NODE_ENV === 'production';

    res.clearCookie('accessToken', {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'strict' : 'lax',
        path: '/'
    });

    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'strict' : 'lax',
        path: '/api/auth/refresh'
    });

    res.clearCookie('authStatus', {
        httpOnly: false,
        secure: isProduction,
        sameSite: isProduction ? 'strict' : 'lax',
        path: '/'
    });
};

/**
 * Extract token from request (cookies or Authorization header)
 */
export const extractTokenFromRequest = (req) => {
    // Try cookies first
    let token = req.cookies.accessToken;

    // Fallback to Authorization header
    if (!token) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        }
    }

    return token;
};

/**
 * Generate temporary token for email verification, password reset, etc.
 */
export const generateTemporaryToken = (payload, expiresIn = '1h') => {
    return jwt.sign(
        {
            ...payload,
            type: 'temporary'
        },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn }
    );
};

export default {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
    decodeToken,
    isTokenExpired,
    setAuthCookies,
    clearAuthCookies,
    extractTokenFromRequest,
    generateTemporaryToken
};