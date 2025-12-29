/**
 * CORS Middleware Configuration
 * 
 * This middleware handles Cross-Origin Resource Sharing (CORS) for the application.
 * It controls which domains can access the API and sets appropriate security headers.
 * 
 * The configuration supports:
 * - Environment-based origin configuration
 * - Wildcard domain patterns (e.g., *.netlify.app)
 * - Development and production modes
 * - OAuth callback support
 * - Security headers for production
 */

import cors from 'cors';

/**
 * Parse and validate allowed origins from environment variables
 * Combines default origins with environment-specific configurations
 * 
 * @returns {Array} Array of allowed origin URLs
 */
const parseAllowedOrigins = () => {
  // Primary client URL from environment or default to local development
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

  // Additional origins can be provided as comma-separated list
  const additionalOrigins = process.env.ADDITIONAL_ALLOWED_ORIGINS || '';

  // Base origins that are always allowed
  const origins = [
    clientUrl,
    'http://localhost:3000',
    'https://localhost:3000',
    'http://127.0.0.1:3000',
    'https://127.0.0.1:3000',
    'https://accounts.google.com',
    'https://www.googleapis.com'
  ];

  // Add production-specific origins
  if (process.env.NODE_ENV === 'production') {
    origins.push(
      'https://healthcarekzn.netlify.app',
      'https://*.netlify.app'  // Allows all Netlify preview deployments
    );
  }

  // Parse and add additional origins from environment variable
  if (additionalOrigins) {
    const additional = additionalOrigins
      .split(',')
      .map(origin => origin.trim())
      .filter(origin => origin.length > 0);
    origins.push(...additional);
  }

  // Add backend URL for OAuth callbacks in development
  if (process.env.NODE_ENV === 'development') {
    origins.push('http://localhost:5000');
    origins.push('https://localhost:5000');
  }

  // Remove duplicate entries and filter out any empty values
  const uniqueOrigins = [...new Set(origins.filter(origin => origin && origin.length > 0))];

  return uniqueOrigins;
};

/**
 * Check if a given origin matches an allowed origin pattern
 * Supports exact matches and wildcard patterns (e.g., *.example.com)
 * 
 * @param {string} origin - The origin to check
 * @param {string} allowedOrigin - The allowed origin pattern
 * @returns {boolean} True if origin matches the pattern
 */
const originMatches = (origin, allowedOrigin) => {
  // Exact match
  if (origin === allowedOrigin) {
    return true;
  }

  // Wildcard pattern match (e.g., *.netlify.app)
  if (allowedOrigin.includes('*')) {
    // Convert wildcard pattern to regex
    // Example: "*.netlify.app" becomes ".*\.netlify\.app"
    const escapedPattern = allowedOrigin.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
    const regexPattern = escapedPattern.replace('\\*', '.*');
    const regex = new RegExp(`^${regexPattern}$`);

    return regex.test(origin);
  }

  return false;
};

/**
 * CORS configuration options
 * Defines allowed origins, methods, headers, and other CORS settings
 */
const corsOptions = {
  /**
   * Origin validation function
   * Determines whether a request from a specific origin should be allowed
   * 
   * @param {string} origin - The origin of the request (may be undefined for same-origin requests)
   * @param {Function} callback - Callback function to indicate approval/rejection
   */
  origin: (origin, callback) => {
    const allowedOrigins = parseAllowedOrigins();

    // Allow requests with no origin (mobile apps, Postman, server-to-server, OAuth callbacks)
    if (!origin) {
      return callback(null, true);
    }

    // Check if the origin matches any allowed pattern
    const isAllowed = allowedOrigins.some(allowedOrigin =>
      originMatches(origin, allowedOrigin)
    );

    if (isAllowed) {
      callback(null, true);
    } else {
      // Log CORS violations for debugging (but not in production to avoid log spam)
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`CORS blocked request from origin: ${origin}`);
        console.warn(`Allowed origins: ${allowedOrigins.join(', ')}`);
      }
      callback(new Error('Not allowed by CORS'));
    }
  },

  // Allow cookies and authentication headers to be sent
  credentials: true,

  // HTTP methods allowed in CORS requests
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],

  // Headers allowed in CORS requests
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Recaptcha-Token',
    'X-Requested-With',
    'X-Action',
    'Accept',
    'Origin'
  ],

  // Headers exposed to the client
  exposedHeaders: [
    'Content-Range',
    'X-Content-Range'
  ],

  // Do not pass the CORS preflight response to the next handler
  preflightContinue: false,

  // Success status for OPTIONS requests
  optionsSuccessStatus: 204,

  // How long the results of a preflight request can be cached (in seconds)
  maxAge: process.env.CORS_MAX_AGE || 86400 // Default: 24 hours
};

/**
 * CORS middleware instance
 * Apply this middleware to your Express app to enable CORS
 */
const corsMiddleware = cors(corsOptions);

/**
 * CORS Error Handler Middleware
 * Catches and formats CORS-related errors with helpful information
 * 
 * @param {Error} err - The error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const handleCorsErrors = (err, req, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      error: 'CORS policy violation',
      code: 'CORS_ERROR',
      message: 'Cross-origin requests are not allowed from this domain',
      allowedOrigins: parseAllowedOrigins(),
      documentation: 'Please ensure your frontend domain is configured in the CORS allowed origins'
    });
  }
  next(err);
};

/**
 * Security Headers Middleware
 * Adds security-related HTTP headers to responses
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const securityHeaders = (req, res, next) => {
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // Enable XSS filtering in browsers
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Content Security Policy for production
  if (process.env.NODE_ENV === 'production') {
    res.setHeader(
      'Content-Security-Policy',
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "connect-src 'self' https://www.google.com/recaptcha/ https://accounts.google.com",
        "frame-src https://www.google.com/recaptcha/ https://accounts.google.com"
      ].join('; ')
    );
  }

  next();
};

/**
 * Setup guide for environment variables:
 * 
 * Required in production (Render dashboard):
 * CLIENT_URL=https://healthcarekzn.netlify.app
 * ADDITIONAL_ALLOWED_ORIGINS=https://*.netlify.app
 * NODE_ENV=production
 * 
 * Optional:
 * CORS_MAX_AGE=86400 (cache duration in seconds)
 * 
 * For local development, create a .env file with:
 * CLIENT_URL=http://localhost:3000
 * NODE_ENV=development
 */

export default corsMiddleware;