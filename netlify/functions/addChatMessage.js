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

    // Get user info for the message
    const userRef = db.collection('userStatus').doc(userId);
    const userDoc = await userRef.get();
    const userData = userDoc.exists ? userDoc.data() : { userName: `User#${userId.substring(userId.length-5)}` };

    // Add message with user ID and timestamp
    await db.collection('chatMessages').add({
      userId: userId,
      userName: userData.userName,
      message: message.trim(),
      timestamp: admin.firestore.FieldValue.serverTimestamp()
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