/**
 * @file src/routes/authRoutes.js
 * @description Authentication routes for the Healthcare Appointment Booking System.
 * Handles user registration, login, Google OAuth, session verification, and profile updates.
 * 
 * Features:
 * - JWT-based authentication
 * - Google OAuth integration
 * - Secure token refresh and logout
 * - Input validation and middleware protection
 * 
 * @version 4.0.0
 */

import express from "express";
import { body } from "express-validator";
import {
    signup,
    signin,
    refreshTokens,
    logout,
    getCurrentUser,
    verifySession,
    googleAuth,
    googleCallback,
    googleSignIn,
    updateProfile
} from "../controllers/authControllers.js";
import { verifyToken, optionalAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// ===============================
// Validation Rules
// ===============================
const signupValidation = [
    body("email").isEmail().normalizeEmail().withMessage("Valid email required"),
    body("password")
        .isLength({ min: 8 })
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage("Password must contain uppercase, lowercase, and number"),
    body("firstName").trim().isLength({ min: 1, max: 50 }).withMessage("First name required"),
    body("lastName").trim().isLength({ min: 1, max: 50 }).withMessage("Last name required")
];

const signinValidation = [
    body("email").isEmail().normalizeEmail().withMessage("Valid email required"),
    body("password").notEmpty().withMessage("Password is required")
];

const googleSignInValidation = [
    body("idToken").notEmpty().withMessage("Google ID token is required")
];

const profileValidation = [
    body("firstName").optional().trim().isLength({ max: 50 }),
    body("lastName").optional().trim().isLength({ max: 50 }),
    body("phoneNumber").optional().matches(/^(\+\d{1,3}[- ]?)?\d{10}$/),
    body("dateOfBirth").optional().isISO8601()
];

// ===============================
// Public Routes
// ===============================

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignupRequest'
 *     responses:
 *       201: { description: User created }
 *       400: { description: Validation error }
 *       409: { description: User exists }
 */
router.post("/signup", signupValidation, signup);

/**
 * @swagger
 * /api/auth/signin:
 *   post:
 *     summary: User login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SigninRequest'
 *     responses:
 *       200: { description: Login successful }
 *       401: { description: Invalid credentials }
 */
router.post("/signin", signinValidation, signin);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh JWT tokens
 *     tags: [Authentication]
 *     responses:
 *       200: { description: Token refreshed }
 *       401: { description: Invalid token }
 */
router.post("/refresh", refreshTokens);

/**
 * @swagger
 * /api/auth/verify:
 *   get:
 *     summary: Verify active session
 *     tags: [Authentication]
 *     responses:
 *       200: { description: Session valid }
 */
router.get("/verify", optionalAuth, verifySession);

// ===============================
// Google OAuth Routes
// ===============================

/**
 * @swagger
 * /api/auth/google:
 *   get:
 *     summary: Start Google OAuth flow
 *     tags: [Authentication]
 *     responses:
 *       302: { description: Redirect to Google }
 */
router.get("/google", googleAuth);

/**
 * @swagger
 * /api/auth/google/callback:
 *   get:
 *     summary: Handle Google OAuth callback
 *     tags: [Authentication]
 *     responses:
 *       302: { description: Redirect after login }
 */
router.get("/google/callback", googleCallback);

/**
 * @swagger
 * /api/auth/google:
 *   post:
 *     summary: Authenticate with Google ID token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GoogleAuthRequest'
 *     responses:
 *       200: { description: Google login success }
 *       401: { description: Invalid token }
 */
router.post("/google", googleSignInValidation, googleSignIn);

// ===============================
// Protected Routes
// ===============================

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Authentication]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Logged out }
 *       401: { description: Unauthorized }
 */
router.post("/logout", verifyToken, logout);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get authenticated user
 *     tags: [Authentication]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Profile retrieved }
 *       401: { description: Unauthorized }
 */
router.get("/me", verifyToken, getCurrentUser);

/**
 * @swagger
 * /api/auth/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Authentication]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProfileUpdateRequest'
 *     responses:
 *       200: { description: Profile updated }
 *       400: { description: Validation error }
 *       401: { description: Unauthorized }
 */
router.put("/profile", verifyToken, profileValidation, updateProfile);

// ===============================
// Health Check
// ===============================

/**
 * @swagger
 * /api/auth/health:
 *   get:
 *     summary: Auth service health check
 *     tags: [System]
 *     responses:
 *       200: { description: Service healthy }
 */
router.get("/health", (req, res) => {
    res.status(200).json({
        status: "healthy",
        service: "authentication",
        version: "3.0.0",
        timestamp: new Date().toISOString(),
        features: {
            localAuth: true,
            googleOAuth: true,
            jwt: true,
            refreshTokens: true,
            profileManagement: true
        }
    });
});

export default router;
