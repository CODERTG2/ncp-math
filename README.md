# Mu Alpha Theta - NCP Math Portal 🧮

A comprehensive web application for the Mu Alpha Theta mathematics honor society, featuring authentication, tutoring session management, Google Sheets integration, and role-based dashboards for students and teachers.

## 🌟 Features

### 🔐 Authentication System
- **Secure Registration & Login**: Email verification, password hashing with bcrypt
- **Role-Based Access Control**: Separate dashboards for students and teachers
- **Password Reset**: Email-based secure password recovery
- **Session Management**: Persistent sessions with MongoDB storage
- **JWT Authentication**: Token-based security with 7-day expiration

### 📅 Tutoring Session Management
- **Google Sheets Integration**: Dynamic tutoring schedule from Google Sheets
- **Session Signup**: Students can sign up for tutoring sessions
- **Check-in System**: Attendance tracking with device fingerprinting
- **Capacity Management**: Automatic tracking of session limits
- **Real-time Updates**: Live session status and availability

### 👨‍🎓 Student Features
- **Interactive Dashboard**: Clean, responsive interface
- **Session Calendar**: View and sign up for available tutoring sessions
- **Progress Tracking**: Monitor attendance and participation
- **Math Tables Requirements**: Special requirements for certain sessions
- **Profile Management**: Update personal information and preferences

### 👩‍🏫 Teacher Features
- **Teacher Dashboard**: Administrative panel for session management
- **Student Hours Tracker**: Monitor student attendance and hours
- **Session Management**: Create, update, and cancel tutoring sessions
- **Analytics**: View participation statistics and trends
- **Grade Management**: Track student progress and performance

### 🔧 Technical Features
- **MongoDB Integration**: Robust data persistence
- **Email Services**: Automated notifications and verifications
- **Responsive Design**: Mobile-friendly interface
- **Error Handling**: Comprehensive error management and logging
- **Security Features**: CSRF protection, input validation, secure headers

## 🚀 Installation

### Prerequisites
- **Node.js** (v16 or higher)
- **MongoDB** (Atlas or local instance)
- **Gmail Account** (for email services)
- **Google Cloud Project** (for Sheets integration)

### 1. Clone the Repository
```bash
git clone https://github.com/CODERTG2/ncp-math.git
cd ncp-math
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mu-alpha-theta?retryWrites=true&w=majority

# Authentication Secrets (generate secure random strings)
JWT_SECRET=your-super-secure-jwt-secret-key-here-make-it-long-and-random
SESSION_SECRET=your-super-secure-session-secret-key-here-make-it-long-and-random

# Email Configuration (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password

# Google Sheets Integration (optional)
GOOGLE_SHEETS_ID=your-google-sheets-id
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"..."}

# Application Configuration
BASE_URL=http://localhost:3000
NODE_ENV=development
PORT=3000
```

### 4. Generate Secure Secrets
```bash
# In Node.js console or terminal
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 5. Start the Application
```bash
npm start
```

The application will be available at:
- **Main Site**: http://localhost:3000
- **Authentication Portal**: http://localhost:3000/mat
- **Check-in System**: http://localhost:3000/check-in

## 📊 Google Sheets Setup

### 1. Create Google Sheets Document
Create a spreadsheet with the following structure:

| Date       | Day     | Max Tutors | Time                | Room    | Cancelled? |
|------------|---------|------------|---------------------|---------|------------|
| 01/15/2025 | Monday  | 6          | 3:15 PM - 4:15 PM   | 320     | No         |
| 01/15/2025 | Monday  | 4          | 10:03 AM - 10:33 AM | Library | No         |
| 01/16/2025 | Tuesday | 4          | 7:20 AM - 7:50 AM   | 320     | No         |

### 2. Google Cloud Setup
1. Create a [Google Cloud Project](https://console.cloud.google.com/)
2. Enable the **Google Sheets API**
3. Create a **Service Account**:
   - Go to APIs & Services → Credentials
   - Create Credentials → Service Account
   - Download the JSON key file

### 3. Share Sheet with Service Account
1. Open your Google Sheet
2. Click **Share**
3. Add the service account email (from JSON file)
4. Grant **Editor** permissions

### 4. Configure Environment Variables
```env
GOOGLE_SHEETS_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms  # From sheet URL
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}  # Entire JSON content
```

For detailed setup instructions, see [GOOGLE_SHEETS_SETUP.md](GOOGLE_SHEETS_SETUP.md).

## 🎯 Use Cases

### For Students
- **Session Discovery**: Browse available tutoring sessions
- **Easy Signup**: Register for sessions with one click
- **Attendance Tracking**: Check in to sessions using the mobile-friendly interface
- **Progress Monitoring**: View attendance history and hours completed
- **Flexible Scheduling**: Sign up for sessions that fit your schedule

### For Teachers
- **Schedule Management**: Create and manage tutoring sessions
- **Student Oversight**: Monitor student participation and progress
- **Capacity Planning**: Set limits on session attendance
- **Data Analytics**: View trends in student participation
- **Communication**: Automated email notifications for session changes

### For Administrators
- **User Management**: Approve teacher accounts and manage permissions
- **System Monitoring**: Track overall usage and system health
- **Data Export**: Export attendance and participation data
- **Policy Enforcement**: Implement tutoring requirements and rules

## 📱 User Interface

### Authentication Portal (`/mat`)
- Clean, modern login and registration forms
- Real-time form validation
- Password strength indicators
- Mobile-responsive design

### Student Dashboard
- Session calendar with availability indicators
- Quick signup and cancellation
- Personal statistics and progress tracking
- Upcoming session reminders

### Teacher Dashboard
- Administrative controls for session management
- Student hours tracking interface
- Analytics and reporting tools
- Bulk operations for session management

### Check-in System
- QR code or direct link access
- Device fingerprinting for security
- Time window validation
- Success/error feedback

## 🔧 API Reference

### Authentication Endpoints
```
POST /auth/register         - User registration
POST /auth/login           - User login
POST /auth/forgot-password - Password reset request
GET  /auth/verify-email/:token - Email verification
POST /auth/reset-password/:token - Password reset
GET  /auth/logout          - User logout
```

### Session Management
```
GET  /api/tutoring-schedule      - Get available sessions
POST /api/session-signup         - Sign up for session
POST /api/session-cancel         - Cancel session signup
POST /api/check-in              - Check in to session
GET  /api/student-sessions      - Get user's sessions
```

### Protected Routes
```
GET /dashboard/student          - Student dashboard
GET /dashboard/teacher          - Teacher dashboard
GET /dashboard/teacher/student-hours - Student hours tracker
```

## 🛡️ Security Features

### Authentication Security
- **Password Requirements**: 8+ characters, mixed case, numbers, special characters
- **Bcrypt Hashing**: 12 salt rounds for password security
- **JWT Tokens**: Secure session management
- **Email Verification**: Required for account activation

### Application Security
- **Input Validation**: Server-side validation with express-validator
- **CSRF Protection**: Session-based CSRF tokens
- **Secure Headers**: Helmet.js for security headers
- **Rate Limiting**: Protection against brute force attacks

### Data Protection
- **MongoDB Security**: Connection encryption and authentication
- **Environment Variables**: Sensitive data stored securely
- **Session Security**: Secure cookies with httpOnly flag
- **Device Fingerprinting**: Prevent check-in abuse

## 📁 Project Structure

```
ncp-math/
├── 📁 config/
│   └── database.js              # MongoDB connection configuration
├── 📁 middleware/
│   └── auth.js                  # Authentication middleware
├── 📁 models/
│   ├── User.js                  # User schema and validation
│   ├── CheckIn.js               # Check-in tracking schema
│   └── SessionSignup.js         # Session signup schema
├── 📁 routes/
│   ├── auth.js                  # Authentication routes
│   └── api.js                   # API endpoints
├── 📁 services/
│   ├── emailService.js          # Email sending service
│   └── googleSheetsService.js   # Google Sheets integration
├── 📁 views/
│   ├── home.ejs                 # Landing page
│   ├── mat.ejs                  # Authentication portal
│   ├── checkin.ejs              # Check-in interface
│   ├── student-dashboard.ejs    # Student dashboard
│   ├── teacher-dashboard.ejs    # Teacher dashboard
│   ├── student-hours-tracker.ejs # Hours tracking
│   ├── reset-password.ejs       # Password reset
│   └── error.ejs                # Error pages
├── 📁 public/
│   └── 📁 css/                  # Stylesheets
│       ├── home.css
│       ├── mat.css
│       └── checkin.css
├── 📄 server.js                 # Main application server
├── 📄 package.json              # Dependencies and scripts
├── 📄 README.md                 # This file
├── 📄 AUTH_README.md            # Detailed authentication docs
└── 📄 GOOGLE_SHEETS_SETUP.md    # Google Sheets setup guide
```

## 🤝 Contributing

We welcome contributions to improve the Mu Alpha Theta portal! Here's how to get started:

### 1. Fork the Repository
```bash
git fork https://github.com/CODERTG2/ncp-math.git
```

### 2. Create a Feature Branch
```bash
git checkout -b feature/amazing-feature
```

### 3. Make Your Changes
- Follow the existing code style and conventions
- Add comments for complex logic
- Update documentation as needed
- Test your changes thoroughly

### 4. Commit Your Changes
```bash
git commit -m "Add amazing feature"
```

### 5. Push and Create Pull Request
```bash
git push origin feature/amazing-feature
```

### 📋 Development Guidelines
- **Code Style**: Use ESLint and Prettier for consistent formatting
- **Testing**: Add tests for new features when possible
- **Documentation**: Update README and inline comments
- **Security**: Follow security best practices
- **Performance**: Optimize database queries and client-side code

### 🐛 Bug Reports
- Use the GitHub issue tracker
- Include steps to reproduce
- Provide error messages and logs
- Specify your environment details

### 💡 Feature Requests
- Open an issue with the `enhancement` label
- Describe the problem you're solving
- Provide mockups or examples if applicable
- Consider the impact on existing users

## 📞 Support

### 📖 Documentation
- [Authentication System](AUTH_README.md) - Detailed auth documentation
- [Google Sheets Setup](GOOGLE_SHEETS_SETUP.md) - Integration guide

### 🆘 Getting Help
- **Issues**: GitHub Issues for bugs and feature requests
- **Discussions**: GitHub Discussions for questions and ideas
- **Email**: Contact the development team for urgent issues

### 🔍 Troubleshooting

#### Common Issues
1. **Database Connection**: Check MongoDB URI and network access
2. **Email Not Sending**: Verify Gmail app password and 2FA
3. **Google Sheets Error**: Confirm service account permissions
4. **Session Issues**: Clear cookies and restart server

#### Environment Setup
```bash
# Check Node.js version
node --version  # Should be v16+

# Verify MongoDB connection
node -e "console.log('Testing MongoDB connection...')"

# Test Google Sheets API
node -e "console.log('Testing Google Sheets...')"
```

## 📄 License

This project is licensed under the **ISC License** - see the [package.json](package.json) file for details.

## 🙏 Acknowledgments

- **Mu Alpha Theta Organization** - For supporting mathematical excellence
- **Node.js Community** - For the excellent ecosystem
- **MongoDB** - For reliable data storage
- **Google Workspace** - For Sheets API integration
- **Open Source Contributors** - For the amazing libraries used

---

**Built with ❤️ for the Mu Alpha Theta community**

For more detailed information about specific components, see:
- [Authentication Documentation](AUTH_README.md)
- [Google Sheets Setup Guide](GOOGLE_SHEETS_SETUP.md)
