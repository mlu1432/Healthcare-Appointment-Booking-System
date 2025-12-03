/**
 * Unified Healthcare Facility Model
 * Combines facility and doctor data with geolocation capabilities
 * 
 * @module models/HealthcareFacility
 * @version 2.0.0
 * @description Comprehensive healthcare facility schema with KZN district integration
 */

import mongoose from 'mongoose';

const operatingHoursSchema = new mongoose.Schema({
    monday: { open: String, close: String, closed: { type: Boolean, default: false } },
    tuesday: { open: String, close: String, closed: { type: Boolean, default: false } },
    wednesday: { open: String, close: String, closed: { type: Boolean, default: false } },
    thursday: { open: String, close: String, closed: { type: Boolean, default: false } },
    friday: { open: String, close: String, closed: { type: Boolean, default: false } },
    saturday: { open: String, close: String, closed: { type: Boolean, default: false } },
    sunday: { open: String, close: String, closed: { type: Boolean, default: false } }
}, { _id: false });

const contactSchema = new mongoose.Schema({
    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    website: { type: String, trim: true },
    emergencyContact: { type: String, trim: true }
}, { _id: false });

const locationSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
        required: true
    },
    coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
        //index: '2dsphere',
        validate: {
            validator: function (coords) {
                return coords.length === 2 &&
                    coords[0] >= -180 && coords[0] <= 180 &&
                    coords[1] >= -90 && coords[1] <= 90;
            },
            message: 'Invalid coordinates format. Use [longitude, latitude]'
        }
    }
}, { _id: false });

const doctorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    specialty: {
        type: String,
        required: true,
        enum: [
            'General Practitioner',
            'Gynecologist',
            'Dentist',
            'Psychologist',
            'Cardiologist',
            'Ophthalmologist',
            'Dermatologist',
            'Orthopedic Surgeon',
            'Physiotherapist',
            'Pediatrician',
            'Emergency Medicine',
            'Radiologist'
        ]
    },
    qualifications: [String],
    consultationFee: {
        type: Number,
        min: 0,
        default: 0
    },
    availability: operatingHoursSchema,
    languages: [{
        type: String,
        enum: ['english', 'zulu', 'afrikaans', 'xhosa', 'sotho', 'tswana']
    }],
    isAvailable: {
        type: Boolean,
        default: true
    },
    licenseNumber: String
}, { _id: false });

const healthcareFacilitySchema = new mongoose.Schema({
    // Core Identification
    name: {
        type: String,
        required: [true, 'Facility name is required'],
        trim: true,
        maxlength: [200, 'Facility name cannot exceed 200 characters']
    },
    googlePlaceId: {
        type: String,
        unique: true,
        sparse: true,
        trim: true
    },

    // KZN Geographic Data
    district: {
        type: String,
        required: [true, 'KZN district is required'],
        enum: {
            values: [
                'amajuba', 'ethekwini', 'ilembe', 'king-cetshwayo',
                'umgungundlovu', 'umkhanyakude', 'ugu', 'umzinyathi',
                'uthukela', 'zululand'
            ],
            message: 'Invalid KZN district'
        },
        index: true
    },
    subLocation: {
        type: String,
        required: [true, 'Sub-location is required'],
        trim: true
    },
    address: {
        type: String,
        required: [true, 'Address is required'],
        trim: true
    },

    // Geolocation Data
    location: locationSchema,

    // Facility Classification
    facilityType: {
        type: String,
        required: [true, 'Facility type is required'],
        enum: {
            values: [
                'public-hospital',
                'public-clinic',
                'unjani-clinic',
                'private-practice',
                'private-hospital',
                'specialist-center'
            ],
            message: 'Invalid facility type'
        },
        index: true
    },
    categories: [{
        type: String,
        enum: [
            'primary-care', 'specialist', 'emergency', 'dental',
            'mental-health', 'maternal', 'pediatric', 'surgical',
            'diagnostic', 'rehabilitation', 'preventive'
        ]
    }],

    // Medical Staff
    doctors: [doctorSchema],
    totalDoctors: {
        type: Number,
        default: 0,
        min: 0
    },

    // Contact Information
    contact: contactSchema,

    // Services & Operations
    operatingHours: operatingHoursSchema,
    services: [{
        type: String,
        trim: true
    }],
    specialties: [String],

    // Quality & Verification
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0,
        set: v => Math.round(v * 10) / 10 // Round to 1 decimal
    },
    userRatingsTotal: {
        type: Number,
        default: 0,
        min: 0
    },
    isVerified: {
        type: Boolean,
        default: false,
        index: true
    },

    // Affordability & Payment
    affordabilityTier: {
        type: String,
        enum: ['low-cost', 'medical-aid', 'private', 'government'],
        default: 'private',
        index: true
    },
    acceptsMedicalAid: {
        type: Boolean,
        default: false
    },
    medicalAidProviders: [String],
    estimatedCosts: {
        consultation: Number,
        followUp: Number,
        emergency: Number
    },

    // Google Places Integration
    googleData: {
        businessStatus: String,
        openingHours: mongoose.Schema.Types.Mixed,
        photos: [String],
        plusCode: String,
        lastUpdated: Date
    },

    // Metadata
    isActive: {
        type: Boolean,
        default: true,
        index: true
    },
    lastVerified: Date

}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Compound Indexes for Performance
healthcareFacilitySchema.index({ district: 1, facilityType: 1 });
healthcareFacilitySchema.index({ district: 1, affordabilityTier: 1 });
healthcareFacilitySchema.index({ 'location.coordinates': '2dsphere' });
healthcareFacilitySchema.index({ isActive: 1, isVerified: 1 });
healthcareFacilitySchema.index({ facilityType: 1, categories: 1 });

// Virtual for formatted address
healthcareFacilitySchema.virtual('formattedAddress').get(function () {
    return `${this.address}, ${this.subLocation}, ${this.district} District, KZN`;
});

// Virtual for doctor count by specialty
healthcareFacilitySchema.virtual('doctorSpecialties').get(function () {
    const specialties = {};
    this.doctors.forEach(doctor => {
        specialties[doctor.specialty] = (specialties[doctor.specialty] || 0) + 1;
    });
    return specialties;
});

/**
 * Find facilities near specified coordinates
 * @param {Array} coordinates - [longitude, latitude]
 * @param {number} maxDistance - Maximum distance in meters
 * @param {Object} filters - Additional query filters
 * @returns {Promise} Query promise
 */
healthcareFacilitySchema.statics.findNearby = function (coordinates, maxDistance = 10000, filters = {}) {
    const query = {
        isActive: true,
        location: {
            $near: {
                $geometry: {
                    type: 'Point',
                    coordinates: coordinates
                },
                $maxDistance: maxDistance
            }
        },
        ...filters
    };

    return this.find(query)
        .limit(100)
        .select('name facilityType district address location rating doctors contact services');
};

/**
 * Find facilities by district and type with optional filters
 * @param {string} district - KZN district code
 * @param {string} facilityType - Type of facility
 * @param {Object} options - Additional options
 * @returns {Promise} Query promise
 */
healthcareFacilitySchema.statics.findByDistrictAndType = function (district, facilityType = null, options = {}) {
    const {
        specialty = null,
        affordabilityTier = null,
        limit = 50
    } = options;

    let query = {
        district,
        isActive: true,
        isVerified: true
    };

    if (facilityType) query.facilityType = facilityType;
    if (affordabilityTier) query.affordabilityTier = affordabilityTier;
    if (specialty) query['doctors.specialty'] = specialty;

    return this.find(query)
        .limit(limit)
        .sort({ rating: -1, totalDoctors: -1 });
};

/**
 * Get affordable facilities with cost filtering
 * @param {string} district - Optional district filter
 * @param {number} maxConsultationFee - Maximum consultation fee
 * @returns {Promise} Query promise
 */
healthcareFacilitySchema.statics.findAffordable = function (district = null, maxConsultationFee = 500) {
    const query = {
        affordabilityTier: { $in: ['low-cost', 'government'] },
        'doctors.consultationFee': { $lte: maxConsultationFee },
        isActive: true,
        isVerified: true
    };

    if (district) query.district = district;

    return this.find(query)
        .sort({ 'doctors.consultationFee': 1, rating: -1 })
        .limit(100);
};

/**
 * Update doctor count when doctors array changes
 */
healthcareFacilitySchema.pre('save', function (next) {
    this.totalDoctors = this.doctors.length;
    next();
});

// Text search index for facility name and address
healthcareFacilitySchema.index({
    name: 'text',
    address: 'text',
    subLocation: 'text',
    'doctors.name': 'text'
});

export default mongoose.model('HealthcareFacility', healthcareFacilitySchema);