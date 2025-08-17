const { db } = require('./utils/firebase');

exports.handler = async (event) => {
  try {
    const userId = event.queryStringParameters.userId;
    
    if (!userId) {
      return { statusCode: 400, body: JSON.stringify({ error: 'User ID required' }) };
    }
    
    const dailyRef = db.collection('dailyCheckins').doc(userId);
    const dailyDoc = await dailyRef.get();
    
    return {
      statusCode: 200,
      body: JSON.stringify(dailyDoc.exists ? dailyDoc.data() : {
        lastClaimDate: null,
        streak: 0
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};