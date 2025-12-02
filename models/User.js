import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import securityConfig from '../config/security.js';

/**
 * User Schema
 * Implements secure password hashing and JWT token generation
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [50, 'Name must not exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    phone: {
      type: String,
      trim: true,
      default: null,
      match: [/^[0-9]{10,15}$/, 'Please provide a valid phone number'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false, // Don't return password by default
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'superadmin'],
      default: 'user',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      select: false, // Don't return isDeleted by default
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ isDeleted: 1 });

/**
 * Pre-save middleware to hash password
 * Only hashes if password is modified
 */
userSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Generate salt and hash password
    const salt = await bcrypt.genSalt(securityConfig.bcrypt.saltRounds);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Instance method to compare password
 * @param {String} candidatePassword - Password to compare
 * @returns {Boolean} True if password matches, false otherwise
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

/**
 * Instance method to generate JWT access token
 * @returns {String} JWT access token
 */
userSchema.methods.generateAccessToken = function () {
  const payload = {
    id: this._id,
    email: this.email,
    role: this.role,
  };

  return jwt.sign(payload, securityConfig.jwt.accessTokenSecret, {
    expiresIn: securityConfig.jwt.accessTokenExpiry,
  });
};

/**
 * Instance method to generate JWT refresh token
 * @returns {String} JWT refresh token
 */
userSchema.methods.generateRefreshToken = function () {
  const payload = {
    id: this._id,
  };

  return jwt.sign(payload, securityConfig.jwt.refreshTokenSecret, {
    expiresIn: securityConfig.jwt.refreshTokenExpiry,
  });
};

/**
 * Query middleware to exclude soft-deleted users by default
 */
userSchema.pre(/^find/, function (next) {
  // Only apply if isDeleted is not explicitly queried
  if (!this.getQuery().isDeleted) {
    this.where({ isDeleted: { $ne: true } });
  }
  next();
});

const User = mongoose.model('User', userSchema);

export default User;
