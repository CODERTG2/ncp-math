import express from 'express';
import googleSheetsService from '../services/googleSheetsService.js';
import SessionSignup from '../models/SessionSignup.js';
import User from '../models/User.js';
import CheckIn from '../models/CheckIn.js';
import emailService from '../services/emailService.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

// Get tutoring schedule
router.get('/tutoring-schedule', isAuthenticated, async (req, res) => {
  try {
    let schedule = [];
    
    // Check if Google Sheets is configured
    if (process.env.GOOGLE_SHEETS_ID && process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
      try {
        // Get schedule from Google Sheets (now includes tutor signups)
        schedule = await googleSheetsService.getTutoringSchedule();
      } catch (sheetsError) {
        console.warn('Google Sheets not available, using fallback data:', sheetsError.message);
        schedule = getFallbackSchedule();
      }
    } else {
      console.warn('Google Sheets not configured, using fallback data');
      schedule = getFallbackSchedule();
    }
    
    res.json(schedule);
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
    const { date, time, userId } = req.body;
    const userName = `${req.user.firstName} ${req.user.lastName}`;
    
    // Validate that the user is signing up for themselves
    if (userId !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    
    // Get session details from Google Sheets
    const sessionData = await googleSheetsService.getSessionData(date, time);
    
    if (!sessionData) {
      return res.status(404).json({ 
        success: false, 
        message: 'Session not found' 
      });
    }
    
    if (sessionData.cancelled) {
      return res.status(400).json({ 
        success: false, 
        message: 'This session has been cancelled' 
      });
    }
    
    // Add tutor to Google Sheets
    await googleSheetsService.addTutorToSession(date, time, userName);
    
    res.json({ 
      success: true, 
      message: 'Successfully signed up for the session' 
    });
  } catch (error) {
    console.error('Error signing up for session:', error);
    
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to sign up for session' 
    });
  }
});

// Cancel session signup
router.post('/cancel-signup', isAuthenticated, async (req, res) => {
  try {
    const { date, time, userId } = req.body;
    const userName = `${req.user.firstName} ${req.user.lastName}`;
    
    // Validate that the user is cancelling their own signup
    if (userId !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    
    // Remove tutor from Google Sheets
    await googleSheetsService.removeTutorFromSession(date, time, userName);
    
    res.json({ 
      success: true, 
      message: 'Successfully cancelled signup' 
    });
  } catch (error) {
    console.error('Error cancelling signup:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to cancel signup' 
    });
  }
});

// Get user's signups
router.get('/my-signups', isAuthenticated, async (req, res) => {
  try {
    const userName = `${req.user.firstName} ${req.user.lastName}`;
    
    // Get all sessions from Google Sheets
    const schedule = await googleSheetsService.getTutoringSchedule();
    
    // Filter sessions where the user is signed up
    const userSignups = [];
    
    for (const session of schedule) {
      // Check if user is in this session's tutor list
      const userTutor = session.tutors.find(tutor => tutor.name === userName);
      if (userTutor) {
        userSignups.push({
          date: session.date,
          time: session.time,
          room: session.room,
          day: session.day,
          checkedIn: userTutor.checkedIn,
          cancelled: session.cancelled,
          displayStatus: session.cancelled ? 'session_cancelled' : 
                        userTutor.checkedIn ? 'attended' : 'signed_up'
        });
      }
    }
    
    // Sort by date and time
    userSignups.sort((a, b) => {
      const dateA = new Date(a.date + 'T' + convertTimeToISO(a.time));
      const dateB = new Date(b.date + 'T' + convertTimeToISO(b.time));
      return dateA - dateB;
    });
    
    res.json(userSignups);
  } catch (error) {
    console.error('Error fetching user signups:', error);
    res.status(500).json({ error: 'Failed to fetch signups' });
  }
});

// Teacher-only endpoints
function isTeacher(req, res, next) {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ success: false, message: 'Teacher access required' });
  }
  next();
}

// Update session details (teachers only)
router.post('/update-session', isAuthenticated, isTeacher, async (req, res) => {
  try {
    const { date, time, updates } = req.body;
    
    console.log('Update session request:', { date, time, updates });
    
    // Validate required fields
    if (!date || !time || !updates) {
      console.log('Validation failed: missing required fields');
      return res.status(400).json({ 
        success: false, 
        message: 'Date, time, and updates are required' 
      });
    }

    // Check if Google Sheets is configured
    if (!process.env.GOOGLE_SHEETS_ID || !process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
      console.log('Google Sheets not configured');
      return res.status(500).json({ 
        success: false, 
        message: 'Google Sheets not configured' 
      });
    }

    // Get current session details before updating
    console.log('Getting current schedule...');
    const currentSchedule = await googleSheetsService.getTutoringSchedule();
    const currentSession = currentSchedule.find(session => 
      session.date === date && session.time === time
    );

    if (!currentSession) {
      console.log('Session not found:', { date, time });
      return res.status(404).json({ 
        success: false, 
        message: 'Session not found' 
      });
    }

    console.log('Found current session:', currentSession);

    // Find all students signed up for this session
    console.log('Finding affected signups...');
    const affectedSignups = await SessionSignup.find({
      date: date,
      time: time,
      status: 'signed_up'
    }).populate('userId', 'firstName lastName email');

    console.log('Found affected signups:', affectedSignups.length);

    // Update the session in Google Sheets first
    console.log('Updating session in Google Sheets...');
    await googleSheetsService.updateSession(date, time, updates);
    console.log('Session updated in Google Sheets successfully');

    // Determine what changed
    const changes = {};
    const changeReasons = [];
    
    if (updates.time && updates.time !== currentSession.time) {
      changes.time = updates.time;
      changeReasons.push(`Time changed from ${currentSession.time} to ${updates.time}`);
    }
    if (updates.room && updates.room !== currentSession.room) {
      changes.room = updates.room;
      changeReasons.push(`Room changed from ${currentSession.room || 'TBD'} to ${updates.room}`);
    }
    if (updates.maxTutors && updates.maxTutors !== currentSession.maxTutors) {
      changes.maxTutors = updates.maxTutors;
      changeReasons.push(`Max tutors changed from ${currentSession.maxTutors} to ${updates.maxTutors}`);
    }

    console.log('Changes detected:', changes);

    // Handle session cancellation
    if (updates.cancelled === true && !currentSession.cancelled) {
      console.log('Session cancelled, updating signups...');
      
      if (affectedSignups.length > 0) {
        // Update signups to reflect cancellation (only if there are signups)
        try {
          await SessionSignup.updateMany(
            { date: date, time: time, status: 'signed_up' },
            { 
              status: 'session_cancelled',
              sessionStatus: 'cancelled',
              lastNotified: new Date(),
              changeReason: 'Session cancelled by teacher'
            }
          );
          console.log('Updated signups for cancellation');
        } catch (updateError) {
          console.log('Error updating signups for cancellation:', updateError.message);
        }
      }

      // Send cancellation emails to affected students
      for (const signup of affectedSignups) {
        if (signup.userId && signup.userId.email) {
          try {
            await emailService.sendSessionCancelledEmail(signup.userId, {
              date: date,
              time: currentSession.time,
              room: currentSession.room
            });
          } catch (emailError) {
            console.log('Error sending cancellation email:', emailError.message);
          }
        }
      }

      changeReasons.push('Session cancelled');
    } else if (Object.keys(changes).length > 0) {
      console.log('Session updated, updating signups...');
      
      if (affectedSignups.length > 0) {
        // Session was updated but not cancelled
        try {
          await SessionSignup.updateMany(
            { date: date, time: time, status: 'signed_up' },
            { 
              status: 'session_updated',
              sessionStatus: 'updated',
              lastNotified: new Date(),
              changeReason: changeReasons.join(', ')
            }
          );
          console.log('Updated signups for session changes');
        } catch (updateError) {
          console.log('Error updating signups for changes:', updateError.message);
        }
      }

      // Send update emails to affected students
      const newSessionDetails = { ...currentSession, ...updates };
      for (const signup of affectedSignups) {
        if (signup.userId && signup.userId.email) {
          try {
            await emailService.sendSessionUpdatedEmail(
              signup.userId, 
              currentSession, 
              newSessionDetails, 
              changes
            );
          } catch (emailError) {
            console.log('Error sending update email:', emailError.message);
          }
        }
      }
    }
    
    console.log('Session update completed successfully');
    res.json({ 
      success: true, 
      message: 'Session updated successfully',
      affectedStudents: affectedSignups.length,
      changes: changeReasons
    });
  } catch (error) {
    console.error('Error updating session:', error);
    res.status(500).json({ 
      success: false, 
      message: `Failed to update session: ${error.message}` 
    });
  }
});

// Add new session (teachers only)
router.post('/add-session', isAuthenticated, isTeacher, async (req, res) => {
  try {
    const { date, day, maxTutors, time, room } = req.body;
    
    // Validate required fields
    if (!date || !day || !maxTutors || !time || !room) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    // Check if Google Sheets is configured
    if (!process.env.GOOGLE_SHEETS_ID || !process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
      return res.status(500).json({ 
        success: false, 
        message: 'Google Sheets not configured' 
      });
    }

    // Add the session to Google Sheets
    await googleSheetsService.addSession(date, day, maxTutors, time, room);
    
    res.json({ 
      success: true, 
      message: 'Session added successfully' 
    });
  } catch (error) {
    console.error('Error adding session:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to add session' 
    });
  }
});

// Delete session (teachers only)
router.post('/delete-session', isAuthenticated, isTeacher, async (req, res) => {
  try {
    const { date, time } = req.body;
    
    // Validate required fields
    if (!date || !time) {
      return res.status(400).json({ 
        success: false, 
        message: 'Date and time are required' 
      });
    }

    // Check if Google Sheets is configured
    if (!process.env.GOOGLE_SHEETS_ID || !process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
      return res.status(500).json({ 
        success: false, 
        message: 'Google Sheets not configured' 
      });
    }

    // Get session details before deletion
    const currentSchedule = await googleSheetsService.getTutoringSchedule();
    const sessionToDelete = currentSchedule.find(session => 
      session.date === date && session.time === time
    );

    // Find all students signed up for this session
    const affectedSignups = await SessionSignup.find({
      date: date,
      time: time,
      status: 'signed_up'
    }).populate('userId', 'firstName lastName email');

    // Update signups to reflect deletion
    await SessionSignup.updateMany(
      { date: date, time: time },
      { 
        status: 'session_cancelled',
        sessionStatus: 'cancelled',
        lastNotified: new Date(),
        changeReason: 'Session deleted by teacher'
      }
    );

    // Send cancellation emails to affected students
    if (sessionToDelete) {
      for (const signup of affectedSignups) {
        if (signup.userId && signup.userId.email) {
          await emailService.sendSessionCancelledEmail(signup.userId, {
            date: date,
            time: time,
            room: sessionToDelete.room
          });
        }
      }
    }

    // Delete the session from Google Sheets
    await googleSheetsService.deleteSession(date, time);
    
    res.json({ 
      success: true, 
      message: 'Session deleted successfully',
      affectedStudents: affectedSignups.length
    });
  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete session' 
    });
  }
});

// Get user's signups with status (for student dashboard)
// Helper function to convert time string to ISO format
function convertTimeToISO(timeString) {
  const [time, period] = timeString.split(' ');
  const [hours, minutes] = time.split(':');
  let hour24 = parseInt(hours);
  
  if (period === 'PM' && hour24 !== 12) {
    hour24 += 12;
  } else if (period === 'AM' && hour24 === 12) {
    hour24 = 0;
  }
  
  return `${hour24.toString().padStart(2, '0')}:${minutes}:00`;
}

// Helper function to get session hour for Math Tables requirement
function getSessionHour(timeString) {
  const [time, period] = timeString.split(' ');
  const [hours] = time.split(':');
  let hour24 = parseInt(hours);
  
  if (period === 'PM' && hour24 !== 12) {
    hour24 += 12;
  } else if (period === 'AM' && hour24 === 12) {
    hour24 = 0;
  }
  
  return hour24;
}

export default router;
