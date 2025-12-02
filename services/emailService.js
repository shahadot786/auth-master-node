import emailTransporter from '../config/email.js';
import logger from '../utils/logger.js';

/**
 * Email Service
 * Handles sending emails for verification and password reset
 */

/**
 * Send email verification OTP
 * @param {String} email - Recipient email
 * @param {String} otp - 6-digit OTP
 * @param {String} name - User name
 */
export const sendVerificationEmail = async (email, otp, name = 'User') => {
  try {
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM || 'Auth System'}" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Email Verification - OTP',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background-color: #f9f9f9;
              border-radius: 10px;
              padding: 30px;
              box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #4CAF50;
              margin: 0;
            }
            .otp-box {
              background-color: #4CAF50;
              color: white;
              font-size: 32px;
              font-weight: bold;
              text-align: center;
              padding: 20px;
              border-radius: 8px;
              letter-spacing: 8px;
              margin: 20px 0;
            }
            .content {
              background-color: white;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 20px;
            }
            .footer {
              text-align: center;
              font-size: 12px;
              color: #777;
              margin-top: 20px;
            }
            .warning {
              background-color: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 10px;
              margin: 15px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Email Verification</h1>
            </div>
            
            <div class="content">
              <p>Hello <strong>${name}</strong>,</p>
              
              <p>Thank you for registering! Please use the following One-Time Password (OTP) to verify your email address:</p>
              
              <div class="otp-box">${otp}</div>
              
              <p>This OTP will expire in <strong>10 minutes</strong>.</p>
              
              <div class="warning">
                <strong>⚠️ Security Notice:</strong> If you didn't request this verification, please ignore this email or contact our support team.
              </div>
            </div>
            
            <div class="footer">
              <p>This is an automated email. Please do not reply.</p>
              <p>&copy; ${new Date().getFullYear()} Your Application. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Hello ${name},\n\nThank you for registering! Your email verification OTP is: ${otp}\n\nThis OTP will expire in 10 minutes.\n\nIf you didn't request this verification, please ignore this email.`,
    };

    const info = await emailTransporter.sendMail(mailOptions);
    logger.info(`Verification email sent to ${email}: ${info.messageId}`);

    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error(`Failed to send verification email to ${email}: ${error.message}`);
    throw new Error('Failed to send verification email');
  }
};

/**
 * Send password reset OTP
 * @param {String} email - Recipient email
 * @param {String} otp - 6-digit OTP
 * @param {String} name - User name
 */
export const sendPasswordResetEmail = async (email, otp, name = 'User') => {
  try {
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM || 'Auth System'}" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Request - OTP',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background-color: #f9f9f9;
              border-radius: 10px;
              padding: 30px;
              box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #FF5722;
              margin: 0;
            }
            .otp-box {
              background-color: #FF5722;
              color: white;
              font-size: 32px;
              font-weight: bold;
              text-align: center;
              padding: 20px;
              border-radius: 8px;
              letter-spacing: 8px;
              margin: 20px 0;
            }
            .content {
              background-color: white;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 20px;
            }
            .footer {
              text-align: center;
              font-size: 12px;
              color: #777;
              margin-top: 20px;
            }
            .warning {
              background-color: #ffebee;
              border-left: 4px solid #f44336;
              padding: 10px;
              margin: 15px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔑 Password Reset Request</h1>
            </div>
            
            <div class="content">
              <p>Hello <strong>${name}</strong>,</p>
              
              <p>We received a request to reset your password. Please use the following One-Time Password (OTP) to proceed:</p>
              
              <div class="otp-box">${otp}</div>
              
              <p>This OTP will expire in <strong>10 minutes</strong>.</p>
              
              <div class="warning">
                <strong>⚠️ Security Alert:</strong> If you didn't request a password reset, please ignore this email and ensure your account is secure. Consider changing your password if you suspect unauthorized access.
              </div>
            </div>
            
            <div class="footer">
              <p>This is an automated email. Please do not reply.</p>
              <p>&copy; ${new Date().getFullYear()} Your Application. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Hello ${name},\n\nWe received a request to reset your password. Your password reset OTP is: ${otp}\n\nThis OTP will expire in 10 minutes.\n\nIf you didn't request a password reset, please ignore this email.`,
    };

    const info = await emailTransporter.sendMail(mailOptions);
    logger.info(`Password reset email sent to ${email}: ${info.messageId}`);

    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error(`Failed to send password reset email to ${email}: ${error.message}`);
    throw new Error('Failed to send password reset email');
  }
};

export default {
  sendVerificationEmail,
  sendPasswordResetEmail,
};
