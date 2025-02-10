const express = require('express');
// const { Resend } = require('resend');
const cors = require('cors');
const path = require('path');
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

// Serve static files - try both with and without /rouven-webseite prefix
app.use('/', express.static(websiteRoot));
app.use('/rouven-webseite', express.static(websiteRoot));

/* Contact form functionality temporarily disabled
// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        
        // Send email using Resend
        await resend.emails.send({
            from: 'Contact Form <onboarding@resend.dev>',
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
*/

// Temporary contact form endpoint
app.post('/api/contact', (req, res) => {
    console.log('Contact form submission:', req.body);
    res.json({ success: true, message: 'Contact form functionality coming soon' });
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