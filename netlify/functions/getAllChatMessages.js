const { db } = require('./utils/firebase');

exports.handler = async () => {
  try {
    const messagesRef = db.collection('chatMessages').orderBy('timestamp', 'asc');
    const snapshot = await messagesRef.get();
    const messages = [];
    
    snapshot.forEach(doc => {
      messages.push(doc.data());
    });
    
    return {
      statusCode: 200,
      body: JSON.stringify(messages)
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};