import express from 'express';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// All user routes require authentication
router.use(protect);

// Add user-specific routes here in the future

export default router;

