/**
 * HERO COMPONENT — FIRSTCARE KWAZULU-NATAL
 *
 * Overview:
 * The Hero component serves as the primary introduction section on the FirstCare homepage.
 * It immediately captures attention through strong visuals, motion effects, and a clear
 * message about healthcare accessibility in KwaZulu-Natal.
 *
 * Purpose:
 * To communicate FirstCare’s mission — connecting KZN communities with trusted, affordable,
 * and compassionate healthcare providers — through human-centered design and animation.
 *
 * Key Features:
 * 1. Full-screen background image with gradient overlay for a warm, professional feel.
 * 2. Animated text transitions (Framer Motion) for engaging storytelling.
 * 3. Dynamic AnimatedCounter showing community impact.
 * 4. Responsive layout optimized for mobile, tablet, and desktop.
 * 5. Interactive “Find My Doctor” and “Contact Clinic” buttons with motion effects.
 * 6. Floating visual cards showing verified professionals and clinic reach.
 * 7. Subtle scroll indicator encouraging user engagement.
 *
 * Animation Details:
 * - Framer Motion for staggered text and number animations.
 * - Viewport-triggered counting animation for trust metrics.
 * - Spring transitions for smooth and natural movement.
 * - Hover scaling for interactive elements.
 *
 * Structure:
 * - Background Wrapper → Gradient & hero image.
 * - Content Section → Text (left) and visuals (right).
 * - Floating Cards → Verified professionals & location stats.
 * - Scroll Indicator → Encourages further exploration.
 *
 * Design System:
 * - Background gradient: Deep Green (#064e3b) → Deep Blue (#1e3a8a)
 * - Accent Color: Coral (#F06255)
 * - Text: White and soft blue for clarity and trust.
 *
 * Tech Stack:
 * - React / Next.js for structure & performance.
 * - Framer Motion for animation.
 * - Lucide React icons for consistent modern UI.
 * - Tailwind CSS for responsive, utility-first design.
 */

"use client";

import React from "react";
import Image from "next/image";
import {
  MapPin,
  Heart,
  Users,
  ArrowRight,
  Star,
  CheckCircle,
  Phone,
  Calendar,
} from "lucide-react";
import { motion } from "framer-motion";
import AnimatedCounter from "./AnimatedCounter";

/* ============================
   FRAMER MOTION VARIANTS
============================ */
const headerVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { staggerChildren: 0.3 },
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

/* ============================
   HERO COMPONENT
============================ */
export default function Hero() {
  return (
    <>
      {/* ============================
          BACKGROUND WRAPPER
          (Full viewport with gradient overlay)
      ============================ */}
      <div className="fixed inset-0 -z-10 min-h-screen w-full bg-gradient-to-br from-green-900 to-blue-900">
        <Image
          src="/DoctorsMain.jpg"
          alt="Caring KwaZulu-Natal healthcare professionals serving communities with compassion."
          fill
          style={{ objectFit: "cover" }}
          quality={90}
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-green-900/85 via-blue-900/80 to-emerald-900/75 w-full"></div>
      </div>

      {/* ============================
          HERO CONTENT SECTION
      ============================ */}
      <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
        <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 px-6 lg:px-8 py-12">
          {/* ============================
              LEFT — TEXT CONTENT
          ============================ */}
          <div className="text-left max-w-2xl flex-1">
            {/* Partnership Badge */}
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30 mb-8">
              <Heart className="w-4 h-4 text-[#F06255]" />
              <span className="text-sm font-medium text-white">
                #AsibeHealthyKZN Partner
              </span>
            </div>

            {/* Headline */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-8"
            >
              <motion.span variants={headerVariants} className="block">
                Your Health,
              </motion.span>
              <motion.span variants={headerVariants} className="block text-[#F06255]">
                Our Heart,
              </motion.span>
              <motion.span
                variants={headerVariants}
                className="block text-white text-4xl md:text-5xl lg:text-6xl"
              >
                (Khona lapha KwaZulu-Natal)
              </motion.span>
            </motion.div>

            {/* Location */}
            <div className="flex items-center gap-3 text-blue-200 mb-6">
              <MapPin className="w-6 h-6" />
              <span className="text-lg font-medium">
                Serving Every Community in KwaZulu-Natal
              </span>
            </div>

            {/* Value Points */}
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <div className="bg-green-500/20 p-1 rounded-full mt-1">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                </div>
                <p className="text-white/90 text-lg leading-relaxed">
                  A dedicated healthcare community empowering families across KwaZulu-Natal.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-green-500/20 p-1 rounded-full mt-1">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                </div>
                <p className="text-white/90 text-lg leading-relaxed">
                  Connect with verified doctors, clinics, and specialists near you.
                </p>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button className="group bg-[#F06255] hover:bg-[#e05045] text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-2xl hover:shadow-3xl hover:scale-105 flex items-center justify-center gap-3">
                <Users className="w-5 h-5" />
                Find My Doctor
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button className="group border-2 border-white/50 hover:border-white hover:bg-white/10 text-white px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-300 backdrop-blur-sm flex items-center justify-center gap-2">
                <Phone className="w-5 h-5" />
                Contact Clinic
              </button>
            </div>

            {/* ============================
                TRUST INDICATORS (Animated)
            ============================ */}
            <div className="flex flex-wrap items-center gap-8 pt-6 border-t border-white/20">
              <AnimatedCounter
                end={50000}
                duration={2.5}
                text="KZN Families Served"
              />
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" />
                <span className="text-white font-medium">
                  4.8/5 Patient Rating
                </span>
              </div>
            </div>
          </div>

          {/* ============================
              RIGHT — IMAGE SECTION
          ============================ */}
          <div className="flex-1 flex justify-center relative">
            <div className="relative">
              <Image
                src="/DoctorsMain.jpg"
                alt="Trusted healthcare professionals providing compassionate care in KwaZulu-Natal."
                width={520}
                height={420}
                className="rounded-2xl shadow-2xl border-4 border-white/20 transform hover:scale-105 transition-transform duration-300"
              />

              {/* Floating Card — Verified Professionals */}
              <div className="absolute -bottom-6 -left-6 bg-white/95 backdrop-blur-md rounded-xl p-4 shadow-2xl border border-white/20 max-w-xs">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-full">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">
                      Verified Professionals
                    </div>
                    <div className="text-xs text-gray-600">
                      All doctors verified & rated
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Card — Locations */}
              <div className="absolute -top-6 -right-6 bg-gradient-to-r from-[#0077B6] to-blue-600 text-white rounded-xl p-5 shadow-2xl">
                <div className="text-center">
                  <div className="text-2xl font-bold">280+</div>
                  <div className="text-sm font-medium">KZN Locations</div>
                </div>
              </div>

              {/* Floating Button — Book Now */}
              <div className="absolute -bottom-6 -right-6">
                <button className="group bg-[#F06255] hover:bg-[#e05045] text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Book Now
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ============================
            SCROLL INDICATOR
        ============================ */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 border border-white/30">
            <div className="text-white text-sm font-medium text-center">
              Start Your Health Journey Today
            </div>
          </div>
        </div>
      </section>
    </>
  );
}