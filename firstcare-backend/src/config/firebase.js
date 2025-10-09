/*
 * Firebase Admin SDK Initialization
 *
 * @file src/config/firebase.js
 * @description
 * This module sets up and initializes the Firebase Admin SDK using
 * a service account JSON file. It provides secure access to Firebase
 * services such as Authentication, Firestore, and Realtime Database
 * from the backend server.
 *
 * Responsibilities:
 * 1. Resolve the service account JSON file path
 * 2. Validate that the file exists
 * 3. Parse the credentials from JSON
 * 4. Initialize Firebase Admin SDK with credentials
 * 5. Export the initialized Firebase app
 *
 * Security Notes:
 * - The service account JSON file should **never** be committed to Git.
 * - Use `.env` to define FIREBASE_SERVICE_ACCOUNT_PATH pointing
 *   to the secure location of the service account file.
 * - Only grant the minimum required permissions to the service account.
 * @requires firebase-admin
 * @requires path
 * @requires fs
 * @requires url
 */
import admin from 'firebase-admin';
import fs from 'fs';

// Validate environment variable
if (!process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    throw new Error(
        'FIREBASE_SERVICE_ACCOUNT_PATH environment variable not set.' +
        '\nPlease add to your .env file with the absolute path to your service account file'
    );
}

// Validate file existence
if (!fs.existsSync(process.env.FIREBASE_SERVICE_ACCOUNT_PATH)) {
    throw new Error(
        `Firebase service account file not found at: ${process.env.FIREBASE_SERVICE_ACCOUNT_PATH}\n` +
        'Verify:\n' +
        '1. File exists at this location\n' +
        '2. Filename matches exactly\n' +
        '3. .env variable points to correct path'
    );
}

// Parse service account JSON
const serviceAccount = JSON.parse(fs.readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT_PATH, 'utf8'));

// Initialize Firebase Admin SDK
const firebaseApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
});

console.log(`Firebase Admin initialized for project: ${serviceAccount.project_id}`);

export default firebaseApp;