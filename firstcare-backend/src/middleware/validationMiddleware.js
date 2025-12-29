// firstcare-backend/src/middleware/validationMiddleware.js

/**
 * Validation Middleware for KZN Healthcare Appointment Booking System
 * 
 * @file src/middleware/validationMiddleware.js
 * @description Comprehensive input validation for appointments and user data with KZN-specific rules
 * 
 * Features:
 * - Appointment creation and update validation
 * - KZN district validation
 * - Healthcare facility type validation
 * - Urgency level validation
 * - Medical category validation
 * - Input sanitization and security
 * 
 * Security Features:
 * - XSS prevention
 * - SQL injection protection
 * - Input length limits
 * - Data type validation
 * - Custom error messages
 * 
 * @version 3.0.0
 * @module ValidationMiddleware
 * @author Healthcare System - KZN Implementation
 */

import { body, param, query, validationResult } from 'express-validator';

/**
 * KZN Health Districts
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
 */
const FACILITY_TYPES = [
    'public-clinic',
    'public-hospital',
    'unjani-clinic',
    'private-practice',
    'private-hospital',
    'specialist-center'
];

/**
 * Medical Categories
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
 * Validation error handler
 */
export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => ({
            field: error.path,
            message: error.msg,
            value: error.value
        }));

        return res.status(400).json({
            error: "Validation failed",
            code: "VALIDATION_ERROR",
            details: errorMessages,
            message: "Please check your input and try again"
        });
    }

    next();
};

/**
 * Appointment Creation Validation Rules
 */
export const validateAppointment = [
    // Date validation
    body('date')
        .notEmpty()
        .withMessage('Appointment date is required')
        .isISO8601()
        .withMessage('Date must be in ISO 8601 format (YYYY-MM-DD)')
        .custom((value) => {
            const appointmentDate = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (appointmentDate < today) {
                throw new Error('Appointment date cannot be in the past');
            }

            // Max booking 90 days in advance
            const maxDate = new Date();
            maxDate.setDate(today.getDate() + 90);

            if (appointmentDate > maxDate) {
                throw new Error('Appointments can only be booked up to 90 days in advance');
            }

            return true;
        }),

    // Time validation
    body('time')
        .notEmpty()
        .withMessage('Appointment time is required')
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('Time must be in HH:MM format (24-hour)')
        .custom((value) => {
            const [hours, minutes] = value.split(':').map(Number);

            // Business hours: 8 AM to 5 PM
            if (hours < 8 || hours >= 17) {
                throw new Error('Appointments must be between 08:00 and 17:00');
            }

            // Only allow specific time slots (every 30 minutes)
            if (minutes !== 0 && minutes !== 30) {
                throw new Error('Appointments must start at :00 or :30 past the hour');
            }

            return true;
        }),

    // Reason validation
    body('reason')
        .notEmpty()
        .withMessage('Appointment reason is required')
        .isLength({ min: 10, max: 1000 })
        .withMessage('Reason must be between 10 and 1000 characters')
        .trim()
        .escape(),

    // Category validation
    body('category')
        .notEmpty()
        .withMessage('Medical category is required')
        .isIn(MEDICAL_CATEGORIES)
        .withMessage(`Category must be one of: ${MEDICAL_CATEGORIES.join(', ')}`),

    // Doctor validation
    body('doctor')
        .notEmpty()
        .withMessage('Doctor name is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Doctor name must be between 2 and 100 characters')
        .trim()
        .escape(),

    // Doctor ID validation
    body('doctorId')
        .notEmpty()
        .withMessage('Doctor ID is required')
        .isLength({ min: 2, max: 50 })
        .withMessage('Doctor ID must be between 2 and 50 characters'),

    // District validation
    body('district')
        .notEmpty()
        .withMessage('KZN health district is required')
        .isIn(KZN_DISTRICTS)
        .withMessage(`District must be a valid KZN health district: ${KZN_DISTRICTS.join(', ')}`),

    // Facility type validation
    body('facilityType')
        .notEmpty()
        .withMessage('Facility type is required')
        .isIn(FACILITY_TYPES)
        .withMessage(`Facility type must be one of: ${FACILITY_TYPES.join(', ')}`),

    // Facility name validation
    body('facilityName')
        .notEmpty()
        .withMessage('Facility name is required')
        .isLength({ min: 2, max: 200 })
        .withMessage('Facility name must be between 2 and 200 characters')
        .trim()
        .escape(),

    // Provider address validation
    body('providerAddress')
        .notEmpty()
        .withMessage('Provider address is required')
        .isLength({ min: 5, max: 500 })
        .withMessage('Address must be between 5 and 500 characters')
        .trim()
        .escape(),

    // Provider contact validation
    body('providerContact')
        .notEmpty()
        .withMessage('Provider contact is required')
        .matches(/^(\+\d{1,3}[- ]?)?\d{10}$/)
        .withMessage('Please provide a valid phone number'),

    // Urgency validation
    body('urgency')
        .optional()
        .isIn(['routine', 'urgent', 'emergency'])
        .withMessage('Urgency must be routine, urgent, or emergency'),

    // Notes validation
    body('notes')
        .optional()
        .isLength({ max: 2000 })
        .withMessage('Notes cannot exceed 2000 characters')
        .trim()
        .escape(),

    // Handle validation errors
    handleValidationErrors
];

/**
 * Appointment Update Validation Rules
 */
export const validateAppointmentUpdate = [
    // Date validation (optional for updates)
    body('date')
        .optional()
        .isISO8601()
        .withMessage('Date must be in ISO 8601 format (YYYY-MM-DD)')
        .custom((value) => {
            const appointmentDate = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (appointmentDate < today) {
                throw new Error('Appointment date cannot be in the past');
            }

            return true;
        }),

    // Time validation (optional for updates)
    body('time')
        .optional()
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('Time must be in HH:MM format (24-hour)')
        .custom((value) => {
            const [hours, minutes] = value.split(':').map(Number);

            if (hours < 8 || hours >= 17) {
                throw new Error('Appointments must be between 08:00 and 17:00');
            }

            if (minutes !== 0 && minutes !== 30) {
                throw new Error('Appointments must start at :00 or :30 past the hour');
            }

            return true;
        }),

    // Reason validation (optional for updates)
    body('reason')
        .optional()
        .isLength({ min: 10, max: 1000 })
        .withMessage('Reason must be between 10 and 1000 characters')
        .trim()
        .escape(),

    // Category validation (optional for updates)
    body('category')
        .optional()
        .isIn(MEDICAL_CATEGORIES)
        .withMessage(`Category must be one of: ${MEDICAL_CATEGORIES.join(', ')}`),

    // Urgency validation (optional for updates)
    body('urgency')
        .optional()
        .isIn(['routine', 'urgent', 'emergency'])
        .withMessage('Urgency must be routine, urgent, or emergency'),

    // Notes validation (optional for updates)
    body('notes')
        .optional()
        .isLength({ max: 2000 })
        .withMessage('Notes cannot exceed 2000 characters')
        .trim()
        .escape(),

    // Handle validation errors
    handleValidationErrors
];

/**
 * User Profile Validation Rules
 */
export const validateUserProfile = [
    // First name validation
    body('firstName')
        .notEmpty()
        .withMessage('First name is required')
        .isLength({ min: 2, max: 50 })
        .withMessage('First name must be between 2 and 50 characters')
        .isAlpha('en-US', { ignore: ' -' })
        .withMessage('First name can only contain letters, spaces, and hyphens')
        .trim()
        .escape(),

    // Last name validation
    body('lastName')
        .notEmpty()
        .withMessage('Last name is required')
        .isLength({ min: 2, max: 50 })
        .withMessage('Last name must be between 2 and 50 characters')
        .isAlpha('en-US', { ignore: ' -' })
        .withMessage('Last name can only contain letters, spaces, and hyphens')
        .trim()
        .escape(),

    // Phone number validation
    body('phoneNumber')
        .notEmpty()
        .withMessage('Phone number is required')
        .matches(/^(\+\d{1,3}[- ]?)?\d{10}$/)
        .withMessage('Please enter a valid phone number (e.g., +27341234567 or 0341234567)'),

    // Address validation
    body('address')
        .notEmpty()
        .withMessage('Address is required')
        .isLength({ min: 5, max: 500 })
        .withMessage('Address must be between 5 and 500 characters')
        .trim()
        .escape(),

    // Date of birth validation
    body('dateOfBirth')
        .notEmpty()
        .withMessage('Date of birth is required')
        .isISO8601()
        .withMessage('Date of birth must be in ISO 8601 format (YYYY-MM-DD)')
        .custom((value) => {
            const dob = new Date(value);
            const today = new Date();

            if (dob >= today) {
                throw new Error('Date of birth must be in the past');
            }

            // Check if user is at least 1 year old
            const minDate = new Date();
            minDate.setFullYear(today.getFullYear() - 1);

            if (dob > minDate) {
                throw new Error('User must be at least 1 year old');
            }

            // Check if user is not older than 120 years
            const maxDate = new Date();
            maxDate.setFullYear(today.getFullYear() - 120);

            if (dob < maxDate) {
                throw new Error('Please enter a valid date of birth');
            }

            return true;
        }),



    // KZN District validation
    body('healthDistrict')
        .notEmpty()
        .withMessage('KZN health district is required')
        .isIn(KZN_DISTRICTS)
        .withMessage(`Please select a valid KZN health district: ${KZN_DISTRICTS.join(', ')}`),

    // Sub-location validation
    body('subLocation')
        .notEmpty()
        .withMessage('Please select your specific area within the district')
        .isLength({ min: 2, max: 100 })
        .withMessage('Location must be between 2 and 100 characters')
        .trim()
        .escape(),

    // Preferred facility type validation
    body('preferredFacilityType')
        .notEmpty()
        .withMessage('Preferred facility type is required')
        .isIn(FACILITY_TYPES)
        .withMessage(`Please select a valid facility type: ${FACILITY_TYPES.join(', ')}`),

    // Medical history validation
    body('medicalHistory')
        .optional()
        .isLength({ max: 2000 })
        .withMessage('Medical history cannot exceed 2000 characters')
        .trim()
        .escape(),

    // Allergies validation
    body('allergies')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Allergies information cannot exceed 1000 characters')
        .trim()
        .escape(),

    // Emergency contact validation
    body('emergencyContact')
        .optional()
        .matches(/^(\+\d{1,3}[- ]?)?\d{10}$/)
        .withMessage('Please enter a valid emergency contact number'),

    // Preferred language validation
    body('preferredLanguage')
        .optional()
        .isIn(['english', 'zulu', 'afrikaans', 'xhosa', 'sotho'])
        .withMessage('Please select a valid language'),

    // Handle validation errors
    handleValidationErrors
];

/**
 * ID Parameter Validation
 */
export const validateId = [
    param('id')
        .isMongoId()
        .withMessage('Invalid ID format'),

    handleValidationErrors
];

/**
 * District Parameter Validation
 */
export const validateDistrict = [
    param('district')
        .isIn(KZN_DISTRICTS)
        .withMessage(`District must be a valid KZN health district: ${KZN_DISTRICTS.join(', ')}`),

    handleValidationErrors
];

/**
 * Query Parameter Validation for Appointments
 */
export const validateAppointmentQuery = [
    query('status')
        .optional()
        .isIn(['pending', 'confirmed', 'cancelled', 'completed', 'no-show', 'rescheduled'])
        .withMessage('Invalid status filter'),

    query('date')
        .optional()
        .isISO8601()
        .withMessage('Date filter must be in ISO 8601 format'),

    query('district')
        .optional()
        .isIn(KZN_DISTRICTS)
        .withMessage(`District filter must be a valid KZN health district`),

    handleValidationErrors
];

/**
 * Sanitization middleware for general input
 */
export const sanitizeInput = [
    // Sanitize all string fields
    body('*').trim().escape(),

    // Remove extra spaces from specific fields
    body(['firstName', 'lastName', 'doctor', 'facilityName']).customSanitizer(value => {
        return value ? value.replace(/\s+/g, ' ').trim() : value;
    }),

    // Next middleware
    (req, res, next) => next()
];

/**
 * Profile Completion Validation Rules
 */
export const validateProfileCompletion = [
    // Phone number validation (South African format)
    body('phoneNumber')
        .notEmpty()
        .withMessage('Phone number is required for healthcare communications')
        .matches(/^(\+27|27|0)[0-9]{9}$/)
        .withMessage('Please enter a valid South African phone number (e.g., +27821234567 or 0821234567)')
        .trim(),

    // Date of birth validation
    body('dateOfBirth')
        .notEmpty()
        .withMessage('Date of birth is required')
        .isISO8601()
        .withMessage('Date must be in ISO 8601 format (YYYY-MM-DD)')
        .custom((value) => {
            const dob = new Date(value);
            const today = new Date();

            if (dob >= today) {
                throw new Error('Date of birth must be in the past');
            }

            // Must be at least 13 years old
            const minAgeDate = new Date();
            minAgeDate.setFullYear(minAgeDate.getFullYear() - 13);
            if (dob > minAgeDate) {
                throw new Error('You must be at least 13 years old');
            }

            // Must be under 120 years
            const maxAgeDate = new Date();
            maxAgeDate.setFullYear(maxAgeDate.getFullYear() - 120);
            if (dob < maxAgeDate) {
                throw new Error('Please enter a valid date of birth');
            }

            return true;
        }),

    // Gender validation
    body('gender')
        .notEmpty()
        .withMessage('Gender is required')
        .isIn(['male', 'female', 'other', 'prefer-not-to-say'])
        .withMessage('Gender must be male, female, other, or prefer-not-to-say'),

    // Location data validation
    body('locationData.healthDistrict')
        .notEmpty()
        .withMessage('KZN health district is required')
        .isIn(KZN_DISTRICTS)
        .withMessage(`Health district must be one of: ${KZN_DISTRICTS.join(', ')}`),

    body('locationData.subLocation')
        .notEmpty()
        .withMessage('Sub-location is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Sub-location must be between 2 and 100 characters')
        .trim()
        .escape(),

    body('locationData.preferredFacilityType')
        .notEmpty()
        .withMessage('Preferred facility type is required')
        .isIn(FACILITY_TYPES)
        .withMessage(`Facility type must be one of: ${FACILITY_TYPES.join(', ')}`),

    body('locationData.districtType')
        .optional()
        .isIn(['urban', 'rural', 'metro', 'coastal', 'inland'])
        .withMessage('District type must be urban, rural, metro, coastal, or inland'),

    // Preferred language validation
    body('preferredLanguage')
        .optional()
        .isIn(['english', 'zulu', 'afrikaans', 'xhosa', 'sotho'])
        .withMessage('Preferred language must be english, zulu, afrikaans, xhosa, or sotho'),

    handleValidationErrors
];

/**
 * Medical Profile Validation Rules
 */
export const validateMedicalProfile = [
    // Blood type validation
    body('medicalHistory.bloodType')
        .optional()
        .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown'])
        .withMessage('Blood type must be valid or unknown'),

    // HIV status validation
    body('medicalHistory.hivStatus')
        .optional()
        .isIn(['negative', 'positive', 'positive-untreated', 'unknown', ''])
        .withMessage('HIV status must be negative, positive, positive-untreated, unknown, or empty'),

    // TB history validation
    body('medicalHistory.tbHistory')
        .optional()
        .isIn(['never', 'past', 'current', 'exposed', 'unknown', ''])
        .withMessage('TB history must be never, past, current, exposed, unknown, or empty'),

    // Conditions validation
    body('medicalHistory.conditions')
        .optional()
        .isArray()
        .withMessage('Conditions must be an array'),

    body('medicalHistory.conditions.*.name')
        .optional()
        .isLength({ min: 2, max: 200 })
        .withMessage('Condition name must be between 2 and 200 characters'),

    body('medicalHistory.conditions.*.severity')
        .optional()
        .isIn(['mild', 'moderate', 'severe', 'critical'])
        .withMessage('Condition severity must be mild, moderate, severe, or critical'),

    // Allergies validation
    body('allergies')
        .optional()
        .isArray()
        .withMessage('Allergies must be an array'),

    body('allergies.*.allergen')
        .optional()
        .isLength({ min: 2, max: 100 })
        .withMessage('Allergen must be between 2 and 100 characters'),

    body('allergies.*.severity')
        .optional()
        .isIn(['mild', 'moderate', 'severe', 'anaphylactic'])
        .withMessage('Allergy severity must be mild, moderate, severe, or anaphylactic'),

    // Medications validation
    body('medicalHistory.chronicMedications')
        .optional()
        .isArray()
        .withMessage('Medications must be an array'),

    body('medicalHistory.chronicMedications.*.name')
        .optional()
        .isLength({ min: 2, max: 100 })
        .withMessage('Medication name must be between 2 and 100 characters'),

    body('medicalHistory.chronicMedications.*.dosage')
        .optional()
        .isLength({ min: 1, max: 50 })
        .withMessage('Dosage must be between 1 and 50 characters'),

    // Healthcare preferences validation
    body('healthcarePreferences.preferredCommunication')
        .optional()
        .isIn(['sms', 'email', 'phone', 'whatsapp', 'in-app'])
        .withMessage('Preferred communication must be sms, email, phone, whatsapp, or in-app'),

    body('healthcarePreferences.hasMedicalAid')
        .optional()
        .isBoolean()
        .withMessage('hasMedicalAid must be true or false'),

    handleValidationErrors
];


export default {
    validateAppointment,
    validateAppointmentUpdate,
    validateUserProfile,
    validateProfileCompletion,
    validateMedicalProfile,
    validateId,
    validateDistrict,
    validateAppointmentQuery,
    sanitizeInput,
    handleValidationErrors
};