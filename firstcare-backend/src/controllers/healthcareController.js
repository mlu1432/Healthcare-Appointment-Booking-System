/**
 * Unified Healthcare Controller
 * Combines facility and doctor management with advanced search capabilities
 * 
 * @module controllers/healthcareController
 * @version 2.0.0
 * @description Comprehensive healthcare facility and doctor management
 */

import HealthcareFacility from '../models/HealthcareFacility.js';
import { KZN_DISTRICTS } from '../config/googleConfig.js';

/**
 * @typedef {Object} SearchFilters
 * @property {string} district - KZN district code
 * @property {string} facilityType - Type of healthcare facility
 * @property {string} specialty - Medical specialty
 * @property {string} affordabilityTier - Cost category
 * @property {string} search - Text search term
 * @property {string} service - Specific medical service
 */

/**
 * Advanced healthcare facility search with filtering
 * @route GET /api/healthcare/facilities
 * @param {SearchFilters} filters - Search filters
 * @param {number} page - Page number
 * @param {number} limit - Results per page
 * @returns {Object} Paginated search results
 * @returns {boolean} success - Operation status
 * @returns {Array} facilities - List of healthcare facilities
 * @returns {Object} pagination - Pagination information
 * @returns {Object} filters - Available filter options
 * @returns {Object} searchSummary - Search summary
 */
export const searchHealthcareFacilities = async (req, res) => {
    try {
        const {
            district,
            facilityType,
            specialty,
            affordabilityTier,
            search,
            service,
            page = 1,
            limit = 20,
            sortBy = 'rating',
            sortOrder = 'desc'
        } = req.query;

        // Build query with active and verified facilities only
        let query = {
            isActive: true,
            isVerified: true
        };

        // Apply filters
        if (district) {
            if (!KZN_DISTRICTS[district]) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid district',
                    code: 'INVALID_DISTRICT',
                    validDistricts: Object.keys(KZN_DISTRICTS)
                });
            }
            query.district = district;
        }

        if (facilityType) query.facilityType = facilityType;
        if (affordabilityTier) query.affordabilityTier = affordabilityTier;
        if (service) query.services = { $in: [new RegExp(service, 'i')] };
        if (specialty) query['doctors.specialty'] = specialty;

        // Text search across multiple fields
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { address: { $regex: search, $options: 'i' } },
                { subLocation: { $regex: search, $options: 'i' } },
                { 'doctors.name': { $regex: search, $options: 'i' } },
                { services: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        const skip = (page - 1) * limit;
        const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

        // Execute search with pagination
        const facilities = await HealthcareFacility.find(query)
            .skip(skip)
            .limit(parseInt(limit))
            .sort(sortOptions)
            .select('-googleData -__v'); // Exclude large/unnecessary fields

        const totalFacilities = await HealthcareFacility.countDocuments(query);

        // Get available filters for frontend
        const availableFilters = await getAvailableFilters(query);

        res.status(200).json({
            success: true,
            facilities,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalFacilities / limit),
                totalFacilities,
                hasNext: page < Math.ceil(totalFacilities / limit),
                hasPrev: page > 1,
                limit: parseInt(limit)
            },
            filters: availableFilters,
            searchSummary: {
                query: search || 'all facilities',
                filtersApplied: Object.keys(req.query).filter(key =>
                    !['page', 'limit', 'sortBy', 'sortOrder'].includes(key)
                )
            }
        });

    } catch (error) {
        console.error('Healthcare facility search error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to search healthcare facilities',
            code: 'FACILITY_SEARCH_ERROR',
            message: 'An error occurred while searching for healthcare facilities'
        });
    }
};

/**
 * Get available filter options based on current query
 * @param {Object} query - Current search query
 * @returns {Object} Available filter options
 */
async function getAvailableFilters(query) {
    const filters = await HealthcareFacility.aggregate([
        { $match: { ...query, isActive: true, isVerified: true } },
        {
            $facet: {
                districts: [
                    { $group: { _id: '$district', count: { $sum: 1 } } },
                    { $sort: { count: -1 } }
                ],
                facilityTypes: [
                    { $group: { _id: '$facilityType', count: { $sum: 1 } } },
                    { $sort: { count: -1 } }
                ],
                specialties: [
                    { $unwind: '$doctors' },
                    { $group: { _id: '$doctors.specialty', count: { $sum: 1 } } },
                    { $sort: { count: -1 } },
                    { $limit: 20 }
                ],
                affordabilityTiers: [
                    { $group: { _id: '$affordabilityTier', count: { $sum: 1 } } },
                    { $sort: { count: -1 } }
                ],
                services: [
                    { $unwind: '$services' },
                    { $group: { _id: '$services', count: { $sum: 1 } } },
                    { $sort: { count: -1 } },
                    { $limit: 30 }
                ]
            }
        }
    ]);

    return {
        districts: filters[0]?.districts || [],
        facilityTypes: filters[0]?.facilityTypes || [],
        specialties: filters[0]?.specialties || [],
        affordabilityTiers: filters[0]?.affordabilityTiers || [],
        services: filters[0]?.services || []
    };
}

/**
 * Get detailed information for a specific healthcare facility
 * @route GET /api/healthcare/facilities/:id
 * @param {string} id - Facility ID or Google Place ID
 * @returns {Object} Detailed facility information
 * @returns {boolean} success - Operation status
 * @returns {Object} facility - Complete facility details
 * @returns {Object} recommendations - Related facility suggestions
 */
export const getFacilityDetails = async (req, res) => {
    try {
        const { id } = req.params;

        let facility;

        // Try MongoDB ObjectId first, then Google Place ID
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            facility = await HealthcareFacility.findById(id);
        } else {
            facility = await HealthcareFacility.findOne({
                googlePlaceId: id,
                isActive: true
            });
        }

        if (!facility) {
            return res.status(404).json({
                success: false,
                error: 'Facility not found',
                code: 'FACILITY_NOT_FOUND',
                message: 'The requested healthcare facility was not found'
            });
        }

        // Get nearby similar facilities for recommendations
        const similarFacilities = await HealthcareFacility.find({
            district: facility.district,
            facilityType: facility.facilityType,
            isActive: true,
            isVerified: true,
            _id: { $ne: facility._id }
        })
            .limit(5)
            .select('name address rating facilityType doctors');

        res.status(200).json({
            success: true,
            facility: facility.toObject(),
            recommendations: {
                similarFacilities,
                message: `Other ${facility.facilityType.replace('-', ' ')}s in ${facility.district}`
            }
        });

    } catch (error) {
        console.error('Facility details error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch facility details',
            code: 'FACILITY_DETAILS_ERROR',
            message: 'An error occurred while fetching facility details'
        });
    }
};

/**
 * Search for doctors with advanced filtering
 * @route GET /api/healthcare/doctors
 * @param {Object} filters - Doctor search filters
 * @returns {Object} Paginated doctor results
 * @returns {boolean} success - Operation status
 * @returns {Array} doctors - List of doctors with facility info
 * @returns {Object} pagination - Pagination information
 */
export const searchDoctors = async (req, res) => {
    try {
        const {
            specialty,
            district,
            facilityType,
            languages,
            maxFee,
            page = 1,
            limit = 20
        } = req.query;

        // Build aggregation pipeline for doctor search
        const pipeline = [
            { $match: { isActive: true, isVerified: true } },
            { $unwind: '$doctors' },
            { $match: { 'doctors.isAvailable': true } }
        ];

        // Apply filters
        const matchStage = {};
        if (specialty) matchStage['doctors.specialty'] = specialty;
        if (district) matchStage.district = district;
        if (facilityType) matchStage.facilityType = facilityType;
        if (languages) {
            const langArray = Array.isArray(languages) ? languages : [languages];
            matchStage['doctors.languages'] = { $in: langArray.map(lang => new RegExp(lang, 'i')) };
        }
        if (maxFee) {
            matchStage['doctors.consultationFee'] = { $lte: parseFloat(maxFee) };
        }

        if (Object.keys(matchStage).length > 0) {
            pipeline.push({ $match: matchStage });
        }

        // Add pagination and projection
        const skip = (page - 1) * limit;

        pipeline.push(
            {
                $project: {
                    doctor: '$doctors',
                    facilityName: '$name',
                    facilityType: 1,
                    district: 1,
                    address: 1,
                    contact: 1,
                    rating: 1,
                    location: 1,
                    services: 1
                }
            },
            { $skip: skip },
            { $limit: parseInt(limit) }
        );

        const doctors = await HealthcareFacility.aggregate(pipeline);

        // Get total count for pagination
        const countPipeline = [
            ...pipeline.slice(0, -4), // Remove skip, limit, project stages
            { $count: 'total' }
        ];

        const totalResult = await HealthcareFacility.aggregate(countPipeline);
        const totalDoctors = totalResult[0]?.total || 0;

        res.status(200).json({
            success: true,
            doctors,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalDoctors / limit),
                totalDoctors,
                hasNext: page < Math.ceil(totalDoctors / limit),
                hasPrev: page > 1,
                limit: parseInt(limit)
            }
        });

    } catch (error) {
        console.error('Doctor search error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to search doctors',
            code: 'DOCTOR_SEARCH_ERROR',
            message: 'An error occurred while searching for doctors'
        });
    }
};

/**
 * Add a new healthcare facility (admin function)
 * @route POST /api/healthcare/facilities
 * @param {Object} facilityData - New facility data
 * @returns {Object} Created facility
 * @returns {boolean} success - Operation status
 * @returns {string} message - Success message
 * @returns {Object} facility - Created facility object
 * @returns {Array} nextSteps - Recommended next actions
 */
export const createHealthcareFacility = async (req, res) => {
    try {
        const facilityData = req.body;

        // Validate required fields
        const requiredFields = ['name', 'district', 'subLocation', 'address', 'facilityType'];
        const missingFields = requiredFields.filter(field => !facilityData[field]);

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
                code: 'MISSING_FIELDS',
                message: `The following fields are required: ${missingFields.join(', ')}`,
                missingFields
            });
        }

        // Validate district
        if (!KZN_DISTRICTS[facilityData.district]) {
            return res.status(400).json({
                success: false,
                error: 'Invalid KZN district',
                code: 'INVALID_DISTRICT',
                validDistricts: Object.keys(KZN_DISTRICTS)
            });
        }

        // Create new facility
        const facility = new HealthcareFacility(facilityData);
        await facility.save();

        res.status(201).json({
            success: true,
            message: 'Healthcare facility created successfully',
            facility: facility.toObject(),
            nextSteps: [
                'Add doctors to the facility',
                'Verify facility information',
                'Update operating hours if available'
            ]
        });

    } catch (error) {
        console.error('Create facility error:', error);

        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                code: 'VALIDATION_ERROR',
                message: 'Facility data validation failed',
                details: errors
            });
        }

        res.status(500).json({
            success: false,
            error: 'Failed to create healthcare facility',
            code: 'FACILITY_CREATION_ERROR',
            message: 'An error occurred while creating the healthcare facility'
        });
    }
};

/**
 * Update healthcare facility information
 * @route PUT /api/healthcare/facilities/:id
 * @param {string} id - Facility ID
 * @param {Object} updateData - Updated facility data
 * @returns {Object} Updated facility
 * @returns {boolean} success - Operation status
 * @returns {string} message - Success message
 * @returns {Object} facility - Updated facility object
 */
export const updateHealthcareFacility = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Prevent updating certain fields
        const restrictedFields = ['_id', 'createdAt', 'updatedAt'];
        restrictedFields.forEach(field => delete updateData[field]);

        const facility = await HealthcareFacility.findByIdAndUpdate(
            id,
            {
                ...updateData,
                lastVerified: new Date() // Update verification timestamp
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!facility) {
            return res.status(404).json({
                success: false,
                error: 'Facility not found',
                code: 'FACILITY_NOT_FOUND'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Healthcare facility updated successfully',
            facility: facility.toObject()
        });

    } catch (error) {
        console.error('Update facility error:', error);

        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                code: 'VALIDATION_ERROR',
                message: 'Facility data validation failed'
            });
        }

        res.status(500).json({
            success: false,
            error: 'Failed to update healthcare facility',
            code: 'FACILITY_UPDATE_ERROR'
        });
    }
};

/**
 * Get healthcare statistics for dashboard
 * @route GET /api/healthcare/statistics
 * @returns {Object} Healthcare system statistics
 * @returns {boolean} success - Operation status
 * @returns {Object} statistics - Comprehensive healthcare statistics
 * @returns {string} lastUpdated - Statistics timestamp
 */
export const getHealthcareStatistics = async (req, res) => {
    try {
        const stats = await HealthcareFacility.aggregate([
            { $match: { isActive: true } },
            {
                $facet: {
                    totalFacilities: [
                        { $count: 'count' }
                    ],
                    facilitiesByDistrict: [
                        {
                            $group: {
                                _id: '$district',
                                count: { $sum: 1 },
                                verified: {
                                    $sum: { $cond: ['$isVerified', 1, 0] }
                                }
                            }
                        }
                    ],
                    facilitiesByType: [
                        {
                            $group: {
                                _id: '$facilityType',
                                count: { $sum: 1 }
                            }
                        }
                    ],
                    totalDoctors: [
                        { $group: { _id: null, total: { $sum: '$totalDoctors' } } }
                    ],
                    doctorsBySpecialty: [
                        { $unwind: '$doctors' },
                        {
                            $group: {
                                _id: '$doctors.specialty',
                                count: { $sum: 1 }
                            }
                        },
                        { $sort: { count: -1 } },
                        { $limit: 10 }
                    ],
                    averageRatings: [
                        {
                            $group: {
                                _id: null,
                                avgRating: { $avg: '$rating' },
                                ratedFacilities: {
                                    $sum: { $cond: [{ $gt: ['$rating', 0] }, 1, 0] }
                                }
                            }
                        }
                    ]
                }
            }
        ]);

        const result = {
            success: true,
            statistics: {
                totalFacilities: stats[0]?.totalFacilities[0]?.count || 0,
                totalDoctors: stats[0]?.totalDoctors[0]?.total || 0,
                averageRating: stats[0]?.averageRatings[0]?.avgRating?.toFixed(1) || 0,
                ratedFacilities: stats[0]?.averageRatings[0]?.ratedFacilities || 0,
                byDistrict: stats[0]?.facilitiesByDistrict || [],
                byFacilityType: stats[0]?.facilitiesByType || [],
                topSpecialties: stats[0]?.doctorsBySpecialty || []
            },
            lastUpdated: new Date().toISOString()
        };

        res.status(200).json(result);

    } catch (error) {
        console.error('Statistics error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch healthcare statistics',
            code: 'STATISTICS_ERROR'
        });
    }
};