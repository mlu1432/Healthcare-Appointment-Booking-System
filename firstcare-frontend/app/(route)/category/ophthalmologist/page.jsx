// firstcare-frontend/app/(route)/category/ophthalmologist/page.jsx
// Ophthalmologists Category Page displaying all available specialists.
import React from 'react';
import SpecialistCard from '../_components/SpecialistCard';
import { AppSidebar } from '../../../_components/Sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

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
    <div className="category-layout flex">
      {/* Sidebar Section */}
      <div className="w-1/4 h-screen sticky top-0">
        <SidebarProvider>
          <AppSidebar />
        </SidebarProvider>
      </div>

      {/* Main Content Section */}
      <div className="w-3/4 py-10 bg-[#F5F5F5] text-center">
        <div className="container mx-auto max-w-screen-lg px-4">
          <h2 className="text-4xl font-bold text-[#003E65] mb-6">Ophthalmologists</h2>
          <div className="flex flex-wrap justify-center gap-8">
            {ophthalmologists.map((specialist, index) => (
              <SpecialistCard key={index} {...specialist} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}