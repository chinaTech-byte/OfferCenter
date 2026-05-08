const admin = require('firebase-admin');

if (admin.apps.length === 0) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL
  });
}

const db = admin.firestore();

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const { messageId, userId, emoji, action } = JSON.parse(event.body);

    if (!messageId || !userId || !emoji) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Missing required fields: messageId, userId, emoji' })
      };
    }

    const messageRef = db.collection('messages').doc(messageId);

    // Verify the message exists
    const messageDoc = await messageRef.get();
    if (!messageDoc.exists) {
      return {
        statusCode: 404,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Message not found' })
      };
    }

    // Each user can have one reaction per emoji on a message.
    // Document ID is userId_emoji so it's unique per user per emoji.
    const reactionRef = messageRef.collection('reactions').doc(`${userId}_${emoji}`);

    if (action === 'remove') {
      await reactionRef.delete();
      return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ success: true, action: 'removed' })
      };
    }

    if (action === 'add') {
      await reactionRef.set({
        userId,
        emoji,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
      return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ success: true, action: 'added' })
      };
    }

    // Default: toggle — add if not present, remove if already present
    const reactionDoc = await reactionRef.get();

    if (reactionDoc.exists) {
      await reactionRef.delete();
      return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ success: true, action: 'removed' })
      };
    }

    await reactionRef.set({
      userId,
      emoji,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: true, action: 'added' })
    };

  } catch (error) {
    console.error('Error handling reaction:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: error.message })
    };
  }
};
