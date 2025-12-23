const { db } = require('./firebase.js');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS, GET'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod === 'GET') {
    // Generate unique user ID and name
    const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const userName = 'User' + Math.floor(Math.random() * 10000);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        userId, 
        userName,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random`
      })
    };
  }

  if (event.httpMethod === 'POST') {
    try {
      const data = JSON.parse(event.body);
      const { userId, userName, avatar } = data;

      if (!userId || !userName) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Missing user data' })
        };
      }

      // Store user in Firestore
      const userRef = db.collection('users').doc(userId);
      await userRef.set({
        userId,
        userName,
        avatar: avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random`,
        lastSeen: admin.firestore.FieldValue.serverTimestamp(),
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true, 
          userId, 
          userName,
          avatar 
        })
      };
    } catch (error) {
      console.error('Error authenticating user:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Authentication failed' })
      };
    }
  }

  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: 'Method not allowed' })
  };
};