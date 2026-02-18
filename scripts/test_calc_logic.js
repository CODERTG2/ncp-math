
// Mock inputs
const mockSettings = {
    penaltyMonth: '10', // October
    memberRequirements: {
        New: { baseHours: 2.5, penaltyRate: 0.5 },
        Old: { baseHours: 1.0, penaltyRate: 0.5 },
        Officer: { baseHours: 0, penaltyRate: 0 }
    }
};

const mockStudents = [
    { firstName: 'New', lastName: 'Member', memberType: 'New', _id: 's1' },
    { firstName: 'Old', lastName: 'Member', memberType: 'Old', _id: 's2' }
];

const mockAdjustments = [];

// Mock Schedule: 
// Student 1 (New) did 1 hour in September. (Req: 2.5). Missed = 1.5.
// Student 1 did 0 hours in October. 
// Student 2 (Old) did 1 hour in September (Req: 1.0). Missed = 0.
const mockSchedule = [
    {
        date: '2025-09-15',
        tutors: [{ name: 'New Member', checkedIn: true }, { name: 'Old Member', checkedIn: true }],
        numHours: 1
    }
];

function calculateHours(students, settings, schedule, adjustments) {
    const academicMonths = ['09', '10', '11', '12', '01', '02', '03', '04', '05', '06'];

    return students.map(student => {
        const studentName = `${student.firstName} ${student.lastName}`;
        const memberType = student.memberType || 'New';
        const studentReqs = settings.memberRequirements[memberType] || settings.memberRequirements['New'];

        // Filter adjustments
        const studentAdjustments = adjustments.filter(adj =>
            (adj.userId === student._id) || adj.userId === null
        );

        // Calculate hours per month
        const monthlyHours = {};
        academicMonths.forEach(m => monthlyHours[m] = 0);

        schedule.forEach(session => {
            const tutorEntry = session.tutors.find(tutor =>
                tutor.name === studentName && tutor.checkedIn
            );

            if (tutorEntry) {
                const date = new Date(session.date);
                const month = String(date.getMonth() + 1).padStart(2, '0');
                // Assume all mock dates are in current academic year for simplicity
                const hours = parseFloat(session.numHours) || 1;
                monthlyHours[month] += hours;
            }
        });

        const monthlyRequirements = {};
        let cumulativeMissedHours = 0;

        for (const month of academicMonths) {
            let requiredForMonth = studentReqs.baseHours;

            // Penalty Logic
            const monthOrder = ['09', '10', '11', '12', '01', '02', '03', '04', '05', '06'];
            const penaltyStartIndex = monthOrder.indexOf(settings.penaltyMonth);
            const currentMonthIndex = monthOrder.indexOf(month);

            if (cumulativeMissedHours > 0 && penaltyStartIndex !== -1 && currentMonthIndex >= penaltyStartIndex) {
                let penalty = cumulativeMissedHours * studentReqs.penaltyRate;
                penalty = Math.floor(penalty * 2) / 2;
                requiredForMonth += penalty;
            }

            monthlyRequirements[month] = requiredForMonth;

            const actualHours = monthlyHours[month] || 0;
            const missedThisMonth = Math.max(0, requiredForMonth - actualHours);
            cumulativeMissedHours += missedThisMonth;
        }

        return {
            name: studentName,
            memberType,
            monthlyRequirements,
            monthlyHours,
            cumulativeMissedHours
        };
    });
}

const results = calculateHours(mockStudents, mockSettings, mockSchedule, mockAdjustments);
console.log(JSON.stringify(results, null, 2));
