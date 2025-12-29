"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { MapPin, Star, Calendar } from "lucide-react";

/**
 * DOCTORLIST COMPONENT — FIRSTCARE KWAZULU-NATAL
 *
 * Overview:
 * The DoctorList component dynamically displays healthcare professionals 
 * serving communities across KwaZulu-Natal. It showcases verified medical experts
 * with modern visuals, subtle animations, and interactive appointment booking.
 *
 * Purpose:
 * This section helps patients quickly identify, evaluate, and book appointments 
 * with doctors in their area. It reinforces FirstCare’s mission to connect KZN 
 * families with trusted, accessible, and high-quality healthcare providers.
 *
 * Key Features:
 * 1. Responsive grid layout showcasing doctor cards.
 * 2. Motion animations for smooth entry and hover transitions.
 * 3. Dynamic fallback data for KZN regions when no API data is provided.
 * 4. Loading skeletons for improved UX during data fetch.
 * 5. Visual cues for doctor availability and patient ratings.
 * 6. “Book Appointment” CTA that visually connects with Hero section style.
 *
 * Visual & Animation Details:
 * - Framer Motion handles staggered reveal animations per card.
 * - Hover scaling and image zoom to create interactive depth.
 * - Background gradient from soft blue to white matching FirstCare brand palette.
 *
 * Background and Color Scheme:
 * - Primary: Deep healthcare blue (#003E65)
 * - Accent: Coral-orange (#F06255)
 * - Gradient: Soft blue-white blend for approachability
 *
 * Technologies Used:
 * - React & Next.js (with Image Optimization)
 * - Framer Motion for interactivity
 * - Lucide React Icons for crisp visual consistency
 * - Tailwind CSS for responsive design
 *
 * Design Philosophy:
 * Designed to feel approachable yet professional — balancing warmth, trust, 
 * and modern design. Each card subtly reflects FirstCare’s human-centered 
 * healthcare vision for KwaZulu-Natal.
 */

export default function DoctorList({ doctorList = [], isLoading = false }) {
  // Fallback KZN doctor data (if API returns empty)
  const kznDoctors = doctorList.length > 0 ? doctorList : [
    {
      id: 1,
      name: "Dr. Naushad Mahomed",
      specialty: "General Practitioner",
      qualification: "MBChB, Family Medicine Specialist",
      image: "/Dr_Naushad_Mahomed.png",
      location: "Durban Central",
      rating: 4.8,
      available: true,
    },
    {
      id: 2,
      name: "Dr. Lerato Ndlovu",
      specialty: "Gynecologist",
      qualification: "MD, Obstetrics and Gynecology",
      image: "/Dr_Lerato_Ndlovu.png",
      location: "Pietermaritzburg",
      rating: 4.9,
      available: true,
    },
    {
      id: 3,
      name: "Dr. Jane Shakwane",
      specialty: "Dentist",
      qualification: "BDS, Cosmetic Dentistry",
      image: "/Dr_Jane_Shakwane.png",
      location: "Umhlanga",
      rating: 4.7,
      available: false,
    },
    {
      id: 4,
      name: "Dr. Pretty Brown",
      specialty: "Clinical Psychologist",
      qualification: "PhD, Clinical Psychology",
      image: "/Dr_Pretty_Brown.png",
      location: "Richards Bay",
      rating: 4.8,
      available: true,
    },
    {
      id: 5,
      name: "Dr. Mpho Moaga",
      specialty: "Cardiologist",
      qualification: "MD, Cardiovascular Medicine",
      image: "/Dr_Mpho_Moaga.png",
      location: "Durban North",
      rating: 4.9,
      available: true,
    },
    {
      id: 6,
      name: "Dr. Andre Burger",
      specialty: "Optometrist",
      qualification: "BOptom, Vision Therapy",
      image: "/Dr_Andre_Burger.png",
      location: "Ballito",
      rating: 4.6,
      available: true,
    },
  ];

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  // Loading state placeholder
  if (isLoading) {
    return (
      <section className="py-16 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-[#003E65] mb-4">
            Loading KZN Healthcare Experts...
          </h2>
          <p className="text-lg text-gray-600 mb-10">
            Finding the best doctors in your area
          </p>

          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-300 h-64 rounded-lg mb-4"></div>
                <div className="bg-gray-300 h-4 rounded mb-2"></div>
                <div className="bg-gray-300 h-4 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Main Content
  return (
    <section className="py-16 bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-[#003E65] mb-4">
            Trusted KZN Healthcare Experts
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Connect with board-certified professionals proudly serving communities across KwaZulu-Natal.
          </p>
        </motion.div>

        {/* Doctor Cards Grid */}
        <motion.div
          className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {kznDoctors.map((doctor) => (
            <motion.article
              key={doctor.id}
              variants={itemVariants}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group hover:scale-105"
            >
              {/* Doctor Image */}
              <div className="relative h-52 overflow-hidden">
                <Image
                  src={doctor.image}
                  alt={`${doctor.name}, ${doctor.specialty} in ${doctor.location}`}
                  fill
                  style={{ objectFit: "cover" }}
                  className="group-hover:scale-110 transition-transform duration-300"
                />
                <div
                  className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${doctor.available ? "bg-green-500 text-white" : "bg-gray-500 text-white"
                    }`}
                >
                  {doctor.available ? "Available" : "Unavailable"}
                </div>
              </div>

              {/* Doctor Info */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{doctor.name}</h3>
                <p className="text-[#F06255] font-semibold mb-1">{doctor.specialty}</p>
                <p className="text-sm text-gray-600 mb-4">{doctor.qualification}</p>

                {/* Location & Rating */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{doctor.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span>{doctor.rating}</span>
                  </div>
                </div>

                {/* CTA Button */}
                <button className="w-full bg-gradient-to-r from-[#0077B6] to-blue-600 hover:from-[#0096C7] hover:to-blue-700 text-white py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 group/btn">
                  <Calendar className="w-4 h-4" />
                  Book Appointment
                  <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
                </button>
              </div>
            </motion.article>
          ))}
        </motion.div>

        {/* KZN Trust Badge */}
        <motion.div
          className="text-center mt-14"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 bg-[#003E65]/10 text-[#003E65] rounded-full px-6 py-3">
            <span className="text-sm font-medium">Serving All KZN Communities</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}