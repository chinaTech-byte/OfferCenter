const admin = require('firebase-admin');
const PDFDocument = require('pdfkit');

if (admin.apps.length === 0) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}
const db = admin.firestore();

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

    const chunks = [];
    const doc = new PDFDocument({ margin: 36 });
    doc.on('data', (d)=>chunks.push(d));
    const done = new Promise(res => doc.on('end', res));

    doc.fontSize(16).text('Community Chat Export', { align:'center' });
    doc.moveDown();

    snap.forEach((ref) => {
      const d = ref.data();
      const ts = d.timestamp && d.timestamp.toDate ? d.timestamp.toDate().toLocaleString() : '';
      const head = `${ts}  •  ${d.userId || 'unknown'}  ${d.edited ? '(edited)':''}`;
      doc.fontSize(10).fillColor('gray').text(head);
      doc.moveDown(0.25);
      const content = d.isVoice ? '[voice message]' : (d.text || '');
      doc.fontSize(12).fillColor('black').text(content, { width: 520 });
      doc.moveDown();
    });

    doc.end();
    await done;

    const buffer = Buffer.concat(chunks);
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="chat_export.pdf"'
      },
      body: buffer.toString('base64'),
      isBase64Encoded: true
    };
  } catch (err) {
    return { statusCode: 500, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ error: err.message }) };
  }
};