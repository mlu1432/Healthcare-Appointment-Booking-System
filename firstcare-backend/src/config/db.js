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
 * 5. Database index validation and maintenance
 * 
 * @module db
 * @requires mongoose
 */
import mongoose from 'mongoose';

/**
 * Validates database indexes and identifies potential issues
 * 
 * @async
 * @function validateIndexes
 * @param {Object} db - MongoDB database instance
 * @returns {Promise<void>}
 */
const validateIndexes = async (db) => {
    try {
        if (process.env.NODE_ENV === 'development') {
            console.log('Validating database indexes...');

            const usersCollection = db.collection('users');
            const indexes = await usersCollection.getIndexes();
            const indexNames = Object.keys(indexes);

            console.log('Current user indexes:', indexNames);

            // Check for common orphaned indexes
            const orphanedIndexes = [];
            if (indexes.uid_1) {
                orphanedIndexes.push({
                    name: 'uid_1',
                    issue: 'Orphaned index - no uid field in current schema',
                    recommendation: 'Consider removing with: db.users.dropIndex("uid_1")'
                });
            }

            // Check for missing required indexes
            const requiredIndexes = ['email_1', 'googleId_1'];
            const missingIndexes = requiredIndexes.filter(index => !indexes[index]);

            // Validate index configurations
            const misconfiguredIndexes = [];
            if (indexes.googleId_1 && !indexes.googleId_1.sparse) {
                misconfiguredIndexes.push({
                    name: 'googleId_1',
                    issue: 'Missing sparse property',
                    recommendation: 'Should be sparse unique index for OAuth users'
                });
            }

            // Report findings
            if (orphanedIndexes.length > 0) {
                console.warn('ORPHANED INDEXES DETECTED:');
                orphanedIndexes.forEach(index => {
                    console.warn(`  - ${index.name}: ${index.issue}`);
                    console.warn(`    ${index.recommendation}`);
                });
            }

            if (missingIndexes.length > 0) {
                console.warn('MISSING RECOMMENDED INDEXES:');
                missingIndexes.forEach(index => {
                    console.warn(`  - ${index}`);
                });
            }

            if (misconfiguredIndexes.length > 0) {
                console.warn('MISCONFIGURED INDEXES:');
                misconfiguredIndexes.forEach(index => {
                    console.warn(`  - ${index.name}: ${index.issue}`);
                    console.warn(`    ${index.recommendation}`);
                });
            }

            if (orphanedIndexes.length === 0 && missingIndexes.length === 0 && misconfiguredIndexes.length === 0) {
                console.log('All indexes validated successfully');
            }
        }
    } catch (error) {
        console.warn('Index validation warning:', error.message);
        // Non-critical - don't break connection for validation errors
    }
};

/**
 * Performs database health check and maintenance tasks
 * 
 * @async
 * @function performMaintenance
 * @param {Object} db - MongoDB database instance
 * @returns {Promise<void>}
 */
const performMaintenance = async (db) => {
    try {
        if (process.env.NODE_ENV === 'development') {
            console.log('Performing database maintenance checks...');

            const usersCollection = db.collection('users');

            // Check for documents with potential data issues
            const usersWithNullGoogleId = await usersCollection.countDocuments({
                provider: 'google',
                googleId: null
            });

            if (usersWithNullGoogleId > 0) {
                console.warn(`Found ${usersWithNullGoogleId} Google OAuth users with null googleId`);
            }

            // Check for duplicate email issues
            const duplicateEmails = await usersCollection.aggregate([
                {
                    $group: {
                        _id: '$email',
                        count: { $sum: 1 }
                    }
                },
                {

                    $match: {
                        count: { $gt: 1 }
                    }
                }
            ]).toArray();

            if (duplicateEmails.length > 0) {
                console.warn(`Found ${duplicateEmails.length} potential duplicate emails`);
            }

            console.log('Database maintenance checks completed');
        }
    } catch (error) {
        console.warn('Database maintenance warning:', error.message);
        // Non-critical - don't break connection for maintenance issues
    }
};

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
        console.error('MONGODB_URI environment variable not set');
        process.exit(1);
    }

    // Mask URI for security in logs (hide password)
    const maskedURI = process.env.MONGODB_URI.replace(
        /mongodb\+srv:\/\/([^:]+):([^@]+)@/,
        'mongodb+srv://$1:****@'
    );
    console.log('Connecting to MongoDB:', maskedURI);

    try {
        // Enhanced connection options
        const options = {
            serverSelectionTimeoutMS: 10000, // Increased timeout
            socketTimeoutMS: 45000, // Socket timeout
            maxPoolSize: 10,
            retryWrites: true,
            w: 'majority'
        };

        await mongoose.connect(process.env.MONGODB_URI, options);

        console.log('MongoDB connected successfully');
        console.log(`Database: ${mongoose.connection.db?.databaseName}`);
        console.log(`Host: ${mongoose.connection.host}`);

        // Perform database maintenance and validation
        if (mongoose.connection.db) {
            await validateIndexes(mongoose.connection.db);
            await performMaintenance(mongoose.connection.db);
        }

    } catch (error) {
        console.error('MongoDB connection failed:', error.message);

        // Provide more specific error messages
        if (error.name === 'MongoServerError') {
            switch (error.code) {
                case 18:
                    console.error('Authentication failed - Check username/password');
                    break;
                case 8000:
                    console.error('Authentication failed - Invalid credentials');
                    break;
                default:
                    console.error('MongoDB server error:', error.code);
            }
        } else if (error.name === 'MongooseServerSelectionError') {
            console.error('Network error - Check internet connection and IP whitelist');
        }

        process.exit(1);
    }
};

// Connection event listeners
mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to DB');
});

mongoose.connection.on('error', (err) => {
    console.error('Mongoose connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected from DB');
});

// Graceful shutdown
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('MongoDB connection closed through app termination');
    process.exit(0);
});

export default connectDB;