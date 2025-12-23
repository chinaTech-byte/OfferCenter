const { db } = require('./firebase.js');

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const data = JSON.parse(event.body);
    const { text, userId, userName, avatar } = data;

    if (!text || !userId || !userName) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    const messageRef = db.collection('messages').doc();
    const messageData = {
      id: messageRef.id,
      text: text.trim(),
      userId,
      userName,
      avatar: avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random`,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      reactions: {},
      replyCount: 0
    };

    await messageRef.set(messageData);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        messageId: messageRef.id,
        message: messageData
      })
    };
  } catch (error) {
    console.error('Error sending message:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to send message' })
    };
  }
};