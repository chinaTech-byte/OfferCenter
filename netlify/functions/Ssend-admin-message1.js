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
const rtdb = admin.database();

// Check if user is admin using Realtime Database
async function isAdmin(userId) {
  try {
    const adminRef = rtdb.ref('admins/' + userId);
    const snapshot = await adminRef.once('value');
    return snapshot.exists();
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
    const { message, userId, fileUrl, fileName, isVoice, audioUrl } = JSON.parse(event.body);
    
    // Verify user is admin
    const adminUser = await isAdmin(userId);
    
    if (!adminUser) {
      return {
        statusCode: 403,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Forbidden: Admin access required' })
      };
    }
    
    // Prepare message data
    const messageData = {
      userId: userId,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      isAdmin: true,
      deleted: false
    };

    // Handle different message types
    if (isVoice && audioUrl) {
      messageData.isVoice = true;
      messageData.audioUrl = audioUrl;
      messageData.text = "Voice message from admin";
    } else if (fileUrl) {
      messageData.fileUrl = fileUrl;
      messageData.fileName = fileName;
      messageData.text = message || `File: ${fileName}`;
    } else {
      messageData.text = message;
      messageData.isVoice = false;
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
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: error.message })
    };
  }
};