// index.js
const express = require('express');
const mongoose = require('mongoose');
const appointmentRoutes = require('./routes/appointmentRoutes');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware to parse JSON data
app.use(express.json());

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