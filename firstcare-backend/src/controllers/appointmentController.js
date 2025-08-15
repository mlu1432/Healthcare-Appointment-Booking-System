// This module handles all logic for managing appointments, including creating, retrieving,
// updating, and deleting appointments. It uses Mongoose models to interact with the MongoDB 
// database. This module also integrates Nodemailer to send a confirmation email when a new 
//appointment is successfully booked.

const Appointment = require('../models/Appointment');
const User = require('../models/User');

// Create a new appointment
exports.createAppointment = async (req, res) => {
    try {
        console.log("Received request to create appointment:", req.body);

        // Ensure userId is present in request body
        if (!req.body.userId) {
            return res.status(400).json({ message: "Missing userId in request body" });
        }

        // Retrieve user information by userId
        const user = await User.findById(req.body.userId);
        if (!user) {
            console.log("User not found with userId:", req.body.userId);
            return res.status(404).json({ message: "User not found" });
        }

        // Create new appointment entry with request body
        const appointment = new Appointment(req.body);
        await appointment.save();

        console.log("Appointment saved successfully");

        // Send success response to the client
        return res.status(201).json({ message: "Appointment booked successfully!", appointment });
    } catch (error) {
        console.error("Error booking appointment:", error);
        return res.status(500).json({ message: "Failed to book appointment. Please try again.", error: error.message });
    }
};

// Retrieve all appointments
exports.getAllAppointments = async (req, res) => {
    try {
        console.log("Fetching all appointments");
        const appointments = await Appointment.find();
        return res.status(200).json(appointments);
    } catch (error) {
        console.error("Error fetching all appointments:", error);
        return res.status(500).json({ message: "Failed to retrieve appointments.", error: error.message });
    }
};

// Retrieve appointments by category
exports.getAppointmentsByCategory = async (req, res) => {
    try {
        console.log(`Fetching appointments for category: ${req.params.category}`);
        const appointments = await Appointment.find({ category: req.params.category });
        return res.status(200).json(appointments);
    } catch (error) {
        console.error("Error fetching appointments by category:", error);
        return res.status(500).json({ message: "Failed to retrieve appointments by category.", error: error.message });
    }
};

// Update an appointment by ID
exports.updateAppointment = async (req, res) => {
    try {
        console.log(`Updating appointment with ID: ${req.params.id}`);
        const updatedAppointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true });

        if (!updatedAppointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        return res.status(200).json({ message: "Appointment updated successfully!", appointment: updatedAppointment });
    } catch (error) {
        console.error("Error updating appointment:", error);
        return res.status(500).json({ message: "Failed to update appointment.", error: error.message });
    }
};

// Delete an appointment by ID
exports.deleteAppointment = async (req, res) => {
    try {
        console.log(`Deleting appointment with ID: ${req.params.id}`);
        const deletedAppointment = await Appointment.findByIdAndDelete(req.params.id);

        if (!deletedAppointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        return res.status(200).json({ message: "Appointment deleted successfully!" });
    } catch (error) {
        console.error("Error deleting appointment:", error);
        return res.status(500).json({ message: "Failed to delete appointment.", error: error.message });
    }
};