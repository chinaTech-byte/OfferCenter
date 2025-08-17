const { db } = require('./utils/firebase');

exports.handler = async () => {
  try {
    // Total users
    const usersSnapshot = await db.collection('users').get();
    
    // Total tasks completed
    const tasksCompleted = usersSnapshot.docs.reduce((sum, doc) => {
      return sum + (doc.data().tasksCompleted || 0);
    }, 0);
    
    // Total coins earned
    const transactionsSnapshot = await db.collection('transactions')
      .where('type', '==', 'earn').get();
    const coinsEarned = transactionsSnapshot.docs.reduce((sum, doc) => {
      return sum + doc.data().amount;
    }, 0);
    
    // Total rewards redeemed
    const rewardsRedeemed = usersSnapshot.docs.reduce((sum, doc) => {
      return sum + (doc.data().rewardsClaimed || 0);
    }, 0);

    return {
      statusCode: 200,
      body: JSON.stringify({
        totalUsers: usersSnapshot.size,
        totalTasksCompleted: tasksCompleted,
        totalCoinsEarned: coinsEarned,
        totalRewardsRedeemed: rewardsRedeemed
      })
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};