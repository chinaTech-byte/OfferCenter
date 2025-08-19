const { db } = require('./utils/firebase');

exports.handler = async () => {
  try {
    const messagesRef = db.collection('chatMessages').orderBy('timestamp', 'asc');
    const snapshot = await messagesRef.get();
    
    let csv = 'Timestamp,User ID,User Name,Message\n';
    snapshot.forEach(doc => {
      const data = doc.data();
      const timestamp = data.timestamp ? data.timestamp.toDate().toISOString() : new Date().toISOString();
      const userId = data.userId || 'Unknown';
      const userName = data.userName || 'Unknown';
      const message = data.message ? data.message.replace(/"/g, '""') : '';
      
      csv += `"${timestamp}","${userId}","${userName}","${message}"\n`;
    });
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=chat-history.csv'
      },
      body: csv
    };
  } catch (error) {
    console.error('CSV export error:', error);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: error.message }) 
    };
  }
};