import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import cors from 'cors';
import connectWithMongoose from './middleware/mongoose-db.js';

// Initialize mongoose connection
connectWithMongoose();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import middleware
import { authenticateToken, authorizeRoles } from './middleware/auth.js';

const app = express();
const PORT = process.env.PORT || 3000;



// CORS configuration
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://your-domain.com'] 
        : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true
}));

// Serve static files from public directory
app.use(express.static('public'));

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve the MAT portal page
app.get('/mat', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'mat.html'));
});

// Import routes
import authRoutes from './routes/auth.js';
import videoRoutes from './routes/videos.js';
import userRoutes from './routes/users.js';
import chatRoutes from './routes/chat.js';
import matRoutes from './routes/mat.js';
import calendarRoutes from './routes/calendar.js';

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/video-requests', videoRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/mat', matRoutes);
app.use('/api/calendar', calendarRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
