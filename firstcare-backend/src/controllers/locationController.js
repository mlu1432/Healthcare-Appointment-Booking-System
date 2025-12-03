/**
 * Location Controller for KZN Healthcare System
 * 
 * @file src/controllers/locationController.js
 * @description Comprehensive location-based services with Google Maps integration
 * 
 * Features:
 * - District detection from geographic coordinates
 * - Google Maps reverse geocoding integration
 * - KZN-specific district mapping and validation
 * - Comprehensive error handling and logging
 * 
 * @version 3.0.0
 * @module LocationController
 */

import { googleMapsClient, GOOGLE_API_KEY } from '../config/googleConfig.js';
import { validateCoordinates, isWithinKZNBounds, calculateDistance, formatDistance } from '../utils/geoUtils.js';

/**
 * KZN District Mapping Configuration
 */
const DISTRICT_MAPPING = {
    'Amajuba District Municipality': 'amajuba',
    'eThekwini Metropolitan Municipality': 'ethekwini',
    'iLembe District Municipality': 'ilembe',
    'King Cetshwayo District Municipality': 'king-cetshwayo',
    'uMgungundlovu District Municipality': 'umgungundlovu',
    'umKhanyakude District Municipality': 'umkhanyakude',
    'Ugu District Municipality': 'ugu',
    'uMzinyathi District Municipality': 'umzinyathi',
    'uThukela District Municipality': 'uthukela',
    'Zululand District Municipality': 'zululand'
};

/**
 * Fallback district detection for when Google Maps fails
 */
const getFallbackDistrict = (coordinates) => {
    const { lat, lng } = coordinates;

    // Rough geographic bounds for KZN districts
    const districtBounds = {
        'ethekwini': { minLat: -30.5, maxLat: -29.5, minLng: 30.5, maxLng: 31.5 },
        'umgungundlovu': { minLat: -30.0, maxLat: -29.0, minLng: 29.5, maxLng: 30.5 },
        'ilembe': { minLat: -29.8, maxLat: -28.8, minLng: 31.0, maxLng: 32.0 },
        'king-cetshwayo': { minLat: -29.0, maxLat: -27.5, minLng: 31.0, maxLng: 32.5 },
        'zululand': { minLat: -28.5, maxLat: -27.0, minLng: 30.5, maxLng: 32.0 }
    };

    for (const [district, bounds] of Object.entries(districtBounds)) {
        if (lat >= bounds.minLat && lat <= bounds.maxLat &&
            lng >= bounds.minLng && lng <= bounds.maxLng) {
            return {
                district: district,
                displayName: Object.keys(DISTRICT_MAPPING).find(key => DISTRICT_MAPPING[key] === district),
                confidence: 'low',
                source: 'fallback'
            };
        }
    }

    return null;
};

/**
 * Detect user's KZN district from geographic coordinates
 */
export const detectDistrict = async (req, res) => {
    try {
        console.log('District detection endpoint called with:', req.query);

        const { lat, lng } = req.query;

        // Input validation
        if (!lat || !lng) {
            console.warn('District detection failed: Missing coordinates');
            return res.status(400).json({
                success: false,
                error: 'Latitude and longitude are required',
                code: 'LOCATION_REQUIRED',
                message: 'Please provide both latitude and longitude coordinates'
            });
        }

        const coordinates = {
            lat: parseFloat(lat),
            lng: parseFloat(lng)
        };

        // Check for NaN values after parsing
        if (isNaN(coordinates.lat) || isNaN(coordinates.lng)) {
            console.warn('District detection failed: Invalid coordinate format', { lat, lng });
            return res.status(400).json({
                success: false,
                error: 'Invalid coordinate format',
                code: 'INVALID_COORDINATES',
                message: 'Latitude and longitude must be valid numbers'
            });
        }

        // Validate coordinate ranges and KZN bounds
        try {
            validateCoordinates(coordinates.lat, coordinates.lng);
        } catch (validationError) {
            console.warn('Coordinate validation failed:', validationError.message);
            return res.status(400).json({
                success: false,
                error: 'Invalid coordinates provided',
                code: 'INVALID_COORDINATES',
                message: validationError.message
            });
        }

        // Additional KZN-specific bounds check
        if (!isWithinKZNBounds(coordinates.lat, coordinates.lng)) {
            console.warn('Coordinates outside KZN bounds:', coordinates);
            return res.status(400).json({
                success: false,
                error: 'Coordinates outside KZN region',
                code: 'OUTSIDE_KZN',
                message: 'Provided coordinates are outside the KwaZulu-Natal region'
            });
        }

        console.log(`Processing coordinates: ${coordinates.lat}, ${coordinates.lng}`);

        let districtData = null;
        let usedFallback = false;
        let formattedAddress = 'Location in KwaZulu-Natal, South Africa';

        try {
            // Perform reverse geocoding with Google Maps API
            const response = await googleMapsClient.reverseGeocode({
                params: {
                    latlng: coordinates,
                    key: GOOGLE_API_KEY,
                    result_type: ['administrative_area_level_1', 'administrative_area_level_2'],
                    language: 'en'
                },
                timeout: 10000
            });

            console.log('Google Maps API response received');

            // Check if Google Maps returned any results
            if (!response.data.results || response.data.results.length === 0) {
                console.warn('No Google Maps results for coordinates, using fallback:', coordinates);
                districtData = getFallbackDistrict(coordinates);
                usedFallback = true;

                if (!districtData) {
                    return res.status(404).json({
                        success: false,
                        error: 'Location not found',
                        code: 'LOCATION_NOT_FOUND',
                        message: 'No address found for the provided coordinates'
                    });
                }
            } else {
                const firstResult = response.data.results[0];
                const addressComponents = firstResult.address_components;
                formattedAddress = firstResult.formatted_address;

                console.log('📍 Formatted address:', formattedAddress);

                // Extract and validate KwaZulu-Natal province
                const provinceComponent = addressComponents.find(component =>
                    component.types.includes('administrative_area_level_1')
                );

                if (!provinceComponent) {
                    console.warn('No province component found in address');
                    return res.status(400).json({
                        success: false,
                        error: 'Province not determined',
                        code: 'PROVINCE_NOT_FOUND',
                        message: 'Could not determine province for the provided location'
                    });
                }

                const provinceName = provinceComponent.long_name;
                console.log('Detected province:', provinceName);

                // Verify location is within KwaZulu-Natal
                if (!provinceName.toLowerCase().includes('kwazulu-natal') &&
                    !provinceName.toLowerCase().includes('kwa zulu natal')) {
                    console.warn('Location outside KZN:', provinceName);
                    return res.status(400).json({
                        success: false,
                        error: 'Location outside KwaZulu-Natal',
                        code: 'NOT_IN_KZN',
                        message: 'This service is currently available only in KwaZulu-Natal province',
                        detectedProvince: provinceName
                    });
                }

                // Extract district information from address components
                const districtComponent = addressComponents.find(component =>
                    component.types.includes('administrative_area_level_2')
                );

                if (!districtComponent) {
                    console.warn('No district component found in address, using fallback');
                    districtData = getFallbackDistrict(coordinates);
                    usedFallback = true;
                } else {
                    const districtName = districtComponent.long_name;
                    console.log('Detected district:', districtName);

                    // Map Google Maps district name to internal district code
                    const district = DISTRICT_MAPPING[districtName];

                    if (!district) {
                        console.warn('Unsupported district detected:', districtName);
                        return res.status(400).json({
                            success: false,
                            error: 'Unsupported KZN district',
                            code: 'UNSUPPORTED_DISTRICT',
                            message: 'The detected district is not currently supported',
                            districtName,
                            supportedDistricts: Object.keys(DISTRICT_MAPPING)
                        });
                    }

                    districtData = {
                        district: district,
                        displayName: districtName,
                        confidence: 'high',
                        source: 'google_maps'
                    };
                }
            }
        } catch (error) {
            console.warn('Google Maps API failed, using fallback:', error.message);
            districtData = getFallbackDistrict(coordinates);
            usedFallback = true;

            if (!districtData) {
                // Re-throw if no fallback available
                throw error;
            }
        }

        // Construct success response
        const successResponse = {
            success: true,
            district: districtData.district,
            displayName: districtData.displayName,
            id: districtData.district,
            fullAddress: formattedAddress,
            coordinates: coordinates,
            detectionSource: districtData.source,
            confidence: districtData.confidence,
            usedFallback: usedFallback,
            timestamp: new Date().toISOString()
        };

        console.log('District detection successful:', successResponse);
        res.status(200).json(successResponse);

    } catch (error) {
        console.error('District detection error:', {
            message: error.message,
            stack: error.stack,
            coordinates: req.query
        });

        // Handle Google Maps API specific errors
        if (error.response?.data?.error_message) {
            console.error('Google Maps API error:', error.response.data.error_message);
            return res.status(400).json({
                success: false,
                error: 'Google Maps API error',
                code: 'GOOGLE_API_ERROR',
                message: error.response.data.error_message
            });
        }

        // Handle network timeouts
        if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
            console.error('Google Maps API timeout');
            return res.status(408).json({
                success: false,
                error: 'Location service timeout',
                code: 'SERVICE_TIMEOUT',
                message: 'The location service took too long to respond. Please try again.'
            });
        }

        // Handle generic internal server errors
        res.status(500).json({
            success: false,
            error: 'Failed to detect district',
            code: 'DISTRICT_DETECTION_ERROR',
            message: 'An internal server error occurred while detecting your district'
        });
    }
};

/**
 * Get all supported KZN districts
 */
export const getSupportedDistricts = async (req, res) => {
    try {
        const districts = Object.entries(DISTRICT_MAPPING).map(([name, code]) => ({
            code: code,
            name: name,
            displayName: name.replace(' District Municipality', '').replace(' Metropolitan Municipality', '')
        }));

        res.status(200).json({
            success: true,
            districts: districts,
            count: districts.length,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Get supported districts error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve districts',
            code: 'DISTRICTS_RETRIEVAL_ERROR',
            message: 'An error occurred while retrieving supported districts'
        });
    }
};

/**
 * Validate coordinates and check if they're within KZN
 */
export const validateCoordinatesEndpoint = async (req, res) => {
    try {
        const { lat, lng } = req.body;

        if (lat === undefined || lng === undefined) {
            return res.status(400).json({
                success: false,
                error: 'Missing coordinates',
                code: 'COORDINATES_REQUIRED',
                message: 'Latitude and longitude are required in the request body'
            });
        }

        const coordinates = {
            lat: parseFloat(lat),
            lng: parseFloat(lng)
        };

        // Check for NaN values
        if (isNaN(coordinates.lat) || isNaN(coordinates.lng)) {
            return res.status(400).json({
                success: false,
                valid: false,
                error: 'Invalid coordinate format',
                coordinates: coordinates
            });
        }

        let validationError = null;
        try {
            validateCoordinates(coordinates.lat, coordinates.lng);
        } catch (error) {
            validationError = error.message;
        }

        const withinKZN = isWithinKZNBounds(coordinates.lat, coordinates.lng);

        res.status(200).json({
            success: true,
            valid: !validationError,
            withinKZN: withinKZN,
            coordinates: coordinates,
            error: validationError,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Coordinate validation error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to validate coordinates',
            code: 'VALIDATION_ERROR',
            message: 'An error occurred while validating coordinates'
        });
    }
};

/**
 * Find nearby healthcare facilities within specified radius
 */
export const getNearbyFacilities = async (req, res) => {
    try {
        console.log('Nearby facilities endpoint called with:', req.query);

        const { lat, lng, radius = 5000, type, affordability, specialty } = req.query;

        // Input validation
        if (!lat || !lng) {
            return res.status(400).json({
                success: false,
                error: 'Latitude and longitude are required',
                code: 'LOCATION_REQUIRED',
                message: 'Please provide both latitude and longitude coordinates'
            });
        }

        const coordinates = {
            lat: parseFloat(lat),
            lng: parseFloat(lng)
        };

        // Validate coordinates
        try {
            validateCoordinates(coordinates.lat, coordinates.lng);
        } catch (validationError) {
            return res.status(400).json({
                success: false,
                error: 'Invalid coordinates provided',
                code: 'INVALID_COORDINATES',
                message: validationError.message
            });
        }

        // Convert to MongoDB format [lng, lat]
        const mongoCoordinates = [parseFloat(lng), parseFloat(lat)];
        const searchRadius = Math.min(parseInt(radius), 50000); // Max 50km

        // Build filters
        const filters = {
            isActive: true,
            isVerified: true
        };

        if (type) filters.facilityType = type;
        if (affordability) filters.affordabilityTier = affordability;
        if (specialty) filters['doctors.specialty'] = specialty;

        console.log(`Searching for facilities within ${searchRadius}m of ${coordinates.lat}, ${coordinates.lng}`);

        // Import HealthcareFacility model
        const HealthcareFacility = (await import('../models/HealthcareFacility.js')).default;

        // Find nearby facilities
        const facilities = await HealthcareFacility.findNearby(
            mongoCoordinates,
            searchRadius,
            filters
        );

        // Enhance with distance information
        const facilitiesWithDistance = facilities.map(facility => {
            const facilityCoords = facility.location.coordinates;
            const distanceKm = calculateDistance(
                coordinates.lat,
                coordinates.lng,
                facilityCoords[1], // latitude
                facilityCoords[0]  // longitude
            );
            const distanceMeters = distanceKm * 1000;

            return {
                ...facility.toObject(),
                distance: formatDistance(distanceMeters),
                distanceMeters: Math.round(distanceMeters),
                distanceKm: parseFloat(distanceKm.toFixed(2))
            };
        });

        // Sort by distance
        facilitiesWithDistance.sort((a, b) => a.distanceMeters - b.distanceMeters);

        // Categorize by affordability for better UX
        const affordableCount = facilitiesWithDistance.filter(f =>
            f.affordabilityTier === 'low-cost' || f.affordabilityTier === 'government'
        ).length;

        const unjaniCount = facilitiesWithDistance.filter(f =>
            f.facilityType === 'unjani-clinic'
        ).length;

        console.log(`Found ${facilitiesWithDistance.length} facilities nearby`);

        res.status(200).json({
            success: true,
            facilities: facilitiesWithDistance,
            count: facilitiesWithDistance.length,
            searchLocation: coordinates,
            radius: searchRadius,
            summary: {
                affordableOptions: affordableCount,
                unjaniClinics: unjaniCount,
                publicFacilities: facilitiesWithDistance.filter(f =>
                    f.facilityType.includes('public')
                ).length,
                privateFacilities: facilitiesWithDistance.filter(f =>
                    f.facilityType.includes('private')
                ).length
            },
            filters: {
                type: type || 'any',
                affordability: affordability || 'any',
                specialty: specialty || 'any'
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Nearby facilities error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to find nearby facilities',
            code: 'FACILITIES_SEARCH_ERROR',
            message: 'An error occurred while searching for nearby healthcare facilities'
        });
    }
};

/**
 * Get healthcare facilities by KZN district
 */
export const getFacilitiesByDistrict = async (req, res) => {
    try {
        const { district } = req.params;
        const { type, affordability, specialty, limit = 50 } = req.query;

        console.log(`District facilities endpoint called for district: ${district}`);

        // Validate district
        if (!DISTRICT_MAPPING[district] && !Object.values(DISTRICT_MAPPING).includes(district)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid KZN district',
                code: 'INVALID_DISTRICT',
                message: 'The provided district is not a valid KZN district',
                validDistricts: Object.keys(DISTRICT_MAPPING)
            });
        }

        // Import HealthcareFacility model
        const HealthcareFacility = (await import('../models/HealthcareFacility.js')).default;

        const options = {
            specialty: specialty || null,
            affordabilityTier: affordability || null,
            limit: parseInt(limit)
        };

        const facilities = await HealthcareFacility.findByDistrictAndType(
            district,
            type,
            options
        );

        // Get district statistics
        const affordableFacilities = facilities.filter(f =>
            f.affordabilityTier === 'low-cost' || f.affordabilityTier === 'government'
        );

        const unjaniFacilities = facilities.filter(f =>
            f.facilityType === 'unjani-clinic'
        );

        console.log(`Found ${facilities.length} facilities in ${district} district`);

        res.status(200).json({
            success: true,
            district: district,
            districtName: Object.keys(DISTRICT_MAPPING).find(key =>
                DISTRICT_MAPPING[key] === district
            ) || district,
            facilities: facilities,
            count: facilities.length,
            statistics: {
                totalFacilities: facilities.length,
                affordableOptions: affordableFacilities.length,
                unjaniClinics: unjaniFacilities.length,
                publicFacilities: facilities.filter(f =>
                    f.facilityType.includes('public')
                ).length,
                privateFacilities: facilities.filter(f =>
                    f.facilityType.includes('private')
                ).length
            },
            filters: {
                type: type || 'any',
                affordability: affordability || 'any',
                specialty: specialty || 'any'
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('District facilities error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch district facilities',
            code: 'DISTRICT_FACILITIES_ERROR',
            message: 'An error occurred while fetching facilities for the district'
        });
    }
};

export default {
    detectDistrict,
    getSupportedDistricts,
    validateCoordinatesEndpoint,
    getNearbyFacilities,
    getFacilitiesByDistrict
};