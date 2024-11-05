// routes/appointmentRoutes.js
const express = require('express');
const router = express.Router();
const {
    createAppointment,
    getAllAppointments,
    getAppointmentsByCategory,
    updateAppointment,
    deleteAppointment
} = require('../controllers/appointmentController');

// Define CRUD routes
router.post('/', createAppointment);
router.get('/', getAllAppointments); 
router.get('/category/:category', getAppointmentsByCategory); // Read by category
router.put('/:id', updateAppointment);
router.delete('/:id', deleteAppointment);

module.exports = router;