// Main entry file for the FirstCare backend server
// This sets up Express, connects to MongoDB, and defines the main routes for the API.

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();

// Import routes
const appointmentRoutes = require('./routes/appointments');

// Middleware to parse JSON requests
app.use(express.json());

// Connect to MongoDB using Mongoose
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Failed to connect to MongoDB:', err.message));

// Use appointment routes for the /api/appointments endpoint
app.use('/api/appointments', appointmentRoutes);

// Basic route to check if the server is running
app.get('/', (req, res) => {
  res.send('FirstCare Backend is running');
});

// Start server and listen on specified port
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});