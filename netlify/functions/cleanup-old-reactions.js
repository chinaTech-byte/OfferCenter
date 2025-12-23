const admin = require('firebase-admin');

if (admin.apps.length === 0) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL
  });
}

const db = admin.firestore();

exports.handler = async (event, context) => {
  try {
    // Only clean up reactions for messages deleted more than 24 hours ago
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    // Find messages marked as deleted more than 24 hours ago
    const deletedMessages = await db.collection('messages')
      .where('deleted', '==', true)
      .where('deleteTimestamp', '<', twentyFourHoursAgo)
      .get();
    
    const cleanupPromises = [];
    
    deletedMessages.forEach(async (doc) => {
      // Delete all reactions for deleted messages (only old ones)
      const reactionsRef = doc.ref.collection('reactions');
      const reactions = await reactionsRef.get();
      
      reactions.forEach(reactionDoc => {
        cleanupPromises.push(reactionDoc.ref.delete());
      });
    });
    
    await Promise.all(cleanupPromises);
    
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: `Cleaned up reactions for ${deletedMessages.size} deleted messages`,
        deletedReactions: cleanupPromises.length
      })
    };
  } catch (error) {
    console.error('Error cleaning up reactions:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};