const { db } = require('./utils/firebase');

exports.handler = async (event) => {
  try {
    const taskId = event.path.split('/').pop();
    
    // Get current task status
    const taskRef = db.collection('tasks').doc(taskId);
    const taskDoc = await taskRef.get();
    
    if (!taskDoc.exists) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Task not found' })
      };
    }
    
    const currentStatus = taskDoc.data().active;
    
    // Toggle task status
    await taskRef.update({ active: !currentStatus });
    
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true,
        newStatus: !currentStatus
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};