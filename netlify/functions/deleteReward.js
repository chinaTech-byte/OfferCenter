const { db } = require('./utils/firebase');

exports.handler = async (event) => {
  try {
    const { rewardId } = JSON.parse(event.body);
    await db.collection('rewards').doc(rewardId).delete();
    
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};