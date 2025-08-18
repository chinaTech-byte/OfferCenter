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
    
    // Get processed referrals
    const referralsRef = db.collection('referrals')
      .where('referrer', '==', userId)
      .where('processed', '==', true);
    
    const referralsSnapshot = await referralsRef.get();
    
    // Calculate earnings (50 coins per referral)
    const referralCount = referralsSnapshot.size;
    const referralEarnings = referralCount * 50;
    
    // Update user's referral count in database
    if (referralCount > 0) {
      const userRef = db.collection('users').doc(userId);
      await userRef.update({
        referrals: referralCount
      });
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        referralCount,
        referralEarnings
      })
    };
  } catch (error) {
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: error.message }) 
    };
  }
};
