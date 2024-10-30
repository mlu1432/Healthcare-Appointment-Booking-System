// firstcare-frontend/app/(route)/category/gp-doctors/page.jsx 
// GP Doctors Category Page with Sidebar and displaying all available specialists.
import React from 'react';
import SpecialistCard from '../_components/SpecialistCard';
import { AppSidebar } from '../../../_components/Sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

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
          {/* Page Title */}
          <h2 className="text-4xl font-bold text-[#003E65] mb-6">GP Doctors</h2>

          {/* Specialist Cards Container */}
          <div className="flex flex-wrap justify-center gap-8">
            {gpDoctors.map((specialist, index) => (
              <SpecialistCard key={index} {...specialist} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}