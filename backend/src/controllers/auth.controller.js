import User from '../models/User.model.js';
import Profile from '../models/Profile.model.js';
import { generateToken } from '../utils/generateToken.js';

// @desc    Send OTP to phone number
// @route   POST /api/auth/send-otp
// @access  Public
export const sendOTP = async (req, res) => {
  try {
    const { phone, countryCode } = req.body;

    if (!phone || !countryCode) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and country code are required'
      });
    }

    // Validate phone number (10 digits)
    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Phone number must be exactly 10 digits'
      });
    }

    const fullPhone = `${countryCode}${phone}`;

    // Find or create user
    let user = await User.findOne({ phone: fullPhone });

    if (!user) {
      user = await User.create({
        phone: fullPhone,
        countryCode: countryCode
      });
    }

    // Generate OTP
    const otp = user.generateOTP();
    await user.save();

    // In production, send OTP via SMS service (Twilio, AWS SNS, etc.)
    // For now, we'll return it in development
    console.log(`OTP for ${fullPhone}: ${otp}`);

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      // Remove this in production
      ...(process.env.NODE_ENV === 'development' && { otp: otp })
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending OTP',
      error: error.message
    });
  }
};

// @desc    Verify OTP and login/signup
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOTP = async (req, res) => {
  try {
    const { phone, countryCode, otp } = req.body;

    if (!phone || !countryCode || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Phone number, country code, and OTP are required'
      });
    }

    const fullPhone = `${countryCode}${phone}`;
    const user = await User.findOne({ phone: fullPhone });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found. Please request OTP first.'
      });
    }

    // Verify OTP
    const isValid = user.verifyOTP(otp);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Clear OTP and mark phone as verified
    user.clearOTP();
    user.isPhoneVerified = true;
    user.lastActiveAt = new Date();
    await user.save();

    // Check if user has completed onboarding
    const profile = await Profile.findOne({ userId: user._id });
    const hasCompletedOnboarding = profile && profile.onboardingCompleted;

    // Generate JWT token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      token: token,
      user: {
        id: user._id,
        phone: user.phone,
        isPhoneVerified: user.isPhoneVerified,
        hasProfile: !!profile,
        hasCompletedOnboarding: hasCompletedOnboarding
      }
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying OTP',
      error: error.message
    });
  }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
export const resendOTP = async (req, res) => {
  try {
    const { phone, countryCode } = req.body;

    if (!phone || !countryCode) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and country code are required'
      });
    }

    const fullPhone = `${countryCode}${phone}`;
    const user = await User.findOne({ phone: fullPhone });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate new OTP
    const otp = user.generateOTP();
    await user.save();

    // In production, send OTP via SMS service
    console.log(`Resent OTP for ${fullPhone}: ${otp}`);

    res.status(200).json({
      success: true,
      message: 'OTP resent successfully',
      // Remove this in production
      ...(process.env.NODE_ENV === 'development' && { otp: otp })
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resending OTP',
      error: error.message
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-otp')
      .populate('profile');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user: user
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
};

