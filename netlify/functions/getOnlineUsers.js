const { db } = require('./utils/firebase');

exports.handler = async () => {
  try {
    const now = new Date();
    const fiveMinutesAgo = new Date(now - 5 * 60 * 1000).toISOString();
    
    // Get users active in chat in last 5 minutes
    const usersRef = db.collection('userStatus')
      .where('lastActive', '>', fiveMinutesAgo)
      .where('inChat', '==', true);
    
    const snapshot = await usersRef.get();
    
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        count: snapshot.size,
        users: snapshot.docs.map(doc => doc.data())
      })
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};