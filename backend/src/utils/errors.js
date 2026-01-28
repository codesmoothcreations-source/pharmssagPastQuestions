class AppError extends Error {
    constructor(message, statusCode, isOperational = true, details = null) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = isOperational;
        this.timestamp = new Date().toISOString();
        this.details = details;
        
        Error.captureStackTrace(this, this.constructor);
    }
}

class ValidationError extends AppError {
    constructor(errors, message = 'Validation failed') {
        super(message, 400, true, { errors });
        this.name = 'ValidationError';
        this.errors = errors;
    }
}

class AuthenticationError extends AppError {
    constructor(message = 'Authentication failed', details = null) {
        super(message, 401, true, details);
        this.name = 'AuthenticationError';
    }
}

class AuthorizationError extends AppError {
    constructor(message = 'You do not have permission to perform this action') {
        super(message, 403);
        this.name = 'AuthorizationError';
    }
}

class NotFoundError extends AppError {
    constructor(message = 'Resource not found', suggestions = null) {
        super(message, 404);
        this.name = 'NotFoundError';
        this.suggestions = suggestions;
    }
}

class ConflictError extends AppError {
    constructor(message = 'Resource already exists') {
        super(message, 409);
        this.name = 'ConflictError';
    }
}

class DatabaseError extends AppError {
    constructor(message = 'Database operation failed') {
        super(message, 500);
        this.name = 'DatabaseError';
    }
}

class CloudinaryError extends AppError {
    constructor(message = 'File upload failed') {
        super(message, 500);
        this.name = 'CloudinaryError';
    }
}

class RateLimitError extends AppError {
    constructor(message = 'Too many requests, please try again later') {
        super(message, 429);
        this.name = 'RateLimitError';
    }
}

class YouTubeAPIError extends AppError {
    constructor(message = 'YouTube API request failed') {
        super(message, 502);
        this.name = 'YouTubeAPIError';
    }
}

// Pretty print errors for console
const prettyPrintError = (error) => {
    const colors = {
        reset: '\x1b[0m',
        red: '\x1b[31m',
        green: '\x1b[32m',
        yellow: '\x1b[33m',
        blue: '\x1b[34m',
        magenta: '\x1b[35m',
        cyan: '\x1b[36m',
        white: '\x1b[37m'
    };

    const emoji = {
        404: '🔍',
        401: '🔐',
        403: '🚫',
        400: '⚠️',
        500: '🔥',
        429: '⏰'
    }[error.statusCode] || '❌';

    console.log(`
${colors.red}${'='.repeat(70)}${colors.reset}
${emoji}  ${colors.magenta}${error.name}${colors.reset} [${colors.cyan}${error.statusCode}${colors.reset}]
${colors.yellow}Message:${colors.reset} ${error.message}
${colors.green}Timestamp:${colors.reset} ${error.timestamp}
${colors.blue}Status:${colors.reset} ${error.status}
${colors.reset}${'-'.repeat(70)}${colors.reset}
    `);

    if (error.errors) {
        console.log(`${colors.yellow}Validation Errors:${colors.reset}`);
        error.errors.forEach((err, index) => {
            console.log(`  ${index + 1}. ${err.field}: ${err.message}`);
        });
        console.log(colors.reset);
    }

    if (error.stack && process.env.NODE_ENV === 'development') {
        console.log(`${colors.yellow}Stack Trace:${colors.reset}`);
        console.log(error.stack);
    }

    console.log(`${colors.red}${'='.repeat(70)}${colors.reset}\n`);
};

export {
    AppError,
    ValidationError,
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
    ConflictError,
    DatabaseError,
    CloudinaryError,
    RateLimitError,
    YouTubeAPIError,
    prettyPrintError
};