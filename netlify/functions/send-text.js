const admin = require('firebase-admin');

if (admin.apps.length === 0) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL
  });
}
const db = admin.firestore();

function hasRestrictedContent(text) {
  if (!text) return false;
  const phone = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/;
  const email = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
  const link  = /(https?:\/\/|www\.)\S+/i;
  return phone.test(text) || email.test(text) || link.test(text);
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }};
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ error: 'Method not allowed' })};
  }

  try {
    const { text, userId, isVoice } = JSON.parse(event.body || '{}');
    if (!userId) return { statusCode:400, headers:{'Access-Control-Allow-Origin':'*'}, body: JSON.stringify({ error:'userId required' })};
    if (!isVoice && (!text || !String(text).trim())) return { statusCode:400, headers:{'Access-Control-Allow-Origin':'*'}, body: JSON.stringify({ error:'text required' })};
    if (!isVoice && hasRestrictedContent(String(text))) return { statusCode:400, headers:{'Access-Control-Allow-Origin':'*'}, body: JSON.stringify({ error:'Restricted content' })};

    const payload = {
      text: String(text || ''),
      userId: String(userId),
      isVoice: !!isVoice,
      edited: false,
      deleted: false,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    };
    const ref = await db.collection('messages').add(payload);

    return { statusCode: 200, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ id: ref.id }) };
  } catch (err) {
    return { statusCode: 500, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ error: err.message }) };
  }
};Control-Allow-Origin': '*' },
      body: JSON.stringify({ id: ref.id })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: err.message })
    };
  }
};