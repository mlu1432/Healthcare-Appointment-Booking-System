// firstcare-frontend/app/(route)/category/psychologists/page.jsx 
// Psychologists Category Page displaying all available specialists.
import React from 'react';
import SpecialistCard from '../_components/SpecialistCard';
import { AppSidebar } from '../../../_components/Sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

export default function Psychologists() {
  const psychologists = [
    {
      profileImage: "/psychologist_antoinette-nicolaou.jpg",
      name: "Antoinette Nicolaou",
      title: "Clinical Psychologist",
      clinicName: "Psychologist Centre",
      location: "17 Eureka Pl, Pretoria",
      ratings: 4.9,
      availability: "Available tomorrow at 16:00",
    },
    {
      profileImage: "/psychologist_dr_tienie_maritz.jpg",
      name: "Dr. Tienie Maritz",
      title: "Psychologist",
      clinicName: "Tienie Maritz Psychologists",
      location: "29 16th St, Pretoria",
      ratings: 4.9,
      availability: "Available tomorrow at 15:00",
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
          <h2 className="text-4xl font-bold text-[#003E65] mb-6">Psychologists</h2>
          <div className="flex flex-wrap justify-center gap-8">
            {psychologists.map((specialist, index) => (
              <SpecialistCard key={index} {...specialist} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}