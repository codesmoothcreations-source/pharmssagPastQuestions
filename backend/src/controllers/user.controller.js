import User from '../models/user.model.js';
import PastQuestion from '../models/pastQuestion.model.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { NotFoundError, AuthorizationError } from '../utils/errors.js';
import logger from '../utils/logger.js';

// @desc    Get user count (Public with basic stats, Admin gets full stats)
// @route   GET /api/users/count
// @access  Public (basic stats) / Private/Admin (full stats)
export const getUserCount = asyncHandler(async (req, res) => {
    // Total users
    const totalUsers = await User.countDocuments();
    
    // Active users
    const activeUsers = await User.countDocuments({ isActive: true });
    
    // Check if user is authenticated and is admin
    const isAdmin = req.user && req.user.role === 'ADMIN';
    
    // Basic public stats
    const stats = {
        total: totalUsers,
        active: activeUsers,
        updatedAt: new Date().toISOString()
    };
    
    // If admin, include detailed stats
    if (isAdmin) {
        // Users by role
        const usersByRole = await User.aggregate([
            {
                $group: {
                    _id: '$role',
                    count: { $sum: 1 }
                }
            }
        ]);
        
        // Users by registration date (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const recentRegistrations = await User.countDocuments({
            createdAt: { $gte: thirtyDaysAgo }
        });
        
        // Users with activity (logged in last 30 days)
        const activeRecently = await User.countDocuments({
            lastLogin: { $gte: thirtyDaysAgo }
        });

        stats.inactive = totalUsers - activeUsers;
        stats.byRole = usersByRole.reduce((acc, curr) => {
            acc[curr._id] = curr.count;
            return acc;
        }, {});
        stats.recentRegistrations = recentRegistrations;
        stats.activeRecently = activeRecently;
        stats.registrationRate = totalUsers > 0 ? `${((recentRegistrations / totalUsers) * 100).toFixed(1)}%` : '0%';
        stats.activityRate = activeUsers > 0 ? `${((activeRecently / activeUsers) * 100).toFixed(1)}%` : '0%';
    }

    logger.dbLog('user_stats_fetched', 'User', { ...stats, isAdmin });

    res.status(200).json({
        success: true,
        data: stats
    });
});

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
export const getAllUsers = asyncHandler(async (req, res) => {
    const { 
        page = 1, 
        limit = 20, 
        role, 
        isActive, 
        search 
    } = req.query;

    const query = {};

    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
        ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(query)
        .select('-refreshToken -password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    // Get additional stats for each user
    const usersWithStats = await Promise.all(
        users.map(async (user) => {
            const uploads = await PastQuestion.countDocuments({ uploadedBy: user._id });
            const totalViews = await PastQuestion.aggregate([
                { $match: { uploadedBy: user._id } },
                { $group: { _id: null, total: { $sum: '$views' } } }
            ]);
            
            const totalDownloads = await PastQuestion.aggregate([
                { $match: { uploadedBy: user._id } },
                { $group: { _id: null, total: { $sum: '$downloads' } } }
            ]);

            return {
                ...user.toObject(),
                stats: {
                    uploads,
                    totalViews: totalViews[0]?.total || 0,
                    totalDownloads: totalDownloads[0]?.total || 0
                }
            };
        })
    );

    logger.dbLog('users_fetched', 'User', {
        count: users.length,
        total,
        filters: { role, isActive, search }
    });

    res.status(200).json({
        success: true,
        count: users.length,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit))
        },
        data: usersWithStats
    });
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin or Self
export const getUserById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Check if user is requesting their own data or is admin
    if (req.user.role !== 'ADMIN' && req.user._id.toString() !== id) {
        throw new AuthorizationError('Not authorized to access this user');
    }

    const user = await User.findById(id)
        .select('-refreshToken -password -passwordResetToken -passwordResetExpires');

    if (!user) {
        throw new NotFoundError('User not found');
    }

    // Get user contributions
    const contributions = await PastQuestion.aggregate([
        { $match: { uploadedBy: user._id } },
        {
            $group: {
                _id: null,
                totalUploads: { $sum: 1 },
                totalViews: { $sum: '$views' },
                totalDownloads: { $sum: '$downloads' },
                byLevel: { $push: '$level' },
                byFileType: { $push: '$fileType' }
            }
        }
    ]);

    // Get recent uploads
    const recentUploads = await PastQuestion.find({ uploadedBy: user._id })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title course views downloads createdAt')
        .populate('course', 'code name');

    const userData = {
        ...user.toObject(),
        contributions: contributions[0] || {
            totalUploads: 0,
            totalViews: 0,
            totalDownloads: 0,
            byLevel: [],
            byFileType: []
        },
        recentUploads
    };

    logger.dbLog('user_fetched', 'User', { userId: id });

    res.status(200).json({
        success: true,
        data: userData
    });
});

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private/Admin or Self
export const updateUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    // Check if user is updating their own data or is admin
    if (req.user.role !== 'ADMIN' && req.user._id.toString() !== id) {
        throw new AuthorizationError('Not authorized to update this user');
    }

    // Prevent users from changing their own role
    if (req.user.role !== 'ADMIN' && updateData.role) {
        delete updateData.role;
    }

    // Prevent changing email (should be separate endpoint with verification)
    if (updateData.email) {
        delete updateData.email;
    }

    // Prevent changing password (use change password endpoint)
    if (updateData.password) {
        delete updateData.password;
    }

    const user = await User.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
    ).select('-refreshToken -password');

    if (!user) {
        throw new NotFoundError('User not found');
    }

    logger.dbLog('user_updated', 'User', {
        userId: id,
        updates: Object.keys(updateData)
    });

    res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: user
    });
});

// @desc    Deactivate user (Admin only)
// @route   PUT /api/users/:id/deactivate
// @access  Private/Admin
export const deactivateUser = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Prevent deactivating self
    if (req.user._id.toString() === id) {
        throw new AuthorizationError('Cannot deactivate your own account');
    }

    const user = await User.findByIdAndUpdate(
        id,
        { isActive: false },
        { new: true }
    ).select('-refreshToken -password');

    if (!user) {
        throw new NotFoundError('User not found');
    }

    logger.dbLog('user_deactivated', 'User', { userId: id });

    res.status(200).json({
        success: true,
        message: 'User deactivated successfully',
        data: user
    });
});

// @desc    Activate user (Admin only)
// @route   PUT /api/users/:id/activate
// @access  Private/Admin
export const activateUser = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const user = await User.findByIdAndUpdate(
        id,
        { isActive: true },
        { new: true }
    ).select('-refreshToken -password');

    if (!user) {
        throw new NotFoundError('User not found');
    }

    logger.dbLog('user_activated', 'User', { userId: id });

    res.status(200).json({
        success: true,
        message: 'User activated successfully',
        data: user
    });
});

// @desc    Get user activity
// @route   GET /api/users/:id/activity
// @access  Private/Admin or Self
export const getUserActivity = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Check authorization
    if (req.user.role !== 'ADMIN' && req.user._id.toString() !== id) {
        throw new AuthorizationError('Not authorized to access this user activity');
    }

    const user = await User.findById(id);
    if (!user) {
        throw new NotFoundError('User not found');
    }

    // Get uploads with pagination
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const uploads = await PastQuestion.find({ uploadedBy: user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('course', 'code name level semester');

    const totalUploads = await PastQuestion.countDocuments({ uploadedBy: user._id });

    // Get download history (if implemented)
    const downloads = []; // This would come from a separate download history model

    // Get view history (if implemented)
    const views = []; // This would come from a separate view history model

    const activity = {
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            lastLogin: user.lastLogin,
            createdAt: user.createdAt
        },
        uploads: {
            data: uploads,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: totalUploads,
                pages: Math.ceil(totalUploads / parseInt(limit))
            }
        },
        downloads,
        views,
        summary: {
            totalUploads,
            lastUpload: uploads[0]?.createdAt || null,
            activeDays: Math.floor((Date.now() - user.createdAt) / (1000 * 60 * 60 * 24))
        }
    };

    logger.dbLog('user_activity_fetched', 'User', { userId: id });

    res.status(200).json({
        success: true,
        data: activity
    });
});