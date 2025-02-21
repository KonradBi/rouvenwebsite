const MailerLite = require('@mailerlite/mailerlite-nodejs').default;

module.exports = async (req, res) => {
  const diagnostics = {
    apiKey: {
      exists: false,
      value: null // We'll only show first/last 4 chars
    },
    sdk: {
      version: require('@mailerlite/mailerlite-nodejs/package.json').version,
      initialized: false
    },
    testResults: {
      createSubscriber: null,
      getSubscriber: null,
      deleteSubscriber: null
    },
    errors: []
  };

  try {
    // 1. Check API Key
    const apiKey = process.env.MAILERLITE_API_KEY;
    diagnostics.apiKey.exists = !!apiKey;
    if (apiKey) {
      diagnostics.apiKey.value = `${apiKey.substr(0, 4)}...${apiKey.substr(-4)}`;
    } else {
      diagnostics.errors.push('MAILERLITE_API_KEY is not set in environment variables');
    }

    // 2. Initialize SDK
    try {
      const mailerlite = new MailerLite({
        api_key: apiKey || 'test'
      });
      diagnostics.sdk.initialized = true;
    } catch (e) {
      diagnostics.errors.push(`SDK initialization failed: ${e.message}`);
    }

    // Only proceed with tests if we have an API key
    if (apiKey) {
      const mailerlite = new MailerLite({ api_key: apiKey });
      
      // 3. Test Create Subscriber
      try {
        const testEmail = `test.${Date.now()}@example.com`;
        const createResponse = await mailerlite.subscribers.create({
          email: testEmail,
          status: 'active'
        });
        
        diagnostics.testResults.createSubscriber = {
          success: true,
          response: createResponse,
          email: testEmail
        };

        // 4. Test Get Subscriber
        try {
          const getResponse = await mailerlite.subscribers.find(testEmail);
          diagnostics.testResults.getSubscriber = {
            success: true,
            response: getResponse
          };
        } catch (e) {
          diagnostics.testResults.getSubscriber = {
            success: false,
            error: e.message
          };
          diagnostics.errors.push(`Get subscriber failed: ${e.message}`);
        }

        // 5. Test Delete Subscriber (cleanup)
        try {
          const deleteResponse = await mailerlite.subscribers.delete(testEmail);
          diagnostics.testResults.deleteSubscriber = {
            success: true,
            response: deleteResponse
          };
        } catch (e) {
          diagnostics.testResults.deleteSubscriber = {
            success: false,
            error: e.message
          };
          diagnostics.errors.push(`Delete subscriber failed: ${e.message}`);
        }

      } catch (e) {
        diagnostics.testResults.createSubscriber = {
          success: false,
          error: e.message
        };
        diagnostics.errors.push(`Create subscriber failed: ${e.message}`);
      }
    }

    // Return full diagnostics
    res.json({
      success: diagnostics.errors.length === 0,
      diagnostics,
      timestamp: new Date().toISOString(),
      environment: {
        nodeVersion: process.version,
        platform: process.platform
      }
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
