/**
 * MongoDB Database Connection Module
 * 
 * @file src/config/db.js
 * @description Establishes and manages the connection to MongoDB using Mongoose
 * 
 * Responsibilities:
 * 1. Initialize connection to MongoDB
 * 2. Handle connection events
 * 3. Implement graceful shutdown
 * 4. Configure connection pooling
 * 
 * @module db
 * @requires mongoose
 */
import mongoose from 'mongoose';

/**
 * Connects to MongoDB and configures connection settings
 * 
 * @async
 * @function connectDB
 * @throws {Error} If initial connection fails
 * 
 * Configuration Options:
 * - useNewUrlParser: Modern MongoDB connection string parser
 * - useUnifiedTopology: New server discovery/monitoring engine
 * - serverSelectionTimeoutMS: Time to wait for server selection
 * - maxPoolSize: Maximum number of connections in pool
 * 
 * Event Listeners:
 * - connected: Successful connection
 * - error: Connection errors
 * - disconnected: Connection loss
 */
const connectDB = async () => {
	// Add validation for environment variable
	if (!process.env.MONGODB_URI) {
		throw new Error(
			'MONGODB_URI environment variable not set. ' +
			'Please add it to your .env file'
		);
	}
	
	console.log('Connecting to MongoDB with URI:', process.env.MONGODB_URI);

  try {
    // establish Mongodb connection
    await mongoose.connect(process.env.MONGODB_URI, {
	    serverSelectionTimeoutMS: 5000,
	    maxPoolSize: 10
    });

    console.log('MongoDB connected successfully');

    // connection event listener
    mongoose.connection.on('connected', () => {
      console.log('Mongoose connected to DB');
    });

    mongoose.connection.on('error', (err) => {
      console.error('Mongoose connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('Mongoose disconnected from DB');
    });
  } catch (error) {
    console.error('MongoDB initial connection error:', error.message);
    process.exit(1);
  }
};
 export default connectDB;
