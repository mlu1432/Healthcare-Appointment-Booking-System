/**
 * Authentication Routes
 * 
 * Endpoints:
 * - POST /session: Create new session (login)
 * - DELETE /session: Terminate session (logout)
 * - GET /me: Get current user profile
 * - GET /session/verify: Verify session status (public)
 */
import express from 'express';
import {
    createSession,
    terminateSession,
    getCurrentUser,
    verifySession
} from '../controllers/authControllers.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/session', createSession);
router.get('/session/verify', verifySession);

// Protected routes (requires authentication)
router.delete('/session', verifyToken, terminateSession);
router.get('/me', verifyToken, getCurrentUser);

export default router;