import Redis from 'ioredis';
import logger from '../utils/logger.js';

/**
 * Redis Client Configuration
 * Used for storing refresh tokens and OTPs
 */

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB || '0'),
  retryStrategy: (times: number): number => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
};

// Create Redis client
const redisClient = new Redis(redisConfig);

// Event listeners
redisClient.on('connect', () => {
  logger.info('Redis client connected');
});

redisClient.on('ready', () => {
  logger.info('Redis client ready to use');
});

redisClient.on('error', (err: Error) => {
  logger.error(`Redis error: ${err.message}`);
});

redisClient.on('close', () => {
  logger.warn('Redis connection closed');
});

redisClient.on('reconnecting', () => {
  logger.info('Redis client reconnecting...');
});

/**
 * Graceful shutdown
 */
process.on('SIGINT', async () => {
  await redisClient.quit();
  logger.info('Redis connection closed due to application termination');
});

export default redisClient;
