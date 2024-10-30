// firstcare-frontend/app/(route)/category/dentists/page.jsx
// Dentists Category Page displaying all available dentists.
import React from 'react';
import SpecialistCard from '../_components/SpecialistCard';
import { AppSidebar } from '../../../_components/Sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

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
          <h2 className="text-4xl font-bold text-[#003E65] mb-6">Dentists</h2>
          <div className="flex flex-wrap justify-center gap-8">
            {dentists.map((specialist, index) => (
              <SpecialistCard key={index} {...specialist} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}