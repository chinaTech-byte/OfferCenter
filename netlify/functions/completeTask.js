const { db, admin } = require('./utils/firebase');

exports.handler = async (event) => {
  try {
    const { userId, taskId } = JSON.parse(event.body);
    
    // Get task
    const taskRef = db.collection('tasks').doc(taskId);
    const taskDoc = await taskRef.get();
    
    if (!taskDoc.exists) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Task not found' })
      };
    }
    
    const task = taskDoc.data();
    
    // Get user
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'User not found' })
      };
    }
    
    // Update user coins and task count
    await userRef.update({
      coins: admin.firestore.FieldValue.increment(task.coins),
      tasksCompleted: admin.firestore.FieldValue.increment(1)
    });
    
    // Add transaction
    const transactionRef = db.collection('transactions').doc();
    await transactionRef.set({
      userId: userId,
      type: "earn",
      amount: task.coins,
      description: task.title,
      date: new Date().toISOString()
    });
    
    // Get updated user
    const updatedUserDoc = await userRef.get();
    
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true, 
        coins: task.coins,
        newBalance: updatedUserDoc.data().coins
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};