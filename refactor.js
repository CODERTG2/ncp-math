const fs = require('fs');
let content = fs.readFileSync('routes/api.js', 'utf8');

const startStr = '    function calculateStudentStats(student, adjustments, schedule, settings, currentMonth, currentYear) {';
const startIndex = content.indexOf(startStr);

if (startIndex === -1) {
    console.log('Function start not found');
    process.exit(1);
}

let openBraces = 0;
let endIndex = -1;

for (let i = startIndex + startStr.length; i < content.length; i++) {
    if (content[i] === '{') openBraces++;
    if (content[i] === '}') {
        if (openBraces === 0) {
            endIndex = i + 1;
            break;
        }
        openBraces--;
    }
}

if (endIndex === -1) {
    console.log('Function end not found');
    process.exit(1);
}

let funcStr = content.substring(startIndex, endIndex);
content = content.substring(0, startIndex) + content.substring(endIndex);

funcStr = funcStr.replace('    function', 'function');
funcStr = funcStr.replace(/\n    /g, '\n');
funcStr = funcStr.replace('`${student.firstName} ${student.lastName}`', '`${student.firstName} ${student.lastName || \'\'}`');

const insertTarget = '// Get student stats for dashboard';
const insertIndex = content.indexOf(insertTarget);

content = content.substring(0, insertIndex) + funcStr + '\n\n' + content.substring(insertIndex);
content = content.replace(/!process\.env\.GOOGLE_SHEETS_ID \|\| !process\.env\.GOOGLE_SERVICE_ACCOUNT_KEY/g, '!process.env.SPREADSHEET_ID');

fs.writeFileSync('routes/api.js', content, 'utf8');
console.log('File successfully refactored.');
