const admin = require('firebase-admin');

if (admin.apps.length === 0) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}
const db = admin.firestore();

function escapeCSV(val='') {
  const s = String(val ?? '');
  if (s.includes('"') || s.includes(',') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }};
  }
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ error: 'Method not allowed' })};
  }

  try {
    const snap = await db.collection('messages')
      .orderBy('timestamp','asc')
      .limit(1000)
      .get();

    const rows = [['id','userId','isVoice','edited','deleted','timestamp','text']];
    snap.forEach(doc => {
      const d = doc.data();
      rows.push([
        doc.id,
        d.userId || '',
        d.isVoice ? '1':'0',
        d.edited ? '1':'0',
        d.deleted ? '1':'0',
        d.timestamp && d.timestamp.toDate ? d.timestamp.toDate().toISOString() : '',
        d.isVoice ? '[voice message]' : (d.text || '')
      ]);
    });

    const csv = rows.map(r => r.map(escapeCSV).join(',')).join('\n');
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="chat_export.csv"'
      },
      body: csv
    };
  } catch (err) {
    return { statusCode: 500, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ error: err.message }) };
  }
};