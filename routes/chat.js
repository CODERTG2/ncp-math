import express from 'express';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// API endpoint for AI chat (placeholder)
router.post('/', authenticateToken, (req, res) => {
    const { message } = req.body;
    // Placeholder response
    res.json({ 
        response: `Hello ${req.user.name}, you said: "${message}". This is a placeholder AI response!` 
    });
});

export default router;
