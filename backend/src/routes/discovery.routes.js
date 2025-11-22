import express from 'express';
import {
  getDiscoveryFeed,
  likeProfile,
  passProfile,
  getMatches
} from '../controllers/discovery.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// All discovery routes require authentication
router.use(protect);

router.get('/', getDiscoveryFeed);
router.post('/like', likeProfile);
router.post('/pass', passProfile);
router.get('/matches', getMatches);

export default router;

