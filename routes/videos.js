import express from 'express';
import VideoRequest from '../models/VideoRequest.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Get all video requests
router.get('/', authenticateToken, authorizeRoles(['teacher']), async (req, res) => {
    try {
        const videoRequests = await VideoRequest.find().sort({ createdAt: -1 });
        res.json({ success: true, data: videoRequests });
    } catch (error) {
        console.error('Error fetching video requests:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch video requests', error: error.message });
    }
});

// Get a single video request by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const videoRequest = await VideoRequest.findById(req.params.id);
        if (!videoRequest) {
            return res.status(404).json({ success: false, message: 'Video request not found' });
        }
        
        // Check if user has permission to access this video request
        if (
            req.user.userType !== 'teacher' && 
            videoRequest.requesterId.toString() !== req.user.id && 
            videoRequest.workerId?.toString() !== req.user.id
        ) {
            return res.status(403).json({ success: false, message: 'Not authorized to access this video request' });
        }
        
        res.json({ success: true, data: videoRequest });
    } catch (error) {
        console.error('Error fetching video request:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch video request', error: error.message });
    }
});

// Create new video request
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { videoTitle, videoDescription } = req.body;
        
        if (!videoTitle || !videoDescription) {
            return res.status(400).json({ success: false, message: 'Title and description are required' });
        }
        
        const videoRequest = new VideoRequest({
            requesterId: req.user.id,
            videoTitle,
            videoDescription
        });
        
        await videoRequest.save();
        
        res.status(201).json({ success: true, data: videoRequest, message: 'Video request created successfully' });
    } catch (error) {
        console.error('Error creating video request:', error);
        res.status(500).json({ success: false, message: 'Failed to create video request', error: error.message });
    }
});

// Update video request status
router.patch('/:id/status', authenticateToken, authorizeRoles(['teacher']), async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!['not started', 'in progress', 'completed'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }
        
        const videoRequest = await VideoRequest.findById(req.params.id);
        if (!videoRequest) {
            return res.status(404).json({ success: false, message: 'Video request not found' });
        }
        
        videoRequest.status = status;
        
        // If status changes to 'in progress', assign the current teacher as worker
        if (status === 'in progress' && !videoRequest.workerId) {
            videoRequest.workerId = req.user.id;
        }
        
        await videoRequest.save();
        
        res.json({ success: true, data: videoRequest, message: 'Video request status updated successfully' });
    } catch (error) {
        console.error('Error updating video request status:', error);
        res.status(500).json({ success: false, message: 'Failed to update status', error: error.message });
    }
});

export default router;
