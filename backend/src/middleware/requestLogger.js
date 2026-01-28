import logger from '../utils/logger.js';

/**
 * Request logging middleware
 */
const requestLogger = (req, res, next) => {
    // Start timing
    const start = Date.now();
    
    // Log request start
    logger.debug(`Request started: ${req.method} ${req.originalUrl}`);
    
    // Log response when finished
    res.on('finish', () => {
        const responseTime = Date.now() - start;
        
        if (res.statusCode >= 400) {
            logger.apiError(req, res, { message: 'Request failed' }, responseTime);
        } else {
            logger.apiSuccess(req, res, responseTime);
        }
    });
    
    next();
};

export default requestLogger;