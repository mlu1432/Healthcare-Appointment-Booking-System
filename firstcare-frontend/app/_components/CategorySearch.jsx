// Category/Search section component for finding healthcare professionals
// Displays the search bar, filters, and category icons for easy navigation

import React from "react";
import Image from "next/image";
import GPDoctorIcon from "@/public/gp-doctors.svg";
import GynaecologistIcon from "@/public/gynecologist.png";
import DentistIcon from "@/public/dentist.svg";
import PsychologistIcon from "@/public/psychologist.png";
import CardiologistIcon from "@/public/heart.svg";
import OphthalmologistIcon from "@/public/eye.png";

export default function CategorySearch() {
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
        <div className="flex justify-center items-center mt-6">
          <input
            type="text"
            placeholder="Search for healthcare professionals..."
            className="w-1/3 h-14 pl-4 border border-[#012944] rounded-l-full outline-none"
          />
          <button className="bg-[#F06255] text-white px-6 h-14 rounded-r-full">
            Search
          </button>
        </div>

        {/* Categories Section */}
        <div className="grid grid-cols-3 gap-8 mt-10">
          {/* GP Doctors */}
          <div className="p-4 border border-[#E8DBDB] rounded-lg hover:bg-gray-100 cursor-pointer">
            <Image src={GPDoctorIcon} alt="GP Doctors" width={128} height={128} />
            <h3 className="mt-4 text-xl font-bold">GP Doctors</h3>
          </div>

          {/* Gynaecologist */}
          <div className="p-4 border border-[#E8DBDB] rounded-lg hover:bg-gray-100 cursor-pointer">
            <Image
              src={GynaecologistIcon}
              alt="Gynaecologist"
              width={128}
              height={128}
            />
            <h3 className="mt-4 text-xl font-bold">Gynaecologist</h3>
          </div>

          {/* Dentist */}
          <div className="p-4 border border-[#E8DBDB] rounded-lg hover:bg-gray-100 cursor-pointer">
            <Image src={DentistIcon} alt="Dentist" width={128} height={128} />
            <h3 className="mt-4 text-xl font-bold">Dentist</h3>
          </div>

          {/* Psychologist */}
          <div className="p-4 border border-[#E8DBDB] rounded-lg hover:bg-gray-100 cursor-pointer">
            <Image
              src={PsychologistIcon}
              alt="Psychologist"
              width={128}
              height={128}
            />
            <h3 className="mt-4 text-xl font-bold">Psychologist</h3>
          </div>

          {/* Cardiologist */}
          <div className="p-4 border border-[#E8DBDB] rounded-lg hover:bg-gray-100 cursor-pointer">
            <Image
              src={CardiologistIcon}
              alt="Cardiologist"
              width={128}
              height={128}
            />
            <h3 className="mt-4 text-xl font-bold">Cardiologist</h3>
          </div>

          {/* Ophthalmologist */}
          <div className="p-4 border border-[#E8DBDB] rounded-lg hover:bg-gray-100 cursor-pointer">
            <Image
              src={OphthalmologistIcon}
              alt="Ophthalmologist"
              width={128}
              height={128}
            />
            <h3 className="mt-4 text-xl font-bold">Ophthalmologist</h3>
          </div>
        </div>
      </div>
    </section>
  );
}