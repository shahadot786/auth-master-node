import { Request } from 'express';
import { Document, Model, Types } from 'mongoose';

/**
 * User Role Types
 */
export type UserRole = 'user' | 'admin' | 'superadmin';

/**
 * OTP Type
 */
export type OTPType = 'email_verification' | 'password_reset';

/**
 * User Interface (Document)
 */
export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  phone: string | null;
  password: string;
  role: UserRole;
  isVerified: boolean;
  isDeleted: boolean;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User Methods Interface
 */
export interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAccessToken(): string;
  generateRefreshToken(): string;
}

/**
 * User Model Type (Document + Methods)
 */
export type UserDocument = IUser & IUserMethods;

/**
 * User Model Interface
 */
export type UserModel = Model<IUser, {}, IUserMethods>;

/**
 * OTP Document Interface
 */
export interface IOTP extends Document {
  _id: Types.ObjectId;
  email: string;
  otp: string;
  type: OTPType;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Refresh Token Document Interface
 */
export interface IRefreshToken extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  token: string;
  expiresAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * JWT Payload Interfaces
 */
export interface AccessTokenPayload {
  id: string;
  email: string;
  role: UserRole;
}

export interface RefreshTokenPayload {
  id: string;
}

/**
 * Token Verification Result
 */
export interface TokenVerificationResult {
  valid: boolean;
  decoded?: AccessTokenPayload | RefreshTokenPayload;
  error?: string;
}

/**
 * OTP Verification Result
 */
export interface OTPVerificationResult {
  valid: boolean;
  message: string;
}

/**
 * Sanitized User (for responses)
 */
export interface SanitizedUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  isVerified: boolean;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Auth Service Response Types
 */
export interface RegisterResponse {
  user: SanitizedUser;
  message: string;
}

export interface LoginResponse {
  user: SanitizedUser;
  accessToken: string;
  refreshToken: string;
}

export interface VerifyEmailResponse {
  message: string;
  user: SanitizedUser;
}

export interface PasswordResetResponse {
  message: string;
}

/**
 * Express Request Extension
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    id: Types.ObjectId;
    email: string;
    role: UserRole;
    name: string;
  };
}

/**
 * API Response Structures
 */
export interface SuccessResponse<T = any> {
  success: true;
  message: string;
  data: T;
}

export interface ErrorResponse {
  success: false;
  message: string;
  errors?: any[];
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResponse<T = any> {
  success: true;
  message: string;
  data: T[];
  pagination: PaginationInfo;
}

/**
 * Security Configuration Interface
 */
export interface SecurityConfig {
  jwt: {
    accessTokenSecret: string;
    refreshTokenSecret: string;
    accessTokenExpiry: string;
    refreshTokenExpiry: string;
  };
  bcrypt: {
    saltRounds: number;
  };
  otp: {
    expiryMinutes: number;
    length: number;
  };
  cors: {
    origin: string | string[];
    credentials: boolean;
  };
}

/**
 * Email Configuration Interface
 */
export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
}
