import Course from '../models/course.model.js';
import PastQuestion from '../models/pastQuestion.model.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { NotFoundError } from '../utils/errors.js';
import logger from '../utils/logger.js';

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
export const getAllCourses = asyncHandler(async (req, res) => {
    const courses = await Course.find({ isActive: true })
        .sort({ level: 1, semester: 1, name: 1 })
        .populate('createdBy', 'name email');

    // Get statistics for each course
    const coursesWithStats = await Promise.all(
        courses.map(async (course) => {
            const stats = await PastQuestion.aggregate([
                { $match: { course: course._id, isApproved: true } },
                {
                    $group: {
                        _id: null,
                        totalQuestions: { $sum: 1 },
                        totalViews: { $sum: '$views' },
                        totalDownloads: { $sum: '$downloads' }
                    }
                }
            ]);

            return {
                ...course.toObject(),
                stats: stats[0] || {
                    totalQuestions: 0,
                    totalViews: 0,
                    totalDownloads: 0
                }
            };
        })
    );

    logger.dbLog('courses_fetched', 'Course', { count: courses.length });

    res.status(200).json({
        success: true,
        count: courses.length,
        data: coursesWithStats
    });
});

// @desc    Get courses by level and semester
// @route   GET /api/courses/:level/:semester
// @access  Public
export const getCoursesByLevelAndSemester = asyncHandler(async (req, res) => {
    const { level, semester } = req.params;

    // Validate level and semester
    const validLevels = [100, 200, 300, 400];
    const validSemesters = ['1st', '2nd'];

    if (!validLevels.includes(parseInt(level))) {
        throw new NotFoundError(`Level ${level} not found. Valid levels: ${validLevels.join(', ')}`);
    }

    if (!validSemesters.includes(semester)) {
        throw new NotFoundError(`Semester ${semester} not found. Valid semesters: ${validSemesters.join(', ')}`);
    }

    // Get courses with population - FIXED: Now we can chain populate
    const courses = await Course.findByLevelAndSemester(parseInt(level), semester)
        .populate('createdBy', 'name email');

    // Get course statistics
    const coursesWithStats = await Promise.all(
        courses.map(async (course) => {
            const pastQuestions = await PastQuestion.find({
                course: course._id,
                isApproved: true
            }).select('views downloads');

            const stats = {
                totalQuestions: pastQuestions.length,
                totalViews: pastQuestions.reduce((sum, pq) => sum + pq.views, 0),
                totalDownloads: pastQuestions.reduce((sum, pq) => sum + pq.downloads, 0)
            };

            return {
                ...course.toObject(),
                stats
            };
        })
    );

    logger.dbLog('courses_by_level_semester_fetched', 'Course', { level, semester, count: courses.length });

    res.status(200).json({
        success: true,
        level,
        semester,
        count: courses.length,
        data: coursesWithStats
    });
});

// @desc    Get distinct academic years for a course
// @route   GET /api/courses/:id/academic-years
// @access  Public
export const getCourseAcademicYears = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const course = await Course.findById(id);
    if (!course) {
        throw new NotFoundError('Course not found');
    }

    const academicYears = await PastQuestion.distinct('academicYear', {
        course: id,
        isApproved: true
    }).sort().reverse();

    logger.dbLog('course_academic_years_fetched', 'Course', { courseId: id, count: academicYears.length });

    res.status(200).json({
        success: true,
        course: {
            id: course._id,
            name: course.name,
            code: course.code
        },
        count: academicYears.length,
        data: academicYears
    });
});

// @desc    Get course statistics
// @route   GET /api/courses/:id/stats
// @access  Public
export const getCourseStatistics = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const course = await Course.findById(id).populate('createdBy', 'name email');
    if (!course) {
        throw new NotFoundError('Course not found');
    }

    // Get past questions for this course
    const pastQuestions = await PastQuestion.find({ course: id, isApproved: true })
        .select('title views downloads academicYear fileType createdAt')
        .sort({ academicYear: -1 });

    // Calculate statistics
    const totalQuestions = pastQuestions.length;
    const totalViews = pastQuestions.reduce((sum, pq) => sum + pq.views, 0);
    const totalDownloads = pastQuestions.reduce((sum, pq) => sum + pq.downloads, 0);

    // Group by academic year
    const byAcademicYear = {};
    pastQuestions.forEach(pq => {
        if (!byAcademicYear[pq.academicYear]) {
            byAcademicYear[pq.academicYear] = {
                count: 0,
                views: 0,
                downloads: 0,
                fileTypes: {}
            };
        }
        byAcademicYear[pq.academicYear].count++;
        byAcademicYear[pq.academicYear].views += pq.views;
        byAcademicYear[pq.academicYear].downloads += pq.downloads;

        // Count file types
        if (!byAcademicYear[pq.academicYear].fileTypes[pq.fileType]) {
            byAcademicYear[pq.academicYear].fileTypes[pq.fileType] = 0;
        }
        byAcademicYear[pq.academicYear].fileTypes[pq.fileType]++;
    });

    // Group by file type
    const byFileType = {};
    pastQuestions.forEach(pq => {
        if (!byFileType[pq.fileType]) {
            byFileType[pq.fileType] = 0;
        }
        byFileType[pq.fileType]++;
    });

    // Get most popular questions
    const mostPopular = pastQuestions
        .sort((a, b) => (b.views + b.downloads) - (a.views + a.downloads))
        .slice(0, 5)
        .map(pq => ({
            id: pq._id,
            title: pq.title,
            views: pq.views,
            downloads: pq.downloads,
            popularity: pq.views + pq.downloads
        }));

    const statistics = {
        course: {
            id: course._id,
            name: course.name,
            code: course.code,
            level: course.level,
            semester: course.semester
        },
        overview: {
            totalQuestions,
            totalViews,
            totalDownloads,
            averageViews: totalQuestions > 0 ? Math.round(totalViews / totalQuestions) : 0,
            averageDownloads: totalQuestions > 0 ? Math.round(totalDownloads / totalQuestions) : 0
        },
        byAcademicYear: Object.entries(byAcademicYear).map(([year, data]) => ({
            academicYear: year,
            ...data
        })),
        byFileType,
        mostPopular,
        updatedAt: new Date().toISOString()
    };

    logger.dbLog('course_statistics_fetched', 'Course', { courseId: id });

    res.status(200).json({
        success: true,
        data: statistics
    });
});

// @desc    Get all levels (aggregation)
// @route   GET /api/courses/levels
// @access  Public
export const getAllLevels = asyncHandler(async (req, res) => {
    const levels = await Course.getAllLevels();

    // Get statistics for each level
    const levelsWithStats = await Promise.all(
        levels.map(async (level) => {
            // Count courses in this level
            const courseCount = await Course.countDocuments({ level, isActive: true });

            // Count past questions in this level
            const pastQuestionStats = await PastQuestion.aggregate([
                {
                    $match: {
                        level,
                        isApproved: true
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalQuestions: { $sum: 1 },
                        totalViews: { $sum: '$views' },
                        totalDownloads: { $sum: '$downloads' }
                    }
                }
            ]);

            return {
                level,
                courseCount,
                stats: pastQuestionStats[0] || {
                    totalQuestions: 0,
                    totalViews: 0,
                    totalDownloads: 0
                }
            };
        })
    );

    logger.dbLog('levels_fetched', 'Course', { count: levels.length });

    res.status(200).json({
        success: true,
        count: levels.length,
        data: levelsWithStats
    });
});

// @desc    Get semesters for a specific level
// @route   GET /api/courses/levels/:level/semesters
// @access  Public
export const getSemestersByLevel = asyncHandler(async (req, res) => {
    const { level } = req.params;

    const validLevels = [100, 200, 300, 400];
    if (!validLevels.includes(parseInt(level))) {
        throw new NotFoundError(`Level ${level} not found. Valid levels: ${validLevels.join(', ')}`);
    }

    const semesters = await Course.getSemestersByLevel(parseInt(level));

    // Get statistics for each semester
    const semestersWithStats = await Promise.all(
        semesters.map(async (semester) => {
            // Count courses in this semester
            const courseCount = await Course.countDocuments({
                level: parseInt(level),
                semester,
                isActive: true
            });

            // Count past questions in this semester
            const pastQuestionStats = await PastQuestion.aggregate([
                {
                    $match: {
                        level: parseInt(level),
                        semester,
                        isApproved: true
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalQuestions: { $sum: 1 },
                        totalViews: { $sum: '$views' },
                        totalDownloads: { $sum: '$downloads' }
                    }
                }
            ]);

            return {
                level: parseInt(level),
                semester,
                courseCount,
                stats: pastQuestionStats[0] || {
                    totalQuestions: 0,
                    totalViews: 0,
                    totalDownloads: 0
                }
            };
        })
    );

    logger.dbLog('semesters_by_level_fetched', 'Course', { level, count: semesters.length });

    res.status(200).json({
        success: true,
        level,
        count: semesters.length,
        data: semestersWithStats
    });
});

// @desc    Search courses
// @route   GET /api/courses/search
// @access  Public
export const searchCourses = asyncHandler(async (req, res) => {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
        return res.status(200).json({
            success: true,
            count: 0,
            data: []
        });
    }

    const courses = await Course.find(
        {
            $text: { $search: q },
            isActive: true
        },
        { score: { $meta: "textScore" } }
    )
        .sort({ score: { $meta: "textScore" } })
        .limit(20)
        .populate('createdBy', 'name email');

    logger.dbLog('courses_searched', 'Course', { query: q, count: courses.length });

    res.status(200).json({
        success: true,
        count: courses.length,
        query: q,
        data: courses
    });
});