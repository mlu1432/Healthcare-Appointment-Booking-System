// DoctorList component to display a list of popular doctors
import React from "react";

export default function DoctorList({ doctorList }) {
  return (
    <section className="py-10">
      <div className="container mx-auto">
        <h2 className="text-2xl font-bold mb-6">Popular Health Experts</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {doctorList.map((doctor, index) => (
            <div key={index} className="border p-4 rounded-lg shadow-md">
              <img src={doctor.image} alt={doctor.name} className="w-full h-40 object-cover rounded-t-lg" />
              <h3 className="font-bold mt-4">{doctor.name}</h3>
              <p className="text-sm">{doctor.specialty}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}