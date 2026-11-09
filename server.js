const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Temporary memory store for the captured source code
let capturedPages = [];

// Middleware to parse URL-encoded form data sent by Opera Mini
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 1. The ENDPOINT that receives Opera Mini's data
app.post('/receive-source', (req, res) => {
    const { url, host, html } = req.body;

    if (!html) {
        return res.status(400).send('No HTML data received.');
    }

    // Save the data to our temporary array
    capturedPages.push({
        url: url || 'Unknown URL',
        host: host || 'Unknown Host',
        html: html,
        timestamp: new Date().toLocaleString()
    });

    console.log(`Received source code from: ${url}`);
    
    // Opera Mini expects a response, or it might show an error to the user
    res.send('Source successfully captured by backend!');
});

// 2. The WEBPAGE that displays the captured data to you
app.get('/', (req, res) => {
    if (capturedPages.length === 0) {
        return res.send('<h1>No pages captured yet.</h1><p>Send data from Opera Mini first.</p>');
    }

    // Generate a simple view page
    let htmlOutput = '<h1>Captured Opera Mini Sources</h1>';
    capturedPages.forEach((page, index) => {
        htmlOutput += `
            <div style="border: 1px solid #ccc; padding: 15px; margin-bottom: 20px; border-radius: 5px;">
                <h3>#${index + 1} - URL: <a href="${page.url}" target="_blank">${page.url}</a></h3>
                <p><strong>Host:</strong> ${page.host} | <strong>Captured At:</strong> ${page.timestamp}</p>
                <textarea style="width: 100%; height: 200px;" readonly>${escapeHtml(page.html)}</textarea>
            </div>
        `;
    });

    res.send(htmlOutput);
});

// Helper function to prevent browser rendering issues when displaying raw HTML string
function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
