// @ts-nocheck
import mongoose, { Schema, Model, Types } from 'mongoose';
import { IOTP, OTPType, OTPVerificationResult } from '../types/index.js';

/**
 * OTP Model with static methods
 */
interface IOTPModel extends Model<IOTP> {
  verifyOTP(email: string, otp: string, type: OTPType): Promise<OTPVerificationResult>;
  cleanupOldOTPs(email: string, type: OTPType): Promise<void>;
}

/**
 * OTP Schema
 * Stores one-time passwords for email verification and password reset
 */
const otpSchema = new Schema<IOTP, IOTPModel>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    otp: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['email_verification', 'password_reset'],
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
    attempts: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for faster queries
otpSchema.index({ email: 1, type: 1 });
otpSchema.index({ expiresAt: 1 });

/**
 * TTL index to automatically delete expired OTPs
 * MongoDB will delete documents where expiresAt is in the past
 */
otpSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

/**
 * Static method to verify OTP
 * @param {string} email - User email
 * @param {string} otp - OTP to verify
 * @param {OTPType} type - OTP type (email_verification or password_reset)
 * @returns {Promise<OTPVerificationResult>} Verification result
 */
otpSchema.statics.verifyOTP = async function (
  email: string,
  otp: string,
  type: OTPType
): Promise<OTPVerificationResult> {
  const otpDoc = await this.findOne({
    email,
    otp,
    type,
    isUsed: false,
    expiresAt: { $gt: new Date() },
  });

  if (!otpDoc) {
    return {
      valid: false,
      message: 'Invalid or expired OTP',
    };
  }

  // Increment attempts
  otpDoc.attempts += 1;

  // Lock OTP after 3 failed attempts (if needed in future)
  if (otpDoc.attempts > 5) {
    await otpDoc.save();
    return {
      valid: false,
      message: 'Too many attempts. Please request a new OTP',
    };
  }

  // Mark as used
  otpDoc.isUsed = true;
  await otpDoc.save();

  return {
    valid: true,
    message: 'OTP verified successfully',
  };
};

/**
 * Static method to clean up old OTPs for an email
 * @param {string} email - User email
 * @param {OTPType} type - OTP type
 */
otpSchema.statics.cleanupOldOTPs = async function (email: string, type: OTPType): Promise<void> {
  await this.deleteMany({
    email,
    type,
    $or: [
      { isUsed: true },
      { expiresAt: { $lt: new Date() } },
    ],
  });
};

const OTP = mongoose.model<IOTP, IOTPModel>('OTP', otpSchema);

export default OTP;
