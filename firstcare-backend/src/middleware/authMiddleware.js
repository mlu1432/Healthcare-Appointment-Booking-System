/**
 * JWT Authentication Middleware
 * 
 * Verifies JWT tokens from:
 * - HTTP-only cookies (primary)
 * - Authorization header (fallback)
 * 
 * Security Features:
 * - Token validation with JWT
 * - Rate limiting for authentication attempts (disabled in development)
 * - Role-based access control
 * - Comprehensive error handling
 */

import { verifyAccessToken } from '../utils/jwtUtils.js';
import User from '../models/user.js';

// Rate limiting configuration - more permissive in development
const authAttempts = new Map();
const MAX_ATTEMPTS = process.env.NODE_ENV === 'development' ? 1000 : 10;
const WINDOW_MS = process.env.NODE_ENV === 'development' ? 5 * 60 * 1000 : 15 * 60 * 1000; // 5 min in dev, 15 min in prod

const rateLimitAuth = (ip) => {
  // Disable rate limiting in development for easier testing
  if (process.env.NODE_ENV === 'development') {
    console.log(`Development mode: Rate limiting disabled for IP: ${ip}`);
    return true;
  }

  const now = Date.now();
  const windowStart = now - WINDOW_MS;

  // Clean up old attempts
  const attempts = (authAttempts.get(ip) || []).filter(time => time > windowStart);

  if (attempts.length >= MAX_ATTEMPTS) {
    console.log(`Rate limit exceeded for IP: ${ip}, attempts: ${attempts.length}`);
    return false;
  }

  attempts.push(now);
  authAttempts.set(ip, attempts);
  return true;
};

/**
 * Clear rate limiting for a specific IP (useful for testing)
 */
export const clearRateLimit = (ip) => {
  authAttempts.delete(ip);
  console.log(`Rate limit cleared for IP: ${ip}`);
};

/**
 * Verify JWT Token Middleware
 */
export const verifyToken = async (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress || 'unknown';

  // Apply rate limiting (disabled in development)
  if (!rateLimitAuth(clientIP)) {
    return res.status(429).json({
      error: "Too many authentication attempts",
      code: "RATE_LIMITED",
      message: "Please try again in 15 minutes"
    });
  }

  // Extract token from cookies (primary) or Authorization header (fallback)
  let token = req.cookies.accessToken;

  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }

  if (!token) {
    return res.status(401).json({
      error: "Authentication required",
      code: "AUTH_REQUIRED",
      message: "No authentication token provided"
    });
  }

  try {
    // Verify the JWT token
    const decoded = verifyAccessToken(token);

    // Check if user exists and is active
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        error: "User not found",
        code: "USER_NOT_FOUND",
        message: "User account does not exist"
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        error: "Account deactivated",
        code: "ACCOUNT_DEACTIVATED",
        message: "This account has been deactivated"
      });
    }

    // Attach user information to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      roles: decoded.roles
    };

    next();
  } catch (error) {
    console.error("Token verification error:", error);

    // Handle specific JWT error cases
    const errorMap = {
      "TokenExpiredError": {
        code: "TOKEN_EXPIRED",
        message: "Session expired. Please reauthenticate.",
        status: 401
      },
      "JsonWebTokenError": {
        code: "INVALID_TOKEN",
        message: "Invalid authentication token",
        status: 401
      },
      "NotBeforeError": {
        code: "TOKEN_NOT_ACTIVE",
        message: "Token not yet active",
        status: 401
      }
    };

    const errorInfo = errorMap[error.name] || {
      code: "AUTH_ERROR",
      message: "Authentication failed",
      status: 401
    };

    res.status(errorInfo.status).json({
      error: errorInfo.message,
      code: errorInfo.code
    });
  }
};

/**
 * Require specific roles middleware
 */
export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: "Authentication required",
        code: "AUTH_REQUIRED"
      });
    }

    // Convert single role to array
    const requiredRoles = Array.isArray(roles) ? roles : [roles];

    // Check if user has any of the required roles
    const hasRole = requiredRoles.some(role => req.user.roles.includes(role));

    if (!hasRole) {
      return res.status(403).json({
        error: "Insufficient permissions",
        code: "FORBIDDEN",
        message: `Required roles: ${requiredRoles.join(', ')}`
      });
    }

    next();
  };
};

/**
 * Require all specified roles middleware
 */
export const requireAllRoles = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: "Authentication required",
        code: "AUTH_REQUIRED"
      });
    }

    const requiredRoles = Array.isArray(roles) ? roles : [roles];
    const hasAllRoles = requiredRoles.every(role => req.user.roles.includes(role));

    if (!hasAllRoles) {
      return res.status(403).json({
        error: "Insufficient permissions",
        code: "FORBIDDEN",
        message: `Required all roles: ${requiredRoles.join(', ')}`
      });
    }

    next();
  };
};

/**
 * Optional authentication middleware
 * (Attaches user if available, but doesn't require auth)
 */
export const optionalAuth = async (req, res, next) => {
  let token = req.cookies.accessToken;

  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }

  if (token) {
    try {
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.userId);

      if (user && user.isActive) {
        req.user = {
          userId: decoded.userId,
          email: decoded.email,
          roles: decoded.roles
        };
        console.log('Optional auth: User attached to request:', user.email);
      } else {
        console.log('Optional auth: User not found or inactive');
      }
    } catch (error) {
      // Silently fail for optional auth
      console.log("Optional auth token verification failed:", error.message);
    }
  } else {
    console.log('Optional auth: No token provided');
  }

  next();
};