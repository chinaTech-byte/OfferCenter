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
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const { messageId, userId, emoji, action } = JSON.parse(event.body);
    
    if (!messageId || !userId || !emoji) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    const messageRef = db.collection('messages').doc(messageId);
    const reactionRef = messageRef.collection('reactions').doc(`${userId}_${emoji}`);

    if (action === 'remove') {
      // Remove reaction
      await reactionRef.delete();
      
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ success: true, action: 'removed' })
      };
    } else if (action === 'toggle') {
      // Check if reaction exists
      const reactionDoc = await reactionRef.get();
      
      if (reactionDoc.exists) {
        // Remove reaction
        await reactionRef.delete();
        
        return {
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ success: true, action: 'removed' })
        };
      } else {
        // Add reaction
        await reactionRef.set({
          userId: userId,
          emoji: emoji,
          timestamp: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        
        return {
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ success: true, action: 'added' })
        };
      }
    } else {
      // Add or update reaction
      await reactionRef.set({
        userId: userId,
        emoji: emoji,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ success: true, action: 'added' })
      };
    }
  } catch (error) {
    console.error('Error handling reaction:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: error.message })
    };
  }
};