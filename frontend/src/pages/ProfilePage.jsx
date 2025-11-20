import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Edit2, Settings, Shield, Lock, Bell, Eye, Crown, Heart, 
  UserCircle, Users, Sparkles, MessageCircle, MapPin,
  CheckCircle, XCircle, HelpCircle, BookOpen, GraduationCap,
  Languages, Coffee, Baby, Cigarette, Briefcase, User, ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockProfiles } from '../data/mockProfiles';

export default function ProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userProfile, setUserProfile] = useState(null);
  const [onboardingData, setOnboardingData] = useState(null);
  const [profileSetup, setProfileSetup] = useState(null);

  useEffect(() => {
    // Load user profile data
    const savedOnboarding = localStorage.getItem('onboardingData');
    const savedProfileSetup = localStorage.getItem('profileSetup');
    
    if (savedOnboarding) {
      try {
        const parsed = JSON.parse(savedOnboarding);
        setOnboardingData(parsed);
      } catch (e) {
        console.error('Error loading onboarding data:', e);
      }
    }
    
    if (savedProfileSetup) {
      try {
        const parsed = JSON.parse(savedProfileSetup);
        setProfileSetup(parsed);
      } catch (e) {
        console.error('Error loading profile setup:', e);
      }
    }
  }, []);

  // Format dealbreakers for display
  const formatDealbreaker = (key, value) => {
    if (!value) return null;
    const labels = {
      kids: {
        'want-kids': 'Want kids',
        'dont-want-kids': "Don't want kids",
        'have-kids': 'Have kids',
        'not-sure': "Not sure"
      },
      smoking: {
        'non-smoker': 'Never',
        'social-smoker': 'Socially',
        'smoker': 'Yes',
        'prefer-non-smoker': 'Prefer non-smoker'
      },
      pets: {
        'have-pets': 'Have pets',
        'love-pets': 'Love pets',
        'not-interested': "Don't have pets"
      },
      drinking: {
        'never': 'Never',
        'occasionally': 'Occasionally',
        'socially': 'Socially',
        'regularly': 'Regularly'
      }
    };
    return labels[key]?.[value] || value;
  };

  // Format education
  const formatEducation = (edu) => {
    if (!edu) return null;
    const labels = {
      'high-school': 'High school',
      'diploma': 'Diploma',
      'bachelors': "Bachelor's degree",
      'masters': "Master's degree",
      'phd': 'PhD'
    };
    return labels[edu] || edu;
  };



  if (!onboardingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFF0F5] via-[#FFE4E1] to-[#FFF0F5] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-[#FF91A4] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#212121] font-medium">Loading profile...</p>
        </motion.div>
      </div>
    );
  }

  const step1 = onboardingData.step1 || {};
  const step2 = onboardingData.step2 || {};
  const step3 = onboardingData.step3 || {};
  const step4 = onboardingData.step4 || {};
  const step5 = onboardingData.step5 || {};
  const step6 = onboardingData.step6 || {};

  // Calculate profile completion percentage
  const calculateProfileCompletion = () => {
    let completedFields = 0;
    let totalFields = 0;

    // Step 1: Basic Info (5 fields)
    totalFields += 5;
    if (step1.name) completedFields++;
    if (step1.dob) completedFields++;
    if (step1.gender) completedFields++;
    if (step1.orientation) completedFields++;
    if (step1.lookingFor) completedFields++;

    // Step 2: Location (1 field)
    totalFields += 1;
    if (step2?.city) completedFields++;

    // Step 3: Interests (1 field - at least 3 interests)
    totalFields += 1;
    if (step3?.interests && step3.interests.length >= 3) completedFields++;

    // Step 4: Personality (8 fields)
    totalFields += 8;
    const personality = step4?.personality || {};
    if (personality.social) completedFields++;
    if (personality.planning) completedFields++;
    if (personality.romantic) completedFields++;
    if (personality.morning) completedFields++;
    if (personality.homebody) completedFields++;
    if (personality.serious) completedFields++;
    if (personality.decision) completedFields++;
    if (personality.communication) completedFields++;

    // Step 5: Dealbreakers (5 fields)
    totalFields += 5;
    const dealbreakers = step5?.dealbreakers || {};
    if (dealbreakers.kids) completedFields++;
    if (dealbreakers.smoking) completedFields++;
    if (dealbreakers.pets) completedFields++;
    if (dealbreakers.drinking) completedFields++;
    if (dealbreakers.religion) completedFields++;

    // Step 6: Optional (3 fields)
    totalFields += 3;
    const optional = step6?.optional || {};
    if (optional.education) completedFields++;
    if (optional.profession) completedFields++;
    if (optional.languages && optional.languages.length > 0) completedFields++;

    // Photos (1 field - at least 4 photos)
    totalFields += 1;
    if (profileSetup?.photos && profileSetup.photos.length >= 4) completedFields++;

    // Bio (1 field)
    totalFields += 1;
    if (profileSetup?.bio && profileSetup.bio.trim().length > 0) completedFields++;

    return Math.round((completedFields / totalFields) * 100);
  };

  const profileCompletion = calculateProfileCompletion();

  // Get border color based on completion percentage
  const getBorderColor = (percentage) => {
    if (percentage < 25) return '#EF4444'; // Red
    if (percentage < 50) return '#FF6B6B'; // Light Red/Pink
    if (percentage < 75) return '#FF91A4'; // Pink
    if (percentage < 90) return '#FF69B4'; // Hot Pink
    return '#E91E63'; // Dark Pink
  };

  const borderColor = getBorderColor(profileCompletion);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF0F5] via-[#FFE4E1] to-[#FFF0F5] flex flex-col relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-[#FF91A4]/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#FF69B4]/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

      {/* Left Sidebar Navigation - Desktop Only (Instagram Style) */}
      <div className="hidden md:flex fixed left-0 top-0 bottom-0 w-16 bg-white border-r border-[#E0E0E0] z-30 flex-col items-center justify-center py-4">
        <div className="flex flex-col items-center gap-2">
          {/* Profile */}
          <motion.button
            onClick={() => navigate('/profile')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center w-12 h-12 transition-colors relative group"
          >
            <UserCircle className={`w-6 h-6 ${location.pathname === '/profile' ? 'text-[#FF91A4]' : 'text-[#212121]'}`} />
            {location.pathname === '/profile' && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#FF91A4] rounded-r-full"></div>
            )}
          </motion.button>

          {/* Discover */}
          <motion.button
            onClick={() => navigate('/discover')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center w-12 h-12 transition-colors relative group"
          >
            <Sparkles className={`w-6 h-6 ${location.pathname === '/discover' ? 'text-[#FF91A4]' : 'text-[#212121]'}`} />
            {location.pathname === '/discover' && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#FF91A4] rounded-r-full"></div>
            )}
          </motion.button>

          {/* People */}
          <motion.button
            onClick={() => navigate('/people')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center w-12 h-12 transition-colors relative group"
          >
            <Users className={`w-6 h-6 ${location.pathname === '/people' ? 'text-[#FF91A4]' : 'text-[#212121]'}`} />
            {location.pathname === '/people' && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#FF91A4] rounded-r-full"></div>
            )}
          </motion.button>

          {/* Liked You */}
          <motion.button
            onClick={() => navigate('/liked-you')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center w-12 h-12 transition-colors relative group"
          >
            <Heart className={`w-6 h-6 ${location.pathname === '/liked-you' ? 'text-[#FF91A4] fill-[#FF91A4]' : 'text-[#212121]'}`} />
            {location.pathname === '/liked-you' && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#FF91A4] rounded-r-full"></div>
            )}
          </motion.button>

          {/* Chats */}
          <motion.button
            onClick={() => navigate('/chats')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center w-12 h-12 transition-colors relative group"
          >
            <MessageCircle className={`w-6 h-6 ${location.pathname === '/chats' ? 'text-[#FF91A4]' : 'text-[#212121]'}`} />
            {location.pathname === '/chats' && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#FF91A4] rounded-r-full"></div>
            )}
          </motion.button>
        </div>
      </div>

      {/* Enhanced Header - Fixed */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-30 bg-gradient-to-b from-white via-white/98 to-white/95 backdrop-blur-lg border-b border-[#FFB6C1]/30 shadow-lg"
      >
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#FF91A4] to-[#FF69B4] bg-clip-text text-transparent">
                My Profile
              </h1>
              <p className="text-xs sm:text-sm text-[#757575] font-medium">Manage your profile & settings</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/settings')}
                className="p-2.5 hover:bg-[#FFE4E1] rounded-xl transition-colors"
              >
                <Settings className="w-5 h-5 text-[#212121]" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content - Scrollable with padding for fixed header */}
      <div className="flex-1 overflow-y-auto scrollbar-hide pb-24 relative z-10 pt-24 sm:pt-28 md:ml-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
          {/* Enhanced Profile Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-white to-[#FFF0F5] rounded-3xl shadow-xl p-6 sm:p-8 mb-6 border border-[#FFB6C1]/20"
          >
            {/* Profile Photo */}
            <div className="flex flex-col items-center mb-6">
              <motion.div 
                className="relative cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300 }}
                onClick={() => {
                  if (profileSetup?.photos && profileSetup.photos.length > 0) {
                    navigate('/edit-profile-info', { state: { activeTab: 'preview' } });
                  }
                }}
              >
                {/* Circular Progress Ring */}
                <div className="relative w-28 h-28 sm:w-32 sm:h-32">
                  <svg className="absolute inset-0 transform rotate-90" width="100%" height="100%" viewBox="0 0 100 100">
                    {/* Background circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#E5E7EB"
                      strokeWidth="4"
                    />
                    {/* Progress circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke={borderColor}
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 45 * (profileCompletion / 100)} ${2 * Math.PI * 45}`}
                      className="transition-all duration-500 ease-out"
                      style={{ 
                        strokeDashoffset: 0,
                      }}
                    />
                  </svg>
                  {/* Profile Picture */}
                  <div className="absolute inset-2 rounded-full overflow-hidden">
                    {profileSetup?.photos && profileSetup.photos.length > 0 ? (
                      <img
                        src={profileSetup.photos[0].preview || `https://ui-avatars.com/api/?name=${step1.name || 'User'}&background=FF1744&color=fff&size=200`}
                        alt="Profile"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                        <UserCircle className="w-12 h-12 sm:w-14 sm:h-14 text-[#FF91A4]" />
                      </div>
                    )}
                  </div>
                  {/* Percentage Text */}
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white rounded-full px-2.5 py-1 shadow-lg border-2" style={{ borderColor: borderColor }}>
                    <span className="text-xs font-bold" style={{ color: borderColor }}>
                      {profileCompletion}%
                    </span>
                  </div>
                </div>
                {profileSetup?.verified && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-br from-[#4CAF50] to-[#2E7D32] rounded-full flex items-center justify-center border-[3px] border-white shadow-lg z-10"
                  >
                    <CheckCircle className="w-5 h-5 text-white" />
                  </motion.div>
                )}
              </motion.div>
              <motion.h2 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[#FF91A4] to-[#FF69B4] bg-clip-text text-transparent mt-4"
              >
                {step1.name || 'User'}{step1.age ? `, ${step1.age}` : ''}
              </motion.h2>
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                onClick={() => navigate('/edit-profile-info')}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="mt-4 px-6 py-2.5 bg-gradient-to-r from-[#FF91A4] to-[#FF69B4] hover:from-[#FF69B4] hover:to-[#FF91A4] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all text-sm sm:text-base flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Complete Profile
              </motion.button>
              {step2?.location?.city && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="flex items-center gap-2 text-[#757575] text-sm sm:text-base mt-2"
                >
                  <MapPin className="w-4 h-4 text-[#FF91A4]" />
                  <span>{step2.location.city}</span>
                </motion.div>
              )}
            </div>

            {/* Bio */}
            {profileSetup?.bio && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-6"
              >
                <h3 className="text-base font-bold text-[#212121] mb-3 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#FF91A4]" />
                  About Me
                </h3>
                <p className="text-base text-[#212121] leading-relaxed bg-white/50 rounded-xl p-4 border border-[#FFB6C1]/20">
                  {profileSetup.bio}
                </p>
              </motion.div>
            )}

            {/* About Me Badges */}
            {(step6?.optional?.education || step5?.dealbreakers?.drinking || step5?.dealbreakers?.smoking || step5?.dealbreakers?.kids || step5?.dealbreakers?.pets) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="mb-6"
              >
                <h3 className="text-base font-bold text-[#212121] mb-3 flex items-center gap-2">
                  <User className="w-5 h-5 text-[#FF91A4]" />
                  Lifestyle & Details
                </h3>
                <div className="flex flex-wrap gap-2">
                  {step6?.optional?.education && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 }}
                      className="px-4 py-2 bg-gradient-to-r from-[#FFE4E1] to-[#FFF0F5] text-[#212121] rounded-full text-sm font-semibold border border-[#FFB6C1]/30 flex items-center gap-2"
                    >
                      <GraduationCap className="w-4 h-4 text-[#FF91A4]" />
                      {formatEducation(step6.optional.education)}
                    </motion.span>
                  )}
                  {step6?.optional?.profession && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.42 }}
                      className="px-4 py-2 bg-gradient-to-r from-[#FFE4E1] to-[#FFF0F5] text-[#212121] rounded-full text-sm font-semibold border border-[#FFB6C1]/30 flex items-center gap-2"
                    >
                      <Briefcase className="w-4 h-4 text-[#FF91A4]" />
                      {step6.optional.profession}
                    </motion.span>
                  )}
                  {step5?.dealbreakers?.drinking && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.44 }}
                      className="px-4 py-2 bg-gradient-to-r from-[#FFE4E1] to-[#FFF0F5] text-[#212121] rounded-full text-sm font-semibold border border-[#FFB6C1]/30 flex items-center gap-2"
                    >
                      <Coffee className="w-4 h-4 text-[#FF91A4]" />
                      {formatDealbreaker('drinking', step5.dealbreakers.drinking)}
                    </motion.span>
                  )}
                  {step5?.dealbreakers?.smoking && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.46 }}
                      className="px-4 py-2 bg-gradient-to-r from-[#FFE4E1] to-[#FFF0F5] text-[#212121] rounded-full text-sm font-semibold border border-[#FFB6C1]/30 flex items-center gap-2"
                    >
                      <Cigarette className="w-4 h-4 text-[#FF91A4]" />
                      {formatDealbreaker('smoking', step5.dealbreakers.smoking)}
                    </motion.span>
                  )}
                  {step5?.dealbreakers?.kids && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.48 }}
                      className="px-4 py-2 bg-gradient-to-r from-[#FFE4E1] to-[#FFF0F5] text-[#212121] rounded-full text-sm font-semibold border border-[#FFB6C1]/30 flex items-center gap-2"
                    >
                      <Baby className="w-4 h-4 text-[#FF91A4]" />
                      {formatDealbreaker('kids', step5.dealbreakers.kids)}
                    </motion.span>
                  )}
                  {step5?.dealbreakers?.pets && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 }}
                      className="px-4 py-2 bg-gradient-to-r from-[#FFE4E1] to-[#FFF0F5] text-[#212121] rounded-full text-sm font-semibold border border-[#FFB6C1]/30"
                    >
                      {formatDealbreaker('pets', step5.dealbreakers.pets)}
                    </motion.span>
                  )}
                  {step6?.optional?.languages && step6.optional.languages.length > 0 && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.52 }}
                      className="px-4 py-2 bg-gradient-to-r from-[#FFE4E1] to-[#FFF0F5] text-[#212121] rounded-full text-sm font-semibold border border-[#FFB6C1]/30 flex items-center gap-2"
                    >
                      <Languages className="w-4 h-4 text-[#FF91A4]" />
                      {step6.optional.languages.join(', ')}
                    </motion.span>
                  )}
                </div>
              </motion.div>
            )}

            {/* Interests */}
            {step3?.interests && step3.interests.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h3 className="text-base font-bold text-[#212121] mb-3 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-[#FF91A4]" />
                  My Interests
                </h3>
                <div className="flex flex-wrap gap-2">
                  {step3.interests.map((interest, idx) => (
                    <motion.span
                      key={interest}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.45 + idx * 0.03 }}
                      className="px-4 py-2 bg-gradient-to-r from-[#FFE4E1] to-[#FFF0F5] text-[#FF91A4] rounded-full text-sm font-semibold border border-[#FFB6C1]/30"
                    >
                      {interest}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Options Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="space-y-4"
          >
            {/* Enhanced Premium/Subscription */}
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-br from-[#FFD700] via-[#FFA500] to-[#FF8C00] rounded-2xl p-5 sm:p-6 shadow-xl cursor-pointer border border-[#FFD700]/30 relative overflow-hidden"
              onClick={() => {
                navigate('/premium');
              }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <motion.div 
                    whileHover={{ rotate: 15, scale: 1.1 }}
                    className="w-14 h-14 bg-white/25 rounded-2xl flex items-center justify-center shadow-lg"
                  >
                    <Crown className="w-7 h-7 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-1">Go Premium</h3>
                    <p className="text-sm text-white/95 font-medium">Unlimited likes & exclusive features</p>
                  </div>
                </div>
                <motion.div
                  whileHover={{ x: 5 }}
                  className="text-white text-2xl font-bold"
                >
                  →
                </motion.div>
              </div>
            </motion.div>

          </motion.div>
        </div>
      </div>

      {/* Bottom Navigation Bar - Mobile Only */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t-2 border-[#FFB6C1]/30 shadow-lg">
        <div className="flex items-center justify-around px-2 py-2">
          {/* Profile */}
          <motion.button
            onClick={() => navigate('/profile')}
            whileTap={{ scale: 0.9 }}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors"
          >
            <UserCircle className={`w-5 h-5 ${location.pathname === '/profile' ? 'text-[#FF91A4]' : 'text-[#212121]'}`} />
            <span className={`text-xs font-medium ${location.pathname === '/profile' ? 'text-[#FF91A4]' : 'text-[#212121]'}`}>
              Profile
            </span>
          </motion.button>

          {/* Discover */}
          <motion.button
            onClick={() => navigate('/discover')}
            whileTap={{ scale: 0.9 }}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors"
          >
            <Sparkles className={`w-5 h-5 ${location.pathname === '/discover' ? 'text-[#FF91A4]' : 'text-[#212121]'}`} />
            <span className={`text-xs font-medium ${location.pathname === '/discover' ? 'text-[#FF91A4]' : 'text-[#212121]'}`}>
              Discover
            </span>
          </motion.button>

          {/* People */}
          <motion.button
            onClick={() => navigate('/discover')}
            whileTap={{ scale: 0.9 }}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors relative"
          >
            <Users className={`w-5 h-5 ${location.pathname === '/discover' ? 'text-[#FF91A4]' : 'text-[#212121]'}`} />
            <span className={`text-xs font-medium ${location.pathname === '/discover' ? 'text-[#FF91A4]' : 'text-[#212121]'}`}>
              People
            </span>
          </motion.button>

          {/* Liked You */}
          <motion.button
            onClick={() => navigate('/liked-you')}
            whileTap={{ scale: 0.9 }}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors relative"
          >
            <Heart className={`w-5 h-5 ${location.pathname === '/liked-you' ? 'text-[#FF91A4]' : 'text-[#212121]'}`} />
            <span className={`text-xs font-medium ${location.pathname === '/liked-you' ? 'text-[#FF91A4]' : 'text-[#212121]'}`}>
              Liked You
            </span>
          </motion.button>

          {/* Chats */}
          <motion.button
            onClick={() => navigate('/chats')}
            whileTap={{ scale: 0.9 }}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors relative"
          >
            <MessageCircle className={`w-5 h-5 ${location.pathname === '/chats' ? 'text-[#FF91A4]' : 'text-[#212121]'}`} />
            <span className={`text-xs font-medium ${location.pathname === '/chats' ? 'text-[#FF91A4]' : 'text-[#212121]'}`}>
              Chats
            </span>
          </motion.button>
        </div>
      </div>

    </div>
  );
}

