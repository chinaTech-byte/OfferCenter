const admin = require('firebase-admin');

if (admin.apps.length === 0) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL
  });
}

const db = admin.firestore();

// This function should be set up as a scheduled function in Netlify
exports.handler = async (event, context) => {
  try {
    // Clean up users who haven't been active in the last 2 minutes
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
    const inactiveUsers = await db.collection('onlineUsers')
      .where('lastSeen', '<', twoMinutesAgo)
      .get();
    
    const deletePromises = [];
    inactiveUsers.forEach(doc => {
      deletePromises.push(doc.ref.delete());
    });
    
    await Promise.all(deletePromises);
    
    return {
      statusCode: 200,
      body: JSON.stringify({ message: `Cleaned up ${deletePromises.length} inactive users` })
    };
  } catch (error) {
    console.error('Error cleaning up online users:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};