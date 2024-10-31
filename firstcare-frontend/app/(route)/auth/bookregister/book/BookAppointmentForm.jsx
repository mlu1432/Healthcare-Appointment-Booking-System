// firstcare-frontend/app/(route)/book-appointment/BookAppointmentForm.jsx
// Book Appointment form component with background image and dynamic doctor selection by category

import React, { useState } from 'react';
import axios from 'axios';

// Organized doctor data by category
const doctorOptions = { 
  "Cardiologist": [
    { name: "Dr. LB Osrin", title: "Cardiologist", clinicName: "Cardiology Clinic" },
    { name: "Dr. Mpe M.T Administrators", title: "Cardiologist", clinicName: "Mediclinic Heart Hospital" },
  ],
  "Dentist": [
    { name: "Dr. Hassan Kajee", title: "Dentist", clinicName: "Hayfields Dental Centre" },
    { name: "Dr. O.P. Moloi and Dr. M.M Marishane", title: "Dentist", clinicName: "SmileLab Dental Centre Pretoria" },
  ],
  "General Practitioner": [
    { name: "Dr. I.G.T. Mogolane", title: "General Practitioner", clinicName: "Pretorius and Prinsloo Streets Clinic" },
    { name: "Dr. M. Tambwe", title: "General Practitioner", clinicName: "E&T Building Clinic" },
  ],
  "Obstetrician-Gynecologist": [
    { name: "Dr. Siakam L Inc", title: "Obstetrician-Gynecologist", clinicName: "Mediclinic, Muelmed Hospital" },
    { name: "Dr. Dries Potgieter", title: "Obstetrician-Gynecologist", clinicName: "Mediclinic Kloof Hospital" },
  ],
  "Ophthalmologist": [
    { name: "Dr. Clayton Erasmus", title: "Ophthalmologist", clinicName: "Pretoria Eye Institute" },
    { name: "Dr. Pieter Odendaal", title: "Ophthalmologist", clinicName: "Eye Care Center" },
  ],
  "Psychologist": [
    { name: "Antoinette Nicolaou", title: "Clinical Psychologist", clinicName: "Psychologist Centre" },
    { name: "Dr. Tienie Maritz", title: "Psychologist", clinicName: "Tienie Maritz Psychologists" },
  ],
};

export default function BookAppointmentForm() {
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    reason: '',
    category: '',
    doctor: '',
  });

  const [responseMessage, setResponseMessage] = useState('');

  // Update form data when inputs change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
      ...(e.target.name === 'category' && { doctor: '' })
    });
  };

  // Submit form data
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/api/appointments', formData);
      setResponseMessage(response.data.message);
    } catch (error) {
      setResponseMessage('Failed to book appointment. Please try again.');
      console.error("Error booking appointment:", error);
    }
  };

  return (
    <div 
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage: `url('/stethoscope.jpg')`,
      }}
    >
      <div className="absolute inset-0 bg-black opacity-50"></div> {/* Dark overlay for readability */}

      <form 
        onSubmit={handleSubmit} 
        className="relative z-10 max-w-md w-full bg-white p-8 rounded-lg shadow-lg"
      >
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Book an Appointment</h2>

        {/* Response Message Display */}
        {responseMessage && <p className="text-center mb-4">{responseMessage}</p>}

        {/* Date and Time Fields */}
        <label className="block text-gray-700 font-bold mb-2">
          Date
          <input 
            type="date" 
            name="date" 
            value={formData.date} 
            onChange={handleChange} 
            className="w-full p-2 border rounded mt-1" 
            required 
          />
        </label>

        <label className="block text-gray-700 font-bold mb-2">
          Time
          <input 
            type="time" 
            name="time" 
            value={formData.time} 
            onChange={handleChange} 
            className="w-full p-2 border rounded mt-1" 
            required 
          />
        </label>

        {/* Reason for Appointment */}
        <label className="block text-gray-700 font-bold mb-2">
          Reason for Appointment
          <textarea 
            name="reason" 
            value={formData.reason} 
            onChange={handleChange} 
            className="w-full p-2 border rounded mt-1" 
            placeholder="Briefly describe the reason for the appointment"
            required 
          />
        </label>

        {/* Category Selection */}
        <label className="block text-gray-700 font-bold mb-2">
          Category
          <select 
            name="category" 
            value={formData.category} 
            onChange={handleChange} 
            className="w-full p-2 border rounded mt-1" 
            required 
          >
            <option value="">Select a Category</option>
            {Object.keys(doctorOptions).map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </label>

        {/* Doctor Selection */}
        <label className="block text-gray-700 font-bold mb-2">
          Doctor
          <select 
            name="doctor" 
            value={formData.doctor} 
            onChange={handleChange} 
            className="w-full p-2 border rounded mt-1" 
            required 
            disabled={!formData.category}
          >
            <option value="">Select a Doctor</option>
            {formData.category &&
              doctorOptions[formData.category].map((doctor) => (
                <option key={doctor.name} value={doctor.name}>
                  {doctor.name} - {doctor.clinicName}
                </option>
              ))}
          </select>
        </label>

        <button type="submit" className="w-full bg-blue-500 text-white font-bold py-2 mt-4 rounded hover:bg-blue-600">
          Submit
        </button>
      </form>
    </div>
  );
}