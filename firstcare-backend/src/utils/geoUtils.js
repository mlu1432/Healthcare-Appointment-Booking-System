/**
 * Geographic Utilities for KZN Healthcare System
 * 
 * @module utils/geoUtils
 * @version 2.0.0
 * @description Geographic calculations and coordinate validations
 */

/**
 * Validate geographic coordinates
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @throws {Error} If coordinates are invalid
 */
export const validateCoordinates = (lat, lng) => {
    if (typeof lat !== 'number' || typeof lng !== 'number') {
        throw new Error('Coordinates must be numbers');
    }

    if (lat < -90 || lat > 90) {
        throw new Error('Latitude must be between -90 and 90 degrees');
    }

    if (lng < -180 || lng > 180) {
        throw new Error('Longitude must be between -180 and 180 degrees');
    }

    // KZN approximate bounds validation
    if (lat < -31.5 || lat > -26.8 || lng < 29.2 || lng > 32.9) {
        console.warn(`Coordinates (${lat}, ${lng}) are outside KZN approximate bounds`);
    }
};

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Start latitude
 * @param {number} lon1 - Start longitude
 * @param {number} lat2 - End latitude
 * @param {number} lon2 - End longitude
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

/**
 * Format distance for display
 * @param {number} meters - Distance in meters
 * @returns {string} Formatted distance
 */
export const formatDistance = (meters) => {
    if (meters < 1000) {
        return `${Math.round(meters)}m`;
    } else {
        return `${(meters / 1000).toFixed(1)}km`;
    }
};

/**
 * Check if coordinates are within KZN bounds
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {boolean} True if within KZN
 */
export const isWithinKZNBounds = (lat, lng) => {
    // KZN approximate bounding box
    const KZN_BOUNDS = {
        north: -26.8,
        south: -31.5,
        west: 29.2,
        east: 32.9
    };

    return lat >= KZN_BOUNDS.south &&
        lat <= KZN_BOUNDS.north &&
        lng >= KZN_BOUNDS.west &&
        lng <= KZN_BOUNDS.east;
};

/**
 * Generate random coordinates within KZN for testing
 * @returns {Object} Random coordinates {lat, lng}
 */
export const getRandomKZNCoordinates = () => {
    const KZN_BOUNDS = {
        north: -26.8,
        south: -31.5,
        west: 29.2,
        east: 32.9
    };

    const lat = KZN_BOUNDS.south + Math.random() * (KZN_BOUNDS.north - KZN_BOUNDS.south);
    const lng = KZN_BOUNDS.west + Math.random() * (KZN_BOUNDS.east - KZN_BOUNDS.west);

    return { lat, lng };
};

export default {
    validateCoordinates,
    calculateDistance,
    formatDistance,
    isWithinKZNBounds,
    getRandomKZNCoordinates
};