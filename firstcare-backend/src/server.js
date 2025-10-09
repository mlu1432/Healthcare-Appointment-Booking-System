/**
 * Express Server Entry Point
 *
 * @file src/server.js
 * @description Main server configuration and startup
 */
import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import corsMiddleware from './middleware/cors.js';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import mongoose from 'mongoose';

// Step 1: load environment variables from .env file
dotenv.config();

// Step 2: creates an Express application instance
const app = express();
const PORT = process.env.PORT || 5000;

/**
 * Basic security headers middleware
 */
const securityHeaders = (req, res, next) => {
  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  next();
};

/**
 * Simple rate limiting middleware
 */
const createRateLimiter = (windowMs, max, message) => {
  const requests = new Map();
  
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Clean up old requests
    const recentRequests = (requests.get(ip) || []).filter(time => time > windowStart);
    
    if (recentRequests.length >= max) {
      return res.status(429).json(message);
    }
    
    recentRequests.push(now);
    requests.set(ip, recentRequests);
    next();
  };
};

// Apply security headers
app.use(securityHeaders);

// Apply rate limiting
app.use(createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  100, // max 100 requests per window
  {
    error: "Too many requests",
    code: "RATE_LIMITED",
    message: "Please try again later."
  }
));

// Auth-specific rate limiting
app.use('/api/auth', createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  5, // max 5 auth requests per window
  {
    error: "Too many authentication attempts",
    code: "AUTH_RATE_LIMITED",
    message: "Please try again later."
  }
));

/**
 * Middleware Configuration
 */
app.use(express.json({
  limit: '10mb'
}));

app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(process.env.COOKIE_SECRET || 'fallback-secret'));

// Use CORS middleware
app.use(corsMiddleware);

// Initialize database connection
connectDB();

// MongoDB connection event handlers
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

mongoose.connection.on('connected', () => {
  console.log('MongoDB connected successfully');
});

// Track if we're in the process of exiting
let isExiting = false;

/**
 * Route Registration
 */
app.use('/api/auth', authRoutes);

/**
 * Health Check Endpoint
 */
app.get('/api/health', async (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const statusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  res.status(200).json({
    status: 'active',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: statusMap[dbStatus] || 'unknown',
    uptime: process.uptime(),
    version: '1.0.0'
  });
});

/**
 * 404 Handler
 */
app.use((req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
    code: "ENDPOINT_NOT_FOUND",
    path: req.originalUrl
  });
});

/**
 * Global Error Handler
 */
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: "Validation Error",
      code: "VALIDATION_ERROR",
      details: Object.values(err.errors).map(e => e.message)
    });
  }
  
  // Mongoose duplicate key error
  if (err.code === 11000) {
    return res.status(409).json({
      error: "Duplicate resource",
      code: "DUPLICATE_RESOURCE",
      message: "A resource with this identifier already exists"
    });
  }
  
  // Default error
  res.status(err.status || 500).json({
    error: "Internal server error",
    code: "SERVER_ERROR",
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

/**
 * Start Express Server
 */
const server = app.listen(PORT, () => {
  console.log(`
    Server running on port ${PORT}
    Environment: ${process.env.NODE_ENV || 'development'}
    Health check: http://localhost:${PORT}/api/health
  `);
});

/**
 * Graceful Shutdown Handling
 */
const gracefulShutdown = (signal) => {
  return () => {
    console.log(`\nReceived ${signal}. Closing connections gracefully...`);
    isExiting = true;

    // Close MongoDB connection
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');

      // Stop Express server
      server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });

      // Force close after 10 seconds
      setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    });
  };
};

// Handle process termination signals
process.on('SIGINT', gracefulShutdown('SIGINT'));
process.on('SIGTERM', gracefulShutdown('SIGTERM'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

export default app;