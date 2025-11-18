import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Phone, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AuthPages() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine initial page from URL path
  const getInitialPage = () => {
    const path = location.pathname;
    if (path === '/welcome' || path === '/') return 'splash';
    if (path === '/phone') return 'phone';
    if (path === '/verify-otp') return 'otp';
    return 'splash'; // default
  };

  const [currentPage, setCurrentPage] = useState(() => getInitialPage());
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({ phone: '' });
  const [otpTimer, setOtpTimer] = useState(60); // 60 seconds timer
  const [canResend, setCanResend] = useState(false);
  const [authFlow, setAuthFlow] = useState('signup'); // 'signup' or 'login'

  // Sync currentPage with URL changes
  useEffect(() => {
    const page = getInitialPage();
    setCurrentPage(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.search]);

  // OTP Timer effect
  useEffect(() => {
    if (currentPage === 'otp' && otpTimer > 0 && !canResend) {
      const timer = setTimeout(() => {
        setOtpTimer(prev => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentPage, otpTimer, canResend]);

  // Validate phone number (10 digits)
  const validatePhone = (phoneValue) => {
    const digitsOnly = phoneValue.replace(/\D/g, '');
    if (!digitsOnly) {
      return 'Phone number is required';
    }
    if (digitsOnly.length !== 10) {
      return 'Phone number must be exactly 10 digits';
    }
    return '';
  };

  // Handle phone change with validation
  const handlePhoneChange = (value) => {
    // Only allow digits and limit to 10 digits
    const digitsOnly = value.replace(/\D/g, '');
    if (digitsOnly.length <= 10) {
      setPhone(digitsOnly);
      if (errors.phone) {
        const error = validatePhone(digitsOnly);
        setErrors(prev => ({ ...prev, phone: error }));
      }
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      
      if (value && index < 5) {
        document.getElementById(`otp-${index + 1}`)?.focus();
      }
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleSendOtp = () => {
    // Validate phone number
    const phoneError = validatePhone(phone);
    if (phoneError) {
      setErrors(prev => ({ ...prev, phone: phoneError }));
      return;
    }
    
    // Clear any errors
    setErrors(prev => ({ ...prev, phone: '' }));
    
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setCurrentPage('otp');
      setOtpTimer(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']); // Reset OTP
      navigate('/verify-otp');
    }, 1500);
  };

  const handleResendOtp = () => {
    if (!canResend) return;
    
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setOtpTimer(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']); // Reset OTP
    }, 1500);
  };

  const handleVerifyOtp = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      
      // Store phone number
      localStorage.setItem('authData', JSON.stringify({
        phone: phone
      }));
      
      // Route based on auth flow (signup or login)
      if (authFlow === 'signup') {
        // Signup flow → Go to onboarding (profile creation) - start from step 1
        // Clear any partial onboarding data to start fresh
        const freshOnboardingData = {
          step1: {},
          step2: {},
          step3: {},
          step4: {},
          step5: {},
          step6: {},
          currentStep: 1,
          completed: false
        };
        localStorage.setItem('onboardingData', JSON.stringify(freshOnboardingData));
        navigate('/onboarding');
      } else {
        // Login flow → Go directly to people (swiping feed) (skip onboarding)
        navigate('/people');
      }
    }, 1500);
  };

  // Splash/Welcome Screen
  if (currentPage === 'splash') {
    return (
      <div className="h-screen heart-background flex items-center justify-center p-3 sm:p-4 overflow-hidden">
        <span className="heart-decoration">💕</span>
        <span className="heart-decoration">💖</span>
        <span className="heart-decoration">💗</span>
        <span className="heart-decoration">💝</span>
        <span className="heart-decoration">❤️</span>
        <span className="heart-decoration">💓</span>
        <div className="decoration-circle"></div>
        <div className="decoration-circle"></div>
        <div className="w-full max-w-md text-center relative z-10">
          {/* App Logo */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mb-8"
          >
            <motion.div 
              animate={{ 
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                repeatDelay: 2,
                ease: "easeInOut"
              }}
              className="w-28 h-28 bg-gradient-to-br from-[#FF91A4] via-[#FF69B4] to-[#FF91A4] rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-2xl relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent"></div>
              <span className="text-6xl relative z-10">💕</span>
            </motion.div>
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-[#FF91A4] to-[#FF69B4] bg-clip-text text-transparent mb-3">
              DatingApp
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 font-medium">Find your perfect match</p>
          </motion.div>

          {/* Continue Button */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gradient-to-br from-white to-[#FFF0F5] rounded-3xl shadow-2xl p-6 sm:p-8 border border-[#FFB6C1]/20 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#FF91A4]/5 to-transparent"></div>
            <motion.button
              onClick={() => {
                // This is signup flow
                setAuthFlow('signup');
                setCurrentPage('phone');
                navigate('/phone');
              }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-[#FF91A4] to-[#FF69B4] text-white font-semibold py-4 rounded-2xl transition-all shadow-lg hover:shadow-xl mb-4 relative z-10"
            >
              Continue with Phone Number
            </motion.button>

            <motion.button
              onClick={() => {
                // This is login flow
                setAuthFlow('login');
                setCurrentPage('phone');
                navigate('/phone');
              }}
              whileHover={{ scale: 1.05 }}
              className="text-sm text-gray-600 hover:text-[#FF91A4] font-medium transition-colors relative z-10"
            >
              Already have an account? Login
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Phone Number Page
  if (currentPage === 'phone') {
    return (
      <div className="h-screen heart-background flex items-center justify-center p-3 sm:p-4 overflow-hidden">
        <span className="heart-decoration">💕</span>
        <span className="heart-decoration">💖</span>
        <span className="heart-decoration">💗</span>
        <span className="heart-decoration">💝</span>
        <span className="heart-decoration">❤️</span>
        <span className="heart-decoration">💓</span>
        <div className="decoration-circle"></div>
        <div className="decoration-circle"></div>
        <div className="w-full max-w-md relative z-10">
          <button
            onClick={() => {
              setCurrentPage('splash');
              navigate('/welcome');
            }}
            className="flex items-center text-gray-600 hover:text-black mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>

          <div className="text-center mb-4 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-black mb-2">Enter Your Phone Number</h1>
            <p className="text-sm sm:text-base text-gray-600">We'll send you a verification code</p>
          </div>

          <div className="bg-white rounded-3xl shadow-lg p-5 sm:p-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    onBlur={() => {
                      const error = validatePhone(phone);
                      setErrors(prev => ({ ...prev, phone: error }));
                    }}
                    placeholder="Enter your 10-digit phone number"
                    maxLength={10}
                    className={`w-full pl-12 pr-4 py-4 border-2 rounded-2xl focus:outline-none transition-colors text-black ${
                      errors.phone ? 'border-red-500' : 'border-gray-200 focus:border-[#FF91A4]'
                    }`}
                  />
                </div>
                {errors.phone && (
                  <p className="text-sm text-red-500 mt-1 ml-1">{errors.phone}</p>
                )}
              </div>

              <button
                onClick={handleSendOtp}
                disabled={!phone || isLoading || !!errors.phone || phone.length !== 10}
                className="w-full bg-[#FF91A4] hover:bg-[#FF69B4] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-2xl transition-all transform hover:scale-105 active:scale-95 disabled:transform-none"
              >
                {isLoading ? 'Sending...' : 'Send OTP'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // OTP Verification Page
  if (currentPage === 'otp') {
    return (
      <div className="h-screen heart-background flex items-center justify-center p-3 sm:p-4 overflow-hidden">
        <span className="heart-decoration">💕</span>
        <span className="heart-decoration">💖</span>
        <span className="heart-decoration">💗</span>
        <span className="heart-decoration">💝</span>
        <span className="heart-decoration">❤️</span>
        <span className="heart-decoration">💓</span>
        <div className="decoration-circle"></div>
        <div className="decoration-circle"></div>
        <div className="w-full max-w-md relative z-10">
          <button
            onClick={() => {
              setCurrentPage('phone');
              navigate('/phone');
            }}
            className="flex items-center text-gray-600 hover:text-black mb-4 sm:mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>

          <div className="text-center mb-4 sm:mb-8">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#FFE4E1] rounded-full mx-auto mb-3 sm:mb-4 flex items-center justify-center">
              <Phone className="w-6 h-6 sm:w-8 sm:h-8 text-[#FF91A4]" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-black mb-2">Verify OTP</h1>
            <p className="text-sm sm:text-base text-gray-600">
              We've sent a code to<br />
              <span className="font-medium text-black">{phone}</span>
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-lg p-5 sm:p-8">
            <div className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-sm font-medium text-black mb-3 sm:mb-4 text-center">
                  Enter 6-digit code
                </label>
                <div className="flex justify-center items-center gap-1.5 sm:gap-2 px-1">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="flex-1 max-w-[45px] sm:max-w-[50px] h-12 sm:h-14 text-center text-xl sm:text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-[#FF91A4] focus:outline-none transition-colors text-black"
                    />
                  ))}
                </div>
              </div>

              <button
                onClick={handleVerifyOtp}
                disabled={otp.some(d => !d) || isLoading}
                className="w-full bg-[#FF91A4] hover:bg-[#FF69B4] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-2xl transition-all transform hover:scale-105 active:scale-95 disabled:transform-none"
              >
                {isLoading ? 'Verifying...' : 'Verify OTP'}
              </button>

              <div className="text-center">
                {canResend ? (
                  <button
                    onClick={handleResendOtp}
                    disabled={isLoading}
                    className="text-gray-600 hover:text-black font-medium text-sm"
                  >
                    Didn't receive code? <span className="text-[#FF91A4] hover:text-[#FF69B4]">Resend OTP</span>
                  </button>
                ) : (
                  <p className="text-gray-600 text-sm">
                    Resend OTP in <span className="font-semibold text-[#FF91A4]">{otpTimer}s</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

}