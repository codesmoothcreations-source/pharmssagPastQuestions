import User from '../models/user.model.js';
import { verifyAccessToken } from '../utils/jwt.js';
import { AuthenticationError, AuthorizationError } from '../utils/errors.js';
import logger from '../utils/logger.js';

// Authentication middleware
export const authenticate = async (req, res, next) => {
    try {
        // Get token from header or cookie
        let token;
        
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies?.accessToken) {
            token = req.cookies.accessToken;
        }
        
        if (!token) {
            throw new AuthenticationError('No authentication token provided');
        }
        
        // Verify token
        const decoded = verifyAccessToken(token);
        
        // Check if user still exists
        const user = await User.findById(decoded.userId).select('+refreshToken');
        
        if (!user) {
            throw new AuthenticationError('User no longer exists');
        }
        
        // Check if user is active
        if (!user.isActive) {
            throw new AuthenticationError('User account is deactivated');
        }
        
        // Check if password was changed after token was issued
        if (user.changedPasswordAfter(decoded.iat)) {
            throw new AuthenticationError('User recently changed password. Please login again.');
        }
        
        // Attach user to request
        req.user = user;
        
        // Log authentication success
        logger.authLog('authenticated', user._id, {
            method: req.method,
            endpoint: req.originalUrl
        });
        
        next();
    } catch (error) {
        logger.authLog('authentication_failed', null, {
            error: error.message,
            ip: req.ip,
            endpoint: req.originalUrl
        });
        
        next(error);
    }
};

// Role-based authorization middleware
export const authorize = (...roles) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                throw new AuthenticationError('Authentication required');
            }
            
            if (!roles.includes(req.user.role)) {
                throw new AuthorizationError(
                    `Role ${req.user.role} is not authorized to access this resource`
                );
            }
            
            logger.authLog('authorized', req.user._id, {
                role: req.user.role,
                requiredRoles: roles,
                endpoint: req.originalUrl
            });
            
            next();
        } catch (error) {
            next(error);
        }
    };
};

// Optional authentication middleware (doesn't throw error if no token)
export const optionalAuthenticate = async (req, res, next) => {
    try {
        let token;
        
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies?.accessToken) {
            token = req.cookies.accessToken;
        }
        
        if (token) {
            const decoded = verifyAccessToken(token);
            const user = await User.findById(decoded.userId);
            
            if (user && user.isActive && !user.changedPasswordAfter(decoded.iat)) {
                req.user = user;
            }
        }
        
        next();
    } catch (error) {
        // Don't throw error, just proceed without user
        next();
    }
};

// Refresh token authentication (for refresh endpoint only)
export const authenticateRefreshToken = async (req, res, next) => {
    try {
        let refreshToken;
        
        if (req.body.refreshToken) {
            refreshToken = req.body.refreshToken;
        } else if (req.cookies?.refreshToken) {
            refreshToken = req.cookies.refreshToken;
        }
        
        if (!refreshToken) {
            throw new AuthenticationError('No refresh token provided');
        }
        
        // Verify refresh token
        const decoded = verifyRefreshToken(refreshToken);
        
        // Find user with matching refresh token hash
        const hashedRefreshToken = crypto
            .createHash('sha256')
            .update(refreshToken)
            .digest('hex');
        
        const user = await User.findOne({
            _id: decoded.userId,
            refreshToken: hashedRefreshToken
        }).select('+refreshToken');
        
        if (!user) {
            throw new AuthenticationError('Invalid or expired refresh token');
        }
        
        if (!user.isActive) {
            throw new AuthenticationError('User account is deactivated');
        }
        
        req.user = user;
        req.refreshToken = refreshToken;
        
        next();
    } catch (error) {
        logger.authLog('refresh_token_failed', null, {
            error: error.message,
            ip: req.ip
        });
        
        next(error);
    }
};

// Check ownership middleware
export const checkOwnership = (modelName, idParam = 'id') => {
    return async (req, res, next) => {
        try {
            const Model = await import(`../models/${modelName}.model.js`);
            const document = await Model.default.findById(req.params[idParam]);
            
            if (!document) {
                throw new NotFoundError(`${modelName} not found`);
            }
            
            // Admins can do anything
            if (req.user.role === 'ADMIN') {
                return next();
            }
            
            // Check if user owns the document
            if (document.uploadedBy && document.uploadedBy.toString() !== req.user._id.toString()) {
                throw new AuthorizationError('You do not own this resource');
            }
            
            next();
        } catch (error) {
            next(error);
        }
    };
};