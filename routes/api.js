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

// Check-in route
router.post('/checkin', isAuthenticated, async (req, res) => {
  try {
    const { sessionDate, sessionTime, deviceFingerprint } = req.body;
    const userId = req.user.id;
    const userName = `${req.user.firstName} ${req.user.lastName}`;

    // Validate required fields
    if (!sessionDate || !sessionTime) {
      return res.redirect('/check-in?error=' + encodeURIComponent('Session date and time are required'));
    }


    // Validate session time format and check if it's within allowed window
    let now;
    try {
      if (process.env.TIMEZONE === "America/Chicago") {
        now = new Date();
      } else {
        const utcNow = new Date();
        now = new Date(utcNow.toLocaleString("en-US", {timeZone: "America/Chicago"}));
      }
    } catch (e) {
      console.error('Error getting current time:', e);
    }
    console.log('Current time:', now);

    let sessionStartTime, sessionEndTime;
    // Handle both simple times (e.g., "3:00 PM") and time ranges (e.g., "3:15 PM - 4:15 PM")
    if (sessionTime.includes(' - ')) {
      // Time range format
      const [startTime, endTime] = sessionTime.split(' - ');
      sessionStartTime = new Date(`${sessionDate}T${convertTimeToISO(startTime)}`);
      sessionEndTime = new Date(`${sessionDate}T${convertTimeToISO(endTime)}`);
    } else {
      // Simple time format - assume 1 hour session
      sessionStartTime = new Date(`${sessionDate}T${convertTimeToISO(sessionTime)}`);
      sessionEndTime = new Date(sessionStartTime.getTime() + 60 * 60 * 1000); // Add 1 hour
    }

    // Allow check-in from 15 min before start to 15 min after end
    const checkinWindowStart = new Date(sessionStartTime.getTime() - 15 * 60 * 1000);
    const checkinWindowEnd = new Date(sessionEndTime.getTime() + 15 * 60 * 1000);

    if (now < checkinWindowStart || now > checkinWindowEnd) {
      const timeInfo = sessionTime.includes(' - ')
        ? `between ${sessionTime}`
        : `at ${sessionTime}`;
      return res.redirect('/check-in?error=' + encodeURIComponent(`You can only check in from 15 minutes before until 15 minutes after your session time ${timeInfo}.`));
    }

    // Check if user has a signup for this session
    const schedule = await googleSheetsService.getTutoringSchedule();
    const session = schedule.find(s => s.date === sessionDate && s.time === sessionTime);
    
    if (!session) {
      return res.redirect('/check-in?error=' + encodeURIComponent('Session not found'));
    }

    // Check if user is signed up for this session
    const userTutor = session.tutors.find(tutor => tutor.name === userName);
    if (!userTutor) {
      return res.redirect('/check-in?error=' + encodeURIComponent('You are not signed up for this session'));
    }

    // Check if user is already checked in
    if (userTutor.checkedIn) {
      return res.redirect('/check-in?warning=' + encodeURIComponent('You have already checked in for this session'));
    }

    // Check device fingerprint limit (max 2 check-ins per day per device)
    const todayCheckIns = await CheckIn.countDocuments({
      deviceFingerprint: deviceFingerprint,
      sessionDate: sessionDate
    });

    if (todayCheckIns >= 2) {
      return res.redirect('/check-in?error=' + encodeURIComponent('You have reached the maximum check-ins (2) for today from this device'));
    }

    // Update check-in status in Google Sheets
    await googleSheetsService.updateTutorCheckIn(sessionDate, sessionTime, userName, true);

    // Check if Math Tables photo is required (sessions between 9 AM and 2 PM)
    const sessionHour = getSessionHour(sessionTime);
    const mathTablesRequired = sessionHour >= 9 && sessionHour <= 14;

    // Create check-in record in database

    const isWithinTimeWindow = now >= checkinWindowStart && now <= checkinWindowEnd;
    // Prevent duplicate check-ins for the same user/session
    const existingCheckIn = await CheckIn.findOne({
      userId: userId,
      sessionDate: sessionDate,
      sessionTime: sessionTime
    });

    if (!existingCheckIn) {
      const checkIn = new CheckIn({
        userId: userId,
        userName: userName,
        sessionDate: sessionDate,
        sessionTime: sessionTime,
        deviceFingerprint: deviceFingerprint,
        checkInTime: now,
        isWithinTimeWindow: isWithinTimeWindow,
        mathTablesRequired: mathTablesRequired
      });
      await checkIn.save();
    }
    // Always redirect with success message (even if already checked in in DB)
    const successMessage = 'Successfully checked in for your session!';
    let redirectUrl = '/check-in?success=' + encodeURIComponent(successMessage);
    if (mathTablesRequired) {
      redirectUrl += '&mathTablesRequired=true';
    }
    return res.redirect(redirectUrl);

  } catch (error) {
    console.error('Error during check-in:', error);
    res.redirect('/check-in?error=' + encodeURIComponent('An error occurred during check-in. Please try again.'));
  }
});

// Get student hours tracker data
router.get('/student-hours', isAuthenticated, async (req, res) => {
  try {
    // Get all students
    const students = await User.find({ role: 'student' }).select('firstName lastName');
    
    // Get tutoring schedule from Google Sheets (which includes tutor check-ins)
    let schedule = [];
    
    // Check if Google Sheets is configured
    if (process.env.GOOGLE_SHEETS_ID && process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
      try {
        schedule = await googleSheetsService.getTutoringSchedule();
      } catch (sheetsError) {
        console.warn('Google Sheets not available for student hours:', sheetsError.message);
        // Fallback to database check-ins if Google Sheets unavailable
        return await getStudentHoursFromDatabase(students, res);
      }
    } else {
      console.warn('Google Sheets not configured for student hours');
      return await getStudentHoursFromDatabase(students, res);
    }
    
    // Process the data to calculate monthly hours from Google Sheets with new requirements
    const studentHoursData = students.map(student => {
      const studentName = `${student.firstName} ${student.lastName}`;
      
      // Calculate hours per month from Google Sheets tutoring sessions
      const monthlyHours = {};
      const monthlyRequirements = {};
      
      schedule.forEach(session => {
        // Check if this student was a tutor and checked in for this session
        const tutorEntry = session.tutors.find(tutor => 
          tutor.name && tutor.name.trim() === studentName && tutor.checkedIn
        );
        
        if (tutorEntry) {
          const date = new Date(session.date);
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const year = date.getFullYear();
          
          // Only count current academic year (September to June)
          const currentYear = new Date().getFullYear();
          const currentMonth = new Date().getMonth() + 1;
          
          // Determine academic year
          let academicYear;
          if (currentMonth >= 9) { // September or later
            academicYear = currentYear;
          } else { // January to August
            academicYear = currentYear - 1;
          }
          
          // Check if this session is in the current academic year
          const isCurrentAcademicYear = 
            (year === academicYear && parseInt(month) >= 9) || 
            (year === academicYear + 1 && parseInt(month) <= 6);
          
          if (isCurrentAcademicYear) {
            if (!monthlyHours[month]) {
              monthlyHours[month] = 0;
            }
            // Each tutoring session represents hours based on numHours field or default to 1
            const hours = parseFloat(session.numHours) || 1;
            monthlyHours[month] += hours;
          }
        }
      });
      
      // Calculate requirements for each month with penalty system
      const academicMonths = ['09', '10', '11', '12', '01', '02', '03', '04', '05', '06'];
      let cumulativeMissedHours = 0;
      
      for (const month of academicMonths) {
        let requiredForMonth;
        if (month === '09') {
          // September: only 2 hours required
          requiredForMonth = 2;
        } else {
          // October onwards: 2.5 base hours + penalties from previous months
          requiredForMonth = 2.5;
          
          // Add 50% penalty for each hour missed in previous months
          if (cumulativeMissedHours > 0) {
            let penalty = cumulativeMissedHours * 0.5;
            // Round down to nearest 0.5 (e.g., 1.25 -> 1.0, 1.75 -> 1.5)
            penalty = Math.floor(penalty * 2) / 2;
            requiredForMonth += penalty;
          }
        }
        
        monthlyRequirements[month] = requiredForMonth;
        
        // Calculate missed hours for this month to carry forward
        const actualHours = monthlyHours[month] || 0;
        const missedThisMonth = Math.max(0, requiredForMonth - actualHours);
        cumulativeMissedHours += missedThisMonth;
      }
      
      return {
        firstName: student.firstName,
        lastName: student.lastName,
        monthlyHours: monthlyHours,
        monthlyRequirements: monthlyRequirements
      };
    });
    
    res.json({ students: studentHoursData });
    
  } catch (error) {
    console.error('Error fetching student hours:', error);
    res.status(500).json({ error: 'Failed to fetch student hours data' });
  }
});

// Fallback function to use database check-ins if Google Sheets unavailable
async function getStudentHoursFromDatabase(students, res) {
  try {
    // Get all check-ins from database
    const checkIns = await CheckIn.find({}).populate('userId', 'firstName lastName');
    
    // Process the data to calculate monthly hours with new requirements
    const studentHoursData = students.map(student => {
      const studentCheckIns = checkIns.filter(checkIn => 
        checkIn.userId && checkIn.userId._id.toString() === student._id.toString()
      );
      
      // Calculate hours per month
      const monthlyHours = {};
      const monthlyRequirements = {};
      
      studentCheckIns.forEach(checkIn => {
        const date = new Date(checkIn.sessionDate);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        
        // Only count current academic year (September to June)
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;
        
        // Determine academic year
        let academicYear;
        if (currentMonth >= 9) { // September or later
          academicYear = currentYear;
        } else { // January to August
          academicYear = currentYear - 1;
        }
        
        // Check if this check-in is in the current academic year
        const isCurrentAcademicYear = 
          (year === academicYear && parseInt(month) >= 9) || 
          (year === academicYear + 1 && parseInt(month) <= 6);
        
        if (isCurrentAcademicYear) {
          if (!monthlyHours[month]) {
            monthlyHours[month] = 0;
          }
          // Each check-in represents 1 hour
          monthlyHours[month] += 1;
        }
      });
      
      // Calculate requirements for each month with penalty system
      const academicMonths = ['09', '10', '11', '12', '01', '02', '03', '04', '05', '06'];
      let cumulativeMissedHours = 0;
      
      for (const month of academicMonths) {
        let requiredForMonth;
        if (month === '09') {
          // September: only 2 hours required
          requiredForMonth = 2;
        } else {
          // October onwards: 2.5 base hours + penalties from previous months
          requiredForMonth = 2.5;
          
          // Add 50% penalty for each hour missed in previous months
          if (cumulativeMissedHours > 0) {
            let penalty = cumulativeMissedHours * 0.5;
            // Round down to nearest 0.5 (e.g., 1.25 -> 1.0, 1.75 -> 1.5)
            penalty = Math.floor(penalty * 2) / 2;
            requiredForMonth += penalty;
          }
        }
        
        monthlyRequirements[month] = requiredForMonth;
        
        // Calculate missed hours for this month to carry forward
        const actualHours = monthlyHours[month] || 0;
        const missedThisMonth = Math.max(0, requiredForMonth - actualHours);
        cumulativeMissedHours += missedThisMonth;
      }
      
      return {
        firstName: student.firstName,
        lastName: student.lastName,
        monthlyHours: monthlyHours,
        monthlyRequirements: monthlyRequirements
      };
    });
    
    res.json({ students: studentHoursData });
  } catch (error) {
    console.error('Error fetching student hours from database:', error);
    res.status(500).json({ error: 'Failed to fetch student hours data from database' });
  }
}

// Get student stats for dashboard
router.get('/student-stats', isAuthenticated, async (req, res) => {
  try {
    if (!process.env.GOOGLE_SHEETS_ID || !process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
      return res.json({
        hoursTutoredThisMonth: 0,
        hoursSignedUpThisMonth: 0,
        hoursTutoredThisYear: 0,
        hoursToMakeUp: 0
      });
    }

    const userName = `${req.user.firstName} ${req.user.lastName || ''}`.trim();
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // 1-12
    const currentYear = currentDate.getFullYear();
    
    // Get all tutoring sessions from Google Sheets
    const schedule = await googleSheetsService.getTutoringSchedule();
    
    let hoursTutoredThisMonth = 0;
    let hoursSignedUpThisMonth = 0;
    let hoursTutoredThisYear = 0;
    
    schedule.forEach(session => {
      const sessionDate = new Date(session.date);
      const sessionMonth = sessionDate.getMonth() + 1;
      const sessionYear = sessionDate.getFullYear();
      
      // Find if user is in this session
      const userTutor = session.tutors.find(tutor => tutor.name === userName);
      
      if (userTutor) {
        const sessionHours = parseFloat(session.numHours) || 1; // Default to 1 hour if not specified
        
        // Hours signed up for this month
        if (sessionMonth === currentMonth && sessionYear === currentYear) {
          hoursSignedUpThisMonth += sessionHours;
          
          // Hours tutored this month (only if checked in)
          if (userTutor.checkedIn) {
            hoursTutoredThisMonth += sessionHours;
          }
        }
        
        // Hours tutored this year (only if checked in)
        if (sessionYear === currentYear && userTutor.checkedIn) {
          hoursTutoredThisYear += sessionHours;
        }
      }
    });
    
    // Calculate hours to make up with new requirements and penalty system
    let hoursToMakeUp = 0;
    
    // Only calculate if we're in or past September 2025
    if (currentYear > 2025 || (currentYear === 2025 && currentMonth >= 9)) {
      // Get all monthly hours for academic year (Sep to June)
      const academicMonths = ['09', '10', '11', '12', '01', '02', '03', '04', '05', '06'];
      let totalMissedHours = 0;
      let totalRequiredHours = 0;
      
      // Process each month to calculate required hours and penalties
      for (let i = 0; i < academicMonths.length; i++) {
        const month = academicMonths[i];
        let actualHours = 0;
        
        // Determine which year this month belongs to
        let monthYear;
        if (month === '09' || month === '10' || month === '11' || month === '12') {
          monthYear = currentYear; // Fall semester
        } else {
          monthYear = currentYear + 1; // Spring semester (next calendar year)
        }
        
        // Only process months that have passed
        const monthDate = new Date(monthYear, parseInt(month) - 1, 1);
        const now = new Date();
        if (monthDate > now) {
          break; // Haven't reached this month yet
        }
        
        // Get actual hours tutored for this month
        schedule.forEach(session => {
          const sessionDate = new Date(session.date);
          const sessionMonth = String(sessionDate.getMonth() + 1).padStart(2, '0');
          const sessionYear = sessionDate.getFullYear();
          
          if (sessionMonth === month && sessionYear === monthYear) {
            const userTutor = session.tutors.find(tutor => tutor.name === userName);
            if (userTutor && userTutor.checkedIn) {
              actualHours += parseFloat(session.numHours) || 1;
            }
          }
        });
        
        // Calculate required hours for this month
        let requiredForMonth;
        if (month === '09') {
          // September 2025: only 2 hours required
          requiredForMonth = 2;
        } else {
          // October onwards: 2.5 base hours + penalties from previous months
          requiredForMonth = 2.5;
          
          // Add 50% penalty for each hour missed in previous months
          if (totalMissedHours > 0) {
            let penalty = totalMissedHours * 0.5;
            // Round down to nearest 0.5 (e.g., 1.25 -> 1.0, 1.75 -> 1.5)
            penalty = Math.floor(penalty * 2) / 2;
            requiredForMonth += penalty;
          }
        }
        
        totalRequiredHours += requiredForMonth;
        
        // Calculate missed hours for this month
        const missedThisMonth = Math.max(0, requiredForMonth - actualHours);
        totalMissedHours += missedThisMonth;
      }
      
      hoursToMakeUp = Math.max(0, totalRequiredHours - hoursTutoredThisYear);
    }
    
    res.json({
      hoursTutoredThisMonth: Math.round(hoursTutoredThisMonth * 10) / 10,
      hoursSignedUpThisMonth: Math.round(hoursSignedUpThisMonth * 10) / 10,
      hoursTutoredThisYear: Math.round(hoursTutoredThisYear * 10) / 10,
      hoursToMakeUp: Math.round(hoursToMakeUp * 10) / 10
    });
    
  } catch (error) {
    console.error('Error fetching student stats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch student stats',
      hoursTutoredThisMonth: 0,
      hoursSignedUpThisMonth: 0,
      hoursTutoredThisYear: 0,
      hoursToMakeUp: 0
    });
  }
});

export default router;
