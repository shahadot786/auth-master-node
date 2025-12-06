// @ts-nocheck
/**
 * Test Setup and Teardown
 * Handles database connection and cleanup for tests
 */

import mongoose from 'mongoose';
import { connectDatabase } from '../config/database';
import redisClient from '../config/redis';

// Setup before all tests
beforeAll(async () => {
  // Connect to test database
  await connectDatabase();
  
  // Wait for Redis connection
  if (redisClient.status !== 'ready') {
    await new Promise((resolve) => {
      redisClient.once('ready', resolve);
    });
  }
});

// Cleanup after all tests
afterAll(async () => {
  // Close database connection
  await mongoose.connection.close();
  
  // Close Redis connection
  await redisClient.quit();
});

// Clear database between test suites
afterEach(async () => {
  // Optional: Clear specific collections if needed
  // await mongoose.connection.db.dropDatabase();
});
