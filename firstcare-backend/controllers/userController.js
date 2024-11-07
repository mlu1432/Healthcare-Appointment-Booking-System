// User Routes (userRoutes.js)
// Defines the routing for user-related endpoints.
// It handles various endpoints including registration, fetching user details, updating, and deleting user information.

const express = require('express');
const router = express.Router();
const {
  registerUserDetails,
  getUserDetailsById,
  updateUserDetails,
  deleteUserDetails
} = require('../controllers/userController');

// Route to handle user registration details
router.post('/register/details', registerUserDetails);

// Route to get user details by ID
router.get('/:id', getUserDetailsById);

// Route to update user details by ID
router.put('/:id', updateUserDetails);

// Route to delete user details by ID
router.delete('/:id', deleteUserDetails);

module.exports = router;