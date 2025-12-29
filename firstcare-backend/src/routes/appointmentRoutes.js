/**
 * @file src/routes/appointmentRoutes.js
 * @module AppointmentRoutes
 * @version 3.0.0
 * 
 * @description
 * Appointment Routes for KZN Healthcare Appointment Booking System
 * 
 * This file defines all appointment-related API routes with KZN district integration.
 * It handles appointment booking, management, and healthcare scheduling across
 * KwaZulu-Natal's 10 health districts.
 * 
 * Features:
 * - District-specific appointment management
 * - KZN healthcare statistics endpoints
 * - Admin district oversight routes
 * - Urgency-based scheduling endpoints
 * - Multi-language support routes
 * 
 * Security Features:
 * - JWT authentication on all endpoints
 * - Role-based access control
 * - District ownership validation
 * - Input validation middleware
 * - Rate limiting protection
 * 
 * @author
 * Healthcare System - KZN Implementation
 */

import express from 'express';
import {
    createAppointment,
    getAllAppointments,
    getAppointmentById,
    updateAppointment,
    deleteAppointment,
    getAppointmentsByCategory,
    getAvailability,
    getAppointmentsByDistrict,
    getKZNStats
} from '../controllers/appointmentController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { validateAppointment, validateAppointmentUpdate, validateId, validateDistrict, validateAppointmentQuery } from '../middleware/validationMiddleware.js';

const router = express.Router();

// All routes require KZN healthcare authentication
router.use(verifyToken);

/**
 * @swagger
 * /api/appointments:
 *   post:
 *     summary: Book a new healthcare appointment
 *     description: Create a new appointment with KZN district validation and healthcare provider matching
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Appointment'
 *     responses:
 *       201:
 *         description: Appointment booked successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AppointmentResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       409:
 *         $ref: '#/components/responses/ConflictError'
 *       500:
 *         description: Internal server error
 */
router.post('/', validateAppointment, createAppointment);

/**
 * @swagger
 * /api/appointments:
 *   get:
 *     summary: Get all appointments for authenticated user
 *     description: Retrieve all appointments for the current user with KZN district filtering
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User appointments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 district:
 *                   type: string
 *                   example: ethekwini
 *                 appointments:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Appointment'
 *       500:
 *         description: Internal server error
 */
router.get('/', getAllAppointments);

/**
 * @swagger
 * /api/appointments/availability:
 *   get:
 *     summary: Check appointment availability
 *     description: Get available appointment dates with KZN district constraints
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: district
 *         schema:
 *           type: string
 *           enum: [amajuba, ethekwini, ilembe, king-cetshwayo, umgungundlovu, umkhanyakude, ugu, umzinyathi, uthukela, zululand]
 *         description: KZN district to check availability for
 *     responses:
 *       200:
 *         description: Availability information retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 district:
 *                   type: string
 *                 districtType:
 *                   type: string
 *                 availableDates:
 *                   type: array
 *                   items:
 *                     type: string
 *                     format: date
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
router.get('/availability', getAvailability);

/**
 * @swagger
 * /api/appointments/category/{category}:
 *   get:
 *     summary: Get appointments by medical category
 *     description: Retrieve appointments filtered by medical specialty with KZN district filtering
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *           enum: [Cardiologist, Dentist, General Practitioner, Obstetrician-Gynecologist, Ophthalmologist, Psychologist, Pediatrician, Dermatologist, Orthopedic Surgeon, Physiotherapist, Emergency Care]
 *         description: Medical category to filter by
 *     responses:
 *       200:
 *         description: Category appointments retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 category:
 *                   type: string
 *                 district:
 *                   type: string
 *                 appointments:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Appointment'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/category/:category', getAppointmentsByCategory);

/**
 * @swagger
 * /api/appointments/{id}:
 *   get:
 *     summary: Get appointment by ID
 *     description: Retrieve detailed information for a specific appointment with KZN district validation
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Appointment ID
 *     responses:
 *       200:
 *         description: Appointment details retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AppointmentResponse'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       403:
 *         description: Access denied to appointment
 */
router.get('/:id', validateId, getAppointmentById);

/**
 * @swagger
 * /api/appointments/{id}:
 *   put:
 *     summary: Update an appointment
 *     description: Update appointment details with KZN district validation
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Appointment ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               time:
 *                 type: string
 *               reason:
 *                 type: string
 *               notes:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, cancelled, completed, no-show, rescheduled]
 *     responses:
 *       200:
 *         description: Appointment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AppointmentResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.put('/:id', validateId, validateAppointmentUpdate, updateAppointment);

/**
 * @swagger
 * /api/appointments/{id}:
 *   delete:
 *     summary: Cancel an appointment
 *     description: Delete an appointment with KZN district validation and cancellation policies
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Appointment ID to cancel
 *     responses:
 *       200:
 *         description: Appointment cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 appointment:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     date:
 *                       type: string
 *                     time:
 *                       type: string
 *                     reason:
 *                       type: string
 *       400:
 *         description: Cannot cancel appointment due to policy restrictions
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.delete('/:id', validateId, deleteAppointment);

/**
 * @swagger
 * /api/appointments/district/{district}:
 *   get:
 *     summary: Get appointments by district (Admin only)
 *     description: Retrieve all appointments in a specific KZN district - Administrative access required
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: district
 *         required: true
 *         schema:
 *           type: string
 *           enum: [amajuba, ethekwini, ilembe, king-cetshwayo, umgungundlovu, umkhanyakude, ugu, umzinyathi, uthukela, zululand]
 *         description: KZN district to retrieve appointments for
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, cancelled, completed, no-show, rescheduled]
 *         description: Filter by appointment status
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by specific date
 *     responses:
 *       200:
 *         description: District appointments retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 district:
 *                   type: string
 *                 appointments:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Appointment'
 *       403:
 *         description: Admin access required
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
router.get('/district/:district', validateDistrict, getAppointmentsByDistrict);

/**
 * @swagger
 * /api/appointments/kzn-stats:
 *   get:
 *     summary: Get KZN healthcare statistics (Admin only)
 *     description: Retrieve comprehensive healthcare statistics across all KZN districts
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: KZN healthcare statistics retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 period:
 *                   type: string
 *                   example: last_30_days
 *                 districtStats:
 *                   type: array
 *                   items:
 *                     type: object
 *                 userStats:
 *                   type: array
 *                   items:
 *                     type: object
 *                 summary:
 *                   type: object
 *       403:
 *         description: Admin access required
 */
router.get('/kzn-stats', getKZNStats);

export default router;