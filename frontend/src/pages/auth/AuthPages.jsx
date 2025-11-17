import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Phone, ArrowLeft, Shield, CheckCircle } from 'lucide-react';

export default function AuthPages() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine initial page from URL path
  const getInitialPage = () => {
    const path = location.pathname;
    if (path === '/login') return 'login';
    if (path === '/signup') return 'signup';
    if (path === '/verify-otp') {
      const type = new URLSearchParams(location.search).get('type');
      return type === 'login' ? 'login-otp' : 'signup-otp';
    }
    if (path === '/success') return 'success';
    return 'signup'; // default
  };

  const [currentPage, setCurrentPage] = useState(() => getInitialPage());
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Sync currentPage with URL changes
  useEffect(() => {
    const page = getInitialPage();
    setCurrentPage(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.search]);

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

  const handleSendOtp = (type) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const otpPage = type === 'login' ? 'login-otp' : 'signup-otp';
      setCurrentPage(otpPage);
      navigate(`/verify-otp?type=${type}`);
    }, 1500);
  };

  const handleVerifyOtp = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setCurrentPage('success');
      // Store auth type in localStorage to know if it's signup or login
      const authType = currentPage === 'signup-otp' ? 'signup' : 'login';
      localStorage.setItem('authType', authType);
      navigate('/success');
    }, 1500);
  };

  // Login Page
  if (currentPage === 'login') {
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
              setCurrentPage('signup');
              navigate('/signup');
            }}
            className="flex items-center text-gray-600 hover:text-black mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>

          <div className="text-center mb-4 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-black mb-2">Login</h1>
            <p className="text-sm sm:text-base text-gray-600">Enter your details to continue</p>
          </div>

          <div className="bg-white rounded-3xl shadow-lg p-5 sm:p-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Email or Phone
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email or phone number"
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-[#FF91A4] focus:outline-none transition-colors text-black"
                  />
                </div>
              </div>

              <button
                onClick={() => handleSendOtp('login')}
                disabled={!email || isLoading}
                className="w-full bg-[#FF91A4] hover:bg-[#FF69B4] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-2xl transition-all transform hover:scale-105 active:scale-95 disabled:transform-none"
              >
                {isLoading ? 'Sending...' : 'Send OTP'}
              </button>

              <div className="text-center">
                <button
                  onClick={() => {
                    setCurrentPage('signup');
                    navigate('/signup');
                  }}
                  className="text-[#FF91A4] hover:text-[#FF69B4] font-medium"
                >
                  Don't have an account? Sign up
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Signup Page
  if (currentPage === 'signup') {
    return (
      <div className="h-screen heart-background flex items-center justify-center p-3 sm:p-4 overflow-hidden">
        <span className="heart-decoration">💕</span>
        <span className="heart-decoration">❤️</span>
        <span className="heart-decoration">💗</span>
        <span className="heart-decoration">💝</span>
        <span className="heart-decoration">❤️</span>
        <span className="heart-decoration">💓</span>
        <div className="decoration-circle"></div>
        <div className="decoration-circle"></div>
        <div className="w-full max-w-md relative z-10">

          <div className="text-center mb-4 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-black mb-2">Sign Up</h1>
            <p className="text-sm sm:text-base text-gray-600">Create your account</p>
          </div>

          <div className="bg-white rounded-3xl shadow-lg p-5 sm:p-8">
            <div className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-[#FF91A4] focus:outline-none transition-colors text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-[#FF91A4] focus:outline-none transition-colors text-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter your phone number"
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-[#FF91A4] focus:outline-none transition-colors text-black"
                  />
                </div>
              </div>

              <button
                onClick={() => handleSendOtp('signup')}
                disabled={!name || !email || !phone || isLoading}
                className="w-full bg-[#FF91A4] hover:bg-[#FF69B4] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-2xl transition-all transform hover:scale-105 active:scale-95 disabled:transform-none"
              >
                {isLoading ? 'Sending...' : 'Send OTP'}
              </button>

              <div className="text-center">
                <button
                  onClick={() => {
                    setCurrentPage('login');
                    navigate('/login');
                  }}
                  className="text-[#FF91A4] hover:text-[#FF69B4] font-medium"
                >
                  Already have an account? Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // OTP Verification Page
  if (currentPage === 'login-otp' || currentPage === 'signup-otp') {
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
              const prevPage = currentPage === 'login-otp' ? 'login' : 'signup';
              setCurrentPage(prevPage);
              navigate(`/${prevPage}`);
            }}
            className="flex items-center text-gray-600 hover:text-black mb-4 sm:mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>

          <div className="text-center mb-4 sm:mb-8">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#FFE4E1] rounded-full mx-auto mb-3 sm:mb-4 flex items-center justify-center">
              <Mail className="w-6 h-6 sm:w-8 sm:h-8 text-[#FF91A4]" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-black mb-2">Verify OTP</h1>
            <p className="text-sm sm:text-base text-gray-600">
              We've sent a code to<br />
              <span className="font-medium text-black">{email || phone}</span>
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
                <button className="text-gray-600 hover:text-black font-medium text-sm">
                  Didn't receive code? <span className="text-[#FF91A4]">Resend</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success Page
  if (currentPage === 'success') {
    const handleContinue = () => {
      const authType = localStorage.getItem('authType');
      
      if (authType === 'signup') {
        // After signup, always go to onboarding
        localStorage.removeItem('authType');
        navigate('/onboarding');
      } else {
        // After login, check onboarding and profile setup status
        const onboardingData = localStorage.getItem('onboardingData');
        const profileSetup = localStorage.getItem('profileSetup');
        
        if (onboardingData) {
          try {
            const parsed = JSON.parse(onboardingData);
            // Check if onboarding is completed
            if (parsed.completed && parsed.currentStep >= 7) {
              // Onboarding completed, check profile setup
              if (profileSetup) {
                try {
                  const profileData = JSON.parse(profileSetup);
                  // Check if profile has at least 1 photo
                  if (profileData.photos && profileData.photos.length > 0) {
                    // Profile setup complete, go to discover feed
                    navigate('/discover');
                  } else {
                    // Profile setup incomplete, go to profile setup
                    navigate('/profile-setup');
                  }
                } catch (e) {
                  // Error parsing profile, go to profile setup
                  navigate('/profile-setup');
                }
              } else {
                // No profile setup data, go to profile setup
                navigate('/profile-setup');
              }
            } else {
              // Onboarding incomplete, go to onboarding
              navigate('/onboarding');
            }
          } catch (e) {
            // If error parsing, assume onboarding not done
            navigate('/onboarding');
          }
        } else {
          // No onboarding data, go to onboarding
          navigate('/onboarding');
        }
        localStorage.removeItem('authType');
      }
    };

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
          <div className="w-24 h-24 bg-green-100 rounded-full mx-auto mb-6 flex items-center justify-center">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-black mb-3">Success!</h1>
          <p className="text-gray-600 mb-8">
            Your account has been verified successfully
          </p>
          <button
            onClick={handleContinue}
            className="bg-[#FF91A4] hover:bg-[#FF69B4] text-white font-semibold py-4 px-8 rounded-2xl transition-all transform hover:scale-105 active:scale-95"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }
}