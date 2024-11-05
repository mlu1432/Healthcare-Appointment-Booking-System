// index.js

/**
 * This is the main entry point for the FirstCare backend server.
 * It sets up an Express server, connects to MongoDB, and defines routes for handling appointment booking.
 * CORS is enabled to allow requests from the frontend, and the server listens on a specified port.
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const appointmentRoutes = require('./routes/appointmentRoutes');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware to parse JSON data
app.use(express.json());

// Middleware to enable CORS
app.use(cors());

// Default route for root URL
app.get('/', (req, res) => {
    res.send('Welcome to the FirstCare Backend Server');
});

// Use appointment routes with the base URL `/api/appointments`
app.use('/api/appointments', appointmentRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    })
    .catch(error => {
        console.error("Database connection error:", error);
    });