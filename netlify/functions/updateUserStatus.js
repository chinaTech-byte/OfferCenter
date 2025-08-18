const { db } = require('./utils/firebase');

exports.handler = async (event) => {
  try {
    const { userId } = JSON.parse(event.body);
    
    if (!userId) {
      return { statusCode: 400, body: JSON.stringify({ error: 'User ID required' }) };
    }
    
    // Update user status with timestamp
    await db.collection('userStatus').doc(userId).set({
      userId: userId,
      lastActive: new Date().toISOString()
    }, { merge: true });
    
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};