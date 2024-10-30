import React from "react";
import CategoryCard from "@/app/(route)/search/_components/CategoryCard";
import { useRouter } from 'next/navigation';
import GPDoctorIcon from "@/public/gp-doctors.svg";
import GynecologistIcon from "@/public/gynecologist.png";
import DentistIcon from "@/public/dentist.svg";
import PsychologistIcon from "@/public/psychologist.png";
import CardiologistIcon from "@/public/heart.svg";
import OphthalmologistIcon from "@/public/eye.png";

export default function CategorySearch() {
  // Initialize useRouter to enable navigation
  const router = useRouter();

  // Handle card click to navigate to the respective category page
  const handleCardClick = (category) => {
    console.log(`${category} card clicked!`);
    // Navigation logic using router
    const formattedCategory = category.toLowerCase().replace(/\s+/g, '-');
    router.push(`/category/${formattedCategory}`);
  };

  return (
    <section className="py-10 bg-[#F5F5F5] text-center">
      <div className="container mx-auto">
        {/* Title */}
        <h2 className="text-4xl font-bold text-[#003E65]">
          Search for Healthcare Experts
        </h2>
        <p className="text-lg text-gray-500 mt-2 underline">
          Find and book a Doctor in One Click
        </p>

        {/* Search Bar */}
        <div className="flex justify-center mt-6 mb-10">
          <input 
            type="text" 
            placeholder="Search for a specialist..." 
            className="w-1/2 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#F06255]"
          />
          <button 
            className="ml-3 px-6 py-2 bg-[#F06255] text-white rounded-lg hover:bg-[#e05045] transition"
          >
            Search
          </button>
        </div>

        {/* Categories Section */}
        <div className="flex justify-between gap-6 mt-10 max-w-screen-lg mx-auto">
          {/* Category Cards */}
          <CategoryCard 
            icon={GPDoctorIcon} 
            title="GP Doctors" 
            onClick={() => handleCardClick('GP Doctors')}
          />
          <CategoryCard 
            icon={GynecologistIcon} 
            title="Gynecologist" 
            onClick={() => handleCardClick('Gynaecologist')}
          />
          <CategoryCard 
            icon={DentistIcon} 
            title="Dentist" 
            onClick={() => handleCardClick('Dentist')}
          />
          <CategoryCard 
            icon={PsychologistIcon} 
            title="Psychologist" 
            onClick={() => handleCardClick('Psychologist')}
          />
          <CategoryCard 
            icon={CardiologistIcon} 
            title="Cardiologist" 
            onClick={() => handleCardClick('Cardiologist')}
          />
          <CategoryCard 
            icon={OphthalmologistIcon} 
            title="Ophthalmologist" 
            onClick={() => handleCardClick('Ophthalmologist')}
          />
        </div>
      </div>
    </section>
  );
}