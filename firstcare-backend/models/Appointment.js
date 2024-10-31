// Appointment Model (models/Appointment.js)
// Defines the Appointment schema for MongoDB and exports the model

const mongoose = require('mongoose');

// Define Appointment schema with fields for date, time, reason, category, and doctor
const appointmentSchema = new mongoose.Schema({
  
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  doctor: {
    type: String,
    required: true,
  },
}, { timestamps: true });

// Create Appointment model from schema
const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;