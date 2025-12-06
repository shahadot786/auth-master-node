// @ts-nocheck
import mongoose, { Schema, Model, Types } from 'mongoose';
import { IRefreshToken } from '../types/index.js';

/**
 * RefreshToken Model with static methods
 */
interface IRefreshTokenModel extends Model<IRefreshToken> {
  cleanupExpiredTokens(userId: Types.ObjectId): Promise<void>;
  revokeAllUserTokens(userId: Types.ObjectId): Promise<void>;
}

/**
 * RefreshToken Schema
 * Stores refresh tokens with expiry and revocation support
 */
const refreshTokenSchema = new Schema<IRefreshToken, IRefreshTokenModel>(
  {
    token: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    isRevoked: {
      type: Boolean,
      default: false,
    },
    // Track which device/IP the token was issued from
    ipAddress: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
refreshTokenSchema.index({ token: 1 });
refreshTokenSchema.index({ userId: 1 });
refreshTokenSchema.index({ expiresAt: 1 });

/**
 * TTL index to automatically delete expired tokens after 7 days
 * This keeps the database clean
 */
refreshTokenSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 7 * 24 * 60 * 60 } // 7 days
);

/**
 * Static method to clean up expired tokens for a user
 * @param {Types.ObjectId} userId - User ID
 */
refreshTokenSchema.statics.cleanupExpiredTokens = async function (userId: Types.ObjectId): Promise<void> {
  const now = new Date();
  await this.deleteMany({
    userId,
    expiresAt: { $lt: now },
  });
};

/**
 * Static method to revoke all tokens for a user
 * @param {Types.ObjectId} userId - User ID
 */
refreshTokenSchema.statics.revokeAllUserTokens = async function (userId: Types.ObjectId): Promise<void> {
  await this.updateMany(
    { userId, isRevoked: false },
    { isRevoked: true }
  );
};

const RefreshToken = mongoose.model<IRefreshToken, IRefreshTokenModel>('RefreshToken', refreshTokenSchema);

export default RefreshToken;
