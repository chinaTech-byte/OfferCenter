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

// Check if user is admin using Realtime Database (for consistency)
async function checkAdminStatus(userId) {
  try {
    const rtdb = admin.database();
    const snapshot = await rtdb.ref('admins/' + userId).once('value');
    return snapshot.exists();
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

// Check for restricted content
function hasRestrictedContent(text) {
  const phoneRegex = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/;
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  const urlRegex = /https?:\/\/[^\s]+/;
  
  return phoneRegex.test(text) || emailRegex.test(text) || urlRegex.test(text);
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
    const { message, userId, isVoice, replyTo } = JSON.parse(event.body);
    
    // Check if user is admin
    const adminUser = await checkAdminStatus(userId);
    
    // Validate message content for non-admin users (only for text messages)
    if (!adminUser && !isVoice && hasRestrictedContent(message)) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Message contains restricted content' })
      };
    }
    
    // Prepare message data
    const messageData = {
      text: message,
      userId: userId,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      isVoice: isVoice || false,
      deleted: false,
      isAdmin: adminUser
    };
    
    // Add replyTo if provided
    if (replyTo) {
      messageData.replyTo = replyTo;
    }
    
    // Save message to Firestore
    const docRef = await db.collection('messages').add(messageData);
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ id: docRef.id, success: true })
    };
  } catch (error) {
    console.error('Error in messages-get1:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: error.message })
    };
  }
};