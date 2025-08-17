const { db } = require('./utils/firebase');

exports.handler = async () => {
  try {
    const rewardsRef = db.collection('rewards');
    const snapshot = await rewardsRef.get();
    const rewards = [];
    
    snapshot.forEach(doc => {
      rewards.push({ id: doc.id, ...doc.data() });
    });
    
    return {
      statusCode: 200,
      body: JSON.stringify(rewards)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};