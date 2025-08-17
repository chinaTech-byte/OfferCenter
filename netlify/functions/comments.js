const admin = require('firebase-admin');
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DB_URL
  });
}

const db = admin.firestore();

exports.handler = async function (event) {
  const id = event.queryStringParameters.id;
  if (!id) return { statusCode: 400, body: 'Missing ID' };

  const ref = db.collection('news_comments').doc(id);

  if (event.httpMethod === 'GET') {
    const doc = await ref.get();
    const comments = doc.exists ? doc.data().comments || [] : [];
    return {
      statusCode: 200,
      body: JSON.stringify(comments)
    };
  }

  if (event.httpMethod === 'POST') {
    const { text } = JSON.parse(event.body);
    if (!text) return { statusCode: 400, body: 'Missing comment text' };

    const comment = { text, timestamp: Date.now() };
    await ref.set({ comments: admin.firestore.FieldValue.arrayUnion(comment) }, { merge: true });
    const updated = await ref.get();

    return {
      statusCode: 200,
      body: JSON.stringify(updated.data().comments || [])
    };
  }

  return { statusCode: 405, body: 'Method Not Allowed' };
};