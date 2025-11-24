import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  sendOTP,
  verifyOTP,
  resendOTP,
  getMe
} from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Rate limiter for send-otp that bypasses test numbers
const sendOTPLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Higher limit for OTP
  skip: (req) => {
    // Skip rate limiting for test phone numbers
    const testPhoneNumbers = ['6264560457', '9685974247'];
    const phone = req.body?.phone;
    return testPhoneNumbers.includes(phone);
  },
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests, please try again later.'
});

router.post('/send-otp', sendOTPLimiter, sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', sendOTPLimiter, resendOTP);
router.get('/me', protect, getMe);

export default router;

