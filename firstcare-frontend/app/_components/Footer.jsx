/**
 * @file Footer.jsx
 * @description Footer component for the FirstCare KZN Healthcare Platform.
 *
 * This component renders the global footer displayed at the bottom of every page.
 * It includes key platform information, trust indicators, contact details, and
 * links to essential sections of the website. The footer is visually enhanced
 * using gradient backgrounds, iconography, and motion effects from Framer Motion.
 *
 * Features:
 * - **Affordable Care Focus:** Highlights FirstCare’s commitment to low-cost healthcare options.
 * - **Trust Bar:** Displays compliance and patient trust statistics.
 * - **Partner Information:** Lists affordable clinics, medical aids, and health partners.
 * - **Contact Section:** Provides location, phone, and email details.
 * - **Animated Icons:** Uses `react-icons` and `lucide-react` for visual enhancement.
 * - **Responsive Layout:** Fully responsive grid layout optimized for mobile and desktop views.
 *
 * Technologies Used:
 * - React & Next.js (Client Component)
 * - Tailwind CSS for styling and responsive layout
 * - Framer Motion for animation effects
 * - React Icons & Lucide React for vector icons
 *
 * @component
 * @example
 * // Example usage in a page component:
 * import Footer from "@/app/_components/Footer";
 *
 * export default function Page() {
 *   return (
 *     <>
 *       <main>Page content...</main>
 *       <Footer />
 *     </>
 *   );
 * }
 */

"use client";

import React from "react";
import { FaTwitter, FaInstagram, FaFacebook, FaMapMarkerAlt, FaPhone, FaEnvelope } from "react-icons/fa";
import { motion } from "framer-motion";
import { Heart, Shield, Clock, Users, Stethoscope, DollarSign } from "lucide-react";

export default function Footer() {
  return (
    <>
      {/* FULL-WIDTH BACKGROUND WRAPPER */}
      <div className="fixed inset-0 -z-10 w-full bg-gradient-to-br from-green-900 via-blue-900 to-emerald-900">
        {/* Optional: Add pattern overlay if you have the image */}
        {/* <div className="absolute inset-0 bg-[url('/medical-pattern.svg')] opacity-5"></div> */}
      </div>

      {/* FOOTER CONTENT */}
      <footer className="relative w-full text-white overflow-hidden">

        {/* Main Content */}
        <div className="relative z-10">

          {/* Trust Bar - FULL WIDTH */}
          <div className="w-full bg-white/10 backdrop-blur-sm border-b border-white/20">
            <div className="w-full max-w-7xl mx-auto px-6 py-4">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-400" />
                    <span>HIPAA Compliant</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-400" />
                    <span>Low-Cost Options</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-orange-400" />
                    <span>50,000+ KZN Patients</span>
                  </div>
                </div>

                <div className="bg-[#F06255] px-4 py-1 rounded-full text-sm font-semibold">
                  #AsibeHealthyKZN Partner
                </div>
              </div>
            </div>
          </div>

          {/* Main Footer Content */}
          <div className="w-full max-w-7xl mx-auto px-6 py-12">
            <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">

              {/* Brand Column */}
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex items-center gap-3">
                  <img
                    src="/logoipsum-298.svg"
                    alt="FirstCare KZN Logo"
                    className="w-12 h-12"
                  />
                  <div>
                    <h3 className="text-xl font-bold text-white">FirstCare</h3>
                    <p className="text-green-300 text-sm">Affordable Healthcare KZN</p>
                  </div>
                </div>

                <p className="text-white/80 text-sm leading-relaxed">
                  Connecting KZN communities with trusted, affordable healthcare.
                  From low-cost medical aid to R300 clinic consultations - quality care for every budget.
                </p>

                <div className="flex space-x-4">
                  <motion.a
                    href="#"
                    className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-all duration-300"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaFacebook className="w-4 h-4" />
                  </motion.a>
                  <motion.a
                    href="#"
                    className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-all duration-300"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaTwitter className="w-4 h-4" />
                  </motion.a>
                  <motion.a
                    href="#"
                    className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-all duration-300"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaInstagram className="w-4 h-4" />
                  </motion.a>
                </div>
              </motion.div>

              {/* Quick Links */}
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <h4 className="font-bold text-lg text-white border-l-4 border-[#F06255] pl-3">Quick Links</h4>
                <ul className="space-y-2 text-white/80">
                  <li><a href="/doctors" className="hover:text-white transition-colors">Find a Doctor</a></li>
                  <li><a href="/low-cost-clinics" className="hover:text-white transition-colors">Low-Cost Clinics</a></li>
                  <li><a href="/booking" className="hover:text-white transition-colors">Book Appointment</a></li>
                  <li><a href="/medical-aid" className="hover:text-white transition-colors">Medical Aid Options</a></li>
                  <li><a href="/unjani-clinics" className="hover:text-white transition-colors">Unjani Clinics</a></li>
                </ul>
              </motion.div>

              {/* Affordable Partners */}
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <h4 className="font-bold text-lg text-white border-l-4 border-green-500 pl-3">Affordable Partners</h4>
                <div className="space-y-4">
                  <div>
                    <p className="text-white/90 font-semibold text-sm flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-400" />
                      Low-Cost Medical Aid
                    </p>
                    <div className="text-white/70 text-sm mt-1 space-y-1">
                      <div>• KeyHealth Medical Scheme</div>
                      <div>• Bonitas Medical Aid</div>
                      <div>• Fedhealth flexiFED</div>
                      <div>• Dis-Chem Health Plans</div>
                    </div>
                  </div>

                  <div>
                    <p className="text-white/90 font-semibold text-sm flex items-center gap-2">
                      <Stethoscope className="w-4 h-4 text-blue-400" />
                      Affordable Clinics
                    </p>
                    <div className="text-white/70 text-sm mt-1">
                      <div className="font-semibold text-green-300">Unjani Clinics</div>
                      <div className="text-xs mt-1">
                        Consultation: R300 (includes medication)<br />
                        Follow-up: R100 • STI Treatment: R350
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-white/90 font-semibold text-sm">Public Health Partners</p>
                    <p className="text-white/70 text-sm">KZN Department of Health</p>
                  </div>
                </div>
              </motion.div>

              {/* Contact Information */}
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <h4 className="font-bold text-lg text-white border-l-4 border-blue-500 pl-3">Contact Us</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <FaMapMarkerAlt className="w-4 h-4 text-green-400" />
                    <div>
                      <p className="text-white/90 text-sm">Serving All KZN Communities</p>
                      <p className="text-white/70 text-xs">280+ Affordable Locations</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaPhone className="w-4 h-4 text-blue-400" />
                    <div>
                      <p className="text-white/90 text-sm">031 327 9542</p>
                      <p className="text-white/70 text-xs">KZN Local Number</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaEnvelope className="w-4 h-4 text-orange-400" />
                    <div>
                      <p className="text-white/90 text-sm">care@firstcarekzn.co.za</p>
                      <p className="text-white/70 text-xs">Affordable Care Queries</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4">
                  <motion.button
                    className="bg-[#F06255] hover:bg-[#e05045] text-white py-2 rounded-xl font-semibold transition-all duration-300 text-sm"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Find Low-Cost Care
                  </motion.button>
                  <motion.button
                    className="bg-white/10 hover:bg-white/20 text-white py-2 rounded-xl font-semibold transition-all duration-300 text-sm"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Medical Aid Help
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Bottom Bar - FULL WIDTH */}
          <div className="w-full border-t border-white/20">
            <div className="w-full max-w-7xl mx-auto px-6 py-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/70">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-400" />
                  <span>Quality healthcare that won't break the bank</span>
                </div>

                <div className="flex flex-wrap justify-center gap-4 text-xs">
                  <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
                  <a href="/affordable-care" className="hover:text-white transition-colors">Low-Cost Options</a>
                  <a href="/medical-aid" className="hover:text-white transition-colors">Medical Aid</a>
                  <a href="/accessibility" className="hover:text-white transition-colors">Accessibility</a>
                </div>

                <div className="text-xs text-center">
                  © 2024 FirstCare KZN. <br className="sm:hidden" />Making healthcare affordable for all.
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}