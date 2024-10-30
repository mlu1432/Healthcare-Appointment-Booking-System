// firstcare-frontend/app/(route)/book-appointment/BookAppointmentForm.jsx
// Book Appointment form component with background image

import React, { useState } from 'react';

export default function BookAppointmentForm() {
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    reason: '',
    doctor: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Appointment Data:", formData); // Placeholder for API call to backend
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

        {/* Doctor Selection */}
        <label className="block text-gray-700 font-bold mb-2">
          Doctor
          <select 
            name="doctor" 
            value={formData.doctor} 
            onChange={handleChange} 
            className="w-full p-2 border rounded mt-1" 
            required 
          >
            <option value="">Select a Doctor</option>
            <option value="Dr. A">Dr. A</option>
            <option value="Dr. B">Dr. B</option>
            <option value="Dr. C">Dr. C</option>
          </select>
        </label>

        <button type="submit" className="w-full bg-blue-500 text-white font-bold py-2 mt-4 rounded hover:bg-blue-600">
          Submit
        </button>
      </form>
    </div>
  );
}