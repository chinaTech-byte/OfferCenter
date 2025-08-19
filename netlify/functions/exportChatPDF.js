const { db } = require('./utils/firebase');

exports.handler = async () => {
  try {
    const messagesRef = db.collection('chatMessages').orderBy('timestamp', 'asc');
    const snapshot = await messagesRef.get();
    
    // In a real implementation, you would use a PDF generation library
    // This is a simplified version that returns JSON
    const messages = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      messages.push({
        timestamp: data.timestamp.toDate().toISOString(),
        userId: data.userId,
        userName: data.userName || 'Unknown',
        message: data.message
      });
    });
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename=chat-history.json'
      },
      body: JSON.stringify(messages)
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};