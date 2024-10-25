// index.jsx for Ophthalmologists category
import React from 'react';
import SpecialistCard from '../../_components/SpecialistCard';

export default function Ophthalmologists() {
  const ophthalmologists = [
    {
      profileImage: "/ophthalmologist_dr_clayton_erasmus.jpg",
      name: "Dr. Clayton Erasmus",
      title: "Ophthalmologist",
      clinicName: "Pretoria Eye Institute",
      location: "630 Francis Baard St, Pretoria",
      ratings: 5,
      availability: "Available tomorrow at 11:00",
    },
    {
      profileImage: "/ophthalmologist_dr_pieter_odendaal.jpg",
      name: "Dr. Pieter Odendaal",
      title: "Ophthalmologist",
      clinicName: "Eye Care Center",
      location: "723 Sarel Ave, Pretoria",
      ratings: 4.2,
      availability: "Available tomorrow at 13:00",
    },
  ];

  return (
    <section className="py-10 bg-[#F5F5F5] text-center">
      <div className="container mx-auto">
        <h2 className="text-4xl font-bold text-[#003E65] mb-6">Ophthalmologists</h2>
        <div className="flex flex-wrap justify-center gap-8">
          {ophthalmologists.map((specialist, index) => (
            <SpecialistCard key={index} {...specialist} />
          ))}
        </div>
      </div>
    </section>
  );
}