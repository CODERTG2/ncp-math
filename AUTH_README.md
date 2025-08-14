# Mu Alpha Theta - Authentication System

A complete authentication system built for the Mu Alpha Theta mathematics portal with role-based access control for students and teachers.

## Features ✨

### Authentication
- **User Registration**: Students and teachers can create accounts with email verification
- **Secure Login**: Password hashing with bcrypt and JWT-based sessions
- **Email Verification**: Required email verification for new accounts
- **Password Reset**: Secure password reset with email tokens
- **Role-Based Access**: Separate dashboards for students and teachers
- **Session Management**: Persistent sessions across browser restarts

### Security Features
- Password requirements (8+ chars, uppercase, lowercase, number, special character)
- Unique username and email validation
- Protection against common vulnerabilities
- Secure session storage with MongoDB
- JWT token-based authentication
- Password hashing with bcrypt (12 salt rounds)

### User Interface
- Modern, responsive design matching the Mu Alpha Theta theme
- Interactive forms with real-time validation
- Password strength indicators
- Loading states and error handling
- Mobile-friendly responsive layout

## Setup Instructions 🚀

### 1. Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/mu-alpha-theta?retryWrites=true&w=majority

# JWT Secret (generate a secure random string)
JWT_SECRET=your-super-secure-jwt-secret-key-here-make-it-long-and-random

# Session Secret (generate a secure random string)
SESSION_SECRET=your-super-secure-session-secret-key-here-make-it-long-and-random

# Email Configuration (for Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Base URL for email links
BASE_URL=http://localhost:3000

# Environment
NODE_ENV=development
```

### 2. MongoDB Setup

1. Create a MongoDB Atlas account at [mongodb.com](https://www.mongodb.com/)
2. Create a new cluster
3. Create a database user with read/write permissions
4. Get your connection string and replace the placeholder in `MONGODB_URI`

### 3. Email Configuration (Gmail)

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
3. Use your Gmail address for `EMAIL_USER` and the app password for `EMAIL_PASS`

### 4. Install Dependencies

```bash
npm install
```

### 5. Start the Server

```bash
npm start
```

The application will be available at:
- Main site: `http://localhost:3000`
- Authentication portal: `http://localhost:3000/mat`

## Usage Guide 👥

### For Students

1. **Registration**:
   - Visit `/mat`
   - Click "Register" tab
   - Fill out the form and select "Student" role
   - Check your email for verification link
   - Click the verification link to activate your account

2. **Login**:
   - Visit `/mat`
   - Enter your email and password
   - Access your student dashboard at `/dashboard/student`

3. **Student Dashboard Features**:
   - Practice Problems
   - Progress Tracking
   - Competitions
   - Study Groups
   - Learning Resources
   - Profile Settings

### For Teachers

1. **Registration**:
   - Visit `/mat`
   - Click "Register" tab
   - Fill out the form and select "Teacher" role
   - Check your email for verification link
   - Click the verification link to activate your account

2. **Login**:
   - Visit `/mat`
   - Enter your email and password
   - Access your teacher dashboard at `/dashboard/teacher`

3. **Teacher Dashboard Features**:
   - Create Assignments
   - Student Management
   - Grade Book
   - Competition Management
   - Teaching Resources
   - Analytics
   - Class Management
   - Profile Settings

### Password Reset

1. Click "Forgot your password?" on the login form
2. Enter your email address
3. Check your email for the reset link
4. Click the link and create a new password
5. Login with your new password

## File Structure 📁

```
├── config/
│   └── database.js          # MongoDB connection
├── middleware/
│   └── auth.js              # Authentication middleware
├── models/
│   └── User.js              # User schema and validation
├── routes/
│   └── auth.js              # Authentication routes
├── services/
│   └── emailService.js      # Email sending service
├── views/
│   ├── mat.ejs              # Login/Register page
│   ├── student-dashboard.ejs # Student dashboard
│   ├── teacher-dashboard.ejs # Teacher dashboard
│   ├── reset-password.ejs    # Password reset page
│   └── error.ejs            # Error page
├── public/css/
│   └── mat.css              # Authentication styles
└── server.js                # Main server file
```

## API Routes 🛣️

### Authentication Routes
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/forgot-password` - Request password reset
- `GET /auth/verify-email/:token` - Verify email address
- `GET /auth/reset-password/:token` - Password reset page
- `POST /auth/reset-password/:token` - Submit new password
- `GET /auth/logout` - Logout user
- `POST /auth/resend-verification` - Resend verification email

### Protected Routes
- `GET /dashboard/student` - Student dashboard (requires student role)
- `GET /dashboard/teacher` - Teacher dashboard (requires teacher role)

### Public Routes
- `GET /` - Home page
- `GET /mat` - Authentication portal
- `GET /resources` - Resources page
- `GET /ai` - AI page

## Security Considerations 🔒

1. **Password Security**:
   - Minimum 8 characters
   - Must contain uppercase, lowercase, number, and special character
   - Hashed with bcrypt (12 salt rounds)

2. **Session Security**:
   - Secure session cookies
   - Sessions stored in MongoDB
   - 7-day session expiration
   - CSRF protection

3. **Email Security**:
   - Verification tokens expire in 24 hours
   - Password reset tokens expire in 1 hour
   - Secure token generation with crypto.randomBytes

4. **Input Validation**:
   - Server-side validation with express-validator
   - Client-side validation for better UX
   - Sanitization of all inputs

## Troubleshooting 🔧

### Common Issues

1. **Email not sending**:
   - Check your Gmail app password is correct
   - Ensure 2FA is enabled on your Google account
   - Verify EMAIL_USER and EMAIL_PASS in .env

2. **Database connection failed**:
   - Check your MongoDB URI is correct
   - Ensure your IP is whitelisted in MongoDB Atlas
   - Verify database user permissions

3. **Session issues**:
   - Clear browser cookies
   - Check SESSION_SECRET is set in .env
   - Restart the server

4. **JWT errors**:
   - Check JWT_SECRET is set in .env
   - Ensure the secret is the same across server restarts
   - Clear cookies and login again

### Environment Variable Generation

To generate secure secrets for JWT_SECRET and SESSION_SECRET:

```bash
# In Node.js console
require('crypto').randomBytes(64).toString('hex')
```

## Contributing 🤝

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License 📄

ISC License - see package.json for details

---

**Note**: This authentication system is production-ready but remember to:
- Use HTTPS in production
- Set secure environment variables
- Regularly update dependencies
- Monitor for security vulnerabilities
- Implement rate limiting for production use
