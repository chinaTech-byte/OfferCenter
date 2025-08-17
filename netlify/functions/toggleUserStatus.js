const { db } = require('./utils/firebase');

exports.handler = async (event) => {
  try {
    const { userId } = JSON.parse(event.body);
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return { statusCode: 404, body: JSON.stringify({ error: 'User not found' }) };
    }
    
    const currentStatus = userDoc.data().isActive;
    await userRef.update({ isActive: !currentStatus });
    
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, isActive: !currentStatus })
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};