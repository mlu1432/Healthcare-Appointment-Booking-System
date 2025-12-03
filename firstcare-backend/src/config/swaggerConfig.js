/**
 * @file src/config/swaggerConfig.js
 * @module SwaggerConfig
 * @version 4.1.0
 * 
 * @description
 * Swagger (OpenAPI 3.0) configuration for the KZN Healthcare Appointment Booking System API.
 * 
 * This configuration defines:
 * - Centralized API documentation for healthcare services across KwaZulu-Natal
 * - JWT and OAuth-based authentication
 * - District-based healthcare facility management
 * - Appointment booking and user role integrations
 * - Comprehensive user management with medical profiles
 * - Automated scanning for all route files
 * 
 * Features:
 * - Comprehensive OpenAPI 3.0 spec generation using swagger-jsdoc
 * - JWT security scheme for protected endpoints
 * - Fallback configuration for resiliency during build failures
 * - Clear documentation for healthcare-specific entities
 * - Complete user management schemas with KZN district integration
 * 
 * @author
 * Healthcare System - KZN Implementation
 */

import swaggerJsdoc from 'swagger-jsdoc';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Path Configuration
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Constants for KZN Healthcare System
const KZN_DISTRICTS = ['amajuba', 'ethekwini', 'ilembe', 'king-cetshwayo', 'umgungundlovu', 'umkhanyakude', 'ugu', 'umzinyathi', 'uthukela', 'zululand'];
const FACILITY_TYPES = ['public-clinic', 'public-hospital', 'unjani-clinic', 'private-practice', 'private-hospital', 'specialist-center'];
const USER_ROLES = ['patient', 'provider', 'admin', 'health-worker'];

// Swagger Options
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'KZN Healthcare Appointment Booking System API',
            version: '4.1.0',
            description: `
# KZN Healthcare Appointment Booking System API

A RESTful API for managing healthcare appointments and facilities across KwaZulu-Natal.

## Core Features
- District-based scheduling (10 KZN districts)
- Multi-language support (English, Zulu, Afrikaans, Xhosa, Sotho)
- JWT authentication and Google OAuth integration
- Role-based access (Patient, Provider, Admin, Health Worker)
- Appointment lifecycle management
- Healthcare facility search and filtering
- Location-based district detection
- Comprehensive medical profile management

## Supported Districts
${KZN_DISTRICTS.join(', ')}

## Authentication
Protected endpoints require a valid JWT token, provided via:
- HTTP Header: Authorization: Bearer <token>
- HTTP-only Cookie: accessToken
            `,
            contact: {
                name: 'KZN Healthcare API Support',
                email: 'support@kznhealth.gov.za',
                url: 'https://www.kznhealth.gov.za',
            },
            license: {
                name: 'MIT',
                url: 'https://spdx.org/licenses/MIT.html',
            },
            termsOfService: 'https://www.kznhealth.gov.za/terms',
        },
        servers: [
            {
                url: 'http://localhost:5000',
                description: 'Development Server'
            },
            {
                url: 'https://api.kznhealthcare.gov.za',
                description: 'Production Server'
            },
        ],

        // Security Definitions
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'JWT Token obtained from authentication endpoints',
                },
            },

            // API Response Schemas
            schemas: {
                HealthCheck: {
                    type: 'object',
                    properties: {
                        status: {
                            type: 'string',
                            example: 'healthy'
                        },
                        timestamp: {
                            type: 'string',
                            format: 'date-time'
                        },
                        version: {
                            type: 'string',
                            example: '4.1.0'
                        },
                        database: {
                            type: 'string',
                            example: 'connected'
                        },
                        environment: {
                            type: 'string',
                            example: 'development'
                        },
                    },
                },

                // ==================== USER MANAGEMENT SCHEMAS ====================
                User: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            example: '507f1f77bcf86cd799439011',
                            description: 'Unique user identifier'
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            example: 'patient@kznhealth.gov.za',
                            description: 'User email address for healthcare communications'
                        },
                        firstName: {
                            type: 'string',
                            example: 'John',
                            description: 'User first name for patient identification'
                        },
                        lastName: {
                            type: 'string',
                            example: 'Doe',
                            description: 'User last name for patient identification'
                        },
                        fullName: {
                            type: 'string',
                            example: 'John Doe',
                            description: 'Combined first and last name'
                        },
                        phoneNumber: {
                            type: 'string',
                            example: '+27821234567',
                            description: 'South African phone number with country code'
                        },
                        dateOfBirth: {
                            type: 'string',
                            format: 'date',
                            example: '1990-01-15',
                            description: 'User date of birth for age-appropriate healthcare'
                        },
                        gender: {
                            type: 'string',
                            enum: ['male', 'female', 'other', 'prefer-not-to-say'],
                            example: 'male',
                            description: 'Gender information for healthcare services'
                        },
                        preferredLanguage: {
                            type: 'string',
                            enum: ['english', 'zulu', 'afrikaans', 'xhosa', 'sotho'],
                            example: 'english',
                            description: 'Preferred language for healthcare communications'
                        },
                        locationData: {
                            $ref: '#/components/schemas/UserLocationData'
                        },
                        medicalHistory: {
                            $ref: '#/components/schemas/MedicalHistory'
                        },
                        allergies: {
                            type: 'array',
                            items: {
                                $ref: '#/components/schemas/Allergy'
                            },
                            description: 'User allergies and reactions'
                        },
                        healthcarePreferences: {
                            $ref: '#/components/schemas/HealthcarePreferences'
                        },
                        isProfileComplete: {
                            type: 'boolean',
                            example: true,
                            description: 'Indicates if user profile is complete for healthcare services'
                        },
                        profileCompletionPercentage: {
                            type: 'number',
                            example: 85,
                            description: 'Percentage of profile completion (0-100)'
                        },
                        roles: {
                            type: 'array',
                            items: {
                                type: 'string',
                                enum: USER_ROLES
                            },
                            example: ['patient'],
                            description: 'User roles in healthcare system'
                        },
                        isActive: {
                            type: 'boolean',
                            example: true,
                            description: 'Account active status'
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Account creation timestamp'
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Last profile update timestamp'
                        }
                    }
                },

                UserLocationData: {
                    type: 'object',
                    required: ['healthDistrict', 'subLocation', 'preferredFacilityType'],
                    properties: {
                        healthDistrict: {
                            type: 'string',
                            enum: KZN_DISTRICTS,
                            example: 'ethekwini',
                            description: 'KZN health district for service routing'
                        },
                        subLocation: {
                            type: 'string',
                            example: 'Durban Central',
                            description: 'Specific location within the district'
                        },
                        preferredFacilityType: {
                            type: 'string',
                            enum: FACILITY_TYPES,
                            example: 'public-hospital',
                            description: 'Preferred type of healthcare facility'
                        },
                        districtType: {
                            type: 'string',
                            enum: ['metro', 'urban', 'rural', 'coastal', 'inland'],
                            example: 'metro',
                            description: 'Type of district area'
                        },
                        coordinates: {
                            type: 'object',
                            properties: {
                                latitude: {
                                    type: 'number',
                                    example: -29.8587
                                },
                                longitude: {
                                    type: 'number',
                                    example: 31.0218
                                }
                            },
                            description: 'Geographic coordinates within KZN'
                        }
                    }
                },

                MedicalHistory: {
                    type: 'object',
                    properties: {
                        bloodType: {
                            type: 'string',
                            enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown'],
                            example: 'O+',
                            description: 'User blood type for emergency care'
                        },
                        conditions: {
                            type: 'array',
                            items: {
                                $ref: '#/components/schemas/MedicalCondition'
                            },
                            description: 'Medical conditions and diagnoses'
                        },
                        surgeries: {
                            type: 'array',
                            items: {
                                $ref: '#/components/schemas/Surgery'
                            },
                            description: 'Surgical history'
                        },
                        chronicMedications: {
                            type: 'array',
                            items: {
                                $ref: '#/components/schemas/Medication'
                            },
                            description: 'Current chronic medications'
                        }
                    }
                },

                MedicalCondition: {
                    type: 'object',
                    required: ['name'],
                    properties: {
                        name: {
                            type: 'string',
                            example: 'Diabetes Type 2',
                            description: 'Name of medical condition'
                        },
                        diagnosedDate: {
                            type: 'string',
                            format: 'date',
                            example: '2020-03-15',
                            description: 'Date of diagnosis'
                        },
                        severity: {
                            type: 'string',
                            enum: ['mild', 'moderate', 'severe', 'critical'],
                            example: 'moderate',
                            description: 'Severity level of condition'
                        },
                        isActive: {
                            type: 'boolean',
                            example: true,
                            description: 'Whether condition is currently active'
                        },
                        treatingDoctor: {
                            type: 'string',
                            example: 'Dr. Smith',
                            description: 'Name of treating healthcare provider'
                        },
                        notes: {
                            type: 'string',
                            example: 'Managed with medication and diet',
                            description: 'Additional notes about condition'
                        }
                    }
                },

                Surgery: {
                    type: 'object',
                    required: ['name', 'date'],
                    properties: {
                        name: {
                            type: 'string',
                            example: 'Appendectomy',
                            description: 'Name of surgical procedure'
                        },
                        date: {
                            type: 'string',
                            format: 'date',
                            example: '2018-07-22',
                            description: 'Date surgery was performed'
                        },
                        hospital: {
                            type: 'string',
                            example: 'Addington Hospital',
                            description: 'Hospital where surgery was performed'
                        },
                        surgeon: {
                            type: 'string',
                            example: 'Dr. Johnson',
                            description: 'Surgeon who performed procedure'
                        },
                        outcome: {
                            type: 'string',
                            enum: ['successful', 'complications', 'ongoing', 'unknown'],
                            example: 'successful',
                            description: 'Outcome of surgical procedure'
                        }
                    }
                },

                Medication: {
                    type: 'object',
                    required: ['name', 'dosage', 'frequency'],
                    properties: {
                        name: {
                            type: 'string',
                            example: 'Metformin',
                            description: 'Name of medication'
                        },
                        dosage: {
                            type: 'string',
                            example: '500mg',
                            description: 'Medication dosage'
                        },
                        frequency: {
                            type: 'string',
                            example: 'Twice daily',
                            description: 'How often medication is taken'
                        },
                        prescribedBy: {
                            type: 'string',
                            example: 'Dr. Smith',
                            description: 'Healthcare provider who prescribed medication'
                        },
                        startDate: {
                            type: 'string',
                            format: 'date',
                            example: '2020-03-15',
                            description: 'When medication was started'
                        },
                        isActive: {
                            type: 'boolean',
                            example: true,
                            description: 'Whether medication is currently being taken'
                        }
                    }
                },

                Allergy: {
                    type: 'object',
                    required: ['allergen', 'severity'],
                    properties: {
                        allergen: {
                            type: 'string',
                            example: 'Penicillin',
                            description: 'Substance causing allergic reaction'
                        },
                        severity: {
                            type: 'string',
                            enum: ['mild', 'moderate', 'severe', 'anaphylactic'],
                            example: 'severe',
                            description: 'Severity of allergic reaction'
                        },
                        reaction: {
                            type: 'string',
                            example: 'Rash and breathing difficulty',
                            description: 'Description of allergic reaction'
                        },
                        firstObserved: {
                            type: 'string',
                            format: 'date',
                            example: '2015-08-10',
                            description: 'When allergy was first observed'
                        },
                        requiresEpipen: {
                            type: 'boolean',
                            example: true,
                            description: 'Whether epipen is required for emergency'
                        }
                    }
                },

                HealthcarePreferences: {
                    type: 'object',
                    properties: {
                        hasMedicalAid: {
                            type: 'boolean',
                            example: true,
                            description: 'Whether user has medical aid coverage'
                        },
                        medicalAidScheme: {
                            type: 'string',
                            example: 'Discovery Health',
                            description: 'Medical aid scheme name'
                        },
                        medicalAidNumber: {
                            type: 'string',
                            example: 'DH123456789',
                            description: 'Medical aid membership number'
                        },
                        primaryCarePhysician: {
                            type: 'string',
                            example: 'Dr. Ndlovu',
                            description: 'Preferred primary care physician'
                        },
                        preferredCommunication: {
                            type: 'string',
                            enum: ['sms', 'email', 'phone', 'whatsapp', 'in-app'],
                            example: 'sms',
                            description: 'Preferred communication method'
                        },
                        appointmentReminders: {
                            type: 'boolean',
                            example: true,
                            description: 'Whether to receive appointment reminders'
                        },
                        healthTips: {
                            type: 'boolean',
                            example: false,
                            description: 'Whether to receive health tips'
                        },
                        consentForResearch: {
                            type: 'boolean',
                            example: false,
                            description: 'Consent for research participation'
                        },
                        emergencyAccessConsent: {
                            type: 'boolean',
                            example: true,
                            description: 'Consent for emergency medical access'
                        },
                        dataSharingConsent: {
                            type: 'boolean',
                            example: false,
                            description: 'Consent for data sharing with healthcare providers'
                        }
                    }
                },

                UserProfileResponse: {
                    type: 'object',
                    properties: {
                        message: {
                            type: 'string',
                            example: 'Profile updated successfully'
                        },
                        user: {
                            $ref: '#/components/schemas/User'
                        }
                    }
                },

                UserStats: {
                    type: 'object',
                    properties: {
                        totalUsers: {
                            type: 'integer',
                            example: 1250,
                            description: 'Total number of registered users'
                        },
                        activeUsers: {
                            type: 'integer',
                            example: 1180,
                            description: 'Number of active users'
                        },
                        profileCompletionRate: {
                            type: 'number',
                            example: 78.5,
                            description: 'Average profile completion percentage'
                        },
                        districtDistribution: {
                            type: 'object',
                            additionalProperties: {
                                type: 'integer'
                            },
                            example: {
                                'ethekwini': 450,
                                'umgungundlovu': 200,
                                'ilembe': 150
                            },
                            description: 'User distribution across KZN districts'
                        },
                        roleDistribution: {
                            type: 'object',
                            additionalProperties: {
                                type: 'integer'
                            },
                            example: {
                                'patient': 1100,
                                'provider': 120,
                                'admin': 5,
                                'health-worker': 25
                            },
                            description: 'User distribution by roles'
                        },
                        medicalAidCoverage: {
                            type: 'number',
                            example: 45.2,
                            description: 'Percentage of users with medical aid'
                        }
                    }
                },

                // ==================== APPOINTMENT SCHEMAS ====================
                Appointment: {
                    type: 'object',
                    required: [
                        'date',
                        'time',
                        'reason',
                        'category',
                        'doctor',
                        'doctorId',
                        'facilityName',
                        'facilityType',
                        'district'
                    ],
                    properties: {
                        date: {
                            type: 'string',
                            format: 'date',
                            example: '2024-01-15',
                            description: 'Appointment date in YYYY-MM-DD format'
                        },
                        time: {
                            type: 'string',
                            example: '14:30',
                            description: 'Appointment time in 24-hour HH:MM format'
                        },
                        reason: {
                            type: 'string',
                            example: 'Routine checkup and blood pressure monitoring',
                            description: 'Medical reason for the appointment'
                        },
                        category: {
                            type: 'string',
                            example: 'General Practitioner',
                            description: 'Medical specialty category'
                        },
                        doctor: {
                            type: 'string',
                            example: 'Dr. Sarah Johnson',
                            description: 'Healthcare provider name'
                        },
                        doctorId: {
                            type: 'string',
                            example: 'doc_12345',
                            description: 'Unique identifier for the healthcare provider'
                        },
                        facilityName: {
                            type: 'string',
                            example: 'Addington Hospital',
                            description: 'Name of the healthcare facility'
                        },
                        facilityType: {
                            type: 'string',
                            example: 'public-hospital',
                            description: 'Type of healthcare facility'
                        },
                        district: {
                            type: 'string',
                            example: 'ethekwini',
                            description: 'KZN health district where facility is located'
                        },
                        urgency: {
                            type: 'string',
                            example: 'routine',
                            description: 'Urgency level: routine, urgent, or emergency'
                        },
                        notes: {
                            type: 'string',
                            example: 'Patient has allergy to penicillin',
                            description: 'Additional medical notes or instructions'
                        },
                        status: {
                            type: 'string',
                            example: 'pending',
                            description: 'Current appointment status'
                        },
                    },
                },

                AppointmentResponse: {
                    type: 'object',
                    properties: {
                        message: {
                            type: 'string',
                            example: 'KZN healthcare appointment booked successfully'
                        },
                        appointment: {
                            $ref: '#/components/schemas/Appointment'
                        }
                    }
                },

                HealthcareFacility: {
                    type: 'object',
                    properties: {
                        name: {
                            type: 'string',
                            example: 'Addington Hospital'
                        },
                        district: {
                            type: 'string',
                            example: 'ethekwini'
                        },
                        facilityType: {
                            type: 'string',
                            example: 'public-hospital'
                        },
                        address: {
                            type: 'string',
                            example: '1 South Beach Rd, Durban, 4001'
                        },
                        rating: {
                            type: 'number',
                            example: 4.2
                        },
                        contact: {
                            type: 'object',
                            properties: {
                                phone: {
                                    type: 'string',
                                    example: '+27 31 327 2000'
                                },
                                email: {
                                    type: 'string',
                                    example: 'info@addingtonhospital.gov.za'
                                },
                                website: {
                                    type: 'string',
                                    example: 'https://www.kznhealth.gov.za/addington.htm'
                                },
                            },
                        },
                        services: {
                            type: 'array',
                            items: { type: 'string' },
                            example: ['Emergency Care', 'Maternity', 'Surgery', 'Pharmacy'],
                        },
                    },
                },

                DistrictResponse: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: true
                        },
                        district: {
                            type: 'string',
                            example: 'ethekwini'
                        },
                        displayName: {
                            type: 'string',
                            example: 'eThekwini Metropolitan Municipality'
                        },
                        id: {
                            type: 'string',
                            example: 'ethekwini'
                        },
                        fullAddress: {
                            type: 'string',
                            example: 'eThekwini Metropolitan Municipality, South Africa'
                        },
                        coordinates: {
                            type: 'object',
                            properties: {
                                lat: { type: 'number', example: -30.0881947 },
                                lng: { type: 'number', example: 30.8630402 }
                            }
                        }
                    }
                },

                Error: {
                    type: 'object',
                    properties: {
                        error: {
                            type: 'string',
                            example: 'Validation failed'
                        },
                        code: {
                            type: 'string',
                            example: 'VALIDATION_ERROR'
                        },
                        message: {
                            type: 'string',
                            example: 'Please check your input data'
                        },
                        details: {
                            type: 'array',
                            items: { type: 'object' }
                        },
                    },
                },
            },

            // Predefined API Responses
            responses: {
                UnauthorizedError: {
                    description: 'Authentication required or invalid token',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' },
                            example: {
                                error: 'Authentication required',
                                code: 'AUTH_REQUIRED',
                                message: 'No authentication token provided',
                            },
                        },
                    },
                },
                ValidationError: {
                    description: 'Input validation failed',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' },
                            example: {
                                error: 'Validation failed',
                                code: 'VALIDATION_ERROR',
                                message: 'Please check your input data',
                                details: [
                                    {
                                        field: 'date',
                                        message: 'Date must be in the future'
                                    }
                                ]
                            },
                        },
                    },
                },
                NotFoundError: {
                    description: 'Resource not found',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' },
                            example: {
                                error: 'Resource not found',
                                code: 'NOT_FOUND',
                                message: 'The requested resource was not found',
                            },
                        },
                    },
                },
                ConflictError: {
                    description: 'Resource conflict',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' },
                            example: {
                                error: 'Appointment conflict',
                                code: 'APPOINTMENT_CONFLICT',
                                message: 'You already have an appointment scheduled at this time',
                            },
                        },
                    },
                },
            },
        },

        security: [{ bearerAuth: [] }],

        // API Tags for Organization
        tags: [
            {
                name: 'Authentication',
                description: 'User authentication and session management endpoints'
            },
            {
                name: 'Users',
                description: 'User account registration, profile management, and medical history'
            },
            {
                name: 'Appointments',
                description: 'Healthcare appointment booking and management'
            },
            {
                name: 'Healthcare',
                description: 'Healthcare facilities search and doctor availability'
            },
            {
                name: 'Location',
                description: 'Geolocation services and KZN district detection'
            },
            {
                name: 'System',
                description: 'System health monitoring and administration'
            },
            {
                name: 'Places',
                description: 'Google Places API integration for healthcare facilities'
            },
        ],
    },

    // API Route File Inclusion Patterns
    apis: [
        join(__dirname, '../routes/*.js'),
        join(__dirname, '../routes/*.mjs'),
        join(__dirname, '../routes/*.cjs'),
        join(__dirname, '../controllers/*.js'),
        join(__dirname, '../controllers/*.mjs'),
        join(__dirname, '../controllers/healthcareController.js'),
        join(__dirname, '../controllers/appointmentController.js'),
        join(__dirname, '../controllers/locationController.js'),
        join(__dirname, '../controllers/userController.js'),
        join(__dirname, '../routes/healthcareRoutes.js'),
        join(__dirname, '../routes/appointmentRoutes.js'),
        join(__dirname, '../routes/locationRoutes.js'),
        join(__dirname, '../routes/authRoutes.js'),
        join(__dirname, '../routes/userRoutes.js'),
        join(__dirname, '../routes/placesRoutes.js'),
    ],
};

// Generate Swagger Specification
let swaggerSpec;

try {
    console.log('Generating Swagger specification...');
    swaggerSpec = swaggerJsdoc(swaggerOptions);

    if (!swaggerSpec || typeof swaggerSpec !== 'object') {
        throw new Error('SwaggerJSdoc did not return a valid object');
    }

    if (!swaggerSpec.openapi) {
        throw new Error('Generated spec missing OpenAPI version');
    }

    if (!swaggerSpec.paths) {
        console.warn('No paths found in generated Swagger spec, creating fallback object.');
        swaggerSpec.paths = {};
    }

    console.log('Swagger specification generated successfully');
    console.log('OpenAPI version:', swaggerSpec.openapi);
    console.log('Total endpoints documented:', Object.keys(swaggerSpec.paths).length);

} catch (error) {
    console.error('Error generating Swagger specification:', error.message);
    console.error('Stack trace:', error.stack);

    // Fallback specification for development resilience
    swaggerSpec = {
        openapi: '3.0.0',
        info: {
            title: 'KZN Healthcare API (Fallback Mode)',
            version: '4.1.0',
            description: 'Fallback Swagger specification generated due to build-time error.',
        },
        servers: [{
            url: 'http://localhost:5000',
            description: 'Development Server'
        }],
        paths: {},
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
    };

    console.log('Using fallback Swagger specification.');
}

// Export Swagger Specification
export default swaggerSpec;