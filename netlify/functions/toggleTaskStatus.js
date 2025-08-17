const { db } = require('./utils/firebase');

exports.handler = async (event) => {
  try {
    const taskId = event.queryStringParameters.taskId;
    const taskRef = db.collection('tasks').doc(taskId);
    const taskDoc = await taskRef.get();
    
    if (!taskDoc.exists) {
      return { statusCode: 404, body: JSON.stringify({ error: 'Task not found' }) };
    }
    
    const currentStatus = taskDoc.data().active;
    await taskRef.update({ active: !currentStatus });
    
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, active: !currentStatus })
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};