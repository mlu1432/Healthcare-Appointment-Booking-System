// User.js
// Defines the User schema for storing user registration details in the MongoDB database.
// The schema includes fields such as fullName, phoneNumber, address, dateOfBirth, medicalHistory, and allergies.

const mongoose = require('mongoose');

// Define the schema for a user
const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  medicalHistory: {
    type: String,
    default: "",
  },
  allergies: {
    type: String,
    default: "",
  }
}, { timestamps: true });

// Export the model to be used in other parts of the application
module.exports = mongoose.model('User', userSchema);