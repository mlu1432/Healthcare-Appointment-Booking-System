// DoctorList.jsx - Displays a list of popular health experts
import React from "react";
import Image from "next/image";

export default function DoctorList() {
  const doctors = [
    {
      id: 1,
      name: "Dr. Naushad Mahomed",
      specialty: "GP Doctor",
      qualification: "MBChB, Family Medicine Specialist",
      image: "/Dr_Naushad_Mahomed.png",
    },
    {
      id: 2,
      name: "Dr. Lerato Ndlovu",
      specialty: "Gynecologist",
      qualification: "MD, Specialist in Obstetrics and Gynecology",
      image: "/Dr_Lerato_Ndlovu.png",
    },
    {
      id: 3,
      name: "Dr. Jane Shakwane",
      specialty: "Dentist",
      qualification: "BDS, Specialist in Cosmetic Dentistry",
      image: "/Dr_Jane_Shakwane.png",
    },
    {
      id: 4,
      name: "Dr. Pretty Brown",
      specialty: "Clinical Psychologist",
      qualification: "PhD in Clinical Psychology",
      image: "/Dr_Pretty_Brown.png",
    },
    {
      id: 5,
      name: "Dr. Mpho Moaga",
      specialty: "Cardiologist",
      qualification: "MD, Cardiovascular Medicine",
      image: "/Dr_Mpho_Moaga.png",
    },
    {
      id: 6,
      name: "Dr. Andre Burger",
      specialty: "Optometrist",
      qualification: "BOptom, Specialist in Vision Therapy",
      image: "/Dr_Andre_Burger.png",
    },
  ];

  return (
    <div className="doctor-list-container py-10 px-5">
      <h2 className="section-title text-4xl font-bold text-red-500 mb-8">
        Popular Health Experts
      </h2>
      <div className="doctor-cards grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {doctors.map((doctor) => (
          <div
            key={doctor.id}
            className="doctor-card border p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <Image
              src={doctor.image}
              alt={doctor.name}
              width={300}
              height={300}
              className="doctor-image rounded-lg mb-4"
            />
            <h3 className="doctor-name font-semibold text-xl mb-2">
              {doctor.name}
            </h3>
            <p className="doctor-specialty text-lg text-blue-800">
              {doctor.specialty}
            </p>
            <p className="doctor-qualification text-sm text-gray-600 mt-2">
              {doctor.qualification}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}