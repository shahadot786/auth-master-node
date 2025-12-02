import mongoose from 'mongoose';
import logger from '../utils/logger.js';

/**
 * Connect to MongoDB database
 * Implements connection retry logic and event listeners
 */
const connectDatabase = async () => {
  try {
    const options = {
      // Use new URL parser
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // Set connection timeout
      serverSelectionTimeoutMS: 5000,
      // Set socket timeout
      socketTimeoutMS: 45000,
    };

    const conn = await mongoose.connect(process.env.MONGODB_URI, options);

    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    logger.info(`Database Name: ${conn.connection.name}`);

    // Connection event listeners
    mongoose.connection.on('connected', () => {
      logger.info('Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      logger.error(`Mongoose connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('Mongoose disconnected from MongoDB');
    });

    // Handle application termination
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('Mongoose connection closed due to application termination');
      process.exit(0);
    });

    return conn;
  } catch (error) {
    logger.error(`Database connection failed: ${error.message}`);
    logger.error('Retrying connection in 5 seconds...');
    
    // Retry connection after 5 seconds
    setTimeout(connectDatabase, 5000);
  }
};

export default connectDatabase;
