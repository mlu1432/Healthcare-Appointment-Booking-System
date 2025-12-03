// firstcare-backend/src/models/Appointment.js

/**
 * Appointment Model for KZN Healthcare Appointment Booking System
 * Enhanced with District-Based Scheduling and KZN Healthcare Context
 * 
 * @file src/models/Appointment.js
 * @description Appointment schema with KZN district integration and healthcare provider mapping
 * 
 * Features:
 * - KZN health district association
 * - District-specific provider availability
 * - Urgency-based scheduling priorities
 * - Facility type categorization
 * - Multi-language support
 * - Location-based access control
 * - Smart conflict detection
 * - Automated reminders system
 * - Priority scoring algorithm
 * - Comprehensive audit trails
 * 
 * Security Features:
 * - User ownership validation
 * - District access controls
 * - Data integrity validation
 * - Audit trail maintenance
 * - Role-based data access
 * 
 * @version 3.1.0
 * @module Appointment
 * @author Healthcare System - KZN Implementation
 * @lastUpdated 2024-01-20
 */

import mongoose from 'mongoose';
import { format, parseISO, isValid, addHours, isBefore, isAfter } from 'date-fns';

/**
 * KZN Health Districts Configuration
 * @constant {Array<string>} KZN_DISTRICTS
 * @description Supported health districts in KwaZulu-Natal province
 */
const KZN_DISTRICTS = [
    'amajuba',
    'ethekwini',
    'ilembe',
    'king-cetshwayo',
    'umgungundlovu',
    'umkhanyakude',
    'ugu',
    'umzinyathi',
    'uthukela',
    'zululand'
];

/**
 * Healthcare Facility Types in KZN
 * @constant {Array<string>} FACILITY_TYPES
 * @description Classification of healthcare facilities across KZN
 */
const FACILITY_TYPES = [
    'public-clinic',      // Government-run primary healthcare
    'public-hospital',    // Government-run hospital services
    'unjani-clinic',     // Private-public partnership clinics
    'private-practice',   // Individual private practitioners
    'private-hospital',   // Private hospital facilities
    'specialist-center'   // Specialized medical centers
];

/**
 * Medical Categories for Appointment Classification
 * @constant {Array<string>} MEDICAL_CATEGORIES
 * @description Specialized medical fields for appointment categorization
 */
const MEDICAL_CATEGORIES = [
    'Cardiologist',
    'Dentist',
    'General Practitioner',
    'Obstetrician-Gynecologist',
    'Ophthalmologist',
    'Psychologist',
    'Pediatrician',
    'Dermatologist',
    'Orthopedic Surgeon',
    'Physiotherapist',
    'Emergency Care'
];

/**
 * Appointment Status Lifecycle
 * @constant {Array<string>} APPOINTMENT_STATUS
 * @description Complete lifecycle states for appointment tracking
 */
const APPOINTMENT_STATUS = [
    'pending',      // Initial booking state
    'confirmed',    // Provider confirmed
    'cancelled',    // Appointment cancelled
    'completed',    // Service rendered
    'no-show',      // Patient didn't attend
    'rescheduled'   // Appointment was rescheduled
];

/**
 * Urgency Levels for Priority Management
 * @constant {Array<string>} URGENCY_LEVELS
 * @description Medical urgency classification system
 */
const URGENCY_LEVELS = [
    'routine',      // Regular scheduled appointment
    'urgent',       // Requires prompt attention
    'emergency'     // Immediate medical attention needed
];

/**
 * Language Support for KZN Population
 * @constant {Array<string>} SUPPORTED_LANGUAGES
 * @description Official languages supported in KZN healthcare system
 */
const SUPPORTED_LANGUAGES = [
    'english',
    'zulu',
    'afrikaans'
];

/**
 * Appointment Schema with KZN Healthcare Enhancements
 * @typedef {Object} AppointmentSchema
 * @property {mongoose.Types.ObjectId} user - Reference to patient user
 * @property {string} district - KZN health district enum
 * @property {string} subLocation - Specific location within district
 * @property {Date} date - Appointment date (future validation)
 * @property {string} time - Appointment time (HH:MM format)
 * @property {number} duration - Duration in minutes (15-240)
 * @property {string} reason - Medical reason for appointment
 * @property {string} category - Medical specialty category
 * @property {string} urgency - Urgency level classification
 * @property {string} doctor - Healthcare provider name
 * @property {string} doctorId - Unique provider identifier
 * @property {string} facilityName - Healthcare facility name
 * @property {string} facilityType - Type of healthcare facility
 * @property {string} providerAddress - Facility physical address
 * @property {string} providerContact - Facility contact information
 * @property {string} notes - Additional appointment notes
 * @property {Array} symptoms - Patient symptoms tracking
 * @property {string} status - Current appointment status
 * @property {Array} statusHistory - Complete status change history
 * @property {boolean} isConfirmed - Confirmation status
 * @property {boolean} confirmationSent - Confirmation notification sent
 * @property {boolean} reminderSent - Reminder notification sent
 * @property {Date} reminderDate - When reminder was sent
 * @property {string} languagePreference - Patient language preference
 * @property {boolean} requiresInterpreter - Interpreter services needed
 * @property {Object} transportAssistance - Patient transport requirements
 * @property {mongoose.Types.ObjectId} createdBy - Appointment creator
 * @property {mongoose.Types.ObjectId} lastModifiedBy - Last modifier
 * @property {Date} createdAt - Auto-generated creation timestamp
 * @property {Date} updatedAt - Auto-generated update timestamp
 */
const appointmentSchema = new mongoose.Schema({
    // ==================== USER ASSOCIATION ====================
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Patient user reference is required'],
        index: true
    },

    // ==================== KZN DISTRICT INFORMATION ====================
    district: {
        type: String,
        enum: {
            values: KZN_DISTRICTS,
            message: 'Invalid KZN health district. Must be one of: {VALUE}'
        },
        required: [true, 'KZN health district is required for appointment routing'],
        index: true
    },
    subLocation: {
        type: String,
        required: [true, 'Sub-location within district is required'],
        trim: true,
        maxlength: [200, 'Sub-location cannot exceed 200 characters']
    },

    // ==================== APPOINTMENT TIMING ====================
    date: {
        type: Date,
        required: [true, 'Appointment date is required'],
        validate: {
            validator: function (date) {
                return date > new Date();
            },
            message: 'Appointment date must be in the future. Cannot book past appointments.'
        },
        index: true
    },
    time: {
        type: String,
        required: [true, 'Appointment time is required'],
        match: {
            regex: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
            message: 'Invalid time format. Please use HH:MM format (24-hour)'
        },
        validate: {
            validator: function (time) {
                const [hours, minutes] = time.split(':').map(Number);
                return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
            },
            message: 'Time must be between 00:00 and 23:59'
        }
    },
    duration: {
        type: Number,
        default: 30,
        min: [15, 'Minimum appointment duration is 15 minutes'],
        max: [240, 'Maximum appointment duration is 4 hours (240 minutes)'],
        validate: {
            validator: Number.isInteger,
            message: 'Duration must be a whole number of minutes'
        }
    },

    // ==================== MEDICAL INFORMATION ====================
    reason: {
        type: String,
        required: [true, 'Appointment reason is required for medical records'],
        trim: true,
        maxlength: [1000, 'Reason cannot exceed 1000 characters'],
        minlength: [10, 'Reason must be at least 10 characters long']
    },
    category: {
        type: String,
        required: [true, 'Medical category is required for specialist routing'],
        enum: {
            values: MEDICAL_CATEGORIES,
            message: 'Invalid medical category. Must be one of: {VALUE}'
        },
        index: true
    },
    urgency: {
        type: String,
        enum: {
            values: URGENCY_LEVELS,
            message: 'Invalid urgency level. Must be: routine, urgent, or emergency'
        },
        default: 'routine',
        index: true
    },

    // ==================== HEALTHCARE PROVIDER INFORMATION ====================
    doctor: {
        type: String,
        required: [true, 'Healthcare provider name is required'],
        trim: true,
        maxlength: [100, 'Doctor name cannot exceed 100 characters']
    },
    doctorId: {
        type: String,
        required: [true, 'Healthcare provider identifier is required'],
        index: true
    },
    facilityName: {
        type: String,
        required: [true, 'Healthcare facility name is required'],
        trim: true,
        maxlength: [200, 'Facility name cannot exceed 200 characters']
    },
    facilityType: {
        type: String,
        enum: {
            values: FACILITY_TYPES,
            message: 'Invalid facility type. Must be one of: {VALUE}'
        },
        required: [true, 'Facility type is required for resource allocation'],
        index: true
    },
    providerAddress: {
        type: String,
        required: [true, 'Provider address is required for patient directions'],
        trim: true,
        maxlength: [500, 'Address cannot exceed 500 characters']
    },
    providerContact: {
        type: String,
        required: [true, 'Provider contact information is required'],
        trim: true,
        maxlength: [100, 'Contact information cannot exceed 100 characters']
    },

    // ==================== ADDITIONAL DETAILS ====================
    notes: {
        type: String,
        trim: true,
        maxlength: [2000, 'Notes cannot exceed 2000 characters'],
        default: ''
    },
    symptoms: [{
        description: {
            type: String,
            required: [true, 'Symptom description is required'],
            trim: true,
            maxlength: [500, 'Symptom description cannot exceed 500 characters']
        },
        severity: {
            type: String,
            enum: {
                values: ['mild', 'moderate', 'severe'],
                message: 'Symptom severity must be: mild, moderate, or severe'
            },
            default: 'moderate'
        },
        duration: {
            type: String,
            required: [true, 'Symptom duration is required'],
            trim: true,
            maxlength: [50, 'Duration description cannot exceed 50 characters']
        },
        onsetDate: {
            type: Date,
            validate: {
                validator: function (date) {
                    return !date || date <= new Date();
                },
                message: 'Symptom onset date cannot be in the future'
            }
        }
    }],

    // ==================== STATUS TRACKING ====================
    status: {
        type: String,
        enum: {
            values: APPOINTMENT_STATUS,
            message: 'Invalid appointment status. Must be one of: {VALUE}'
        },
        default: 'pending',
        index: true
    },
    statusHistory: [{
        status: {
            type: String,
            required: true,
            enum: APPOINTMENT_STATUS
        },
        changedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        reason: {
            type: String,
            trim: true,
            maxlength: [500, 'Status change reason cannot exceed 500 characters'],
            default: ''
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        metadata: {
            ipAddress: String,
            userAgent: String,
            systemNote: String
        }
    }],

    // ==================== CONFIRMATION & REMINDERS ====================
    isConfirmed: {
        type: Boolean,
        default: false
    },
    confirmationSent: {
        type: Boolean,
        default: false
    },
    reminderSent: {
        type: Boolean,
        default: false
    },
    reminderDate: {
        type: Date,
        validate: {
            validator: function (date) {
                return !date || date <= new Date();
            },
            message: 'Reminder date cannot be in the future'
        }
    },

    // ==================== KZN SPECIFIC FIELDS ====================
    languagePreference: {
        type: String,
        enum: {
            values: SUPPORTED_LANGUAGES,
            message: 'Unsupported language. Must be: english, zulu, or afrikaans'
        },
        default: 'english'
    },
    requiresInterpreter: {
        type: Boolean,
        default: false
    },
    transportAssistance: {
        needed: {
            type: Boolean,
            default: false
        },
        type: {
            type: String,
            enum: {
                values: ['ambulance', 'patient-transport', 'none'],
                message: 'Invalid transport type. Must be: ambulance, patient-transport, or none'
            },
            default: 'none'
        },
        approved: {
            type: Boolean,
            default: false
        },
        notes: {
            type: String,
            trim: true,
            maxlength: [500, 'Transport notes cannot exceed 500 characters']
        }
    },

    // ==================== AUDIT FIELDS ====================
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Appointment creator reference is required']
    },
    lastModifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// ==================== COMPOUND INDEXES FOR PERFORMANCE ====================

/**
 * Performance optimization indexes for common query patterns
 */
appointmentSchema.index({ user: 1, date: 1 });                    // User appointment history
appointmentSchema.index({ district: 1, date: 1 });               // District scheduling
appointmentSchema.index({ doctorId: 1, date: 1 });               // Provider schedule
appointmentSchema.index({ category: 1, status: 1 });             // Specialty filtering
appointmentSchema.index({ facilityType: 1, status: 1 });         // Facility management
appointmentSchema.index({ urgency: 1, status: 1 });              // Priority scheduling
appointmentSchema.index({ status: 1, date: 1 });                 // Status reporting
appointmentSchema.index({ 'statusHistory.timestamp': 1 });       // Audit trail queries
appointmentSchema.index({ district: 1, facilityType: 1 });       // District facility analysis
appointmentSchema.index({ createdAt: -1 });                      // Recent appointments
appointmentSchema.index({ date: 1, time: 1 });                   // Time-based queries

// ==================== VIRTUAL FIELDS ====================

/**
 * Virtual field: Formatted date for display
 * @virtual
 * @returns {string} Date in YYYY-MM-DD format
 */
appointmentSchema.virtual('formattedDate').get(function () {
    return this.date.toISOString().split('T')[0];
});

/**
 * Virtual field: Formatted time for display
 * @virtual
 * @returns {string} Time in HH:MM format
 */
appointmentSchema.virtual('formattedTime').get(function () {
    return this.time;
});

/**
 * Virtual field: Check if appointment is in the past
 * @virtual
 * @returns {boolean} True if appointment datetime has passed
 */
appointmentSchema.virtual('isPast').get(function () {
    const appointmentDateTime = this.getAppointmentDateTime();
    return appointmentDateTime < new Date();
});

/**
 * Virtual field: Check if appointment is today
 * @virtual
 * @returns {boolean} True if appointment is scheduled for today
 */
appointmentSchema.virtual('isToday').get(function () {
    const today = new Date().toDateString();
    const appointmentDate = new Date(this.date).toDateString();
    return today === appointmentDate;
});

/**
 * Virtual field: Calculate appointment end time
 * @virtual
 * @returns {string} End time in HH:MM format
 */
appointmentSchema.virtual('endTime').get(function () {
    const [hours, minutes] = this.time.split(':').map(Number);
    const endTime = new Date(this.date);
    endTime.setHours(hours, minutes + this.duration, 0, 0);
    return endTime.toTimeString().slice(0, 5);
});

/**
 * Virtual field: Days until appointment
 * @virtual
 * @returns {number} Days remaining until appointment
 */
appointmentSchema.virtual('daysUntil').get(function () {
    const appointmentDateTime = this.getAppointmentDateTime();
    const timeDiff = appointmentDateTime - new Date();
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
});

/**
 * Virtual field: Hours until appointment
 * @virtual
 * @returns {number} Hours remaining until appointment
 */
appointmentSchema.virtual('hoursUntil').get(function () {
    const appointmentDateTime = this.getAppointmentDateTime();
    const timeDiff = appointmentDateTime - new Date();
    return Math.ceil(timeDiff / (1000 * 60 * 60));
});

// ==================== INSTANCE METHODS ====================

/**
 * Get complete appointment datetime object
 * @instance
 * @returns {Date} Combined date and time object
 */
appointmentSchema.methods.getAppointmentDateTime = function () {
    const appointmentDateTime = new Date(this.date);
    const [hours, minutes] = this.time.split(':').map(Number);
    appointmentDateTime.setHours(hours, minutes, 0, 0);
    return appointmentDateTime;
};

/**
 * Check if appointment can be cancelled based on facility policies
 * @instance
 * @returns {boolean} True if appointment can be cancelled
 * @throws {Error} If appointment data is invalid
 */
appointmentSchema.methods.canBeCancelled = function () {
    // Cannot cancel past appointments
    if (this.isPast) return false;

    // Cannot cancel already cancelled or completed appointments
    if (this.status === 'cancelled' || this.status === 'completed') return false;

    const appointmentDateTime = this.getAppointmentDateTime();
    const timeDiff = appointmentDateTime - new Date();
    const hoursDiff = timeDiff / (1000 * 60 * 60);

    // Cannot cancel if appointment is within minimum cancellation window
    if (hoursDiff <= 0) return false;

    // Facility-specific cancellation policies
    switch (this.facilityType) {
        case 'public-hospital':
        case 'public-clinic':
            return hoursDiff > 4;  // 4 hours for public facilities
        case 'unjani-clinic':
            return hoursDiff > 6;  // 6 hours for Unjani clinics
        case 'private-practice':
        case 'private-hospital':
        case 'specialist-center':
            return hoursDiff > 24; // 24 hours for private facilities
        default:
            return hoursDiff > 12; // Default 12-hour policy
    }
};

/**
 * Check if appointment can be rescheduled
 * @instance
 * @returns {boolean} True if appointment can be rescheduled
 */
appointmentSchema.methods.canBeRescheduled = function () {
    return this.canBeCancelled() && this.status !== 'rescheduled';
};

/**
 * Add status change to history with audit trail
 * @instance
 * @param {string} status - New status value
 * @param {mongoose.Types.ObjectId} changedBy - User who changed status
 * @param {string} reason - Reason for status change
 * @param {Object} metadata - Additional audit information
 * @returns {void}
 */
appointmentSchema.methods.addStatusHistory = function (status, changedBy, reason = '', metadata = {}) {
    this.statusHistory.push({
        status,
        changedBy,
        reason,
        timestamp: new Date(),
        metadata
    });
};

/**
 * Check if reminder should be sent for this appointment
 * @instance
 * @returns {boolean} True if reminder should be sent
 */
appointmentSchema.methods.shouldSendReminder = function () {
    // Don't send if already sent, in past, or not confirmed
    if (this.reminderSent || this.isPast || this.status !== 'confirmed') {
        return false;
    }

    const appointmentDateTime = this.getAppointmentDateTime();
    const timeDiff = appointmentDateTime - new Date();
    const hoursDiff = timeDiff / (1000 * 60 * 60);

    // Send reminder 24 hours before appointment
    return hoursDiff <= 24 && hoursDiff > 0;
};

/**
 * Calculate priority score for appointment scheduling
 * @instance
 * @returns {number} Priority score (higher = more urgent)
 */
appointmentSchema.methods.getPriorityScore = function () {
    let score = 0;

    // Urgency scoring (highest weight)
    switch (this.urgency) {
        case 'emergency':
            score += 100;
            break;
        case 'urgent':
            score += 50;
            break;
        case 'routine':
            score += 10;
            break;
    }

    // Facility type scoring - public facilities prioritize emergencies
    if (this.urgency === 'emergency' && this.facilityType.includes('public')) {
        score += 30;
    }

    // Time-based scoring - sooner appointments get higher priority
    const timeUntilAppointment = new Date(this.date) - new Date();
    const daysUntil = timeUntilAppointment / (1000 * 60 * 60 * 24);
    score += Math.max(0, 50 - (daysUntil * 2));

    // Rural area bonus - prioritize remote areas
    const ruralDistricts = ['umkhanyakude', 'umzinyathi', 'zululand'];
    if (ruralDistricts.includes(this.district)) {
        score += 15;
    }

    return Math.round(score);
};

/**
 * Validate appointment data integrity
 * @instance
 * @returns {Object} Validation result with isValid and errors
 */
appointmentSchema.methods.validateAppointment = function () {
    const errors = [];

    // Date validation
    if (this.isPast) {
        errors.push('Cannot create appointment in the past');
    }

    // Urgency vs facility validation
    if (this.urgency === 'emergency' && !this.facilityType.includes('hospital')) {
        errors.push('Emergency appointments require hospital facilities');
    }

    // Duration validation
    if (this.duration < 15 || this.duration > 240) {
        errors.push('Appointment duration must be between 15 and 240 minutes');
    }

    return {
        isValid: errors.length === 0,
        errors: errors
    };
};

// ==================== STATIC METHODS ====================

/**
 * Find appointments by district with filtering options
 * @static
 * @param {string} district - KZN district code
 * @param {Object} options - Filtering options
 * @param {string} options.status - Filter by appointment status
 * @param {string} options.date - Filter by specific date
 * @param {string} options.facilityType - Filter by facility type
 * @param {string} options.category - Filter by medical category
 * @returns {Promise<Array>} Array of appointment documents
 */
appointmentSchema.statics.findByDistrict = function (district, options = {}) {
    const query = { district };

    // Apply filters
    if (options.status) query.status = options.status;
    if (options.facilityType) query.facilityType = options.facilityType;
    if (options.category) query.category = options.category;

    if (options.date) {
        const targetDate = new Date(options.date);
        query.date = {
            $gte: new Date(targetDate.setHours(0, 0, 0, 0)),
            $lt: new Date(targetDate.setHours(23, 59, 59, 999))
        };
    }

    return this.find(query)
        .populate('user', 'firstName lastName phoneNumber email locationData')
        .populate('createdBy', 'firstName lastName')
        .populate('lastModifiedBy', 'firstName lastName')
        .sort({ date: 1, time: 1 });
};

/**
 * Check for appointment scheduling conflicts
 * @static
 * @param {string} doctorId - Healthcare provider identifier
 * @param {string} date - Appointment date
 * @param {string} time - Appointment time
 * @param {number} duration - Appointment duration in minutes
 * @param {string} excludeId - Appointment ID to exclude from conflict check
 * @returns {Promise<Object|null>} Conflicting appointment or null
 */
appointmentSchema.statics.checkConflict = async function (doctorId, date, time, duration = 30, excludeId = null) {
    const appointmentDate = new Date(date);
    const [startHours, startMinutes] = time.split(':').map(Number);

    const startTime = new Date(appointmentDate);
    startTime.setHours(startHours, startMinutes, 0, 0);

    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + duration);

    const conflictQuery = {
        doctorId,
        date: appointmentDate,
        status: { $in: ['pending', 'confirmed'] },
        $or: [
            {
                // Existing appointment starts during new appointment
                $and: [
                    { time: { $lte: time } },
                    {
                        $expr: {
                            $gte: [
                                {
                                    $dateFromString: {
                                        dateString: {
                                            $concat: [
                                                { $substr: ['$date', 0, 10] },
                                                'T',
                                                '$time',
                                                ':00'
                                            ]
                                        }
                                    }
                                },
                                startTime
                            ]
                        }
                    }
                ]
            },
            {
                // New appointment starts during existing appointment
                $and: [
                    { time: { $gte: time } },
                    {
                        $expr: {
                            $lte: [
                                {
                                    $dateFromString: {
                                        dateString: {
                                            $concat: [
                                                { $substr: ['$date', 0, 10] },
                                                'T',
                                                '$time',
                                                ':00'
                                            ]
                                        }
                                    }
                                },
                                endTime
                            ]
                        }
                    }
                ]
            }
        ]
    };

    if (excludeId) {
        conflictQuery._id = { $ne: excludeId };
    }

    return await this.findOne(conflictQuery);
};

/**
 * Get available time slots for a healthcare provider
 * @static
 * @param {string} doctorId - Healthcare provider identifier
 * @param {string} date - Target date for availability
 * @param {number} duration - Desired appointment duration
 * @returns {Promise<Array>} Array of available time slots
 */
appointmentSchema.statics.getAvailableSlots = async function (doctorId, date, duration = 30) {
    const appointmentDate = new Date(date);

    // Get existing appointments for the provider on the target date
    const existingAppointments = await this.find({
        doctorId,
        date: {
            $gte: new Date(appointmentDate.setHours(0, 0, 0, 0)),
            $lt: new Date(appointmentDate.setHours(23, 59, 59, 999))
        },
        status: { $in: ['pending', 'confirmed'] }
    }).select('time duration').sort({ time: 1 });

    // Standard appointment slots (can be customized per facility)
    const allSlots = [
        '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
        '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
        '16:00', '16:30'
    ];

    const availableSlots = [];

    for (const slot of allSlots) {
        const slotStart = new Date(appointmentDate);
        const [slotHours, slotMinutes] = slot.split(':').map(Number);
        slotStart.setHours(slotHours, slotMinutes, 0, 0);

        const slotEnd = new Date(slotStart);
        slotEnd.setMinutes(slotEnd.getMinutes() + duration);

        // Check if slot conflicts with existing appointments
        const hasConflict = existingAppointments.some(apt => {
            const aptStart = new Date(apt.date);
            const [aptHours, aptMinutes] = apt.time.split(':').map(Number);
            aptStart.setHours(aptHours, aptMinutes, 0, 0);

            const aptEnd = new Date(aptStart);
            aptEnd.setMinutes(aptEnd.getMinutes() + apt.duration);

            // Check for time overlap
            return (slotStart < aptEnd && slotEnd > aptStart);
        });

        // Only include future slots that don't conflict
        if (!hasConflict && slotStart > new Date()) {
            availableSlots.push({
                time: slot,
                duration: duration,
                available: true
            });
        }
    }

    return availableSlots;
};

/**
 * Get comprehensive district appointment statistics
 * @static
 * @param {string} district - KZN district code
 * @param {Date} startDate - Statistics start date
 * @param {Date} endDate - Statistics end date
 * @returns {Promise<Object>} Comprehensive statistics object
 */
appointmentSchema.statics.getDistrictStats = async function (district, startDate, endDate) {
    const stats = await this.aggregate([
        {
            $match: {
                district: district,
                date: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            }
        },
        {
            $group: {
                _id: {
                    facilityType: '$facilityType',
                    status: '$status',
                    category: '$category',
                    urgency: '$urgency'
                },
                count: { $sum: 1 },
                totalDuration: { $sum: '$duration' },
                averageDuration: { $avg: '$duration' }
            }
        },
        {
            $group: {
                _id: '$_id.facilityType',
                totalAppointments: { $sum: '$count' },
                statusBreakdown: {
                    $push: {
                        status: '$_id.status',
                        category: '$_id.category',
                        urgency: '$_id.urgency',
                        count: '$count'
                    }
                },
                averageDuration: { $avg: '$averageDuration' },
                totalDurationHours: { $sum: '$totalDuration' }
            }
        },
        {
            $project: {
                _id: 0,
                facilityType: '$_id',
                totalAppointments: 1,
                statusBreakdown: 1,
                averageDuration: { $round: ['$averageDuration', 2] },
                totalDurationHours: { $round: [{ $divide: ['$totalDurationHours', 60] }, 2] }
            }
        }
    ]);

    return stats;
};

/**
 * Get appointment trends for dashboard analytics
 * @static
 * @param {string} district - KZN district code
 * @param {number} days - Number of days to analyze
 * @returns {Promise<Object>} Trend analysis data
 */
appointmentSchema.statics.getAppointmentTrends = async function (district, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return await this.aggregate([
        {
            $match: {
                district: district,
                createdAt: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: {
                    date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    status: "$status",
                    facilityType: "$facilityType"
                },
                count: { $sum: 1 }
            }
        },
        {
            $group: {
                _id: "$_id.date",
                dailyTotal: { $sum: "$count" },
                statusBreakdown: {
                    $push: {
                        status: "$_id.status",
                        facilityType: "$_id.facilityType",
                        count: "$count"
                    }
                }
            }
        },
        {
            $sort: { _id: 1 }
        }
    ]);
};

// ==================== MIDDLEWARE ====================

/**
 * Pre-save middleware for data validation and automation
 * @hook pre-save
 */
appointmentSchema.pre('save', function (next) {
    // Auto-update status history when status changes
    if (this.isModified('status') && !this.isNew) {
        this.addStatusHistory(
            this.status,
            this.lastModifiedBy || this.createdBy,
            'Status updated via system',
            { automated: true }
        );
    }

    // Set reminder date when reminder is sent
    if (this.isModified('reminderSent') && this.reminderSent) {
        this.reminderDate = new Date();
    }

    // Validate emergency appointments require hospital facilities
    if (this.urgency === 'emergency' && !this.facilityType.includes('hospital')) {
        const error = new Error('Emergency appointments must be booked at hospital facilities');
        error.code = 'EMERGENCY_FACILITY_VALIDATION';
        return next(error);
    }

    next();
});

/**
 * Pre-validate middleware for data integrity checks
 * @hook pre-validate
 */
appointmentSchema.pre('validate', function (next) {
    // Ensure subLocation is provided for district routing
    if (!this.subLocation || this.subLocation.trim() === '') {
        const error = new Error('Sub-location is required for district-based healthcare routing');
        error.code = 'SUBLOCATION_REQUIRED';
        return next(error);
    }

    // Validate appointment date is in the future
    if (this.date && this.date <= new Date()) {
        const error = new Error('Appointment date must be in the future');
        error.code = 'PAST_APPOINTMENT_DATE';
        return next(error);
    }

    next();
});

// ==================== QUERY HELPERS ====================

/**
 * Query helper for active appointments (non-cancelled, non-completed)
 */
appointmentSchema.query.active = function () {
    return this.where('status').in(['pending', 'confirmed', 'rescheduled']);
};

/**
 * Query helper for upcoming appointments
 */
appointmentSchema.query.upcoming = function () {
    return this.where('date').gte(new Date()).active();
};

/**
 * Query helper for appointments requiring confirmation
 */
appointmentSchema.query.requiresConfirmation = function () {
    return this.where('isConfirmed').equals(false).where('status').in(['pending', 'confirmed']);
};

// ==================== MODEL EXPORT ====================

/**
 * Appointment Model
 * @class Appointment
 * @extends mongoose.Model
 */
const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment;

// ==================== ADDITIONAL EXPORTS FOR UTILITIES ====================

/**
 * Export constants for external use
 */
export {
    KZN_DISTRICTS,
    FACILITY_TYPES,
    MEDICAL_CATEGORIES,
    APPOINTMENT_STATUS,
    URGENCY_LEVELS,
    SUPPORTED_LANGUAGES
};