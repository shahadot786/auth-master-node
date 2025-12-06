// @ts-nocheck
import User from '../models/User.js';
import { sanitizeUser } from '../utils/helpers.js';
import { sendVerificationEmail, sendPasswordResetEmail } from './emailService.js';
import { generateAccessToken, generateRefreshToken, revokeRefreshToken } from './tokenService.js';
import { createOTP, verifyOTP } from './redisOTPService.js';
import logger from '../utils/logger.js';

/**
 * Auth Service
 * Contains business logic for authentication operations
 */

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Object} Created user and verification status
 */
export const registerUser = async (userData) => {
  const { name, email, phone, password, role } = userData;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // Create new user
  const user = await User.create({
    name,
    email,
    phone: phone || null,
    password,
    role: role || 'user',
    isVerified: false,
  });

  // Generate and store OTP in Redis
  const otp = await createOTP(email, 'email_verification');

  // Send verification email
  try {
    await sendVerificationEmail(email, otp, name);
  } catch (error) {
    logger.error(`Failed to send verification email: ${error.message}`);
    // Don't throw error, user is created successfully
  }

  logger.info(`User registered: ${email}`);

  return {
    user: sanitizeUser(user),
    message: 'Registration successful. Please check your email for verification OTP.',
  };
};

/**
 * Login user
 * @param {String} email - User email
 * @param {String} password - User password
 * @param {String} ipAddress - Client IP address
 * @param {String} userAgent - Client user agent
 * @returns {Object} User data and tokens
 */
export const loginUser = async (email, password, ipAddress = null, userAgent = null) => {
  // Find user and include password field
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Check if user is soft deleted
  const deletedUser = await User.findOne({ email, isDeleted: true }).select('+isDeleted');
  if (deletedUser) {
    throw new Error('This account has been deactivated. Please contact support.');
  }

  // Compare password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  // Check if email is verified
  if (!user.isVerified) {
    throw new Error('Please verify your email before logging in');
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Generate tokens
  const accessToken = generateAccessToken(user._id, user.role, user.email);
  const refreshToken = await generateRefreshToken(user._id, ipAddress, userAgent);

  logger.info(`User logged in: ${email}`);

  return {
    user: sanitizeUser(user),
    accessToken,
    refreshToken,
  };
};

/**
 * Logout user
 * @param {String} refreshToken - Refresh token to revoke
 */
export const logoutUser = async (refreshToken) => {
  if (!refreshToken) {
    throw new Error('Refresh token is required');
  }

  await revokeRefreshToken(refreshToken);

  logger.info('User logged out successfully');

  return { message: 'Logged out successfully' };
};

/**
 * Verify email with OTP
 * @param {String} email - User email
 * @param {String} otp - OTP code
 * @returns {Object} Verification result
 */
export const verifyEmail = async (email, otp) => {
  // Verify OTP from Redis
  const verification = await verifyOTP(email, otp, 'email_verification');

  if (!verification.valid) {
    throw new Error(verification.message);
  }

  // Update user verification status
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('User not found');
  }

  if (user.isVerified) {
    throw new Error('Email is already verified');
  }

  user.isVerified = true;
  await user.save();

  logger.info(`Email verified: ${email}`);

  return {
    message: 'Email verified successfully',
    user: sanitizeUser(user),
  };
};

/**
 * Request password reset
 * @param {String} email - User email
 * @returns {Object} Result message
 */
export const requestPasswordReset = async (email) => {
  // Check if user exists
  const user = await User.findOne({ email });
  if (!user) {
    // Don't reveal if user exists or not (security best practice)
    return {
      message: 'If an account exists with this email, you will receive a password reset OTP.',
    };
  }

  // Generate and store OTP in Redis
  const otp = await createOTP(email, 'password_reset');

  // Send password reset email
  try {
    await sendPasswordResetEmail(email, otp, user.name);
  } catch (error) {
    logger.error(`Failed to send password reset email: ${error.message}`);
    throw new Error('Failed to send password reset email');
  }

  logger.info(`Password reset requested: ${email}`);

  return {
    message: 'If an account exists with this email, you will receive a password reset OTP.',
  };
};

/**
 * Reset password with OTP
 * @param {String} email - User email
 * @param {String} otp - OTP code
 * @param {String} newPassword - New password
 * @returns {Object} Result message
 */
export const resetPassword = async (email, otp, newPassword) => {
  // Verify OTP from Redis
  const verification = await verifyOTP(email, otp, 'password_reset');

  if (!verification.valid) {
    throw new Error(verification.message);
  }

  // Find user
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('User not found');
  }

  // Update password (will be hashed by pre-save middleware)
  user.password = newPassword;
  await user.save();

  logger.info(`Password reset successful: ${email}`);

  return {
    message: 'Password reset successfully. You can now login with your new password.',
  };
};

export default {
  registerUser,
  loginUser,
  logoutUser,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
};
