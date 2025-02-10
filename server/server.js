const express = require('express');
// const { Resend } = require('resend');
const cors = require('cors');
const path = require('path');
const { google } = require('googleapis');
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

// Google Sheets setup
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const SPREADSHEET_ID = process.env.SPREADSHEET_ID; // Sie müssen diese ID in .env setzen
const RANGE = 'Newsletter!A:B'; // Passt das an Ihre Spreadsheet-Struktur an

async function getGoogleSheetAuth() {
    try {
        let credentials;
        if (process.env.GOOGLE_CREDENTIALS) {
            // Parse credentials directly from environment variable
            credentials = typeof process.env.GOOGLE_CREDENTIALS === 'string' 
                ? JSON.parse(process.env.GOOGLE_CREDENTIALS)
                : process.env.GOOGLE_CREDENTIALS;
        } else {
            // Fallback to local credentials file
            credentials = require('./credentials.json');
        }

        const auth = new google.auth.GoogleAuth({
            credentials: credentials,
            scopes: SCOPES,
        });
        return auth;
    } catch (error) {
        console.error('Error getting Google Sheets auth:', error);
        throw error;
    }
}

async function appendToSheet(email) {
    try {
        const auth = await getGoogleSheetAuth();
        const sheets = google.sheets({ version: 'v4', auth });

        const values = [
            [new Date().toISOString(), email], // Datum und E-Mail
        ];

        const resource = {
            values,
        };

        const result = await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: RANGE,
            valueInputOption: 'RAW',
            resource,
        });

        console.log('Neue E-Mail zur Liste hinzugefügt:', email);
        return true;
    } catch (error) {
        console.error('Fehler beim Hinzufügen zur Google Sheet:', error);
        return false;
    }
}

// Serve static files from the root path
app.use('/', express.static(websiteRoot));

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

// Newsletter subscription endpoint
app.post('/api/newsletter', async (req, res) => {
    try {
        const { email } = req.body;
        
        // Validate email
        if (!email || !email.includes('@')) {
            return res.status(400).json({ 
                success: false, 
                message: 'Ungültige E-Mail-Adresse' 
            });
        }

        // Add to Google Sheet
        const success = await appendToSheet(email);

        if (success) {
            res.json({ 
                success: true, 
                message: 'Vielen Dank für Ihre Anmeldung zum Newsletter!' 
            });
        } else {
            throw new Error('Failed to add to spreadsheet');
        }
    } catch (error) {
        console.error('Newsletter subscription error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.' 
        });
    }
});

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