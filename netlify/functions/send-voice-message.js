const admin = require('firebase-admin');
const Busboy = require('busboy');
const path = require('path');
const fs = require('fs');

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
          const filename = `voice-${userId}-${timestamp}.webm`;
          
          // In a real implementation, you would save to a persistent storage
          // For Netlify, you could use their built-in form handling or a service like Cloudinary
          // For this example, we'll store the audio URL in Firestore without the actual file
          // In a production app, you would upload to a storage service and get a URL
          
          // For demo purposes, we'll create a data URL (not recommended for large files)
          // In production, use a proper storage service
          const base64Audio = audioFile.buffer.toString('base64');
          const dataUrl = `data:${audioFile.mimetype};base64,${base64Audio}`;
          
          // Save message to Firestore with the data URL
          const docRef = await db.collection('messages').add({
            audioUrl: dataUrl,
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