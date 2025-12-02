import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';

/**
 * Create and configure email transporter
 * Uses SMTP configuration from environment variables
 */
const createEmailTransporter = () => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
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

    // Verify transporter configuration
    transporter.verify((error, success) => {
      if (error) {
        logger.error(`Email transporter verification failed: ${error.message}`);
      } else {
        logger.info('Email transporter is ready to send messages');
      }
    });

    return transporter;
  } catch (error) {
    logger.error(`Failed to create email transporter: ${error.message}`);
    throw error;
  }
};

const emailTransporter = createEmailTransporter();

export default emailTransporter;
