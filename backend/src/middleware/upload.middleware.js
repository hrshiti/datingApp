import multer from 'multer';
import path from 'path';

// Configure multer to store files in memory (we'll upload to Cloudinary directly)
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
  // Accept only images
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

// Configure multer
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  }
});

// Single file upload
export const uploadSingle = upload.single('photo');

// Multiple files upload
export const uploadMultiple = upload.array('photos', 6); // Max 6 photos

