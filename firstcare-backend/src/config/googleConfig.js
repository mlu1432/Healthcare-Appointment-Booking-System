/**
 * Google Maps & Places API Configuration
 * Centralized configuration for all Google Maps services
 * 
 * @module config/googleConfig
 * @version 2.0.0
 * @description Handles Google Maps, Places, and Geolocation APIs with KZN-specific mappings
 */

import { Client } from "@googlemaps/google-maps-services-js";

// Initialize Google Maps client with default configuration
export const googleMapsClient = new Client({});

export const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

/**
 * KZN District Mappings
 * Maps internal district codes to Google Places recognizable names
 */
export const KZN_DISTRICTS = {
    'amajuba': 'Amajuba District Municipality',
    'ethekwini': 'eThekwini Metropolitan Municipality',
    'ilembe': 'iLembe District Municipality',
    'king-cetshwayo': 'King Cetshwayo District Municipality',
    'umgungundlovu': 'uMgungundlovu District Municipality',
    'umkhanyakude': 'umKhanyakude District Municipality',
    'ugu': 'Ugu District Municipality',
    'umzinyathi': 'uMzinyathi District Municipality',
    'uthukela': 'uThukela District Municipality',
    'zululand': 'Zululand District Municipality'
};

/**
 * Healthcare Facility Type Mappings
 * Maps internal facility types to Google Places types and keywords
 */
export const FACILITY_TYPE_MAPPINGS = {
    'public-hospital': {
        googleTypes: ['hospital'],
        keywords: ['public hospital', 'government hospital'],
        category: 'public-health'
    },
    'public-clinic': {
        googleTypes: ['health', 'doctor'],
        keywords: ['public clinic', 'community clinic', 'government clinic'],
        category: 'public-health'
    },
    'unjani-clinic': {
        googleTypes: ['health', 'doctor'],
        category: 'low-cost'
    },
    'private-practice': {
        googleTypes: ['doctor', 'health'],
        keywords: ['private practice', 'medical practice', 'doctor'],
        category: 'private'
    },
    'private-hospital': {
        googleTypes: ['hospital'],
        keywords: ['private hospital', 'medical center'],

        category: 'private'
    },
    'specialist-center': {
        googleTypes: ['health'],
        keywords: ['specialist', 'specialist center', 'medical specialist'],
        category: 'specialist'
    }
};

/**
 * Google API Configuration Validation
 * @throws {Error} If required configuration is missing
 */
export const validateGoogleConfig = () => {
    if (!GOOGLE_API_KEY) {
        throw new Error('GOOGLE_MAPS_API_KEY is required in environment variables');
    }

    if (GOOGLE_API_KEY === 'your_google_maps_api_key_here') {
        throw new Error('Please set a valid GOOGLE_MAPS_API_KEY in your environment variables');
    }

    console.log(' Google Maps API configured successfully');
    return true;
};

/**
 * Get facility type configuration
 * @param {string} facilityType - Internal facility type
 * @returns {Object} Configuration object for the facility type
 */
export const getFacilityTypeConfig = (facilityType) => {
    return FACILITY_TYPE_MAPPINGS[facilityType] || {
        googleTypes: ['hospital', 'doctor', 'health'],
        keywords: ['healthcare', 'medical'],
        category: 'general'
    };
};

export default {
    googleMapsClient,
    GOOGLE_API_KEY,
    KZN_DISTRICTS,
    FACILITY_TYPE_MAPPINGS,
    validateGoogleConfig,
    getFacilityTypeConfig
};