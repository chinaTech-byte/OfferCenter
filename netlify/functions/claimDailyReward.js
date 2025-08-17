const { db, admin } = require('./utils/firebase');

exports.handler = async (event) => {
  try {
    const { userId } = JSON.parse(event.body);
    
    if (!userId) {
      return { statusCode: 400, body: JSON.stringify({ error: 'User ID required' }) };
    }
    
    const userRef = db.collection('users').doc(userId);
    const dailyRef = db.collection('dailyCheckins').doc(userId);
    
    return await db.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);
      const dailyDoc = await transaction.get(dailyRef);
      
      if (!userDoc.exists) {
        throw new Error('User not found');
      }
      
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const lastClaimDate = dailyDoc.exists ? dailyDoc.data().lastClaimDate : null;
      const streak = dailyDoc.exists ? dailyDoc.data().streak : 0;
      
      // Prevent multiple claims on same day
      if (lastClaimDate === today) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Already claimed today' })
        };
      }
      
      // Calculate streak
      let newStreak = 1;
      if (lastClaimDate) {
        const lastClaim = new Date(lastClaimDate);
        const timeDiff = now - lastClaim;
        const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 1) {
          newStreak = streak + 1;
        }
      }
      
      // Calculate reward
      const baseReward = 50;
      const streakBonus = Math.min(100, (newStreak - 1) * 10);
      const totalReward = baseReward + streakBonus;
      
      // Update user
      transaction.update(userRef, {
        coins: admin.firestore.FieldValue.increment(totalReward)
      });
      
      // Update daily checkin
      transaction.set(dailyRef, {
        lastClaimDate: today,
        streak: newStreak
      }, { merge: true });
      
      // Add transaction
      const transactionRef = db.collection('transactions').doc();
      transaction.set(transactionRef, {
        userId: userId,
        type: "earn",
        amount: totalReward,
        description: `Daily Check-in (Streak: ${newStreak})`,
        date: now.toISOString()
      });
      
      return {
        statusCode: 200,
        body: JSON.stringify({ 
          success: true,
          reward: totalReward,
          streak: newStreak
        })
      };
    });
  } catch (error) {
    console.error('Daily reward error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};