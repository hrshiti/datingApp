import express from 'express';
import {
  uploadPhoto,
  uploadPhotos,
  deletePhoto,
  setMainPhoto,
  uploadVerificationPhoto
} from '../controllers/upload.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { uploadSingle, uploadMultiple } from '../middleware/upload.middleware.js';

const router = express.Router();

// All upload routes require authentication
router.use(protect);

router.post('/photo', uploadSingle, uploadPhoto);
router.post('/photos', uploadMultiple, uploadPhotos);
router.delete('/photo/:photoId', deletePhoto);
router.put('/photo/:photoId/set-main', setMainPhoto);
router.post('/verification', uploadSingle, uploadVerificationPhoto);

export default router;

