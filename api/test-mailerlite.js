import MailerLite from '@mailerlite/mailerlite-nodejs';
import { config } from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __dirname = dirname(fileURLToPath(import.meta.url));

// Load environment variables from ../server/.env
config({ path: join(__dirname, '../server/.env') });

// Create test function
async function testMailerLite() {
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
    console.log('Starting MailerLite test...');
    
    // 1. Check API Key
    const apiKey = process.env.MAILERLITE_API_KEY;
    diagnostics.apiKey.exists = !!apiKey;
    if (apiKey) {
      diagnostics.apiKey.masked = `${apiKey.substr(0, 4)}...${apiKey.substr(-4)}`;
      console.log('API Key found:', diagnostics.apiKey.masked);
    } else {
      console.error('MAILERLITE_API_KEY is not set in environment variables');
      diagnostics.errors.push('MAILERLITE_API_KEY is not set in environment variables');
      return { success: false, diagnostics, error: 'API key not configured' };
    }

    // 2. Initialize API Client
    console.log('Initializing MailerLite client...');
    const mailerlite = new MailerLite({
      api_key: apiKey
    });
    
    // 3. Test Create Subscriber
    try {
      console.log('Testing subscriber creation...');
      const testEmail = `test.${Date.now()}@example.com`;
      
      // First, test getting subscribers to verify connection
      console.log('Testing API connection...');
      const subscribersResponse = await mailerlite.subscribers.get();
      console.log('API connection successful');
      diagnostics.testResults.connection = {
        success: true,
        response: subscribersResponse
      };

      // Then create a test subscriber
      const createResponse = await mailerlite.subscribers.createOrUpdate({
        email: testEmail,
        status: 'active'
      });
      
      console.log('Successfully created test subscriber:', testEmail);
      diagnostics.testResults.createSubscriber = {
        success: true,
        email: testEmail,
        response: createResponse
      };

      // 4. Clean up - Delete test subscriber
      try {
        console.log('Cleaning up - deleting test subscriber...');
        await mailerlite.subscribers.remove(testEmail);
        console.log('Successfully deleted test subscriber');
      } catch (e) {
        console.error('Cleanup failed:', e.message);
        diagnostics.errors.push(`Cleanup failed: ${e.message}`);
      }

    } catch (e) {
      console.error('API operation failed:', e.message);
      diagnostics.testResults.createSubscriber = {
        success: false,
        error: e.message
      };
      diagnostics.errors.push(`API operation failed: ${e.message}`);
    }

    // Return results
    const result = {
      success: diagnostics.errors.length === 0,
      diagnostics,
      timestamp: new Date().toISOString()
    };
    
    console.log('Test completed:', result);
    return result;

  } catch (error) {
    console.error('Test endpoint error:', error);
    return {
      success: false,
      diagnostics,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// Run the test
testMailerLite().then(result => {
  console.log('Final result:', JSON.stringify(result, null, 2));
}).catch(error => {
  console.error('Test failed:', error);
});
