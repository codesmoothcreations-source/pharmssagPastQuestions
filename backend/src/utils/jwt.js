import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import logger from './logger.js';
import { AuthenticationError } from './errors.js';

const generateAccessToken = (userId, role) => {
    try {
        return jwt.sign(
            { userId, role },
            process.env.JWT_ACCESS_SECRET,
            { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m' }
        );
    } catch (error) {
        logger.error('Access token generation failed:', error);
        throw new AuthenticationError('Failed to generate access token');
    }
};

const generateRefreshToken = (userId) => {
    try {
        return jwt.sign(
            { userId },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d' }
        );
    } catch (error) {
        logger.error('Refresh token generation failed:', error);
        throw new AuthenticationError('Failed to generate refresh token');
    }
};

const verifyAccessToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch (error) {
        logger.error('Access token verification failed:', error);
        
        if (error.name === 'TokenExpiredError') {
            throw new AuthenticationError('Access token expired');
        } else if (error.name === 'JsonWebTokenError') {
            throw new AuthenticationError('Invalid access token');
        }
        
        throw new AuthenticationError('Token verification failed');
    }
};

const verifyRefreshToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
        logger.error('Refresh token verification failed:', error);
        
        if (error.name === 'TokenExpiredError') {
            throw new AuthenticationError('Refresh token expired');
        } else if (error.name === 'JsonWebTokenError') {
            throw new AuthenticationError('Invalid refresh token');
        }
        
        throw new AuthenticationError('Refresh token verification failed');
    }
};

const generateTokenPair = (userId, role) => {
    const accessToken = generateAccessToken(userId, role);
    const refreshToken = generateRefreshToken(userId);
    
    // Hash refresh token for storage
    const hashedRefreshToken = crypto
        .createHash('sha256')
        .update(refreshToken)
        .digest('hex');
    
    return {
        accessToken,
        refreshToken,
        hashedRefreshToken
    };
};

const decodeTokenWithoutVerification = (token) => {
    try {
        return jwt.decode(token);
    } catch (error) {
        logger.error('Token decoding failed:', error);
        return null;
    }
};

const setTokenCookies = (res, accessToken, refreshToken) => {
    // Set access token as HTTP-only cookie
    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000 // 15 minutes
    });
    
    // Set refresh token as HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
};

const clearTokenCookies = (res) => {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
};

export {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
    generateTokenPair,
    decodeTokenWithoutVerification,
    setTokenCookies,
    clearTokenCookies
};