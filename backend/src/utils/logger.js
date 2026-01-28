import pino from 'pino';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create logs directory
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Pino configuration
const pinoConfig = {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname'
        }
    },
    timestamp: () => `,"time":"${new Date().toISOString()}"`
};

// Create logger
const logger = pino(pinoConfig);

// Store original methods before overriding
const originalDebug = logger.debug.bind(logger);
const originalInfo = logger.info.bind(logger);
const originalError = logger.error.bind(logger);
const originalWarn = logger.warn.bind(logger);

// File transports for production
if (process.env.NODE_ENV === 'production') {
    const errorTransport = pino.transport({
        target: 'pino/file',
        options: { destination: path.join(logsDir, 'error.log'), mkdir: true }
    });
    
    const combinedTransport = pino.transport({
        target: 'pino/file',
        options: { destination: path.join(logsDir, 'combined.log'), mkdir: true }
    });
    
    const errorLogger = pino({ level: 'error' }, errorTransport);
    const combinedLogger = pino({ level: 'info' }, combinedTransport);
    
    // Override error to write to files
    logger.error = (msg, ...args) => {
        errorLogger.error(msg, ...args);
        combinedLogger.error(msg, ...args);
        originalError(msg, ...args);
    };
    
    // Override info to write to files
    logger.info = (msg, ...args) => {
        combinedLogger.info(msg, ...args);
        originalInfo(msg, ...args);
    };
}

// ========== CUSTOM METHODS ==========

// Authentication logging
logger.authLog = (action, userId, details = {}) => {
    logger.info(`🔐 Auth ${action}: User ${userId}`, details);
};

// API logging
logger.apiLog = (req, res, responseTime) => {
    const logData = {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        responseTime: `${responseTime}ms`,
        ip: req.ip,
        userId: req.user?.id || 'anonymous'
    };
    
    if (res.statusCode >= 400) {
        logger.error('❌ API Error', logData);
    } else {
        logger.info('✅ API Request', logData);
    }
};

// Cloudinary logging
logger.cloudinaryLog = (action, data) => {
    logger.info(`☁️ Cloudinary ${action}`, data);
};

// Database logging
logger.dbLog = (action, model, details = {}) => {
    logger.debug(`🗄️ DB ${action} on ${model}`, details);
};

// Custom convenience methods
logger.success = (msg, ...args) => {
    logger.info(`✅ ${msg}`, ...args);
};

logger.warning = (msg, ...args) => {
    logger.warn(`⚠️ ${msg}`, ...args);
};

// DEBUG METHOD - FIXED - NO RECURSION
logger.debug = (msg, ...args) => {
    if (process.env.NODE_ENV === 'development') {
        originalDebug(`🔍 ${msg}`, ...args);
    }
};

// API helpers
logger.apiSuccess = (req, res, responseTime) => {
    logger.info(`✅ [${req.method}] ${req.originalUrl} - ${res.statusCode} (${responseTime}ms)`);
};

logger.apiError = (req, res, error, responseTime) => {
    logger.error(`❌ [${req.method}] ${req.originalUrl} - ${res.statusCode} - ${error.message} (${responseTime}ms)`);
};

export default logger;