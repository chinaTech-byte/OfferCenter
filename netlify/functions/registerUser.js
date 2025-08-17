const { db, admin } = require('./utils/firebase');

exports.handler = async (event) => {
  try {
    let body = {};
    if (event.body) {
      body = JSON.parse(event.body);
    }

    // Get IP from headers
    const ip = event.headers['x-nf-client-connection-ip'] || '127.0.0.1';
    const lastThree = ip.split('.').slice(-2).join('');
    
    // Get device ID from frontend (or generate fallback)
    const deviceId = body.deviceId || Math.random().toString(36).substring(2, 10);
    
    // Create unique user ID combining IP and device ID
    const userId = `Pexoria-${lastThree}-${deviceId}`;

    // Check if user exists
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    let userData;
    if (userDoc.exists) {
      const data = userDoc.data();
      userData = {
        id: userId,
        coins: data.coins || 0,
        tasksCompleted: data.tasksCompleted || 0,
        rewardsClaimed: data.rewardsClaimed || 0,
        referrals: data.referrals || 0,
        isActive: data.isActive !== undefined ? data.isActive : true,
        created: data.created || new Date().toISOString()
      };
    } else {
      // Create new user with default coins
      userData = {
        id: userId,
        coins: 1250,
        tasksCompleted: 0,
        rewardsClaimed: 0,
        referrals: 0,
        isActive: true,
        created: new Date().toISOString()
      };

      await userRef.set(userData);

      // Process referral if exists - KEEPING YOUR ORIGINAL REFERRAL LOGIC
      if (body.referralCode) {
        const referralCode = body.referralCode;
        
        // Add referral record
        await db.collection('referrals').add({
          referrer: referralCode,
          referred: userId,
          date: new Date().toISOString(),
          processed: false
        });

        // Update referrer's stats in transaction
        await db.runTransaction(async (transaction) => {
          const referrerRef = db.collection('users').doc(referralCode);
          const referrerDoc = await transaction.get(referrerRef);
          
          if (referrerDoc.exists) {
            transaction.update(referrerRef, {
              referrals: admin.firestore.FieldValue.increment(1),
              coins: admin.firestore.FieldValue.increment(50)
            });
            
            // Mark referral as processed
            const referralsQuery = db.collection('referrals')
              .where('referrer', '==', referralCode)
              .where('referred', '==', userId)
              .where('processed', '==', false);
              
            const snapshot = await referralsQuery.get();
            snapshot.forEach(doc => {
              transaction.update(doc.ref, { processed: true });
            });
          }
        });
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify(userData)
    };
  } catch (error) {
    console.error('Registration error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
