import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
import mongoose from 'mongoose';
import User from './models/User.js';
import googleSheetsService from './services/googleSheetsService.js';

async function test() {
    await mongoose.connect(process.env.MONGODB_URI);
    const user = await User.findOne({ email: 'vwodzien@cps.edu' });
    if (!user) {
        console.log('User not found in DB!');
    } else {
        console.log('User from DB:', user.firstName, user.lastName);
        const userName = `${user.firstName} ${user.lastName || ''}`.trim();
        console.log('Formatted userName:', userName);
    }

    const schedule = await googleSheetsService.getTutoringSchedule();
    console.log('Total sessions:', schedule.length);

    let matchCount = 0;
    schedule.forEach(s => {
        s.tutors.forEach(t => {
            if (t.name.toLowerCase().includes('victor') || t.name.toLowerCase().includes('wodzien')) {
                console.log('Found in schedule:', t.name, 'Date:', s.date, 'Checked in:', t.checkedIn);
                matchCount++;
            }
        });
    });

    console.log('Matches for Victor/Wodzien:', matchCount);
    process.exit(0);
}
test();
