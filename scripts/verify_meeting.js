import mongoose from 'mongoose';
import Meeting from '../models/Meeting.js';
import User from '../models/User.js';
import HourAdjustment from '../models/HourAdjustment.js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const logFile = 'verification_result.txt';
fs.writeFileSync(logFile, 'Starting Verification...\n');

function log(msg) {
    console.log(msg);
    fs.appendFileSync(logFile, msg + '\n');
}

async function verifyMeetingSystem() {
    try {
        // Connect to DB
        if (!process.env.MONGODB_URI) {
            log('Error: MONGODB_URI not found');
            return;
        }
        await mongoose.connect(process.env.MONGODB_URI);
        log('Connected to MongoDB');

        // 2. Create a test meeting
        const testCode = 'TEST' + Math.floor(Math.random() * 10000);
        const meeting = new Meeting({
            title: 'Verification Meeting',
            code: testCode,
            value: 1.5
        });
        await meeting.save();
        log(`Created meeting: ${meeting.title} (${meeting.code})`);

        // 3. Create a test student
        const studentEmail = `teststudent${Date.now()}@example.com`;
        const student = new User({
            firstName: 'Test',
            lastName: 'Student',
            email: studentEmail,
            password: 'password123',
            role: 'student'
        });
        await student.save();
        log(`Created student: ${student.email}`);

        // 4. Simulate Attributes Check-in (Logic from /api/meetings/attend)

        // Find active meeting
        const foundMeeting = await Meeting.findOne({ code: testCode, isActive: true });
        if (!foundMeeting) throw new Error('Meeting not found or inactive');

        // Check availability
        if (foundMeeting.attendees.includes(student._id)) {
            throw new Error('Already attended');
        }

        // Record attendance
        foundMeeting.attendees.push(student._id);
        await foundMeeting.save();
        log('Student added to meeting attendees');

        // Grant hours
        const adjustment = new HourAdjustment({
            userId: student._id,
            amount: foundMeeting.value,
            reason: `Attended Meeting: ${foundMeeting.title}`,
            monthApplied: String(new Date().getMonth() + 1).padStart(2, '0'),
            academicYear: new Date().getMonth() >= 8 ? new Date().getFullYear() : new Date().getFullYear() - 1
        });
        await adjustment.save();
        log(`HourAdjustment created: +${adjustment.amount} hours`);

        // 5. Verify Adjustment exists
        const savedAdj = await HourAdjustment.findOne({ userId: student._id, reason: { $regex: 'Verification Meeting' } });
        if (savedAdj && savedAdj.amount === 1.5) {
            log('SUCCESS: Verification Passed!');
        } else {
            log('FAILURE: Adjustment not found or incorrect amount');
        }

        // Cleanup
        await Meeting.deleteOne({ _id: meeting._id });
        await User.deleteOne({ _id: student._id });
        await HourAdjustment.deleteOne({ _id: adjustment._id });
        log('Cleanup complete');

    } catch (error) {
        log('Verification Failed: ' + error.message);
    } finally {
        await mongoose.disconnect();
    }
}

verifyMeetingSystem();
