import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Heart, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '../../services/authService';

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
  const [receivedOtp, setReceivedOtp] = useState(''); // Store OTP received from API (dev mode)
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

  const handleSendOtp = async () => {
    // Validate phone number
    const phoneError = validatePhone(phone);
    if (phoneError) {
      setErrors(prev => ({ ...prev, phone: phoneError }));
      return;
    }
    
    // Clear any errors
    setErrors(prev => ({ ...prev, phone: '' }));
    
    setIsLoading(true);
    try {
      const fullPhoneNumber = `${countryCode}${phone}`;
      console.log('📤 ==========================================');
      console.log('📤 SEND OTP REQUEST');
      console.log('📤 Phone Number:', fullPhoneNumber);
      console.log('📤 Country Code:', countryCode);
      console.log('📤 Phone (10 digits):', phone);
      console.log('📤 ==========================================');
      
      const response = await authService.sendOTP(phone, countryCode);
      
      if (response.success) {
        console.log('✅ ==========================================');
        console.log('✅ OTP SENT SUCCESSFULLY');
        console.log('✅ OTP sent to registered number:', fullPhoneNumber);
        console.log('✅ User exists:', response.userExists);
        console.log('✅ Has basic info:', response.hasBasicInfo);
        console.log('✅ Auth flow:', authFlow);
        console.log('✅ ==========================================');
        
        // Check if user already exists and has basic info (signup flow)
        if (authFlow === 'signup' && response.userExists && response.hasBasicInfo) {
          console.log('⚠️ User already registered with this number');
          setErrors(prev => ({ 
            ...prev, 
            phone: 'This number is already registered. Please use Login instead.',
            showLoginLink: true
          }));
          return;
        }
        
        // In development, OTP is returned in response
        if (response.otp) {
          console.log('📨 OTP (dev mode):', response.otp);
          setReceivedOtp(response.otp); // Store for display
        }
        
        // Navigate to OTP verification page
        setCurrentPage('otp');
        setOtpTimer(60);
        setCanResend(false);
        setOtp(['', '', '', '', '', '']); // Reset OTP
        navigate('/verify-otp');
      } else {
        setErrors(prev => ({ ...prev, phone: response.message || 'Failed to send OTP' }));
      }
    } catch (error) {
      console.error('❌ ==========================================');
      console.error('❌ ERROR SENDING OTP');
      console.error('❌ Error:', error.message);
      console.error('❌ ==========================================');
      setErrors(prev => ({ ...prev, phone: error.message || 'Failed to send OTP. Please try again.' }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    
    setIsLoading(true);
    try {
      const response = await authService.resendOTP(phone, countryCode);
      
      if (response.success) {
        // In development, OTP is returned in response
        if (response.otp) {
          console.log('📨 Resent OTP:', response.otp);
          setReceivedOtp(response.otp); // Store for display
        }
        
        setOtpTimer(60);
        setCanResend(false);
        setOtp(['', '', '', '', '', '']); // Reset OTP
      } else {
        setErrors(prev => ({ ...prev, otp: response.message || 'Failed to resend OTP' }));
      }
    } catch (error) {
      console.error('Error resending OTP:', error);
      setErrors(prev => ({ ...prev, otp: error.message || 'Failed to resend OTP. Please try again.' }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      setErrors(prev => ({ ...prev, otp: 'Please enter complete OTP' }));
      return;
    }
    
    const fullPhoneNumber = `${countryCode}${phone}`;
    console.log('🔐 ==========================================');
    console.log('🔐 VERIFY OTP REQUEST');
    console.log('🔐 Phone Number:', fullPhoneNumber);
    console.log('🔐 OTP Entered:', otpCode);
    console.log('🔐 ==========================================');
    
    setIsLoading(true);
    try {
      const response = await authService.verifyOTP(phone, countryCode, otpCode);
      
      if (response.success && response.token) {
        // Token is stored in authService.verifyOTP
        console.log('✅ ==========================================');
        console.log('✅ OTP VERIFIED SUCCESSFULLY');
        console.log('✅ Phone Number:', fullPhoneNumber);
        console.log('✅ User authenticated:', response.user);
        console.log('✅ Has basic info:', response.user.hasBasicInfo);
        console.log('✅ Auth flow:', authFlow);
        console.log('✅ Token received and stored');
        console.log('✅ ==========================================');
        
        // Navigate based on auth flow and basic info status
        if (authFlow === 'signup' || !response.user.hasBasicInfo) {
          // Signup flow or user doesn't have basic info - go to basic info page
          console.log('📝 Navigating to basic info page (signup flow)');
          navigate('/basic-info', { replace: true });
        } else {
          // Login flow and user has basic info - go to people page
          console.log('👤 Navigating to people page (login flow)');
          navigate('/people', { replace: true });
        }
      } else {
        console.error('❌ ==========================================');
        console.error('❌ OTP VERIFICATION FAILED');
        console.error('❌ Error:', response.message);
        console.error('❌ ==========================================');
        setErrors(prev => ({ ...prev, otp: response.message || 'Wrong OTP, please enter correct' }));
      }
    } catch (error) {
      console.error('❌ ==========================================');
      console.error('❌ ERROR VERIFYING OTP');
      console.error('❌ Error:', error.message);
      console.error('❌ ==========================================');
      setErrors(prev => ({ ...prev, otp: error.message || 'Invalid OTP. Please try again.' }));
    } finally {
      setIsLoading(false);
    }
  };

  // Splash/Welcome Screen
  if (currentPage === 'splash') {
    return (
      <div className="h-screen bg-gradient-to-br from-[#F5F7FA] via-[#E8ECF1] to-[#F5F7FA] flex items-center justify-center p-3 sm:p-4 overflow-hidden relative">
        {/* Premium Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-[#64B5F6]/8 to-transparent rounded-full blur-3xl -translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 right-0 w-[700px] h-[700px] bg-gradient-to-tl from-[#42A5F5]/8 to-transparent rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-[#90CAF9]/5 to-transparent rounded-full blur-3xl"></div>
        <div className="w-full max-w-md text-center relative z-10">
          {/* App Logo */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mb-12 sm:mb-16"
          >
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-4xl sm:text-5xl font-bold text-[#1A1A1A] mb-4 tracking-tight"
            >
              DatingApp
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-lg sm:text-xl text-[#616161] font-medium mb-1"
            >
              Find your perfect match
            </motion.p>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-sm sm:text-base text-[#757575] font-medium"
            >
              Connect with people who share your interests
            </motion.p>
          </motion.div>

          {/* Continue Button */}
          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="w-full"
          >
            <motion.button
              onClick={() => {
                // This is signup flow
                setAuthFlow('signup');
                setCurrentPage('phone');
                navigate('/phone');
              }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-[#64B5F6] hover:bg-[#42A5F5] text-white font-bold py-4 sm:py-5 rounded-2xl transition-all shadow-[0_8px_24px_rgba(100,181,246,0.3)] hover:shadow-[0_12px_32px_rgba(100,181,246,0.4)] mb-6 text-base sm:text-lg"
            >
              <span className="flex items-center justify-center gap-2">
                Continue with Phone Number
              </span>
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
              className="text-sm sm:text-base text-[#616161] hover:text-[#64B5F6] font-semibold transition-all underline decoration-2 underline-offset-4 decoration-transparent hover:decoration-[#64B5F6]"
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
      <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] via-[#E8ECF1] to-[#F5F7FA] flex items-center justify-center p-2 sm:p-4 md:p-6 lg:p-8 overflow-y-auto relative">
        {/* Premium Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-[300px] sm:w-[400px] md:w-[600px] h-[300px] sm:h-[400px] md:h-[600px] bg-gradient-to-br from-[#64B5F6]/8 to-transparent rounded-full blur-3xl -translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 right-0 w-[350px] sm:w-[500px] md:w-[700px] h-[350px] sm:h-[500px] md:h-[700px] bg-gradient-to-tl from-[#42A5F5]/8 to-transparent rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] sm:w-[350px] md:w-[500px] h-[250px] sm:h-[350px] md:h-[500px] bg-gradient-to-r from-[#90CAF9]/5 to-transparent rounded-full blur-3xl"></div>
        <div className="w-full max-w-md relative z-10 my-4 sm:my-6 md:my-8">
          {/* Back Button */}
          <button
            onClick={() => {
              setCurrentPage('splash');
              navigate('/');
            }}
            className="mb-3 sm:mb-4 md:mb-6 p-2 hover:bg-[#F5F5F5] rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-[#616161]" />
          </button>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-4 sm:mb-5 md:mb-6 lg:mb-8"
          >
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#1A1A1A] mb-1 sm:mb-2 tracking-tight px-2">Enter Your Phone Number</h1>
            <p className="text-xs sm:text-sm md:text-base text-[#616161] font-medium px-2">We'll send you a verification code</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl sm:rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] p-4 sm:p-5 md:p-6 lg:p-8 border border-[#E8E8E8] relative overflow-hidden mx-2 sm:mx-3 md:mx-0"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#64B5F6]/5 to-transparent pointer-events-none"></div>
            <div className="space-y-4 sm:space-y-5 md:space-y-6 relative z-10">
              <div>
                <label className="block text-xs sm:text-sm md:text-base font-semibold text-[#1A1A1A] mb-2 sm:mb-3 tracking-tight">
                  Phone Number <span className="text-[#64B5F6]">*</span>
                </label>
                <style>{`
                  @media (min-width: 320px) {
                    .phone-input-container {
                      flex-direction: row !important;
                    }
                    .phone-input-container .country-dropdown {
                      width: auto !important;
                    }
                    .phone-input-container .phone-input {
                      width: auto !important;
                    }
                  }
                `}</style>
                <div className="phone-input-container flex flex-col gap-2">
                  <div className="country-dropdown relative w-full" ref={countryDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                      className="w-full px-3 sm:px-4 py-3 sm:py-4 border rounded-xl sm:rounded-2xl focus:outline-none transition-all text-[#1A1A1A] text-xs sm:text-sm md:text-base bg-white shadow-sm hover:shadow-md border-[#E8E8E8] focus:border-[#64B5F6] focus:ring-2 focus:ring-[#64B5F6]/20 font-semibold flex items-center justify-center sm:justify-start gap-2 min-w-[70px] sm:min-w-[80px]"
                    >
                      <span>{countryCode}</span>
                      <ChevronDown 
                        className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform ${isCountryDropdownOpen ? 'rotate-180' : ''}`} 
                      />
                    </button>
                    <AnimatePresence>
                      {isCountryDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-0 mt-1 bg-white border border-[#E8E8E8] rounded-xl sm:rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] z-50 w-full sm:w-auto min-w-[120px] sm:min-w-[150px] max-h-[180px] sm:max-h-[200px] overflow-y-auto"
                        >
                          {countryCodes.map((item) => (
                            <button
                              key={item.code}
                              type="button"
                              onClick={() => {
                                setCountryCode(item.code);
                                setIsCountryDropdownOpen(false);
                              }}
                              className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm hover:bg-[#F5F5F5] transition-colors first:rounded-t-xl sm:first:rounded-t-2xl last:rounded-b-xl sm:last:rounded-b-2xl ${
                                countryCode === item.code ? 'bg-[#E3F2FD] font-semibold' : ''
                              }`}
                            >
                              <span className="font-semibold">{item.code}</span>
                              <span className="text-[#616161] ml-2 text-[10px] sm:text-xs">{item.country}</span>
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
                    className={`phone-input flex-1 w-full px-3 sm:px-4 py-3 sm:py-4 border rounded-xl sm:rounded-2xl focus:outline-none transition-all text-[#1A1A1A] text-sm sm:text-base bg-white shadow-sm hover:shadow-md font-medium ${
                      errors.phone 
                        ? 'border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-500/20' 
                        : 'border-[#E8E8E8] focus:border-[#64B5F6] focus:ring-2 focus:ring-[#64B5F6]/20'
                    }`}
                  />
                </div>
                {errors.phone && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 ml-1"
                  >
                    <p className="text-xs sm:text-sm text-red-600 mb-1 sm:mb-2 break-words">
                      {errors.phone}
                    </p>
                    {errors.showLoginLink && (
                      <button
                        type="button"
                        onClick={async () => {
                          setAuthFlow('login');
                          setErrors({ phone: '' });
                          // Retry sending OTP with login flow
                          setIsLoading(true);
                          try {
                            const response = await authService.sendOTP(phone, countryCode);
                            if (response.success) {
                              if (response.otp) {
                                setReceivedOtp(response.otp);
                              }
                              setCurrentPage('otp');
                              setOtpTimer(60);
                              setCanResend(false);
                              setOtp(['', '', '', '', '', '']);
                              navigate('/verify-otp');
                            }
                          } catch (error) {
                            setErrors(prev => ({ ...prev, phone: error.message || 'Failed to send OTP. Please try again.' }));
                          } finally {
                            setIsLoading(false);
                          }
                        }}
                        className="text-xs sm:text-sm text-[#64B5F6] hover:text-[#42A5F5] font-semibold underline underline-offset-2 transition-colors break-words"
                      >
                        Click here to Login instead
                      </button>
                    )}
                  </motion.div>
                )}
                {!errors.phone && phone.length > 0 && (
                  <p className="text-[10px] sm:text-xs text-[#616161] mt-1 sm:mt-2 ml-1 font-medium">
                    {phone.length} digits
                  </p>
                )}
              </div>

              <motion.button
                onClick={handleSendOtp}
                disabled={!phone || isLoading || !!errors.phone || phone.length !== 10}
                whileHover={{ scale: phone.length === 10 && !isLoading ? 1.02 : 1, y: phone.length === 10 && !isLoading ? -2 : 0 }}
                whileTap={{ scale: phone.length === 10 && !isLoading ? 0.98 : 1 }}
                className="w-full bg-[#64B5F6] hover:bg-[#42A5F5] disabled:bg-[#E0E0E0] disabled:cursor-not-allowed text-white font-bold py-3 sm:py-3.5 md:py-4 lg:py-5 rounded-xl sm:rounded-2xl transition-all shadow-[0_4px_16px_rgba(100,181,246,0.3)] hover:shadow-[0_8px_24px_rgba(100,181,246,0.4)] disabled:shadow-none text-sm sm:text-base md:text-lg"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                    <span className="text-xs sm:text-sm md:text-base">Sending...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Send OTP
                  </span>
                )}
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
      <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] via-[#E8ECF1] to-[#F5F7FA] flex items-center justify-center p-2 sm:p-4 md:p-6 lg:p-8 overflow-y-auto relative">
        {/* Premium Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-[300px] sm:w-[400px] md:w-[600px] h-[300px] sm:h-[400px] md:h-[600px] bg-gradient-to-br from-[#64B5F6]/8 to-transparent rounded-full blur-3xl -translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 right-0 w-[350px] sm:w-[500px] md:w-[700px] h-[350px] sm:h-[500px] md:h-[700px] bg-gradient-to-tl from-[#42A5F5]/8 to-transparent rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] sm:w-[350px] md:w-[500px] h-[250px] sm:h-[350px] md:h-[500px] bg-gradient-to-r from-[#90CAF9]/5 to-transparent rounded-full blur-3xl"></div>
        <div className="w-full max-w-md relative z-10 my-4 sm:my-6 md:my-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-4 sm:mb-5 md:mb-6 lg:mb-8 px-2"
          >
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-[#1A1A1A] mb-1 sm:mb-2 tracking-tight">Verify OTP</h1>
            <p className="text-[11px] sm:text-xs md:text-sm lg:text-base text-[#616161] mb-1 sm:mb-2 font-medium px-1">
              We've sent a verification code to your registered number:
            </p>
            <p className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-[#64B5F6] mb-1 break-all px-1">
              {countryCode} {phone}
            </p>
            <p className="text-[10px] sm:text-[11px] md:text-xs text-[#616161] font-medium px-1">
              Please enter the 6-digit OTP received on this number
            </p>
            
            {/* Development Mode - Show OTP */}
            {import.meta.env.DEV && receivedOtp && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 sm:mt-3 md:mt-4 p-2 sm:p-3 md:p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg sm:rounded-xl mx-1 sm:mx-2 md:mx-0"
              >
                <p className="text-[10px] sm:text-[11px] md:text-xs font-semibold text-yellow-800 mb-1 sm:mb-2">🔧 Development Mode</p>
                <p className="text-[11px] sm:text-xs md:text-sm text-yellow-700 mb-1">OTP Code (for testing):</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-yellow-900 text-center tracking-widest break-all">
                  {receivedOtp}
                </p>
                <p className="text-[10px] sm:text-[11px] md:text-xs text-yellow-600 mt-1 sm:mt-2 text-center">
                  Check backend console for more details
                </p>
              </motion.div>
            )}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl sm:rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] p-4 sm:p-5 md:p-6 lg:p-8 border border-[#E8E8E8] relative overflow-hidden mx-2 sm:mx-3 md:mx-0"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#64B5F6]/5 to-transparent pointer-events-none"></div>
            <div className="space-y-4 sm:space-y-5 md:space-y-6 relative z-10">
              <div>
                <label className="block text-xs sm:text-sm md:text-base font-semibold text-[#1A1A1A] mb-2 sm:mb-3 md:mb-4 lg:mb-5 text-center tracking-tight">
                  Enter 6-digit code
                </label>
                <div className="flex justify-center items-center gap-1 sm:gap-1.5 md:gap-2 lg:gap-3 px-0.5 sm:px-1">
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
                      className="flex-1 max-w-[38px] sm:max-w-[42px] md:max-w-[48px] lg:max-w-[55px] h-10 sm:h-12 md:h-14 lg:h-16 text-center text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold border rounded-lg sm:rounded-xl focus:outline-none transition-all text-[#1A1A1A] bg-white shadow-sm hover:shadow-md focus:shadow-lg focus:ring-2 focus:ring-[#64B5F6]/20 border-[#E8E8E8] focus:border-[#64B5F6]"
                    />
                  ))}
                </div>
              </div>

              <motion.button
                onClick={handleVerifyOtp}
                disabled={otp.some(d => !d) || isLoading}
                whileHover={{ scale: !otp.some(d => !d) && !isLoading ? 1.02 : 1, y: !otp.some(d => !d) && !isLoading ? -2 : 0 }}
                whileTap={{ scale: !otp.some(d => !d) && !isLoading ? 0.98 : 1 }}
                className="w-full bg-[#64B5F6] hover:bg-[#42A5F5] disabled:bg-[#E0E0E0] disabled:cursor-not-allowed text-white font-bold py-2.5 sm:py-3 md:py-3.5 lg:py-4 xl:py-5 rounded-lg sm:rounded-xl md:rounded-2xl transition-all shadow-[0_4px_16px_rgba(100,181,246,0.3)] hover:shadow-[0_8px_24px_rgba(100,181,246,0.4)] disabled:shadow-none text-xs sm:text-sm md:text-base lg:text-lg"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-1.5 sm:gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                    <span className="text-[11px] sm:text-xs md:text-sm lg:text-base">Verifying...</span>
                  </span>
                ) : (
                  <span>Verify OTP</span>
                )}
              </motion.button>

              <div className="text-center pt-1 sm:pt-2">
                {canResend ? (
                  <motion.button
                    onClick={handleResendOtp}
                    disabled={isLoading}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-[#616161] hover:text-[#1A1A1A] font-semibold text-[10px] sm:text-xs md:text-sm lg:text-base transition-colors break-words px-1"
                  >
                    Didn't receive code? <span className="text-[#64B5F6] hover:text-[#42A5F5] underline decoration-2 underline-offset-2">Resend OTP</span>
                  </motion.button>
                ) : (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-[#616161] text-[10px] sm:text-xs md:text-sm lg:text-base font-medium"
                  >
                    Resend OTP in <span className="font-bold text-[#64B5F6]">{otpTimer}s</span>
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