import React from "react";
import { FaTwitter, FaInstagram } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="relative bg-[#F06255] py-20 text-white overflow-hidden">
      {/* Stethoscope Background */}
      <div
        className="absolute top-[30%] left-[50%] w-[690px] h-[1058px] opacity-[0.19] -translate-x-1/2"
        style={{
          background: "transparent url('/stethoscope.jpg') 0% 0% no-repeat padding-box",
        }}
      ></div>

      {/* Main Content Container */}
      <div className="container mx-auto px-10 rounded-[22px] bg-white border border-[#E8DBDB] opacity-90 shadow-md p-10 w-[1214px]">
        {/* Commitment Message Section */}
        <div className="text-center mb-10">
          <p className="text-lg font-semibold text-[#003E65]">
            "We are committed to providing trusted healthcare services, making it easy for you to connect with healthcare professionals and book appointments."
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-10 text-black">
          {/* About Us Section */}
          <div>
            <h2 className="font-bold text-2xl underline mb-4 text-[#003E65]">About Us</h2>
            <p className="text-sm text-[#222]">
              <span className="font-bold text-[#F37F75]">Healthcare Experts</span> is a platform designed to simplify access to trusted healthcare professionals. We connect patients with a wide range of specialists, ensuring they can easily find, compare, and book appointments. Our mission is to provide accessible, secure, and convenient healthcare services tailored to individual needs, making it easier for everyone to receive the expert care they deserve, when they need it most.
            </p>
          </div>

          {/* Medical Aid Section */}
          <div>
            <h2 className="font-bold text-2xl underline mb-4 text-[#003E65]">Medical Aid</h2>
            <ul className="text-sm mt-2">
              <li className="text-[#012944] mb-2 font-semibold">Affiliated with:</li>
              <li className="text-[#012944] mb-2">Discovery</li>
              <li className="text-[#012944] mb-2">Fedhealth</li>
              <li className="text-[#012944] mb-2">Momentum</li>
              <li className="text-[#012944]">Bonitas</li>
            </ul>
          </div>

          {/* Contact Us Section */}
          <div>
            <h2 className="font-bold text-2xl underline mb-4 text-[#003E65]">Contact Us</h2>
            <p className="text-lg font-semibold text-[#F37F75]">Customer Service</p>
            <p className="text-sm mt-2 text-[#012944]">
              Email: healthExperts.co.za <br />
              Contact: 012 327 9542
            </p>
          </div>
        </div>
      </div>

      {/* Logo and Social Media Links */}
      <div className="container mx-auto mt-10 text-center">
        {/* Logo Section */}
        <div className="flex justify-center mb-4">
          <img
            src="/logoipsum-298.svg"
            alt="Healthcare Experts Logo"
            className="w-[55px] h-[55px] border border-[#707070]"
          />
        </div>

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