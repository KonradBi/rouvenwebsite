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

    // Test different API endpoints
    console.log('API: Fetching forms...');
    const forms = await mailerlite.forms.list();
    console.log('API: Fetching subscribers...');
    const subscribers = await mailerlite.subscribers.list();
    console.log('API: Fetching groups...');
    const groups = await mailerlite.groups.list();

    res.json({
      success: true,
      data: {
        forms,
        subscribers,
        groups
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
