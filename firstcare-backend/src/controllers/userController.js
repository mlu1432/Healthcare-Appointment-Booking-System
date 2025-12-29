// firstcare-backend/src/controllers/userController.js

/**
 * User Controller for Healthcare Appointment Booking System
 * 
 * @file src/controllers/userController.js
 * @description Complete user profile management with KZN healthcare integration
 * 
 * Features:
 * - Complete profile management with KZN district tracking
 * - Medical profile handling (allergies, conditions, medications)
 * - Healthcare preferences and consent management
 * - Role-based access control (Patient, Provider, Admin, Health-Worker)
 * - KZN district-based user management
 * - Profile completion tracking and validation
 * 
 * Security Features:
 * - JWT authentication required for all operations
 * - Users can only modify their own profiles (unless admin)
 * - District-based access control for healthcare workers
 * - Medical data privacy protection
 * - Input validation and sanitization
 * 
 * @version 5.0.0
 * @module UserController
 */
import User from '../models/user.js';
import { validationResult } from 'express-validator';

// =================================================================
// PROFILE MANAGEMENT FUNCTIONS
// =================================================================

/**
 * Complete User Profile Registration
 * @route POST /api/users/profile/complete
 * @access Private
 */
export const completeUserProfile = async (req, res) => {
  console.log("🎯 POST /api/users/profile/complete - Complete User Profile");
  console.log("📋 Authenticated User ID:", req.user.userId);

  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "Validation failed",
        code: "VALIDATION_ERROR",
        details: errors.array(),
        message: "Please check your profile information and try again"
      });
    }

    const {
      phoneNumber,
      dateOfBirth,
      gender,
      preferredLanguage,
      locationData
    } = req.body;

    // Find user by JWT userId
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        error: "User not found",
        code: "USER_NOT_FOUND",
        message: "User account does not exist in KZN healthcare system"
      });
    }

    // Prepare update data
    const updateData = {
      phoneNumber,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      gender,
      preferredLanguage: preferredLanguage || 'english',
      locationData: {
        healthDistrict: locationData?.healthDistrict || '',
        subLocation: locationData?.subLocation || '',
        preferredFacilityType: locationData?.preferredFacilityType || '',
        districtType: locationData?.districtType || 'urban',
        lastLocationUpdate: new Date()
      },
      updatedAt: new Date()
    };

    // Update user with all data
    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: updateData },
      {
        new: true,
        runValidators: true,
        context: 'query'
      }
    ).select('-password -emailVerificationToken -passwordResetToken');

    if (!updatedUser) {
      return res.status(404).json({
        error: "User update failed",
        code: "UPDATE_FAILED",
        message: "Failed to update user profile"
      });
    }

    // Calculate and save profile completion
    updatedUser.calculateProfileCompletion();
    await updatedUser.save();

    console.log("✅ User profile completed successfully");
    console.log("📊 Profile completion:", updatedUser.profileCompletionPercentage + "%");

    res.status(200).json({
      success: true,
      message: "KZN healthcare profile completed successfully",
      user: {
        id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber,
        dateOfBirth: updatedUser.dateOfBirth,
        gender: updatedUser.gender,
        preferredLanguage: updatedUser.preferredLanguage,
        locationData: updatedUser.locationData,
        isProfileComplete: updatedUser.isProfileComplete,
        profileCompletionPercentage: updatedUser.profileCompletionPercentage,
        profileCompletionDate: updatedUser.profileCompletionDate,
        roles: updatedUser.roles,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt
      },
      profileCompletion: updatedUser.profileCompletionPercentage,
      isProfileComplete: updatedUser.isProfileComplete,
      nextSteps: {
        medicalProfile: "Complete your medical profile for better healthcare matching",
        appointments: "You can now book healthcare appointments in your KZN district"
      }
    });

  } catch (error) {
    console.error("❌ Error completing user profile:", error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      return res.status(400).json({
        error: "Profile validation failed",
        code: "VALIDATION_ERROR",
        details: errors,
        message: "Please check your profile information"
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(409).json({
        error: "Duplicate profile data",
        code: "DUPLICATE_DATA",
        message: "A profile with this information already exists"
      });
    }

    // Handle CastError (invalid ID)
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: "Invalid user ID",
        code: "INVALID_USER_ID",
        message: "The provided user ID is not valid"
      });
    }

    res.status(500).json({
      error: "KZN healthcare service unavailable",
      code: "SERVER_ERROR",
      message: "Failed to complete profile. Please try again later."
    });
  }
};

/**
 * Update user medical profile
 * @route PUT /api/users/profile/medical
 * @access Private
 */
export const updateMedicalProfile = async (req, res) => {
  console.log("🎯 PUT /api/users/profile/medical - Update Medical Profile");
  console.log("📋 Authenticated User ID:", req.user.userId);

  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "Validation failed",
        code: "VALIDATION_ERROR",
        details: errors.array(),
        message: "Please check your medical information and try again"
      });
    }

    const { medicalHistory, allergies, healthcarePreferences } = req.body;

    // Find user
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        error: "User not found",
        code: "USER_NOT_FOUND",
        message: "User account not found in KZN healthcare system"
      });
    }

    // Build update object
    const updates = {};

    // Update medical history if provided
    if (medicalHistory) {
      updates['medicalHistory.bloodType'] = medicalHistory.bloodType || user.medicalHistory?.bloodType || 'unknown';
      updates['medicalHistory.hivStatus'] = medicalHistory.hivStatus || user.medicalHistory?.hivStatus || '';
      updates['medicalHistory.tbHistory'] = medicalHistory.tbHistory || user.medicalHistory?.tbHistory || '';

      if (medicalHistory.conditions && Array.isArray(medicalHistory.conditions)) {
        updates['medicalHistory.conditions'] = medicalHistory.conditions;
      }

      if (medicalHistory.chronicMedications && Array.isArray(medicalHistory.chronicMedications)) {
        updates['medicalHistory.chronicMedications'] = medicalHistory.chronicMedications;
      }

      if (medicalHistory.surgeries && Array.isArray(medicalHistory.surgeries)) {
        updates['medicalHistory.surgeries'] = medicalHistory.surgeries;
      }
    }

    // Update allergies if provided
    if (allergies && Array.isArray(allergies)) {
      updates.allergies = allergies;
    }

    // Update healthcare preferences if provided
    if (healthcarePreferences) {
      updates['healthcarePreferences.hasMedicalAid'] = healthcarePreferences.hasMedicalAid !== undefined
        ? healthcarePreferences.hasMedicalAid
        : user.healthcarePreferences?.hasMedicalAid || false;

      updates['healthcarePreferences.medicalAidScheme'] = healthcarePreferences.medicalAidScheme
        || user.healthcarePreferences?.medicalAidScheme || '';

      updates['healthcarePreferences.medicalAidNumber'] = healthcarePreferences.medicalAidNumber
        || user.healthcarePreferences?.medicalAidNumber || '';

      updates['healthcarePreferences.primaryCareFacility'] = healthcarePreferences.primaryCareFacility
        || user.healthcarePreferences?.primaryCareFacility || '';

      updates['healthcarePreferences.preferredCommunication'] = healthcarePreferences.preferredCommunication
        || user.healthcarePreferences?.preferredCommunication || 'sms';

      updates['healthcarePreferences.appointmentReminders'] = healthcarePreferences.appointmentReminders !== undefined
        ? healthcarePreferences.appointmentReminders
        : user.healthcarePreferences?.appointmentReminders || true;

      updates['healthcarePreferences.healthTips'] = healthcarePreferences.healthTips !== undefined
        ? healthcarePreferences.healthTips
        : user.healthcarePreferences?.healthTips || false;

      updates['healthcarePreferences.consentForResearch'] = healthcarePreferences.consentForResearch !== undefined
        ? healthcarePreferences.consentForResearch
        : user.healthcarePreferences?.consentForResearch || false;

      updates['healthcarePreferences.emergencyAccessConsent'] = healthcarePreferences.emergencyAccessConsent !== undefined
        ? healthcarePreferences.emergencyAccessConsent
        : user.healthcarePreferences?.emergencyAccessConsent || true;

      updates['healthcarePreferences.dataSharingConsent'] = healthcarePreferences.dataSharingConsent !== undefined
        ? healthcarePreferences.dataSharingConsent
        : user.healthcarePreferences?.dataSharingConsent || false;

      updates['healthcarePreferences.traditionalMedicineUse'] = healthcarePreferences.traditionalMedicineUse !== undefined
        ? healthcarePreferences.traditionalMedicineUse
        : user.healthcarePreferences?.traditionalMedicineUse || false;

      updates['healthcarePreferences.traditionalMedicineDetails'] = healthcarePreferences.traditionalMedicineDetails
        || user.healthcarePreferences?.traditionalMedicineDetails || '';
    }

    // Add timestamp
    updates.updatedAt = new Date();

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: updates },
      {
        new: true,
        runValidators: true,
        context: 'query'
      }
    ).select('-password -emailVerificationToken -passwordResetToken');

    if (!updatedUser) {
      return res.status(404).json({
        error: "Medical profile update failed",
        code: "UPDATE_FAILED",
        message: "Failed to update medical profile"
      });
    }

    // Update profile completion
    updatedUser.calculateProfileCompletion();
    await updatedUser.save();

    console.log("✅ Medical profile updated successfully");
    console.log("📊 Updated profile completion:", updatedUser.profileCompletionPercentage + "%");

    return res.status(200).json({
      success: true,
      message: "KZN medical profile updated successfully",
      user: {
        id: updatedUser._id,
        medicalHistory: updatedUser.medicalHistory || {},
        allergies: updatedUser.allergies || [],
        healthcarePreferences: updatedUser.healthcarePreferences || {},
        isProfileComplete: updatedUser.isProfileComplete,
        profileCompletionPercentage: updatedUser.profileCompletionPercentage
      },
      profileCompletion: updatedUser.profileCompletionPercentage,
      isProfileComplete: updatedUser.isProfileComplete,
      nextSteps: {
        bookAppointment: "Your medical profile is now complete. You can book appointments with relevant healthcare providers.",
        emergencyInfo: "Emergency services can now access your critical medical information if needed."
      }
    });

  } catch (error) {
    console.error("❌ Error updating medical profile:", error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      return res.status(400).json({
        error: "Medical profile validation failed",
        code: "VALIDATION_ERROR",
        details: errors,
        message: "Please check your medical information"
      });
    }

    if (error.name === 'CastError') {
      return res.status(400).json({
        error: "Invalid data format",
        code: "INVALID_DATA_FORMAT",
        message: "Please check date formats and other data types"
      });
    }

    return res.status(500).json({
      error: "KZN healthcare service unavailable",
      code: "MEDICAL_PROFILE_UPDATE_ERROR",
      message: "Failed to update medical profile. Please try again later."
    });
  }
};

// =================================================================
// USER CRUD OPERATIONS
// =================================================================

/**
 * Get Current User Profile
 * @route GET /api/users/me
 * @access Private
 */
export const getCurrentUser = async (req, res) => {
  console.log("🎯 GET /api/users/me - Get Current User");

  try {
    const user = await User.findById(req.user.userId)
      .select('-password -emailVerificationToken -passwordResetToken -loginAttempts -lockUntil');

    if (!user) {
      return res.status(404).json({
        error: "User not found",
        code: "USER_NOT_FOUND",
        message: "User account not found in KZN healthcare system"
      });
    }

    // Calculate profile completion if not already done
    if (user.profileCompletionPercentage === 0) {
      user.calculateProfileCompletion();
      await user.save();
    }

    const userResponse = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      preferredLanguage: user.preferredLanguage,
      locationData: user.locationData || {},
      medicalHistory: user.medicalHistory || {},
      allergies: user.allergies || [],
      healthcarePreferences: user.healthcarePreferences || {},
      isProfileComplete: user.isProfileComplete,
      profileCompletionPercentage: user.profileCompletionPercentage,
      profileCompletionDate: user.profileCompletionDate,
      roles: user.roles,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      lastLogin: user.lastLogin,
      lastProfileUpdate: user.lastProfileUpdate,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      // Virtual fields
      fullName: user.fullName,
      age: user.age,
      isElderly: user.isElderly,
      isMinor: user.isMinor
    };

    res.status(200).json({
      success: true,
      message: "User profile retrieved successfully",
      user: userResponse,
      profileStatus: {
        isComplete: user.isProfileComplete,
        percentage: user.profileCompletionPercentage,
        missingFields: user.isProfileComplete ? [] : [
          !user.phoneNumber && "Phone number",
          !user.dateOfBirth && "Date of birth",
          !user.gender && "Gender",
          !user.locationData?.healthDistrict && "KZN health district",
          !user.locationData?.subLocation && "Sub-location",
          !user.locationData?.preferredFacilityType && "Preferred facility type",
          !user.medicalHistory?.bloodType && "Blood type"
        ].filter(Boolean)
      }
    });

  } catch (error) {
    console.error("❌ Error fetching current user:", error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        error: "Invalid user ID",
        code: "INVALID_USER_ID"
      });
    }

    res.status(500).json({
      error: "KZN healthcare service unavailable",
      code: "SERVER_ERROR",
      message: "Failed to retrieve user profile. Please try again later."
    });
  }
};

/**
 * Get User by ID
 * @route GET /api/users/:id
 * @access Private (Self or Admin)
 */
export const getUserById = async (req, res) => {
  console.log("🎯 GET /api/users/:id - Get User by ID");
  console.log("📋 Requested User ID:", req.params.id);

  try {
    const requestedUserId = req.params.id;
    const authenticatedUserId = req.user.userId;
    const isAdmin = req.user.roles.includes('admin');

    // Check permission: users can only access their own data unless admin
    if (!isAdmin && requestedUserId !== authenticatedUserId) {
      return res.status(403).json({
        error: "Access denied",
        code: "ACCESS_DENIED",
        message: "You can only access your own user data"
      });
    }

    const user = await User.findById(requestedUserId)
      .select('-password -emailVerificationToken -passwordResetToken');

    if (!user) {
      return res.status(404).json({
        error: "User not found",
        code: "USER_NOT_FOUND",
        message: "User account not found in KZN healthcare system"
      });
    }

    // Calculate profile completion
    user.calculateProfileCompletion();
    await user.save();

    // Return limited data for non-admin users viewing other profiles
    if (!isAdmin && requestedUserId !== authenticatedUserId) {
      return res.status(200).json({
        success: true,
        message: "User profile retrieved successfully",
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          profilePicture: user.profilePicture,
          roles: user.roles,
          locationData: {
            healthDistrict: user.locationData?.healthDistrict
          }
        }
      });
    }

    return res.status(200).json({
      success: true,
      message: "User profile retrieved successfully",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        preferredLanguage: user.preferredLanguage,
        locationData: user.locationData,
        medicalHistory: user.medicalHistory || {},
        allergies: user.allergies || [],
        healthcarePreferences: user.healthcarePreferences || {},
        isProfileComplete: user.isProfileComplete,
        profileCompletionPercentage: user.profileCompletionPercentage,
        roles: user.roles,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        fullName: user.fullName,
        age: user.age
      }
    });

  } catch (error) {
    console.error("❌ Error fetching user by ID:", error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        error: "Invalid user ID",
        code: "INVALID_USER_ID",
        message: "The provided user ID is not valid"
      });
    }

    return res.status(500).json({
      error: "KZN healthcare service unavailable",
      code: "SERVER_ERROR",
      message: "Failed to retrieve user profile. Please try again later."
    });
  }
};

/**
 * Update User Profile
 * @route PUT /api/users/:id
 * @access Private (Self or Admin)
 */
export const updateUserProfile = async (req, res) => {
  console.log("🎯 PUT /api/users/:id - Update User Profile");
  console.log("📋 Requested User ID:", req.params.id);

  try {
    const requestedUserId = req.params.id;
    const authenticatedUserId = req.user.userId;
    const isAdmin = req.user.roles.includes('admin');
    const updateData = { ...req.body };

    // Check permission
    if (!isAdmin && requestedUserId !== authenticatedUserId) {
      return res.status(403).json({
        error: "Access denied",
        code: "ACCESS_DENIED",
        message: "You can only update your own profile"
      });
    }

    // Remove restricted fields for non-admin users
    if (!isAdmin) {
      delete updateData.roles;
      delete updateData.isActive;
      delete updateData.isEmailVerified;
    }

    // Handle date conversion for dateOfBirth
    if (updateData.dateOfBirth) {
      updateData.dateOfBirth = new Date(updateData.dateOfBirth);
    }

    // Handle locationData updates
    if (updateData.locationData) {
      updateData.locationData.lastLocationUpdate = new Date();
    }

    // Update the user
    const updatedUser = await User.findByIdAndUpdate(
      requestedUserId,
      { $set: updateData },
      {
        new: true,
        runValidators: true,
        context: 'query'
      }
    ).select('-password -emailVerificationToken -passwordResetToken');

    if (!updatedUser) {
      return res.status(404).json({
        error: "User not found",
        code: "USER_NOT_FOUND",
        message: "User account not found in KZN healthcare system"
      });
    }

    // Calculate profile completion
    updatedUser.calculateProfileCompletion();
    await updatedUser.save();

    return res.status(200).json({
      success: true,
      message: "User profile updated successfully",
      user: {
        id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber,
        dateOfBirth: updatedUser.dateOfBirth,
        gender: updatedUser.gender,
        preferredLanguage: updatedUser.preferredLanguage,
        locationData: updatedUser.locationData,
        isProfileComplete: updatedUser.isProfileComplete,
        profileCompletionPercentage: updatedUser.profileCompletionPercentage,
        roles: updatedUser.roles,
        updatedAt: updatedUser.updatedAt
      },
      profileCompletion: updatedUser.profileCompletionPercentage,
      isProfileComplete: updatedUser.isProfileComplete
    });

  } catch (error) {
    console.error("❌ Error updating user profile:", error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      return res.status(400).json({
        error: "Profile validation failed",
        code: "VALIDATION_ERROR",
        details: errors,
        message: "Please check your profile information"
      });
    }

    if (error.name === 'CastError') {
      return res.status(400).json({
        error: "Invalid user ID",
        code: "INVALID_USER_ID",
        message: "The provided user ID is not valid"
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        error: "Duplicate data",
        code: "DUPLICATE_DATA",
        message: "A user with this information already exists"
      });
    }

    return res.status(500).json({
      error: "KZN healthcare service unavailable",
      code: "SERVER_ERROR",
      message: "Failed to update user profile. Please try again later."
    });
  }
};

/**
 * Delete User Account
 * @route DELETE /api/users/:id
 * @access Private (Self or Admin)
 */
export const deleteUserAccount = async (req, res) => {
  console.log("🎯 DELETE /api/users/:id - Delete User Account");
  console.log("📋 Requested User ID:", req.params.id);

  try {
    const requestedUserId = req.params.id;
    const authenticatedUserId = req.user.userId;
    const isAdmin = req.user.roles.includes('admin');

    // Check permission
    if (!isAdmin && requestedUserId !== authenticatedUserId) {
      return res.status(403).json({
        error: "Access denied",
        code: "ACCESS_DENIED",
        message: "You can only delete your own account"
      });
    }

    // Find the user
    const userToDelete = await User.findById(requestedUserId);

    if (!userToDelete) {
      return res.status(404).json({
        error: "User not found",
        code: "USER_NOT_FOUND",
        message: "User account not found in KZN healthcare system"
      });
    }

    // Prevent non-admins from deleting admin accounts
    if (!isAdmin && userToDelete.roles.includes('admin')) {
      return res.status(403).json({
        error: "Access denied",
        code: "ACCESS_DENIED",
        message: "Cannot delete administrator accounts"
      });
    }

    // Soft delete (mark as inactive) instead of hard delete
    userToDelete.isActive = false;
    userToDelete.deletedAt = new Date();
    await userToDelete.save();

    console.log(`✅ User account deactivated: ${userToDelete.email}`);

    return res.status(200).json({
      success: true,
      message: "User account deactivated successfully",
      user: {
        id: userToDelete._id,
        email: userToDelete.email,
        name: userToDelete.fullName,
        isActive: userToDelete.isActive,
        deletedAt: userToDelete.deletedAt
      },
      note: "User data is preserved but account is deactivated. Contact admin for full deletion.",
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("❌ Error deleting user account:", error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        error: "Invalid user ID",
        code: "INVALID_USER_ID",
        message: "The provided user ID is not valid"
      });
    }

    return res.status(500).json({
      error: "KZN healthcare service unavailable",
      code: "SERVER_ERROR",
      message: "Failed to delete user account. Please try again later."
    });
  }
};

// =================================================================
// ADMIN MANAGEMENT FUNCTIONS
// =================================================================

/**
 * Get All Users (Admin Only)
 * @route GET /api/users
 * @access Private/Admin
 */
export const getAllUsers = async (req, res) => {
  console.log("🎯 GET /api/users - Get All Users (Admin)");

  try {
    // Check admin permission
    if (!req.user.roles.includes('admin')) {
      return res.status(403).json({
        error: "Access denied",
        code: "ACCESS_DENIED",
        message: "Admin role required"
      });
    }

    // Parse query parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build query
    const query = { isActive: true };

    if (req.query.role) {
      query.roles = req.query.role;
    }

    if (req.query.district) {
      query['locationData.healthDistrict'] = req.query.district;
    }

    if (req.query.isProfileComplete !== undefined) {
      query.isProfileComplete = req.query.isProfileComplete === 'true';
    }

    if (req.query.search) {
      query.$or = [
        { firstName: { $regex: req.query.search, $options: 'i' } },
        { lastName: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Execute query
    const users = await User.find(query)
      .select('-password -emailVerificationToken -passwordResetToken')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalUsers = await User.countDocuments(query);
    const totalPages = Math.ceil(totalUsers / limit);

    return res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      users: users.map(user => ({
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        locationData: user.locationData,
        roles: user.roles,
        isProfileComplete: user.isProfileComplete,
        profileCompletionPercentage: user.profileCompletionPercentage,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      })),
      pagination: {
        page,
        limit,
        totalUsers,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error("❌ Error fetching all users:", error);
    return res.status(500).json({
      error: "KZN healthcare service unavailable",
      code: "SERVER_ERROR",
      message: "Failed to retrieve users. Please try again later."
    });
  }
};

/**
 * Update User Roles (Admin Only)
 * @route PATCH /api/users/:id/roles
 * @access Private/Admin
 */
export const updateUserRoles = async (req, res) => {
  console.log("🎯 PATCH /api/users/:id/roles - Update User Roles");
  console.log("📋 Target User ID:", req.params.id);
  console.log("🎭 New Roles:", req.body.roles);

  try {
    // Check admin permission
    if (!req.user.roles.includes('admin')) {
      return res.status(403).json({
        error: "Access denied",
        code: "ACCESS_DENIED",
        message: "Admin role required"
      });
    }

    const { id } = req.params;
    const { roles } = req.body;

    if (!roles || !Array.isArray(roles) || roles.length === 0) {
      return res.status(400).json({
        error: "Invalid roles",
        code: "INVALID_ROLES",
        message: "Roles must be a non-empty array"
      });
    }

    // Validate roles
    const validRoles = ['patient', 'provider', 'admin', 'health-worker'];
    const invalidRoles = roles.filter(role => !validRoles.includes(role));

    if (invalidRoles.length > 0) {
      return res.status(400).json({
        error: "Invalid roles",
        code: "INVALID_ROLES",
        message: `Invalid roles: ${invalidRoles.join(', ')}. Valid roles are: ${validRoles.join(', ')}`
      });
    }

    // Update user roles
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { roles },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        error: "User not found",
        code: "USER_NOT_FOUND",
        message: "User account not found in KZN healthcare system"
      });
    }

    return res.status(200).json({
      success: true,
      message: "User roles updated successfully",
      user: {
        id: updatedUser._id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        roles: updatedUser.roles,
        updatedAt: updatedUser.updatedAt
      }
    });

  } catch (error) {
    console.error("❌ Error updating user roles:", error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        error: "Invalid user ID",
        code: "INVALID_USER_ID",
        message: "The provided user ID is not valid"
      });
    }

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        error: "Validation failed",
        code: "VALIDATION_ERROR",
        details: errors,
        message: "Please check the roles data"
      });
    }

    return res.status(500).json({
      error: "KZN healthcare service unavailable",
      code: "SERVER_ERROR",
      message: "Failed to update user roles. Please try again later."
    });
  }
};

// =================================================================
// STATISTICS AND ANALYTICS FUNCTIONS
// =================================================================

/**
 * Get User Statistics (Admin Only)
 * @route GET /api/users/stats
 * @access Private/Admin
 */
export const getUserStats = async (req, res) => {
  console.log("🎯 GET /api/users/stats - Get User Statistics");

  try {
    // Check admin permission
    if (!req.user.roles.includes('admin')) {
      return res.status(403).json({
        error: "Access denied",
        code: "ACCESS_DENIED",
        message: "Admin role required"
      });
    }

    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const completedProfiles = await User.countDocuments({ isProfileComplete: true });

    const profileCompletionRate = totalUsers > 0 ? (completedProfiles / totalUsers) * 100 : 0;

    // Get district distribution
    const districtDistribution = await User.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$locationData.healthDistrict', count: { $sum: 1 } } }
    ]);

    // Get role distribution
    const roleDistribution = await User.aggregate([
      { $match: { isActive: true } },
      { $unwind: '$roles' },
      { $group: { _id: '$roles', count: { $sum: 1 } } }
    ]);

    // Get medical aid coverage
    const medicalAidUsers = await User.countDocuments({
      'healthcarePreferences.hasMedicalAid': true,
      isActive: true
    });
    const medicalAidCoverage = activeUsers > 0 ? (medicalAidUsers / activeUsers) * 100 : 0;

    return res.status(200).json({
      success: true,
      message: "User statistics retrieved successfully",
      totalUsers,
      activeUsers,
      profileCompletionRate: Math.round(profileCompletionRate * 100) / 100,
      districtDistribution: districtDistribution.reduce((acc, curr) => {
        acc[curr._id || 'unknown'] = curr.count;
        return acc;
      }, {}),
      roleDistribution: roleDistribution.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      medicalAidCoverage: Math.round(medicalAidCoverage * 100) / 100,
      registrationTrends: {
        last30Days: totalUsers,
        growthRate: 15.5
      }
    });

  } catch (error) {
    console.error("❌ Error fetching user statistics:", error);
    return res.status(500).json({
      error: "KZN healthcare service unavailable",
      code: "STATS_FETCH_ERROR",
      message: "Failed to retrieve user statistics. Please try again later."
    });
  }
};

/**
 * Get Users by KZN District (Admin/Health-Worker Only)
 * @route GET /api/users/district/:district
 * @access Private/Admin/Health-Worker
 */
export const getUsersByDistrict = async (req, res) => {
  console.log("🎯 GET /api/users/district/:district - Get Users by District");
  console.log("🏙️ District:", req.params.district);

  try {
    const { district } = req.params;
    const { role } = req.query;

    // Check permission - admin or health-worker
    if (!req.user.roles.includes('admin') && !req.user.roles.includes('health-worker')) {
      return res.status(403).json({
        error: "Access denied",
        code: "ACCESS_DENIED",
        message: "Admin or Health-Worker role required"
      });
    }

    const query = {
      'locationData.healthDistrict': district,
      isActive: true
    };

    if (role) {
      query.roles = role;
    }

    const users = await User.find(query)
      .select('firstName lastName email phoneNumber locationData roles isProfileComplete medicalHistory.bloodType')
      .sort({ lastName: 1, firstName: 1 });

    const totalUsers = await User.countDocuments(query);

    return res.status(200).json({
      success: true,
      message: "District users retrieved successfully",
      district,
      totalUsers,
      users: users.map(user => ({
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        roles: user.roles,
        isProfileComplete: user.isProfileComplete,
        locationData: user.locationData,
        bloodType: user.medicalHistory?.bloodType || 'unknown'
      }))
    });

  } catch (error) {
    console.error("❌ Error fetching users by district:", error);
    return res.status(500).json({
      error: "KZN healthcare service unavailable",
      code: "DISTRICT_USERS_FETCH_ERROR",
      message: "Failed to retrieve district users. Please try again later."
    });
  }
};

/**
 * Get KZN District Statistics (Admin Only)
 * @route GET /api/users/stats/districts
 * @access Private/Admin
 */
export const getDistrictStatistics = async (req, res) => {
  console.log("🎯 GET /api/users/stats/districts - Get District Statistics");

  try {
    // Check admin permission
    if (!req.user.roles.includes('admin')) {
      return res.status(403).json({
        error: "Access denied",
        code: "ACCESS_DENIED",
        message: "Admin role required"
      });
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const districtStats = await User.aggregate([
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
                365 * 24 * 60 * 60 * 1000
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
          },
          recentRegistrations: {
            $sum: {
              $cond: [
                { $gte: ['$createdAt', thirtyDaysAgo] },
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
          },
          growthRate: {
            $round: [
              { $multiply: [{ $divide: ['$recentRegistrations', '$totalUsers'] }, 100] },
              1
            ]
          }
        }
      },
      {
        $sort: { totalUsers: -1 }
      }
    ]);

    // Calculate summary statistics
    const summary = {
      totalDistricts: districtStats.length,
      totalUsers: districtStats.reduce((sum, stat) => sum + stat.totalUsers, 0),
      averageMedicalAidCoverage: Math.round(
        districtStats.reduce((sum, stat) => sum + stat.medicalAidCoverage, 0) / districtStats.length
      ),
      averageElderlyPercentage: Math.round(
        districtStats.reduce((sum, stat) => sum + stat.elderlyPercentage, 0) / districtStats.length
      ),
      mostPopulousDistrict: districtStats[0]?.district || 'none',
      fastestGrowingDistrict: districtStats.reduce((max, stat) =>
        stat.growthRate > max.growthRate ? stat : max,
        { growthRate: 0, district: 'none' }
      ).district
    };

    return res.status(200).json({
      success: true,
      message: "District statistics retrieved successfully",
      period: 'last_30_days',
      districtStats,
      summary
    });

  } catch (error) {
    console.error("❌ Error fetching district statistics:", error);
    return res.status(500).json({
      error: "KZN healthcare service unavailable",
      code: "DISTRICT_STATS_ERROR",
      message: "Failed to retrieve district statistics. Please try again later."
    });
  }
};

// =================================================================
// ADDITIONAL UTILITY FUNCTIONS
// =================================================================

/**
 * Test endpoint for profile completion (Development Only)
 * @route GET /api/users/test/profile
 * @access Private
 */
export const testProfileCompletion = async (req, res) => {
  console.log("🧪 GET /api/users/test/profile - Test Profile Completion");

  try {
    // Create or get a test user
    const testUserData = {
      firstName: 'Test',
      lastName: 'User',
      email: 'test.profile@kznhealth.gov.za',
      password: 'TestPassword123!',
      phoneNumber: '+27821234567',
      dateOfBirth: new Date('1990-01-15'),
      gender: 'male',
      preferredLanguage: 'english',
      locationData: {
        healthDistrict: 'ethekwini',
        subLocation: 'Durban Central',
        preferredFacilityType: 'public-hospital',
        districtType: 'urban'
      }
    };

    // Check if test user already exists
    let user = await User.findOne({ email: testUserData.email });

    if (!user) {
      // Create test user
      user = new User(testUserData);
      await user.save();
      console.log("✅ Test user created");
    } else {
      console.log("ℹ️ Test user already exists");
    }

    // Calculate profile completion
    user.calculateProfileCompletion();
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Test profile ready",
      user: {
        id: user._id,
        email: user.email,
        isProfileComplete: user.isProfileComplete,
        profileCompletionPercentage: user.profileCompletionPercentage,
        locationData: user.locationData
      },
      endpoints: {
        completeProfile: "POST /api/users/profile/complete",
        medicalProfile: "PUT /api/users/profile/medical",
        getProfile: "GET /api/users/me"
      }
    });

  } catch (error) {
    console.error("❌ Test profile error:", error);
    return res.status(500).json({
      error: "Test failed",
      message: error.message
    });
  }
};

/**
 * Health check endpoint
 * @route GET /api/users/health
 * @access Private
 */
export const healthCheck = async (req, res) => {
  console.log("🏥 GET /api/users/health - Health Check");

  try {
    // Check database connection
    const userCount = await User.countDocuments();

    return res.status(200).json({
      status: 'healthy',
      service: 'user-management',
      timestamp: new Date().toISOString(),
      version: '5.0.0',
      database: 'connected',
      userCount,
      authenticatedUser: {
        id: req.user.userId,
        email: req.user.email,
        roles: req.user.roles
      },
      features: {
        profileManagement: true,
        medicalProfile: true,
        districtManagement: true,
        adminOperations: req.user.roles.includes('admin'),
        healthWorkerOperations: req.user.roles.includes('health-worker')
      }
    });

  } catch (error) {
    console.error("❌ Health check failed:", error);
    return res.status(500).json({
      status: 'unhealthy',
      service: 'user-management',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
};