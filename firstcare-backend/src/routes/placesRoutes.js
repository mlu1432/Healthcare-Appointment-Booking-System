/**
 * Google Places API Proxy Routes
 * 
 * @file src/routes/placesRoutes.js
 * @version 1.0.0
 * @description Routes for Google Places API proxy endpoints
 */

import express from 'express';
import placesController from '../controllers/placesController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Places
 *   description: Google Places API proxy endpoints
 */

/**
 * @swagger
 * /api/places/healthcare:
 *   get:
 *     summary: Search for healthcare facilities using Google Places API
 *     tags: [Places]
 *     parameters:
 *       - in: query
 *         name: specialty
 *         required: true
 *         schema:
 *           type: string
 *           enum: [cardiologist, dentists, general-practitioner, gynecologists, ophthalmologist, psychologists, pediatrician, dermatologist, orthopedic-surgeon, physiotherapist, emergency-care, unjani-clinics]
 *         description: Medical specialty to search for
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *         description: Latitude coordinate
 *       - in: query
 *         name: lng
 *         required: true
 *         schema:
 *           type: number
 *         description: Longitude coordinate
 *       - in: query
 *         name: radius
 *         schema:
 *           type: integer
 *           default: 10000
 *         description: Search radius in meters
 *     responses:
 *       200:
 *         description: Healthcare facilities found successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 facilities:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: Google Place ID
 *                       name:
 *                         type: string
 *                         description: Facility name
 *                       address:
 *                         type: string
 *                         description: Full address
 *                       location:
 *                         type: object
 *                         properties:
 *                           lat:
 *                             type: number
 *                           lng:
 *                             type: number
 *                       phone:
 *                         type: string
 *                         description: Phone number
 *                       rating:
 *                         type: number
 *                         description: Google rating (1-5)
 *                       totalRatings:
 *                         type: number
 *                         description: Number of ratings
 *                       openingHours:
 *                         type: object
 *                         description: Opening hours information
 *                       website:
 *                         type: string
 *                         description: Facility website
 *                       distance:
 *                         type: string
 *                         description: Distance from search location
 *                       isOpen:
 *                         type: boolean
 *                         description: Whether facility is currently open
 *                       isUnjani:
 *                         type: boolean
 *                         description: Whether this is an Unjani Clinic
 *                       specialBadge:
 *                         type: string
 *                         description: Special badge for clinic type
 *                 total:
 *                   type: integer
 *                   description: Total number of facilities found
 *                 searchTerm:
 *                   type: string
 *                   description: The search term used
 *       400:
 *         description: Missing required parameters
 *       500:
 *         description: Internal server error or Google API error
 */
router.get('/healthcare', placesController.searchHealthcareFacilities);

/**
 * @swagger
 * /api/places/search:
 *   get:
 *     summary: General Google Places search
 *     tags: [Places]
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: lng
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: radius
 *         schema:
 *           type: integer
 *           default: 10000
 *     responses:
 *       200:
 *         description: Places search results
 */
router.get('/search', placesController.searchPlaces);

/**
 * @swagger
 * /api/places/details:
 *   get:
 *     summary: Get detailed place information
 *     tags: [Places]
 *     parameters:
 *       - in: query
 *         name: place_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Google Place ID
 *     responses:
 *       200:
 *         description: Place details
 */
router.get('/details', placesController.getPlaceDetails);

export default router;