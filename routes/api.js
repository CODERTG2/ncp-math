import express from 'express';
import googleSheetsService from '../services/googleSheetsService.js';
import SessionSignup from '../models/SessionSignup.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

// Get tutoring schedule
router.get('/tutoring-schedule', isAuthenticated, async (req, res) => {
  try {
    let schedule = [];
    
    // Check if Google Sheets is configured
    if (process.env.GOOGLE_SHEETS_ID && process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
      try {
        // Get schedule from Google Sheets
        schedule = await googleSheetsService.getTutoringSchedule();
      } catch (sheetsError) {
        console.warn('Google Sheets not available, using fallback data:', sheetsError.message);
        schedule = getFallbackSchedule();
      }
    } else {
      console.warn('Google Sheets not configured, using fallback data');
      schedule = getFallbackSchedule();
    }
    
    // Get signups for each session
    const scheduleWithSignups = await Promise.all(
      schedule.map(async (session) => {
        const signups = await SessionSignup.find({
          date: session.date,
          time: session.time,
          status: 'signed_up'
        }).populate('userId', 'firstName lastName');
        
        return {
          ...session,
          signedUp: signups.length,
          signedUpUsers: signups.map(signup => `${signup.userId.firstName} ${signup.userId.lastName}`)
        };
      })
    );
    
    res.json(scheduleWithSignups);
  } catch (error) {
    console.error('Error fetching tutoring schedule:', error);
    res.status(500).json({ error: 'Failed to fetch tutoring schedule' });
  }
});

// Fallback schedule data for demo purposes
function getFallbackSchedule() {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  // Generate some sample data for the current month based on your sheet structure
  const schedule = [];
  
  // Generate sessions for the current month
  for (let day = 1; day <= 30; day++) {
    const date = new Date(currentYear, currentMonth, day);
    const dateStr = date.toISOString().split('T')[0];
    const dayOfWeek = date.getDay();
    
    // Monday sessions
    if (dayOfWeek === 1) {
      schedule.push(
        {
          date: dateStr,
          day: 'Monday',
          maxTutors: 6,
          time: '3:15 PM - 4:15 PM',
          room: '320',
          cancelled: false
        },
        {
          date: dateStr,
          day: 'Monday',
          maxTutors: 4,
          time: '10:03 AM - 10:33 AM',
          room: 'Library',
          cancelled: false
        },
        {
          date: dateStr,
          day: 'Monday',
          maxTutors: 4,
          time: '10:53 AM - 11:23 AM',
          room: 'Library',
          cancelled: false
        },
        {
          date: dateStr,
          day: 'Monday',
          maxTutors: 4,
          time: '11:51 AM - 12:21 PM',
          room: 'Library',
          cancelled: false
        },
        {
          date: dateStr,
          day: 'Monday',
          maxTutors: 4,
          time: '12:41 PM - 1:11 PM',
          room: 'Library',
          cancelled: false
        }
      );
    }
    
    // Tuesday sessions
    if (dayOfWeek === 2) {
      schedule.push({
        date: dateStr,
        day: 'Tuesday',
        maxTutors: 4,
        time: '7:20 AM - 7:50 AM',
        room: 'Room 103',
        cancelled: false
      });
    }
    
    // Thursday sessions
    if (dayOfWeek === 4) {
      schedule.push(
        {
          date: dateStr,
          day: 'Thursday',
          maxTutors: 4,
          time: '7:20 AM - 7:50 AM',
          room: 'Room 103',
          cancelled: false
        },
        {
          date: dateStr,
          day: 'Thursday',
          maxTutors: 6,
          time: '3:15 PM - 4:15 PM',
          room: '320',
          cancelled: false
        }
      );
    }
    
    // Friday sessions
    if (dayOfWeek === 5) {
      schedule.push(
        {
          date: dateStr,
          day: 'Friday',
          maxTutors: 4,
          time: '10:03 AM - 10:33 AM',
          room: 'Library',
          cancelled: false
        },
        {
          date: dateStr,
          day: 'Friday',
          maxTutors: 4,
          time: '10:53 AM - 11:23 AM',
          room: 'Library',
          cancelled: false
        },
        {
          date: dateStr,
          day: 'Friday',
          maxTutors: 4,
          time: '11:51 AM - 12:21 PM',
          room: 'Library',
          cancelled: false
        },
        {
          date: dateStr,
          day: 'Friday',
          maxTutors: 4,
          time: '12:41 PM - 1:11 PM',
          room: 'Library',
          cancelled: false
        }
      );
    }
  }
  
  return schedule;
}

// Sign up for a session
router.post('/signup-session', isAuthenticated, async (req, res) => {
  try {
    const { date, time, userId, userName } = req.body;
    
    // Validate that the user is signing up for themselves
    if (userId !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    
    // Check if user is already signed up for this session
    const existingSignup = await SessionSignup.findOne({
      userId,
      date,
      time
    });
    
    if (existingSignup) {
      return res.status(400).json({ 
        success: false, 
        message: 'You are already signed up for this session' 
      });
    }
    
    // Get session details from Google Sheets to check capacity
    const schedule = await googleSheetsService.getTutoringSchedule();
    const session = schedule.find(s => s.date === date && s.time === time);
    
    if (!session) {
      return res.status(404).json({ 
        success: false, 
        message: 'Session not found' 
      });
    }
    
    if (session.cancelled) {
      return res.status(400).json({ 
        success: false, 
        message: 'This session has been cancelled' 
      });
    }
    
    // Check current signups count
    const currentSignups = await SessionSignup.countDocuments({
      date,
      time,
      status: 'signed_up'
    });
    
    if (currentSignups >= session.maxTutors) {
      return res.status(400).json({ 
        success: false, 
        message: 'This session is full' 
      });
    }
    
    // Create new signup
    const newSignup = new SessionSignup({
      userId,
      userName,
      date,
      time
    });
    
    await newSignup.save();
    
    res.json({ 
      success: true, 
      message: 'Successfully signed up for the session' 
    });
  } catch (error) {
    console.error('Error signing up for session:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: 'You are already signed up for this session' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Failed to sign up for session' 
    });
  }
});

// Cancel session signup
router.post('/cancel-signup', isAuthenticated, async (req, res) => {
  try {
    const { date, time, userId } = req.body;
    
    // Validate that the user is cancelling their own signup
    if (userId !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    
    const signup = await SessionSignup.findOneAndDelete({
      userId,
      date,
      time,
      status: 'signed_up'
    });
    
    if (!signup) {
      return res.status(404).json({ 
        success: false, 
        message: 'Signup not found' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Successfully cancelled signup' 
    });
  } catch (error) {
    console.error('Error cancelling signup:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to cancel signup' 
    });
  }
});

// Get user's signups
router.get('/my-signups', isAuthenticated, async (req, res) => {
  try {
    const signups = await SessionSignup.find({
      userId: req.user._id,
      status: 'signed_up'
    }).sort({ date: 1, time: 1 });
    
    res.json(signups);
  } catch (error) {
    console.error('Error fetching user signups:', error);
    res.status(500).json({ error: 'Failed to fetch signups' });
  }
});

export default router;
