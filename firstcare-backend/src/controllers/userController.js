// User Controller (userController.js)
// Handles the logic for user registration, retrieval, updating, and deletion processes.
// Defines various controller functions that process incoming data and interact with the MongoDB database using the User model.

const User = require('../models/User');

// Register User Details
const registerUserDetails = async (req, res) => {
  console.log("Hit registerUserDetails endpoint"); // Debug log
  console.log("Request Body:", req.body); // Debug log

  try {
    const { fullName, phoneNumber, address, dateOfBirth, medicalHistory, allergies } = req.body;

    // Validate request body
    if (!fullName || !phoneNumber || !address || !dateOfBirth) {
      console.log("Missing required fields");
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    // Create a new user entry
    const newUser = new User({
      fullName,
      phoneNumber,
      address,
      dateOfBirth,
      medicalHistory,
      allergies,
    });

    // Save the user to the database
    await newUser.save();

    // Send success response
    console.log("User details saved successfully");
    return res.status(201).json({ message: "User details saved successfully", user: newUser });
  } catch (error) {
    console.error("Error saving user details:", error);
    return res.status(500).json({ message: "Failed to save user details. Please try again later." });
  }
};

// Get User Details by ID
const getUserDetailsById = async (req, res) => {
  console.log("Hit getUserDetailsById endpoint"); // Debug log
  console.log("Params ID:", req.params.id); // Debug log

  try {
    const userId = req.params.id;

    // Find user by ID
    const user = await User.findById(userId);

    // Check if user exists
    if (!user) {
      console.log("User not found with ID:", userId);
      return res.status(404).json({ message: "User not found" });
    }

    // Send user details
    return res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user details:", error);
    return res.status(500).json({ message: "Failed to retrieve user details. Please try again later." });
  }
};

// Update User Details by ID
const updateUserDetails = async (req, res) => {
  console.log("Hit updateUserDetails endpoint"); // Debug log
  console.log("Params ID:", req.params.id); // Debug log
  console.log("Request Body:", req.body); // Debug log

  try {
    const userId = req.params.id;
    const updateData = req.body;

    // Validate update data
    if (!updateData || Object.keys(updateData).length === 0) {
      console.log("No data provided for update");
      return res.status(400).json({ message: "No data provided for update" });
    }

    // Find user by ID and update
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true });

    // Check if user exists
    if (!updatedUser) {
      console.log("User not found with ID:", userId);
      return res.status(404).json({ message: "User not found" });
    }

    // Send success response with updated user details
    return res.status(200).json({ message: "User details updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Error updating user details:", error);
    return res.status(500).json({ message: "Failed to update user details. Please try again later." });
  }
};

// Delete User Details by ID
const deleteUserDetails = async (req, res) => {
  console.log("Hit deleteUserDetails endpoint"); // Debug log
  console.log("Params ID:", req.params.id); // Debug log

  try {
    const userId = req.params.id;

    // Find user by ID and delete
    const deletedUser = await User.findByIdAndDelete(userId);

    // Check if user exists
    if (!deletedUser) {
      console.log("User not found with ID:", userId);
      return res.status(404).json({ message: "User not found" });
    }

    // Send success response
    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user details:", error);
    return res.status(500).json({ message: "Failed to delete user details. Please try again later." });
  }
};

module.exports = {
  registerUserDetails,
  getUserDetailsById,
  updateUserDetails,
  deleteUserDetails,
};