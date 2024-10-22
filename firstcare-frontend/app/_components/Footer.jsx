// Footer component to display contact details, about section, and affiliate info

import React from "react";
import { FaTwitter, FaInstagram } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-[#F06255] py-10 text-white">
      <div className="container mx-auto grid md:grid-cols-3 gap-10">
        {/* About Us Section */}
        <div>
          <h2 className="font-bold text-lg">About Us</h2>
          <p className="text-sm mt-2">
            Healthcare Experts is a platform designed to simplify access to trusted healthcare professionals. We connect patients with a wide range of specialists, ensuring they can easily find, compare, and book appointments.
          </p>
        </div>

        {/* Medical Aid Section */}
        <div>
          <h2 className="font-bold text-lg">Medical Aid</h2>
          <ul className="text-sm mt-2">
            <li>Discovery</li>
            <li>Fedhealth</li>
            <li>Momentum</li>
            <li>Bonitas</li>
          </ul>
        </div>

        {/* Contact Us Section */}
        <div>
          <h2 className="font-bold text-lg">Contact Us</h2>
          <p className="text-sm mt-2">Customer Service</p>
          <p className="text-sm">Email: healthExperts.co.za</p>
          <p className="text-sm">Contact: 012 327 9542</p>
        </div>
      </div>

      {/* Footer Bottom Section */}
      <div className="container mx-auto mt-10 text-center">
        {/* Social Media Links */}
        <div className="flex justify-center space-x-4 mb-4">
          <a href="#" aria-label="Twitter" className="hover:text-gray-300">
            <FaTwitter size={24} />
          </a>
          <a href="#" aria-label="Instagram" className="hover:text-gray-300">
            <FaInstagram size={24} />
          </a>
        </div>

        {/* Footer Legal Text */}
        <p className="text-xs">
          © 2024 Healthcare Experts, Inc. | Experts | Privacy | Cookie Settings | Terms of Service
        </p>
        <p className="text-xs mt-2">
          Do Not Sell or Share My Personal Information | Consumer Health Data Privacy Policy
        </p>
      </div>
    </footer>
  );
}