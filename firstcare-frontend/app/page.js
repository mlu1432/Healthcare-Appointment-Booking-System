/**
 * @file Home.jsx
 * @description Home Page Component for the FirstCare Healthcare Platform.
 *
 * This component serves as the main landing page of the application.
 * It integrates three key sections:
 *  1. Hero section — introducing the platform.
 *  2. CategorySearch section — enabling users to find doctors by specialty.
 *  3. DoctorList section — displaying a list of featured healthcare professionals.
 *
 * Features:
 * - Uses React state to manage doctors list and loading status.
 * - Simulates an API fetch for doctor data.
 * - Built with modular, reusable components for clarity and scalability.
 */

"use client";

import { useEffect, useState } from "react";
import Hero from "@/app/_components/Hero";
import CategorySearch from "@/app/_components/CategorySearch";
import DoctorList from "@/app/_components/DoctorList";

export default function Home() {
  /**
   * @state {Array} doctorsList - Stores the list of doctors fetched from mock data or API.
   * @state {boolean} isLoading - Indicates whether data is currently being fetched.
   */
  const [doctorsList, setDoctorList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * useEffect - Fetches mock doctor data.
   * Simulates an API call to load a list of doctors from KwaZulu-Natal (KZN).
   * The timeout is used to mimic a real API delay.
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      // Mock dataset representing healthcare professionals across KZN
      const mockDoctors = [
        {
          id: 1,
          name: "Dr. Naushad Mahomed",
          specialty: "GP Doctor",
          location: "Durban Central",
          qualification: "MBChB, Family Medicine Specialist",
          image: "/Dr_Naushad_Mahomed.png",
          rating: 4.8,
          available: true,
        },
        {
          id: 2,
          name: "Dr. Lerato Ndlovu",
          specialty: "Gynecologist",
          location: "Pietermaritzburg",
          qualification: "MD, Specialist in Obstetrics and Gynecology",
          image: "/Dr_Lerato_Ndlovu.png",
          rating: 4.9,
          available: true,
        },
        {
          id: 3,
          name: "Dr. Jane Shakwane",
          specialty: "Dentist",
          location: "Umhlanga",
          qualification: "BDS, Specialist in Cosmetic Dentistry",
          image: "/Dr_Jane_Shakwane.png",
          rating: 4.7,
          available: false,
        },
        {
          id: 4,
          name: "Dr. Pretty Brown",
          specialty: "Clinical Psychologist",
          location: "Richards Bay",
          qualification: "PhD in Clinical Psychology",
          image: "/Dr_Pretty_Brown.png",
          rating: 4.8,
          available: true,
        },
        {
          id: 5,
          name: "Dr. Mpho Moaga",
          specialty: "Cardiologist",
          location: "Durban North",
          qualification: "MD, Cardiovascular Medicine",
          image: "/Dr_Mpho_Moaga.png",
          rating: 4.9,
          available: true,
        },
        {
          id: 6,
          name: "Dr. Andre Burger",
          specialty: "Optometrist",
          location: "Ballito",
          qualification: "BOptom, Specialist in Vision Therapy",
          image: "/Dr_Andre_Burger.png",
          rating: 4.6,
          available: true,
        },
      ];

      setDoctorList(mockDoctors);
      setIsLoading(false);
    }, 1500);

    // Cleanup the timeout when the component unmounts
    return () => clearTimeout(timer);
  }, []);

  /**
   * @returns {JSX.Element} The rendered home page layout containing the Hero,
   * CategorySearch, and DoctorList sections.
   */
  return (
    <div className="min-h-screen">
      {/* Hero Section: introductory banner and call to action */}
      <Hero />

      {/* Category Search Section: allows users to browse or search for specialists */}
      <CategorySearch />

      {/* Doctor List Section: displays featured doctors with loading state */}
      <DoctorList doctorList={doctorsList} isLoading={isLoading} />
    </div>
  );
}