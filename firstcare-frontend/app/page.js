// Home page component for the FirstCare application
// Manages displaying the main hero, search functionality, and list of doctors
"use client";
import { useEffect, useState } from "react";
import Hero from "@/app/_components/Hero";
import CategorySearch from "@/app/_components/CategorySearch";
import DoctorList from "@/app/_components/DoctorList";
import Footer from "@/app/_components/Footer";
import Header from "@/app/_components/Header";

export default function Home() {
  const [doctorsList, setDoctorList] = useState([]);

  useEffect(() => {
    // Mock data for doctors list
    const mockDoctors = [
      { id: 1, name: "Dr. Lerato Ndlovu", specialty: "Cardiologist", location: "Pretoria" },
      { id: 2, name: "Dr. Jane Shakwane", specialty: "Dentist", location: "Johannesburg" },
      { id: 3, name: "Dr. Pretty Brown", specialty: "Psychologist", location: "Midrand" },
    ];
    setDoctorList(mockDoctors);
  }, []);

  return (
    <div>
      {/* Header Section */}
      <Header />

      {/* Hero Section to introduce the platform */}
      <Hero />

      {/* Search bar and category section */}
      <CategorySearch />

      {/* Popular Doctor List Section */}
      <DoctorList doctorList={doctorsList} />

      {/* Footer Section */}
      <Footer />
    </div>
  );
}