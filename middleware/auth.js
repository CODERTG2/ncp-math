import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Middleware to check if user is authenticated
export const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.session.token;
    
    if (!token) {
      return res.redirect('/mat?error=Please log in to access this page');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      req.session.destroy();
      return res.redirect('/mat?error=User not found');
    }

    if (!user.isEmailVerified) {
      return res.redirect('/mat?error=Please verify your email first');
    }

    req.user = user;
    res.locals.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    req.session.destroy();
    return res.redirect('/mat?error=Authentication failed');
  }
};

// Middleware to check if user has specific role
export const hasRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.redirect('/mat?error=Authentication required');
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).render('error', {
        title: 'Access Denied',
        message: 'You do not have permission to access this page',
        user: req.user
      });
    }

    next();
  };
};

// Middleware to redirect authenticated users away from login page
export const redirectIfAuthenticated = async (req, res, next) => {
  try {
    const token = req.session.token;
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      
      if (user && user.isEmailVerified) {
        return res.redirect(`/dashboard/${user.role}`);
      }
    }
  } catch (error) {
    // Token is invalid, continue to login page
  }
  
  next();
};

// Middleware to attach user to response locals if authenticated (for navbar)
export const attachUser = async (req, res, next) => {
  try {
    const token = req.session.token;
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (user && user.isEmailVerified) {
        res.locals.user = user;
      }
    }
  } catch (error) {
    // Ignore errors, user just won't be attached
  }
  
  next();
};
