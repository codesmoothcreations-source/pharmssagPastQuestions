import logger from '../utils/logger.js';

/**
 * Format error response for API
 */
const formatErrorResponse = (err, includeDetails = false) => {
    const baseResponse = {
        success: false,
        status: err.status,
        message: err.message,
        timestamp: err.timestamp || new Date().toISOString(),
        path: err.path || undefined,
        ...(err.errors && { errors: err.errors })
    };

    // Add emoji based on status code
    if (err.statusCode >= 500) {
        baseResponse.emoji = '🔥';
        baseResponse.title = 'Server Error';
    } else if (err.statusCode === 404) {
        baseResponse.emoji = '🔍';
        baseResponse.title = 'Not Found';
    } else if (err.statusCode === 403) {
        baseResponse.emoji = '🚫';
        baseResponse.title = 'Access Denied';
    } else if (err.statusCode === 401) {
        baseResponse.emoji = '🔐';
        baseResponse.title = 'Authentication Required';
    } else if (err.statusCode === 400) {
        baseResponse.emoji = '⚠️';
        baseResponse.title = 'Validation Error';
    } else if (err.statusCode === 429) {
        baseResponse.emoji = '⏰';
        baseResponse.title = 'Too Many Requests';
    } else {
        baseResponse.emoji = '❌';
        baseResponse.title = 'Error';
    }

    // Add debug info in development
    if (includeDetails) {
        baseResponse.debug = {
            code: err.code,
            name: err.name,
            stack: err.stack?.split('\n').slice(0, 3)
        };
    }

    return baseResponse;
};

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
    // Handle Mongoose ValidationError
    if (err.name === 'ValidationError') {
        err.statusCode = 400;
        err.status = 'fail';
        
        // Format Mongoose validation errors
        const errors = {};
        for (const field in err.errors) {
            if (err.errors[field].path) {
                errors[field] = err.errors[field].message;
            }
        }
        
        err.errors = errors;
        err.message = 'Validation failed';
    }
    
    // Handle Mongoose CastError (invalid ObjectId)
    if (err.name === 'CastError') {
        err.statusCode = 400;
        err.status = 'fail';
        err.message = `Invalid ${err.path}: ${err.value}`;
    }
    
    // Handle duplicate key errors
    if (err.code === 11000) {
        err.statusCode = 400;
        err.status = 'fail';
        const field = Object.keys(err.keyPattern)[0];
        err.message = `${field} already exists`;
    }
    
    // Set defaults if not set
    err.statusCode = err.statusCode || 500;
    err.status = `${err.statusCode}`.startsWith('4') ? 'fail' : 'error';

    // Log error
    console.error(`${err.emoji || '🔥'} Error:`, {
        statusCode: err.statusCode,
        name: err.name,
        message: err.message,
        path: req.path,
        method: req.method,
        user: req.user?._id || 'anonymous',
        ...(err.errors && { errors: err.errors }),
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });

    // Send response
    const response = {
        success: false,
        status: err.status,
        message: err.message,
        ...(err.errors && { errors: err.errors })
    };

    // Add stack trace in development only
    if (process.env.NODE_ENV === 'development') {
        response.stack = err.stack;
    }

    res.status(err.statusCode).json(response);
};

/**
 * Async handler wrapper
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

/**
 * Custom error class for Cloudinary errors
 */
class CloudinaryError extends Error {
    constructor(message, code = 'CLOUDINARY_ERROR') {
        super(message);
        this.name = 'CloudinaryError';
        this.code = code;
        this.statusCode = 500;
    }
}

/**
 * Custom error class for upload errors
 */
class UploadError extends Error {
    constructor(message, field = 'file', code = 'UPLOAD_ERROR') {
        super(message);
        this.name = 'UploadError';
        this.code = code;
        this.field = field;
        this.statusCode = 400;
    }
}

export { 
    errorHandler, 
    asyncHandler, 
    CloudinaryError, 
    UploadError 
};