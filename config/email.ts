// @ts-nocheck
import nodemailer, { Transporter } from 'nodemailer';
import logger from '../utils/logger.js';

/**
 * Create and configure email transporter
 * Uses SMTP configuration from environment variables
 */
const createEmailTransporter = (): Transporter => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      // Connection timeout
      connectionTimeout: 10000,
      // Greeting timeout
      greetingTimeout: 10000,
      // Socket timeout
      socketTimeout: 10000,
    });

    // Verify transporter configuration only if credentials are provided
    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
      transporter.verify((error, success) => {
        if (error) {
          logger.warn(`Email transporter verification failed: ${error.message}`);
          logger.warn('Email functionality will be limited. Please check your email credentials.');
        } else {
          logger.info('Email transporter is ready to send messages');
        }
      });
    } else {
      logger.warn('Email credentials not configured. Email functionality will be disabled.');
    }

    return transporter;
  } catch (error) {
    const err = error as Error;
    logger.error(`Failed to create email transporter: ${err.message}`);
    throw error;
  }
};

const emailTransporter = createEmailTransporter();

export default emailTransporter;
