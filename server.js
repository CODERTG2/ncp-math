require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');

// Import routes
const authRoutes = require('./routes/auth');
const { authenticateToken, authorizeRoles } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('Connected to MongoDB successfully');
})
.catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
});

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

// API Routes
app.use('/api/auth', authRoutes);

// API endpoint for AI chat (placeholder)
app.post('/api/chat', authenticateToken, (req, res) => {
    const { message } = req.body;
    // Placeholder response
    res.json({ 
        response: `Hello ${req.user.name}, you said: "${message}". This is a placeholder AI response!` 
    });
});

// Legacy login endpoint - redirect to new auth system
app.post('/api/mat/login', (req, res) => {
    res.status(410).json({
        success: false,
        message: 'This endpoint has been deprecated. Please use /api/auth/login instead.',
        newEndpoint: '/api/auth/login'
    });
});

// Get user dashboard data
app.get('/api/mat/dashboard/:userType', authenticateToken, authorizeRoles('member', 'teacher'), (req, res) => {
    const { userType } = req.params;
    const user = req.user;
    
    // Ensure user can only access their own dashboard type
    if (user.userType !== userType) {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Cannot access this dashboard type.'
        });
    }
    
    if (userType === 'member') {
        res.json({
            progress: 75,
            testsCompleted: 12,
            upcomingTests: [
                { name: 'Algebra II Assessment', date: '2024-12-20' },
                { name: 'Geometry Quiz', date: '2024-12-25' }
            ],
            achievements: [
                { icon: 'medal', title: 'Perfect Score on Trigonometry' },
                { icon: 'star', title: '10 Tests Streak' }
            ],
            materials: [
                { icon: 'file-pdf', name: 'Algebra Notes' },
                { icon: 'video', name: 'Geometry Videos' },
                { icon: 'calculator', name: 'Practice Problems' },
                { icon: 'chart-bar', name: 'Formula Sheets' }
            ]
        });
    } else if (userType === 'teacher') {
        res.json({
            totalStudents: 24,
            activeStudents: 18,
            upcomingEvents: [
                { name: 'Grade Meeting', date: '2024-12-18' },
                { name: 'Parent Conference', date: '2024-12-22' }
            ],
            analytics: {
                averageScore: 85,
                trend: 'up',
                completionRate: 92
            }
        });
    } else {
        res.status(400).json({ 
            success: false,
            error: 'Invalid user type' 
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
