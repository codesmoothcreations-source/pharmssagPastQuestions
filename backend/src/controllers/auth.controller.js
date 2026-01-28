import User from '../models/user.model.js';
import { 
    generateTokenPair, 
    verifyRefreshToken, 
    setTokenCookies, 
    clearTokenCookies 
} from '../utils/jwt.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { AuthenticationError, ConflictError } from '../utils/errors.js';
import logger from '../utils/logger.js';
import crypto from 'crypto';

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new ConflictError('User with this email already exists');
    }

    // Create user
    const user = await User.create({
        name,
        email,
        password,
        role: 'USER' // Default role, admins are created manually in DB
    });

    // Generate tokens
    const { accessToken, refreshToken, hashedRefreshToken } = generateTokenPair(user._id, user.role);

    // Save refresh token hash to database
    user.refreshToken = hashedRefreshToken;
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Set cookies
    setTokenCookies(res, accessToken, refreshToken);

    // Log registration - FIXED THIS LINE
    logger.authLog('registered', user._id, { email, role: user.role });

    res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isActive: user.isActive
            },
            tokens: {
                accessToken,
                refreshToken,
                expiresIn: process.env.ACCESS_TOKEN_EXPIRY
            }
        }
    });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Find user and include password field
    const user = await User.findOne({ email }).select('+password +refreshToken');
    
    if (!user) {
        throw new AuthenticationError('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
        throw new AuthenticationError('Account is deactivated. Please contact administrator.');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
        throw new AuthenticationError('Invalid credentials');
    }

    // Generate tokens
    const { accessToken, refreshToken, hashedRefreshToken } = generateTokenPair(user._id, user.role);

    // Save refresh token and update last login
    user.refreshToken = hashedRefreshToken;
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Set cookies
    setTokenCookies(res, accessToken, refreshToken);

    // Log login - FIXED THIS LINE
    logger.authLog('logged_in', user._id, { email, role: user.role });

    res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isActive: user.isActive,
                lastLogin: user.lastLogin
            },
            tokens: {
                accessToken,
                refreshToken,
                expiresIn: process.env.ACCESS_TOKEN_EXPIRY
            }
        }
    });
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // Clear refresh token from database
    await User.findByIdAndUpdate(userId, {
        $unset: { refreshToken: '' }
    });

    // Clear cookies
    clearTokenCookies(res);

    // Log logout - FIXED THIS LINE
    logger.authLog('logged_out', userId);

    res.status(200).json({
        success: true,
        message: 'Logged out successfully'
    });
});

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public (with refresh token)
export const refreshToken = asyncHandler(async (req, res) => {
    const { refreshToken: oldRefreshToken } = req.body;

    if (!oldRefreshToken) {
        throw new AuthenticationError('Refresh token is required');
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(oldRefreshToken);

    // Find user with matching refresh token hash
    const hashedRefreshToken = crypto
        .createHash('sha256')
        .update(oldRefreshToken)
        .digest('hex');

    const user = await User.findOne({
        _id: decoded.userId,
        refreshToken: hashedRefreshToken
    }).select('+refreshToken');

    if (!user) {
        throw new AuthenticationError('Invalid refresh token');
    }

    if (!user.isActive) {
        throw new AuthenticationError('User account is deactivated');
    }

    // Generate new tokens
    const { accessToken, refreshToken, hashedRefreshToken: newHashedRefreshToken } = 
        generateTokenPair(user._id, user.role);

    // Update refresh token in database
    user.refreshToken = newHashedRefreshToken;
    await user.save({ validateBeforeSave: false });

    // Set new cookies
    setTokenCookies(res, accessToken, refreshToken);

    // Log token refresh - FIXED THIS LINE
    logger.authLog('token_refreshed', user._id);

    res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
            accessToken,
            refreshToken,
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    });
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    res.status(200).json({
        success: true,
        data: {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isActive: user.isActive,
                createdAt: user.createdAt,
                lastLogin: user.lastLogin
            }
        }
    });
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
        throw new AuthenticationError('Current password is incorrect');
    }

    // Update password
    user.password = newPassword;
    user.passwordChangedAt = Date.now();
    await user.save();

    // Log password change - FIXED THIS LINE
    logger.authLog('password_changed', user._id);

    res.status(200).json({
        success: true,
        message: 'Password changed successfully'
    });
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        // Don't reveal that user doesn't exist
        return res.status(200).json({
            success: true,
            message: 'If an account exists with this email, you will receive a password reset link'
        });
    }

    // Generate reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // TODO: Send email with reset token
    const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    // Log forgot password request - FIXED THIS LINE
    logger.authLog('forgot_password_requested', user._id, { email });

    // In production, you would send an email here
    console.log('Password reset URL:', resetURL); // Remove in production

    res.status(200).json({
        success: true,
        message: 'If an account exists with this email, you will receive a password reset link'
    });
});

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
export const resetPassword = asyncHandler(async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    // Hash token to compare with stored hash
    const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

    // Find user with valid reset token
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
        throw new AuthenticationError('Token is invalid or has expired');
    }

    // Update password and clear reset token
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.passwordChangedAt = Date.now();
    await user.save();

    // Log password reset - FIXED THIS LINE
    logger.authLog('password_reset', user._id);

    res.status(200).json({
        success: true,
        message: 'Password has been reset successfully'
    });
});