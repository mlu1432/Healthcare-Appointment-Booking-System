/**
 * Authentication Middleware
 * 
 * Verifies Firebase ID tokens from:
 * - Authorization header (Bearer token)
 * - HTTP-only cookie (session token)
 * 
 * Security Features:
 * - Token validation with Firebase Admin SDK
 * - Custom error handling for different failure scenarios
 * - User information attachment to request object
 */
import admin from '../config/firebase.js';
 
export const verifyToken = async (req, res, next) => {
    // extract fron headers or cookies
    const token = req.headers.authorization?.split(' ')[1] || req.cookies.session;

    if (!token) {
        return res.status(401).json({
            error: "Authentication required",
            code: "AUTH_REQUIRED",
            message: "No authentication token provided"
        });
    }

    try {
        // verfiy the token with firebase admin SDK
        const decodedToken = await admin.auth().verifyIdToken(token);

        // attach user information to request
        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email,
            name: decodedToken.name || "",
            picture: decodedToken.picture || ""
        };

        next();
    } catch(error) {
        console.error("Token verification error:", error);

        // handle specific error cases
        const errorMap = {
            "auth/id-token-expired": {
                code: "TOKEN_EXPIRED",
                message: "Session expired. Please reauthenticate.",
                status: 401
            },
            "auth/argument-error": {
                code: "INVALID_TOKEN",
                message: "Malformed authentication token",
                status: 400
            },
            "auth/user-disabled": {
                code: "USER_DISABLED",
                message: "This account has been disabled",
                status: 403
            },
            "auth/user-not-found": {
                code: "USER_NOT_FOUND",
                message: "User account not found",
                status: 404
            }
        };

        const errorInfo = errorMap[error.code] || {
            code:"AUTH_ERROR",
            message: "Authentication failed",
            status: 401
        };

        res.status(errorInfo.status).json({
            error: errorInfo.message,
            code: errorInfo.code
        });
    }
};

// Middleware to require authentication for specific roles
export const requireRole = (role) => {
    return (req, res, next) => {
        if (!req.user.roles || !req.user.roles.includes(role)) {
            return res.status(403).json({
                error: "Forbidden",
                code:"ACCESS_DENIED",
                message: `You don't have permission to access this resource`
            });
        }
        next();
    };
};