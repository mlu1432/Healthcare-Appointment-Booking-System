// SpecialistCard.jsx
// Component to display a specialist's brief information as a card.
// This card includes a profile image, name, title, clinic details, ratings, and availability.
// It can be used for listing specialists on a category page,
// and clicking on the card will navigate to the specialist's detailed profile.

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import Image from 'next/image';

export default function SpecialistCard({ profileImage, name, title, clinicName, location, ratings, availability, onClick }) {
  useEffect(() => {
    console.log(`SpecialistCard rendered: ${name}`);
  }, [name]);

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
          width={100} 
          height={100} 
          className="rounded-full"
        />
      </div>

      {/* Specialist Name and Title */}
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
    </div>
  );
}

SpecialistCard.propTypes = {
  profileImage: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  clinicName: PropTypes.string.isRequired,
  location: PropTypes.string.isRequired,
  ratings: PropTypes.number.isRequired,
  availability: PropTypes.string.isRequired,
  onClick: PropTypes.func,
};

SpecialistCard.defaultProps = {
  onClick: () => {},
};