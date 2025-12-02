import logger from '../utils/logger.js';

/**
 * Global Error Handler Middleware
 * Catches all errors and sends formatted responses
 */
const errorHandler = (err, req, res, next) => {
  // Log error
  logger.error(`Error: ${err.message}`, {
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
  });

  // Default error
  let error = {
    success: false,
    message: err.message || 'Internal Server Error',
    statusCode: err.statusCode || 500,
  };

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));

    error = {
      success: false,
      message: 'Validation Error',
      statusCode: 400,
      errors,
    };
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    error = {
      success: false,
      message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`,
      statusCode: 400,
    };
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    error = {
      success: false,
      message: 'Invalid ID format',
      statusCode: 400,
    };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = {
      success: false,
      message: 'Invalid token',
      statusCode: 401,
    };
  }

  if (err.name === 'TokenExpiredError') {
    error = {
      success: false,
      message: 'Token has expired',
      statusCode: 401,
    };
  }

  // Joi validation error
  if (err.isJoi) {
    const errors = err.details.map((detail) => ({
      field: detail.path.join('.'),
      message: detail.message,
    }));

    error = {
      success: false,
      message: 'Validation failed',
      statusCode: 400,
      errors,
    };
  }

  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production') {
    // Remove stack trace in production
    delete err.stack;

    // Generic error message for 500 errors
    if (error.statusCode === 500) {
      error.message = 'Something went wrong. Please try again later.';
    }
  } else {
    // Include stack trace in development
    error.stack = err.stack;
  }

  res.status(error.statusCode).json(error);
};

export default errorHandler;
