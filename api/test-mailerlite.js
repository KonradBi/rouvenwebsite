const MailerLite = require('@mailerlite/mailerlite-nodejs').default;

module.exports = async (req, res) => {
  console.log('API: Testing MailerLite connection');

  try {
    if (!process.env.MAILERLITE_API_KEY) {
      console.error('API: MAILERLITE_API_KEY is not set');
      throw new Error('API key not configured');
    }

    const mailerlite = new MailerLite({
      api_key: process.env.MAILERLITE_API_KEY
    });

    // Test API connection with subscribers endpoint first
    console.log('API: Fetching subscribers...');
    const subscribersResponse = await mailerlite.subscribers.get();
    console.log('API: Subscribers response:', subscribersResponse);
    
    // Test groups endpoint
    console.log('API: Fetching groups...');
    const groupsResponse = await mailerlite.groups.get();
    console.log('API: Groups response:', groupsResponse);

    // Extract only the data we need
    const subscribers = subscribersResponse.data ? subscribersResponse.data.map(sub => ({
      id: sub.id,
      email: sub.email,
      status: sub.status
    })) : [];

    const groups = groupsResponse.data ? groupsResponse.data.map(group => ({
      id: group.id,
      name: group.name
    })) : [];

    res.json({
      success: true,
      data: {
        subscribers,
        groups,
        subscriberCount: subscribers.length,
        groupCount: groups.length
      }
    });
  } catch (error) {
    console.error('API: MailerLite test error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to test MailerLite connection'
    });
  }
};
