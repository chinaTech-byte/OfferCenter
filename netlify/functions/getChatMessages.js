const { db } = require('./utils/firebase');

exports.handler = async () => {
  try {
    const messagesRef = db.collection('chatMessages')
      .orderBy('timestamp', 'desc')
      .limit(100);
    
    const snapshot = await messagesRef.get();
    const messages = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      // Convert Firestore timestamp to ISO string
      const timestamp = data.timestamp ? data.timestamp.toDate().toISOString() : new Date().toISOString();
      
      messages.push({
        id: doc.id,
        userId: data.userId,
        userName: data.userName,
        message: data.message,
        timestamp: timestamp
      });
    });
    
    // Return messages in chronological order (oldest first)
    return {
      statusCode: 200,
      body: JSON.stringify(messages.reverse())
    };
  } catch (error) {
    console.error('Get messages error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to load messages' })
    };
  }
};