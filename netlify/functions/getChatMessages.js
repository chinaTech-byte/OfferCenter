const { db } = require('./utils/firebase');

exports.handler = async () => {
  try {
    const messagesRef = db.collection('chatMessages')
      .orderBy('timestamp', 'desc')
      .limit(50);
    
    const snapshot = await messagesRef.get();
    const messages = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      messages.push({
        id: doc.id,
        userId: data.userId,
        userName: data.userName,
        message: data.message,
        timestamp: data.timestamp.toDate().toISOString()
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
};ode: 500,
      body: JSON.stringify({ error: 'Failed to load messages' })
    };
  }
};