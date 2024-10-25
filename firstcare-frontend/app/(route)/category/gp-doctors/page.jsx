// index.jsx for GP Doctors category
import React from 'react';
import SpecialistCard from '../../_components/SpecialistCard';

export default function GPDoctors() {
  const gpDoctors = [
    {
      profileImage: "/gp_dr_igt_mogolane.jpg",
      name: "Dr. I.G.T. Mogolane",
      title: "General Practitioner",
      clinicName: "Pretorius and Prinsloo Streets Clinic",
      location: "Opposite state theatre, Pretoria",
      ratings: 5,
      availability: "Available tomorrow at 09:00",
    },
    {
      profileImage: "/gp_dr_m_tambwe.jpg",
      name: "Dr. M. Tambwe",
      title: "General Practitioner",
      clinicName: "E&T Building Clinic",
      location: "285 Sisulu St, Opposite Louis Pasteur Hospital, Pretoria",
      ratings: 5,
      availability: "Available tomorrow at 10:00",
    },
  ];

  return (
    <section className="py-10 bg-[#F5F5F5] text-center">
      <div className="container mx-auto">
        <h2 className="text-4xl font-bold text-[#003E65] mb-6">General Practitioners</h2>
        <div className="flex flex-wrap justify-center gap-8">
          {gpDoctors.map((specialist, index) => (
            <SpecialistCard key={index} {...specialist} />
          ))}
        </div>
      </div>
    </section>
  );
}