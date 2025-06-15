const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from public directory
app.use(express.static('public'));

// Parse JSON bodies
app.use(express.json());

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoint for AI chat (placeholder)
app.post('/api/chat', (req, res) => {
    const { message } = req.body;
    // Placeholder response
    res.json({ 
        response: `You said: "${message}". This is a placeholder AI response!` 
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
