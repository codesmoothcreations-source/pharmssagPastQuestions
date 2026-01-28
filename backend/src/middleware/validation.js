import { validationResult, body, param, query } from 'express-validator';
import { ValidationError } from '../utils/errors.js';
import mongoose from 'mongoose';

// Validation result handler
export const validate = (validations) => {
    return async (req, res, next) => {
        // Run all validations
        await Promise.all(validations.map(validation => validation.run(req)));
        
        const errors = validationResult(req);
        
        if (!errors.isEmpty()) {
            const formattedErrors = errors.array().map(err => ({
                field: err.path,
                message: err.msg,
                value: err.value
            }));
            
            throw new ValidationError(formattedErrors);
        }
        
        next();
    };
};

// ObjectId validation
export const isValidObjectId = (value) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid ID format');
    }
    return true;
};

// Common validation rules
export const commonValidations = {
    email: body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(),
    
    password: body('password')
        .trim()
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
        .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
        .matches(/\d/).withMessage('Password must contain at least one number'),
    
    name: body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    
    objectId: (field) => param(field)
        .custom(isValidObjectId).withMessage('Invalid ID format'),
    
    academicYear: body('academicYear')
        .trim()
        .notEmpty().withMessage('Academic year is required')
        .matches(/^\d{4}\/\d{4}$/).withMessage('Academic year must be in format YYYY/YYYY'),
    
    level: body('level')
        .notEmpty().withMessage('Level is required')
        .isInt({ min: 100, max: 400 }).withMessage('Level must be 100, 200, 300, or 400'),
    
    semester: body('semester')
        .trim()
        .notEmpty().withMessage('Semester is required')
        .isIn(['1st', '2nd']).withMessage('Semester must be either "1st" or "2nd"'),
    
    fileType: body('fileType')
        .trim()
        .notEmpty().withMessage('File type is required')
        .isIn(['image', 'pdf', 'doc']).withMessage('File type must be image, pdf, or doc'),
    
    page: query('page')
        .optional()
        .isInt({ min: 1 }).withMessage('Page must be a positive integer')
        .toInt(),
    
    limit: query('limit')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
        .toInt(),
    
    search: query('q')
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage('Search query too long'),
    
    sortBy: query('sortBy')
        .optional()
        .trim()
        .isIn(['createdAt', 'updatedAt', 'title', 'views', 'downloads', 'academicYear'])
        .withMessage('Invalid sort field'),
    
    sortOrder: query('sortOrder')
        .optional()
        .trim()
        .isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc')
};

// Auth validation rules
export const authValidation = {
    register: [
        commonValidations.name,
        commonValidations.email,
        commonValidations.password,
        body('confirmPassword')
            .trim()
            .notEmpty().withMessage('Confirm password is required')
            .custom((value, { req }) => value === req.body.password)
            .withMessage('Passwords do not match')
    ],
    
    login: [
        commonValidations.email,
        body('password')
            .trim()
            .notEmpty().withMessage('Password is required')
    ]
};

// Past question validation rules
export const pastQuestionValidation = {
    create: [
        body('title')
            .trim()
            .notEmpty().withMessage('Title is required')
            .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),
        
        body('description')
            .trim()
            .optional()
            .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
        
        body('course')
            .notEmpty().withMessage('Course is required')
            .custom(isValidObjectId).withMessage('Invalid course ID'),
        
        commonValidations.level,
        commonValidations.semester,
        commonValidations.academicYear,
        commonValidations.fileType,
        
        body('tags')
            .optional()
            .isArray().withMessage('Tags must be an array')
            .custom((tags) => tags.length <= 10).withMessage('Maximum 10 tags allowed'),
        
        body('tags.*')
            .trim()
            .isLength({ min: 2, max: 50 }).withMessage('Each tag must be between 2 and 50 characters')
    ],
    
    update: [
        commonValidations.objectId('id'),
        body('title')
            .trim()
            .optional()
            .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),
        
        body('description')
            .trim()
            .optional()
            .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
        
        body('academicYear')
            .trim()
            .optional()
            .matches(/^\d{4}\/\d{4}$/).withMessage('Academic year must be in format YYYY/YYYY'),
        
        body('tags')
            .optional()
            .isArray().withMessage('Tags must be an array')
            .custom((tags) => tags.length <= 10).withMessage('Maximum 10 tags allowed')
    ],
    
    filter: [
        query('level')
            .optional()
            .isIn(['100', '200', '300', '400'])
            .withMessage('Level must be 100, 200, 300, or 400')
            .toInt(),
        
        query('semester')
            .optional()
            .isIn(['All', '1st', '2nd'])
            .withMessage('Semester must be All, 1st, or 2nd'),
        
        query('course')
            .optional()
            .custom(isValidObjectId).withMessage('Invalid course ID'),
        
        query('academicYear')
            .optional()
            .matches(/^\d{4}\/\d{4}$/).withMessage('Academic year must be in format YYYY/YYYY'),
        
        query('fileType')
            .optional()
            .isIn(['image', 'pdf', 'doc'])
            .withMessage('File type must be image, pdf, or doc'),
        
        commonValidations.page,
        commonValidations.limit,
        commonValidations.search,
        commonValidations.sortBy,
        commonValidations.sortOrder
    ]
};

// Video search validation
export const videoValidation = {
    search: [
        commonValidations.search,
        commonValidations.page,
        query('maxResults')
            .optional()
            .isInt({ min: 1, max: 50 }).withMessage('Max results must be between 1 and 50')
            .toInt()
    ]
};