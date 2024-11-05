// models/Appointment.js
const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    doctor: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);