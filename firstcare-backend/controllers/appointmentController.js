// controllers/appointmentController.js
const Appointment = require('../models/Appointment');

// Create a new appointment
exports.createAppointment = async (req, res) => {
    try {
        const appointment = new Appointment(req.body);
        await appointment.save();
        res.status(201).json({ message: "Appointment booked successfully!", appointment });
    } catch (error) {
        res.status(500).json({ message: "Failed to book appointment. Please try again.", error: error.message });
    }
};

// Retrieve all appointments
exports.getAllAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find();
        res.status(200).json(appointments);
    } catch (error) {
        res.status(500).json({ message: "Failed to retrieve appointments.", error: error.message });
    }
};

// Retrieve appointments by category
exports.getAppointmentsByCategory = async (req, res) => {
    try {
        const appointments = await Appointment.find({ category: req.params.category });
        res.status(200).json(appointments);
    } catch (error) {
        res.status(500).json({ message: "Failed to retrieve appointments by category.", error: error.message });
    }
};

// Update an appointment by ID
exports.updateAppointment = async (req, res) => {
    try {
        const updatedAppointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ message: "Appointment updated successfully!", appointment: updatedAppointment });
    } catch (error) {
        res.status(500).json({ message: "Failed to update appointment.", error: error.message });
    }
};

// Delete an appointment by ID
exports.deleteAppointment = async (req, res) => {
    try {
        await Appointment.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Appointment deleted successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete appointment.", error: error.message });
    }
};