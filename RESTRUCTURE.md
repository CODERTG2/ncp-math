# MAT Portal - Restructured Architecture

This document explains the new modular architecture of the MAT Portal.

## Overview

The MAT Portal has been restructured to improve maintainability and make it easier to modify specific dashboard components without affecting others.

## File Structure

### JavaScript Files

```
public/js/
├── mat.js                 # Main controller - shared functionality and initialization
├── auth.js               # Authentication logic (login, registration, token validation)
├── memberDashboard.js    # Member dashboard specific logic
├── teacherDashboard.js   # Teacher dashboard specific logic
└── componentLoader.js    # Utility for loading HTML components
```

### HTML Components

```
public/components/
├── navbar.html           # Navigation bar component
├── auth-section.html     # Authentication section (login/register forms)
├── member-dashboard.html # Member dashboard layout
└── teacher-dashboard.html # Teacher dashboard layout
```

### Main HTML File

- `public/mat.html` - Main page that loads all components dynamically

## Architecture Benefits

### 1. Modular Design
- Each dashboard (member/teacher) has its own JavaScript file
- Authentication logic is separated from dashboard logic
- HTML components are modular and reusable

### 2. Easy Maintenance
- Changes to member dashboard only require editing `memberDashboard.js` and `member-dashboard.html`
- Changes to teacher dashboard only require editing `teacherDashboard.js` and `teacher-dashboard.html`
- Authentication changes are isolated to `auth.js` and `auth-section.html`

### 3. Component Loading
- HTML components are loaded dynamically using `componentLoader.js`
- Proper initialization order ensures all components are available before JavaScript modules run

## How It Works

### 1. Initialization Sequence
1. `mat.html` loads all JavaScript files
2. `componentLoader.js` loads HTML components into placeholder divs
3. A `componentsLoaded` event is fired when all components are ready
4. Each JavaScript module waits for this event before initializing

### 2. Global State Management
- `mat.js` manages global state (`window.isLoggedIn`, `window.currentUser`, `window.authToken`)
- Other modules access and update this global state as needed

### 3. Inter-Module Communication
- `window.showDashboard()` - Called by auth.js to display dashboards
- `window.showNotification()` - Global notification system
- `window.initializeMemberDashboard()` / `window.initializeTeacherDashboard()` - Called when dashboards become visible

## Making Changes

### To modify the Member Dashboard:
1. Edit `public/components/member-dashboard.html` for layout changes
2. Edit `public/js/memberDashboard.js` for functionality changes

### To modify the Teacher Dashboard:
1. Edit `public/components/teacher-dashboard.html` for layout changes
2. Edit `public/js/teacherDashboard.js` for functionality changes

### To modify Authentication:
1. Edit `public/components/auth-section.html` for form layout changes
2. Edit `public/js/auth.js` for authentication logic changes

### To modify Shared Functionality:
1. Edit `public/js/mat.js` for global features like notifications, logout, etc.

## Key Features

### Component Loading
- HTML components are loaded asynchronously
- Proper error handling for failed component loads
- Initialization waits for all components to be ready

### Dashboard Isolation
- Each dashboard has its own initialization function
- Dashboard-specific event handlers are contained within their modules
- No cross-contamination between dashboard functionalities

### Global Utilities
- Notification system available throughout the application
- Shared state management for authentication
- Common animations and effects handled centrally

## Development Tips

1. **Always wait for `componentsLoaded` event** before accessing DOM elements
2. **Use `window.showNotification()`** for consistent user feedback
3. **Check for element existence** before adding event listeners
4. **Maintain global state** through `window` object properties
5. **Use proper error handling** when loading components or making API calls

## Future Enhancements

- Consider implementing a proper module system (ES6 modules)
- Add TypeScript for better type safety
- Implement component caching for better performance
- Add unit tests for each module
- Consider using a frontend framework for more complex features
