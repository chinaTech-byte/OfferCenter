const { db } = require('./utils/firebase');

exports.handler = async () => {
  try {
    const usersRef = db.collection('users');
    const snapshot = await usersRef.get();
    const users = [];
    
    snapshot.forEach(doc => {
      const userData = doc.data();
      
      // Format with safe defaults - preserves all referral data
      const formattedUser = {
        id: doc.id,
        coins: userData.coins || 0,
        tasksCompleted: userData.tasksCompleted || 0,
        rewardsClaimed: userData.rewardsClaimed || 0,
        referrals: userData.referrals || 0,
        isActive: userData.isActive !== undefined ? userData.isActive : true,
        created: userData.created 
          ? new Date(userData.created).toLocaleDateString() 
          : 'Unknown date'
      };
      
      users.push(formattedUser);
    });
    
    return {
      statusCode: 200,
      body: JSON.stringify(users)
    };
  } catch (error) {
    console.error('Users load error:', error);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: error.message }) 
    };
  }
};
