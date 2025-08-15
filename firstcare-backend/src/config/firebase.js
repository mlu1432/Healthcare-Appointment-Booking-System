/**
 * 
 * 
 * 
 */
import admin from 'firebase-admin';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// get current module path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirnmae(__filename);

// resolve service account path
const serviceAccountPath = path.resolve(
    __dirname,
    proccess.env.FIREBASE_SERVICE_ACCOUNT_PATH
);

// CHECK IF THE FILE EXISTS
if (!fs.existSync(serviceAccountPath)) {
    throw new Error('Firebase service account file not found at: ${serviceAccountPath}'); 
}

//it intialize the firebase
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

const firebaseApp = admin.intializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'http://${serviceAccount.project_id}.firebaseio.com'
});

console.log('Firebase Admin intialized for project: ${serviceAccount.project_id}');

export default firebaseApp;