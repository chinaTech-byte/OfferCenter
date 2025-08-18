const { db } = require('./utils/firebase');

exports.handler = async () => {
  try {
    const now = new Date();
    const fiveMinutesAgo = new Date(now - 5 * 60 * 1000).toISOString();
    
    // Get users active in last 5 minutes
    const usersRef = db.collection('userStatus')
      .where('lastActive', '>', fiveMinutesAgo);
    
    const snapshot = await usersRef.get();
    
    return {
      statusCode: 200,
      body: JSON.stringify({ count: snapshot.size })
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};