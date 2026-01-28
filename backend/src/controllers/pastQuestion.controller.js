import PastQuestion from '../models/pastQuestion.model.js';
import Course from '../models/course.model.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { NotFoundError, AuthorizationError, CloudinaryError } from '../utils/errors.js';
import { deleteFile } from '../config/cloudinary.js';

// @desc    Create a new past question
// @route   POST /api/past-questions
// @access  Private/Admin
export const createPastQuestion = asyncHandler(async (req, res) => {
    const {
        title,
        description,
        course,
        level,
        semester,
        academicYear,
        fileType,
        tags
    } = req.body;

    // Use course document from middleware (if available) or find it
    let courseDoc = req.courseDoc;
    
    if (!courseDoc) {
        courseDoc = await Course.findById(course);
        if (!courseDoc) {
            throw new NotFoundError('Course not found');
        }
    }

    // Check if file was uploaded
    if (!req.file) {
        throw new CloudinaryError('No file uploaded. Please select a file.');
    }

    // Create past question
    const pastQuestion = await PastQuestion.create({
        title,
        description,
        course,
        level: level || courseDoc.level,
        semester: semester || courseDoc.semester,
        academicYear,
        fileType,
        cloudinaryUrl: req.file.path,
        cloudinaryPublicId: req.file.filename,
        thumbnailUrl: req.file.thumbnail_url || null,
        fileSize: req.file.size,
        tags: tags || [],
        uploadedBy: req.user._id
    });

    // Populate related data
    await pastQuestion.populate([
        { path: 'course', select: 'code name level semester' },
        { path: 'uploadedBy', select: 'name email' }
    ]);

    res.status(201).json({
        success: true,
        message: 'Past question uploaded successfully',
        data: pastQuestion
    });
});

// @desc    Get all past questions with filtering
// @route   GET /api/past-questions
// @access  Public
export const getPastQuestions = asyncHandler(async (req, res) => {
    const {
        level,
        semester,
        course,
        academicYear,
        fileType,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        page = 1,
        limit = 20
    } = req.query;

    const filters = {
        level: level ? parseInt(level) : undefined,
        semester,
        course,
        academicYear,
        fileType,
        search,
        sortBy,
        sortOrder,
        page: parseInt(page),
        limit: parseInt(limit)
    };

    const result = await PastQuestion.filterQuestions(filters);

    res.status(200).json({
        success: true,
        count: result.questions.length,
        pagination: result.pagination,
        data: result.questions
    });
});

// @desc    Get single past question by ID
// @route   GET /api/past-questions/:id
// @access  Public
export const getPastQuestionById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const pastQuestion = await PastQuestion.findById(id)
        .populate('course', 'code name level semester')
        .populate('uploadedBy', 'name email');

    if (!pastQuestion) {
        throw new NotFoundError('Past question not found');
    }

    // Check if approved (unless admin or owner)
    if (!pastQuestion.isApproved && 
        (!req.user || 
         (req.user.role !== 'ADMIN' && 
          pastQuestion.uploadedBy._id.toString() !== req.user._id.toString()))) {
        throw new AuthorizationError('This past question is not approved yet');
    }

    res.status(200).json({
        success: true,
        data: pastQuestion
    });
});

// @desc    Update past question
// @route   PUT /api/past-questions/:id
// @access  Private/Admin
export const updatePastQuestion = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    // Find past question
    const pastQuestion = await PastQuestion.findById(id);
    if (!pastQuestion) {
        throw new NotFoundError('Past question not found');
    }

    // Check if user is admin or owner
    if (req.user.role !== 'ADMIN' && 
        pastQuestion.uploadedBy.toString() !== req.user._id.toString()) {
        throw new AuthorizationError('Not authorized to update this past question');
    }

    // Update course if provided
    if (updateData.course) {
        const courseExists = await Course.findById(updateData.course);
        if (!courseExists) {
            throw new NotFoundError('Course not found');
        }
    }

    // Update past question
    const updatedPastQuestion = await PastQuestion.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
    ).populate([
        { path: 'course', select: 'code name level semester' },
        { path: 'uploadedBy', select: 'name email' }
    ]);

    res.status(200).json({
        success: true,
        message: 'Past question updated successfully',
        data: updatedPastQuestion
    });
});

// @desc    Delete past question
// @route   DELETE /api/past-questions/:id
// @access  Private/Admin
export const deletePastQuestion = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Find past question
    const pastQuestion = await PastQuestion.findById(id);
    if (!pastQuestion) {
        throw new NotFoundError('Past question not found');
    }

    // Check if user is admin or owner
    if (req.user.role !== 'ADMIN' && 
        pastQuestion.uploadedBy.toString() !== req.user._id.toString()) {
        throw new AuthorizationError('Not authorized to delete this past question');
    }

    // Delete from Cloudinary
    try {
        await deleteFile(pastQuestion.cloudinaryPublicId);
    } catch (error) {
        // Continue with database deletion even if Cloudinary fails
        console.error('Cloudinary deletion failed:', error);
    }

    // Delete from database
    await PastQuestion.findByIdAndDelete(id);

    res.status(200).json({
        success: true,
        message: 'Past question deleted successfully'
    });
});

// @desc    Increment view count
// @route   POST /api/past-questions/:id/view
// @access  Public
export const incrementViews = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const pastQuestion = await PastQuestion.incrementViews(id);
    
    if (!pastQuestion) {
        throw new NotFoundError('Past question not found');
    }

    res.status(200).json({
        success: true,
        message: 'View count incremented',
        data: {
            views: pastQuestion.views
        }
    });
});

// @desc    Increment download count
// @route   POST /api/past-questions/:id/download
// @access  Public
export const incrementDownloads = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const pastQuestion = await PastQuestion.incrementDownloads(id);
    
    if (!pastQuestion) {
        throw new NotFoundError('Past question not found');
    }

    res.status(200).json({
        success: true,
        message: 'Download count incremented',
        data: {
            downloads: pastQuestion.downloads,
            fileUrl: pastQuestion.cloudinaryUrl,
            fileType: pastQuestion.fileType,
            fileSize: pastQuestion.fileSize
        }
    });
});

// @desc    Get distinct academic years
// @route   GET /api/past-questions/academic-years
// @access  Public
export const getAcademicYears = asyncHandler(async (req, res) => {
    const academicYears = await PastQuestion.getAcademicYears();

    res.status(200).json({
        success: true,
        count: academicYears.length,
        data: academicYears
    });
});

// @desc    Get statistics
// @route   GET /api/past-questions/stats
// @access  Private/Admin
export const getStatistics = asyncHandler(async (req, res) => {
    const stats = await PastQuestion.getStatistics();

    // Get recent uploads
    const recentUploads = await PastQuestion.find({ isApproved: true })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('title course views downloads createdAt')
        .populate('course', 'code name');

    // Get top viewed
    const topViewed = await PastQuestion.find({ isApproved: true })
        .sort({ views: -1 })
        .limit(10)
        .select('title course views downloads')
        .populate('course', 'code name');

    // Get top downloaded
    const topDownloaded = await PastQuestion.find({ isApproved: true })
        .sort({ downloads: -1 })
        .limit(10)
        .select('title course views downloads')
        .populate('course', 'code name');

    // Group by file type
    const byFileType = await PastQuestion.aggregate([
        { $match: { isApproved: true } },
        {
            $group: {
                _id: '$fileType',
                count: { $sum: 1 },
                totalViews: { $sum: '$views' },
                totalDownloads: { $sum: '$downloads' }
            }
        },
        { $sort: { count: -1 } }
    ]);

    // Group by level
    const byLevel = await PastQuestion.aggregate([
        { $match: { isApproved: true } },
        {
            $group: {
                _id: '$level',
                count: { $sum: 1 },
                totalViews: { $sum: '$views' },
                totalDownloads: { $sum: '$downloads' }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    const statistics = {
        overview: stats,
        recentUploads,
        topViewed,
        topDownloaded,
        byFileType: byFileType.map(item => ({
            fileType: item._id,
            count: item.count,
            totalViews: item.totalViews,
            totalDownloads: item.totalDownloads
        })),
        byLevel: byLevel.map(item => ({
            level: item._id,
            count: item.count,
            totalViews: item.totalViews,
            totalDownloads: item.totalDownloads
        })),
        generatedAt: new Date().toISOString()
    };

    res.status(200).json({
        success: true,
        data: statistics
    });
});

// @desc    Search past questions
// @route   GET /api/past-questions/search
// @access  Public
export const searchPastQuestions = asyncHandler(async (req, res) => {
    const { q, level, semester, course } = req.query;

    if (!q || q.trim().length < 2) {
        return res.status(200).json({
            success: true,
            count: 0,
            data: []
        });
    }

    const query = {
        $text: { $search: q },
        isApproved: true
    };

    if (level) query.level = parseInt(level);
    if (semester && semester !== 'All') query.semester = semester;
    if (course) query.course = course;

    const pastQuestions = await PastQuestion.find(
        query,
        { score: { $meta: "textScore" } }
    )
    .populate('course', 'code name level semester')
    .populate('uploadedBy', 'name email')
    .sort({ score: { $meta: "textScore" } })
    .limit(50);

    res.status(200).json({
        success: true,
        count: pastQuestions.length,
        query: q,
        data: pastQuestions
    });
});

// @desc    Get past questions by course
// @route   GET /api/courses/:courseId/past-questions
// @access  Public
export const getPastQuestionsByCourse = asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    const { academicYear, page = 1, limit = 20 } = req.query;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
        throw new NotFoundError('Course not found');
    }

    const query = {
        course: courseId,
        isApproved: true
    };

    if (academicYear) {
        query.academicYear = academicYear;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const pastQuestions = await PastQuestion.find(query)
        .populate('uploadedBy', 'name email')
        .sort({ academicYear: -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await PastQuestion.countDocuments(query);

    // Get distinct academic years for this course
    const academicYears = await PastQuestion.distinct('academicYear', {
        course: courseId,
        isApproved: true
    }).sort().reverse();

    res.status(200).json({
        success: true,
        course: {
            id: course._id,
            name: course.name,
            code: course.code,
            level: course.level,
            semester: course.semester
        },
        count: pastQuestions.length,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit)),
            hasNext: parseInt(page) * parseInt(limit) < total,
            hasPrev: parseInt(page) > 1
        },
        academicYears,
        data: pastQuestions
    });
});