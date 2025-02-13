import React from "react";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="bg-[#F5F5F5] py-10 text-center relative">
      {/* Main Image Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <Image
          src="/DoctorsMain.jpg"
          alt="Doctors ready to assist"
          fill
          style={{ objectFit: "cover" }}
          quality={100}
        />
        {/* Add a dark overlay to improve text contrast */}
        <div className="absolute inset-0 bg-black opacity-50"></div>
      </div>

      {/* Content Container */}
      <div className="container mx-auto relative z-10 flex flex-col md:flex-row items-center gap-10 max-w-6xl px-6">
        {/* Text Content */}
        <div className="text-content max-w-lg text-left">
        <h1 className="text-4xl font-bold text-[#012944] leading-snug">
           Your Health, Is Our Priority: Find & Book An Appointment With
          <span className="text-[#F06255]"> Trusted Experts</span>
        </h1>
          <p className="text-lg mt-4 text-[#012944]">
            We have a wide range of specialists ready to assist with your medical needs. Book an appointment now.
          </p>
          <button className="bg-[#E8DBDB] text-[#F06255] px-6 py-3 mt-6 rounded-full hover:bg-[#e05045] transition">
            Explore Now
          </button>
        </div>

        {/* Image Content */}
        <div className="image-content flex justify-center">
          <Image
            src="/DoctorsMain.jpg"
            alt="Doctors ready to assist"
            width={500}
            height={400}
            className="rounded-lg shadow-lg"
          />
        </div>
      </div>
    </section>
  );
}