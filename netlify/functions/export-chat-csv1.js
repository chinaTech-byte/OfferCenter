const admin = require('firebase-admin');
const { stringify } = require('csv-stringify/sync');

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
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    // Check admin status
    const authHeader = event.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        statusCode: 401,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Unauthorized' })
      };
    }

    const userId = authHeader.replace('Bearer ', '');
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

    // Get all messages from Firestore
    const snapshot = await db.collection('messages')
      .where('deleted', '==', false)
      .orderBy('timestamp', 'asc')
      .get();
    
    const messages = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      messages.push({
        id: doc.id,
        userId: data.userId,
        text: data.text,
        timestamp: data.timestamp.toDate().toISOString(),
        isVoice: data.isVoice || false,
        edited: data.edited || false
      });
    });

    // Convert to CSV
    const csvData = stringify(messages, {
      header: true,
      columns: [
        { key: 'id', header: 'ID' },
        { key: 'userId', header: 'User ID' },
        { key: 'text', header: 'Message' },
        { key: 'timestamp', header: 'Timestamp' },
        { key: 'isVoice', header: 'Is Voice Message' },
        { key: 'edited', header: 'Edited' }
      ]
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/c',
        'Content-Disposition': 'attachment; filename=chat-history.csv',
        'Access-Control-Allow-Origin': '*'
      },
      body: csvData
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