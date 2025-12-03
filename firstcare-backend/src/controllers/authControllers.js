// firstcare-backend/src/controllers/authControllers.js

/**
 * JWT Authentication Controllers for KZN Healthcare Appointment Booking System
 * Enhanced with KZN District Integration and Google OAuth Support
 * 
 * @file src/controllers/authControllers.js
 * @description Handles all authentication operations including local auth, Google OAuth, and session management with KZN healthcare integration
 * 
 * Features:
 * - Local email/password authentication with KZN profile support
 * - Google OAuth integration with KZN district defaults
 * - JWT token management
 * - Session verification
 * - User profile management with KZN healthcare data
 * 
 * Security Features:
 * - Password hashing with bcrypt
 * - JWT token validation
 * - Input validation and sanitization
 * - Rate limiting protection
 * - Secure cookie handling
 * - KZN district access control
 * 
 * @version 4.0.0
 * @module AuthControllers
 * @author Healthcare System - KZN Implementation
 */

import User from '../models/user.js';
import { hashPassword, verifyPassword } from '../utils/passwordUtils.js';
import { generateAccessToken, generateRefreshToken, setAuthCookies, clearAuthCookies, verifyRefreshToken } from '../utils/jwtUtils.js';
import { validationResult } from 'express-validator';
import axios from 'axios';
import { OAuth2Client } from 'google-auth-library';

// Create Google OAuth client
const googleClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.SERVER_URL || 'http://localhost:5000'}/api/auth/google/callback`
);

/**
 * Generate a random password for OAuth users
 */
const generateRandomPassword = () => {
    return `oauth_${Math.random().toString(36).slice(-16)}_${Date.now()}`;
};

/**
 * Get default values for KZN profile
 */
const getDefaultKZNProfile = () => {
    return {
        phoneNumber: '+27000000000', // Temporary default
        address: 'Address to be completed', // Temporary default
        dateOfBirth: new Date('1990-01-01'), // Temporary default
        locationData: {
            healthDistrict: 'ethekwini', // Default to most populated district
            subLocation: 'Durban Central',
            preferredFacilityType: 'public-clinic',
            districtType: 'metro'
        },
        healthcarePreferences: {
            hasMedicalAid: false,
            preferredCommunication: 'email',
            consentForResearch: false,
            emergencyAccessConsent: true
        },
        preferredLanguage: 'english'
    };
};

/**
 * Helper function to find or create Google user with KZN profile defaults
 */
const findOrCreateGoogleUser = async (email, given_name, family_name, picture, googleId) => {
    try {
        // Enhanced name handling
        let firstName = given_name || '';
        let lastName = family_name || '';

        // Set safe defaults
        if (!firstName || firstName.trim() === '') firstName = 'Google';
        if (!lastName || lastName.trim() === '') lastName = 'User';

        // Find user by email or googleId
        let user = await User.findOne({
            $or: [
                { email },
                { googleId }
            ]
        });

        if (!user) {
            // Get default KZN profile values
            const defaultProfile = getDefaultKZNProfile();

            // Generate a random password for OAuth users
            const tempPassword = await hashPassword(generateRandomPassword());

            // Create new user from Google data with KZN defaults
            user = new User({
                email,
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                profilePicture: picture || '',
                googleId,
                provider: 'google',
                roles: ['patient'],
                isActive: true,
                emailVerified: true,
                lastLogin: new Date(),
                isProfileComplete: false,

                // KZN Required Fields with defaults
                password: tempPassword,
                phoneNumber: defaultProfile.phoneNumber,
                address: defaultProfile.address,
                dateOfBirth: defaultProfile.dateOfBirth,

                // KZN Location Data
                locationData: defaultProfile.locationData,

                // Healthcare Preferences
                healthcarePreferences: defaultProfile.healthcarePreferences,

                // Language Preference
                preferredLanguage: defaultProfile.preferredLanguage
            });

            await user.save();
            console.log('New KZN user created from Google OAuth:', email);
        } else {
            // Update existing user with Google data
            user.googleId = googleId;
            user.profilePicture = picture || user.profilePicture;
            user.lastLogin = new Date();
            user.emailVerified = true;
            user.provider = 'google';

            // Update names if they were incomplete
            if (!user.firstName || user.firstName === 'Google') {
                user.firstName = firstName.trim();
            }
            if (!user.lastName || user.lastName === 'User') {
                user.lastName = lastName.trim();
            }

            // Ensure required fields exist for existing users
            if (!user.phoneNumber) {
                user.phoneNumber = '+27000000000';
            }
            if (!user.address) {
                user.address = 'Address to be completed';
            }
            if (!user.dateOfBirth) {
                user.dateOfBirth = new Date('1990-01-01');
            }
            if (!user.locationData) {
                user.locationData = getDefaultKZNProfile().locationData;
            }

            await user.save();
            console.log('Existing KZN user updated from Google OAuth:', email);
        }

        return user;
    } catch (error) {
        console.error('Error in findOrCreateGoogleUser:', error);

        if (error.code === 11000) {
            const errorMsg = 'Duplicate key error - check database indexes';
            console.error(errorMsg);
            throw new Error(errorMsg);
        }

        throw error;
    }
};

/**
 * Verify reCAPTCHA token
 */
const verifyRecaptcha = async (recaptchaToken) => {
    try {
        if (!recaptchaToken || recaptchaToken === 'dev-mode-bypass') {
            return true;
        }

        const response = await axios.post(
            `https://www.google.com/recaptcha/api/siteverify`,
            null,
            {
                params: {
                    secret: process.env.RECAPTCHA_SECRET_KEY,
                    response: recaptchaToken
                }
            }
        );

        return response.data.success && response.data.score > 0.5;
    } catch (error) {
        console.error("reCAPTCHA verification error:", error);
        return false;
    }
};

/**
 * User Signup Controller with KZN Integration
 * @route POST /api/auth/signup
 * @access Public
 */
export const signup = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: "Validation failed",
                code: "VALIDATION_ERROR",
                details: errors.array()
            });
        }

        const { email, password, firstName, lastName, recaptchaToken } = req.body;

        // Verify reCAPTCHA if enabled
        if (process.env.RECAPTCHA_SECRET_KEY) {
            const recaptchaVerified = await verifyRecaptcha(recaptchaToken);
            if (!recaptchaVerified) {
                return res.status(400).json({
                    error: "reCAPTCHA verification failed",
                    code: "RECAPTCHA_FAILED"
                });
            }
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                error: "User already exists with this email",
                code: "USER_EXISTS"
            });
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create user with KZN defaults
        const defaultProfile = getDefaultKZNProfile();

        const user = new User({
            email,
            password: hashedPassword,
            firstName,
            lastName,
            roles: ['patient'],
            isActive: true,
            emailVerified: false,
            provider: 'local',
            isProfileComplete: false,

            // KZN Required Fields with defaults
            phoneNumber: defaultProfile.phoneNumber,
            address: defaultProfile.address,
            dateOfBirth: defaultProfile.dateOfBirth,

            // KZN Location Data
            locationData: defaultProfile.locationData,

            // Healthcare Preferences
            healthcarePreferences: defaultProfile.healthcarePreferences,

            // Language Preference
            preferredLanguage: defaultProfile.preferredLanguage
        });

        await user.save();

        // Generate tokens
        const accessToken = generateAccessToken(user._id, user.email, user.roles);
        const refreshToken = generateRefreshToken(user._id);

        // Set cookies
        setAuthCookies(res, accessToken, refreshToken);

        // Return user data (excluding password)
        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(201).json({
            message: "User created successfully",
            user: userResponse,
            tokens: {
                accessToken,
                refreshToken
            }
        });

    } catch (error) {
        console.error("Signup error:", error);

        if (error.code === 11000) {
            return res.status(409).json({
                error: "User already exists",
                code: "DUPLICATE_USER"
            });
        }

        res.status(500).json({
            error: "Internal server error during signup",
            code: "SIGNUP_ERROR"
        });
    }
};

/**
 * User Signin Controller
 * @route POST /api/auth/signin
 * @access Public
 */
export const signin = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: "Validation failed",
                code: "VALIDATION_ERROR",
                details: errors.array()
            });
        }

        const { email, password, recaptchaToken } = req.body;

        // Verify reCAPTCHA if enabled
        if (process.env.RECAPTCHA_SECRET_KEY) {
            const recaptchaVerified = await verifyRecaptcha(recaptchaToken);
            if (!recaptchaVerified) {
                return res.status(400).json({
                    error: "reCAPTCHA verification failed",
                    code: "RECAPTCHA_FAILED"
                });
            }
        }

        // Find user with password
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({
                error: "Invalid email or password",
                code: "INVALID_CREDENTIALS"
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(403).json({
                error: "Account is deactivated",
                code: "ACCOUNT_DEACTIVATED"
            });
        }

        // Verify password
        const isPasswordValid = await verifyPassword(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                error: "Invalid email or password",
                code: "INVALID_CREDENTIALS"
            });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate tokens
        const accessToken = generateAccessToken(user._id, user.email, user.roles);
        const refreshToken = generateRefreshToken(user._id);

        // Set cookies
        setAuthCookies(res, accessToken, refreshToken);

        // Return user data (excluding password)
        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(200).json({
            message: "Login successful",
            user: userResponse,
            tokens: {
                accessToken,
                refreshToken
            }
        });

    } catch (error) {
        console.error("Signin error:", error);
        res.status(500).json({
            error: "Internal server error during signin",
            code: "SIGNIN_ERROR"
        });
    }
};

/**
 * Refresh Tokens Controller
 * @route POST /api/auth/refresh
 * @access Public
 */
export const refreshTokens = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({
                error: "Refresh token required",
                code: "MISSING_REFRESH_TOKEN"
            });
        }

        // Verify refresh token
        const decoded = verifyRefreshToken(refreshToken);

        // Find user
        const user = await User.findById(decoded.userId);
        if (!user || !user.isActive) {
            return res.status(401).json({
                error: "Invalid refresh token",
                code: "INVALID_REFRESH_TOKEN"
            });
        }

        // Generate new tokens
        const newAccessToken = generateAccessToken(user._id, user.email, user.roles);
        const newRefreshToken = generateRefreshToken(user._id);

        // Set new cookies
        setAuthCookies(res, newAccessToken, newRefreshToken);

        res.json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        });

    } catch (error) {
        console.error("Token refresh error:", error);

        // Clear invalid tokens
        clearAuthCookies(res);

        res.status(401).json({
            error: "Invalid or expired refresh token",
            code: "INVALID_REFRESH_TOKEN"
        });
    }
};

/**
 * User Logout Controller
 * @route POST /api/auth/logout
 * @access Private
 */
export const logout = (req, res) => {
    clearAuthCookies(res);

    res.status(200).json({
        message: "Logout successful"
    });
};

/**
 * Get Current User Controller
 * @route GET /api/auth/me
 * @access Private
 */
export const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({
                error: "User not found",
                code: "USER_NOT_FOUND"
            });
        }

        res.status(200).json({
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                fullName: user.fullName,
                roles: user.roles,
                profilePicture: user.profilePicture,
                lastLogin: user.lastLogin,
                provider: user.provider,
                isProfileComplete: user.isProfileComplete,
                phoneNumber: user.phoneNumber,
                dateOfBirth: user.dateOfBirth,
                address: user.address,
                locationData: user.locationData,
                healthcarePreferences: user.healthcarePreferences,
                preferredLanguage: user.preferredLanguage
            }
        });

    } catch (error) {
        console.error("Get current user error:", error);
        res.status(500).json({
            error: "Internal server error",
            code: "SERVER_ERROR"
        });
    }
};

/**
 * Verify Session Controller
 * @route GET /api/auth/verify
 * @access Public
 */
export const verifySession = async (req, res) => {
    try {
        console.log('=== VERIFY SESSION CALLED ===');
        console.log('req.user:', req.user);
        console.log('req.cookies.accessToken:', req.cookies.accessToken ? 'present' : 'missing');

        const accessToken = req.cookies.accessToken;

        if (!accessToken) {
            console.log('No access token found');
            return res.status(200).json({
                authenticated: false,
                message: "No active session"
            });
        }

        // Check if user is attached by middleware
        if (!req.user || !req.user.userId) {
            console.log('No user attached to request');
            return res.status(200).json({
                authenticated: false,
                message: "Invalid session"
            });
        }

        // Find user
        const user = await User.findById(req.user.userId);

        if (!user || !user.isActive) {
            console.log('User not found or inactive');
            return res.status(200).json({
                authenticated: false,
                message: "User not found or inactive"
            });
        }

        console.log('Session verified successfully for user:', user.email);

        res.status(200).json({
            authenticated: true,
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                fullName: user.fullName,
                roles: user.roles,
                profilePicture: user.profilePicture,
                provider: user.provider,
                isProfileComplete: user.isProfileComplete,
                locationData: user.locationData
            },
            message: "Valid session"
        });

    } catch (error) {
        console.error("Session verification error:", error);
        res.status(200).json({
            authenticated: false,
            message: "Session verification failed"
        });
    }
};

/**
 * Update User Profile Controller with KZN Integration
 * @route PUT /api/auth/profile
 * @access Private
 */
export const updateProfile = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: "Validation failed",
                code: "VALIDATION_ERROR",
                details: errors.array()
            });
        }

        const {
            firstName,
            lastName,
            phoneNumber,
            dateOfBirth,
            address,
            medicalHistory,
            allergies,
            healthDistrict,
            subLocation,
            preferredFacilityType,
            hasMedicalAid,
            medicalAidScheme,
            emergencyContact,
            preferredLanguage
        } = req.body;

        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({
                error: "User not found",
                code: "USER_NOT_FOUND"
            });
        }

        console.log('Updating profile with data:', {
            firstName, lastName, phoneNumber, healthDistrict, subLocation, preferredFacilityType,
            emergencyContact, hasMedicalAid, isProfileComplete: user.isProfileComplete
        });

        // Update basic user fields with proper validation
        if (firstName !== undefined) user.firstName = firstName;
        if (lastName !== undefined) user.lastName = lastName;
        if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
        if (dateOfBirth !== undefined) user.dateOfBirth = new Date(dateOfBirth);
        if (address !== undefined) user.address = address;
        if (preferredLanguage !== undefined) user.preferredLanguage = preferredLanguage;

        // Update KZN location data
        if (healthDistrict !== undefined || subLocation !== undefined || preferredFacilityType !== undefined) {
            user.locationData = user.locationData || {};
            if (healthDistrict !== undefined) user.locationData.healthDistrict = healthDistrict;
            if (subLocation !== undefined) user.locationData.subLocation = subLocation;
            if (preferredFacilityType !== undefined) user.locationData.preferredFacilityType = preferredFacilityType;

            // Set district type based on health district
            if (healthDistrict) {
                const districtTypes = {
                    'ethekwini': 'metro',
                    'amajuba': 'inland',
                    'ilembe': 'coastal',
                    'king-cetshwayo': 'coastal',
                    'umgungundlovu': 'inland',
                    'umkhanyakude': 'rural',
                    'ugu': 'coastal',
                    'umzinyathi': 'rural',
                    'uthukela': 'inland',
                    'zululand': 'rural'
                };
                user.locationData.districtType = districtTypes[healthDistrict] || 'urban';
            }
        }

        // Update healthcare preferences - FIXED: emergencyContact is now a direct string field
        if (hasMedicalAid !== undefined || medicalAidScheme !== undefined) {
            user.healthcarePreferences = user.healthcarePreferences || {};
            if (hasMedicalAid !== undefined) user.healthcarePreferences.hasMedicalAid = Boolean(hasMedicalAid);
            if (medicalAidScheme !== undefined) user.healthcarePreferences.medicalAidScheme = medicalAidScheme;
        }

        // Update emergency contact as direct string field - FIXED
        if (emergencyContact !== undefined) {
            user.emergencyContact = emergencyContact; // Now a simple string
        }

        // Update medical profile if provided
        if (medicalHistory !== undefined) {
            user.medicalHistory = user.medicalHistory || {};
            user.medicalHistory.conditions = medicalHistory.split(',').map(condition => ({
                name: condition.trim(),
                diagnosedDate: new Date(),
                severity: 'moderate',
                isActive: true
            }));
        }

        if (allergies !== undefined) {
            user.allergies = allergies.split(',').map(allergy => ({
                allergen: allergy.trim(),
                severity: 'moderate',
                reaction: 'Unknown'
            }));
        }

        // Mark profile as complete if all required KZN fields are present - FIXED
        const hasRequiredFields = user.firstName && user.lastName && user.phoneNumber &&
            user.dateOfBirth && user.address && user.locationData?.healthDistrict &&
            user.locationData?.subLocation && user.locationData?.preferredFacilityType;

        // FIXED: Ensure this is a proper boolean
        user.isProfileComplete = Boolean(hasRequiredFields);

        console.log('Profile completion check:', {
            firstName: !!user.firstName,
            lastName: !!user.lastName,
            phoneNumber: !!user.phoneNumber,
            dateOfBirth: !!user.dateOfBirth,
            address: !!user.address,
            healthDistrict: !!user.locationData?.healthDistrict,
            subLocation: !!user.locationData?.subLocation,
            preferredFacilityType: !!user.locationData?.preferredFacilityType,
            isProfileComplete: user.isProfileComplete
        });

        await user.save();

        // Return updated user data
        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(200).json({
            message: "KZN profile updated successfully",
            user: userResponse,
            isProfileComplete: user.isProfileComplete
        });

    } catch (error) {
        console.error("Update profile error:", error);

        // More detailed error response
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                error: "Profile validation failed",
                code: "VALIDATION_ERROR",
                details: Object.values(error.errors).map(err => ({
                    field: err.path,
                    message: err.message,
                    value: err.value
                }))
            });
        }

        res.status(500).json({
            error: "Internal server error during profile update",
            code: "PROFILE_UPDATE_ERROR",
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Initiate Google OAuth Flow Controller
 * @route GET /api/auth/google
 * @access Public
 */
export const googleAuth = (req, res) => {
    try {
        const authUrl = googleClient.generateAuthUrl({
            access_type: 'offline',
            scope: [
                'https://www.googleapis.com/auth/userinfo.email',
                'https://www.googleapis.com/auth/userinfo.profile'
            ],
            prompt: 'consent',
            include_granted_scopes: true
        });

        console.log('Redirecting to Google OAuth:', authUrl);
        res.redirect(authUrl);
    } catch (error) {
        console.error('Google OAuth initiation error:', error);
        res.redirect(`${process.env.CLIENT_URL}/auth/signIn?error=oauth_init_failed`);
    }
};

/**
 * Handle Google OAuth Callback Controller - Updated for KZN
 * @route GET /api/auth/google/callback
 * @access Public
 */
export const googleCallback = async (req, res) => {
    try {
        const { code } = req.query;

        console.log('Google OAuth callback received with code:', code ? 'present' : 'missing');

        if (!code) {
            console.error('Google OAuth callback missing code');
            return res.redirect(`${process.env.CLIENT_URL}/auth/signIn?error=missing_code`);
        }

        // Exchange code for tokens
        const { tokens } = await googleClient.getToken(code);
        googleClient.setCredentials(tokens);

        // Get user info from Google
        const ticket = await googleClient.verifyIdToken({
            idToken: tokens.id_token,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        const { email, given_name, family_name, picture, sub, name } = payload;

        console.log('Google OAuth user:', email);

        // Enhanced name handling with validation
        let firstName = given_name || '';
        let lastName = family_name || '';

        // If Google doesn't provide separate names, try to split the full name
        if ((!firstName || !lastName) && name) {
            const nameParts = name.split(' ');
            firstName = nameParts[0] || '';
            lastName = nameParts.slice(1).join(' ') || '';
        }

        // Set safe defaults if still missing
        if (!firstName || firstName.trim() === '') firstName = 'Google';
        if (!lastName || lastName.trim() === '') lastName = 'User';

        // Find or create user with KZN profile
        let user = await findOrCreateGoogleUser(email, firstName, lastName, picture, sub);

        // Generate JWT tokens
        const accessToken = generateAccessToken(user._id, user.email, user.roles);
        const refreshToken = generateRefreshToken(user._id);

        // Set cookies
        setAuthCookies(res, accessToken, refreshToken);

        console.log('Google OAuth successful, user profile complete:', user.isProfileComplete);

        // Redirect based on profile completion status
        if (user.isProfileComplete) {
            res.redirect(`${process.env.CLIENT_URL}/`);
        } else {
            // Redirect to KZN profile completion page
            res.redirect(`${process.env.CLIENT_URL}/auth/bookregister/register`);
        }

    } catch (error) {
        console.error('Google OAuth callback error:', error);

        // Handle specific error cases
        let errorType = 'oauth_failed';
        if (error.message.includes('redirect_uri')) {
            errorType = 'redirect_uri_mismatch';
        } else if (error.name === 'ValidationError') {
            errorType = 'user_creation_failed';
            console.error('Validation error details:', error.errors);
        } else if (error.code === 11000) {
            errorType = 'duplicate_user';
            console.error('Duplicate user error - check database indexes');
        }

        res.redirect(`${process.env.CLIENT_URL}/auth/signIn?error=${errorType}`);
    }
};

/**
 * Direct Google Token Verification Controller
 * @route POST /api/auth/google
 * @access Public
 */
export const googleSignIn = async (req, res) => {
    try {
        const { idToken } = req.body;

        if (!idToken) {
            return res.status(400).json({
                error: "Google ID token required",
                code: "MISSING_ID_TOKEN"
            });
        }

        // Verify the Google ID token
        let payload;
        try {
            const ticket = await googleClient.verifyIdToken({
                idToken: idToken,
                audience: process.env.GOOGLE_CLIENT_ID
            });
            payload = ticket.getPayload();
        } catch (verifyError) {
            console.error('Google ID token verification failed:', verifyError);
            return res.status(401).json({
                error: "Invalid Google ID token",
                code: "INVALID_ID_TOKEN"
            });
        }

        const { email, given_name, family_name, picture, sub } = payload;

        if (!email) {
            return res.status(400).json({
                error: "No email found in Google token",
                code: "NO_EMAIL_IN_TOKEN"
            });
        }

        // Find or create user
        let user;
        try {
            user = await findOrCreateGoogleUser(email, given_name, family_name, picture, sub);
        } catch (userError) {
            console.error('User creation/update error:', userError);
            return res.status(500).json({
                error: "Failed to process user account",
                code: "USER_PROCESSING_ERROR"
            });
        }

        // Generate JWT tokens
        const accessToken = generateAccessToken(user._id, user.email, user.roles);
        const refreshToken = generateRefreshToken(user._id);

        // Set cookies
        setAuthCookies(res, accessToken, refreshToken);

        // Return user data
        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(200).json({
            message: "Google sign-in successful",
            user: userResponse,
            tokens: {
                accessToken,
                refreshToken
            }
        });

    } catch (error) {
        console.error('Google sign-in error:', error);
        res.status(401).json({
            error: "Google authentication failed",
            code: "GOOGLE_AUTH_FAILED",
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};