const { db } = require('./utils/firebase');

exports.handler = async (event) => {
  try {
    // Parse request body
    const { userId, message } = JSON.parse(event.body);
    
    // Validate required parameters
    if (!userId || !message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required parameters' })
      };
    }
    
    // Add message to Firestore
    const messageRef = db.collection('chatMessages').doc();
    await messageRef.set({
      sender: userId,
      message: message,
      timestamp: new Date().toISOString()
    });
    
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true,
        id: messageRef.id
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};