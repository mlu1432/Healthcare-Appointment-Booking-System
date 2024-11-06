// RegisterForm Component
// This component collects additional registration information after the user signs up or logs in.
// Users can fill out their full name, phone number, address, medical history, and any allergies they have.
// The information is then saved to the server, and the user is redirected to the booking page.

"use client"; // This is a client-side component

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useUser } from "@/contexts/UserContext";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function RegisterForm() {
  // State for form data and user feedback
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    address: "",
    dateOfBirth: "",
    medicalHistory: "",
    allergies: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const router = useRouter();
  const { user } = useUser(); // Access the user context to verify the user

  if (!user) {
    return (
      <div className="text-center mt-10">
        <p className="text-red-600">You must be logged in to complete the registration.</p>
      </div>
    );
  }

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const token = localStorage.getItem("authToken");

      // Save the additional registration data
      await axios.post("/api/register/details", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Notify the user of successful registration
      toast.success("Registration details saved successfully!");
      setSuccessMessage("Registration details saved successfully!");

      // Redirect to the book appointment page after success
      setTimeout(() => {
        router.push("/auth/bookregister/book");
      }, 2000);
    } catch (error) {
      // Notify the user of an error during registration
      toast.error("Failed to save registration details. Please try again.");
      setError("Failed to save registration details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md mt-10"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Complete Your Profile</h2>
        {error && <p className="text-red-600 text-center mb-4">{error}</p>}
        {successMessage && <p className="text-green-600 text-center mb-4">{successMessage}</p>}

        <label className="block text-gray-700 font-bold mb-2">Full Name</label>
        <input
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          className="w-full p-2 mb-4 border rounded"
          required
        />

        <label className="block text-gray-700 font-bold mb-2">Phone Number</label>
        <input
          type="tel"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleChange}
          className="w-full p-2 mb-4 border rounded"
          required
        />

        <label className="block text-gray-700 font-bold mb-2">Address</label>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleChange}
          className="w-full p-2 mb-4 border rounded"
          required
        />

        <label className="block text-gray-700 font-bold mb-2">Date of Birth</label>
        <input
          type="date"
          name="dateOfBirth"
          value={formData.dateOfBirth}
          onChange={handleChange}
          className="w-full p-2 mb-4 border rounded"
          required
        />

        <label className="block text-gray-700 font-bold mb-2">Medical History</label>
        <textarea
          name="medicalHistory"
          value={formData.medicalHistory}
          onChange={handleChange}
          className="w-full p-2 mb-4 border rounded"
          placeholder="Briefly describe your medical history"
        />

        <label className="block text-gray-700 font-bold mb-2">Allergies</label>
        <textarea
          name="allergies"
          value={formData.allergies}
          onChange={handleChange}
          className="w-full p-2 mb-4 border rounded"
          placeholder="List any allergies you have"
        />

        <button
          type="submit"
          className={`w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition ${loading ? 'cursor-not-allowed' : ''}`}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save & Proceed'}
        </button>
      </form>

      {/* Toaster Component for Notifications */}
      <ToastContainer />
    </>
  );
}