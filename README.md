## FirstCare - Healthcare Appointment Booking System

- FirstCare is a comprehensive healthcare appointment booking system designed to connect patients with various healthcare professionals. This project comprises a frontend and backend setup, focusing on user experience and efficient data handling. It provides users the capability to browse healthcare specialists, view their details, and book appointments directly through an integrated booking form.

# Table of Contents

- Project Structure

- Setup & Installation

- Environment Variables

- Backend Structure & API

- Frontend Structure

- Running the Application

- Key Features


## Project Structure

# Backend: firstcare-backend

- Configuration

- config/db.js: Database connection configuration, handles MongoDB connection.

- .env: Contains environment variables for sensitive data, like database URI and server port.

- Controllers

- controllers/appointmentController.js: Handles business logic for appointment creation, updates, deletion, and retrieval.

- controllers/userController.js: Handles business logic for user registration, retrieval, updating, and deletion.

- Models

- models/Appointment.js: Mongoose schema for the Appointment collection in MongoDB.

- models/User.js: Mongoose schema for the User collection, defining user registration details.

- Routes

- routes/appointmentRoutes.js: Defines routes for appointment-related API endpoints, such as booking and fetching appointments.

- routes/userRoutes.js: Defines routes for user-related API endpoints, such as user registration, retrieval, updating, and deletion.

- Root Files

- index.js: Initializes the Express server and connects to the MongoDB database.

- package.json: Lists backend dependencies and scripts.

# Frontend: firstcare-frontend

- App Components

- _components: Contains core UI components like CategorySearch, DoctorList, Footer, Header, Hero, and Sidebar.

- _utils/GlobalApi.js: Manages API requests to the backend.

- Routes

- (route)/auth: Contains authentication-related pages.

- (route)/booking: Displays the booking form.

- (route)/category: Lists healthcare categories, each with specific subcategories (e.g., gp-doctors, dentists).

- (route)/hero: Handles main landing page content.

- (route)/search: Manages search functionality for specialists.

- 404.js: Custom 404 page.

# UI Components

- components/ui: Reusable UI components like Button, Input, Separator, Sheet, Sidebar, Skeleton, and Tooltip.

- Public Assets

- public/: Stores all static assets (e.g., images, icons).

- Configuration Files

- .env.local: Local environment variables for frontend.

- jsconfig.json: Configures path aliases for easier imports.

- next.config.mjs: Next.js configuration file.

- tailwind.config.js and postcss.config.js: Tailwind and PostCSS configurations.

## Setup & Installation

- Prerequisites

- Node.js (v18.20.4 recommended)

- MongoDB (for local database setup)

## Installation

# Clone the Repository

- git clone <repository-url>
- cd FirstCare-Healthcare-Appointment-Booking-System

# Install Backend Dependencies

- cd firstcare-backend
- npm install

- Install Frontend Dependencies

- cd ../firstcare-frontend
- npm install

## Environment Variables

- Create .env files in both firstcare-backend and firstcare-frontend directories for storing sensitive information.

- Backend (firstcare-backend/.env)

- DB_URI=mongodb://localhost:27017/firstcare
PORT=3001

- Frontend (firstcare-frontend/.env.local)

- NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
- NEXT_PUBLIC_API_KEY=your_api_key_here

## Backend Structure & API

# firstcare-backend

- The backend is built with Node.js and Express.js, and it connects to a MongoDB database. Below are the primary components and their functions:

- Database (db.js): Establishes a connection to MongoDB using Mongoose.

-Appointment Controller: Defines logic for appointment operations, including createAppointment, getAppointments, updateAppointment, and deleteAppointment.

-Appointment Model: Defines Mongoose schema for appointments.

-Appointment Routes: Contains routes for appointments and links the controller functions.

-User Controller: Defines logic for user registration operations, including registerUserDetails, getUserDetailsById, updateUserDetails, and deleteUserDetails.

-User Routes: Contains routes for user registration and links to the controller functions.

## API Endpoints

# Appointment API Endpoints

- POST /api/appointments: Creates a new appointment.

- GET /api/appointments: Retrieves all appointments.

- GET /api/appointments/: Retrieves a specific appointment by ID.

- PUT /api/appointments/: Updates an appointment by ID.

- DELETE /api/appointments/: Deletes an appointment by ID.

# User API Endpoints

- POST /api/users/register/details: Registers a new user by saving the full name, phone number, address, date of birth, medical history, and allergies.

- GET /api/users/: Retrieves user details by ID.

- PUT /api/users/: Updates user details by ID.

- DELETE /api/users/: Deletes a user by ID.

- Running the Application

- Run the Backend

- cd firstcare-backend
- npm start

- Run the Frontend

- cd ../firstcare-frontend
- npm run dev

- The frontend will be running on http://localhost:3000 and the backend on http://localhost:3001.

## Key Features

- User registration, login, and profile management.

- Browse doctors by category and book appointments.

- Integrated booking form for easy healthcare access.

- Simple, user-friendly UI with clear navigation.