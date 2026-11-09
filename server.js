const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Temporary memory store for the captured source code
let capturedPages = [];

// Add express.text to catch unformatted or raw text payloads from Opera
app.use(express.text({ type: '*/*', limit: '50mb' }));

// Keep your existing urlencoded middleware below it
app.use(express.urlencoded({ extended: true, limit: '50mb' }));


// 1. The ENDPOINT that receives Opera Mini's data
app.post('/receive-source', (req, res) => {
    let url, host, html;

    // Check if Express successfully parsed it as standard form data
    if (req.body && typeof req.body === 'object' && req.body.html) {
        url = req.body.url;
        host = req.body.host;
        html = req.body.html;
    } else if (typeof req.body === 'string') {
        // Opera sent it as a raw data string. Let's extract the HTML out of it
        console.log("Caught raw text payload from Opera Mini proxy.");
        html = req.body; 
        url = "Extracted via Raw Body";
        host = "Opera Proxy Server";
    }

    if (!html || html.trim() === '') {
        return res.status(400).send('No data caught in the stream.');
    }

    // Execute your secret function logic here
    let processedHtml = html;
    if (typeof processHtmlSecretly === 'function') {
        try {
            processedHtml = processHtmlSecretly(html);
        } catch (e) {
            console.error("Error inside secret function logic:", e.message);
        }
    }

    capturedPages.push({
        url: url || 'Unknown URL',
        host: host || 'Unknown Host',
        html: processedHtml,
        timestamp: new Date().toLocaleString()
    });

    console.log(`Successfully intercepted layout stream!`);
    res.send('Success');
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
