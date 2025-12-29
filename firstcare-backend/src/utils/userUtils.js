// firstcare-backend/src/utils/userUtils.js

/**
 * User utility functions for business logic that belongs in the model layer
 */

/**
 * Calculate profile completion percentage
 */
export const calculateProfileCompletion = (user) => {
    const requiredFields = [
        'firstName', 'lastName', 'email', 'phoneNumber', 'dateOfBirth', 'gender',
        'locationData.healthDistrict', 'locationData.subLocation', 'locationData.preferredFacilityType'
    ];

    let completed = 0;
    requiredFields.forEach(field => {
        const value = getNestedValue(user, field);
        if (value !== undefined && value !== null && value !== '') {
            completed++;
        }
    });

    const percentage = Math.round((completed / requiredFields.length) * 100);
    return {
        percentage,
        isComplete: percentage >= 80
    };
};

/**
 * Get nested object value
 */
const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, key) => {
        return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
};

/**
 * Get recommended facilities based on user profile
 */
export const getRecommendedFacilities = (user) => {
    const recommendations = [];

    // Base recommendations on medical aid status
    if (!user.healthcarePreferences?.hasMedicalAid) {
        recommendations.push('public-clinic', 'public-hospital', 'unjani-clinic');
    } else {
        recommendations.push('private-practice', 'private-hospital', 'specialist-center');
    }

    // Add public options for emergencies
    if (!recommendations.includes('public-hospital')) {
        recommendations.push('public-hospital');
    }

    return [...new Set(recommendations)];
};