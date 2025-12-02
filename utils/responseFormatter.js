/**
 * Standardized API response formatters
 * Ensures consistent response structure across all endpoints
 */

/**
 * Send success response
 * @param {Object} res - Express response object
 * @param {Object} data - Response data
 * @param {String} message - Success message
 * @param {Number} statusCode - HTTP status code (default: 200)
 */
export const successResponse = (res, data = null, message = 'Success', statusCode = 200) => {
  const response = {
    success: true,
    message,
    data,
  };

  return res.status(statusCode).json(response);
};

/**
 * Send error response
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 * @param {Number} statusCode - HTTP status code (default: 500)
 * @param {Array} errors - Validation errors or additional error details
 */
export const errorResponse = (res, message = 'Internal Server Error', statusCode = 500, errors = null) => {
  const response = {
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
 * @param {Object} res - Express response object
 * @param {Array} data - Array of data items
 * @param {Number} page - Current page number
 * @param {Number} limit - Items per page
 * @param {Number} total - Total number of items
 * @param {String} message - Success message
 */
export const paginatedResponse = (res, data, page, limit, total, message = 'Success') => {
  const totalPages = Math.ceil(total / limit);
  
  const response = {
    success: true,
    message,
    data,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: total,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };

  return res.status(200).json(response);
};

export default {
  successResponse,
  errorResponse,
  paginatedResponse,
};
