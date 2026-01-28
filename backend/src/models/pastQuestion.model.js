import mongoose from 'mongoose';

const pastQuestionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: [true, 'Course is required']
    },
    level: {
        type: Number,
        required: [true, 'Level is required'],
        enum: [100, 200, 300, 400],
        validate: {
            validator: Number.isInteger,
            message: 'Level must be an integer'
        }
    },
    semester: {
        type: String,
        required: [true, 'Semester is required'],
        enum: ['1st', '2nd']
    },
    academicYear: {
        type: String,
        required: [true, 'Academic year is required'],
        match: [/^\d{4}\/\d{4}$/, 'Academic year must be in format YYYY/YYYY']
    },
    fileType: {
        type: String,
        required: [true, 'File type is required'],
        enum: ['image', 'pdf', 'doc'],
        lowercase: true
    },
    fileSize: {
        type: Number,
        min: 1,
        max: 10 * 1024 * 1024 // 10MB
    },
    cloudinaryUrl: {
        type: String,
        required: [true, 'Cloudinary URL is required'],
        validate: {
            validator: function(v) {
                return /^https:\/\/res\.cloudinary\.com\/.+\/.+/.test(v);
            },
            message: 'Invalid Cloudinary URL'
        }
    },
    cloudinaryPublicId: {
        type: String,
        required: [true, 'Cloudinary Public ID is required']
    },
    thumbnailUrl: {
        type: String
    },
    views: {
        type: Number,
        default: 0,
        min: 0
    },
    downloads: {
        type: Number,
        default: 0,
        min: 0
    },
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isApproved: {
        type: Boolean,
        default: true
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvedAt: Date,
    metadata: {
        pages: Number,
        dimensions: {
            width: Number,
            height: Number
        },
        duration: Number // For video files if added later
    }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: function(doc, ret) {
            delete ret.__v;
            delete ret.cloudinaryPublicId;
            return ret;
        }
    }
});

// Compound indexes for efficient queries
pastQuestionSchema.index({ course: 1, academicYear: 1 });
pastQuestionSchema.index({ level: 1, semester: 1 });
pastQuestionSchema.index({ academicYear: -1 });
pastQuestionSchema.index({ views: -1 });
pastQuestionSchema.index({ downloads: -1 });
pastQuestionSchema.index({ uploadedBy: 1 });
pastQuestionSchema.index({ tags: 1 });
pastQuestionSchema.index({ createdAt: -1 });
pastQuestionSchema.index({ title: 'text', description: 'text' });

// Virtual for popularity score
pastQuestionSchema.virtual('popularityScore').get(function() {
    return (this.views * 0.3) + (this.downloads * 0.7);
});

// Virtual for file info
pastQuestionSchema.virtual('fileInfo').get(function() {
    return {
        type: this.fileType,
        size: this.fileSize,
        url: this.cloudinaryUrl,
        thumbnail: this.thumbnailUrl
    };
});

// Static method to increment views
pastQuestionSchema.statics.incrementViews = async function(id) {
    return await this.findByIdAndUpdate(
        id,
        { $inc: { views: 1 } },
        { new: true, runValidators: false }
    );
};

// Static method to increment downloads
pastQuestionSchema.statics.incrementDownloads = async function(id) {
    return await this.findByIdAndUpdate(
        id,
        { $inc: { downloads: 1 } },
        { new: true, runValidators: false }
    );
};

// Static method to get distinct academic years
pastQuestionSchema.statics.getAcademicYears = async function() {
    const years = await this.distinct('academicYear');
    return years.sort().reverse(); // Sort array directly
};

// Static method to get statistics
pastQuestionSchema.statics.getStatistics = async function() {
    try {
        const stats = await this.aggregate([
            {
                $group: {
                    _id: null,
                    totalQuestions: { $sum: 1 },
                    totalViews: { $sum: '$views' },
                    totalDownloads: { $sum: '$downloads' },
                    averageViews: { $avg: '$views' },
                    averageDownloads: { $avg: '$downloads' }
                }
            }
        ]);
        
        return stats[0] || {
            totalQuestions: 0,
            totalViews: 0,
            totalDownloads: 0,
            averageViews: 0,
            averageDownloads: 0
        };
    } catch (error) {
        console.error('Statistics aggregation failed:', error);
        return {
            totalQuestions: 0,
            totalViews: 0,
            totalDownloads: 0,
            averageViews: 0,
            averageDownloads: 0
        };
    }
};

// Static method for advanced filtering
pastQuestionSchema.statics.filterQuestions = async function(filters, options = {}) {
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
    } = filters;
    
    const query = { isApproved: true };
    
    // Apply filters
    if (level) query.level = level;
    if (semester && semester !== 'All') query.semester = semester;
    if (course) query.course = course;
    if (academicYear) query.academicYear = academicYear;
    if (fileType) query.fileType = fileType;
    
    // Apply search
    if (search) {
        query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { tags: { $regex: search, $options: 'i' } }
        ];
    }
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Calculate skip
    const skip = (page - 1) * limit;
    
    // Execute query with population
    const questions = await this.find(query)
        .populate('course', 'code name level semester')
        .populate('uploadedBy', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(limit);
    
    // Get total count for pagination
    const total = await this.countDocuments(query);
    
    return {
        questions,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit),
            hasNext: page * limit < total,
            hasPrev: page > 1
        }
    };
};

// Pre-save middleware to ensure consistency
pastQuestionSchema.pre('save', async function(next) {
    // Populate level and semester from course if not provided
    if (this.course && (!this.level || !this.semester)) {
        const Course = mongoose.model('Course');
        const course = await Course.findById(this.course);
        if (course) {
            this.level = this.level || course.level;
            this.semester = this.semester || course.semester;
        }
    }
    
    // Generate tags from title if not provided
    if (!this.tags || this.tags.length === 0) {
        const words = this.title.toLowerCase().split(/\s+/);
        this.tags = [...new Set(words.filter(word => word.length > 2))].slice(0, 10);
    }
    
    next();
});

const PastQuestion = mongoose.model('PastQuestion', pastQuestionSchema);

export default PastQuestion;