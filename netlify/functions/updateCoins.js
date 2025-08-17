const { db, admin } = require('./utils/firebase');

exports.handler = async (event) => {
  try {
    // Parse request body
    const { userId, amount, description } = JSON.parse(event.body);
    
    // Validate required parameters
    if (!userId || amount === undefined || !description) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required parameters' })
      };
    }

    // Validate amount type
    if (typeof amount !== 'number' || isNaN(amount)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid amount' })
      };
    }

    // Get user reference
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    // Handle user not found
    if (!userDoc.exists) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'User not found' })
      };
    }
    
    // Update user coins
    await userRef.update({
      coins: admin.firestore.FieldValue.increment(amount)
    });
    
    // Add transaction record
    const transactionRef = db.collection('transactions').doc();
    await transactionRef.set({
      userId: userId,
      type: amount > 0 ? "earn" : "spend",
      amount: Math.abs(amount),
      description: description,
      date: new Date().toISOString()
    });
    
    // Get updated balance
    const updatedUser = await userRef.get();
    
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true,
        newBalance: updatedUser.data().coins
      })
    };
  } catch (error) {
    console.error('Update coins error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};