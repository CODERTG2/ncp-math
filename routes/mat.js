import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Legacy login endpoint - redirect to new auth system
router.post('/login', (req, res) => {
    res.status(410).json({
        success: false,
        message: 'This endpoint has been deprecated. Please use /api/auth/login instead.',
        newEndpoint: '/api/auth/login'
    });
});

// Get user dashboard data
router.get('/dashboard/:userType', authenticateToken, authorizeRoles(['member', 'teacher']), (req, res) => {
    const { userType } = req.params;
    const user = req.user;
    
    // Ensure user can only access their own dashboard type
    if (user.userType !== userType) {
        return res.status(403).json({
            success: false,
            message: 'You are not authorized to access this dashboard'
        });
    }
    
    // Return dashboard data based on user type
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

export default router;
