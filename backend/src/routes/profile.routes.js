import express from 'express';
import {
  createOrUpdateProfile,
  getMyProfile,
  getProfileById,
  updateOnboardingStep,
  completeOnboarding
} from '../controllers/profile.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// All profile routes require authentication
router.use(protect);

router.post('/', createOrUpdateProfile);
router.get('/me', getMyProfile);
router.get('/:id', getProfileById);
router.put('/onboarding/:step', updateOnboardingStep);
router.post('/complete-onboarding', completeOnboarding);

export default router;

