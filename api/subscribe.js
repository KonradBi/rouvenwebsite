const fetch = require('node-fetch');

module.exports = async (req, res) => {
  console.log('API: Received newsletter subscription request');

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

    console.log('API: Sending request to MailerLite');
    const response = await fetch('https://connect.mailerlite.com/api/subscribers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${process.env.MAILERLITE_API_KEY}`
      },
      body: JSON.stringify({
        email: email
      })
    });

    const data = await response.json();
    console.log('API: MailerLite response status:', response.status);
    console.log('API: MailerLite response data:', data);

    if (!response.ok) {
      throw new Error(data.message || 'Failed to subscribe');
    }

    console.log('API: Subscription successful');
    res.json({ success: true, data });
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
