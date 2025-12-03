/**
 * Unified Healthcare Routes
 * Combines all healthcare-related endpoints with proper versioning
 * 
 * @module routes/healthcareRoutes
 * @version 2.0.0
 * @description RESTful API routes for KZN healthcare system
 */

import express from 'express';
import {
    searchHealthcareFacilities,
    getFacilityDetails,
    searchDoctors,
    createHealthcareFacility,
    updateHealthcareFacility,
    getHealthcareStatistics
} from '../controllers/healthcareController.js';

// REMOVE these duplicate imports - they're causing conflicts
// import {
//     getUserDistrict,
//     getNearbyFacilities,
//     getFacilitiesByDistrict
// } from '../controllers/locationController.js.js';

const router = express.Router();

// API Versioning middleware
router.use((req, res, next) => {
    res.setHeader('X-API-Version', '2.0.0');
    res.setHeader('X-API-Service', 'KZN Healthcare System');
    next();
});

/**
 * @swagger
 * /api/healthcare/status:
 *   get:
 *     summary: API health check and status
 *     tags: [Healthcare]
 *     responses:
 *       200:
 *         description: API status information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 service:
 *                   type: string
 *                   example: KZN Healthcare API
 *                 version:
 *                   type: string
 *                   example: 2.0.0
 *                 status:
 *                   type: string
 *                   example: operational
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 endpoints:
 *                   type: object
 *                   properties:
 *                     facilities:
 *                       type: string
 *                       example: /api/healthcare/facilities
 *                     doctors:
 *                       type: string
 *                       example: /api/healthcare/doctors
 *                     location:
 *                       type: string
 *                       example: /api/healthcare/location
 *                     statistics:
 *                       type: string
 *                       example: /api/healthcare/statistics
 */
router.get('/status', (req, res) => {
    res.status(200).json({
        success: true,
        service: 'KZN Healthcare API',
        version: '2.0.0',
        status: 'operational',
        timestamp: new Date().toISOString(),
        endpoints: {
            facilities: '/api/healthcare/facilities',
            doctors: '/api/healthcare/doctors',
            location: '/api/location', // Updated to point to standalone location routes
            statistics: '/api/healthcare/statistics'
        }
    });
});

// ==================== FACILITY MANAGEMENT ROUTES ====================

/**
 * @swagger
 * /api/healthcare/facilities:
 *   get:
 *     summary: Advanced search for healthcare facilities
 *     tags: [Healthcare]
 *     parameters:
 *       - in: query
 *         name: district
 *         schema:
 *           type: string
 *           enum: [amajuba, ethekwini, ilembe, king-cetshwayo, umgungundlovu, umkhanyakude, ugu, umzinyathi, uthukela, zululand]
 *         description: KZN district filter
 *       - in: query
 *         name: facilityType
 *         schema:
 *           type: string
 *           enum: [public-hospital, public-clinic, unjani-clinic, private-practice, private-hospital, specialist-center]
 *         description: Type of facility
 *       - in: query
 *         name: specialty
 *         schema:
 *           type: string
 *         description: Medical specialty
 *       - in: query
 *         name: affordabilityTier
 *         schema:
 *           type: string
 *           enum: [low-cost, medical-aid, private, government]
 *         description: Cost category
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Text search term
 *       - in: query
 *         name: service
 *         schema:
 *           type: string
 *         description: Specific medical service
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Results per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: rating
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Paginated facility results
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FacilitySearchResponse'
 *       400:
 *         description: Invalid district
 *       500:
 *         description: Facility search error
 */
router.get('/facilities', searchHealthcareFacilities);

/**
 * @swagger
 * /api/healthcare/facilities/{id}:
 *   get:
 *     summary: Get detailed information for a specific facility
 *     tags: [Healthcare]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Facility ID or Google Place ID
 *     responses:
 *       200:
 *         description: Complete facility details with recommendations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 facility:
 *                   $ref: '#/components/schemas/HealthcareFacility'
 *                 recommendations:
 *                   type: object
 *                   properties:
 *                     similarFacilities:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/HealthcareFacility'
 *                     message:
 *                       type: string
 *       404:
 *         description: Facility not found
 *       500:
 *         description: Facility details error
 */
router.get('/facilities/:id', getFacilityDetails);

/**
 * @swagger
 * /api/healthcare/facilities:
 *   post:
 *     summary: Create a new healthcare facility (Admin)
 *     tags: [Healthcare]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - district
 *               - subLocation
 *               - address
 *               - facilityType
 *             properties:
 *               name:
 *                 type: string
 *                 example: Addington Hospital
 *               district:
 *                 type: string
 *                 enum: [amajuba, ethekwini, ilembe, king-cetshwayo, umgungundlovu, umkhanyakude, ugu, umzinyathi, uthukela, zululand]
 *                 example: ethekwini
 *               subLocation:
 *                 type: string
 *                 example: South Beach
 *               address:
 *                 type: string
 *                 example: 1 South Beach Rd, Durban, 4001
 *               facilityType:
 *                 type: string
 *                 enum: [public-hospital, public-clinic, unjani-clinic, private-practice, private-hospital, specialist-center]
 *                 example: public-hospital
 *     responses:
 *       201:
 *         description: Healthcare facility created successfully
 *       400:
 *         description: Validation failed
 *       500:
 *         description: Facility creation error
 */
router.post('/facilities', createHealthcareFacility);

/**
 * @swagger
 * /api/healthcare/facilities/{id}:
 *   put:
 *     summary: Update healthcare facility information
 *     tags: [Healthcare]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Facility ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/HealthcareFacility'
 *     responses:
 *       200:
 *         description: Healthcare facility updated successfully
 *       404:
 *         description: Facility not found
 *       400:
 *         description: Validation failed
 *       500:
 *         description: Facility update error
 */
router.put('/facilities/:id', updateHealthcareFacility);

// ==================== DOCTOR SEARCH ROUTES ====================

/**
 * @swagger
 * /api/healthcare/doctors:
 *   get:
 *     summary: Search for doctors with advanced filtering
 *     tags: [Healthcare]
 *     parameters:
 *       - in: query
 *         name: specialty
 *         schema:
 *           type: string
 *         description: Medical specialty
 *       - in: query
 *         name: district
 *         schema:
 *           type: string
 *           enum: [amajuba, ethekwini, ilembe, king-cetshwayo, umgungundlovu, umkhanyakude, ugu, umzinyathi, uthukela, zululand]
 *         description: KZN district
 *       - in: query
 *         name: facilityType
 *         schema:
 *           type: string
 *           enum: [public-hospital, public-clinic, unjani-clinic, private-practice, private-hospital, specialist-center]
 *         description: Type of facility
 *       - in: query
 *         name: languages
 *         schema:
 *           type: string
 *         description: Spoken languages
 *       - in: query
 *         name: maxFee
 *         schema:
 *           type: number
 *         description: Maximum consultation fee
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Results per page
 *     responses:
 *       200:
 *         description: Paginated doctor results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 doctors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       doctor:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           specialty:
 *                             type: string
 *                           consultationFee:
 *                             type: number
 *                           languages:
 *                             type: array
 *                             items:
 *                               type: string
 *                       facilityName:
 *                         type: string
 *                       facilityType:
 *                         type: string
 *                       district:
 *                         type: string
 *                       address:
 *                         type: string
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalDoctors:
 *                       type: integer
 *                     hasNext:
 *                       type: boolean
 *                     hasPrev:
 *                       type: boolean
 *                     limit:
 *                       type: integer
 *       500:
 *         description: Doctor search error
 */
router.get('/doctors', searchDoctors);

// ==================== ANALYTICS & STATISTICS ROUTES ====================

/**
 * @swagger
 * /api/healthcare/statistics:
 *   get:
 *     summary: Get healthcare system statistics
 *     tags: [Healthcare]
 *     responses:
 *       200:
 *         description: Comprehensive healthcare statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 statistics:
 *                   type: object
 *                   properties:
 *                     totalFacilities:
 *                       type: integer
 *                       example: 150
 *                     totalDoctors:
 *                       type: integer
 *                       example: 850
 *                     averageRating:
 *                       type: number
 *                       example: 4.2
 *                     ratedFacilities:
 *                       type: integer
 *                       example: 120
 *                     byDistrict:
 *                       type: array
 *                       items:
 *                         type: object
 *                     byFacilityType:
 *                       type: array
 *                       items:
 *                         type: object
 *                     topSpecialties:
 *                       type: array
 *                       items:
 *                         type: object
 *                 lastUpdated:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Statistics error
 */
router.get('/statistics', getHealthcareStatistics);

// ==================== ERROR HANDLING MIDDLEWARE ====================

// 404 Handler for undefined routes
router.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        code: 'ENDPOINT_NOT_FOUND',
        message: `The requested endpoint ${req.originalUrl} does not exist`,
        availableEndpoints: [
            'GET /api/healthcare/status',
            'GET /api/healthcare/facilities',
            'GET /api/healthcare/doctors',
            'GET /api/healthcare/statistics'
        ]
    });
});

// Error handling middleware
router.use((error, req, res, next) => {
    console.error('Route error:', error);

    res.status(error.status || 500).json({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
});

export default router;