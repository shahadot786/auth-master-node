import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import swaggerUi from 'swagger-ui-express';
import connectDatabase from './config/database.js';
import redisClient from './config/redis.js';
import swaggerSpec from './config/swagger.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import errorHandler from './middleware/errorHandler.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import logger from './utils/logger.js';
import securityConfig from './config/security.js';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

/**
 * Security Middleware
 */

// Helmet - Set security HTTP headers
app.use(helmet());

// CORS - Enable Cross-Origin Resource Sharing
app.use(cors(securityConfig.cors));

// Body parser - Parse JSON request bodies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser - Parse cookies
app.use(cookieParser(process.env.COOKIE_SECRET));

// Sanitize data - Prevent NoSQL injection
app.use(mongoSanitize());

/**
 * Logging Middleware
 */

// Morgan - HTTP request logger (only in development)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  // Use combined format in production
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  }));
}

/**
 * Rate Limiting
 */

// Apply general rate limiter to all routes
app.use(generalLimiter);

/**
 * Health Check Route
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

/**
 * API Documentation (Swagger)
 */
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Auth API Documentation',
}));

// Swagger JSON endpoint
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

/**
 * API Routes
 */
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

/**
 * 404 Handler - Route not found
 */
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

/**
 * Global Error Handler
 */
app.use(errorHandler);

/**
 * Server Configuration
 */
const PORT = process.env.PORT || 5000;

/**
 * Start Server
 */
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();

    // Start listening
    app.listen(PORT, () => {
      logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
      logger.info(`Health check: http://localhost:${PORT}/health`);
      logger.info(`API Base URL: http://localhost:${PORT}/api`);
      logger.info(`API Documentation: http://localhost:${PORT}/api-docs`);
      logger.info(`Redis status: ${redisClient.status}`);
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  logger.error(err.stack);
  // Close server & exit process
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  logger.error(err.stack);
  // Close server & exit process
  process.exit(1);
});

// Start the server
startServer();

export default app;
