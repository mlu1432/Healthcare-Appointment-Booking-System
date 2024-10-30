// firstcare-frontend/app/(route)/category/gynecologists/page.jsx
// Gynecologists Category Page displaying all available specialists.
import React from 'react';
import SpecialistCard from '../_components/SpecialistCard';
import { AppSidebar } from '../../../_components/Sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

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
          <h2 className="text-4xl font-bold text-[#003E65] mb-6">Gynecologists</h2>
          <div className="flex flex-wrap justify-center gap-8">
            {gynecologists.map((specialist, index) => (
              <SpecialistCard key={index} {...specialist} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}