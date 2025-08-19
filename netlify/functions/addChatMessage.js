const { db, admin } = require('./utils/firebase');

exports.handler = async (event) => {
  try {
    const { userId, message } = JSON.parse(event.body);
    
    if (!userId || !message || message.trim() === '') {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid message' })
      };
    }

    // Add message with user ID and timestamp
    await db.collection('chatMessages').add({
      userId: userId,
      message: message.trim(),
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      userName: `User#${userId.substring(0, 8)}` // Shortened user ID for display
    });
    
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to send message' })
    };
  }
};