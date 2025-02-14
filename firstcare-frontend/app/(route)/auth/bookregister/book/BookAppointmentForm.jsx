// firstcare-frontend/app/(route)/book-appointment/BookAppointmentForm.jsx
// Book an appointment by selecting doctor category and available doctors
"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useUser } from "@/contexts/UserContext";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

const doctorOptions = {
  Cardiologist: [
    { name: "Dr. LB Osrin", title: "Cardiologist", clinicName: "Cardiology Clinic" },
    { name: "Dr. Mpe M.T Administrators", title: "Cardiologist", clinicName: "Mediclinic Heart Hospital" },
  ],
  Dentist: [
    { name: "Dr. Hassan Kajee", title: "Dentist", clinicName: "Hayfields Dental Centre" },
    { name: "Dr. O.P. Moloi and Dr. M.M Marishane", title: "SmileLab Dental Centre Pretoria" },
  ],
  "General Practitioner": [
    { name: "Dr. I.G.T. Mogolane", title: "General Practitioner", clinicName: "Pretorius and Prinsloo Streets Clinic" },
    { name: "Dr. M. Tambwe", title: "General Practitioner", clinicName: "E&T Building Clinic" },
  ],
  "Obstetrician-Gynecologist": [
    { name: "Dr. Siakam L Inc", title: "Obstetrician-Gynecologist", clinicName: "Mediclinic, Muelmed Hospital" },
    { name: "Dr. Dries Potgieter", title: "Obstetrician-Gynecologist", clinicName: "Mediclinic Kloof Hospital" },
  ],
  Ophthalmologist: [
    { name: "Dr. Clayton Erasmus", title: "Ophthalmologist", clinicName: "Pretoria Eye Institute" },
    { name: "Dr. Pieter Odendaal", title: "Ophthalmologist", clinicName: "Eye Care Center" },
  ],
  Psychologist: [
    { name: "Antoinette Nicolaou", title: "Clinical Psychologist", clinicName: "Psychologist Centre" },
    { name: "Dr. Tienie Maritz", title: "Psychologist", clinicName: "Tienie Maritz Psychologists" },
  ],
};

export default function BookAppointmentForm() {
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    reason: "",
    category: "",
    doctor: "",
    userId: "",
  });
  const [availableDates, setAvailableDates] = useState([]);
  const { toast } = useToast();
  const [responseMessage, setResponseMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useUser();

  // Fetch available dates from the backend
  useEffect(() => {
    const fetchAvailableDates = async () => {
      try {
        const response = await axios.get("/api/appointments/availability");
        setAvailableDates(response.data);
      } catch (error) {
        console.error("Error fetching available dates:", error);
        toast({ title: "Error", description: "Failed to fetch available dates.", variant: "destructive" });
      }
    };

    fetchAvailableDates();
  }, []);

  // Add userId to form data if user is logged in
  useEffect(() => {
    if (user) {
      setFormData((prevData) => ({
        ...prevData,
        userId: user.id,
      }));
    }
  }, [user]);

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
      ...(e.target.name === "category" && { doctor: "" }),
    });
  };

  // Handle date selection
  const handleDateChange = (selectedDate) => {
    const today = new Date();
    if (selectedDate < today) {
      toast({ title: "Error", description: "Cannot select a past date.", variant: "destructive" });
      return;
    }
    setFormData({ ...formData, date: selectedDate.toISOString().split("T")[0] });
    toast({ title: "Date Selected", description: `You selected ${selectedDate.toDateString()}`, variant: "success" });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponseMessage("");

    try {
      const response = await axios.post("/api/appointments", formData);

      if (response.status === 201) {
        toast({ title: "Success", description: "Appointment booked successfully.", variant: "success" });
        setResponseMessage("Appointment booked successfully.");
      } else {
        toast({ title: "Error", description: "Failed to book appointment.", variant: "destructive" });
        setResponseMessage("Failed to book appointment. Please try again.");
      }
    } catch (error) {
      console.error("Error booking appointment:", error);
      toast({ title: "Error", description: "Failed to book appointment.", variant: "destructive" });
      setResponseMessage("Error occurred while booking the appointment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Book an Appointment</h2>

      {/* Calendar for Date Selection */}
      <label className="block text-gray-700 text-sm font-bold mb-2">Select Date</label>
      <Calendar
        selected={new Date(formData.date)}
        onChange={handleDateChange}
        disabled={(date) => !availableDates.includes(date.toISOString().split("T")[0])}
      />

      <label className="block text-gray-700 font-bold mb-2 mt-4">
        Time
        <input
          type="time"
          name="time"
          value={formData.time}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-md p-2"
        />
      </label>

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
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </label>

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

      <Button
        type="submit"
        className={`w-full mt-4 ${loading ? "cursor-not-allowed opacity-50" : ""}`}
        disabled={loading}
      >
        {loading ? "Booking..." : "Book Appointment"}
      </Button>
    </form>
  );
}