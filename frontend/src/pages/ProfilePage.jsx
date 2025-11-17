import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Edit2, Settings, Shield, Lock, Bell, Eye, Crown, Heart, 
  UserCircle, Users, Sparkles, MessageCircle, MapPin, Camera,
  CheckCircle, XCircle, HelpCircle, LogOut
} from 'lucide-react';
import { motion } from 'framer-motion';
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

  const handleEditProfile = () => {
    navigate('/edit-profile');
  };

  const handleLogout = () => {
    // Clear all user data
    localStorage.removeItem('onboardingData');
    localStorage.removeItem('profileSetup');
    localStorage.removeItem('discoveryLikes');
    localStorage.removeItem('discoveryPasses');
    localStorage.removeItem('discoveryMatches');
    localStorage.removeItem('discoveryFilters');
    navigate('/login');
  };

  if (!onboardingData) {
    return (
      <div className="h-screen heart-background flex items-center justify-center">
        <div className="text-[#212121]">Loading...</div>
      </div>
    );
  }

  const step1 = onboardingData.step1 || {};
  const step2 = onboardingData.step2 || {};
  const step3 = onboardingData.step3 || {};
  const step4 = onboardingData.step4 || {};
  const step5 = onboardingData.step5 || {};
  const step6 = onboardingData.step6 || {};

  return (
    <div className="h-screen heart-background flex flex-col relative overflow-hidden">
      <span className="heart-decoration">💕</span>
      <span className="heart-decoration">💖</span>
      <span className="heart-decoration">💗</span>
      <span className="heart-decoration">💝</span>
      <span className="heart-decoration">❤️</span>
      <span className="heart-decoration">💓</span>
      <div className="decoration-circle"></div>
      <div className="decoration-circle"></div>

      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-20 bg-white/95 backdrop-blur-md border-b-2 border-[#FFB6C1] shadow-sm"
      >
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-[#212121]">My Profile</h1>
            <motion.button
              onClick={handleEditProfile}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#FF91A4] to-[#FF91A4] text-white rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transition-all"
            >
              <Edit2 className="w-4 h-4" />
              <span>Edit Profile</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto scrollbar-hide pb-24">
        <div className="max-w-2xl mx-auto px-4 py-4">
          {/* Profile Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6 mb-4"
          >
            {/* Profile Photo */}
            <div className="flex flex-col items-center mb-4">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#FF91A4] to-[#FF91A4] p-1">
                  {profileSetup?.photos && profileSetup.photos.length > 0 ? (
                    <img
                      src={profileSetup.photos[0].preview || `https://ui-avatars.com/api/?name=${step1.name || 'User'}&background=FF1744&color=fff&size=200`}
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                      <UserCircle className="w-16 h-16 text-[#FF91A4]" />
                    </div>
                  )}
                </div>
                {profileSetup?.verified && (
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#4CAF50] rounded-full flex items-center justify-center border-2 border-white">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
              <h2 className="text-2xl font-bold text-[#212121] mt-3">
                {step1.name || 'User'}, {step1.age || ''}
              </h2>
              {step1.location?.city && (
                <div className="flex items-center gap-1 text-[#757575] text-sm mt-1">
                  <MapPin className="w-4 h-4" />
                  <span>{step1.location.city}</span>
                </div>
              )}
            </div>

            {/* Bio */}
            {profileSetup?.bio && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-[#212121] mb-2">My bio</h3>
                <p className="text-base text-[#212121] leading-relaxed">{profileSetup.bio}</p>
              </div>
            )}

            {/* About Me Badges */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-[#212121] mb-2">About me</h3>
              <div className="flex flex-wrap gap-2">
                {step6?.optional?.education && (
                  <span className="px-3 py-1.5 bg-[#FFE4E1] text-[#212121] rounded-full text-xs font-medium">
                    {formatEducation(step6.optional.education)}
                  </span>
                )}
                {step5?.dealbreakers?.drinking && (
                  <span className="px-3 py-1.5 bg-[#FFE4E1] text-[#212121] rounded-full text-xs font-medium">
                    {formatDealbreaker('drinking', step5.dealbreakers.drinking)}
                  </span>
                )}
                {step5?.dealbreakers?.smoking && (
                  <span className="px-3 py-1.5 bg-[#FFE4E1] text-[#212121] rounded-full text-xs font-medium">
                    {formatDealbreaker('smoking', step5.dealbreakers.smoking)}
                  </span>
                )}
                {step5?.dealbreakers?.kids && (
                  <span className="px-3 py-1.5 bg-[#FFE4E1] text-[#212121] rounded-full text-xs font-medium">
                    {formatDealbreaker('kids', step5.dealbreakers.kids)}
                  </span>
                )}
                {step5?.dealbreakers?.pets && (
                  <span className="px-3 py-1.5 bg-[#FFE4E1] text-[#212121] rounded-full text-xs font-medium">
                    {formatDealbreaker('pets', step5.dealbreakers.pets)}
                  </span>
                )}
              </div>
            </div>

            {/* Interests */}
            {step3?.interests && step3.interests.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-[#212121] mb-2">My interests</h3>
                <div className="flex flex-wrap gap-2">
                  {step3.interests.map((interest) => (
                    <span
                      key={interest}
                      className="px-3 py-1.5 bg-gradient-to-r from-[#FFE4E1] to-[#FFF0F5] text-[#FF91A4] rounded-full text-xs font-semibold border border-[#FFB6C1]/30"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Options Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-3"
          >
            {/* Premium/Subscription */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] rounded-xl p-4 shadow-md cursor-pointer"
              onClick={() => {
                // Navigate to premium page or show modal
                alert('Premium features coming soon!');
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Go Premium</h3>
                    <p className="text-xs text-white/90">Unlimited likes & more features</p>
                  </div>
                </div>
                <span className="text-white font-bold">→</span>
              </div>
            </motion.div>

            {/* Settings Options */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              {/* Settings */}
              <motion.div
                whileHover={{ backgroundColor: '#FFF5F5' }}
                className="flex items-center justify-between p-4 border-b border-[#FFB6C1]/20 cursor-pointer"
                onClick={() => navigate('/settings')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#FFE4E1] rounded-full flex items-center justify-center">
                    <Settings className="w-5 h-5 text-[#FF91A4]" />
                  </div>
                  <span className="text-base font-semibold text-[#212121]">Settings</span>
                </div>
                <span className="text-[#757575]">→</span>
              </motion.div>

              {/* Privacy */}
              <motion.div
                whileHover={{ backgroundColor: '#FFF5F5' }}
                className="flex items-center justify-between p-4 border-b border-[#FFB6C1]/20 cursor-pointer"
                onClick={() => {
                  alert('Privacy settings coming soon!');
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#FFE4E1] rounded-full flex items-center justify-center">
                    <Eye className="w-5 h-5 text-[#FF91A4]" />
                  </div>
                  <span className="text-base font-semibold text-[#212121]">Privacy</span>
                </div>
                <span className="text-[#757575]">→</span>
              </motion.div>

              {/* Safety & Security */}
              <motion.div
                whileHover={{ backgroundColor: '#FFF5F5' }}
                className="flex items-center justify-between p-4 border-b border-[#FFB6C1]/20 cursor-pointer"
                onClick={() => navigate('/safety')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#FFE4E1] rounded-full flex items-center justify-center">
                    <Shield className="w-5 h-5 text-[#FF91A4]" />
                  </div>
                  <span className="text-base font-semibold text-[#212121]">Safety & Security</span>
                </div>
                <span className="text-[#757575]">→</span>
              </motion.div>

              {/* App Lock */}
              <motion.div
                whileHover={{ backgroundColor: '#FFF5F5' }}
                className="flex items-center justify-between p-4 border-b border-[#FFB6C1]/20 cursor-pointer"
                onClick={() => {
                  alert('App lock feature coming soon!');
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#FFE4E1] rounded-full flex items-center justify-center">
                    <Lock className="w-5 h-5 text-[#FF91A4]" />
                  </div>
                  <span className="text-base font-semibold text-[#212121]">App Lock</span>
                </div>
                <span className="text-[#757575]">→</span>
              </motion.div>

              {/* Notifications */}
              <motion.div
                whileHover={{ backgroundColor: '#FFF5F5' }}
                className="flex items-center justify-between p-4 border-b border-[#FFB6C1]/20 cursor-pointer"
                onClick={() => {
                  alert('Notification settings coming soon!');
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#FFE4E1] rounded-full flex items-center justify-center">
                    <Bell className="w-5 h-5 text-[#FF91A4]" />
                  </div>
                  <span className="text-base font-semibold text-[#212121]">Notifications</span>
                </div>
                <span className="text-[#757575]">→</span>
              </motion.div>

              {/* Help & Support */}
              <motion.div
                whileHover={{ backgroundColor: '#FFF5F5' }}
                className="flex items-center justify-between p-4 border-b border-[#FFB6C1]/20 cursor-pointer"
                onClick={() => {
                  alert('Help center coming soon!');
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#FFE4E1] rounded-full flex items-center justify-center">
                    <HelpCircle className="w-5 h-5 text-[#FF91A4]" />
                  </div>
                  <span className="text-base font-semibold text-[#212121]">Help & Support</span>
                </div>
                <span className="text-[#757575]">→</span>
              </motion.div>

              {/* Logout */}
              <motion.div
                whileHover={{ backgroundColor: '#FFE4E1' }}
                className="flex items-center justify-between p-4 cursor-pointer"
                onClick={handleLogout}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#FF91A4]/10 rounded-full flex items-center justify-center">
                    <LogOut className="w-5 h-5 text-[#FF91A4]" />
                  </div>
                  <span className="text-base font-semibold text-[#FF91A4]">Logout</span>
                </div>
                <span className="text-[#757575]">→</span>
              </motion.div>
            </div>
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
            onClick={() => {
              alert('Liked You page coming soon!');
            }}
            whileTap={{ scale: 0.9 }}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors relative"
          >
            <Heart className="w-5 h-5 text-[#212121]" />
            <span className="text-xs font-medium text-[#212121]">
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

