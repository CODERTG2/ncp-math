import { google } from 'googleapis';
import path from 'path';

class GoogleSheetsService {
  constructor() {
    this.auth = null;
    this.sheets = null;
    this.spreadsheetId = process.env.GOOGLE_SHEETS_ID;
    this.range = 'Sheet1!A:T'; // Updated to include all tutor and check-in columns (A to T)
  }

  async initialize() {
    try {
      // Check if Google Sheets credentials are available
      const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
      
      if (!serviceAccountKey || serviceAccountKey === '{}' || !this.spreadsheetId) {
        throw new Error('Google Sheets credentials not configured');
      }

      // Initialize Google Sheets API with service account
      const credentials = JSON.parse(serviceAccountKey);
      
      this.auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
      });

      this.sheets = google.sheets({ version: 'v4', auth: this.auth });
      console.log('Google Sheets service initialized successfully');
    } catch (error) {
      console.error('Error initializing Google Sheets service:', error);
      throw error;
    }
  }

  async getTutoringSchedule() {
    try {
      if (!this.sheets) {
        await this.initialize();
      }

      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: this.range,
      });

      const rows = response.data.values;
      if (!rows || rows.length === 0) {
        return [];
      }

      // Skip header row and process data
      const schedule = rows.slice(1).map(row => {
        const [date, day, maxTutors, time, numHours, room, cancelled, 
               tutor1, checkin1, tutor2, checkin2, tutor3, checkin3,
               tutor4, checkin4, tutor5, checkin5, tutor6, checkin6] = row;
        
        // Convert date format if needed (MM/DD/YYYY to YYYY-MM-DD)
        // Use proper date parsing to avoid timezone issues
        let formattedDate;
        if (date.includes('/')) {
          // Parse MM/DD/YYYY format
          const [month, day, year] = date.split('/');
          formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        } else {
          // Already in YYYY-MM-DD format or other format
          formattedDate = date;
        }

        // Build tutors array
        const tutors = [];
        const tutorData = [
          { name: tutor1, checkedIn: checkin1 === 'Yes' },
          { name: tutor2, checkedIn: checkin2 === 'Yes' },
          { name: tutor3, checkedIn: checkin3 === 'Yes' },
          { name: tutor4, checkedIn: checkin4 === 'Yes' },
          { name: tutor5, checkedIn: checkin5 === 'Yes' },
          { name: tutor6, checkedIn: checkin6 === 'Yes' }
        ];

        tutorData.forEach(tutor => {
          if (tutor.name && tutor.name.trim()) {
            tutors.push(tutor);
          }
        });

        return {
          date: formattedDate,
          day,
          maxTutors: parseInt(maxTutors) || 0,
          time,
          numHours: numHours || '',
          room: room || 'TBD',
          cancelled: cancelled === 'Yes',
          tutors: tutors,
          signedUp: tutors.length,
          signedUpUsers: tutors.map(t => t.name)
        };
      });

      return schedule;
    } catch (error) {
      console.error('Error fetching tutoring schedule:', error);
      throw error;
    }
  }

  assignRoom(time) {
    // Simple room assignment logic - you can customize this
    if (time.includes('3:15')) {
      return 'Room 320';
    } else if (time.includes('7:20')) {
      return 'Room 103';
    } else {
      return 'Room 101';
    }
  }

  async findSessionRow(date, time) {
    try {
      if (!this.sheets) {
        await this.initialize();
      }

      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: this.range,
      });

      const rows = response.data.values;
      if (!rows || rows.length === 0) {
        return -1;
      }

      // Find the row index for the session
      for (let i = 1; i < rows.length; i++) { // Skip header row
        const [rowDate, day, maxTutors, rowTime] = rows[i];
        
        // Convert date format properly
        let formattedDate;
        if (rowDate.includes('/')) {
          const [month, day, year] = rowDate.split('/');
          formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        } else {
          formattedDate = rowDate;
        }
        
        if (formattedDate === date && rowTime === time) {
          return i + 1; // +1 because sheets are 1-indexed
        }
      }

      return -1;
    } catch (error) {
      console.error('Error finding session row:', error);
      return -1;
    }
  }

  async getSessionData(date, time) {
    try {
      if (!this.sheets) {
        await this.initialize();
      }

      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: this.range,
      });

      const rows = response.data.values;
      if (!rows || rows.length === 0) {
        return null;
      }

      // Find the session
      for (let i = 1; i < rows.length; i++) { // Skip header row
        const [rowDate, day, maxTutors, rowTime, numHours, room, cancelled, 
               tutor1, checkin1, tutor2, checkin2, tutor3, checkin3,
               tutor4, checkin4, tutor5, checkin5, tutor6, checkin6] = rows[i];
        
        // Convert date format properly
        let formattedDate;
        if (rowDate.includes('/')) {
          const [month, day, year] = rowDate.split('/');
          formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        } else {
          formattedDate = rowDate;
        }
        
        if (formattedDate === date && rowTime === time) {
          return {
            rowIndex: i + 1, // 1-indexed for sheets
            date: formattedDate,
            day,
            maxTutors: parseInt(maxTutors) || 0,
            time: rowTime,
            numHours,
            room,
            cancelled: cancelled === 'Yes',
            tutors: [
              { name: tutor1, checkedIn: checkin1 === 'Yes', column: 'H' },
              { name: tutor2, checkedIn: checkin2 === 'Yes', column: 'J' },
              { name: tutor3, checkedIn: checkin3 === 'Yes', column: 'L' },
              { name: tutor4, checkedIn: checkin4 === 'Yes', column: 'N' },
              { name: tutor5, checkedIn: checkin5 === 'Yes', column: 'P' },
              { name: tutor6, checkedIn: checkin6 === 'Yes', column: 'R' }
            ]
          };
        }
      }

      return null;
    } catch (error) {
      console.error('Error getting session data:', error);
      return null;
    }
  }

  async addTutorToSession(date, time, tutorName) {
    try {
      const sessionData = await this.getSessionData(date, time);
      if (!sessionData) {
        throw new Error('Session not found');
      }

      if (sessionData.cancelled) {
        throw new Error('Cannot sign up for cancelled session');
      }

      // Check if tutor is already signed up
      const existingTutor = sessionData.tutors.find(t => t.name === tutorName);
      if (existingTutor) {
        throw new Error('Tutor is already signed up for this session');
      }

      // Find next available slot
      const availableSlot = sessionData.tutors.find(t => !t.name || t.name.trim() === '');
      if (!availableSlot) {
        throw new Error('Session is full');
      }

      // Check if we've reached max tutors
      const currentTutors = sessionData.tutors.filter(t => t.name && t.name.trim()).length;
      if (currentTutors >= sessionData.maxTutors) {
        throw new Error('Session is full');
      }

      // Update the tutor name in the sheet
      const tutorColumn = availableSlot.column;
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: `Sheet1!${tutorColumn}${sessionData.rowIndex}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[tutorName]]
        }
      });

      console.log(`Successfully added ${tutorName} to session: ${date} ${time}`);
      return true;
    } catch (error) {
      console.error('Error adding tutor to session:', error);
      throw error;
    }
  }

  async removeTutorFromSession(date, time, tutorName) {
    try {
      const sessionData = await this.getSessionData(date, time);
      if (!sessionData) {
        throw new Error('Session not found');
      }

      // Find the tutor
      const tutorIndex = sessionData.tutors.findIndex(t => t.name === tutorName);
      if (tutorIndex === -1) {
        throw new Error('Tutor not found in this session');
      }

      const tutor = sessionData.tutors[tutorIndex];
      
      // Clear both tutor name and check-in status
      const tutorColumn = tutor.column;
      const checkinColumn = String.fromCharCode(tutorColumn.charCodeAt(0) + 1); // Next column

      await this.sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: this.spreadsheetId,
        requestBody: {
          valueInputOption: 'USER_ENTERED',
          data: [
            {
              range: `Sheet1!${tutorColumn}${sessionData.rowIndex}`,
              values: [['']]
            },
            {
              range: `Sheet1!${checkinColumn}${sessionData.rowIndex}`,
              values: [['']]
            }
          ]
        }
      });

      console.log(`Successfully removed ${tutorName} from session: ${date} ${time}`);
      return true;
    } catch (error) {
      console.error('Error removing tutor from session:', error);
      throw error;
    }
  }

  async checkInTutor(date, time, tutorName) {
    try {
      const sessionData = await this.getSessionData(date, time);
      if (!sessionData) {
        throw new Error('Session not found');
      }

      if (sessionData.cancelled) {
        throw new Error('Cannot check in for cancelled session');
      }

      // Find the tutor
      const tutor = sessionData.tutors.find(t => t.name === tutorName);
      if (!tutor) {
        throw new Error('Tutor is not signed up for this session');
      }

      if (tutor.checkedIn) {
        throw new Error('Tutor has already checked in for this session');
      }

      // Update the check-in status
      const checkinColumn = String.fromCharCode(tutor.column.charCodeAt(0) + 1); // Next column after tutor name
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: `Sheet1!${checkinColumn}${sessionData.rowIndex}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [['Yes']]
        }
      });

      console.log(`Successfully checked in ${tutorName} for session: ${date} ${time}`);
      
      // Check if this is between 9 AM and 2 PM for Math Tables requirement
      const sessionTime = sessionData.time;
      const hour = parseInt(sessionTime.split(':')[0]);
      const isPM = sessionTime.includes('PM');
      const isAM = sessionTime.includes('AM');
      
      let hourIn24 = hour;
      if (isPM && hour !== 12) hourIn24 += 12;
      if (isAM && hour === 12) hourIn24 = 0;
      
      const requiresMathTables = hourIn24 >= 9 && hourIn24 < 14; // 9 AM to 2 PM
      
      return {
        success: true,
        requiresMathTables
      };
    } catch (error) {
      console.error('Error checking in tutor:', error);
      throw error;
    }
  }

  async updateSessionSignup(date, time, action, userId, userName) {
    try {
      if (action === 'signup') {
        return await this.addTutorToSession(date, time, userName);
      } else if (action === 'cancel') {
        return await this.removeTutorFromSession(date, time, userName);
      }
      return false;
    } catch (error) {
      console.error('Error updating session signup:', error);
      throw error;
    }
  }

  async updateSession(date, time, updates) {
    try {
      const sessionData = await this.getSessionData(date, time);
      if (!sessionData) {
        throw new Error('Session not found');
      }

      const updateRequests = [];
      
      if (updates.maxTutors !== undefined) {
        updateRequests.push({
          range: `Sheet1!C${sessionData.rowIndex}`,
          values: [[updates.maxTutors]]
        });
      }
      
      if (updates.time !== undefined) {
        updateRequests.push({
          range: `Sheet1!D${sessionData.rowIndex}`,
          values: [[updates.time]]
        });
      }

      if (updates.numHours !== undefined) {
        updateRequests.push({
          range: `Sheet1!E${sessionData.rowIndex}`,
          values: [[updates.numHours]]
        });
      }
      
      if (updates.room !== undefined) {
        updateRequests.push({
          range: `Sheet1!F${sessionData.rowIndex}`,
          values: [[updates.room]]
        });
      }
      
      if (updates.cancelled !== undefined) {
        updateRequests.push({
          range: `Sheet1!G${sessionData.rowIndex}`,
          values: [[updates.cancelled ? 'Yes' : 'No']]
        });
      }

      // Execute all updates
      if (updateRequests.length > 0) {
        await this.sheets.spreadsheets.values.batchUpdate({
          spreadsheetId: this.spreadsheetId,
          requestBody: {
            valueInputOption: 'USER_ENTERED',
            data: updateRequests
          }
        });
      }

      console.log(`Successfully updated session: ${date} ${time}`);
      return true;
    } catch (error) {
      console.error('Error updating session in Google Sheets:', error);
      throw error;
    }
  }

  async addSession(date, day, maxTutors, time, room = '', numHours = '') {
    try {
      if (!this.sheets) {
        await this.initialize();
      }

      // Format date for Google Sheets (MM/DD/YYYY)
      const dateObj = new Date(date);
      const formattedDate = `${String(dateObj.getMonth() + 1).padStart(2, '0')}/${String(dateObj.getDate()).padStart(2, '0')}/${dateObj.getFullYear()}`;

      // Create row with all columns: Date, Day, Max Tutors, Time, Number of Hours, Room, Cancelled, 6 Tutor slots, 6 Check-in slots
      const values = [[
        formattedDate, day, maxTutors, time, numHours, room || this.assignRoom(time), 'No',
        '', '', '', '', '', '', '', '', '', '', '', ''  // 12 empty slots for 6 tutors and 6 check-ins
      ]];
      
      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: 'Sheet1!A:T',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: values
        }
      });

      console.log(`Successfully added new session: ${date} ${time}`);
      return true;
    } catch (error) {
      console.error('Error adding session to Google Sheets:', error);
      throw error;
    }
  }

  async deleteSession(date, time) {
    try {
      const sessionData = await this.getSessionData(date, time);
      if (!sessionData) {
        throw new Error('Session not found');
      }

      // Delete the row
      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId: this.spreadsheetId,
        requestBody: {
          requests: [{
            deleteDimension: {
              range: {
                sheetId: 0, // Assuming first sheet
                dimension: 'ROWS',
                startIndex: sessionData.rowIndex - 1, // Convert to 0-indexed
                endIndex: sessionData.rowIndex
              }
            }
          }]
        }
      });

      console.log(`Successfully deleted session: ${date} ${time}`);
      return true;
    } catch (error) {
      console.error('Error deleting session from Google Sheets:', error);
      throw error;
    }
  }

  async updateTutorCheckIn(date, time, tutorName, checkedIn) {
    try {
      if (!this.sheets) {
        await this.initialize();
      }

      // Get current session data
      const sessionData = await this.getSessionData(date, time);
      if (!sessionData) {
        throw new Error('Session not found');
      }

      // Find which tutor column this tutor is in and update the corresponding check-in column
      const tutorColumns = ['H', 'J', 'L', 'N', 'P', 'R'];
      const checkinColumns = ['I', 'K', 'M', 'O', 'Q', 'S'];
      
      let updateColumn = null;
      
      for (let i = 0; i < tutorColumns.length; i++) {
        const tutorCell = `${tutorColumns[i]}${sessionData.rowIndex}`;
        const tutorResponse = await this.sheets.spreadsheets.values.get({
          spreadsheetId: this.spreadsheetId,
          range: tutorCell,
        });
        let cellValue = '';
        if (tutorResponse.data.values && tutorResponse.data.values[0]) {
          cellValue = tutorResponse.data.values[0][0];
        }
        // Robust comparison: trim and ignore case
        if (
          cellValue &&
          cellValue.trim().toLowerCase() === tutorName.trim().toLowerCase()
        ) {
          updateColumn = checkinColumns[i];
          break;
        }
      }

      if (!updateColumn) {
        throw new Error(`Tutor ${tutorName} not found in session ${date} ${time}`);
      }

      // Update the check-in status
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: `${updateColumn}${sessionData.rowIndex}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [[checkedIn ? 'Yes' : 'No']]
        }
      });

      console.log(`Successfully updated check-in status for ${tutorName} in session ${date} ${time}: ${checkedIn ? 'Yes' : 'No'}`);
      return true;
    } catch (error) {
      console.error('Error updating tutor check-in status:', error);
      throw error;
    }
  }
}

export default new GoogleSheetsService();
