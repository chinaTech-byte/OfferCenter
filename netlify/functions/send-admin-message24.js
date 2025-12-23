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
    const body = JSON.parse(event.body);
    const { 
      message, 
      userId, 
      fileUrl, 
      fileName, 
      fileType, 
      isVoice, 
      replyTo 
    } = body;
    
    // Check admin status from request body OR check user
    let isAdminMessage = false;
    
    // First check if explicitly set in request
    if (body.isAdmin !== undefined) {
      isAdminMessage = body.isAdmin === true || body.isAdmin === 'true';
    } else {
      // Otherwise check user's admin status
      isAdminMessage = await checkAdminStatus(userId);
    }
    
    // Prepare message data
    const messageData = {
      text: message || " ",
      userId: userId,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      isVoice: fileType && fileType.startsWith('audio/') ? true : (isVoice || false),
      deleted: false,
      isAdmin: isAdminMessage,
      fileUrl: fileUrl || null,
      fileName: fileName || null,
      fileType: fileType || null
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
    console.error('Error in send-admin-message:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: error.message })
    };
  }
};essage })
    };
  }
};