import swaggerJsdoc from 'swagger-jsdoc';

/**
 * Swagger Configuration
 * Auto-generates API documentation from JSDoc comments
 */

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Production-Grade Authentication API',
      version: '1.0.0',
      description: 'Complete authentication backend with JWT, refresh tokens, RBAC, and email verification',
      contact: {
        name: 'API Support',
        email: 'support@yourapp.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: process.env.APP_URL || 'http://localhost:5000',
        description: 'Development server',
      },
      {
        url: 'https://api.yourapp.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT access token',
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'refreshToken',
          description: 'Refresh token stored in HTTP-only cookie',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011',
            },
            name: {
              type: 'string',
              example: 'John Doe',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'john@example.com',
            },
            phone: {
              type: 'string',
              example: '1234567890',
            },
            role: {
              type: 'string',
              enum: ['user', 'admin', 'superadmin'],
              example: 'user',
            },
            isVerified: {
              type: 'boolean',
              example: true,
            },
            isDeleted: {
              type: 'boolean',
              example: false,
            },
            lastLogin: {
              type: 'string',
              format: 'date-time',
              example: '2025-12-02T17:52:40.000Z',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2025-12-01T10:00:00.000Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2025-12-02T17:52:40.000Z',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              example: 'Error description',
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string',
                    example: 'email',
                  },
                  message: {
                    type: 'string',
                    example: 'Email is required',
                  },
                },
              },
            },
          },
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'Operation successful',
            },
            data: {
              type: 'object',
            },
          },
        },
        TokenResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'Login successful',
            },
            data: {
              type: 'object',
              properties: {
                user: {
                  $ref: '#/components/schemas/User',
                },
                accessToken: {
                  type: 'string',
                  example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                  description: 'JWT access token (expires in 15 minutes)',
                },
                refreshToken: {
                  type: 'string',
                  example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                  description: 'JWT refresh token (expires in 30 days)',
                },
              },
            },
          },
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
            },
            data: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/User',
              },
            },
            pagination: {
              type: 'object',
              properties: {
                currentPage: {
                  type: 'number',
                  example: 1,
                },
                totalPages: {
                  type: 'number',
                  example: 10,
                },
                totalItems: {
                  type: 'number',
                  example: 100,
                },
                itemsPerPage: {
                  type: 'number',
                  example: 10,
                },
                hasNextPage: {
                  type: 'boolean',
                  example: true,
                },
                hasPrevPage: {
                  type: 'boolean',
                  example: false,
                },
              },
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication endpoints',
      },
      {
        name: 'Admin',
        description: 'Admin management endpoints (requires admin role)',
      },
    ],
  },
  apis: ['./routes/*.js', './controllers/*.js'], // Path to API docs
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

export default swaggerSpec;
