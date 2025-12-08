/**
 * Express Server Entry Point for KZN Healthcare System
 * 
 * @file src/server.js
 * @description Main server configuration with comprehensive healthcare system integration
 * 
 * Features:
 * - Unified healthcare facility and doctor management
 * - JWT-based authentication system
 * - Google Maps and location services integration
 * - MongoDB integration with Mongoose
 * - Comprehensive security middleware
 * - Rate limiting and CORS protection
 * - Swagger API documentation
 * - Health monitoring endpoints
 * - Graceful shutdown handling
 * 
 * Security Features:
 * - Security headers implementation
 * - Multi-tier rate limiting
 * - Input validation and sanitization
 * - Cookie-based JWT token management
 * - Error handling and logging
 * 
 * @version 3.0.0
 * @module Server
 */

// STEP 1: Import all tools and libraries
import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import swaggerUi from 'swagger-ui-express';

// Configuration imports
import connectDB from './config/db.js';
import swaggerSpec from './config/swaggerConfig.js';
import { validateGoogleConfig } from './config/googleConfig.js';

// Middleware imports
import corsMiddleware, { handleCorsErrors } from './middleware/cors.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import userRoutes from './routes/userRoutes.js';
import healthcareRoutes from './routes/healthcareRoutes.js';
import locationRoutes from './routes/locationRoutes.js';
import placesRoutes from './routes/placesRoutes.js';

// STEP 2: Load environment variables
dotenv.config({
  path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development'
});

const app = express();
const PORT = process.env.PORT || 5000;

/**
 * Security Headers Middleware
 * Implements essential security headers for protection against common web vulnerabilities
 */
const securityHeaders = (req, res, next) => {
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions policy
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  // Strict transport security (HTTPS only in production)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  // Content security policy
  res.setHeader('Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self' https://maps.googleapis.com;"
  );

  next();
};

/**
 * Rate Limiting Middleware Factory
 * Creates configurable rate limiters for different endpoints
 * 
 * @param {number} windowMs - Time window in milliseconds
 * @param {number} max - Maximum number of requests allowed in the window
 * @param {string} scope - Scope identifier for the rate limiter
 * @returns {Function} Rate limiting middleware function
 */
const createRateLimiter = (windowMs, max, scope = 'general') => {
  // Disable rate limiting in development for easier testing
  if (process.env.NODE_ENV === 'development') {
    console.log(`Development mode: Rate limiting disabled for ${scope} (would be ${max} requests per ${windowMs / 60000} minutes)`);
    return (req, res, next) => next();
  }

  const requests = new Map();

  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean up old requests outside the current window
    const recentRequests = (requests.get(ip) || []).filter(time => time > windowStart);

    // Check if rate limit exceeded
    if (recentRequests.length >= max) {
      console.warn(`Rate limit exceeded for IP: ${ip}, scope: ${scope}, requests: ${recentRequests.length}`);
      return res.status(429).json({
        success: false,
        error: 'Too many requests',
        code: 'RATE_LIMIT_EXCEEDED',
        message: `Rate limit exceeded for ${scope}. Please try again later.`,
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }

    // Add current request timestamp
    recentRequests.push(now);
    requests.set(ip, recentRequests);

    // Add rate limit headers for client information
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', max - recentRequests.length);
    res.setHeader('X-RateLimit-Reset', new Date(now + windowMs).toISOString());

    next();
  };
};

/**
 * Request Logging Middleware
 * Logs incoming requests for debugging and monitoring
 */
const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const userAgent = req.get('User-Agent') || 'Unknown';

  console.log(`[${timestamp}] ${req.method} ${req.originalUrl} - IP: ${req.ip} - User-Agent: ${userAgent.substring(0, 50)}`);

  // Log response when finished
  const originalSend = res.send;
  res.send = function (data) {
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl} - Status: ${res.statusCode}`);
    originalSend.apply(this, arguments);
  };

  next();
};

/**
 * Database Connection Health Check Middleware
 * Checks database connectivity for critical routes
 */
const dbHealthCheck = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      error: 'Service temporarily unavailable',
      code: 'DATABASE_UNAVAILABLE',
      message: 'Database connection is currently unavailable. Please try again later.'
    });
  }
  next();
};

// ==================== MIDDLEWARE CONFIGURATION ====================

// Apply security headers middleware
app.use(securityHeaders);

// Apply request logging
app.use(requestLogger);

// General rate limiting for all endpoints
app.use(createRateLimiter(
  15 * 60 * 1000, // 15 minutes window
  1000, // 1000 requests per 15 minutes
  'general'
));

// Stricter rate limiting for authentication endpoints
app.use('/api/auth/signup', createRateLimiter(
  60 * 60 * 1000, // 1 hour window
  5, // 5 signup attempts per hour
  'signup'
));

app.use('/api/auth/signin', createRateLimiter(
  15 * 60 * 1000, // 15 minutes window
  10, // 10 signin attempts per 15 minutes
  'signin'
));

// Rate limiting for healthcare data endpoints
app.use('/api/healthcare/facilities', createRateLimiter(
  1 * 60 * 1000, // 1 minute window
  60, // 60 requests per minute
  'facility_search'
));

app.use('/api/healthcare/location', createRateLimiter(
  1 * 60 * 1000, // 1 minute window
  30, // 30 requests per minute (more expensive Google API calls)
  'location_services'
));

// JSON body parsing with size limit
app.use(express.json({
  limit: '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

// URL-encoded body parsing
app.use(express.urlencoded({
  extended: true,
  limit: '10mb'
}));

// Cookie parser for JWT tokens
app.use(cookieParser(process.env.COOKIE_SECRET || 'jwt-cookie-secret-change-in-production'));

// CORS middleware for cross-origin requests
app.use(corsMiddleware);

// Database health check for critical routes
app.use('/api/healthcare', dbHealthCheck);
app.use('/api/appointments', dbHealthCheck);

// ==================== DATABASE CONFIGURATION ====================

// Initialize database connection
connectDB();

// MongoDB connection event handlers
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected - attempting to reconnect...');
});

mongoose.connection.on('connected', () => {
  console.log('MongoDB connected successfully');
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected successfully');
});

// ==================== SERVICE CONFIGURATION ====================

/**
 * Google Maps Configuration Validation
 */
try {
  validateGoogleConfig();
  console.log('Google Maps API configuration validated successfully');
} catch (error) {
  console.error('Google Maps configuration error:', error.message);
  console.log('Location-based features will be limited without proper Google Maps API configuration');
}

// ==================== SWAGGER API DOCUMENTATION ====================

console.log('Initializing Swagger API documentation...');

if (typeof swaggerSpec === 'object' && swaggerSpec.openapi) {
  console.log('Swagger specification loaded successfully');
  console.log('OpenAPI version:', swaggerSpec.openapi);
  console.log('API title:', swaggerSpec.info.title);

  // Swagger UI Documentation
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'KZN Healthcare System API Documentation',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'none',
      filter: true,
      showExtensions: true,
      showCommonExtensions: true
    }
  }));

  // Serve raw Swagger JSON specification
  app.get('/api/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.log('Swagger documentation available at /api/docs');
  console.log('Swagger JSON specification available at /api/swagger.json');
} else {
  console.error('ERROR: Invalid Swagger specification');
  console.error('swaggerSpec type:', typeof swaggerSpec);

  // Fallback Swagger route with error message
  app.use('/api/docs', (req, res) => {
    res.status(500).json({
      success: false,
      error: 'API documentation unavailable',
      code: 'DOCUMENTATION_ERROR',
      message: 'Swagger configuration failed to load properly'
    });
  });
}

// ==================== API ROUTE REGISTRATION ====================

/**
 * Location Services Routes
 * District detection and location-based services
 */
app.use('/api/location', locationRoutes);

/**
 * Healthcare System Routes (Unified)
 * Combines facilities, doctors, and location services
 */
app.use('/api/healthcare', healthcareRoutes);

/**
 * Authentication Routes
 * User registration, login, and token management
 */
app.use('/api/auth', authRoutes);

/**
 * Appointment Management Routes
 * Booking, cancellation, and appointment management
 */
app.use('/api/appointments', appointmentRoutes);

/**
 * User Management Routes
 * User profiles, preferences, and account management
 */
app.use('/api/users', userRoutes);

/**
 * Places Routes
 * Google Places API integration for healthcare facility search
 */
app.use('/api/places', placesRoutes);

// ==================== HEALTH AND STATUS ENDPOINTS ====================

/**
 * Comprehensive Health Check Endpoint
 * Provides system status information for monitoring and load balancers
 */
app.get('/api/health', async (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const statusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  const healthCheck = {
    success: true,
    status: dbStatus === 1 ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '3.0.0',

    services: {
      database: {
        status: statusMap[dbStatus] || 'unknown',
        readyState: dbStatus,
        connection: mongoose.connection.host || 'unknown'
      },
      google_maps: {
        status: process.env.GOOGLE_MAPS_API_KEY ? 'configured' : 'not_configured',
        features: ['geocoding', 'places_search', 'distance_matrix']
      },
      authentication: {
        status: 'jwt_enabled',
        features: ['cookie_tokens', 'rate_limiting']
      },
      documentation: {
        status: typeof swaggerSpec === 'object' && !!swaggerSpec.openapi ? 'available' : 'unavailable',
        path: '/api/docs'
      }
    },

    system: {
      uptime: process.uptime(),
      memory: {
        used: process.memoryUsage().heapUsed,
        total: process.memoryUsage().heapTotal
      },
      node_version: process.version,
      platform: process.platform
    },

    endpoints: {
      healthcare: '/api/healthcare',
      authentication: '/api/auth',
      appointments: '/api/appointments',
      users: '/api/users',
      documentation: '/api/docs'
    }
  };

  // If database is not connected, return 503 Service Unavailable
  if (dbStatus !== 1) {
    return res.status(503).json({
      ...healthCheck,
      success: false,
      status: 'degraded',
      error: 'Database connection issue',
      message: 'Service temporarily unavailable due to database connectivity problems'
    });
  }

  res.status(200).json(healthCheck);
});

/**
 * System Information Endpoint
 * Provides detailed system information and configuration
 */
app.get('/api/system/info', (req, res) => {
  const systemInfo = {
    success: true,
    application: {
      name: 'KZN Healthcare System',
      version: '3.0.0',
      description: 'Unified healthcare facility and doctor management system for KwaZulu-Natal',
      environment: process.env.NODE_ENV || 'development'
    },

    features: {
      healthcare: {
        facilities: true,
        doctors: true,
        location_services: true,
        affordability_filtering: true,
        specialty_search: true
      },
      authentication: {
        jwt: true,
        cookie_based: true,
        rate_limiting: true
      },
      integrations: {
        google_maps: !!process.env.GOOGLE_MAPS_API_KEY,
        mongodb: true
      }
    },

    limits: {
      rate_limiting: process.env.NODE_ENV === 'production',
      max_request_size: '10mb',
      max_search_radius: '50km',
      default_page_size: 20
    },

    kzn_districts: [
      'amajuba', 'ethekwini', 'ilembe', 'king-cetshwayo',
      'umgungundlovu', 'umkhanyakude', 'ugu', 'umzinyathi',
      'uthukela', 'zululand'
    ],

    facility_types: [
      'public-hospital', 'public-clinic', 'unjani-clinic',
      'private-practice', 'private-hospital', 'specialist-center'
    ],

    timestamps: {
      server_time: new Date().toISOString(),
      uptime: process.uptime(),
      started_at: new Date(Date.now() - process.uptime() * 1000).toISOString()
    }
  };

  res.status(200).json(systemInfo);
});

/**
 * Root Endpoint
 * Provides basic API information and navigation
 */
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'KZN Healthcare System API',
    version: '3.0.0',
    description: 'Unified healthcare facility and doctor management system for KwaZulu-Natal',

    endpoints: {
      documentation: '/api/docs',
      health: '/api/health',
      system_info: '/api/system/info',
      healthcare: '/api/healthcare',
      authentication: '/api/auth',
      appointments: '/api/appointments',
      users: '/api/users'
    },

    status: {
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      environment: process.env.NODE_ENV || 'development',
      google_maps: process.env.GOOGLE_MAPS_API_KEY ? 'configured' : 'not_configured'
    },

    quick_start: {
      'Find facilities nearby': 'GET /api/healthcare/location/nearby?lat=-29.8587&lng=31.0218',
      'Search doctors by specialty': 'GET /api/healthcare/doctors?specialty=General Practitioner',
      'Get district facilities': 'GET /api/healthcare/location/district/ethekwini/facilities',
      'System health': 'GET /api/health'
    }
  });
});

// ==================== ERROR HANDLING MIDDLEWARE ====================

// CORS error handling
app.use(handleCorsErrors);

/**
 * 404 Handler - Catch All Unmatched Routes
 */
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    code: 'ENDPOINT_NOT_FOUND',
    path: req.originalUrl,
    method: req.method,

    suggestions: [
      'Check /api/docs for available endpoints',
      'Verify the endpoint URL and HTTP method',
      'Ensure you are using the correct API version'
    ],

    available_endpoints: {
      healthcare: [
        'GET  /api/healthcare/facilities',
        'GET  /api/healthcare/doctors',
        'GET  /api/healthcare/location/nearby',
        'GET  /api/healthcare/location/district/:district/facilities',
        'GET  /api/healthcare/statistics'
      ],
      authentication: [
        'POST /api/auth/signup',
        'POST /api/auth/signin',
        'GET  /api/auth/verify',
        'POST /api/auth/logout',
        'GET  /api/auth/me'
      ],
      system: [
        'GET  /api/health',
        'GET  /api/system/info',
        'GET  /api/docs'
      ]
    }
  });
});

/**
 * Global Error Handler Middleware
 * Centralized error handling for all routes and middleware
 */
app.use((err, req, res, next) => {
  console.error('Global error handler:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString(),
    user_agent: req.get('User-Agent')
  });

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      code: 'VALIDATION_ERROR',
      message: 'Data validation failed',
      details: Object.values(err.errors).map(e => ({
        field: e.path,
        message: e.message,
        value: e.value
      }))
    });
  }

  // MongoDB duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({
      success: false,
      error: 'Duplicate resource',
      code: 'DUPLICATE_RESOURCE',
      message: `A resource with this ${field} already exists`,
      field: field,
      value: err.keyValue[field]
    });
  }

  // JWT authentication errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid authentication token',
      code: 'INVALID_TOKEN',
      message: 'Please sign in again'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Authentication token expired',
      code: 'TOKEN_EXPIRED',
      message: 'Please sign in again'
    });
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: 'Invalid resource identifier',
      code: 'INVALID_ID',
      message: 'The provided identifier is not valid',
      path: err.path,
      value: err.value
    });
  }

  // Rate limit errors (from our custom rate limiter)
  if (err.code === 'RATE_LIMIT_EXCEEDED') {
    return res.status(429).json({
      success: false,
      error: 'Too many requests',
      code: 'RATE_LIMIT_EXCEEDED',
      message: err.message,
      retryAfter: err.retryAfter
    });
  }

  // Google Maps API errors
  if (err.code && err.code.includes('GOOGLE_API')) {
    return res.status(502).json({
      success: false,
      error: 'Location service temporarily unavailable',
      code: 'LOCATION_SERVICE_ERROR',
      message: 'Unable to process location-based request. Please try again later.'
    });
  }

  // Default server error
  const errorResponse = {
    success: false,
    error: 'Internal server error',
    code: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred. Please try again later.',
    request_id: req.id || `req-${Date.now()}`,
    timestamp: new Date().toISOString()
  };

  // Include debug information in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.debug = {
      message: err.message,
      stack: err.stack,
      details: err.toString()
    };
  }

  res.status(err.status || 500).json(errorResponse);
});

// ==================== SERVER INITIALIZATION ====================

/**
 * Start Express Server
 */
const server = app.listen(PORT, '0.0.0.0', () => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'CONNECTED' : 'DISCONNECTED';
  const googleMapsStatus = process.env.GOOGLE_MAPS_API_KEY ? 'CONFIGURED' : 'NOT CONFIGURED';
  const swaggerStatus = typeof swaggerSpec === 'object' && swaggerSpec.openapi ? 'AVAILABLE' : 'UNAVAILABLE';
  const environment = process.env.NODE_ENV || 'development';

  console.log(`
KZN Healthcare System Server
===========================
Server Status    : RUNNING
Port             : ${PORT}
Environment      : ${environment}
Database         : ${dbStatus}
Google Maps      : ${googleMapsStatus}
API Version      : 3.0.0
Rate Limiting    : ${environment === 'development' ? 'DEVELOPMENT MODE' : 'ENABLED'}
Swagger Docs     : ${swaggerStatus}

Access URLs:
API Server       : http://localhost:${PORT}
Health Check     : http://localhost:${PORT}/api/health
API Documentation: http://localhost:${PORT}/api/docs
System Info      : http://localhost:${PORT}/api/system/info
Swagger JSON     : http://localhost:${PORT}/api/swagger.json
Frontend         : ${process.env.CLIENT_URL || 'http://localhost:3000'}

Key Features:
- Unified healthcare facility and doctor management
- Location-based services with Google Maps integration
- JWT authentication with rate limiting
- Comprehensive search and filtering
- KZN district-based organization
- Affordable healthcare options
===========
    `);
});

// ==================== GRACEFUL SHUTDOWN HANDLING ====================

/**
 * Track if we're in the process of exiting
 */
let isExiting = false;

/**
 * Graceful Shutdown Handler
 * Ensures clean shutdown of server and database connections
 */
const gracefulShutdown = (signal) => {
  return () => {
    if (isExiting) {
      console.log(`Shutdown already in progress for ${signal}, ignoring duplicate signal`);
      return;
    }

    console.log(`\nReceived ${signal}. Starting graceful shutdown...`);
    isExiting = true;

    // Stop accepting new connections
    server.close((err) => {
      if (err) {
        console.error('Error closing HTTP server:', err);
        process.exit(1);
      }

      console.log('HTTP server closed successfully - no longer accepting new connections');

      // Close MongoDB connection
      mongoose.connection.close(false, (err) => {
        if (err) {
          console.error('Error closing MongoDB connection:', err);
          process.exit(1);
        }

        console.log('MongoDB connection closed successfully');
        console.log('Graceful shutdown completed successfully');
        process.exit(0);
      });
    });

    // Force shutdown after 10 seconds if graceful shutdown takes too long
    setTimeout(() => {
      console.error('Graceful shutdown timeout - forcing exit');
      process.exit(1);
    }, 10000);
  };
};

// Process event handlers for graceful shutdown
process.on('SIGINT', gracefulShutdown('SIGINT'));
process.on('SIGTERM', gracefulShutdown('SIGTERM'));

// Uncaught exception and unhandled rejection handlers
process.on('uncaughtException', (error) => {
  console.error('UNCAUGHT EXCEPTION:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION at:', promise, 'reason:', reason);
  process.exit(1);
});


export default app;