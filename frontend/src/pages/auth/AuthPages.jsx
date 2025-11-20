import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Heart, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [countryCode, setCountryCode] = useState('+91'); // Default to India
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({ phone: '' });
  const [otpTimer, setOtpTimer] = useState(60); // 60 seconds timer
  const [canResend, setCanResend] = useState(false);
  const [authFlow, setAuthFlow] = useState('signup'); // 'signup' or 'login'
  const countryDropdownRef = useRef(null);

  // Common country codes
  const countryCodes = [
    { code: '+91', country: 'India' },
    { code: '+1', country: 'USA/Canada' },
    { code: '+44', country: 'UK' },
    { code: '+61', country: 'Australia' },
    { code: '+49', country: 'Germany' },
    { code: '+33', country: 'France' },
    { code: '+81', country: 'Japan' },
    { code: '+86', country: 'China' },
    { code: '+7', country: 'Russia' },
    { code: '+55', country: 'Brazil' },
    { code: '+52', country: 'Mexico' },
    { code: '+34', country: 'Spain' },
    { code: '+39', country: 'Italy' },
    { code: '+82', country: 'South Korea' },
    { code: '+65', country: 'Singapore' },
    { code: '+971', country: 'UAE' },
    { code: '+966', country: 'Saudi Arabia' },
    { code: '+27', country: 'South Africa' },
    { code: '+31', country: 'Netherlands' },
    { code: '+46', country: 'Sweden' }
  ];

  // Sync currentPage with URL changes
  useEffect(() => {
    const page = getInitialPage();
    setCurrentPage(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.search]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target)) {
        setIsCountryDropdownOpen(false);
      }
    };

    if (isCountryDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCountryDropdownOpen]);

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

  // Validate phone number (exactly 10 digits)
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
      
      // Store phone number with country code
      localStorage.setItem('authData', JSON.stringify({
        phone: phone,
        countryCode: countryCode
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
        // Login flow → Go directly to people page (skip onboarding)
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
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mb-10 sm:mb-12"
          >
            <motion.div 
              animate={{ 
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1],
                boxShadow: [
                  "0 15px 30px rgba(255, 145, 164, 0.25)",
                  "0 20px 40px rgba(255, 105, 180, 0.35)",
                  "0 15px 30px rgba(255, 145, 164, 0.25)"
                ]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                repeatDelay: 2,
                ease: "easeInOut"
              }}
              className="w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-[#FF91A4] via-[#FF69B4] to-[#FF91A4] rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-xl relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/20 to-transparent"></div>
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/30"></div>
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, -5, 5, 0]
                }}
                transition={{ 
                  duration: 2.5, 
                  repeat: Infinity, 
                  repeatDelay: 0.5,
                  ease: "easeInOut"
                }}
                className="relative z-10"
              >
                <Heart className="w-12 h-12 sm:w-14 sm:h-14 text-white fill-white drop-shadow-md" strokeWidth={2.5} />
              </motion.div>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-3xl sm:text-4xl font-bold text-[#212121] mb-3 drop-shadow-sm"
            >
              DatingApp
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-lg sm:text-xl text-[#757575] font-semibold mb-2"
            >
              Find your perfect match
            </motion.p>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-sm sm:text-base text-[#9E9E9E] font-medium"
            >
              Connect with people who share your interests
            </motion.p>
          </motion.div>

          {/* Continue Button */}
          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-gradient-to-br from-white to-[#FFF0F5] rounded-3xl shadow-2xl p-6 sm:p-8 border border-[#FFB6C1]/30 relative overflow-hidden backdrop-blur-sm"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#FF91A4]/10 via-[#FF69B4]/5 to-transparent"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FF91A4] via-[#FF69B4] to-[#FF91A4]"></div>
            <motion.button
              onClick={() => {
                // This is signup flow
                setAuthFlow('signup');
                setCurrentPage('phone');
                navigate('/phone');
              }}
              whileHover={{ scale: 1.03, y: -3 }}
              whileTap={{ scale: 0.97 }}
              className="w-full bg-gradient-to-r from-[#FF91A4] via-[#FF69B4] to-[#FF91A4] text-white font-bold py-4 sm:py-5 rounded-2xl transition-all shadow-xl hover:shadow-2xl mb-5 relative z-10 text-base sm:text-lg group overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Continue with Phone Number
              </span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-[#FF69B4] via-[#FF91A4] to-[#FF69B4] opacity-0 group-hover:opacity-100 transition-opacity"
                initial={false}
              />
            </motion.button>

            <motion.button
              onClick={() => {
                // This is login flow
                setAuthFlow('login');
                setCurrentPage('phone');
                navigate('/phone');
              }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="text-sm sm:text-base text-[#757575] hover:text-[#FF91A4] font-semibold transition-all relative z-10 underline decoration-2 underline-offset-4 decoration-transparent hover:decoration-[#FF91A4]"
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
          {/* Back Button */}
          <button
            onClick={() => {
              setCurrentPage('splash');
              navigate('/');
            }}
            className="mb-4 sm:mb-6 p-2 hover:bg-[#FFE4E1] rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#212121]" />
          </button>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-6 sm:mb-8"
          >
            <h1 className="text-2xl sm:text-3xl font-bold text-[#212121] mb-2">Enter Your Phone Number</h1>
            <p className="text-sm sm:text-base text-[#757575]">We'll send you a verification code</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gradient-to-br from-white to-[#FFF0F5] rounded-3xl shadow-2xl p-6 sm:p-8 border border-[#FFB6C1]/20 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#FF91A4]/5 to-transparent pointer-events-none"></div>
            <div className="space-y-6 relative z-10">
              <div>
                <label className="block text-sm sm:text-base font-semibold text-[#212121] mb-3">
                  Phone Number <span className="text-[#FF91A4]">*</span>
                </label>
                <div className="flex gap-2">
                  <div className="relative" ref={countryDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                      className="px-3 sm:px-4 py-4 border-2 rounded-2xl focus:outline-none transition-all text-[#212121] text-sm sm:text-base bg-white shadow-sm hover:shadow-md border-[#FFB6C1] focus:border-[#FF91A4] focus:ring-2 focus:ring-[#FF91A4]/20 font-semibold flex items-center gap-2 min-w-[80px]"
                    >
                      <span>{countryCode}</span>
                      <ChevronDown 
                        className={`w-4 h-4 transition-transform ${isCountryDropdownOpen ? 'rotate-180' : ''}`} 
                      />
                    </button>
                    <AnimatePresence>
                      {isCountryDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-0 mt-1 bg-white border-2 border-[#FFB6C1] rounded-2xl shadow-xl z-50 w-full min-w-[120px] max-h-[200px] overflow-y-auto"
                        >
                          {countryCodes.map((item) => (
                            <button
                              key={item.code}
                              type="button"
                              onClick={() => {
                                setCountryCode(item.code);
                                setIsCountryDropdownOpen(false);
                              }}
                              className={`w-full px-4 py-3 text-left text-sm hover:bg-[#FFE4E1] transition-colors first:rounded-t-2xl last:rounded-b-2xl ${
                                countryCode === item.code ? 'bg-[#FFE4E1] font-semibold' : ''
                              }`}
                            >
                              <span className="font-semibold">{item.code}</span>
                              <span className="text-[#757575] ml-2 text-xs">{item.country}</span>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    onBlur={() => {
                      const error = validatePhone(phone);
                      setErrors(prev => ({ ...prev, phone: error }));
                    }}
                    placeholder="Enter your phone number"
                    maxLength={10}
                    className={`flex-1 px-4 py-4 border-2 rounded-2xl focus:outline-none transition-all text-[#212121] text-base bg-white shadow-sm hover:shadow-md ${
                      errors.phone 
                        ? 'border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-500/20' 
                        : 'border-[#FFB6C1] focus:border-[#FF91A4] focus:ring-2 focus:ring-[#FF91A4]/20'
                    }`}
                  />
                </div>
                {errors.phone && (
                  <motion.p 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-600 mt-2 ml-1"
                  >
                    {errors.phone}
                  </motion.p>
                )}
                {!errors.phone && phone.length > 0 && (
                  <p className="text-xs text-[#757575] mt-2 ml-1">
                    {phone.length} digits
                  </p>
                )}
              </div>

              <motion.button
                onClick={handleSendOtp}
                disabled={!phone || isLoading || !!errors.phone || phone.length !== 10}
                whileHover={{ scale: phone.length === 10 && !isLoading ? 1.02 : 1, y: phone.length === 10 && !isLoading ? -2 : 0 }}
                whileTap={{ scale: phone.length === 10 && !isLoading ? 0.98 : 1 }}
                className="w-full bg-gradient-to-r from-[#FF91A4] to-[#FF69B4] hover:from-[#FF69B4] hover:to-[#FF91A4] disabled:from-[#E0E0E0] disabled:to-[#E0E0E0] disabled:cursor-not-allowed text-white font-bold py-4 sm:py-5 rounded-2xl transition-all shadow-lg hover:shadow-xl disabled:shadow-none text-base sm:text-lg relative overflow-hidden group"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                    Sending...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Send OTP
                  </span>
                )}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-[#FF69B4] via-[#FF91A4] to-[#FF69B4] opacity-0 group-hover:opacity-100 transition-opacity"
                  initial={false}
                />
              </motion.button>
            </div>
          </motion.div>
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
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-6 sm:mb-8"
          >
            <h1 className="text-2xl sm:text-3xl font-bold text-[#212121] mb-2">Verify OTP</h1>
            <p className="text-sm sm:text-base text-[#757575]">
              We've sent a code to<br />
              <span className="font-semibold text-[#212121]">{countryCode} {phone}</span>
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gradient-to-br from-white to-[#FFF0F5] rounded-3xl shadow-2xl p-6 sm:p-8 border border-[#FFB6C1]/20 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#FF91A4]/5 to-transparent pointer-events-none"></div>
            <div className="space-y-6 relative z-10">
              <div>
                <label className="block text-sm sm:text-base font-semibold text-[#212121] mb-4 sm:mb-5 text-center">
                  Enter 6-digit code
                </label>
                <div className="flex justify-center items-center gap-2 sm:gap-3 px-1">
                  {otp.map((digit, index) => (
                    <motion.input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      whileFocus={{ scale: 1.05 }}
                      className="flex-1 max-w-[50px] sm:max-w-[55px] h-14 sm:h-16 text-center text-2xl sm:text-3xl font-bold border-2 rounded-xl focus:outline-none transition-all text-[#212121] bg-white shadow-sm hover:shadow-md focus:shadow-lg focus:ring-2 focus:ring-[#FF91A4]/20 border-[#FFB6C1] focus:border-[#FF91A4]"
                    />
                  ))}
                </div>
              </div>

              <motion.button
                onClick={handleVerifyOtp}
                disabled={otp.some(d => !d) || isLoading}
                whileHover={{ scale: !otp.some(d => !d) && !isLoading ? 1.02 : 1, y: !otp.some(d => !d) && !isLoading ? -2 : 0 }}
                whileTap={{ scale: !otp.some(d => !d) && !isLoading ? 0.98 : 1 }}
                className="w-full bg-gradient-to-r from-[#FF91A4] to-[#FF69B4] hover:from-[#FF69B4] hover:to-[#FF91A4] disabled:from-[#E0E0E0] disabled:to-[#E0E0E0] disabled:cursor-not-allowed text-white font-bold py-4 sm:py-5 rounded-2xl transition-all shadow-lg hover:shadow-xl disabled:shadow-none text-base sm:text-lg relative overflow-hidden group"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                    Verifying...
                  </span>
                ) : (
                  <span>Verify OTP</span>
                )}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-[#FF69B4] via-[#FF91A4] to-[#FF69B4] opacity-0 group-hover:opacity-100 transition-opacity"
                  initial={false}
                />
              </motion.button>

              <div className="text-center pt-2">
                {canResend ? (
                  <motion.button
                    onClick={handleResendOtp}
                    disabled={isLoading}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-[#757575] hover:text-[#212121] font-semibold text-sm sm:text-base transition-colors"
                  >
                    Didn't receive code? <span className="text-[#FF91A4] hover:text-[#FF69B4] underline decoration-2 underline-offset-2">Resend OTP</span>
                  </motion.button>
                ) : (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-[#757575] text-sm sm:text-base"
                  >
                    Resend OTP in <span className="font-bold text-[#FF91A4]">{otpTimer}s</span>
                  </motion.p>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

}