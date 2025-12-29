/**
 * User Management Routes for Healthcare Appointment Booking System
 * 
 * @file src/routes/userRoutes.js
 * @description Handles all user profile management routes including:
 * - User profile CRUD operations
 * - Medical profile management
 * - Admin user management
 * - Role-based access control
 * - KZN district-based user management
 * 
 * Security Features:
 * - JWT authentication required for all routes
 * - Role-based authorization
 * - Input validation and sanitization
 * - User isolation (users can only access their own data unless admin)
 * - District-based access control for healthcare workers
 * 
 * @version 5.0.0
 * @module UserRoutes
 */
import express from 'express';
import {
  completeUserProfile,
  getCurrentUser,
  getUserById,
  updateUserProfile,
  deleteUserAccount,
  getAllUsers,
  updateUserRoles,
  getUserStats,
  getUsersByDistrict,
  updateMedicalProfile,
  getDistrictStatistics,
  testProfileCompletion,
  healthCheck
} from '../controllers/userController.js';
import { verifyToken, requireRole, requireAllRoles } from '../middleware/authMiddleware.js';
import {
  validateProfileCompletion,
  validateMedicalProfile,
  handleValidationErrors
} from '../middleware/validationMiddleware.js';
import { body, param, query, validationResult } from 'express-validator';

const router = express.Router();

// =============================================
// INPUT VALIDATION RULES
// =============================================

const userProfileValidation = [
  body('phoneNumber')
    .optional()
    .matches(/^(\+\d{1,3}[- ]?)?\d{10}$/)
    .withMessage('Please provide a valid phone number'),
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date of birth'),
  body('bloodType')
    .optional()
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Invalid blood type'),
  body('allergies')
    .optional()
    .isArray()
    .withMessage('Allergies must be an array'),
  body('allergies.*.name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Allergy name is required'),
  body('allergies.*.severity')
    .optional()
    .isIn(['mild', 'moderate', 'severe'])
    .withMessage('Allergy severity must be mild, moderate, or severe'),
  handleValidationErrors
];

const updateRolesValidation = [
  body('roles')
    .isArray({ min: 1 })
    .withMessage('Roles must be a non-empty array'),
  body('roles.*')
    .isIn(['patient', 'provider', 'admin', 'health-worker'])
    .withMessage('Invalid role. Must be patient, provider, admin, or health-worker'),
  handleValidationErrors
];

const userIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid user ID format'),
  handleValidationErrors
];

const districtValidation = [
  param('district')
    .isIn(['amajuba', 'ethekwini', 'ilembe', 'king-cetshwayo', 'umgungundlovu', 'umkhanyakude', 'ugu', 'umzinyathi', 'uthukela', 'zululand'])
    .withMessage('Invalid KZN district'),
  handleValidationErrors
];

// =============================================
// MIDDLEWARE CONFIGURATION
// =============================================

// All user routes require authentication
router.use(verifyToken);

// =============================================
// PROTECTED USER PROFILE ROUTES
// =============================================

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Get current authenticated user's complete profile
 *     description: Retrieve the complete profile of the currently authenticated user including KZN location data and medical information
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProfileResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/me', getCurrentUser);

/**
 * @swagger
 * /api/users/profile/complete:
 *   post:
 *     summary: Complete user profile setup
 *     description: Complete the user profile with KZN location data, contact information, and basic healthcare preferences required for booking appointments
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *               - dateOfBirth
 *               - gender
 *               - locationData
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 example: "+27821234567"
 *                 description: South African phone number with country code
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *                 example: "1990-01-15"
 *               gender:
 *                 type: string
 *                 enum: [male, female, other, prefer-not-to-say]
 *                 example: "male"
 *               preferredLanguage:
 *                 type: string
 *                 enum: [english, zulu, afrikaans, xhosa, sotho]
 *                 example: "english"
 *               locationData:
 *                 type: object
 *                 required:
 *                   - healthDistrict
 *                   - subLocation
 *                   - preferredFacilityType
 *                 properties:
 *                   healthDistrict:
 *                     type: string
 *                     enum: [amajuba, ethekwini, ilembe, king-cetshwayo, umgungundlovu, umkhanyakude, ugu, umzinyathi, uthukela, zululand]
 *                     example: "ethekwini"
 *                   subLocation:
 *                     type: string
 *                     example: "Durban Central"
 *                   preferredFacilityType:
 *                     type: string
 *                     enum: [public-clinic, public-hospital, unjani-clinic, private-practice, private-hospital, specialist-center]
 *                     example: "public-hospital"
 *                   districtType:
 *                     type: string
 *                     enum: [urban, rural, metro, coastal, inland]
 *                     example: "urban"
 *     responses:
 *       200:
 *         description: Profile completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProfileResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post('/profile/complete', validateProfileCompletion, completeUserProfile);

/**
 * @swagger
 * /api/users/profile/medical:
 *   put:
 *     summary: Update user medical profile
 *     description: Update or add medical history, conditions, allergies, and healthcare preferences for better healthcare service matching
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               medicalHistory:
 *                 type: object
 *                 properties:
 *                   bloodType:
 *                     type: string
 *                     enum: [A+, A-, B+, B-, AB+, AB-, O+, O-, unknown]
 *                     example: "O+"
 *                   conditions:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                           example: "Diabetes Type 2"
 *                         category:
 *                           type: string
 *                           enum: [communicable, ncd, mental, other]
 *                           example: "ncd"
 *                         severity:
 *                           type: string
 *                           enum: [mild, moderate, severe, critical]
 *                           example: "moderate"
 *                         diagnosedDate:
 *                           type: string
 *                           format: date
 *                         isActive:
 *                           type: boolean
 *                         treatingFacility:
 *                           type: string
 *                   chronicMedications:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                           example: "Metformin"
 *                         category:
 *                           type: string
 *                           enum: [hiv, tb, hypertension, diabetes, mental, traditional, other]
 *                           example: "diabetes"
 *                         dosage:
 *                           type: string
 *                           example: "500mg"
 *                         frequency:
 *                           type: string
 *                           example: "Twice daily"
 *                         startDate:
 *                           type: string
 *                           format: date
 *                         prescribedBy:
 *                           type: string
 *                         prescribedAt:
 *                           type: string
 *                         isActive:
 *                           type: boolean
 *                   hivStatus:
 *                     type: string
 *                     enum: [negative, positive, positive-untreated, unknown, '']
 *                     example: "negative"
 *                   tbHistory:
 *                     type: string
 *                     enum: [never, past, current, exposed, unknown, '']
 *                     example: "never"
 *               allergies:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     allergen:
 *                       type: string
 *                       example: "Penicillin"
 *                     type:
 *                       type: string
 *                       enum: [environmental, food, drug, other]
 *                       example: "drug"
 *                     severity:
 *                       type: string
 *                       enum: [mild, moderate, severe, anaphylactic]
 *                       example: "severe"
 *                     reaction:
 *                       type: string
 *                       example: "Rash and breathing difficulty"
 *                     firstObserved:
 *                       type: string
 *                       format: date
 *                     requiresEpipen:
 *                       type: boolean
 *               healthcarePreferences:
 *                 type: object
 *                 properties:
 *                   hasMedicalAid:
 *                     type: boolean
 *                     example: true
 *                   medicalAidScheme:
 *                     type: string
 *                     example: "Discovery Health"
 *                   medicalAidNumber:
 *                     type: string
 *                     example: "123456789"
 *                   primaryCareFacility:
 *                     type: string
 *                     example: "Durban Central Clinic"
 *                   preferredCommunication:
 *                     type: string
 *                     enum: [sms, email, phone, whatsapp, in-app]
 *                     example: "sms"
 *                   appointmentReminders:
 *                     type: boolean
 *                     example: true
 *                   healthTips:
 *                     type: boolean
 *                     example: false
 *                   consentForResearch:
 *                     type: boolean
 *                     example: false
 *                   emergencyAccessConsent:
 *                     type: boolean
 *                     example: true
 *                   dataSharingConsent:
 *                     type: boolean
 *                     example: false
 *                   traditionalMedicineUse:
 *                     type: boolean
 *                     example: true
 *                   traditionalMedicineDetails:
 *                     type: string
 *                     example: "African potato, cancer bush"
 *     responses:
 *       200:
 *         description: Medical profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Medical profile updated successfully"
 *                 user:
 *                   type: object
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
router.put('/profile/medical', validateMedicalProfile, updateMedicalProfile);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     description: Retrieve user profile by ID. Users can access their own profile, admins can access any profile, healthcare providers can access patient profiles in their district.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID (MongoDB ObjectId)
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProfileResponse'
 *       403:
 *         description: Access denied - insufficient permissions
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/:id', userIdValidation, getUserById);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user profile
 *     description: Update user profile information. Users can update their own profile, admins can update any profile.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: "John"
 *               lastName:
 *                 type: string
 *                 example: "Doe"
 *               phoneNumber:
 *                 type: string
 *                 example: "+27821234567"
 *               address:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                     example: "123 Main Street"
 *                   city:
 *                     type: string
 *                     example: "Durban"
 *                   postalCode:
 *                     type: string
 *                     example: "4001"
 *               emergencyContact:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     example: "Jane Doe"
 *                   phoneNumber:
 *                     type: string
 *                     example: "+27827654321"
 *                   relationship:
 *                     type: string
 *                     example: "Spouse"
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProfileResponse'
 *       403:
 *         description: Access denied - cannot update other users' profiles
 */
router.put('/:id', userIdValidation, userProfileValidation, updateUserProfile);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user account
 *     description: Delete a user account. Users can delete their own account, admins can delete any account. This action is irreversible.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to delete
 *     responses:
 *       200:
 *         description: User account deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User account and all associated data deleted successfully"
 *                 deletedUser:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *       403:
 *         description: Access denied - cannot delete other users' accounts
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.delete('/:id', userIdValidation, deleteUserAccount);

// =============================================
// ADMIN-ONLY USER MANAGEMENT ROUTES
// =============================================

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get paginated list of all users (Admin only)
 *     description: Retrieve a paginated list of all users in the system. Access restricted to administrators for healthcare system management.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of users per page
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [patient, provider, admin, health-worker]
 *         description: Filter users by role
 *       - in: query
 *         name: district
 *         schema:
 *           type: string
 *           enum: [amajuba, ethekwini, ilembe, king-cetshwayo, umgungundlovu, umkhanyakude, ugu, umzinyathi, uthukela, zululand]
 *         description: Filter users by KZN health district
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: isProfileComplete
 *         schema:
 *           type: boolean
 *         description: Filter by profile completion status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in user names or email addresses
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       403:
 *         description: Admin access required
 */
router.get('/',
  requireRole('admin'),
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('role')
      .optional()
      .isIn(['patient', 'provider', 'admin', 'health-worker'])
      .withMessage('Invalid role'),
    query('district')
      .optional()
      .isIn(['amajuba', 'ethekwini', 'ilembe', 'king-cetshwayo', 'umgungundlovu', 'umkhanyakude', 'ugu', 'umzinyathi', 'uthukela', 'zululand'])
      .withMessage('Invalid KZN district'),
    query('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be a boolean'),
    query('isProfileComplete')
      .optional()
      .isBoolean()
      .withMessage('isProfileComplete must be a boolean'),
    query('search')
      .optional()
      .isString()
      .withMessage('Search must be a string'),
    handleValidationErrors
  ],
  getAllUsers
);

/**
 * @swagger
 * /api/users/stats:
 *   get:
 *     summary: Get user statistics (Admin only)
 *     description: Retrieve comprehensive statistics about users in the KZN healthcare system including district distributions and profile completion rates
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserStats'
 *       403:
 *         description: Admin access required
 */
router.get('/stats', requireRole('admin'), getUserStats);

/**
 * @swagger
 * /api/users/district/{district}:
 *   get:
 *     summary: Get users by KZN district (Admin/Health-Worker only)
 *     description: Retrieve all users in a specific KZN health district. Used for district-level healthcare management and planning.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: district
 *         required: true
 *         schema:
 *           type: string
 *           enum: [amajuba, ethekwini, ilembe, king-cetshwayo, umgungundlovu, umkhanyakude, ugu, umzinyathi, uthukela, zululand]
 *         description: KZN health district code
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [patient, provider, admin, health-worker]
 *         description: Filter by user role within the district
 *     responses:
 *       200:
 *         description: District users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 district:
 *                   type: string
 *                   example: "ethekwini"
 *                 totalUsers:
 *                   type: integer
 *                   example: 450
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       firstName:
 *                         type: string
 *                       lastName:
 *                         type: string
 *                       email:
 *                         type: string
 *                       roles:
 *                         type: array
 *                         items:
 *                           type: string
 *       403:
 *         description: Admin or Health-Worker access required
 */
router.get('/district/:district',
  requireAllRoles(['admin', 'health-worker']),
  districtValidation,
  getUsersByDistrict
);

/**
 * @swagger
 * /api/users/stats/districts:
 *   get:
 *     summary: Get KZN district statistics (Admin only)
 *     description: Retrieve comprehensive statistics for all KZN health districts including user demographics, medical aid coverage, and healthcare needs
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: District statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 period:
 *                   type: string
 *                   example: "last_30_days"
 *                 districtStats:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       district:
 *                         type: string
 *                       totalUsers:
 *                         type: integer
 *                       averageAge:
 *                         type: number
 *                       medicalAidCoverage:
 *                         type: number
 *                       elderlyPercentage:
 *                         type: number
 *                       chronicConditionsPercentage:
 *                         type: number
 *                 summary:
 *                   type: object
 *       403:
 *         description: Admin access required
 */
router.get('/stats/districts', requireRole('admin'), getDistrictStatistics);

/**
 * @swagger
 * /api/users/{id}/roles:
 *   patch:
 *     summary: Update user roles (Admin only)
 *     description: Update the roles assigned to a user. Used for managing healthcare provider access and administrative privileges.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to update roles for
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roles
 *             properties:
 *               roles:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [patient, provider, admin, health-worker]
 *                 example: ["patient", "provider"]
 *                 description: Array of roles to assign to the user
 *     responses:
 *       200:
 *         description: User roles updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User roles updated successfully"
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     roles:
 *                       type: array
 *                       items:
 *                         type: string
 *       403:
 *         description: Admin access required
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.patch('/:id/roles',
  requireRole('admin'),
  userIdValidation,
  updateRolesValidation,
  updateUserRoles
);

// =============================================
// ADDITIONAL ROUTES
// =============================================

/**
 * @swagger
 * /api/users/test/profile:
 *   get:
 *     summary: Test profile completion (Development Only)
 *     description: Development endpoint to test profile completion flow
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Test profile created or retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 */
router.get('/test/profile', testProfileCompletion);

/**
 * @swagger
 * /api/users/health:
 *   get:
 *     summary: User service health check
 *     description: Check the status of the user management service and get version information
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "healthy"
 *                 service:
 *                   type: string
 *                   example: "user-management"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 version:
 *                   type: string
 *                   example: "5.0.0"
 *                 authenticatedUser:
 *                   type: object
 *                 features:
 *                   type: object
 */
router.get('/health', healthCheck);

// =============================================
// ERROR HANDLING MIDDLEWARE (Route specific)
// =============================================

// Handle validation errors from express-validator
router.use((error, req, res, next) => {
  if (error.type === 'validation-error') {
    return res.status(400).json({
      error: "Validation failed",
      code: "VALIDATION_ERROR",
      details: error.details
    });
  }
  next(error);
});

// 404 handler for user routes
router.use('*', (req, res) => {
  res.status(404).json({
    error: "User endpoint not found",
    code: "ENDPOINT_NOT_FOUND",
    path: req.originalUrl,
    availableEndpoints: [
      'GET    /api/users/me',
      'POST   /api/users/profile/complete',
      'PUT    /api/users/profile/medical',
      'GET    /api/users/:id',
      'PUT    /api/users/:id',
      'DELETE /api/users/:id',
      'GET    /api/users (admin only)',
      'GET    /api/users/stats (admin only)',
      'GET    /api/users/district/:district (admin/health-worker only)',
      'GET    /api/users/stats/districts (admin only)',
      'PATCH  /api/users/:id/roles (admin only)',
      'GET    /api/users/test/profile',
      'GET    /api/users/health'
    ]
  });
});

export default router;