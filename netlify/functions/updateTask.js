const { db } = require('./utils/firebase');

exports.handler = async (event) => {
  try {
    const taskId = event.path.split('/').pop();
    const taskData = JSON.parse(event.body);
    
    // Update task in Firestore
    const taskRef = db.collection('tasks').doc(taskId);
    await taskRef.update(taskData);
    
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