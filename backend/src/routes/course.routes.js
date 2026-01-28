import express from 'express';
import {
    getAllCourses,
    getCoursesByLevelAndSemester,
    getCourseAcademicYears,
    getCourseStatistics,
    getAllLevels,
    getSemestersByLevel,
    searchCourses
} from '../controllers/course.controller.js';
import { optionalAuthenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { commonValidations } from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.get('/', getAllCourses);
router.get('/levels', getAllLevels);
router.get('/levels/:level/semesters', getSemestersByLevel);
router.get('/search', searchCourses);

// Course-specific routes
router.get('/:id/academic-years', 
    validate([commonValidations.objectId('id')]), 
    getCourseAcademicYears
);

router.get('/:id/stats', 
    validate([commonValidations.objectId('id')]), 
    getCourseStatistics
);

// Level and semester routes
router.get('/:level/:semester', getCoursesByLevelAndSemester);

export default router;