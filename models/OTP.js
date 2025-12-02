import mongoose from 'mongoose';

/**
 * OTP Schema
 * Stores one-time passwords for email verification and password reset
 */
const otpSchema = new mongoose.Schema(
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
 * @param {String} email - User email
 * @param {String} otp - OTP to verify
 * @param {String} type - OTP type (email_verification or password_reset)
 * @returns {Object} Verification result
 */
otpSchema.statics.verifyOTP = async function (email, otp, type) {
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
 * @param {String} email - User email
 * @param {String} type - OTP type
 */
otpSchema.statics.cleanupOldOTPs = async function (email, type) {
  await this.deleteMany({
    email,
    type,
    $or: [
      { isUsed: true },
      { expiresAt: { $lt: new Date() } },
    ],
  });
};

const OTP = mongoose.model('OTP', otpSchema);

export default OTP;
