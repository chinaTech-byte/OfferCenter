const admin = require('firebase-admin');

// Initialize Firebase Admin with service account from environment variable
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
    const { message, userId } = JSON.parse(event.body);
    
    // Validate message content
    if (hasRestrictedContent(message)) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Message contains restricted content' })
      };
    }
    // Add admin check function
    async function isAdmin(userId) {
    const adminDoc = await db.collection('admins').doc(userId).get();
    return adminDoc.exists;
    }
    
    // Update the content validation check
    const adminUser = await isAdmin(userId);
    if (!adminUser && hasRestrictedContent(message)) {
    return {
    statusCode: 400,
    headers: {
    'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({ error: 'Message contains restricted content' })
    };
    }
    // Save message to Firestore
    const docRef = await db.collection('messages').add({
      text: message,
      userId: userId,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      isVoice: false,
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

function hasRestrictedContent(text) {
  const phoneRegex = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/;
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  const urlRegex = /https?:\/\/[^\s]+/;
  
  return phoneRegex.test(text) || emailRegex.test(text) || urlRegex.test(text);
}urn phoneRegex.test(text) || emailRegex.test(text) || urlRegex.test(text);
