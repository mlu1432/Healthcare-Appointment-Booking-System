// firstcare-backend/src/models/user.js

/**
 * User Model for KZN Healthcare Appointment Booking System
 * Enhanced with KZN Health Districts and Healthcare Integration
 * 
 * @file src/models/user.js
 * @description Comprehensive user schema with KZN-specific healthcare data, 
 * district mapping, and medical profile management for the KwaZulu-Natal healthcare system.
 * 
 * Core Features:
 * - KZN health district mapping and validation
 * - Sub-location tracking within districts
 * - Comprehensive medical history and profile management
 * - Healthcare facility type preferences
 * - Multi-language support (English, Zulu, Afrikaans, Xhosa, Sotho)
 * - Medical aid and insurance integration
 * - Location-based service access control
 * - Emergency contact and medical consent management
 * 
 * Security & Validation:
 * - Password hashing with bcrypt
 * - Email verification system
 * - Profile completion tracking
 * - District-based access control
 * - Data validation and sanitization
 * - Role-based permissions (Patient, Provider, Admin, Health Worker)
 * 
 * @version 4.1.0
 * @module User
 * @author KZN Healthcare Development Team
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * KZN Health Districts Configuration
 * Official districts from KwaZulu-Natal Department of Health
 * @constant {Array<string>} KZN_DISTRICTS
 */
const KZN_DISTRICTS = [
    'amajuba',          // Newcastle area
    'ethekwini',        // Durban metropolitan
    'ilembe',           // KwaDukuza, Ballito
    'king-cetshwayo',   // Richards Bay, Empangeni
    'umgungundlovu',    // Pietermaritzburg
    'umkhanyakude',     // Northern rural areas
    'ugu',              // Port Shepstone, South Coast
    'umzinyathi',       // Dundee, Nquthu
    'uthukela',         // Ladysmith, Estcourt
    'zululand'          // Vryheid, Ulundi
];

/**
 * Healthcare Facility Types in KZN
 * @constant {Array<string>} FACILITY_TYPES
 */
const FACILITY_TYPES = [
    'public-clinic',    // Government primary healthcare
    'public-hospital',  // Government hospital services
    'unjani-clinic',    // Private-public partnership clinics
    'private-practice', // Individual private practitioners
    'private-hospital', // Private hospital facilities
    'specialist-center' // Specialized medical centers
];

/**
 * User Roles for Healthcare System
 * @constant {Array<string>} USER_ROLES
 */
const USER_ROLES = [
    'patient',       // Healthcare service users
    'provider',      // Healthcare service providers
    'admin',         // System administrators
    'health-worker'  // Clinic and hospital staff
];

/**
 * User Schema with KZN Healthcare Enhancements
 */
const userSchema = new mongoose.Schema({
    // ==================== AUTHENTICATION FIELDS ====================
    email: {
        type: String,
        required: [true, 'Email address is required for healthcare communications'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address for healthcare communications']
    },
    password: {
        type: String,
        required: function () { return this.provider === 'local'; },
        minlength: [8, 'Password must be at least 8 characters long for security']
    },
    firstName: {
        type: String,
        required: [true, 'First name is required for patient identification'],
        trim: true,
        maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required for patient identification'],
        trim: true,
        maxlength: [50, 'Last name cannot exceed 50 characters']
    },

    // ==================== KZN LOCATION DATA ====================
    locationData: {
        healthDistrict: {
            type: String,
            enum: {
                values: KZN_DISTRICTS,
                message: 'Invalid KZN health district. Please select from the supported districts.'
            }
        },
        subLocation: {
            type: String,
            trim: true,
            maxlength: [200, 'Sub-location description cannot exceed 200 characters']
        },
        preferredFacilityType: {
            type: String,
            enum: {
                values: FACILITY_TYPES,
                message: 'Invalid facility type. Please select from supported healthcare facility types.'
            }
        },
        districtType: {
            type: String,
            enum: ['metro', 'urban', 'rural', 'coastal', 'inland'],
            default: 'urban'
        },
        coordinates: {
            latitude: Number,
            longitude: Number
        },
        lastLocationUpdate: {
            type: Date,
            default: Date.now
        }
    },

    // ==================== CONTACT INFORMATION ====================
    phoneNumber: {
        type: String,
        match: [/^(\+27|0)[1-9][0-9]{8}$/, 'Please enter a valid South African phone number']
    },
    address: {
        street: String,
        city: String,
        postalCode: String,
        formattedAddress: String
    },
    emergencyContact: {
        name: String,
        relationship: String,
        phoneNumber: String,
        canMakeMedicalDecisions: Boolean
    },

    // ==================== PERSONAL INFORMATION ====================
    dateOfBirth: Date,
    gender: {
        type: String,
        enum: ['male', 'female', 'other', 'prefer-not-to-say']
    },
    preferredLanguage: {
        type: String,
        enum: ['english', 'zulu', 'afrikaans', 'xhosa', 'sotho'],
        default: 'english'
    },

    // ==================== MEDICAL INFORMATION ====================
    medicalHistory: {
        bloodType: {
            type: String,
            enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown'],
            default: 'unknown'
        },
        conditions: [{
            name: String,
            diagnosedDate: Date,
            severity: {
                type: String,
                enum: ['mild', 'moderate', 'severe', 'critical'],
                default: 'moderate'
            },
            isActive: Boolean,
            treatingDoctor: String,
            notes: String
        }],
        surgeries: [{
            name: String,
            date: Date,
            hospital: String,
            surgeon: String,
            outcome: {
                type: String,
                enum: ['successful', 'complications', 'ongoing', 'unknown'],
                default: 'successful'
            }
        }],
        chronicMedications: [{
            name: String,
            dosage: String,
            frequency: String,
            prescribedBy: String,
            startDate: Date,
            isActive: Boolean
        }]
    },

    allergies: [{
        allergen: String,
        severity: {
            type: String,
            enum: ['mild', 'moderate', 'severe', 'anaphylactic']
        },
        reaction: String,
        firstObserved: Date,
        requiresEpipen: Boolean
    }],

    // ==================== HEALTHCARE PREFERENCES ====================
    healthcarePreferences: {
        hasMedicalAid: {
            type: Boolean,
            default: false
        },
        medicalAidScheme: String,
        medicalAidNumber: String,
        primaryCarePhysician: String,
        preferredCommunication: {
            type: String,
            enum: ['sms', 'email', 'phone', 'whatsapp', 'in-app'],
            default: 'sms'
        },
        appointmentReminders: {
            type: Boolean,
            default: true
        },
        healthTips: {
            type: Boolean,
            default: false
        },
        consentForResearch: {
            type: Boolean,
            default: false
        },
        emergencyAccessConsent: {
            type: Boolean,
            default: true
        },
        dataSharingConsent: {
            type: Boolean,
            default: false
        }
    },

    // ==================== SYSTEM FIELDS ====================
    isProfileComplete: {
        type: Boolean,
        default: false
    },
    profileCompletionDate: Date,
    profileCompletionPercentage: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,

    // ==================== AUTHENTICATION & ROLES ====================
    roles: {
        type: [String],
        enum: {
            values: USER_ROLES,
            message: 'Invalid user role. Must be one of: patient, provider, admin, health-worker'
        },
        default: ['patient']
    },
    isActive: {
        type: Boolean,
        default: true
    },

    // ==================== OAUTH INTEGRATION ====================
    googleId: String,
    provider: {
        type: String,
        enum: ['local', 'google'],
        default: 'local'
    },

    // ==================== PROFILE PICTURE ====================
    profilePicture: String,

    // ==================== TIMESTAMPS & SECURITY ====================
    lastLogin: Date,
    lastProfileUpdate: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    loginAttempts: {
        type: Number,
        default: 0
    },
    lockUntil: Date

}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// ==================== INDEXES FOR PERFORMANCE ====================

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ 'locationData.healthDistrict': 1 });
userSchema.index({ 'locationData.subLocation': 1 });
userSchema.index({ isProfileComplete: 1 });
userSchema.index({ roles: 1 });
userSchema.index({ createdAt: 1 });
userSchema.index({ isActive: 1, isProfileComplete: 1 });

// ==================== VIRTUAL FIELDS ====================

/**
 * Virtual field: User's full name
 * @virtual
 * @returns {string} Combined first and last name
 */
userSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});

/**
 * Virtual field: Calculate user's age
 * @virtual
 * @returns {number|null} Age in years
 */
userSchema.virtual('age').get(function () {
    if (!this.dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age;
});

/**
 * Virtual field: Check if user is elderly (60+)
 * @virtual
 * @returns {boolean}
 */
userSchema.virtual('isElderly').get(function () {
    return this.age >= 60;
});

/**
 * Virtual field: Check if user is minor (<18)
 * @virtual
 * @returns {boolean}
 */
userSchema.virtual('isMinor').get(function () {
    return this.age < 18;
});

// ==================== PRE-SAVE MIDDLEWARE ====================

/**
 * Pre-save middleware for password hashing
 * @hook pre-save
 */
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

/**
 * Pre-save middleware for profile completion tracking
 * @hook pre-save
 */
userSchema.pre('save', function (next) {
    // Calculate profile completion percentage
    this.calculateProfileCompletion();

    // Set profile completion date when profile becomes complete
    if (this.isModified('isProfileComplete') && this.isProfileComplete && !this.profileCompletionDate) {
        this.profileCompletionDate = new Date();
    }

    // Update last profile update timestamp
    if (this.isModified() && !this.isModified('lastLogin') && !this.isModified('lastProfileUpdate')) {
        this.lastProfileUpdate = new Date();
    }

    next();
});

// ==================== INSTANCE METHODS ====================

/**
 * Verify user password
 * @instance
 * @param {string} candidatePassword - Password to verify
 * @returns {Promise<boolean>} True if password matches
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

/**
 * Check if user can access district services
 * @instance
 * @param {string} district - KZN district to check access for
 * @returns {boolean} True if user can access the district
 */
userSchema.methods.canAccessDistrict = function (district) {
    if (this.roles.includes('admin') || this.roles.includes('health-worker')) return true;
    return this.locationData?.healthDistrict === district;
};

/**
 * Get recommended facility types based on user profile
 * @instance
 * @returns {Array<string>} Recommended facility types
 */
userSchema.methods.getRecommendedFacilities = function () {
    const recommendations = [];

    // Base recommendations on medical aid status
    if (!this.healthcarePreferences?.hasMedicalAid) {
        recommendations.push('public-clinic', 'public-hospital', 'unjani-clinic');
    } else {
        recommendations.push('private-practice', 'private-hospital', 'specialist-center');
    }

    // Add public options for emergencies
    if (!recommendations.includes('public-hospital')) {
        recommendations.push('public-hospital');
    }

    return [...new Set(recommendations)]; // Remove duplicates
};

/**
 * Calculate profile completion percentage
 * @instance
 * @returns {number} Completion percentage (0-100)
 */
userSchema.methods.calculateProfileCompletion = function () {
    const requiredFields = [
        'firstName', 'lastName', 'email', 'phoneNumber', 'dateOfBirth', 'gender',
        'locationData.healthDistrict', 'locationData.subLocation', 'locationData.preferredFacilityType'
    ];

    let completed = 0;

    const getNestedValue = (obj, path) => {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : undefined;
        }, obj);
    };

    requiredFields.forEach(field => {
        const value = getNestedValue(this, field);
        if (value !== undefined && value !== null && value !== '') {
            completed++;
        }
    });

    this.profileCompletionPercentage = Math.round((completed / requiredFields.length) * 100);
    this.isProfileComplete = this.profileCompletionPercentage >= 80;

    return this.profileCompletionPercentage;
};

/**
 * Get user's KZN district information
 * @instance
 * @returns {Object} District information object
 */
userSchema.methods.getDistrictInfo = function () {
    return {
        district: this.locationData?.healthDistrict,
        subLocation: this.locationData?.subLocation,
        districtType: this.locationData?.districtType,
        preferredFacilityType: this.locationData?.preferredFacilityType,
        coordinates: this.locationData?.coordinates
    };
};

// ==================== STATIC METHODS ====================

/**
 * Find users by KZN district
 * @static
 * @param {string} district - KZN district code
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of user documents
 */
userSchema.statics.findByDistrict = function (district, options = {}) {
    const query = {
        'locationData.healthDistrict': district,
        isProfileComplete: true
    };

    if (options.isActive !== undefined) {
        query.isActive = options.isActive;
    }

    if (options.roles) {
        query.roles = { $in: options.roles };
    }

    return this.find(query)
        .select('-password -emailVerificationToken -passwordResetToken')
        .sort({ createdAt: -1 });
};

/**
 * Get comprehensive district statistics for KZN healthcare
 * @static
 * @returns {Promise<Array>} District statistics array
 */
userSchema.statics.getDistrictStats = async function () {
    const stats = await this.aggregate([
        {
            $match: {
                isProfileComplete: true,
                isActive: true
            }
        },
        {
            $group: {
                _id: '$locationData.healthDistrict',
                totalUsers: { $sum: 1 },
                averageAge: {
                    $avg: {
                        $divide: [
                            { $subtract: [new Date(), '$dateOfBirth'] },
                            365 * 24 * 60 * 60 * 1000 // Convert milliseconds to years
                        ]
                    }
                },
                hasMedicalAid: {
                    $sum: {
                        $cond: ['$healthcarePreferences.hasMedicalAid', 1, 0]
                    }
                },
                elderlyUsers: {
                    $sum: {
                        $cond: [
                            {
                                $lt: [
                                    { $divide: [{ $subtract: [new Date(), '$dateOfBirth'] }, 365 * 24 * 60 * 60 * 1000] },
                                    60
                                ]
                            },
                            0, 1
                        ]
                    }
                },
                usersWithChronicConditions: {
                    $sum: {
                        $cond: [
                            { $gt: [{ $size: '$medicalHistory.conditions' }, 0] },
                            1, 0
                        ]
                    }
                }
            }
        },
        {
            $project: {
                district: '$_id',
                totalUsers: 1,
                averageAge: { $round: ['$averageAge', 1] },
                medicalAidCoverage: {
                    $round: [
                        { $multiply: [{ $divide: ['$hasMedicalAid', '$totalUsers'] }, 100] },
                        1
                    ]
                },
                elderlyPercentage: {
                    $round: [
                        { $multiply: [{ $divide: ['$elderlyUsers', '$totalUsers'] }, 100] },
                        1
                    ]
                },
                chronicConditionsPercentage: {
                    $round: [
                        { $multiply: [{ $divide: ['$usersWithChronicConditions', '$totalUsers'] }, 100] },
                        1
                    ]
                }
            }
        },
        {
            $sort: { totalUsers: -1 }
        }
    ]);

    return stats;
};

// ==================== QUERY HELPERS ====================

/**
 * Query helper for active users
 */
userSchema.query.active = function () {
    return this.where({ isActive: true, isProfileComplete: true });
};

/**
 * Query helper for users by role
 */
userSchema.query.byRole = function (role) {
    return this.where({ roles: role, isActive: true });
};

/**
 * Query helper for users in district
 */
userSchema.query.inDistrict = function (district) {
    return this.where({ 'locationData.healthDistrict': district, isActive: true });
};

// ==================== MODEL EXPORT ====================

/**
 * User Model
 * @class User
 * @extends mongoose.Model
 */
const User = mongoose.model('User', userSchema);

export default User;

// ==================== ADDITIONAL EXPORTS ====================

/**
 * Export constants for external use
 */
export {
    KZN_DISTRICTS,
    FACILITY_TYPES,
    USER_ROLES
};