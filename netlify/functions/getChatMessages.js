const { db } = require('./utils/firebase');

exports.handler = async () => {
  try {
    // Get all messages ordered by timestamp
    const messagesRef = db.collection('chatMessages').orderBy('timestamp', 'asc');
    const snapshot = await messagesRef.get();
    const messages = [];
    
    snapshot.forEach(doc => {
      messages.push({ 
        id: doc.id, 
        ...doc.data() 
      });
    });
    
    return {
      statusCode: 200,
      body: JSON.stringify(messages)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};