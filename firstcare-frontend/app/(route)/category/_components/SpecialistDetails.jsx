// SpecialistDetails.jsx
// Component to display the detailed information of a specialist.
// This component includes a profile image, name, title, clinic details, ratings,
// availability, qualifications, and other relevant details.
import React from 'react';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import Image from 'next/image';

export default function SpecialistDetails({ specialistData }) {
  const router = useRouter();
  const { id } = router.query;

  if (!specialistData) {
    return <p>Loading specialist details...</p>;
  }

  return (
    <section className="p-10 bg-white text-center">
      {/* Specialist Profile Image */}
      <div className="flex justify-center mb-6">
        <Image 
          src={specialistData.profileImage} 
          alt={`${specialistData.name} Profile`} 
          width={200} 
          height={200} 
          className="rounded-full"
        />
      </div>

      {/* Specialist Name and Title */}
      <h2 className="text-4xl font-bold text-[#003E65]">{specialistData.name}</h2>
      <p className="text-md text-gray-600 mt-2">{specialistData.title}</p>

      {/* Clinic, Location, and Availability */}
      <div className="mt-4">
        <p className="text-lg text-gray-500">{specialistData.clinicName}</p>
        <p className="text-lg text-gray-500">{specialistData.location}</p>
        <p className="text-green-600 font-bold mt-4">{specialistData.availability}</p>
      </div>

      {/* Ratings */}
      <div className="mt-4">
        <span className="text-yellow-500 text-xl">{specialistData.ratings} ⭐</span>
        <p className="text-sm text-gray-400">({specialistData.ratings} Ratings)</p>
      </div>

      {/* About Section (optional details) */}
      <div className="mt-8">
        <h3 className="text-2xl font-bold text-[#003E65] mb-4">About the Specialist</h3>
        <p className="text-gray-600">{specialistData.about}</p>
      </div>
    </section>
  );
}

SpecialistDetails.propTypes = {
  specialistData: PropTypes.shape({
    profileImage: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    clinicName: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    ratings: PropTypes.number.isRequired,
    availability: PropTypes.string.isRequired,
    about: PropTypes.string,
  }),
};