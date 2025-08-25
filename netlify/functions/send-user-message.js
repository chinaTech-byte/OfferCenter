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

// Check if user is admin
async function isAdmin(userId) {
  try {
    const adminDoc = await db.collection('admins').doc(userId).get();
    return adminDoc.exists;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

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
    const { message, userId, isVoice = false } = JSON.parse(event.body);
    
    // Check if user is admin
    const adminUser = await isAdmin(userId);
    
    // For voice messages, skip content validation
    if (!isVoice) {
      // Check for restricted content for non-admin users
      const phoneRegex = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/;
      const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
      const urlRegex = /https?:\/\/[^\s]+/;
      
      const hasRestricted = phoneRegex.test(message) || emailRegex.test(message) || urlRegex.test(message);
      
      if (!adminUser && hasRestricted) {
        return {
          statusCode: 400,
          headers: {
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ error: 'Message contains restricted content' })
        };
      }
    }
    
    // Check message size (for both text and voice)
    const messageSize = Buffer.byteLength(message, 'utf8');
    const maxSize = isVoice ? 10 * 1024 * 1024 : 1024 * 1024; // 10MB for audio, 1MB for text
    
    if (messageSize > maxSize) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: `Message is too ${isVoice ? 'long' : 'large'}. Please ${isVoice ? 'record a shorter audio message' : 'send a shorter text message'}.` })
      };
    }
    
    // Save message to Firestore
    const docRef = await db.collection('messages').add({
      text: message,
      userId: userId,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      isVoice: isVoice,
      deleted: false
    });
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ id: docRef.id, success: true })
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