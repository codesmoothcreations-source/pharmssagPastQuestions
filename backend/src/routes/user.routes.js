import express from 'express';
import {
    getUserCount,
    getAllUsers,
    getUserById,
    updateUser,
    deactivateUser,
    activateUser,
    getUserActivity
} from '../controllers/user.controller.js';
import { authenticate, authorize, optionalAuthenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { commonValidations } from '../middleware/validation.js';

const router = express.Router();

// Public route with optional admin access for detailed stats
router.get('/count', optionalAuthenticate, getUserCount);
router.get('/', authenticate, authorize('ADMIN'), getAllUsers);
router.put('/:id/deactivate', authenticate, authorize('ADMIN'), deactivateUser);
router.put('/:id/activate', authenticate, authorize('ADMIN'), activateUser);

// User can access their own data, admin can access all
router.get('/:id', 
    authenticate, 
    validate([commonValidations.objectId('id')]), 
    getUserById
);

router.put('/:id', 
    authenticate, 
    validate([commonValidations.objectId('id')]), 
    updateUser
);

router.get('/:id/activity', 
    authenticate, 
    validate([commonValidations.objectId('id')]), 
    getUserActivity
);

export default router;