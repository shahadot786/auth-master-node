import { Request, Response, NextFunction } from 'express';
import { ObjectSchema } from 'joi';
import { errorResponse } from '../utils/responseFormatter.js';

/**
 * Validation Middleware
 * Validates request body against Joi schemas
 */

/**
 * Validate request body
 * @param {ObjectSchema} schema - Joi validation schema
 * @returns {Function} Express middleware
 */
export const validate = (schema: ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void | Response => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Return all errors, not just the first one
      stripUnknown: true, // Remove unknown fields
    });

    if (error) {
      // Format validation errors
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return errorResponse(
        res,
        'Validation failed',
        400,
        errors
      );
    }

    // Replace req.body with validated and sanitized value
    req.body = value;
    next();
  };
};

export default validate;
