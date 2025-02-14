// index.js
/**
 * This is the main entry point for the FirstCare backend server.
 * It sets up an Express server, connects to MongoDB, and defines routes for handling user registration, appointment booking, etc.
 */

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const appointmentRoutes = require('./routes/appointmentRoutes');
const userRoutes = require('./routes/userRoutes');
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

// Use user routes with the base URL `/api/users`
app.use('/api/users', userRoutes);

// MongoDB Connection URI
const uri = process.env.MONGO_URI || "mongodb+srv://luxturesekwati:hXfeQTdUZo88DSgq@cluster0.0feej.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Connect to MongoDB using Mongoose
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000, // Increase server selection timeout
})
    .then(() => {
        console.log("Successfully connected to MongoDB!");
        // Start the Express server after a successful database connection
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Database connection error:", error);
        process.exit(1); // Exit if there is a connection error
    });