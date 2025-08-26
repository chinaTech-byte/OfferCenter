const admin = require('firebase-admin');
const Busboy = require('busboy');
const cloudinary = require('cloudinary').v2;

// Initialize Firebase Admin
if (admin.apps.length === 0) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL
  });
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

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
          
          // Convert buffer to base64 for Cloudinary upload
          const base64Audio = audioFile.buffer.toString('base64');
          const dataUri = `data:${audioFile.mimetype};base64,${base64Audio}`;
          
          // Upload to Cloudinary
          const uploadResult = await cloudinary.uploader.upload(dataUri, {
            resource_type: 'video', // Use 'video' for audio files in Cloudinary
            folder: 'voice-messages',
            public_id: `voice_${userId}_${Date.now()}`,
            overwrite: false
          });
          
          // Save message to Firestore with Cloudinary URL
          const docRef = await db.collection('messages').add({
            audioUrl: uploadResult.secure_url,
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
          console.error('Error processing audio:', error);
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
