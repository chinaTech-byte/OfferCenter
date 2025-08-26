const admin = require('firebase-admin');
const Busboy = require('busboy');

// Initialize Firebase Admin
if (admin.apps.length === 0) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
  });
}

const db = admin.firestore();
const bucket = admin.storage().bucket();

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
    const busboy = Busboy({ headers: event.headers });
    let audioFile = null;
    let userId = null;
    
    return new Promise((resolve, reject) => {
      busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
        if (fieldname === 'audio') {
          const chunks = [];
          file.on('data', (data) => {
            chunks.push(data);
          });
          file.on('end', () => {
            audioFile = {
              buffer: Buffer.concat(chunks),
              filename: filename,
              mimetype: mimetype
            };
          });
        }
      });
      
      busboy.on('field', (fieldname, val) => {
        if (fieldname === 'userId') {
          userId = val;
        }
      });
      
      busboy.on('finish', async () => {
        try {
          if (!audioFile || !userId) {
            return resolve({
              statusCode: 400,
              headers: { 'Access-Control-Allow-Origin': '*' },
              body: JSON.stringify({ error: 'Missing audio file or user ID' })
            });
          }
          
          // Generate a unique filename
          const timestamp = Date.now();
          const filename = `voice-messages/${userId}/${timestamp}_${audioFile.filename}`;
          
          // Upload to Firebase Storage
          const file = bucket.file(filename);
          await file.save(audioFile.buffer, {
            metadata: {
              contentType: audioFile.mimetype,
              metadata: {
                userId: userId,
                uploadedAt: timestamp
              }
            }
          });
          
          // Make the file publicly accessible
          await file.makePublic();
          
          // Get the public URL
          const audioUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
          
          // Save message to Firestore
          const docRef = await db.collection('messages').add({
            audioUrl: audioUrl,
            userId: userId,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            isVoice: true,
            deleted: false
          });
          
          resolve({
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ id: docRef.id, success: true })
          });
        } catch (error) {
          resolve({
            statusCode: 500,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ error: error.message })
          });
        }
      });
      
      busboy.on('error', (error) => {
        resolve({
          statusCode: 500,
          headers: { 'Access-Control-Allow-Origin': '*' },
          body: JSON.stringify({ error: error.message })
        });
      });
      
      busboy.write(event.body, event.isBase64Encoded ? 'base64' : 'binary');
      busboy.end();
    });
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: error.message })
    };
  }
};