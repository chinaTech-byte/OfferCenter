const { db } = require('./utils/firebase');

exports.handler = async (event) => {
  try {
    const rewardData = JSON.parse(event.body);
    const rewardRef = db.collection('rewards').doc();
    await rewardRef.set({
      ...rewardData,
      createdAt: new Date().toISOString()
    });
    
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true,
        id: rewardRef.id
      })
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};