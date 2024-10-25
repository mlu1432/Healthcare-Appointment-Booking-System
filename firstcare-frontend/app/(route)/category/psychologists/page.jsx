// index.jsx for Psychologists category
import React from 'react';
import SpecialistCard from '../../_components/SpecialistCard';

export default function Psychologists() {
  const psychologists = [
    {
      profileImage: "/psychologist_dr_tienie_maritz.jpg",
      name: "Dr. Tienie Maritz",
      title: "Psychologist",
      clinicName: "Tienie Maritz Psychologists",
      location: "29 16th St, Pretoria",
      ratings: 4.9,
      availability: "Available tomorrow at 15:00",
    },
    {
      profileImage: "/psychologist_antoinette_nicolaou.jpg",
      name: "Antoinette Nicolaou",
      title: "Clinical Psychologist",
      clinicName: "Psychologist Centre",
      location: "17 Eureka Pl, Pretoria",
      ratings: 4.9,
      availability: "Available tomorrow at 16:00",
    },
  ];

  return (
    <section className="py-10 bg-[#F5F5F5] text-center">
      <div className="container mx-auto">
        <h2 className="text-4xl font-bold text-[#003E65] mb-6">Psychologists</h2>
        <div className="flex flex-wrap justify-center gap-8">
          {psychologists.map((specialist, index) => (
            <SpecialistCard key={index} {...specialist} />
          ))}
        </div>
      </div>
    </section>
  );
}