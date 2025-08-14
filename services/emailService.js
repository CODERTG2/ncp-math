import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

class EmailService {
  constructor() {
    // Only create transporter if email credentials are provided
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
    } else {
      console.log('📧 Email service not configured - EMAIL_USER and EMAIL_PASS required');
      this.transporter = null;
    }
  }

  async sendVerificationEmail(user, token) {
    if (!this.transporter) {
      console.log('📧 Email service not configured - skipping verification email');
      throw new Error('Email service not configured. Please set up EMAIL_USER and EMAIL_PASS in your .env file.');
    }

    const verificationUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/verify-email/${token}`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Verify Your Email - Mu Alpha Theta',
      html: `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #1e40af, #3b82f6); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Mu Alpha Theta</h1>
            <p style="color: #e2e8f0; margin: 10px 0 0 0; font-size: 16px;">Welcome to our mathematical community!</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #1e293b; margin-top: 0;">Welcome, ${user.firstName}!</h2>
            <p style="color: #475569; line-height: 1.6; font-size: 16px;">
              Thank you for joining Mu Alpha Theta! Please verify your email address to complete your registration as a <strong>${user.role}</strong>.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background: linear-gradient(135deg, #1e40af, #3b82f6); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 8px; 
                        font-weight: 600;
                        display: inline-block;
                        font-size: 16px;">
                Verify Email Address
              </a>
            </div>
            
            <p style="color: #64748b; font-size: 14px; line-height: 1.5;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${verificationUrl}" style="color: #3b82f6; word-break: break-all;">${verificationUrl}</a>
            </p>
            
            <p style="color: #64748b; font-size: 14px; margin-top: 20px;">
              This verification link will expire in 24 hours. If you didn't create an account, please ignore this email.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #64748b; font-size: 12px;">
            <p>© 2025 Mu Alpha Theta - NCP. All rights reserved.</p>
          </div>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      // Email sent successfully
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw new Error('Failed to send verification email');
    }
  }

  async sendPasswordResetEmail(user, token) {
    if (!this.transporter) {
      console.log('📧 Email service not configured - skipping password reset email');
      throw new Error('Email service not configured. Please set up EMAIL_USER and EMAIL_PASS in your .env file.');
    }
    const resetUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/reset-password/${token}`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Reset Your Password - Mu Alpha Theta',
      html: `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #dc2626, #ef4444); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Password Reset</h1>
            <p style="color: #fee2e2; margin: 10px 0 0 0; font-size: 16px;">Secure your account</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #1e293b; margin-top: 0;">Hello, ${user.firstName}!</h2>
            <p style="color: #475569; line-height: 1.6; font-size: 16px;">
              We received a request to reset your password for your Mu Alpha Theta account. Click the button below to create a new password.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background: linear-gradient(135deg, #dc2626, #ef4444); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 8px; 
                        font-weight: 600;
                        display: inline-block;
                        font-size: 16px;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #64748b; font-size: 14px; line-height: 1.5;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${resetUrl}" style="color: #ef4444; word-break: break-all;">${resetUrl}</a>
            </p>
            
            <p style="color: #64748b; font-size: 14px; margin-top: 20px;">
              This reset link will expire in 1 hour. If you didn't request a password reset, please ignore this email.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #64748b; font-size: 12px;">
            <p>© 2025 Mu Alpha Theta - NCP. All rights reserved.</p>
          </div>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      // Password reset email sent successfully
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }
}

export default new EmailService();
