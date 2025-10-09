/**
 * Authentication Controllers
 * 
 * Handles session management:
 * - Session creation (login)
 * - Session termination (logout)
 * - User profile retrieval
 * - Session verification
 * 
 * Security Features:
 * - HTTP-only cookies for session tokens
 * - SameSite strict policy
 * - Secure flag in production
 */
import admin from '../config/firebase.js';
import User from '../models/userModel.js';

/**
 * Create user session
 * 
 * 1. Verifies Firebase ID token
 * 2. Creates/updates user in database
 * 3. Sets HTTP-only session cookie
 */
export const createSession = async (req, res) => {
    let token;
    
    // Extract token from Authorization header (could be combined with reCAPTCHA)
    const authHeader = req.headers.authorization;
    if (authHeader) {
        // Handle both formats: "Bearer token" and "Bearer token, ReCAPTCHA recaptchaToken"
        const parts = authHeader.split(',');
        token = parts[0].replace('Bearer ', '').trim();
    }

    if (!token) {
        return res.status(400).json({
            error: "Missing authentication token",
            code: "MISSING_TOKEN"
        });
    }

    try {
        // Verify the token with Firebase
        const decodedToken = await admin.auth().verifyIdToken(token);
        
        // Create or update the user in database
        const user = await User.findOneAndUpdate(
            { uid: decodedToken.uid },
            {
                email: decodedToken.email,
                name: decodedToken.name || "",
                profilePicture: decodedToken.picture || "",
                lastLogin: new Date(),
                $setOnInsert: {
                    roles: ['patient'],
                    createdAt: new Date()
                }
            },
            { 
                upsert: true, 
                new: true, 
                runValidators: true,
                setDefaultsOnInsert: true
            }
        );

        // Set secure HTTP-only cookie
        res.cookie('session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 1000, // 1 hour
            path: '/'
        });

        res.status(200).json({
            message: "Session established",
            user: {
                uid: user.uid,
                email: user.email,
                name: user.name,
                roles: user.roles,
                profilePicture: user.profilePicture
            }
        });
    } catch (error) {
        console.error("Session creation error:", error);
        res.status(401).json({
            error: "Invalid authentication token",
            code: "INVALID_TOKEN"
        });
    }
};

/**
 * Terminate user session
 */
export const terminateSession = (req, res) => {
    res.clearCookie('session', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
    });

    res.status(200).json({ message: "Session terminated" });
};

/**
 * Get current user profile
 */
export const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findOne({ uid: req.user.uid });

        if (!user) {
            return res.status(404).json({
                error: "User not found",
                code: "USER_NOT_FOUND"
            });
        }

        res.status(200).json({
            uid: user.uid,
            email: user.email,
            name: user.name,
            roles: user.roles,
            profilePicture: user.profilePicture,
            lastLogin: user.lastLogin
        });
    } catch (error) {
        console.error("Profile retrieval error:", error);
        res.status(500).json({
            error: "Internal server error",
            code: "SERVER_ERROR"
        });
    }
};

/**
 * Verify active session
 * 
 * @description Checks if a valid session exists without requiring full authentication
 * 
 * Flow:
 * 1. Check for session cookie
 * 2. Validate token structure (lightweight check)
 * 3. Return session status
 * 
 * Security:
 * - Does NOT verify token with Firebase (performance optimization)
 * - Provides basic session existence check
 */
export const verifySession = async (req, res) => {
    const token = req.cookies.session;
    
    if (!token) {
        return res.status(200).json({ 
            authenticated: false,
            message: "No session token found"
        });
    }
    
    try {
        // Lightweight token format validation (JWT format)
        const isValidFormat = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/.test(token);
        
        res.status(200).json({
            authenticated: isValidFormat,
            tokenValid: isValidFormat,
            message: isValidFormat ? "Valid session" : "Invalid token format"
        });
    } catch (error) {
        console.error("Session verification error:", error);
        res.status(200).json({ 
            authenticated: false,
            message: "Session verification failed"
        });
    }
};