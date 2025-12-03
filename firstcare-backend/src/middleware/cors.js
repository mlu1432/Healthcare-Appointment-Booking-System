/**
 * CORS Middleware Configuration
 */
import cors from 'cors';

// Validate and parse allowed origins
const parseAllowedOrigins = () => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  const additionalOrigins = process.env.ADDITIONAL_ALLOWED_ORIGINS || '';

  const origins = [
    clientUrl,
    'http://localhost:3000',
    'https://localhost:3000', // Add HTTPS localhost
    'http://127.0.0.1:3000',  // Add 127.0.0.1
    'https://127.0.0.1:3000', // Add HTTPS 127.0.0.1
    'https://accounts.google.com',
    'https://www.googleapis.com'
  ];

  if (additionalOrigins) {
    const additional = additionalOrigins.split(',').map(origin => origin.trim());
    origins.push(...additional);
  }

  // Add backend URL for OAuth callbacks
  if (process.env.NODE_ENV === 'development') {
    origins.push('http://localhost:5000');
    origins.push('https://localhost:5000'); // Add HTTPS backend
  }

  // Remove duplicates
  return [...new Set(origins.filter(Boolean))];
};

const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = parseAllowedOrigins();

    // Allow requests with no origin (like mobile apps, Postman, OAuth callbacks)
    if (!origin) return callback(null, true);

    // Check if origin is allowed
    if (allowedOrigins.some(allowedOrigin =>
      origin === allowedOrigin ||
      origin.startsWith(allowedOrigin.replace('https://', 'http://')) ||
      allowedOrigin === '*'
    )) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked request from origin: ${origin}`);
      console.warn(`Allowed origins: ${allowedOrigins.join(', ')}`);
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
    'X-Action',
    'Accept', // Add Accept header
    'Origin'  // Add Origin header
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

// CORS error handler
export const handleCorsErrors = (err, req, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      error: 'CORS policy violation',
      code: 'CORS_ERROR',
      message: 'Cross-origin requests are not allowed from this domain',
      allowedOrigins: parseAllowedOrigins()
    });
  }
  next(err);
};

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
      "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://www.google.com/recaptcha/ https://accounts.google.com; frame-src https://www.google.com/recaptcha/ https://accounts.google.com"
    );
  }

  next();
};

export default corsMiddleware;