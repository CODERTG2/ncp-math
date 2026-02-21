import mongoose from 'mongoose';
import User from './models/User.js';
import googleSheetsService from './services/googleSheetsService.js';
import Settings from './models/Settings.js';
import HourAdjustment from './models/HourAdjustment.js';

async function testStats() {
    await mongoose.connect(process.env.MONGODB_URI);
    const user = await User.findOne({ email: 'vwodzien@cps.edu' });
    const schedule = await googleSheetsService.getTutoringSchedule();

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const userName = `${user.firstName} ${user.lastName || ''}`.trim();
    console.log('User Name:', userName);
    console.log('Current Date (Local):', currentDate);
    console.log('Current Month/Year:', currentMonth, currentYear);

    let hoursSignedUpThisMonth = 0;

    schedule.forEach(session => {
        const sessionDate = new Date(session.date);
        const sessionMonth = sessionDate.getMonth() + 1;
        const sessionYear = sessionDate.getFullYear();
        const userTutor = session.tutors.find(tutor => tutor.name === userName);

        if (userTutor) {
            console.log('----------------------------');
            console.log('session.date string:', session.date);
            console.log('Parsed sessionDate:', sessionDate);
            console.log('Parsed sessionMonth/Year:', sessionMonth, sessionYear);
            const sessionHours = parseFloat(session.numHours) || 1;

            if (sessionMonth === currentMonth && sessionYear === currentYear) {
                hoursSignedUpThisMonth += sessionHours;
                console.log('=> Added hours:', sessionHours);
            } else {
                console.log('=> Did not match block!');
            }
        }
    });

    console.log('----------------------------');
    console.log('Final Signed Up:', hoursSignedUpThisMonth);
    process.exit(0);
}
testStats();
