// adminLogin.js - Updated with better debugging
exports.handler = async (event) => {
  try {
    const { token } = JSON.parse(event.body);
    const adminToken = process.env.ADMIN_TOKEN;
    
    // Debugging logs (view in Netlify function logs)
    console.log('Expected Token:', adminToken ? `[${adminToken}]` : 'UNDEFINED');
    console.log('Received Token:', token ? `[${token}]` : 'EMPTY');
    
    if (token?.trim() === adminToken?.trim()) {
      return { statusCode: 200, body: JSON.stringify({ success: true }) };
    } else {
      return { statusCode: 401, body: JSON.stringify({ error: 'Invalid token' }) };
    }
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
