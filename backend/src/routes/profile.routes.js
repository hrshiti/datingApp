import express from 'express';
import {
  createOrUpdateProfile,
  getMyProfile,
  getProfileById,
  updateOnboardingStep,
  completeOnboarding,
  saveBasicInfo,
  checkProfileCompletion
} from '../controllers/profile.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// All profile routes require authentication
router.use(protect);

router.post('/', createOrUpdateProfile);
router.post('/basic-info', saveBasicInfo);
router.get('/me', getMyProfile);
router.get('/check-completion', checkProfileCompletion);
router.get('/:id', getProfileById);
router.put('/onboarding/:step', updateOnboardingStep);
router.post('/complete-onboarding', completeOnboarding);

export default router;

