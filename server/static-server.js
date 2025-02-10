const express = require('express');
const path = require('path');
const app = express();
const port = 3003;

// Serve static files from the rouven-webseite directory
const websiteRoot = path.join(__dirname, '..');

// First, try to serve files from the root path
app.use('/', express.static(websiteRoot));

// Then, also serve files from /rouven-webseite path
app.use('/rouven-webseite', express.static(websiteRoot));

// For any other routes, serve index.html (for client-side routing)
app.get('*', (req, res) => {
    res.sendFile(path.join(websiteRoot, 'index.html'));
});

app.listen(port, () => {
    console.log(`Website running at http://localhost:${port}`);
    console.log(`Serving files from: ${websiteRoot}`);
}); 