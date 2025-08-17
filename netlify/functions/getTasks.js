const { db } = require('./utils/firebase');

exports.handler = async () => {
  try {
    const tasksRef = db.collection('tasks');
    const snapshot = await tasksRef.get();
    const tasks = [];
    
    snapshot.forEach(doc => {
      tasks.push({ id: doc.id, ...doc.data() });
    });
    
    return {
      statusCode: 200,
      body: JSON.stringify(tasks)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};