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
    
    // Combined query to avoid duplicate fetching
    const combinedSnapshot = await db.collection('transactions')
      .where('userId', '==', userId)
      .orderBy('date', 'desc')
      .limit(15)  // Get enough for both lists
      .get();
    
    const allTransactions = [];
    const rewardActivities = [];
    
    // Process all transactions
    combinedSnapshot.forEach(doc => {
      const data = doc.data();
      
      // Proper Firestore timestamp handling
      const dateValue = data.date;
      const dateISO = dateValue.toDate 
        ? dateValue.toDate().toISOString() 
        : new Date(dateValue).toISOString();
      
      const transaction = {
        id: doc.id,
        ...data,
        date: dateISO
      };
      
      allTransactions.push(transaction);
      
      // Collect spend transactions for rewards
      if (data.type === 'spend') {
        rewardActivities.push({
          type: 'reward',
          ...transaction
        });
      }
    });
    
    // Prepare final activities list
    const activities = [
      ...allTransactions.slice(0, 10).map(t => ({ 
        ...t, 
        type: 'transaction' 
      })),
      ...rewardActivities.slice(0, 5)
    ];
    
    // Sort by date
    activities.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return {
      statusCode: 200,
      body: JSON.stringify(activities.slice(0, 10))
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};