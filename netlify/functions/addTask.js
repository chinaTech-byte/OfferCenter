const { db } = require('./utils/firebase');

exports.handler = async (event) => {
  try {
    const taskData = JSON.parse(event.body);
    
    // Add new task to Firestore
    const taskRef = db.collection('tasks').doc();
    await taskRef.set(taskData);
    
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true,
        id: taskRef.id
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};