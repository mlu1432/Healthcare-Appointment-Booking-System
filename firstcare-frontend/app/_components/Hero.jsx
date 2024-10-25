import React from "react";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="bg-[#F5F5F5] py-20 text-center relative">
      {/* Main Image */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <Image
          src="/DoctorsMain.jpg"
          alt="Doctors ready to assist"
          fill
          style={{ objectFit: "cover" }}
          quality={100}
        />
      </div>

      <div className="container mx-auto relative z-10">
        <h1 className="text-4xl font-bold text-white">
          Your Health Is Our Priority: Find & Book An Appointment With
          <span className="text-[#F06255]"> Trusted Experts</span>
        </h1>
        <p className="text-lg mt-4 text-white">
          We have a wide range of specialists ready to assist with your medical needs.
        </p>
        <button className="bg-[#F06255] text-white px-6 py-3 mt-6 rounded-full hover:bg-[#e05045] transition">
          Explore Now
        </button>
      </div>
    </section>
  );
}