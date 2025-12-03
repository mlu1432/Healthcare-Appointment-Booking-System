/**
 * Location Routes for KZN Healthcare System
 * 
 * @file src/routes/locationRoutes.js
 * @description API routes for geolocation and district services
 * 
 * Features:
 * - District detection from coordinates
 * - Nearby facility discovery
 * - KZN district-based queries
 * 
 * @version 2.0.0
 * @module LocationRoutes
 */

import express from 'express';
import {
    detectDistrict,
    getSupportedDistricts,
    validateCoordinatesEndpoint,
    getNearbyFacilities,
    getFacilitiesByDistrict
} from '../controllers/locationController.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     DistrictResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         district:
 *           type: string
 *         displayName:
 *           type: string
 *         id:
 *           type: string
 *         fullAddress:
 *           type: string
 *         coordinates:
 *           type: object
 *           properties:
 *             lat:
 *               type: number
 *             lng:
 *               type: number
 *         timestamp:
 *           type: string
 */

/**
 * @swagger
 * /api/location/district:
 *   get:
 *     summary: Detect user's KZN district from coordinates
 *     tags: [Location]
 *     parameters:
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
 *     responses:
 *       200:
 *         description: District detected successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DistrictResponse'
 *       400:
 *         description: Invalid coordinates or not in KZN
 *       404:
 *         description: Location not found
 *       500:
 *         description: Internal server error
 */
router.get('/district', detectDistrict);

/**
 * @swagger
 * /api/location/districts:
 *   get:
 *     summary: Get all supported KZN districts
 *     tags: [Location]
 *     responses:
 *       200:
 *         description: Districts retrieved successfully
 */
router.get('/districts', getSupportedDistricts);

/**
 * @swagger
 * /api/location/validate-coordinates:
 *   post:
 *     summary: Validate coordinates and check if within KZN
 *     tags: [Location]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               lat:
 *                 type: number
 *               lng:
 *                 type: number
 *     responses:
 *       200:
 *         description: Coordinates validated successfully
 */
router.post('/validate-coordinates', validateCoordinatesEndpoint);

/**
 * @swagger
 * /api/location/nearby:
 *   get:
 *     summary: Find nearby healthcare facilities
 *     tags: [Location]
 *     parameters:
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
 *           default: 5000
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [public-hospital, public-clinic, unjani-clinic, private-practice, private-hospital, specialist-center]
 *       - in: query
 *         name: affordability
 *         schema:
 *           type: string
 *           enum: [low-cost, medical-aid, private, government]
 *       - in: query
 *         name: specialty
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Nearby facilities retrieved successfully
 */
router.get('/nearby', getNearbyFacilities);

/**
 * @swagger
 * /api/location/district/{district}/facilities:
 *   get:
 *     summary: Get facilities by KZN district
 *     tags: [Location]
 *     parameters:
 *       - in: path
 *         name: district
 *         required: true
 *         schema:
 *           type: string
 *           enum: [amajuba, ethekwini, ilembe, king-cetshwayo, umgungundlovu, umkhanyakude, ugu, umzinyathi, uthukela, zululand]
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *       - in: query
 *         name: affordability
 *         schema:
 *           type: string
 *       - in: query
 *         name: specialty
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: District facilities retrieved successfully
 */
router.get('/district/:district/facilities', getFacilitiesByDistrict);

export default router;