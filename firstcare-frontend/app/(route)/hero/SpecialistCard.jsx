"use client";

/**
 * SPECIALIST CARD COMPONENT - KZN HEALTHCARE
 * 
 * Description:
 * - Displays healthcare provider information in a card format
 * - Integrates with backend doctor and facility data
 * - Supports booking flow with pre-filled data
 * - Responsive design with hover effects
 * 
 * Features:
 * - Dynamic data from backend API
 * - Availability status display
 * - Rating system integration
 * - Booking functionality
 * - Location-based information
 * - Facility type indicators
 * 
 * @component
 * @version 2.0.0
 * @author Healthcare System - KZN Implementation
 */

import React from 'react';
import Image from 'next/image';
import { MapPin, Star, Clock, Building, Heart } from 'lucide-react';

export default function SpecialistCard({
  profileImage = "/default-avatar.jpg",
  name = "Healthcare Provider",
  title = "Medical Specialist",
  clinicName = "Healthcare Facility",
  location = "KZN Location",
  ratings = 0,
  availability = "Available",
  onClick = () => { },
  facilityType = "clinic",
  languages = ["english"],
  consultationFee = null,
  isEmergency = false
}) {

  /**
   * Get facility type icon and color
   */
  const getFacilityInfo = (type) => {
    const facilityTypes = {
      'public-hospital': { icon: '🏥', color: 'text-red-500', label: 'Public Hospital' },
      'public-clinic': { icon: '🏥', color: 'text-blue-500', label: 'Public Clinic' },
      'unjani-clinic': { icon: '🏥', color: 'text-green-500', label: 'Unjani Clinic' },
      'private-practice': { icon: '🏢', color: 'text-purple-500', label: 'Private Practice' },
      'private-hospital': { icon: '🏥', color: 'text-indigo-500', label: 'Private Hospital' },
      'specialist-center': { icon: '🎯', color: 'text-orange-500', label: 'Specialist Center' }
    };
    return facilityTypes[type] || { icon: '🏥', color: 'text-gray-500', label: 'Healthcare Facility' };
  };

  const facilityInfo = getFacilityInfo(facilityType);

  return (
    <div
      className={`p-6 border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-lg cursor-pointer transition-all duration-300 ease-in-out hover:border-blue-300 group ${isEmergency ? 'border-l-4 border-l-red-500' : ''
        }`}
      onClick={onClick}
    >
      {/* Header Section */}
      <div className="flex items-start justify-between mb-4">
        {/* Profile Image */}
        <div className="flex-shrink-0 relative">
          <Image
            src={profileImage}
            alt={`${name} Profile`}
            width={80}
            height={80}
            className="rounded-full border-2 border-gray-200 group-hover:border-blue-400 transition-colors"
          />
          {isEmergency && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1">
              <Heart className="w-3 h-3" />
            </div>
          )}
        </div>

        {/* Facility Type Badge */}
        <div className={`text-sm font-medium ${facilityInfo.color} flex items-center gap-1`}>
          <span>{facilityInfo.icon}</span>
          <span className="hidden sm:inline">{facilityInfo.label}</span>
        </div>
      </div>

      {/* Specialist Information */}
      <div className="mb-4">
        <h3 className="text-xl font-bold text-[#003E65] mb-1 group-hover:text-blue-600 transition-colors">
          {name}
        </h3>
        <p className="text-md text-gray-600 font-medium mb-2">{title}</p>

        {/* Clinic Information */}
        <div className="flex items-center gap-2 text-gray-500 mb-2">
          <Building className="w-4 h-4" />
          <span className="text-sm">{clinicName}</span>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 text-gray-500 mb-3">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">{location}</span>
        </div>
      </div>

      {/* Ratings and Availability */}
      <div className="flex justify-between items-center mb-4">
        {/* Ratings */}
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 text-yellow-500 fill-current" />
          <span className="text-sm font-medium text-gray-700">
            {ratings > 0 ? ratings.toFixed(1) : 'New'}
          </span>
        </div>

        {/* Availability */}
        <div className={`flex items-center gap-1 text-sm font-medium ${availability === "Available" ? "text-green-600" : "text-red-600"
          }`}>
          <Clock className="w-4 h-4" />
          <span>{availability}</span>
        </div>
      </div>

      {/* Consultation Fee */}
      {consultationFee && (
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Consultation: <span className="font-semibold text-green-600">R{consultationFee}</span>
          </p>
        </div>
      )}

      {/* Languages */}
      {languages && languages.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-gray-500">
            Languages: {languages.map(lang => lang.charAt(0).toUpperCase() + lang.slice(1)).join(', ')}
          </p>
        </div>
      )}

      {/* Book Now Button */}
      <button
        className={`w-full font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform group-hover:scale-105 shadow-md hover:shadow-lg ${isEmergency
            ? 'bg-red-500 hover:bg-red-600 text-white'
            : 'bg-gradient-to-r from-[#F06255] to-orange-500 hover:from-[#e05045] hover:to-orange-600 text-white'
          }`}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
      >
        {isEmergency ? 'Emergency Booking' : 'Book Appointment'}
      </button>
    </div>
  );
}