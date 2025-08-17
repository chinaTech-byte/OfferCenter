const { db } = require('./utils/firebase');

exports.handler = async (event) => {
  try {
    const taskId = event.path.split('/').pop();
    
    // Delete task from Firestore
    await db.collection('tasks').doc(taskId).delete();
    
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};