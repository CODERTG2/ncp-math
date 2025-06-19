import express from 'express';
import Event from '../models/Event.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Get all events with pagination, sorting, and filtering
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            sortBy = 'eventTime',
            order = 'asc',
            upcoming = 'false',
            search = ''
        } = req.query;
        
        // Base query
        let query = {};
        
        // Filter for upcoming events only if specified
        if (upcoming === 'true') {
            query.eventTime = { $gte: new Date() };
        }
        
        // Search functionality for event name or description
        if (search) {
            query.$or = [
                { eventName: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        
        // Add access control - users can see their own events or events they're attending
        if (req.user.userType !== 'teacher') {
            query.$or = [
                { organizerId: req.user.id },
                { attendees: req.user.id }
            ];
        }
        
        // Execute query with pagination and sorting
        const sortDirection = order === 'desc' ? -1 : 1;
        const sortOptions = {};
        sortOptions[sortBy] = sortDirection;
        
        const events = await Event.find(query)
            .sort(sortOptions)
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .populate('organizerId', 'name')
            .populate('attendees', 'name');
            
        const total = await Event.countDocuments(query);
        
        res.json({
            success: true,
            data: events,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch events', error: error.message });
    }
});

// Get upcoming events (next 7 days)
router.get('/upcoming', authenticateToken, async (req, res) => {
    try {
        console.log('Upcoming events request received, user:', req.user?.name, 'userType:', req.user?.userType);
        
        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);
        
        // Base query for upcoming events
        const query = {
            eventTime: { $gte: today, $lte: nextWeek }
        };
        
        console.log('Base query:', JSON.stringify(query));
        
        // Add access control - users can see their own events or events they're attending
        if (req.user.userType !== 'teacher') {
            query.$or = [
                { organizerId: req.user.id },
                { attendees: req.user.id }
            ];
            console.log('User-specific query:', JSON.stringify(query));
        }
        
        try {
            // Get upcoming events sorted by date
            const events = await Event.find(query)
                .sort({ eventTime: 1 })
                .limit(5)
                .populate('organizerId', 'name');
            
            console.log(`Found ${events.length} upcoming events`);
            res.json({ success: true, data: events });
        } catch (dbError) {
            console.error('Database error when fetching events:', dbError);
            // Return empty array instead of error
            res.json({ success: true, data: [], dbError: dbError.message });
        }
    } catch (error) {
        console.error('Error fetching upcoming events:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch upcoming events', 
            error: error.message 
        });
    }
});

// Get a single event by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate('organizerId', 'name')
            .populate('attendees', 'name');
        
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }
        
        // Check if user has access to this event
        if (
            req.user.userType !== 'teacher' && 
            event.organizerId.toString() !== req.user.id && 
            !event.attendees.some(attendee => attendee._id.toString() === req.user.id)
        ) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }
        
        res.json({ success: true, data: event });
    } catch (error) {
        console.error('Error fetching event:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch event', error: error.message });
    }
});

// Create a new event
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { eventName, eventDate, eventTime, eventLocation, description, attendees } = req.body;
        
        if (!eventName || !eventDate || !eventTime) {
            return res.status(400).json({ 
                success: false, 
                message: 'Event name, date and time are required' 
            });
        }
        
        // Combine date and time into a JavaScript Date object
        const [year, month, day] = eventDate.split('-').map(Number);
        const [hours, minutes] = eventTime.split(':').map(Number);
        
        const eventDateTime = new Date(year, month - 1, day, hours, minutes);
        
        // Create new event
        const event = new Event({
            eventName,
            eventTime: eventDateTime,
            eventLocation: eventLocation || 'TBD',
            organizerId: req.user.id,
            description: description || '',
            attendees: attendees || []
        });
        
        await event.save();
        
        res.status(201).json({ 
            success: true, 
            message: 'Event created successfully', 
            data: event 
        });
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to create event', 
            error: error.message 
        });
    }
});

// Update an event
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const eventId = req.params.id;
        const updates = req.body;
        
        // Find the event
        const event = await Event.findById(eventId);
        
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }
        
        // Check if user is authorized to update this event
        if (req.user.userType !== 'teacher' && event.organizerId.toString() !== req.user.id) {
            return res.status(403).json({ 
                success: false, 
                message: 'You are not authorized to update this event' 
            });
        }
        
        // Handle date and time updates
        if (updates.eventDate && updates.eventTime) {
            const [year, month, day] = updates.eventDate.split('-').map(Number);
            const [hours, minutes] = updates.eventTime.split(':').map(Number);
            updates.eventTime = new Date(year, month - 1, day, hours, minutes);
        } else if (updates.eventDate) {
            // Keep the current time, update just the date
            const currentTime = new Date(event.eventTime);
            const [year, month, day] = updates.eventDate.split('-').map(Number);
            updates.eventTime = new Date(year, month - 1, day, 
                currentTime.getHours(), currentTime.getMinutes());
        } else if (updates.eventTime) {
            // Keep the current date, update just the time
            const currentDate = new Date(event.eventTime);
            const [hours, minutes] = updates.eventTime.split(':').map(Number);
            updates.eventTime = new Date(
                currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 
                hours, minutes
            );
        }
        
        // Remove eventDate as it's not in the schema
        delete updates.eventDate;
        
        // Update the event
        const updatedEvent = await Event.findByIdAndUpdate(
            eventId,
            updates,
            { new: true, runValidators: true }
        );
        
        res.json({ 
            success: true, 
            message: 'Event updated successfully', 
            data: updatedEvent 
        });
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to update event', 
            error: error.message 
        });
    }
});

// Delete an event
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }
        
        // Check if user is authorized to delete this event
        if (req.user.userType !== 'teacher' && event.organizerId.toString() !== req.user.id) {
            return res.status(403).json({ 
                success: false, 
                message: 'You are not authorized to delete this event' 
            });
        }
        
        await Event.findByIdAndDelete(req.params.id);
        
        res.json({ 
            success: true, 
            message: 'Event deleted successfully' 
        });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to delete event', 
            error: error.message 
        });
    }
});

// Add user to event attendees (join an event)
router.post('/:id/join', authenticateToken, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }
        
        // Check if user is already attending
        if (event.attendees.includes(req.user.id)) {
            return res.status(400).json({ 
                success: false, 
                message: 'You are already attending this event' 
            });
        }
        
        // Add user to attendees
        event.attendees.push(req.user.id);
        await event.save();
        
        res.json({ 
            success: true, 
            message: 'Successfully joined event', 
            data: event 
        });
    } catch (error) {
        console.error('Error joining event:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to join event', 
            error: error.message 
        });
    }
});

// Remove user from event attendees (leave an event)
router.post('/:id/leave', authenticateToken, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }
        
        // Check if user is attending
        if (!event.attendees.includes(req.user.id)) {
            return res.status(400).json({ 
                success: false, 
                message: 'You are not attending this event' 
            });
        }
        
        // Remove user from attendees
        event.attendees = event.attendees.filter(id => id.toString() !== req.user.id);
        await event.save();
        
        res.json({ 
            success: true, 
            message: 'Successfully left event', 
            data: event 
        });
    } catch (error) {
        console.error('Error leaving event:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to leave event', 
            error: error.message 
        });
    }
});

// Test endpoint - no auth required (for debugging only)
router.get('/test', async (req, res) => {
    try {
        console.log('Calendar test endpoint called');
        
        // Return some sample events
        const sampleEvents = [
            {
                _id: 'test1',
                eventName: 'Sample Test Event 1',
                eventTime: new Date(),
                eventLocation: 'Test Location',
                description: 'This is a test event from the /test endpoint',
                organizerId: { name: 'Test User' }
            },
            {
                _id: 'test2',
                eventName: 'Sample Test Event 2',
                eventTime: new Date(Date.now() + 86400000), // Tomorrow
                eventLocation: 'Another Location',
                description: 'This is another test event',
                organizerId: { name: 'Test User' }
            }
        ];
        
        res.json({ success: true, data: sampleEvents });
    } catch (error) {
        console.error('Error in test endpoint:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Test endpoint error', 
            error: error.message 
        });
    }
});

export default router;
