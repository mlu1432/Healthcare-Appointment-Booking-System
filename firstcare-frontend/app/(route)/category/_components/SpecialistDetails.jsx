// firstcare-frontend/app/(route)/category/_components/SpecialistDetails.jsx
// Component to display detailed information of a selected specialist.

import React from 'react';
import Image from 'next/image';

// SpecialistDetails Component
export default function SpecialistDetails({ specialist }) {
  // If the specialist is not available, return nothing
  if (!specialist) return null;

  // Destructuring the properties of specialist for easier access
  const {
    profileImage = "/images/default-profile.png", // Fallback image
    name = "Default Specialist",
    title = "General Practitioner",
    clinicName = "Unknown Clinic",
    location = "Unknown Location",
    ratings = 0,
    availability = "Unavailable",
    description = "No further details provided for this specialist.",
  } = specialist;

  return (
    <div className="p-6 border border-gray-200 rounded-lg bg-white shadow-md">
      {/* Profile Image */}
      <div className="flex justify-center mb-6">
        <Image
          src={profileImage}
          alt={`${name} Profile`}
          width={150}
          height={150}
          className="rounded-full shadow-md"
          priority
        />
      </div>

      {/* Specialist Name and Title */}
      <h1 className="text-2xl font-bold text-[#003E65] text-center">{name}</h1>
      <p className="text-md text-gray-600 text-center">{title}</p>

      {/* Clinic and Location */}
      <div className="text-center mt-4">
        <p className="text-lg text-gray-500 font-semibold">{clinicName}</p>
        <p className="text-md text-gray-500">{location}</p>
      </div>

      {/* Ratings */}
      <div className="text-center mt-4">
        <span className="text-yellow-500 text-xl">{ratings} ⭐</span>
      </div>

      {/* Availability */}
      <div className="text-center mt-4">
        <p className={`font-bold ${availability === "Available" ? "text-green-600" : "text-red-600"}`}>{availability}</p>
      </div>

      {/* Description */}
      <div className="mt-6 text-gray-700 text-justify">
        <p>{description}</p>
      </div>
    </div>
  );
}