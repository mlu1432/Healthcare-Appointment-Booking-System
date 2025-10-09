/**
 * CORS Middleware Configuration
 * 
 * @file src/middleware/cors.js
 * @description Configures Cross-Origin Resource Sharing for the Express server
 * 
 * Security Features:
 * - Environment-based origin configuration with validation
 * - Credential support for cookies/auth
 * - Preflight request handling
 * - Custom allowed headers
 * - Security headers for production
 */
import cors from 'cors';

// Validate and parse allowed origins
const parseAllowedOrigins = () => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  const additionalOrigins = process.env.ADDITIONAL_ALLOWED_ORIGINS || '';
  
  const origins = [clientUrl];
  
  if (additionalOrigins) {
    const additional = additionalOrigins.split(',').map(origin => origin.trim());
    origins.push(...additional);
  }
  
  // Validate origins in production
  if (process.env.NODE_ENV === 'production') {
    return origins.filter(origin => {
      try {
        const url = new URL(origin);
        return url.protocol === 'https:';
      } catch (e) {
        console.warn(`Invalid origin URL in CORS configuration: ${origin}`);
        return false;
      }
    });
  }
  
  return origins;
};

const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = parseAllowedOrigins();
    
    // Allow requests with no origin (like mobile apps, Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Recaptcha-Token',
    'X-Requested-With',
    'X-Action'
  ],
  exposedHeaders: [
    'Content-Range',
    'X-Content-Range'
  ],
  preflightContinue: false,
  optionsSuccessStatus: 204,
  maxAge: process.env.CORS_MAX_AGE || 86400 // 24 hours
};

// Create CORS middleware
const corsMiddleware = cors(corsOptions);

// Additional security headers middleware
export const securityHeaders = (req, res, next) => {
  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Content Security Policy
  if (process.env.NODE_ENV === 'production') {
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https://www.google.com/recaptcha/; frame-src https://www.google.com/recaptcha/"
    );
  }
  
  next();
};

export default corsMiddleware;