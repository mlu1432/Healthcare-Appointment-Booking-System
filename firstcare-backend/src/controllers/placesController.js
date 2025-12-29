/**
 * Google Places API Proxy Controller
 * Handles all Google Places API requests through backend to avoid CORS
 * 
 * @file src/controllers/placesController.js
 * @version 1.2.0
 * @description Secure proxy for Google Places API with KZN healthcare integration
 *              Enhanced Unjani Clinic search for better local results
 */

import axios from 'axios';
import { GOOGLE_API_KEY } from '../config/googleConfig.js';

/**
 * Google Places API Proxy Controller
 * This controller acts as a secure middleman between your frontend and Google's APIs
 * It handles healthcare facility searches with special logic for South African clinics
 */
const placesController = {
    /**
     * Search for healthcare facilities using Google Places Text Search API
     * Enhanced with better Unjani Clinic detection and local search
     * 
     * @route GET /api/places/healthcare
     */
    searchHealthcareFacilities: async (req, res) => {
        try {
            const { specialty, lat, lng, radius = 10000 } = req.query;

            console.log('Healthcare search request:', { specialty, lat, lng, radius });

            // Input validation - make sure we have what we need
            if (!specialty || !lat || !lng) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required parameters',
                    code: 'MISSING_PARAMETERS',
                    message: 'Please provide specialty, latitude, and longitude to search for healthcare facilities'
                });
            }

            // Check if our Google Maps API is properly set up
            if (!GOOGLE_API_KEY) {
                return res.status(500).json({
                    success: false,
                    error: 'Google Maps API not configured',
                    code: 'API_NOT_CONFIGURED',
                    message: 'Google Maps API key is not configured on the server'
                });
            }

            // Map medical specialties to search terms Google understands
            const searchTerms = {
                'cardiologist': 'cardiologist',
                'dentists': 'dentist',
                'general-practitioner': 'general practitioner',
                'gynecologists': 'gynecologist',
                'ophthalmologist': 'ophthalmologist',
                'psychologists': 'psychologist',
                'pediatrician': 'pediatrician',
                'dermatologist': 'dermatologist',
                'orthopedic-surgeon': 'orthopedic surgeon',
                'physiotherapist': 'physiotherapist',
                'emergency-care': 'emergency care hospital',
                'unjani-clinics': 'Unjani Clinic'
            };

            const searchTerm = searchTerms[specialty] || specialty;
            const coordinates = { lat: parseFloat(lat), lng: parseFloat(lng) };
            const searchRadius = parseInt(radius);

            console.log(`Searching for ${searchTerm} at coordinates: ${coordinates.lat}, ${coordinates.lng} within ${searchRadius / 1000}km radius`);

            // Step 1: Search for places using Google Places Text Search
            const textSearchUrl = 'https://maps.googleapis.com/maps/api/place/textsearch/json';

            const searchResponse = await axios.get(textSearchUrl, {
                params: {
                    query: `${searchTerm} clinic hospital`,
                    location: `${coordinates.lat},${coordinates.lng}`,
                    radius: searchRadius,
                    key: GOOGLE_API_KEY,
                    type: 'doctor|hospital|health'
                },
                timeout: 10000
            });

            console.log(`Google Places API response status: ${searchResponse.data.status}`);

            // Handle different response statuses from Google
            if (searchResponse.data.status !== 'OK') {
                console.log('Google Places API returned status:', searchResponse.data.status);
                return res.status(200).json({
                    success: true,
                    facilities: [],
                    total: 0,
                    searchTerm,
                    message: 'No healthcare facilities found in your area',
                    apiStatus: searchResponse.data.status
                });
            }

            // Step 2: Get detailed information for each place we found
            const placesWithDetails = await Promise.all(
                searchResponse.data.results.slice(0, 15).map(async (place) => {
                    try {
                        const detailsUrl = 'https://maps.googleapis.com/maps/api/place/details/json';
                        const detailsResponse = await axios.get(detailsUrl, {
                            params: {
                                place_id: place.place_id,
                                fields: 'name,formatted_address,formatted_phone_number,opening_hours,rating,user_ratings_total,website,geometry,url',
                                key: GOOGLE_API_KEY
                            },
                            timeout: 5000
                        });

                        if (detailsResponse.data.status === 'OK') {
                            const details = detailsResponse.data.result;
                            const distance = calculateDistance(
                                coordinates.lat,
                                coordinates.lng,
                                place.geometry.location.lat,
                                place.geometry.location.lng
                            );

                            // Check if this is an Unjani Clinic by name
                            const isUnjani = place.name.toLowerCase().includes('unjani');

                            return {
                                id: place.place_id,
                                name: place.name,
                                address: details.formatted_address || place.formatted_address,
                                location: {
                                    lat: place.geometry.location.lat,
                                    lng: place.geometry.location.lng
                                },
                                phone: details.formatted_phone_number,
                                rating: place.rating || 3.5,
                                totalRatings: place.user_ratings_total || 0,
                                openingHours: details.opening_hours,
                                website: details.website,
                                googleMapsUrl: details.url,
                                types: place.types || [],
                                distance: distance,
                                isOpen: details.opening_hours?.open_now || false,
                                isUnjani: isUnjani,
                                specialBadge: isUnjani ? 'Unjani Clinic' : null
                            };
                        }
                    } catch (error) {
                        console.error(`Error fetching details for ${place.place_id}:`, error.message);
                        const distance = calculateDistance(
                            coordinates.lat,
                            coordinates.lng,
                            place.geometry.location.lat,
                            place.geometry.location.lng
                        );
                        const isUnjani = place.name.toLowerCase().includes('unjani');

                        return {
                            id: place.place_id,
                            name: place.name,
                            address: place.formatted_address,
                            location: {
                                lat: place.geometry.location.lat,
                                lng: place.geometry.location.lng
                            },
                            rating: place.rating || 3.5,
                            totalRatings: place.user_ratings_total || 0,
                            types: place.types || [],
                            distance: distance,
                            isOpen: false,
                            isUnjani: isUnjani,
                            specialBadge: isUnjani ? 'Unjani Clinic' : null
                        };
                    }
                })
            );

            // Filter out any null results
            const validPlaces = placesWithDetails.filter(place => place !== null);

            // ENHANCED UNJANI CLINIC SEARCH FOR GENERAL PRACTITIONERS
            // This ensures users get comprehensive results including nearby Unjani Clinics
            if (specialty === 'general-practitioner' || specialty === 'unjani-clinics') {
                console.log('Performing enhanced Unjani Clinic search for better local results');

                try {
                    // Use multiple search terms to find Unjani Clinics
                    const unjaniSearchTerms = [
                        'Unjani Clinic',
                        'Unjani',
                        'UJ Clinic',
                        'UJ Medical'
                    ];

                    const allUnjaniResults = [];

                    // Search with each term to maximize results
                    for (const term of unjaniSearchTerms) {
                        try {
                            const unjaniResponse = await axios.get(textSearchUrl, {
                                params: {
                                    query: term,
                                    location: `${coordinates.lat},${coordinates.lng}`,
                                    radius: searchRadius, // Use the same radius as main search
                                    key: GOOGLE_API_KEY,
                                    type: 'doctor|hospital|health'
                                },
                                timeout: 8000
                            });

                            if (unjaniResponse.data.status === 'OK' && unjaniResponse.data.results.length > 0) {
                                console.log(`Found ${unjaniResponse.data.results.length} results for search term: "${term}"`);

                                // Get details for Unjani Clinics
                                const unjaniWithDetails = await Promise.all(
                                    unjaniResponse.data.results.slice(0, 8).map(async (place) => {
                                        try {
                                            const detailsUrl = 'https://maps.googleapis.com/maps/api/place/details/json';
                                            const detailsResponse = await axios.get(detailsUrl, {
                                                params: {
                                                    place_id: place.place_id,
                                                    fields: 'name,formatted_address,formatted_phone_number,opening_hours,rating,user_ratings_total,website,geometry,url',
                                                    key: GOOGLE_API_KEY
                                                },
                                                timeout: 4000
                                            });

                                            if (detailsResponse.data.status === 'OK') {
                                                const details = detailsResponse.data.result;
                                                const distance = calculateDistance(
                                                    coordinates.lat,
                                                    coordinates.lng,
                                                    place.geometry.location.lat,
                                                    place.geometry.location.lng
                                                );

                                                // Only include if within a reasonable distance (filter out very distant results)
                                                const distanceKm = parseFloat(distance);
                                                if (distanceKm <= 50) { // Filter out results beyond 50km
                                                    return {
                                                        id: place.place_id,
                                                        name: place.name,
                                                        address: details.formatted_address || place.formatted_address,
                                                        location: {
                                                            lat: place.geometry.location.lat,
                                                            lng: place.geometry.location.lng
                                                        },
                                                        phone: details.formatted_phone_number,
                                                        rating: place.rating || 3.5,
                                                        totalRatings: place.user_ratings_total || 0,
                                                        openingHours: details.opening_hours,
                                                        website: details.website,
                                                        googleMapsUrl: details.url,
                                                        types: place.types || [],
                                                        distance: distance,
                                                        isOpen: details.opening_hours?.open_now || false,
                                                        isUnjani: true,
                                                        specialBadge: 'Unjani Clinic',
                                                        searchTerm: term
                                                    };
                                                }
                                            }
                                        } catch (error) {
                                            console.error(`Error fetching details for Unjani clinic:`, error.message);
                                            return null;
                                        }
                                    })
                                );

                                // Add valid results to our collection
                                const validResults = unjaniWithDetails.filter(place => place !== null);
                                allUnjaniResults.push(...validResults);
                            }
                        } catch (error) {
                            console.error(`Error searching for term "${term}":`, error.message);
                            // Continue with next search term
                        }
                    }

                    // Remove duplicates from Unjani results
                    const uniqueUnjaniResults = allUnjaniResults.filter((place, index, self) =>
                        index === self.findIndex(p => p.id === place.id)
                    );

                    // Merge Unjani clinics with main results, avoiding duplicates
                    if (uniqueUnjaniResults.length > 0) {
                        console.log(`Found ${uniqueUnjaniResults.length} unique Unjani Clinics`);

                        uniqueUnjaniResults.forEach(unjaniClinic => {
                            const isDuplicate = validPlaces.some(facility =>
                                facility.id === unjaniClinic.id
                            );
                            if (!isDuplicate) {
                                validPlaces.push(unjaniClinic);
                            }
                        });

                        console.log(`Combined results: ${validPlaces.length} total facilities (including ${uniqueUnjaniResults.length} Unjani Clinics)`);
                    } else {
                        console.log('No Unjani Clinics found within the search radius');
                    }

                } catch (error) {
                    console.error('Error in enhanced Unjani clinic search:', error.message);
                    // If Unjani search fails, we still return the regular results
                }
            }

            // Sort all facilities by distance so closest ones show up first
            validPlaces.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));

            // Filter to show only nearby results (within 20km) for better relevance
            const nearbyPlaces = validPlaces.filter(place => {
                const distanceKm = parseFloat(place.distance);
                return distanceKm <= 20; // Show only results within 20km
            });

            console.log(`Successfully found ${nearbyPlaces.length} healthcare facilities within 20km`);

            // Return our nicely formatted results
            res.json({
                success: true,
                facilities: nearbyPlaces,
                total: nearbyPlaces.length,
                searchTerm,
                location: coordinates,
                radius: searchRadius,
                timestamp: new Date().toISOString(),
                message: nearbyPlaces.length === 0 ?
                    'No healthcare facilities found within 20km. Try increasing the search radius.' :
                    `Found ${nearbyPlaces.length} facilities nearby`
            });

        } catch (error) {
            console.error('Google Places search error:', error.message);

            // Handle specific types of errors with helpful messages
            if (error.code === 'ECONNABORTED') {
                return res.status(408).json({
                    success: false,
                    error: 'Request timeout',
                    code: 'REQUEST_TIMEOUT',
                    message: 'Google Places API took too long to respond. Please try again.'
                });
            }

            if (error.response?.status === 403) {
                return res.status(500).json({
                    success: false,
                    error: 'Google API quota exceeded',
                    code: 'API_QUOTA_EXCEEDED',
                    message: 'Google Places API quota has been exceeded. Please try again later.'
                });
            }

            // Generic error response for unexpected issues
            res.status(500).json({
                success: false,
                error: 'Failed to search healthcare facilities',
                code: 'PLACES_SEARCH_ERROR',
                message: 'An unexpected error occurred while searching for healthcare facilities'
            });
        }
    },

    /**
     * Search for general places (fallback endpoint)
     * This is a more general search that can be used for non-healthcare places
     * 
     * @route GET /api/places/search
     */
    searchPlaces: async (req, res) => {
        try {
            const { query, lat, lng, radius = 10000 } = req.query;

            if (!query || !lat || !lng) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required parameters',
                    code: 'MISSING_PARAMETERS',
                    message: 'Please provide a search query, latitude, and longitude'
                });
            }

            const textSearchUrl = 'https://maps.googleapis.com/maps/api/place/textsearch/json';

            const response = await axios.get(textSearchUrl, {
                params: {
                    query: query,
                    location: `${lat},${lng}`,
                    radius: radius,
                    key: GOOGLE_API_KEY
                },
                timeout: 10000
            });

            res.json({
                success: true,
                status: response.data.status,
                results: response.data.results,
                next_page_token: response.data.next_page_token
            });

        } catch (error) {
            console.error('Places search error:', error.message);
            res.status(500).json({
                success: false,
                error: 'Failed to search places',
                code: 'PLACES_SEARCH_ERROR',
                message: 'An error occurred while searching for places'
            });
        }
    },

    /**
     * Get detailed place information
     * Useful when you need more information about a specific place
     * 
     * @route GET /api/places/details
     */
    getPlaceDetails: async (req, res) => {
        try {
            const { place_id } = req.query;

            if (!place_id) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing place_id',
                    code: 'MISSING_PLACE_ID',
                    message: 'Please provide a Google Place ID'
                });
            }

            const detailsUrl = 'https://maps.googleapis.com/maps/api/place/details/json';

            const response = await axios.get(detailsUrl, {
                params: {
                    place_id: place_id,
                    fields: 'name,formatted_address,formatted_phone_number,opening_hours,rating,user_ratings_total,website,geometry,url',
                    key: GOOGLE_API_KEY
                },
                timeout: 5000
            });

            res.json({
                success: true,
                status: response.data.status,
                result: response.data.result
            });

        } catch (error) {
            console.error('Place details error:', error.message);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch place details',
                code: 'PLACE_DETAILS_ERROR',
                message: 'An error occurred while fetching place details'
            });
        }
    }
};

/**
 * Calculate distance between two coordinates in kilometers
 * Uses the Haversine formula for accurate distance calculation
 * 
 * @param {number} lat1 - Starting latitude
 * @param {number} lon1 - Starting longitude  
 * @param {number} lat2 - Ending latitude
 * @param {number} lon2 - Ending longitude
 * @returns {string} Distance in kilometers with one decimal place
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance.toFixed(1) + ' km';
}

export default placesController;