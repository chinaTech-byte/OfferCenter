const { db } = require('./firebase.js');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  try {
    const limit = parseInt(event.queryStringParameters.limit) || 50;
    const lastMessageId = event.queryStringParameters.lastMessageId;

    let query = db.collection('messages')
      .orderBy('timestamp', 'desc')
      .limit(limit);

    if (lastMessageId) {
      const lastDoc = await db.collection('messages').doc(lastMessageId).get();
      if (lastDoc.exists) {
        query = query.startAfter(lastDoc);
      }
    }

    const snapshot = await query.get();
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate().toISOString()
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ messages })
    };
  } catch (error) {
    console.error('Error getting messages:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to get messages' })
    };
  }
};