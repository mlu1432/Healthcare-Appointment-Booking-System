// index.jsx for Gynecologists category
import React from 'react';
import SpecialistCard from '../../_components/SpecialistCard';

export default function Gynecologists() {
  const gynecologists = [
    {
      profileImage: "/gynecologist_dr_siakam_l_inc.jpg",
      name: "Dr. Siakam L Inc",
      title: "Obstetrician-Gynecologist",
      clinicName: "Mediclinic, Muelmed Hospital",
      location: "577 Pretorius St, Pretoria",
      ratings: 4.9,
      availability: "Available tomorrow at 14:00",
    },
    {
      profileImage: "/gynecologist_dr_dries_potgieter.jpg",
      name: "Dr. Dries Potgieter",
      title: "Obstetrician-Gynecologist",
      clinicName: "Mediclinic Kloof Hospital",
      location: "511 Jochemus St, Pretoria",
      ratings: 4.9,
      availability: "Available tomorrow at 16:30",
    },
  ];

  return (
    <section className="py-10 bg-[#F5F5F5] text-center">
      <div className="container mx-auto">
        <h2 className="text-4xl font-bold text-[#003E65] mb-6">Gynecologists</h2>
        <div className="flex flex-wrap justify-center gap-8">
          {gynecologists.map((specialist, index) => (
            <SpecialistCard key={index} {...specialist} />
          ))}
        </div>
      </div>
    </section>
  );
}