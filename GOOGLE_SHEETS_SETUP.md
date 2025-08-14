# Google Sheets Integration Setup

This guide will help you set up Google Sheets integration for the tutoring calendar.

## Prerequisites

1. A Google account
2. A Google Sheets document with your tutoring schedule

## Step 1: Create Google Sheets Document

Create a Google Sheets document with the following structure:

| Date       | Day     | Max Tutors | Time                | Room    | Cancelled? |
|------------|---------|------------|---------------------|---------|------------|
| 09/01/2025 | Monday  | 6          | 3:15 PM - 4:15 PM   | 320     | No         |
| 09/01/2025 | Monday  | 4          | 10:03 AM - 10:33 AM | Library | No         |
| 09/01/2025 | Monday  | 4          | 10:53 AM - 11:23 AM | Library | No         |
| 09/01/2025 | Monday  | 4          | 11:51 AM - 12:21 PM | Library | No         |
   - Column C: Max Tutors (number)
   - Column D: Time (e.g., "3:15 PM - 4:15 PM")
   - Column E: Cancelled? (Yes/No)

3. Add a header row:
   ```
   Date | Day | Max Tutors | Time | Cancelled?
   ```

4. Add your data rows, for example:
   ```
   09/01/2025 | Monday | 6 | 3:15 PM - 4:15 PM | No
   09/01/2025 | Monday | 4 | 10:03 AM - 10:33 AM | No
   09/02/2025 | Tuesday | 4 | 7:20 AM - 7:50 AM | No
   ```

## Step 2: Set Up Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Sheets API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click on it and press "Enable"

## Step 3: Create Service Account

1. In Google Cloud Console, go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Fill in the service account details:
   - Name: `tutoring-calendar-service`
   - Description: `Service account for tutoring calendar integration`
4. Click "Create and Continue"
5. Skip the optional role assignment (click "Continue")
6. Click "Done"

## Step 4: Generate Service Account Key

1. In the "Credentials" page, click on your newly created service account
2. Go to the "Keys" tab
3. Click "Add Key" > "Create new key"
4. Select "JSON" format
5. Click "Create" - this will download a JSON file

## Step 5: Share Google Sheet with Service Account

1. Open your Google Sheet
2. Click the "Share" button
3. Add the service account email (found in the downloaded JSON file, look for "client_email")
4. Give it "Editor" permissions
5. Uncheck "Notify people" since it's a service account
6. Click "Share"

## Step 6: Configure Environment Variables

1. Copy the Google Sheets URL and extract the Sheet ID:
   - URL: `https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit`
   - Copy the `YOUR_SHEET_ID` part

2. Open the downloaded JSON key file and copy its entire content

3. Add these to your `.env` file:
   ```env
   GOOGLE_SHEETS_ID=your_sheet_id_here
   GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"..."}
   ```

   **Important**: The `GOOGLE_SERVICE_ACCOUNT_KEY` should be the entire JSON content on a single line.

## Step 7: Test the Integration

1. Restart your server
2. Go to the student dashboard
3. The calendar should now load data from your Google Sheet

## Troubleshooting

- **Permission errors**: Make sure the service account email is shared with your Google Sheet
- **API not enabled**: Ensure Google Sheets API is enabled in your Google Cloud project
- **Invalid JSON**: Check that the service account key is properly formatted in your .env file
- **Sheet not found**: Verify the Google Sheets ID is correct

## Sheet Structure Notes

- **Date Format**: Use MM/DD/YYYY format (e.g., 09/01/2025)
- **Time Format**: Use human-readable format (e.g., "3:15 PM - 4:15 PM")
- **Cancelled Field**: Use exactly "Yes" or "No"
- **Max Tutors**: Must be a number

## Adding New Sessions

To add new tutoring sessions:
1. Open your Google Sheet
2. Add a new row with the session details
3. The calendar will automatically update when students refresh the page

## Security Notes

- Keep your service account key secure and never commit it to version control
- The service account only has access to sheets you explicitly share with it
- Consider using Google Cloud Secret Manager for production deployments
