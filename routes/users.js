import express from 'express';
import User from '../models/User.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Get all users (teachers only)
router.get('/', authenticateToken, authorizeRoles(['teacher']), async (req, res) => {
    try {
        const users = await User.find({}, { password: 0 }); // Exclude password field
        res.json({ success: true, data: users });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch users', error: error.message });
    }
});

// Get user profile (self)
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id, { password: 0 });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, data: user });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch profile', error: error.message });
    }
});

// Get user by ID (teachers only)
router.get('/:id', authenticateToken, authorizeRoles(['teacher']), async (req, res) => {
    try {
        const user = await User.findById(req.params.id, { password: 0 });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, data: user });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch user', error: error.message });
    }
});

// Update user profile (self)
router.patch('/profile', authenticateToken, async (req, res) => {
    try {
        // Only allow certain fields to be updated
        const allowedUpdates = ['name'];
        const updates = {};
        
        Object.keys(req.body).forEach(key => {
            if (allowedUpdates.includes(key)) {
                updates[key] = req.body[key];
            }
        });
        
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ success: false, message: 'No valid update fields provided' });
        }
        
        const user = await User.findByIdAndUpdate(
            req.user.id,
            updates,
            { new: true, runValidators: true }
        ).select('-password');
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        res.json({ success: true, data: user, message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ success: false, message: 'Failed to update profile', error: error.message });
    }
});

export default router;
