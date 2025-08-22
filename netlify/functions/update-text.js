const admin = require('firebase-admin');
if (admin.apps.length === 0) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
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
    const { id, text } = JSON.parse(event.body || '{}');
    if (!id || !text || !String(text).trim()) return { statusCode:400, headers:{'Access-Control-Allow-Origin':'*'}, body: JSON.stringify({ error:'id & text required' })};
    if (hasRestrictedContent(String(text))) return { statusCode:400, headers:{'Access-Control-Allow-Origin':'*'}, body: JSON.stringify({ error:'Restricted content' })};

    await db.collection('messages').doc(String(id)).update({
      text: String(text).trim(),
      edited: true,
      editTimestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    return { statusCode: 200, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    return { statusCode: 500, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ error: err.message }) };
  }
};.stringify({ error: err.message }) };
  }
};