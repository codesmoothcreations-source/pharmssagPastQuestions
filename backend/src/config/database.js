import mongoose from 'mongoose';
import logger from '../utils/logger.js';
import { config } from 'dotenv';

config();

const connectDB = async () => {
    try {
        const mongoURI = process.env.NODE_ENV === 'production' 
            ? process.env.MONGODB_URI_PROD 
            : process.env.MONGODB_URI;

        if (!mongoURI) {
            throw new Error('MongoDB URI is not defined in environment variables');
        }

        const conn = await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });

        logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);
        logger.info(`📊 Database: ${conn.connection.name}`);

        // Connection event listeners
        mongoose.connection.on('error', (err) => {
            logger.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            logger.warn('MongoDB disconnected');
        });

        mongoose.connection.on('reconnected', () => {
            logger.info('MongoDB reconnected');
        });

        // Set mongoose options
        mongoose.set('strictQuery', true);
        mongoose.set('toJSON', {
            virtuals: true,
            transform: (doc, ret) => {
                delete ret.__v;
                delete ret.password;
                return ret;
            }
        });

    } catch (error) {
        logger.error(`❌ MongoDB connection failed: ${error.message}`);
        logger.error('Stack trace:', error.stack);
        
        // Retry logic for production
        if (process.env.NODE_ENV === 'production') {
            logger.info('Retrying connection in 5 seconds...');
            setTimeout(connectDB, 5000);
        } else {
            process.exit(1);
        }
    }
};

export default connectDB;