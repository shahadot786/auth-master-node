import { Response } from 'express';
import { SuccessResponse, ErrorResponse, PaginatedResponse, PaginationInfo } from '../types/index.js';

/**
 * Standardized API response formatters
 * Ensures consistent response structure across all endpoints
 */

/**
 * Send success response
 * @param {Response} res - Express response object
 * @param {any} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code (default: 200)
 */
export const successResponse = <T = any>(
  res: Response,
  data: T | null = null,
  message: string = 'Success',
  statusCode: number = 200
): Response<SuccessResponse<T>> => {
  const response: SuccessResponse<T> = {
    success: true,
    message,
    data: data as T,
  };

  return res.status(statusCode).json(response);
};

/**
 * Send error response
 * @param {Response} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 500)
 * @param {any[]} errors - Validation errors or additional error details
 */
export const errorResponse = (
  res: Response,
  message: string = 'Internal Server Error',
  statusCode: number = 500,
  errors: any[] | null = null
): Response<ErrorResponse> => {
  const response: ErrorResponse = {
    success: false,
    message,
  };

  // Add errors array if provided (for validation errors)
  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send paginated response
 * @param {Response} res - Express response object
 * @param {any[]} data - Array of data items
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @param {number} total - Total number of items
 * @param {string} message - Success message
 */
export const paginatedResponse = <T = any>(
  res: Response,
  data: T[],
  page: number,
  limit: number,
  total: number,
  message: string = 'Success'
): Response<PaginatedResponse<T>> => {
  const totalPages = Math.ceil(total / limit);
  
  const pagination: PaginationInfo = {
    currentPage: page,
    totalPages,
    totalItems: total,
    itemsPerPage: limit,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };

  const response: PaginatedResponse<T> = {
    success: true,
    message,
    data,
    pagination,
  };

  return res.status(200).json(response);
};

export default {
  successResponse,
  errorResponse,
  paginatedResponse,
};
