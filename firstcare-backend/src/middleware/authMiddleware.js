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
 * - Role-based access control
 * - Rate limiting for authentication attempts
 */
import admin from '../config/firebase.js';
import User from '../models/userModel.js';

// Simple in-memory rate limiting (consider Redis for production)
const authAttempts = new Map();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

const rateLimitAuth = (ip) => {
  const now = Date.now();
  const windowStart = now - WINDOW_MS;
  
  // Clean up old attempts
  const attempts = (authAttempts.get(ip) || []).filter(time => time > windowStart);
  
  if (attempts.length >= MAX_ATTEMPTS) {
    return false;
  }
  
  attempts.push(now);
  authAttempts.set(ip, attempts);
  return true;
};

export const verifyToken = async (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  
  // Apply rate limiting
  if (!rateLimitAuth(clientIP)) {
    return res.status(429).json({
      error: "Too many authentication attempts",
      code: "RATE_LIMITED",
      message: "Please try again in 15 minutes"
    });
  }

  // Extract from headers or cookies
  let token = req.headers.authorization?.split(' ')[1];
  
  if (!token && req.cookies.session) {
    token = req.cookies.session;
  }

  if (!token) {
    return res.status(401).json({
      error: "Authentication required",
      code: "AUTH_REQUIRED",
      message: "No authentication token provided"
    });
  }

  try {
    // Verify the token with Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Check if user is disabled
    if (decodedToken.disabled) {
      return res.status(403).json({
        error: "Account disabled",
        code: "ACCOUNT_DISABLED",
        message: "This account has been disabled by an administrator"
      });
    }
    
    // Check if email is verified (if required for your application)
    if (!decodedToken.email_verified) {
      return res.status(403).json({
        error: "Email not verified",
        code: "EMAIL_NOT_VERIFIED",
        message: "Please verify your email address before accessing this resource"
      });
    }

    // Get user roles from database
    let userDoc;
    try {
      userDoc = await User.findOne({ uid: decodedToken.uid }).select('roles');
    } catch (dbError) {
      console.error("Database error fetching user roles:", dbError);
      // Continue without roles rather than failing authentication
    }

    // Attach user information to request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      email_verified: decodedToken.email_verified,
      name: decodedToken.name || "",
      picture: decodedToken.picture || "",
      roles: userDoc?.roles || ['user'], // Default to 'user' role if not found
      auth_time: decodedToken.auth_time,
      iat: decodedToken.iat,
      exp: decodedToken.exp
    };

    next();
  } catch(error) {
    console.error("Token verification error:", error);

    // Handle specific error cases
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
      },
      "auth/insufficient-permission": {
        code: "INSUFFICIENT_PERMISSION",
        message: "Not enough permissions to verify token",
        status: 500
      }
    };

    const errorInfo = errorMap[error.code] || {
      code: "AUTH_ERROR",
      message: "Authentication failed",
      status: 401
    };

    res.status(errorInfo.status).json({
      error: errorInfo.message,
      code: errorInfo.code,
      // Include reauthentication URL for expired tokens
      ...(errorInfo.code === "TOKEN_EXPIRED" && { reauth_url: "/api/auth/refresh" })
    });
  }
};

// Middleware to require authentication for specific roles
export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: "Authentication required",
        code: "AUTH_REQUIRED"
      });
    }
    
    // Allow if user has any of the required roles
    const hasRole = Array.isArray(roles) 
      ? roles.some(role => req.user.roles.includes(role))
      : req.user.roles.includes(roles);
    
    if (!hasRole) {
      return res.status(403).json({
        error: "Insufficient permissions",
        code: "FORBIDDEN",
        message: `You don't have permission to access this resource. Required roles: ${Array.isArray(roles) ? roles.join(', ') : roles}`
      });
    }
    
    next();
  };
};

// Middleware to require at least one of multiple roles
export const requireAnyRole = (roles) => {
  return requireRole(roles);
};

// Middleware to require all specified roles
export const requireAllRoles = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: "Authentication required",
        code: "AUTH_REQUIRED"
      });
    }
    
    const hasAllRoles = roles.every(role => req.user.roles.includes(role));
    
    if (!hasAllRoles) {
      return res.status(403).json({
        error: "Insufficient permissions",
        code: "FORBIDDEN",
        message: `You don't have all required permissions. Required roles: ${roles.join(', ')}`
      });
    }
    
    next();
  };
};