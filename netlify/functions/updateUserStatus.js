const { db } = require('./utils/firebase');

exports.handler = async (event) => {
  try {
    const { userId, inChat } = JSON.parse(event.body);
    
    if (!userId) {
      return { statusCode: 400, body: JSON.stringify({ error: 'User ID required' }) };
    }
    
    // Update user status with timestamp and chat status
    await db.collection('userStatus').doc(userId).set({
      userId: userId,
      lastActive: new Date().toISOString(),
      inChat: inChat || false
    }, { merge: true });
    
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};