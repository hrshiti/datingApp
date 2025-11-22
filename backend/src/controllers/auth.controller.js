import User from '../models/User.model.js';
import Profile from '../models/Profile.model.js';
import { generateToken } from '../utils/generateToken.js';
import smsIndiaHubService from '../services/smsIndiaHubService.js';

// @desc    Send OTP to phone number
// @route   POST /api/auth/send-otp
// @access  Public
export const sendOTP = async (req, res) => {
  try {
    console.log('\n=== SEND OTP REQUEST ===');
    console.log('Request body:', req.body);
    
    const { phone, countryCode } = req.body;

    if (!phone || !countryCode) {
      console.log('❌ Error: Phone number or country code missing');
      return res.status(400).json({
        success: false,
        message: 'Phone number and country code are required'
      });
    }

    // Validate phone number (10 digits)
    if (!/^\d{10}$/.test(phone)) {
      console.log('❌ Error: Invalid phone format -', phone);
      return res.status(400).json({
        success: false,
        message: 'Phone number must be exactly 10 digits'
      });
    }

    const fullPhone = `${countryCode}${phone}`;
    console.log('📱 Full phone number:', fullPhone);

    // Find or create user
    let user = await User.findOne({ phone: fullPhone });

    if (!user) {
      console.log('👤 Creating new user...');
      user = await User.create({
        phone: fullPhone,
        countryCode: countryCode
      });
      console.log('✅ New user created with ID:', user._id);
    } else {
      console.log('👤 Existing user found with ID:', user._id);
    }

    // Generate OTP
    const otp = user.generateOTP();
    await user.save();
    
    console.log('🔐 OTP Generated:', otp);
    console.log('⏰ OTP Expires at:', user.otp.expiresAt);
    console.log('✅ OTP saved to database');
    console.log(`\n📨 ==========================================`);
    console.log(`📨 OTP for ${fullPhone}: ${otp}`);
    console.log(`📨 ==========================================\n`);

    // Send OTP via SMSIndia Hub
    try {
      if (smsIndiaHubService.isConfigured()) {
        const smsResult = await smsIndiaHubService.sendOTP(phone, otp, countryCode);
        console.log('OTP sent via SMSIndia Hub:', smsResult);
      } else {
        console.warn('SMSIndia Hub not configured. OTP logged to console.');
        console.log(`OTP for ${fullPhone}: ${otp}`);
      }
    } catch (smsError) {
      console.error('Error sending OTP via SMS:', smsError.message);
      // Still return success but log the error
      // In production, you might want to handle this differently
      console.log(`OTP for ${fullPhone}: ${otp} (SMS failed, using fallback)`);
    }

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      // Only return OTP in development if SMSIndia Hub is not configured
      ...(process.env.NODE_ENV === 'development' && !smsIndiaHubService.isConfigured() && { otp: otp })
    });
    
    console.log('=== SEND OTP SUCCESS ===\n');
  } catch (error) {
    console.error('\n❌ === SEND OTP ERROR ===');
    console.error('Error details:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('========================\n');
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
    console.log('\n=== VERIFY OTP REQUEST ===');
    console.log('Request body:', { 
      phone: req.body.phone, 
      countryCode: req.body.countryCode,
      otp: req.body.otp ? '***' : 'missing' 
    });
    
    const { phone, countryCode, otp } = req.body;

    if (!phone || !countryCode || !otp) {
      console.log('❌ Error: Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Phone number, country code, and OTP are required'
      });
    }

    const fullPhone = `${countryCode}${phone}`;
    console.log('📱 Full phone number:', fullPhone);
    console.log('🔐 OTP received:', otp);

    const user = await User.findOne({ phone: fullPhone });

    if (!user) {
      console.log('❌ Error: User not found for phone:', fullPhone);
      return res.status(404).json({
        success: false,
        message: 'User not found. Please request OTP first.'
      });
    }

    console.log('👤 User found with ID:', user._id);
    console.log('📋 Stored OTP in DB:', user.otp?.code || 'No OTP found');
    console.log('⏰ OTP Expires at:', user.otp?.expiresAt || 'N/A');
    console.log('🕐 Current time:', new Date());

    // Verify OTP
    const isValid = user.verifyOTP(otp);
    console.log('✅ OTP Verification result:', isValid ? 'VALID ✓' : 'INVALID ✗');

    if (!isValid) {
      console.log('❌ OTP verification failed');
      console.log('   Expected OTP:', user.otp?.code);
      console.log('   Received OTP:', otp);
      console.log('   OTP Match:', user.otp?.code === otp);
      console.log('   OTP Expired:', user.otp?.expiresAt ? (new Date() > user.otp.expiresAt) : 'N/A');
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
    console.log('✅ User updated: OTP cleared, phone verified');

    // Check if user has completed onboarding
    const profile = await Profile.findOne({ userId: user._id });
    const hasCompletedOnboarding = profile && profile.onboardingCompleted;
    console.log('📄 Profile found:', !!profile);
    console.log('📄 Onboarding completed:', hasCompletedOnboarding);

    // Generate JWT token
    const token = generateToken(user._id);
    console.log('🔑 JWT Token generated');

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
    
    console.log('=== VERIFY OTP SUCCESS ===\n');
  } catch (error) {
    console.error('\n❌ === VERIFY OTP ERROR ===');
    console.error('Error details:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('==========================\n');
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
    console.log('\n=== RESEND OTP REQUEST ===');
    console.log('Request body:', req.body);
    
    const { phone, countryCode } = req.body;

    if (!phone || !countryCode) {
      console.log('❌ Error: Phone number or country code missing');
      return res.status(400).json({
        success: false,
        message: 'Phone number and country code are required'
      });
    }

    const fullPhone = `${countryCode}${phone}`;
    console.log('📱 Full phone number:', fullPhone);
    
    const user = await User.findOne({ phone: fullPhone });

    if (!user) {
      console.log('❌ Error: User not found for phone:', fullPhone);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('👤 User found with ID:', user._id);
    console.log('🔄 Previous OTP:', user.otp?.code || 'None');

    // Generate new OTP
    const otp = user.generateOTP();
    await user.save();
    
    console.log('🔐 New OTP Generated:', otp);
    console.log('⏰ OTP Expires at:', user.otp.expiresAt);
    console.log('✅ New OTP saved to database');
    console.log(`\n📨 ==========================================`);
    console.log(`📨 Resent OTP for ${fullPhone}: ${otp}`);
    console.log(`📨 ==========================================\n`);

    // Send OTP via SMSIndia Hub
    try {
      if (smsIndiaHubService.isConfigured()) {
        const smsResult = await smsIndiaHubService.sendOTP(phone, otp, countryCode);
        console.log('OTP resent via SMSIndia Hub:', smsResult);
      } else {
        console.warn('SMSIndia Hub not configured. OTP logged to console.');
        console.log(`Resent OTP for ${fullPhone}: ${otp}`);
      }
    } catch (smsError) {
      console.error('Error resending OTP via SMS:', smsError.message);
      // Still return success but log the error
      console.log(`Resent OTP for ${fullPhone}: ${otp} (SMS failed, using fallback)`);
    }

    res.status(200).json({
      success: true,
      message: 'OTP resent successfully',
      // Only return OTP in development if SMSIndia Hub is not configured
      ...(process.env.NODE_ENV === 'development' && !smsIndiaHubService.isConfigured() && { otp: otp })
    });
    
    console.log('=== RESEND OTP SUCCESS ===\n');
  } catch (error) {
    console.error('\n❌ === RESEND OTP ERROR ===');
    console.error('Error details:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('===========================\n');
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

