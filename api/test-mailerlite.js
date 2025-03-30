import MailerLite from '@mailerlite/mailerlite-nodejs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '../server/.env' });

console.log('Starting MailerLite test...');

const apiKey = process.env.MAILERLITE_API_KEY;
if (!apiKey) {
  console.error('Error: MAILERLITE_API_KEY not found in environment variables');
  process.exit(1);
}

const mailerlite = new MailerLite({
  api_key: apiKey
});

const params = {
  email: 'test@test.com',
  fields: {
    name: 'John',
    last_name: 'Doe'
  }
};

console.log('Attempting to create or update subscriber:', params);

try {
  const response = await mailerlite.subscribers.createOrUpdate(params);
  console.log('Success! Subscriber data:', response.data);
} catch (error) {
  console.error('Error occurred:', error);
  console.error('Error message:', error.message);
  if (error.response) {
    console.error('Error response:', error.response.data);
  }
}
