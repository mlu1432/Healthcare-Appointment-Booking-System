// firstcare-frontend/app/(route)/auth/bookregister/register/RegisterForm.jsx

/**
 * Registration Form Component for Healthcare Appointment Booking System
 * Enhanced with KZN Health Districts Integration
 * 
 * @file app/(route)/auth/bookregister/register/RegisterForm.jsx
 * @description Collects additional user profile information including KZN district selection
 * 
 * Features:
 * - Comprehensive user profile data collection
 * - KZN health district selection
 * - Medical history and allergies tracking
 * - Real-time form validation with user feedback
 * - Automatic redirection to booking upon success
 * - Responsive design with medical-themed UI
 * 
 * Security Features:
 * - Authentication token validation
 * - Protected route access
 * - Secure API communication with Bearer tokens
 * - Input sanitization and validation
 * - Session management
 * 
 * @component
 * @version 3.0.0
 * @author Healthcare System - KZN Implementation
 */

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

/**
 * KZN Health Districts Data
 * Source: KwaZulu-Natal Department of Health
 */
const KZN_DISTRICTS = [
  { value: "amajuba", label: "Amajuba District", type: "inland" },
  { value: "ethekwini", label: "eThekwini Metropolitan", type: "metro" },
  { value: "ilembe", label: "Ilembe District", type: "coastal" },
  { value: "king-cetshwayo", label: "King Cetshwayo District", type: "coastal" },
  { value: "umgungundlovu", label: "uMgungundlovu District", type: "inland" },
  { value: "umkhanyakude", label: "Umkhanyakude District", type: "rural" },
  { value: "ugu", label: "Ugu District", type: "coastal" },
  { value: "umzinyathi", label: "Umzinyathi District", type: "rural" },
  { value: "uthukela", label: "Uthukela District", type: "inland" },
  { value: "zululand", label: "Zululand District", type: "rural" }
];

/**
 * Healthcare Facility Types for KZN
 */
const FACILITY_TYPES = [
  { value: "public-clinic", label: "Public Clinic", cost: "free" },
  { value: "public-hospital", label: "Public Hospital", cost: "free" },
  { value: "unjani-clinic", label: "Unjani Clinic", cost: "low" },
  { value: "private-practice", label: "Private Practice", cost: "medium" },
  { value: "private-hospital", label: "Private Hospital", cost: "high" },
  { value: "specialist-center", label: "Specialist Center", cost: "high" }
];

/**
 * RegisterForm Component with KZN District Integration
 */
export default function RegisterForm() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    address: "",
    dateOfBirth: "",
    medicalHistory: "",
    allergies: "",
    // KZN Specific Fields
    healthDistrict: "",
    subLocation: "",
    preferredFacilityType: "",
    hasMedicalAid: false,
    medicalAidScheme: "",
    emergencyContact: "",
    preferredLanguage: "english"
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [subLocations, setSubLocations] = useState([]);

  const router = useRouter();
  const { user, loading: userLoading, getAccessToken, refreshUserData } = useUser();

  /**
   * Sub-locations data for each KZN district
   */
  const DISTRICT_SUB_LOCATIONS = {
    amajuba: ["Newcastle", "Dannhauser", "Emadlangeni"],
    ethekwini: ["Durban Central", "Umlazi", "KwaMashu", "Chatsworth", "Phoenix", "Pinetown"],
    ilembe: ["KwaDukuza", "Mandeni", "Ndwedwe"],
    "king-cetshwayo": ["Richards Bay", "Empangeni", "eSikhaleni"],
    umgungundlovu: ["Pietermaritzburg", "Howick", "uMshwathi"],
    umkhanyakude: ["Mkuze", "Jozini", "Hluhluwe"],
    ugu: ["Port Shepstone", "Scottburgh", "Hibiscus Coast"],
    umzinyathi: ["Dundee", "Nquthu", "Glencoe"],
    uthukela: ["Ladysmith", "Estcourt", "Colenso"],
    zululand: ["Vryheid", "Ulundi", "Nongoma"]
  };

  /**
   * Redirect if user is not authenticated or profile is already complete
   */
  useEffect(() => {
    if (!userLoading) {
      if (!user) {
        router.push("/auth/signIn");
        return;
      }

      if (user.isProfileComplete) {
        router.push("/booking");
        return;
      }
    }
  }, [user, userLoading, router]);

  /**
   * Update sub-locations when district changes
   */
  useEffect(() => {
    if (formData.healthDistrict && DISTRICT_SUB_LOCATIONS[formData.healthDistrict]) {
      setSubLocations(DISTRICT_SUB_LOCATIONS[formData.healthDistrict]);
      setFormData(prev => ({ ...prev, subLocation: "" }));
    } else {
      setSubLocations([]);
    }
  }, [formData.healthDistrict]);

  /**
   * Handle form input changes
   */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });

    if (error) setError("");
  };

  /**
   * Validate KZN-specific form data
   */
  const validateKZNForm = () => {
    if (!formData.healthDistrict) {
      return "Please select your KZN health district";
    }


    if (!formData.subLocation) {
      return "Please select your specific area within the district";
    }

    if (!formData.preferredFacilityType) {
      return "Please select your preferred healthcare facility type";
    }

    return null;
  };

  /**
   * Handle form submission with KZN data
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");

    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'phoneNumber', 'address', 'dateOfBirth'];
    const missingFields = requiredFields.filter(field => !formData[field]);

    if (missingFields.length > 0) {
      const errorMsg = "Please fill in all required fields";
      setError(errorMsg);
      toast.error(errorMsg);
      setLoading(false);
      return;
    }

    // Validate KZN-specific fields
    const kznValidationError = validateKZNForm();
    if (kznValidationError) {
      setError(kznValidationError);
      toast.error(kznValidationError);
      setLoading(false);
      return;
    }

    // Validate phone number format
    const phoneRegex = /^(\+\d{1,3}[- ]?)?\d{10}$/;
    if (!phoneRegex.test(formData.phoneNumber)) {
      const errorMsg = "Please enter a valid phone number";
      setError(errorMsg);
      toast.error(errorMsg);
      setLoading(false);
      return;
    }

    // Validate date of birth (must be in the past)
    const dob = new Date(formData.dateOfBirth);
    const today = new Date();
    if (dob >= today) {
      const errorMsg = "Date of birth must be in the past";
      setError(errorMsg);
      toast.error(errorMsg);
      setLoading(false);
      return;
    }

    try {
      const token = await getAccessToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      // Prepare data for submission
      const submitData = {
        // Personal information
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        dateOfBirth: formData.dateOfBirth,

        // KZN location data - nested object matching backend User model
        locationData: {
          healthDistrict: formData.healthDistrict,
          subLocation: formData.subLocation
        },

        // Medical preferences
        preferredFacilityType: formData.preferredFacilityType,
        medicalHistory: formData.medicalHistory,
        allergies: formData.allergies,
        hasMedicalAid: Boolean(formData.hasMedicalAid),
        medicalAidScheme: formData.medicalAidScheme,
        emergencyContact: formData.emergencyContact,
        preferredLanguage: formData.preferredLanguage,

        // Profile completion flag
        isProfileComplete: true
      };

      console.log("Submitting KZN profile data:", submitData);

      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify(submitData), // Use the corrected data format
      });

      const data = await response.json();

      if (response.ok) {
        console.log("KZN Profile updated successfully:", data);

        toast.success("Profile completed successfully! Welcome to KZN Healthcare.");
        setSuccessMessage("Profile completed successfully!");

        // Refresh user data to get updated profile status
        await refreshUserData();

        // Redirect to booking page after success
        setTimeout(() => {
          router.push("/");
        }, 2000);

      } else {
        throw new Error(data.error || data.message || "Failed to update profile");
      }

    } catch (error) {
      console.error("Profile update error:", error);

      let errorMessage = "Failed to save profile details. Please try again.";

      if (error.message.includes("Network") || error.message.includes("fetch")) {
        errorMessage = "Cannot connect to server. Please check your connection.";
      } else if (error.message.includes("token") || error.message.includes("auth")) {
        errorMessage = "Authentication failed. Please sign in again.";
        router.push("/auth/signIn");
      } else {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking user state
  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="flex items-center justify-center">
            <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="ml-2 text-gray-600">Loading KZN Healthcare...</span>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Main registration form component render with KZN enhancements
   */
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-teal-50 py-8 px-4">
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl w-full max-w-4xl relative overflow-hidden">
        {/* Medical-themed decorative elements */}
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-blue-100 rounded-full opacity-50"></div>
        <div className="absolute -bottom-12 -left-12 w-24 h-24 bg-teal-100 rounded-full opacity-50"></div>

        <div className="relative z-10">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
            Complete Your KZN Healthcare Profile
          </h2>

          <p className="text-center text-gray-600 mb-6">
            Please provide your details to access healthcare services across KwaZulu-Natal
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-center border border-red-200">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-center border border-green-200">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information Section */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your first name"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your last name"
                    required
                  />
                </div>
              </div>

              <div className="mt-4">
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your phone number (e.g., +27341234567)"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Format: +27341234567 or 0341234567</p>
              </div>

              <div className="mt-4">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Address *
                </label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your complete residential address"
                  required
                />
              </div>

              <div className="mt-4">
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth *
                </label>
                <input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            {/* KZN Location Information Section */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">KZN Location Details</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="healthDistrict" className="block text-sm font-medium text-gray-700 mb-2">
                    Health District *
                  </label>
                  <select
                    id="healthDistrict"
                    name="healthDistrict"
                    value={formData.healthDistrict}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Your District</option>
                    {KZN_DISTRICTS.map((district) => (
                      <option key={district.value} value={district.value}>
                        {district.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Choose your KZN health district</p>
                </div>

                <div>
                  <label htmlFor="subLocation" className="block text-sm font-medium text-gray-700 mb-2">
                    Specific Area/Town *
                  </label>
                  <select
                    id="subLocation"
                    name="subLocation"
                    value={formData.subLocation}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    disabled={!formData.healthDistrict}
                  >
                    <option value="">Select Area</option>
                    {subLocations.map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Select your specific area within the district</p>
                </div>
              </div>

              <div className="mt-4">
                <label htmlFor="preferredFacilityType" className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Healthcare Facility Type *
                </label>
                <select
                  id="preferredFacilityType"
                  name="preferredFacilityType"
                  value={formData.preferredFacilityType}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Facility Type</option>
                  {FACILITY_TYPES.map((facility) => (
                    <option key={facility.value} value={facility.value}>
                      {facility.label} ({facility.cost})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  This helps us recommend the most suitable healthcare providers
                </p>
              </div>
            </div>

            {/* Medical Information Section */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Medical Information</h3>

              <div>
                <label htmlFor="medicalHistory" className="block text-sm font-medium text-gray-700 mb-2">
                  Medical History
                </label>
                <textarea
                  id="medicalHistory"
                  name="medicalHistory"
                  value={formData.medicalHistory}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="List any medical conditions, surgeries, or chronic illnesses (comma separated)"
                  rows="3"
                />
                <p className="text-xs text-gray-500 mt-1">Separate multiple conditions with commas</p>
              </div>

              <div className="mt-4">
                <label htmlFor="allergies" className="block text-sm font-medium text-gray-700 mb-2">
                  Allergies
                </label>
                <textarea
                  id="allergies"
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="List any allergies to medications, foods, or environmental factors (comma separated)"
                  rows="3"
                />
                <p className="text-xs text-gray-500 mt-1">Separate multiple allergies with commas</p>
              </div>
            </div>

            {/* Additional Information Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Additional Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="preferredLanguage" className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Language
                  </label>
                  <select
                    id="preferredLanguage"
                    name="preferredLanguage"
                    value={formData.preferredLanguage}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="english">English</option>
                    <option value="zulu">isiZulu</option>
                    <option value="afrikaans">Afrikaans</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700 mb-2">
                    Emergency Contact
                  </label>
                  <input
                    id="emergencyContact"
                    name="emergencyContact"
                    type="tel"
                    value={formData.emergencyContact}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Emergency contact number"
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center">
                <input
                  id="hasMedicalAid"
                  name="hasMedicalAid"
                  type="checkbox"
                  checked={formData.hasMedicalAid}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="hasMedicalAid" className="ml-2 block text-sm text-gray-700">
                  I have medical aid coverage
                </label>
              </div>

              {formData.hasMedicalAid && (
                <div className="mt-4">
                  <label htmlFor="medicalAidScheme" className="block text-sm font-medium text-gray-700 mb-2">
                    Medical Aid Scheme
                  </label>
                  <input
                    id="medicalAidScheme"
                    name="medicalAidScheme"
                    type="text"
                    value={formData.medicalAidScheme}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your medical aid scheme name"
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${loading
                ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving KZN Profile...
                </span>
              ) : (
                'Complete KZN Profile & Continue to Booking'
              )}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-gray-500">
            <p>Fields marked with * are required for KZN healthcare services access</p>
            <p className="mt-1">Your location data helps us connect you with nearby healthcare providers</p>
          </div>
        </div>
      </div>

      {/* Toaster Component for Notifications */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}