const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
let app;
try {
  if (!admin.apps.length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    
    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL
    });
  } else {
    app = admin.app();
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
  throw error;
}

const db = admin.firestore();

module.exports = { admin, db };