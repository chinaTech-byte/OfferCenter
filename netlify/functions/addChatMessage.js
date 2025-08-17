const { db } = require('./utils/firebase');

exports.handler = async (event) => {
  try {
    const { userId, message } = JSON.parse(event.body);
    
    // Add message to Firestore
    const messageRef = db.collection('chatMessages').doc();
    await messageRef.set({
      sender: userId,
      message: message,
      timestamp: new Date().toISOString()
    });
    
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};