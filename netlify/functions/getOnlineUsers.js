const { db } = require('./utils/firebase');

exports.handler = async () => {
  try {
    const now = new Date();
    const twoMinutesAgo = new Date(now - 2 * 60 * 1000).toISOString();
    
    // Get users active in last 2 minutes
    const usersRef = db.collection('userStatus')
      .where('lastSeen', '>', twoMinutesAgo);
    
    const snapshot = await usersRef.get();
    const onlineUsers = [];
    
    snapshot.forEach(doc => {
      onlineUsers.push(doc.data());
    });
    
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        count: onlineUsers.length,
        users: onlineUsers
      })
    };
  } catch (error) {
    console.error('Get online users error:', error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};