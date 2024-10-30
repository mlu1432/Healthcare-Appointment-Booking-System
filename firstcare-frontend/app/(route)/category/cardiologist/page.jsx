// firstcare-frontend/app/(route)/category/cardiologists/page.jsx
// Cardiologists Category Page displaying all available cardiologists.
import React from 'react';
import SpecialistCard from '../_components/SpecialistCard';
import { AppSidebar } from '../../../_components/Sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

export default function Cardiologists() {
  const cardiologists = [
    {
      profileImage: "/cardiologist_dr_lb_osrin.jpg",
      name: "Dr. LB Osrin",
      title: "Cardiologist",
      clinicName: "Cardiology Clinic",
      location: "255 Bourke St, Pretoria",
      ratings: 4.5,
      availability: "Available tomorrow at 12:30",
    },
    {
      profileImage: "/cardiologist_dr_mpe_mt_administrators.jpg",
      name: "Dr. Mpe M.T Administrators",
      title: "Cardiologist",
      clinicName: "Mediclinic Heart Hospital",
      location: "551 Park Street, Arcadia, Pretoria",
      ratings: 5,
      availability: "Available tomorrow at 14:30",
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
          <h2 className="text-4xl font-bold text-[#003E65] mb-6">Cardiologists</h2>
          <div className="flex flex-wrap justify-center gap-8">
            {cardiologists.map((specialist, index) => (
              <SpecialistCard key={index} {...specialist} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}