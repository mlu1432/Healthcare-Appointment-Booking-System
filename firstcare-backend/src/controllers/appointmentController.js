// firstcare-backend/src/controllers/appointmentController.js

/**
 * Appointment Controller for KZN Healthcare Appointment Booking System
 * Enhanced with District-Based Scheduling and KZN Healthcare Intelligence
 * 
 * @file src/controllers/appointmentController.js
 * @description Handles all appointment-related operations with KZN district integration
 * 
 * Features:
 * - KZN district-based provider matching
 * - Smart appointment scheduling with district constraints
 * - Urgency-based routing and prioritization
 * - Facility type optimization
 * - Multi-language support
 * - Location-aware availability checking
 * 
 * Security Features:
 * - District-based access control
 * - User ownership validation
 * - Input sanitization and validation
 * - Role-based permissions
 * - Audit trail maintenance
 * 
 * @version 3.0.0
 * @module AppointmentController
 * @author Healthcare System - KZN Implementation
 */

import Appointment from '../models/Appointment.js';
import User from '../models/user.js';
import { validationResult } from 'express-validator';
import { format, parseISO, isValid, addDays, isBefore, isAfter } from 'date-fns';

/**
 * KZN District Configuration
 */
const KZN_DISTRICTS = {
    amajuba: { type: 'inland', urbanCenters: ['Newcastle'] },
    ethekwini: { type: 'metro', urbanCenters: ['Durban'] },
    ilembe: { type: 'coastal', urbanCenters: ['KwaDukuza'] },
    'king-cetshwayo': { type: 'coastal', urbanCenters: ['Richards Bay'] },
    umgungundlovu: { type: 'inland', urbanCenters: ['Pietermaritzburg'] },
    umkhanyakude: { type: 'rural', urbanCenters: ['Mkuze'] },
    ugu: { type: 'coastal', urbanCenters: ['Port Shepstone'] },
    umzinyathi: { type: 'rural', urbanCenters: ['Dundee'] },
    uthukela: { type: 'inland', urbanCenters: ['Ladysmith'] },
    zululand: { type: 'rural', urbanCenters: ['Vryheid'] }
};

/**
 * Create a new appointment with KZN district validation
 * @route POST /api/appointments
 * @access Private
 */
export const createAppointment = async (req, res) => {
    try {
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: "Validation failed",
                code: "VALIDATION_ERROR",
                details: errors.array()
            });
        }

        const { date, time, reason, category, doctor, doctorId, notes, urgency, district, facilityType, facilityName, providerAddress, providerContact } = req.body;

        console.log("Received KZN appointment request:", {
            user: req.user.userId,
            district,
            date, time, reason, category, doctor, facilityType, urgency
        });

        // Check if user profile is complete and has KZN location data
        const user = await User.findById(req.user.userId);
        if (!user.isProfileComplete) {
            return res.status(400).json({
                error: "Profile incomplete",
                code: "PROFILE_INCOMPLETE",
                message: "Please complete your KZN healthcare profile before booking an appointment"
            });
        }

        // Validate user district access
        if (!user.canAccessDistrict(district)) {
            return res.status(403).json({
                error: "District access denied",
                code: "DISTRICT_ACCESS_DENIED",
                message: "You can only book appointments in your registered KZN health district"
            });
        }

        // Validate date format
        const appointmentDate = parseISO(date);
        if (!isValid(appointmentDate)) {
            return res.status(400).json({
                error: "Invalid date format",
                code: "INVALID_DATE",
                message: "Please provide a valid date in ISO format"
            });
        }

        // Check if date is in the future
        if (appointmentDate < new Date()) {
            return res.status(400).json({
                error: "Invalid appointment date",
                code: "PAST_DATE",
                message: "Appointment date cannot be in the past"
            });
        }

        // Validate KZN district
        if (!KZN_DISTRICTS[district]) {
            return res.status(400).json({
                error: "Invalid KZN district",
                code: "INVALID_DISTRICT",
                message: "Please select a valid KZN health district"
            });
        }

        // Check for conflicting appointments (same user, same date/time)
        const existingAppointment = await Appointment.findOne({
            user: req.user.userId,
            date: appointmentDate,
            time: time,
            status: { $in: ['pending', 'confirmed'] }
        });

        if (existingAppointment) {
            return res.status(409).json({
                error: "Appointment conflict",
                code: "APPOINTMENT_CONFLICT",
                message: "You already have an appointment scheduled at this date and time"
            });
        }

        // Check provider availability in the district
        const providerConflict = await Appointment.checkConflict(doctorId, date, time, 30);
        if (providerConflict) {
            return res.status(409).json({
                error: "Provider unavailable",
                code: "PROVIDER_UNAVAILABLE",
                message: "The selected healthcare provider is not available at this time"
            });
        }

        // Validate urgency level with facility type
        if (urgency === 'emergency' && !facilityType.includes('hospital')) {
            return res.status(400).json({
                error: "Invalid facility for emergency",
                code: "INVALID_EMERGENCY_FACILITY",
                message: "Emergency care should be booked at hospital facilities"
            });
        }

        // Create new appointment with KZN district data
        const appointment = new Appointment({
            user: req.user.userId,
            district: district,
            subLocation: user.locationData.subLocation,
            date: appointmentDate,
            time,
            reason,
            category,
            doctor,
            doctorId,
            facilityName,
            facilityType,
            providerAddress,
            providerContact,
            urgency,
            notes: notes || '',
            status: 'pending',
            languagePreference: user.preferredLanguage,
            requiresInterpreter: user.preferredLanguage !== 'english',
            createdBy: req.user.userId
        });

        // Add initial status to history
        appointment.addStatusHistory('pending', req.user.userId, 'Appointment created');

        await appointment.save();

        // Populate user details for response
        await appointment.populate('user', 'firstName lastName email phoneNumber locationData');

        console.log("KZN Appointment created successfully:", {
            appointmentId: appointment._id,
            district: appointment.district,
            facilityType: appointment.facilityType
        });

        // Send success response with KZN context
        return res.status(201).json({
            message: "KZN healthcare appointment booked successfully!",
            appointment: {
                id: appointment._id,
                date: appointment.date,
                time: appointment.time,
                reason: appointment.reason,
                category: appointment.category,
                doctor: appointment.doctor,
                doctorId: appointment.doctorId,
                facilityName: appointment.facilityName,
                facilityType: appointment.facilityType,
                district: appointment.district,
                urgency: appointment.urgency,
                status: appointment.status,
                notes: appointment.notes,
                user: {
                    id: appointment.user._id,
                    name: `${appointment.user.firstName} ${appointment.user.lastName}`,
                    email: appointment.user.email,
                    district: appointment.user.locationData.healthDistrict
                },
                createdAt: appointment.createdAt,
                priorityScore: appointment.getPriorityScore()
            }
        });

    } catch (error) {
        console.error("KZN Appointment booking error:", error);

        // Handle duplicate key errors
        if (error.code === 11000) {
            return res.status(409).json({
                error: "Appointment already exists",
                code: "DUPLICATE_APPOINTMENT",
                message: "An appointment with these details already exists"
            });
        }

        // Handle validation errors
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                error: "Validation failed",
                code: "APPOINTMENT_VALIDATION_ERROR",
                details: errors
            });
        }

        return res.status(500).json({
            error: "KZN healthcare service unavailable",
            code: "KZN_SERVICE_UNAVAILABLE",
            message: "Failed to book appointment in KZN healthcare system. Please try again later."
        });
    }
};

/**
 * Get all appointments for the authenticated user with KZN district filtering
 * @route GET /api/appointments
 * @access Private
 */
export const getAllAppointments = async (req, res) => {
    try {
        console.log("Fetching KZN appointments for user:", req.user.userId);

        let appointments;
        const user = await User.findById(req.user.userId);

        // Admin can see all appointments across KZN, regular users only see their district
        if (req.user.roles.includes('admin')) {
            appointments = await Appointment.find()
                .populate('user', 'firstName lastName email phoneNumber locationData')
                .sort({ date: 1, time: 1 });
            console.log("Admin accessing all KZN appointments");
        } else {
            appointments = await Appointment.find({
                user: req.user.userId,
                district: user.locationData.healthDistrict
            })
                .populate('user', 'firstName lastName email phoneNumber locationData')
                .sort({ date: 1, time: 1 });
            console.log(`Found ${appointments.length} appointments in ${user.locationData.healthDistrict} district`);
        }

        return res.status(200).json({
            district: user.locationData.healthDistrict,
            appointments: appointments.map(apt => ({
                id: apt._id,
                date: apt.date,
                time: apt.time,
                reason: apt.reason,
                category: apt.category,
                doctor: apt.doctor,
                doctorId: apt.doctorId,
                facilityName: apt.facilityName,
                facilityType: apt.facilityType,
                district: apt.district,
                urgency: apt.urgency,
                status: apt.status,
                notes: apt.notes,
                user: {
                    id: apt.user._id,
                    name: `${apt.user.firstName} ${apt.user.lastName}`,
                    email: apt.user.email,
                    district: apt.user.locationData.healthDistrict
                },
                createdAt: apt.createdAt,
                updatedAt: apt.updatedAt,
                canBeCancelled: apt.canBeCancelled(),
                canBeRescheduled: apt.canBeRescheduled(),
                isToday: apt.isToday
            }))
        });

    } catch (error) {
        console.error("Error fetching KZN appointments:", error);
        return res.status(500).json({
            error: "KZN healthcare service unavailable",
            code: "KZN_APPOINTMENT_FETCH_ERROR",
            message: "Failed to retrieve KZN healthcare appointments. Please try again later."
        });
    }
};

/**
 * Get appointment by ID with KZN district validation
 * @route GET /api/appointments/:id
 * @access Private
 */
export const getAppointmentById = async (req, res) => {
    try {
        const { id } = req.params;

        console.log(`Fetching KZN appointment ${id} for user:`, req.user.userId);

        const appointment = await Appointment.findById(id)
            .populate('user', 'firstName lastName email phoneNumber locationData');

        if (!appointment) {
            return res.status(404).json({
                error: "Appointment not found",
                code: "APPOINTMENT_NOT_FOUND",
                message: "The specified appointment does not exist in KZN healthcare system"
            });
        }

        // Check ownership: users can only view their own appointments unless admin
        if (!req.user.roles.includes('admin') && appointment.user._id.toString() !== req.user.userId) {
            return res.status(403).json({
                error: "Access denied",
                code: "FORBIDDEN",
                message: "You can only view your own KZN healthcare appointments"
            });
        }

        return res.status(200).json({
            appointment: {
                id: appointment._id,
                date: appointment.date,
                time: appointment.time,
                reason: appointment.reason,
                category: appointment.category,
                doctor: appointment.doctor,
                doctorId: appointment.doctorId,
                facilityName: appointment.facilityName,
                facilityType: appointment.facilityType,
                district: appointment.district,
                urgency: appointment.urgency,
                status: appointment.status,
                notes: appointment.notes,
                user: {
                    id: appointment.user._id,
                    name: `${appointment.user.firstName} ${appointment.user.lastName}`,
                    email: appointment.user.email,
                    phoneNumber: appointment.user.phoneNumber,
                    district: appointment.user.locationData.healthDistrict
                },
                createdAt: appointment.createdAt,
                updatedAt: appointment.updatedAt,
                canBeCancelled: appointment.canBeCancelled(),
                canBeRescheduled: appointment.canBeRescheduled(),
                isToday: appointment.isToday
            }
        });

    } catch (error) {
        console.error("Error fetching KZN appointment:", error);
        return res.status(500).json({
            error: "KZN healthcare service unavailable",
            code: "KZN_APPOINTMENT_FETCH_ERROR",
            message: "Failed to retrieve KZN healthcare appointment. Please try again later."
        });
    }
};

/**
 * Update an appointment with KZN district validation
 * @route PUT /api/appointments/:id
 * @access Private
 */
export const updateAppointment = async (req, res) => {
    try {
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: "Validation failed",
                code: "VALIDATION_ERROR",
                details: errors.array()
            });
        }

        const { id } = req.params;
        const updateData = req.body;

        console.log(`Updating KZN appointment ${id} for user:`, req.user.userId);

        // Find the appointment first to check ownership
        const existingAppointment = await Appointment.findById(id);

        if (!existingAppointment) {
            return res.status(404).json({
                error: "Appointment not found",
                code: "APPOINTMENT_NOT_FOUND",
                message: "The specified appointment does not exist in KZN healthcare system"
            });
        }

        // Check ownership: users can only update their own appointments unless admin
        if (!req.user.roles.includes('admin') && existingAppointment.user.toString() !== req.user.userId) {
            return res.status(403).json({
                error: "Access denied",
                code: "FORBIDDEN",
                message: "You can only update your own KZN healthcare appointments"
            });
        }

        // Validate date if provided
        if (updateData.date) {
            const appointmentDate = parseISO(updateData.date);
            if (!isValid(appointmentDate)) {
                return res.status(400).json({
                    error: "Invalid date format",
                    code: "INVALID_DATE",
                    message: "Please provide a valid date in ISO format"
                });
            }
            if (appointmentDate < new Date()) {
                return res.status(400).json({
                    error: "Invalid appointment date",
                    code: "PAST_DATE",
                    message: "Appointment date cannot be in the past"
                });
            }
            updateData.date = appointmentDate;
        }

        // Check for appointment conflicts (only if date/time is being updated)
        if (updateData.date || updateData.time) {
            const conflictQuery = {
                _id: { $ne: id }, // Exclude current appointment
                user: existingAppointment.user,
                date: updateData.date || existingAppointment.date,
                time: updateData.time || existingAppointment.time,
                status: { $in: ['pending', 'confirmed'] }
            };

            const conflictingAppointment = await Appointment.findOne(conflictQuery);
            if (conflictingAppointment) {
                return res.status(409).json({
                    error: "Appointment conflict",
                    code: "APPOINTMENT_CONFLICT",
                    message: "Another appointment already exists at this date and time"
                });
            }
        }

        // Update the appointment
        const updatedAppointment = await Appointment.findByIdAndUpdate(
            id,
            {
                ...updateData,
                lastModifiedBy: req.user.userId
            },
            {
                new: true,
                runValidators: true
            }
        ).populate('user', 'firstName lastName email phoneNumber locationData');

        if (!updatedAppointment) {
            return res.status(404).json({
                error: "Appointment not found",
                code: "APPOINTMENT_NOT_FOUND",
                message: "The specified appointment does not exist in KZN healthcare system"
            });
        }

        // Add status to history if status changed
        if (updateData.status && updateData.status !== existingAppointment.status) {
            updatedAppointment.addStatusHistory(updateData.status, req.user.userId, 'Appointment updated');
            await updatedAppointment.save();
        }

        console.log("KZN Appointment updated successfully:", id);

        return res.status(200).json({
            message: "KZN healthcare appointment updated successfully!",
            appointment: {
                id: updatedAppointment._id,
                date: updatedAppointment.date,
                time: updatedAppointment.time,
                reason: updatedAppointment.reason,
                category: updatedAppointment.category,
                doctor: updatedAppointment.doctor,
                doctorId: updatedAppointment.doctorId,
                facilityName: updatedAppointment.facilityName,
                facilityType: updatedAppointment.facilityType,
                district: updatedAppointment.district,
                urgency: updatedAppointment.urgency,
                status: updatedAppointment.status,
                notes: updatedAppointment.notes,
                user: {
                    id: updatedAppointment.user._id,
                    name: `${updatedAppointment.user.firstName} ${updatedAppointment.user.lastName}`,
                    email: updatedAppointment.user.email,
                    district: updatedAppointment.user.locationData.healthDistrict
                },
                createdAt: updatedAppointment.createdAt,
                updatedAt: updatedAppointment.updatedAt
            }
        });

    } catch (error) {
        console.error("Error updating KZN appointment:", error);

        // Handle validation errors
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                error: "Validation failed",
                code: "APPOINTMENT_VALIDATION_ERROR",
                details: errors
            });
        }

        return res.status(500).json({
            error: "KZN healthcare service unavailable",
            code: "KZN_APPOINTMENT_UPDATE_ERROR",
            message: "Failed to update KZN healthcare appointment. Please try again later."
        });
    }
};

/**
 * Delete an appointment with KZN district validation
 * @route DELETE /api/appointments/:id
 * @access Private
 */
export const deleteAppointment = async (req, res) => {
    try {
        const { id } = req.params;

        console.log(`Deleting KZN appointment ${id} for user:`, req.user.userId);

        // Find the appointment first to check ownership
        const existingAppointment = await Appointment.findById(id);

        if (!existingAppointment) {
            return res.status(404).json({
                error: "Appointment not found",
                code: "APPOINTMENT_NOT_FOUND",
                message: "The specified appointment does not exist in KZN healthcare system"
            });
        }

        // Check ownership: users can only delete their own appointments unless admin
        if (!req.user.roles.includes('admin') && existingAppointment.user.toString() !== req.user.userId) {
            return res.status(403).json({
                error: "Access denied",
                code: "FORBIDDEN",
                message: "You can only delete your own KZN healthcare appointments"
            });
        }

        // Check if appointment can be cancelled
        if (!existingAppointment.canBeCancelled()) {
            return res.status(400).json({
                error: "Cannot delete appointment",
                code: "APPOINTMENT_DELETE_RESTRICTED",
                message: "This appointment cannot be deleted. Please contact the healthcare facility directly."
            });
        }

        const deletedAppointment = await Appointment.findByIdAndDelete(id);

        if (!deletedAppointment) {
            return res.status(404).json({
                error: "Appointment not found",
                code: "APPOINTMENT_NOT_FOUND",
                message: "The specified appointment does not exist in KZN healthcare system"
            });
        }

        console.log("KZN Appointment deleted successfully:", id);

        return res.status(200).json({
            message: "KZN healthcare appointment deleted successfully!",
            appointment: {
                id: deletedAppointment._id,
                date: deletedAppointment.date,
                time: deletedAppointment.time,
                reason: deletedAppointment.reason,
                doctor: deletedAppointment.doctor,
                facilityName: deletedAppointment.facilityName
            }
        });

    } catch (error) {
        console.error("Error deleting KZN appointment:", error);
        return res.status(500).json({
            error: "KZN healthcare service unavailable",
            code: "KZN_APPOINTMENT_DELETE_ERROR",
            message: "Failed to delete KZN healthcare appointment. Please try again later."
        });
    }
};

/**
 * Get appointments by category with KZN district filtering
 * @route GET /api/appointments/category/:category
 * @access Private
 */
export const getAppointmentsByCategory = async (req, res) => {
    try {
        const { category } = req.params;

        console.log(`Fetching ${category} appointments in KZN for user:`, req.user.userId);

        let query = { category };
        const user = await User.findById(req.user.userId);

        // Regular users can only see their own appointments in the category within their district
        if (!req.user.roles.includes('admin')) {
            query.user = req.user.userId;
            query.district = user.locationData.healthDistrict;
        }

        const appointments = await Appointment.find(query)
            .populate('user', 'firstName lastName email phoneNumber locationData')
            .sort({ date: 1, time: 1 });

        console.log(`Found ${appointments.length} ${category} appointments in KZN`);

        return res.status(200).json({
            category,
            district: user.locationData.healthDistrict,
            appointments: appointments.map(apt => ({
                id: apt._id,
                date: apt.date,
                time: apt.time,
                reason: apt.reason,
                category: apt.category,
                doctor: apt.doctor,
                doctorId: apt.doctorId,
                facilityName: apt.facilityName,
                facilityType: apt.facilityType,
                district: apt.district,
                urgency: apt.urgency,
                status: apt.status,
                notes: apt.notes,
                user: {
                    id: apt.user._id,
                    name: `${apt.user.firstName} ${apt.user.lastName}`,
                    email: apt.user.email,
                    district: apt.user.locationData.healthDistrict
                },
                createdAt: apt.createdAt,
                updatedAt: apt.updatedAt
            }))
        });

    } catch (error) {
        console.error("Error fetching KZN appointments by category:", error);
        return res.status(500).json({
            error: "KZN healthcare service unavailable",
            code: "KZN_CATEGORY_FETCH_ERROR",
            message: "Failed to retrieve KZN healthcare appointments by category. Please try again later."
        });
    }
};

/**
 * Get appointment availability with KZN district constraints
 * @route GET /api/appointments/availability
 * @access Private
 */
export const getAvailability = async (req, res) => {
    try {
        const { district } = req.query;
        const user = await User.findById(req.user.userId);

        // Use requested district or user's district
        const targetDistrict = district || user.locationData.healthDistrict;

        if (!KZN_DISTRICTS[targetDistrict]) {
            return res.status(400).json({
                error: "Invalid KZN district",
                code: "INVALID_DISTRICT",
                message: "Please provide a valid KZN health district"
            });
        }

        // Generate available dates for next 30 days with district-specific logic
        const availableDates = [];
        const today = new Date();

        for (let i = 1; i <= 30; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);

            // District-specific availability rules
            const isAvailable = isDateAvailableForDistrict(date, targetDistrict);

            if (isAvailable) {
                availableDates.push(date.toISOString().split('T')[0]);
            }
        }

        // Get district information
        const districtInfo = KZN_DISTRICTS[targetDistrict];

        res.status(200).json({
            district: targetDistrict,
            districtType: districtInfo.type,
            availableDates,
            message: `Available dates for ${targetDistrict} district retrieved successfully`
        });

    } catch (error) {
        console.error("Error fetching KZN availability:", error);
        return res.status(500).json({
            error: "KZN availability service unavailable",
            code: "KZN_AVAILABILITY_ERROR",
            message: "Failed to retrieve KZN healthcare availability. Please try again later."
        });
    }
};

/**
 * Get appointments by district (Admin only)
 * @route GET /api/appointments/district/:district
 * @access Private/Admin
 */
export const getAppointmentsByDistrict = async (req, res) => {
    try {
        const { district } = req.params;

        if (!req.user.roles.includes('admin')) {
            return res.status(403).json({
                error: "Access denied",
                code: "ADMIN_ACCESS_REQUIRED",
                message: "Only administrators can access district-wide appointment data"
            });
        }

        if (!KZN_DISTRICTS[district]) {
            return res.status(400).json({
                error: "Invalid KZN district",
                code: "INVALID_DISTRICT",
                message: "Please provide a valid KZN health district"
            });
        }

        const { status, date } = req.query;
        const appointments = await Appointment.findByDistrict(district, { status, date });

        console.log(`Found ${appointments.length} appointments in ${district} district`);

        return res.status(200).json({
            district,
            appointments: appointments.map(apt => ({
                id: apt._id,
                date: apt.date,
                time: apt.time,
                reason: apt.reason,
                category: apt.category,
                doctor: apt.doctor,
                facilityName: apt.facilityName,
                facilityType: apt.facilityType,
                urgency: apt.urgency,
                status: apt.status,
                user: {
                    id: apt.user._id,
                    name: `${apt.user.firstName} ${apt.user.lastName}`,
                    phoneNumber: apt.user.phoneNumber,
                    subLocation: apt.user.locationData.subLocation
                },
                createdAt: apt.createdAt
            }))
        });

    } catch (error) {
        console.error("Error fetching district appointments:", error);
        return res.status(500).json({
            error: "KZN district service unavailable",
            code: "DISTRICT_FETCH_ERROR",
            message: "Failed to retrieve district appointments. Please try again later."
        });
    }
};

/**
 * Get KZN healthcare statistics
 * @route GET /api/appointments/kzn-stats
 * @access Private/Admin
 */
export const getKZNStats = async (req, res) => {
    try {
        if (!req.user.roles.includes('admin')) {
            return res.status(403).json({
                error: "Access denied",
                code: "ADMIN_ACCESS_REQUIRED",
                message: "Only administrators can access KZN healthcare statistics"
            });
        }

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Get appointment statistics by district
        const districtStats = await Appointment.aggregate([
            {
                $match: {
                    createdAt: { $gte: thirtyDaysAgo }
                }
            },
            {
                $group: {
                    _id: '$district',
                    totalAppointments: { $sum: 1 },
                    pendingAppointments: {
                        $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
                    },
                    confirmedAppointments: {
                        $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
                    },
                    emergencyAppointments: {
                        $sum: { $cond: [{ $eq: ['$urgency', 'emergency'] }, 1, 0] }
                    },
                    averageDuration: { $avg: '$duration' }
                }
            }
        ]);

        // Get user statistics by district
        const userStats = await User.getDistrictStats();

        res.status(200).json({
            period: 'last_30_days',
            districtStats,
            userStats,
            summary: {
                totalDistricts: districtStats.length,
                totalAppointments: districtStats.reduce((sum, stat) => sum + stat.totalAppointments, 0),
                totalUsers: userStats.reduce((sum, stat) => sum + stat.totalUsers, 0)
            }
        });

    } catch (error) {
        console.error("Error fetching KZN statistics:", error);
        return res.status(500).json({
            error: "KZN statistics service unavailable",
            code: "KZN_STATS_ERROR",
            message: "Failed to retrieve KZN healthcare statistics. Please try again later."
        });
    }
};

/**
 * Check if a date is available for a specific KZN district
 * @param {Date} date - The date to check
 * @param {string} district - The KZN district
 * @returns {boolean} - Whether the date is available
 */
const isDateAvailableForDistrict = (date, district) => {
    const dayOfWeek = date.getDay();

    // Base availability (exclude weekends)
    if (dayOfWeek === 0 || dayOfWeek === 6) {
        return false;
    }

    // District-specific rules
    switch (district) {
        case 'umkhanyakude':
        case 'umzinyathi':
        case 'zululand':
            // Rural districts may have limited weekend services
            return dayOfWeek !== 0; // No Sunday services
        case 'ethekwini':
            // Metro districts have better availability
            return true;
        default:
            // Other districts follow standard schedule
            return dayOfWeek >= 1 && dayOfWeek <= 5;
    }
};