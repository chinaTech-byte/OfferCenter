const { db } = require('./firebase.js');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const data = JSON.parse(event.body);
    const { messageId, userId, userName, emoji } = data;

    if (!messageId || !userId || !userName || !emoji) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    const messageRef = db.collection('messages').doc(messageId);
    const messageDoc = await messageRef.get();

    if (!messageDoc.exists) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Message not found' })
      };
    }

    const message = messageDoc.data();
    const reactions = message.reactions || {};
    const reactionKey = `reactions.${emoji}`;

    // Check if user already reacted with this emoji
    const userReactionIndex = reactions[emoji]?.findIndex(r => r.userId === userId);

    if (userReactionIndex >= 0) {
      // Remove reaction
      const updatedReactions = [...reactions[emoji]];
      updatedReactions.splice(userReactionIndex, 1);
      
      if (updatedReactions.length === 0) {
        await messageRef.update({
          [`reactions.${emoji}`]: admin.firestore.FieldValue.delete()
        });
      } else {
        await messageRef.update({
          [`reactions.${emoji}`]: updatedReactions
        });
      }
    } else {
      // Add reaction
      await messageRef.update({
        [`reactions.${emoji}`]: admin.firestore.FieldValue.arrayUnion({
          userId,
          userName,
          timestamp: new Date().toISOString()
        })
      });
    }

    // Get updated message
    const updatedDoc = await messageRef.get();
    const updatedMessage = {
      id: updatedDoc.id,
      ...updatedDoc.data(),
      timestamp: updatedDoc.data().timestamp?.toDate().toISOString()
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: updatedMessage 
      })
    };
  } catch (error) {
    console.error('Error reacting to message:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to react to message' })
    };
  }
};