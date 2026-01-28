import express from 'express';
import {
  createPastQuestion,
  getPastQuestions,
  getPastQuestionById,
  updatePastQuestion,
  deletePastQuestion,
  incrementViews,
  incrementDownloads,
  getAcademicYears,
  getStatistics,
  searchPastQuestions,
  getPastQuestionsByCourse
} from '../controllers/pastQuestion.controller.js';

import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { pastQuestionValidation, commonValidations } from '../middleware/validation.js';

import { upload, uploadToCloudinary } from '../config/cloudinary.js';
import Course from '../models/course.model.js';
import PastQuestion from '../models/pastQuestion.model.js';

const router = express.Router();

/* ---------------------------------------------------
   HELPERS
--------------------------------------------------- */
const getFileType = (mimetype) => {
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype === 'application/pdf') return 'pdf';
  return 'doc';
};

/* ---------------------------------------------------
   PUBLIC ROUTES
--------------------------------------------------- */
router.get('/', getPastQuestions);

router.get('/academic-years', getAcademicYears);

router.get('/search', searchPastQuestions);

// Fixed prefix routes must come before "/:id"
router.get(
  '/course/:courseId',
  validate([commonValidations.objectId('courseId')]),
  getPastQuestionsByCourse
);

router.get(
  '/:id',
  validate([commonValidations.objectId('id')]),
  getPastQuestionById
);

router.post(
  '/:id/view',
  validate([commonValidations.objectId('id')]),
  incrementViews
);

router.post(
  '/:id/download',
  validate([commonValidations.objectId('id')]),
  incrementDownloads
);

/* ---------------------------------------------------
   AUTHENTICATED ROUTES
--------------------------------------------------- */
router.use(authenticate);

/* ---------------------------------------------------
   CREATE PAST QUESTION (ADMIN)
   (Upload + Cloudinary + MongoDB save)
--------------------------------------------------- */
router.post(
  '/',
  authorize('ADMIN'),
  upload.single('file'),

  async (req, res) => {
    try {
      console.log('🧠 Multer finished');
      console.log('📄 File:', req.file?.originalname);
      console.log('📦 Body:', req.body);

      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const {
        title,
        description,
        course,
        level,
        semester,
        academicYear
      } = req.body;

      // 🔎 Validate course
      const courseDoc =
        (await Course.findById(course).catch(() => null)) ||
        (await Course.findOne({ code: course }));

      if (!courseDoc) {
        return res.status(404).json({ message: `Course not found: ${course}` });
      }

      // ☁️ Upload to Cloudinary
      const cloudinaryResult = await uploadToCloudinary(
        req.file.buffer,
        'past-questions',
        req.file.mimetype,
        req.file.originalname
      );

      console.log('☁️ Cloudinary uploaded:', cloudinaryResult.secure_url);

      // 💾 Save to database (MATCHES YOUR MODEL)
      const pastQuestion = await PastQuestion.create({
        title,
        description,
        course: courseDoc._id,
        level: Number(level),
        semester,
        academicYear,
        fileType: getFileType(req.file.mimetype),
        fileSize: req.file.size,
        cloudinaryUrl: cloudinaryResult.secure_url,
        cloudinaryPublicId: cloudinaryResult.public_id,
        uploadedBy: req.user._id,
        approvedBy: req.user._id,
        approvedAt: new Date()
      });

      console.log('✅ Saved to DB:', pastQuestion._id);

      return res.status(201).json({
        success: true,
        data: pastQuestion
      });

    } catch (error) {
      console.error('🔥 Create past question failed:', error);
      return res.status(500).json({ message: error.message });
    }
  }
);

/* ---------------------------------------------------
   ADMIN ROUTES
--------------------------------------------------- */
router.get('/stats', authorize('ADMIN'), getStatistics);

router.put(
  '/:id',
  authorize('ADMIN'),
  validate([
    commonValidations.objectId('id'),
    ...pastQuestionValidation.update
  ]),
  updatePastQuestion
);

router.delete(
  '/:id',
  authorize('ADMIN'),
  validate([commonValidations.objectId('id')]),
  deletePastQuestion
);

export default router;
