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

    // Get user info
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'User not found' })
      };
    }
    
    const userData = userDoc.data();
    const userName = userData.username || `User#${userId.substring(userId.length-5)}`;

    // Add message with proper user info
    const messageRef = db.collection('chatMessages').doc();
    await messageRef.set({
      userId: userId,
      userName: userName,
      message: message.trim(),
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, messageId: messageRef.id })
    };
  } catch (error) {
    console.error('Chat message error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to send message' })
    };
  }
};