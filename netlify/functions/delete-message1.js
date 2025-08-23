const admin = require('firebase-admin');

// Initialize Firebase Admin
if (admin.apps.length === 0) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL
  });
}

const db = admin.firestore();

exports.handler = async (event) => {
  // Handle CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'DELETE, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'DELETE') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const { messageId, userId } = JSON.parse(event.body);
    
    // Verify user owns the message
    const doc = await db.collection('messages').doc(messageId).get();
    if (!doc.exists || doc.data().userId !== userId) {
      return {
        statusCode: 403,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Not authorized to delete this message' })
      };
    }
    
    // Delete message (or mark as deleted)
    await db.collection('messages').doc(messageId).update({
      deleted: true,
      deleteTimestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ success: true })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: error.message })
    };
  }
};