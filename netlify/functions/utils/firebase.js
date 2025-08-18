const admin = require('firebase-admin');

// Initialize Firebase
if (!admin.apps.length) {
  try {
    // Check if service account exists
    if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is missing');
    }

    // Parse service account
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL
    });
  } catch (error) {
    console.error('🔥 Firebase initialization error:', error);
    throw new Error('Firebase initialization failed: ' + error.message);
  }
}

const db = admin.firestore();

module.exports = { admin, db };
