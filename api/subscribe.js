import { MailerLite } from '@mailerlite/mailerlite-nodejs';

export default async (req, res) => {
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
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    if (!process.env.MAILERLITE_API_KEY) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    const client = new MailerLite({
      api_key: process.env.MAILERLITE_API_KEY
    });

    // Create subscriber
    await client.subscribers.create({
      email: email,
      status: 'active'
    });

    // If group ID is configured, add subscriber to group
    if (process.env.MAILERLITE_GROUP_ID) {
      try {
        await client.groups.assignSubscriber(process.env.MAILERLITE_GROUP_ID, email);
      } catch (groupError) {
        console.error('Failed to add subscriber to group:', groupError);
        // Don't fail the whole request if just the group assignment fails
      }
    }

    res.json({ 
      success: true, 
      message: 'Successfully subscribed to newsletter'
    });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to subscribe to newsletter. Please try again later.'
    });
  }
};
