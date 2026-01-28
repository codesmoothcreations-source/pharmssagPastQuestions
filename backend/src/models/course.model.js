import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
    code: {
        type: String,
        required: [true, 'Course code is required'],
        unique: true,
        uppercase: true,
        trim: true,
        maxlength: [20, 'Course code cannot exceed 20 characters']
    },
    name: {
        type: String,
        required: [true, 'Course name is required'],
        trim: true,
        maxlength: [200, 'Course name cannot exceed 200 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
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
        enum: ['1st', '2nd'],
        default: '1st'
    },
    credits: {
        type: Number,
        min: 1,
        max: 6,
        default: 3
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: function(doc, ret) {
            delete ret.__v;
            return ret;
        }
    }
});

// Compound indexes for efficient queries
courseSchema.index({ level: 1, semester: 1 });
courseSchema.index({ name: 'text', code: 'text' });
courseSchema.index({ isActive: 1, level: 1, semester: 1 });

// Virtual for total past questions
courseSchema.virtual('pastQuestionCount', {
    ref: 'PastQuestion',
    localField: '_id',
    foreignField: 'course',
    count: true
});

// Virtual for total views
courseSchema.virtual('totalViews', {
    ref: 'PastQuestion',
    localField: '_id',
    foreignField: 'course',
    pipeline: [
        { $group: { _id: null, total: { $sum: '$views' } } }
    ]
});

// Virtual for total downloads
courseSchema.virtual('totalDownloads', {
    ref: 'PastQuestion',
    localField: '_id',
    foreignField: 'course',
    pipeline: [
        { $group: { _id: null, total: { $sum: '$downloads' } } }
    ]
});

// Static method to get courses by level and semester
courseSchema.statics.findByLevelAndSemester = function(level, semester) {
    return this.find({ 
        level, 
        semester,
        isActive: true 
    }).sort({ name: 1 });
};

// Static method to get all levels
courseSchema.statics.getAllLevels = async function() {
    return await this.distinct('level', { isActive: true }).sort();
};

// Static method to get all semesters for a level
courseSchema.statics.getSemestersByLevel = async function(level) {
    return await this.distinct('semester', { level, isActive: true }).sort();
};

// Pre-save middleware to generate course code if not provided
courseSchema.pre('save', function(next) {
    if (!this.code && this.name) {
        // Generate code from name (e.g., "Organic Chemistry" -> "OCHEM")
        const words = this.name.split(' ');
        this.code = words.map(word => word[0]).join('').toUpperCase();
        
        // Add level and semester
        this.code += this.level.toString().charAt(0) + this.semester.charAt(0);
    }
    next();
});

const Course = mongoose.model('Course', courseSchema);

export default Course;