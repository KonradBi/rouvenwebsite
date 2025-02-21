const MailerLite = require('@mailerlite/mailerlite-nodejs').default;

module.exports = async (req, res) => {
  console.log('API: Received newsletter subscription request');

  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    console.log('API: Invalid method:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;
    console.log('API: Processing subscription for email:', email);
    
    if (!process.env.MAILERLITE_API_KEY) {
      console.error('API: MAILERLITE_API_KEY is not set');
      throw new Error('API key not configured');
    }

    const mailerlite = new MailerLite({
      api_key: process.env.MAILERLITE_API_KEY
    });

    console.log('API: Sending request to MailerLite');
    const subscriber = await mailerlite.subscribers.create({
      email: email,
      status: 'active'
    });

    console.log('API: MailerLite response:', subscriber);
    res.json({ success: true, data: subscriber });
  } catch (error) {
    console.error('API: Newsletter subscription error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to subscribe to newsletter' 
    });
  }
};
