const { db } = require('./utils/firebase');

exports.handler = async (event) => {
  try {
    const userId = event.queryStringParameters.userId;
    
    if (!userId) {
      return { 
        statusCode: 400, 
        body: JSON.stringify({ error: 'User ID required' }) 
      };
    }
    
    const transactionsRef = db.collection('transactions')
      .where('userId', '==', userId)
      .orderBy('date', 'desc');
    
    const snapshot = await transactionsRef.get();
    
    if (snapshot.empty) {
      return {
        statusCode: 200,
        body: JSON.stringify([])
      };
    }
    
    const transactions = [];
    
    snapshot.forEach(doc => {
      transactions.push({ 
        id: doc.id, 
        ...doc.data(),
        // Preserve original date format
        date: doc.data().date
      });
    });
    
    return {
      statusCode: 200,
      body: JSON.stringify(transactions)
    };
  } catch (error) {
    console.error('Transaction load error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to load transactions' })
    };
  }
};