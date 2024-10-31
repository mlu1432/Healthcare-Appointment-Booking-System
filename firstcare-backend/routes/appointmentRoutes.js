// Appointment Routes (routes/appointments.js)
// Defines routes for handling API requests related to appointments
// Route: POST /api/appointments
// Description: Creates a new appointment in the database
const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');

// Access: Public
router.post('/', async (req, res) => {
  try {
    // Create a new appointment from request body data
    const newAppointment = new Appointment({
      date: req.body.date,
      time: req.body.time,
      reason: req.body.reason,
      category: req.body.category,
      doctor: req.body.doctor,
    });

    // Save the appointment to the database
    await newAppointment.save();
    
    // Send success response
    res.status(201).json({ message: 'Appointment booked successfully!' });
  } catch (error) {
    console.error('Error booking appointment:', error);
    res.status(500).json({ error: 'Failed to book appointment' });
  }
});

module.exports = router;