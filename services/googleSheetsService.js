import { google } from 'googleapis';
import path from 'path';

class GoogleSheetsService {
  constructor() {
    this.auth = null;
    this.sheets = null;
    this.spreadsheetId = process.env.GOOGLE_SHEETS_ID;
    this.range = 'Sheet1!A:F'; // Adjust based on your sheet structure
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
        const [date, day, maxTutors, time, room, cancelled] = row;
        
        // Convert date format if needed (MM/DD/YYYY to YYYY-MM-DD)
        const dateObj = new Date(date);
        const formattedDate = dateObj.toISOString().split('T')[0];

        return {
          date: formattedDate,
          day,
          maxTutors: parseInt(maxTutors) || 0,
          time,
          room: room || 'TBD',
          cancelled: cancelled === 'Yes',
          signedUp: 0, // Will be populated from database
          signedUpUsers: [], // Will be populated from database
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
      return 'Room 205';
    } else if (time.includes('7:20')) {
      return 'Room 103';
    } else {
      return 'Room 101';
    }
  }

  async updateSessionSignup(date, time, action, userId, userName) {
    try {
      // For now, we'll store signups in our database
      // You could also update the Google Sheet if needed
      console.log(`${action} signup for session: ${date} ${time} by ${userName}`);
      return true;
    } catch (error) {
      console.error('Error updating session signup:', error);
      throw error;
    }
  }
}

export default new GoogleSheetsService();
