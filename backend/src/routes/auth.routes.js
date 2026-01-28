import express from 'express';
import { 
    register, 
    login, 
    logout, 
    refreshToken, 
    getMe, 
    changePassword,
    forgotPassword,
    resetPassword 
} from '../controllers/auth.controller.js';
import { authenticate, authenticateRefreshToken } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { authValidation } from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.post('/register', validate(authValidation.register), register);
router.post('/login', validate(authValidation.login), login);
router.post('/refresh', authenticateRefreshToken, refreshToken);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

// Protected routes
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);
router.put('/change-password', authenticate, changePassword);

export default router;