import MailerLite from '@mailerlite/mailerlite-nodejs';

export default async function handler(req, res) {
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
  
  // Add Content-Security-Policy header - but not for the API endpoint
  // This could be causing issues with fetch requests
  // res.setHeader('Content-Security-Policy', "default-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:;");

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    console.log('[API] Handling OPTIONS request');
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    console.log('[API] Invalid method:', req.method);
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    console.log('[API] Processing POST request');
    const { email } = req.body;
    
    if (!email) {
      console.log('[API] Email missing in request');
      return res.status(400).json({ 
        success: false, 
        error: 'Email is required' 
      });
    }

    console.log('[API] Checking API key');
    const apiKey = process.env.MAILERLITE_API_KEY;
    if (!apiKey) {
      console.error('MAILERLITE_API_KEY not found in environment variables');
      return res.status(500).json({ 
        success: false, 
        error: 'Newsletter service configuration error' 
      });
    }

    console.log('[API] Sending request to MailerLite API');
    const mailerlite = new MailerLite({
      api_key: apiKey
    });

    // Create or update subscriber
    const response = await mailerlite.subscribers.createOrUpdate({
      email: email,
      status: 'active',
      fields: {
        source: 'Website Newsletter Form'
      }
    });

    console.log('[API] Subscriber created or updated:', response.data);

    // If group ID is configured, add subscriber to group
    if (process.env.MAILERLITE_GROUP_ID) {
      console.log('[API] Adding subscriber to group:', process.env.MAILERLITE_GROUP_ID);
      try {
        await mailerlite.groups.addSubscribers(process.env.MAILERLITE_GROUP_ID, [{
          email: email
        }]);
        console.log('[API] Subscriber added to group successfully');
      } catch (groupError) {
        console.error('[API] Failed to add subscriber to group:', groupError);
        // Don't fail the whole request if just the group assignment fails
      }
    }

    // Instead of sending a separate campaign email, use the automation features
    // Or alternatively, just use the double opt-in feature which is available in MailerLite settings
    console.log('[API] Subscription successful');
    res.json({ 
      success: true, 
      message: 'Vielen Dank für Ihre Anmeldung! Sie erhalten in Kürze eine Bestätigungs-E-Mail.'
    });
  } catch (error) {
    console.error('Newsletter subscription error:', error);

    // Handle specific MailerLite errors
    if (error.response?.status === 422) {
      return res.status(422).json({
        success: false,
        error: 'Diese E-Mail-Adresse scheint ungültig zu sein. Bitte überprüfen Sie Ihre Eingabe.'
      });
    }

    if (error.response?.status === 429) {
      return res.status(429).json({
        success: false,
        error: 'Zu viele Anfragen. Bitte versuchen Sie es in einigen Minuten erneut.'
      });
    }

    res.status(500).json({ 
      success: false, 
      error: 'Es gab einen Fehler bei der Newsletter-Anmeldung. Bitte versuchen Sie es später erneut.' 
    });
  }
}
