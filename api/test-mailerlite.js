import { MailerLite } from '@mailerlite/mailerlite-nodejs';

export default async (req, res) => {
  const diagnostics = {
    apiKey: {
      exists: false,
      masked: null
    },
    testResults: {
      connection: null,
      createSubscriber: null
    },
    errors: []
  };

  try {
    // 1. Check API Key
    const apiKey = process.env.MAILERLITE_API_KEY;
    diagnostics.apiKey.exists = !!apiKey;
    if (apiKey) {
      diagnostics.apiKey.masked = `${apiKey.substr(0, 4)}...${apiKey.substr(-4)}`;
    } else {
      diagnostics.errors.push('MAILERLITE_API_KEY is not set in environment variables');
      return res.status(500).json({
        success: false,
        diagnostics,
        error: 'API key not configured'
      });
    }

    // 2. Initialize API Client
    const client = new MailerLite({
      api_key: apiKey
    });
    
    // 3. Test Create Subscriber
    try {
      const testEmail = `test.${Date.now()}@example.com`;
      const createResponse = await client.subscribers.create({
        email: testEmail,
        status: 'active'
      });
      
      diagnostics.testResults.createSubscriber = {
        success: true,
        email: testEmail,
        response: createResponse
      };

      // 4. Clean up - Delete test subscriber
      try {
        await client.subscribers.delete(testEmail);
      } catch (e) {
        diagnostics.errors.push(`Cleanup failed: ${e.message}`);
      }

    } catch (e) {
      diagnostics.testResults.createSubscriber = {
        success: false,
        error: e.message
      };
      diagnostics.errors.push(`Create subscriber failed: ${e.message}`);
    }

    // Return results
    res.json({
      success: diagnostics.errors.length === 0,
      diagnostics,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Test endpoint error:', error);
    res.status(500).json({
      success: false,
      diagnostics,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};
