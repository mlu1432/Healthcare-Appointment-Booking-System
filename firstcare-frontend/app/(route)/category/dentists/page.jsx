// index.jsx for Dentists category
import React from 'react';
import SpecialistCard from '../../_components/SpecialistCard';

export default function Dentists() {
  const dentists = [
    {
      profileImage: "/dentist_dr_hassan_kajee.jpg",
      name: "Dr. Hassan Kajee",
      title: "Dentist",
      clinicName: "Hayfields Dental Centre",
      location: "Hayfields, Pietermaritzburg, KwaZulu-Natal",
      ratings: 5,
      availability: "Available tomorrow at 10:30",
    },
    {
      profileImage: "/dentists_dr_moloi_and_dr_marishane.jpg",
      name: "Dr. O.P. Moloi and Dr. M.M Marishane",
      title: "Dentist",
      clinicName: "SmileLab Dental Centre Pretoria",
      location: "Louis Pasteur Arcade, Schoeman St, Pretoria",
      ratings: 4.2,
      availability: "Available tomorrow at 11:00",
    },
  ];

  return (
    <section className="py-10 bg-[#F5F5F5] text-center">
      <div className="container mx-auto">
        <h2 className="text-4xl font-bold text-[#003E65] mb-6">Dentists</h2>
        <div className="flex flex-wrap justify-center gap-8">
          {dentists.map((specialist, index) => (
            <SpecialistCard key={index} {...specialist} />
          ))}
        </div>
      </div>
    </section>
  );
}