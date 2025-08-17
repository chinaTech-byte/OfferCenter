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
    
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'User not found' })
      };
    }
    
    const data = userDoc.data();
    // Return with safe defaults
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        id: userDoc.id,
        coins: data.coins || 0,
        tasksCompleted: data.tasksCompleted || 0,
        rewardsClaimed: data.rewardsClaimed || 0,
        referrals: data.referrals || 0,
        isActive: data.isActive !== undefined ? data.isActive : true,
        created: data.created || new Date().toISOString()
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
