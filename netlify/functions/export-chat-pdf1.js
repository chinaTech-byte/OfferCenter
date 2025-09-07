const admin = require('firebase-admin');
const PDFDocument = require('pdfkit');

// Initialize Firebase Admin
if (admin.apps.length === 0) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL
  });
}

const db = admin.firestore();

// Check if user is admin using Realtime Database
async function isAdmin(userId) {
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
        timestamp: data.timestamp.toDate(),
        isVoice: data.isVoice || false,
        edited: data.edited || false
      });
    });

    // Create PDF
    const doc = new PDFDocument();
    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {});

    // Add content to PDF
    doc.fontSize(20).text('Chat History', { align: 'center' });
    doc.moveDown();

    messages.forEach(message => {
      doc.fontSize(12)
        .text(`User: ${message.userId}`)
        .text(`Time: ${message.timestamp.toLocaleString()}`)
        .text(`Message: ${message.text}`)
        .text(`Type: ${message.isVoice ? 'Voice' : 'Text'}`)
        .text(`Edited: ${message.edited ? 'Yes' : 'No'}`);
      doc.moveDown();
    });

    doc.end();

    // Wait for PDF to finish
    const pdfBuffer = await new Promise((resolve) => {
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=chat-history.pdf',
        'Access-Control-Allow-Origin': '*'
      },
      body: pdfBuffer.toString('base64'),
      isBase64Encoded: true
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