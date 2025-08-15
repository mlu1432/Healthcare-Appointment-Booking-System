/**
 * Authentication Routes
 * 
 * Endpoints:
 * - POST /session: Create new session (login)
 * - DELETE /session: Terminate session (logout)
 * - GET /me: Get current user profile
 */
import express from 'express';
import {
    createSession,
    terminateSession,
    getCurrentUser
} from '../controllers/authControllers.js';

// uses tool express (router)
const router = express.Router();

// public routes
router.post('/session', createSession);

// protected routes (requires authentication)
router.delete('/session', verifyToken, terminateSession);
router.get('/me', verifyToken, getCurrentUser);

export default router;