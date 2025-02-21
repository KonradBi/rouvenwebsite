const express = require('express');
const { Resend } = require('resend');
const cors = require('cors');
const path = require('path');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const port = 3001;

// Middleware
app.use(express.json());
app.use(cors());

// Define absolute paths
const serverDir = path.resolve(__dirname);
const websiteRoot = path.resolve(serverDir, '..');
console.log('Server directory:', serverDir);
console.log('Website root directory:', websiteRoot);

// Serve static files from the root path
app.use('/', express.static(websiteRoot));

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        
        // Send email using Resend
        await resend.emails.send({
            from: 'Rouvenwebseite <rz@rouvenzietz.de>',
            to: process.env.RECIPIENT_EMAIL,
            subject: `Neue Kontaktanfrage: ${subject}`,
            html: `
                <h2>Neue Kontaktanfrage von der Website</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>E-Mail:</strong> ${email}</p>
                <p><strong>Betreff:</strong> ${subject}</p>
                <p><strong>Nachricht:</strong></p>
                <p>${message}</p>
            `
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Failed to send email' });
    }
});

// Newsletter subscription endpoint
app.post('/api/subscribe', async (req, res) => {
    try {
        const { email } = req.body;
        
        const response = await fetch('https://connect.mailerlite.com/api/subscribers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${process.env.MAILERLITE_API_KEY}`
            },
            body: JSON.stringify({
                email: email,
                ...(process.env.MAILERLITE_GROUP_ID ? { groups: [process.env.MAILERLITE_GROUP_ID] } : {})
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to subscribe');
        }

        res.json({ success: true, data });
    } catch (error) {
        console.error('Newsletter subscription error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message || 'Failed to subscribe to newsletter' 
        });
    }
});

// For any other routes, serve index.html
app.get('*', (req, res) => {
    const indexPath = path.join(websiteRoot, 'index.html');
    console.log('Serving index.html from:', indexPath);
    res.sendFile(indexPath);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`Serving files from: ${websiteRoot}`);
}); 