const { MailerLite } = require('@mailerlite/mailerlite-nodejs');

module.exports = async (req, res) => {
  console.log('[API] Newsletter subscription request received:', {
    method: req.method,
    headers: req.headers,
    body: req.body
  });

  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    console.log('[API] Handling OPTIONS request');
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    console.log('[API] Invalid method:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('[API] Processing POST request');
    const { email } = req.body;
    
    if (!email) {
      console.log('[API] Email missing in request');
      return res.status(400).json({ error: 'Email is required' });
    }

    console.log('[API] Checking API key');
    if (!process.env.MAILERLITE_API_KEY) {
      console.error('[API] MAILERLITE_API_KEY not found in environment variables');
      return res.status(500).json({ error: 'API key not configured' });
    }

    console.log('[API] Sending request to MailerLite API');
    const response = await fetch('https://connect.mailerlite.com/api/subscribers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MAILERLITE_API_KEY}`
      },
      body: JSON.stringify({
        email: email,
        status: 'active'
      })
    });

    const result = await response.json();
    console.log('[API] MailerLite API response:', result);

    if (!response.ok) {
      throw new Error(result.message || 'Failed to subscribe');
    }

    // If group ID is configured, add subscriber to group
    if (process.env.MAILERLITE_GROUP_ID) {
      console.log('[API] Adding subscriber to group:', process.env.MAILERLITE_GROUP_ID);
      try {
        const groupResponse = await fetch(`https://connect.mailerlite.com/api/groups/${process.env.MAILERLITE_GROUP_ID}/subscribers/${email}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.MAILERLITE_API_KEY}`
          }
        });

        const groupResult = await groupResponse.json();
        console.log('[API] Group assignment response:', groupResult);

        if (!groupResponse.ok) {
          console.error('[API] Failed to add to group:', groupResult);
        } else {
          console.log('[API] Successfully added to group');
        }
      } catch (groupError) {
        console.error('[API] Failed to add subscriber to group:', {
          error: groupError.message,
          stack: groupError.stack
        });
        // Don't fail the whole request if just the group assignment fails
      }
    }

    console.log('[API] Subscription successful');
    res.json({ 
      success: true, 
      message: 'Successfully subscribed to newsletter'
    });
  } catch (error) {
    console.error('[API] Subscription error:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    // Send a proper JSON response
    res.status(500).json({ 
      success: false, 
      error: 'Failed to subscribe to newsletter. Please try again later.',
      details: error.message
    });
  }
};
