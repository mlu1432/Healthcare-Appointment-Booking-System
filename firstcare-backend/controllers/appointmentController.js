// controllers/appointmentController.js
// Defines functions to create, read, update, or delete appointments.
const Appointment = require('../models/Appointment');

exports.createAppointment = async (req, res) => {
  try {
    const { date, time, reason, category, doctor } = req.body;
    const appointment = new Appointment({
      date,
      time,
      reason,
      category,
      doctor,
    });
    await appointment.save();
    res.status(201).json({ message: 'Appointment booked successfully!' });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ message: 'Failed to book appointment' });
  }
};