import { v2 as cloudinary } from 'cloudinary';
import pkg from 'multer-storage-cloudinary';
import multer from 'multer';
import { config } from 'dotenv';

config();

/**
 * SAFELY resolve CloudinaryStorage constructor
 * (multer-storage-cloudinary is CommonJS)
 */
const CloudinaryStorage =
  pkg.CloudinaryStorage ||
  pkg.default?.CloudinaryStorage ||
  pkg.default ||
  pkg;

/* ---------------------------------------------------
   CLOUDINARY CONFIG
--------------------------------------------------- */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

/* ---------------------------------------------------
   VALIDATE CONFIG
--------------------------------------------------- */
const validateCloudinaryConfig = () => {
  const required = [
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET'
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error('❌ Missing Cloudinary config:', missing);
    throw new Error(`Missing Cloudinary config: ${missing.join(', ')}`);
  }

  console.log('✅ Cloudinary configuration validated');
  return true;
};

/* ---------------------------------------------------
   STORAGE ENGINE
--------------------------------------------------- */
const createStorage = (folder) => {
  return new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
      const isPdf = file.mimetype === 'application/pdf';

      return {
        folder,
        resource_type: 'auto',
        allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
        public_id: `${file.originalname.split('.')[0]}-${Date.now()}`,
        transformation: isPdf ? undefined : [{ quality: 'auto:good' }]
      };
    }
  });
};

/* ---------------------------------------------------
   FILE FILTER
--------------------------------------------------- */
const fileFilter = (req, file, cb) => {
  console.log('🔍 Filtering:', file.originalname, file.mimetype);

  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(
      new Error(`Unsupported file type: ${file.mimetype}`),
      false
    );
  }

  cb(null, true);
};

/* ---------------------------------------------------
   UPLOAD MIDDLEWARE
--------------------------------------------------- */
const createUploadMiddleware = (folder) => {
  validateCloudinaryConfig();

  return multer({
    storage: createStorage(folder),
    fileFilter,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
      files: 1
    }
  });
};

/* ---------------------------------------------------
   DELETE FILE
--------------------------------------------------- */
const deleteFile = async (publicId) => {
  if (!publicId) return { result: 'ok' };

  try {
    return await cloudinary.uploader.destroy(publicId, {
      resource_type: 'auto',
      invalidate: true
    });
  } catch (error) {
    console.error('❌ Cloudinary delete error:', error);
    throw error;
  }
};

/* ---------------------------------------------------
   FOLDER PATH HELPER
--------------------------------------------------- */
const getFolderPath = (level, semester, courseName) => {
  const clean = (value) =>
    String(value || 'unknown')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

  return `past-questions/level-${clean(level)}/semester-${clean(semester)}/${clean(courseName)}`;
};



const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 1
  }
});

const uploadToCloudinary = (buffer, folder, mimetype, originalname) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
        public_id: `${originalname.split('.')[0]}-${Date.now()}`
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    stream.end(buffer);
  });
};

/* ---------------------------------------------------
   EXPORTS (UNCHANGED)
--------------------------------------------------- */
export {
  cloudinary,
  validateCloudinaryConfig,
  createUploadMiddleware,
  deleteFile,
  getFolderPath,
  upload, uploadToCloudinary 
};
