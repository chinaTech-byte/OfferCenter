const { db } = require('./utils/firebase');

// Simple PDF generation without external dependencies
exports.handler = async () => {
  try {
    const messagesRef = db.collection('chatMessages').orderBy('timestamp', 'asc');
    const snapshot = await messagesRef.get();
    
    const messages = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      messages.push({
        timestamp: data.timestamp ? data.timestamp.toDate().toISOString() : new Date().toISOString(),
        userId: data.userId || 'Unknown',
        userName: data.userName || 'Unknown',
        message: data.message || ''
      });
    });
    
    // Create a simple text-based PDF content
    let pdfContent = `%PDF-1.1
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 2000
>>
stream
BT
/F1 12 Tf
50 750 Td
(Chat History) Tj
0 -20 Td
`;

    let yPosition = 730;
    messages.forEach(msg => {
      const line = `[${new Date(msg.timestamp).toLocaleString()}] ${msg.userName}: ${msg.message}`;
      
      // Split long lines
      const maxLineLength = 80;
      for (let i = 0; i < line.length; i += maxLineLength) {
        const linePart = line.substring(i, i + maxLineLength);
        if (yPosition < 50) {
          // Add new page
          pdfContent += `ET
endstream
endobj

5 0 obj
<<
/Length 2000
>>
stream
BT
/F1 12 Tf
50 750 Td
`;
          yPosition = 730;
        }
        
        pdfContent += `(${linePart.replace(/\(/g, '\\(').replace(/\)/g, '\\)')}) Tj
0 -15 Td
`;
        yPosition -= 15;
      }
    });

    pdfContent += `ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000194 00000 n 
0000002194 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
4295
%%EOF
`;

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=chat-history.pdf'
      },
      body: pdfContent
    };
  } catch (error) {
    console.error('PDF export error:', error);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: error.message }) 
    };
  }
};