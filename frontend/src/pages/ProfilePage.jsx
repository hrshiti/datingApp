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
import { profileService } from '../services/profileService';

export default function ProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileComplete, setIsProfileComplete] = useState(false);

  useEffect(() => {
    // Load user profile data from backend API
    const loadProfileFromBackend = async () => {
      try {
        setIsLoading(true);
        console.log('📥 Loading profile from backend API...');
        const response = await profileService.getMyProfile();
        
        if (response.success && response.profile) {
          const profile = response.profile;
          console.log('✅ Profile loaded from backend:', profile);
          setUserProfile(profile);
          
          // Check if profile is complete
          try {
            const completionResponse = await profileService.checkProfileCompletion();
            if (completionResponse.success && completionResponse.isComplete) {
              setIsProfileComplete(true);
            }
          } catch (error) {
            console.error('Error checking profile completion:', error);
          }
        } else {
          console.log('⚠️ No profile found in response');
        }
      } catch (error) {
        console.error('❌ Error loading profile from backend:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProfileFromBackend();
  }, [location.pathname]);

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



  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E3F2FD] via-[#BBDEFB] to-[#E3F2FD] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-[#64B5F6] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#616161] font-medium">Loading profile...</p>
        </motion.div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E3F2FD] via-[#BBDEFB] to-[#E3F2FD] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <p className="text-[#616161] font-medium mb-4">No profile found</p>
          <button
            onClick={() => navigate('/basic-info')}
            className="px-6 py-3 bg-[#64B5F6] hover:bg-[#42A5F5] text-white rounded-xl font-semibold transition-colors"
          >
            Create Profile
          </button>
        </motion.div>
      </div>
    );
  }

  // Extract data from backend profile
  const step1 = {
    name: userProfile.name || '',
    dob: userProfile.dob || '',
    age: userProfile.age || null,
    gender: userProfile.gender || '',
    customGender: userProfile.customGender || '',
    orientation: userProfile.orientation || '',
    customOrientation: userProfile.customOrientation || '',
    lookingFor: userProfile.lookingFor || []
  };

  const step2 = {
    city: userProfile.location?.city || '',
    location: userProfile.location || null,
    ageRange: userProfile.ageRange ? {
      min: userProfile.ageRange.min || 18,
      max: (userProfile.ageRange.max && userProfile.ageRange.max !== 100) ? userProfile.ageRange.max : ''
    } : { min: 18, max: '' },
    distancePref: userProfile.distancePref || 25
  };

  const step3 = {
    interests: userProfile.interests || []
  };

  const step4 = {
    personality: userProfile.personality || {}
  };

  const step5 = {
    dealbreakers: userProfile.dealbreakers || {}
  };

  const step6 = {
    prompts: userProfile.prompts || [],
    optional: userProfile.optional || {}
  };

  const profileSetup = {
    photos: userProfile.photos ? userProfile.photos.map(photo => ({
      ...photo,
      preview: photo.url || photo.preview,
      id: photo._id || photo.id
    })) : [],
    bio: userProfile.bio || '',
    verified: userProfile.isVerified || false
  };

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

  // Get border color based on completion percentage (Light Blue theme)
  const getBorderColor = (percentage) => {
    if (percentage < 25) return '#90CAF9'; // Light Blue
    if (percentage < 50) return '#64B5F6'; // Medium Light Blue
    if (percentage < 75) return '#42A5F5'; // Blue
    if (percentage < 90) return '#2196F3'; // Deeper Blue
    return '#1976D2'; // Dark Blue
  };

  const borderColor = getBorderColor(profileCompletion);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] via-[#E8ECF1] to-[#F5F7FA] flex flex-col relative overflow-hidden">
      {/* Premium Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-[#64B5F6]/8 to-transparent rounded-full blur-3xl -translate-x-1/3 -translate-y-1/3"></div>
      <div className="absolute bottom-0 right-0 w-[700px] h-[700px] bg-gradient-to-tl from-[#42A5F5]/8 to-transparent rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-[#90CAF9]/5 to-transparent rounded-full blur-3xl"></div>

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
            <UserCircle className={`w-6 h-6 ${location.pathname === '/profile' ? 'text-[#64B5F6]' : 'text-[#616161]'}`} />
            {location.pathname === '/profile' && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#64B5F6] rounded-r-full"></div>
            )}
          </motion.button>

          {/* Discover */}
          <motion.button
            onClick={() => navigate('/discover')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center w-12 h-12 transition-colors relative group"
          >
            <Sparkles className={`w-6 h-6 ${location.pathname === '/discover' ? 'text-[#64B5F6]' : 'text-[#616161]'}`} />
            {location.pathname === '/discover' && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#64B5F6] rounded-r-full"></div>
            )}
          </motion.button>

          {/* People */}
          <motion.button
            onClick={() => navigate('/people')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center w-12 h-12 transition-colors relative group"
          >
            <Users className={`w-6 h-6 ${location.pathname === '/people' ? 'text-[#64B5F6]' : 'text-[#616161]'}`} />
            {location.pathname === '/people' && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#64B5F6] rounded-r-full"></div>
            )}
          </motion.button>

          {/* Liked You */}
          <motion.button
            onClick={() => navigate('/liked-you')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center w-12 h-12 transition-colors relative group"
          >
            <Heart className={`w-6 h-6 ${location.pathname === '/liked-you' ? 'text-[#64B5F6] fill-[#64B5F6]' : 'text-[#616161]'}`} />
            {location.pathname === '/liked-you' && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#64B5F6] rounded-r-full"></div>
            )}
          </motion.button>

          {/* Chats */}
          <motion.button
            onClick={() => navigate('/chats')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center w-12 h-12 transition-colors relative group"
          >
            <MessageCircle className={`w-6 h-6 ${location.pathname === '/chats' ? 'text-[#64B5F6]' : 'text-[#616161]'}`} />
            {location.pathname === '/chats' && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#64B5F6] rounded-r-full"></div>
            )}
          </motion.button>
        </div>
      </div>

      {/* Premium Header - Fixed with Glassmorphism */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-30 backdrop-blur-xl bg-white/80 border-b border-[#E0E0E0]/50 shadow-[0_8px_32px_rgba(0,0,0,0.06)]"
      >
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-5 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="w-12 h-12 bg-gradient-to-br from-[#64B5F6] to-[#42A5F5] rounded-2xl flex items-center justify-center shadow-lg shadow-[#64B5F6]/20"
              >
                <UserCircle className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] tracking-tight">
                  My Profile
                </h1>
                <p className="text-xs sm:text-sm text-[#757575] font-medium mt-0.5">Manage your profile & settings</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                onClick={() => navigate('/settings')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 hover:bg-[#F5F5F5] rounded-xl transition-all duration-200"
              >
                <Settings className="w-5 h-5 text-[#616161]" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content - Scrollable with padding for fixed header */}
      <div className="flex-1 overflow-y-auto scrollbar-hide pb-24 relative z-10 pt-24 sm:pt-28 md:ml-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
          {/* Premium Profile Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.08)] p-8 sm:p-10 mb-6 border border-[#E8E8E8] relative overflow-hidden"
          >
            {/* Premium gradient overlay */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#64B5F6]/5 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            {/* Profile Photo - Premium Design */}
            <div className="flex flex-col items-center mb-8 relative z-10">
              <motion.div 
                className="relative"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {/* Circular Progress Ring - Premium */}
                <div className="relative w-32 h-32 sm:w-36 sm:h-36">
                  <svg className="absolute inset-0 transform rotate-90" width="100%" height="100%" viewBox="0 0 100 100">
                    {/* Background circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#E0E0E0"
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
                  {/* Profile Picture - Premium Frame */}
                  <div className="absolute inset-3 rounded-full overflow-hidden ring-4 ring-white shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
                    {profileSetup?.photos && profileSetup.photos.length > 0 ? (
                      <img
                        src={profileSetup.photos[0].url || profileSetup.photos[0].preview || `https://ui-avatars.com/api/?name=${step1.name || 'User'}&background=FF1744&color=fff&size=200`}
                        alt="Profile"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-[#E3F2FD] to-[#BBDEFB] flex items-center justify-center">
                        <UserCircle className="w-14 h-14 sm:w-16 sm:h-16 text-[#64B5F6]" />
                      </div>
                    )}
                  </div>
                  {/* Premium Edit Button */}
                  <motion.button
                    onClick={() => {
                      navigate('/edit-profile-info', { 
                        state: { activeTab: 'edit', timestamp: Date.now() },
                        replace: false
                      });
                    }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                    className="absolute top-1 right-1 w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-white to-[#F5F5F5] rounded-full flex items-center justify-center shadow-[0_4px_16px_rgba(100,181,246,0.3)] border-2 border-[#64B5F6] z-20 cursor-pointer backdrop-blur-sm"
                  >
                    <Edit2 className="w-5 h-5 sm:w-6 sm:h-6 text-[#64B5F6]" />
                    {/* Premium indicator dot */}
                    <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-gradient-to-br from-[#FF6B6B] to-[#EE5A6F] rounded-full border-2 border-white shadow-lg"></div>
                  </motion.button>
                  {/* Premium Percentage Badge */}
                  {profileCompletion < 100 && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3, type: "spring" }}
                      className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white rounded-full px-4 py-2 shadow-[0_8px_24px_rgba(0,0,0,0.12)] border-2 flex items-center gap-2 backdrop-blur-sm" 
                      style={{ borderColor: borderColor }}
                    >
                      <span className="text-sm font-bold tracking-tight" style={{ color: borderColor }}>
                        {profileCompletion}%
                      </span>
                      <span className="text-[10px] font-semibold text-[#757575] uppercase tracking-wider">
                        Complete
                      </span>
                    </motion.div>
                  )}
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
                className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] mt-6 tracking-tight"
              >
                {step1.name || 'User'}{step1.age ? `, ${step1.age}` : ''}
              </motion.h2>
              {!isProfileComplete && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                onClick={() => navigate('/edit-profile-info', { 
                  state: { showOnlyIncomplete: true, activeTab: 'edit', timestamp: Date.now() },
                  replace: false
                })}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="mt-5 px-8 py-3.5 bg-gradient-to-r from-[#64B5F6] to-[#42A5F5] hover:from-[#42A5F5] hover:to-[#2196F3] text-white font-semibold rounded-2xl shadow-[0_8px_24px_rgba(100,181,246,0.35)] hover:shadow-[0_12px_32px_rgba(100,181,246,0.45)] transition-all duration-300 text-sm sm:text-base flex items-center gap-2.5"
              >
                <Edit2 className="w-4 h-4" />
                Complete Profile
              </motion.button>
              )}
              {step2?.location?.city && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="flex items-center gap-2.5 text-[#757575] text-sm sm:text-base mt-3"
                >
                  <div className="w-5 h-5 rounded-full bg-[#E3F2FD] flex items-center justify-center">
                    <MapPin className="w-3.5 h-3.5 text-[#64B5F6]" />
                  </div>
                  <span className="font-medium">{step2.location.city}</span>
                </motion.div>
              )}
            </div>

            {/* Bio - Premium Card */}
            {profileSetup?.bio && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-8 relative z-10"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E3F2FD] to-[#BBDEFB] flex items-center justify-center shadow-sm">
                    <BookOpen className="w-5 h-5 text-[#64B5F6]" />
                  </div>
                  <h3 className="text-lg font-bold text-[#1A1A1A] tracking-tight">About Me</h3>
                </div>
                <div className="bg-gradient-to-br from-white to-[#FAFBFC] rounded-2xl p-6 border border-[#E8E8E8] shadow-sm">
                  <p className="text-[15px] text-[#616161] leading-relaxed font-medium">
                    {profileSetup.bio}
                  </p>
                </div>
              </motion.div>
            )}

            {/* About Me Badges - Premium */}
            {(step6?.optional?.education || step5?.dealbreakers?.drinking || step5?.dealbreakers?.smoking || step5?.dealbreakers?.kids || step5?.dealbreakers?.pets) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="mb-8 relative z-10"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E3F2FD] to-[#BBDEFB] flex items-center justify-center shadow-sm">
                    <User className="w-5 h-5 text-[#64B5F6]" />
                  </div>
                  <h3 className="text-lg font-bold text-[#1A1A1A] tracking-tight">Lifestyle & Details</h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  {step6?.optional?.education && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4, type: "spring" }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      className="px-5 py-2.5 bg-gradient-to-br from-white to-[#F5F7FA] text-[#616161] rounded-xl text-sm font-semibold border border-[#E0E0E0] flex items-center gap-2.5 shadow-sm hover:shadow-md transition-all"
                    >
                      <GraduationCap className="w-4 h-4 text-[#64B5F6]" />
                      {formatEducation(step6.optional.education)}
                    </motion.span>
                  )}
                  {step6?.optional?.profession && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.42, type: "spring" }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      className="px-5 py-2.5 bg-gradient-to-br from-white to-[#F5F7FA] text-[#616161] rounded-xl text-sm font-semibold border border-[#E0E0E0] flex items-center gap-2.5 shadow-sm hover:shadow-md transition-all"
                    >
                      <Briefcase className="w-4 h-4 text-[#64B5F6]" />
                      {step6.optional.profession}
                    </motion.span>
                  )}
                  {step5?.dealbreakers?.drinking && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.44, type: "spring" }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      className="px-5 py-2.5 bg-gradient-to-br from-white to-[#F5F7FA] text-[#616161] rounded-xl text-sm font-semibold border border-[#E0E0E0] flex items-center gap-2.5 shadow-sm hover:shadow-md transition-all"
                    >
                      <Coffee className="w-4 h-4 text-[#64B5F6]" />
                      {formatDealbreaker('drinking', step5.dealbreakers.drinking)}
                    </motion.span>
                  )}
                  {step5?.dealbreakers?.smoking && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.46, type: "spring" }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      className="px-5 py-2.5 bg-gradient-to-br from-white to-[#F5F7FA] text-[#616161] rounded-xl text-sm font-semibold border border-[#E0E0E0] flex items-center gap-2.5 shadow-sm hover:shadow-md transition-all"
                    >
                      <Cigarette className="w-4 h-4 text-[#64B5F6]" />
                      {formatDealbreaker('smoking', step5.dealbreakers.smoking)}
                    </motion.span>
                  )}
                  {step5?.dealbreakers?.kids && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.48, type: "spring" }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      className="px-5 py-2.5 bg-gradient-to-br from-white to-[#F5F7FA] text-[#616161] rounded-xl text-sm font-semibold border border-[#E0E0E0] flex items-center gap-2.5 shadow-sm hover:shadow-md transition-all"
                    >
                      <Baby className="w-4 h-4 text-[#64B5F6]" />
                      {formatDealbreaker('kids', step5.dealbreakers.kids)}
                    </motion.span>
                  )}
                  {step5?.dealbreakers?.pets && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5, type: "spring" }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      className="px-5 py-2.5 bg-gradient-to-br from-white to-[#F5F7FA] text-[#616161] rounded-xl text-sm font-semibold border border-[#E0E0E0] shadow-sm hover:shadow-md transition-all"
                    >
                      {formatDealbreaker('pets', step5.dealbreakers.pets)}
                    </motion.span>
                  )}
                  {step6?.optional?.languages && step6.optional.languages.length > 0 && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.52, type: "spring" }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      className="px-5 py-2.5 bg-gradient-to-br from-white to-[#F5F7FA] text-[#616161] rounded-xl text-sm font-semibold border border-[#E0E0E0] flex items-center gap-2.5 shadow-sm hover:shadow-md transition-all"
                    >
                      <Languages className="w-4 h-4 text-[#64B5F6]" />
                      {step6.optional.languages.join(', ')}
                    </motion.span>
                  )}
                </div>
              </motion.div>
            )}

            {/* Interests - Premium */}
            {step3?.interests && step3.interests.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="relative z-10"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E3F2FD] to-[#BBDEFB] flex items-center justify-center shadow-sm">
                    <Heart className="w-5 h-5 text-[#64B5F6]" />
                  </div>
                  <h3 className="text-lg font-bold text-[#1A1A1A] tracking-tight">My Interests</h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  {step3.interests.map((interest, idx) => (
                    <motion.span
                      key={interest}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.45 + idx * 0.03, type: "spring" }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      className="px-5 py-2.5 bg-gradient-to-br from-[#64B5F6] to-[#42A5F5] text-white rounded-xl text-sm font-semibold shadow-[0_4px_12px_rgba(100,181,246,0.3)] hover:shadow-[0_6px_16px_rgba(100,181,246,0.4)] transition-all"
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
            {/* Premium Subscription Card */}
            <motion.div
              whileHover={{ scale: 1.01, y: -4 }}
              whileTap={{ scale: 0.99 }}
              className="bg-gradient-to-br from-[#1A1A1A] via-[#2D2D2D] to-[#1A1A1A] rounded-3xl p-8 sm:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.3)] cursor-pointer border border-[#3A3A3A] relative overflow-hidden group"
              onClick={() => {
                navigate('/premium');
              }}
            >
              {/* Premium glow effect */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#64B5F6]/20 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-[#42A5F5]/15 to-transparent rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
              
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <motion.div 
                    whileHover={{ rotate: 12, scale: 1.1 }}
                    className="w-16 h-16 bg-gradient-to-br from-[#64B5F6] to-[#42A5F5] rounded-2xl flex items-center justify-center shadow-[0_8px_24px_rgba(100,181,246,0.4)]"
                  >
                    <Crown className="w-8 h-8 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight">Go Premium</h3>
                    <p className="text-sm text-white/80 font-medium">Unlimited likes & exclusive features</p>
                  </div>
                </div>
                <motion.div
                  whileHover={{ x: 8, scale: 1.1 }}
                  className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20"
                >
                  <span className="text-white text-xl font-bold">→</span>
                </motion.div>
              </div>
            </motion.div>

          </motion.div>
        </div>
      </div>

      {/* Bottom Navigation Bar - Mobile Only */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t-2 border-[#E0E0E0] shadow-lg">
        <div className="flex items-center justify-around px-2 py-2">
          {/* Profile */}
          <motion.button
            onClick={() => navigate('/profile')}
            whileTap={{ scale: 0.9 }}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors"
          >
            <UserCircle className={`w-5 h-5 ${location.pathname === '/profile' ? 'text-[#64B5F6]' : 'text-[#616161]'}`} />
            <span className={`text-xs font-medium ${location.pathname === '/profile' ? 'text-[#64B5F6]' : 'text-[#616161]'}`}>
              Profile
            </span>
          </motion.button>

          {/* Discover */}
          <motion.button
            onClick={() => navigate('/discover')}
            whileTap={{ scale: 0.9 }}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors"
          >
            <Sparkles className={`w-5 h-5 ${location.pathname === '/discover' ? 'text-[#64B5F6]' : 'text-[#616161]'}`} />
            <span className={`text-xs font-medium ${location.pathname === '/discover' ? 'text-[#64B5F6]' : 'text-[#616161]'}`}>
              Discover
            </span>
          </motion.button>

          {/* People */}
          <motion.button
            onClick={() => navigate('/people')}
            whileTap={{ scale: 0.9 }}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors relative"
          >
            <Users className={`w-5 h-5 ${location.pathname === '/people' ? 'text-[#64B5F6]' : 'text-[#616161]'}`} />
            <span className={`text-xs font-medium ${location.pathname === '/people' ? 'text-[#64B5F6]' : 'text-[#616161]'}`}>
              People
            </span>
          </motion.button>

          {/* Liked You */}
          <motion.button
            onClick={() => navigate('/liked-you')}
            whileTap={{ scale: 0.9 }}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors relative"
          >
            <Heart className={`w-5 h-5 ${location.pathname === '/liked-you' ? 'text-[#64B5F6]' : 'text-[#616161]'}`} />
            <span className={`text-xs font-medium ${location.pathname === '/liked-you' ? 'text-[#64B5F6]' : 'text-[#616161]'}`}>
              Liked You
            </span>
          </motion.button>

          {/* Chats */}
          <motion.button
            onClick={() => navigate('/chats')}
            whileTap={{ scale: 0.9 }}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors relative"
          >
            <MessageCircle className={`w-5 h-5 ${location.pathname === '/chats' ? 'text-[#64B5F6]' : 'text-[#616161]'}`} />
            <span className={`text-xs font-medium ${location.pathname === '/chats' ? 'text-[#64B5F6]' : 'text-[#616161]'}`}>
              Chats
            </span>
          </motion.button>
        </div>
      </div>

    </div>
  );
}

