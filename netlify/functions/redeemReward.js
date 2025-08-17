const { db, admin } = require('./utils/firebase');

exports.handler = async (event) => {
  try {
    const { userId, rewardId } = JSON.parse(event.body);
    
    // Get reward
    const rewardRef = db.collection('rewards').doc(rewardId);
    const rewardDoc = await rewardRef.get();
    
    if (!rewardDoc.exists) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Reward not found' })
      };
    }
    
    const reward = rewardDoc.data();
    
    // Get user
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'User not found' })
      };
    }
    
    const user = userDoc.data();
    
    // Check if user has enough coins
    if (user.coins < reward.coins) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Not enough coins' })
      };
    }
    
    // Update user coins and rewards count
    await userRef.update({
      coins: admin.firestore.FieldValue.increment(-reward.coins),
      rewardsClaimed: admin.firestore.FieldValue.increment(1)
    });
    
    // Add transaction
    const transactionRef = db.collection('transactions').doc();
    await transactionRef.set({
      userId: userId,
      type: "spend",
      amount: reward.coins,
      description: `Premium: ${reward.name}`,
      date: new Date().toISOString()
    });
    
    // Get updated user
    const updatedUserDoc = await userRef.get();
    
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true,
        newBalance: updatedUserDoc.data().coins
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};