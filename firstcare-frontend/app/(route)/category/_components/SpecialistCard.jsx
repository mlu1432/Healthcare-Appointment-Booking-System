// firstcare-frontend/app/(route)/category/_components/SpecialistCard.jsx
// Component to display a specialist's brief information as a card.
// This card includes a profile image, name, title, clinic details, ratings, availability, and a "Book Now" button.

"use client";

import React from 'react';
import Image from 'next/image';
import PropTypes from 'prop-types';

export default function SpecialistCard({
  profileImage = "/default-avatar.jpg",
  name = "Default Name",
  title = "Specialist",
  clinicName = "Default Clinic",
  location = "Default Location",
  ratings = 0,
  availability = "Not Available",
  onClick = () => {},
}) {
  return (
    <div 
      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-all duration-300 ease-in-out"
      onClick={onClick}
    >
      {/* Profile Image */}
      <div className="flex justify-center mb-4">
        <Image 
          src={profileImage} 
          alt={`${name} Profile`} 
          width={150} 
          height={150} 
          className="rounded-full"
        />
      </div>

      {/* Specialist Info */}
      <h3 className="text-xl font-bold text-[#003E65] text-center">{name}</h3>
      <p className="text-md text-gray-600 text-center">{title}</p>

      {/* Clinic and Location */}
      <div className="text-center mt-2">
        <p className="text-sm text-gray-500">{clinicName}</p>
        <p className="text-sm text-gray-500">{location}</p>
      </div>

      {/* Ratings */}
      <div className="text-center mt-2">
        <span className="text-yellow-500 text-lg">{ratings} ⭐</span>
      </div>

      {/* Availability */}
      <div className="text-center mt-4">
        <p className="text-green-600 font-bold">{availability}</p>
      </div>

      {/* Book Now Button */}
      <div className="mt-4 text-center">
        <button 
          className="bg-[#F06255] text-white font-bold py-2 px-8 rounded-lg w-full hover:bg-[#e05045] transition duration-200"
          onClick={onClick}
        >
          Book Now
        </button>
      </div>
    </div>
  );
}

SpecialistCard.propTypes = {
  profileImage: PropTypes.string,
  name: PropTypes.string,
  title: PropTypes.string,
  clinicName: PropTypes.string,
  location: PropTypes.string,
  ratings: PropTypes.number,
  availability: PropTypes.string,
  onClick: PropTypes.func,
};