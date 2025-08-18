const { db } = require('./utils/firebase');

exports.handler = async () => {
  try {
    const now = new Date();
    const oneHourAgo = new Date(now - 60 * 60 * 1000);
    
    const messagesRef = db.collection('chatMessages')
      .where('timestamp', '>', oneHourAgo)
      .orderBy('timestamp', 'desc')
      .limit(100);
    
    const snapshot = await messagesRef.get();
    const messages = [];
    
    snapshot.forEach(doc => {
      messages.push({
        id: doc.id,
        ...doc.data(),
        // Convert Firestore timestamp to ISO string
        timestamp: doc.data().timestamp.toDate().toISOString()
      });
    });
    
    // Return messages in chronological order
    return {
      statusCode: 200,
      body: JSON.stringify(messages.reverse())
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to load messages' })
    };
  }
};