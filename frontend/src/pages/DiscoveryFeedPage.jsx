import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Filter, Crown, Sparkles, MessageCircle, User, Heart, Users, UserCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProfileCard from '../components/ProfileCard';
import { mockProfiles, calculateMatchScore, calculateDistance } from '../data/mockProfiles';

export default function DiscoveryFeedPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [profiles, setProfiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likes, setLikes] = useState([]);
  const [passes, setPasses] = useState([]);
  const [matches, setMatches] = useState([]);
  const [dailyLikes, setDailyLikes] = useState({ date: '', count: 0 });
  const [isPremium, setIsPremium] = useState(false);
  const [showPremiumPrompt, setShowPremiumPrompt] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const [currentUserLocation, setCurrentUserLocation] = useState(null);
  const [showMatches, setShowMatches] = useState(false);

  const DAILY_LIKE_LIMIT = 20;

  // Load user data and initialize
  useEffect(() => {
    const onboardingData = localStorage.getItem('onboardingData');
    const profileSetup = localStorage.getItem('profileSetup');
    
    if (!onboardingData || !profileSetup) {
      navigate('/profile-setup');
      return;
    }

    try {
      const onboarding = JSON.parse(onboardingData);
      const profile = JSON.parse(profileSetup);
      
      const userProfile = {
        interests: onboarding.step3?.interests || [],
        personality: onboarding.step4?.personality || {},
        dealbreakers: onboarding.step5?.dealbreakers || {},
        location: {
          city: onboarding.step2?.city || 'Mumbai',
          lat: 19.0760,
          lng: 72.8777
        },
        ageRange: onboarding.step2?.ageRange || { min: 18, max: 100 },
        distancePref: onboarding.step2?.distancePref || 25
      };

      setCurrentUserProfile(userProfile);
      setCurrentUserLocation(userProfile.location);

      const savedLikes = localStorage.getItem('discoveryLikes');
      const savedPasses = localStorage.getItem('discoveryPasses');
      const loadedLikes = savedLikes ? JSON.parse(savedLikes) : [];
      const loadedPasses = savedPasses ? JSON.parse(savedPasses) : [];
      
      setLikes(loadedLikes);
      setPasses(loadedPasses);

      const filteredProfiles = filterAndScoreProfiles(mockProfiles, userProfile, loadedLikes, loadedPasses);
      setProfiles(filteredProfiles);
      setCurrentIndex(0); // Reset to first profile when filters change
    } catch (e) {
      console.error('Error loading user data:', e);
      navigate('/profile-setup');
    }

    loadUserActions();
    checkDailyLikesReset();
  }, [navigate]);

  // Reload profiles when coming back from filter page
  useEffect(() => {
    const handleFocus = () => {
      if (currentUserProfile) {
        const savedLikes = localStorage.getItem('discoveryLikes');
        const savedPasses = localStorage.getItem('discoveryPasses');
        const loadedLikes = savedLikes ? JSON.parse(savedLikes) : [];
        const loadedPasses = savedPasses ? JSON.parse(savedPasses) : [];
        
        const filteredProfiles = filterAndScoreProfiles(mockProfiles, currentUserProfile, loadedLikes, loadedPasses);
        setProfiles(filteredProfiles);
        setCurrentIndex(0);
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [currentUserProfile]);

  const filterAndScoreProfiles = (allProfiles, userProfile, loadedLikes = [], loadedPasses = []) => {
    // Load filters from localStorage
    const savedFilters = localStorage.getItem('discoveryFilters');
    let filters = null;
    if (savedFilters) {
      try {
        filters = JSON.parse(savedFilters);
      } catch (e) {
        console.error('Error loading filters:', e);
      }
    }

    return allProfiles
      .filter(profile => {
        // Use filters if available, otherwise use userProfile preferences
        const ageRange = filters?.ageRange || userProfile.ageRange;
        const distancePref = filters?.distancePref || userProfile.distancePref;
        const genderFilter = filters?.gender;
        const lookingForFilter = filters?.lookingFor || [];
        const interestsFilter = filters?.interests || [];
        const personalityFilter = filters?.personality || {};
        const dealbreakersFilter = filters?.dealbreakers || {};
        const optionalFilter = filters?.optional || {};

        // Age range filter
        if (ageRange) {
          if (profile.age < ageRange.min || 
              (ageRange.max && profile.age > ageRange.max)) {
            return false;
          }
        }

        // Distance filter
        if (userProfile.location && profile.location && distancePref) {
          const distance = calculateDistance(
            userProfile.location.lat,
            userProfile.location.lng,
            profile.location.lat,
            profile.location.lng
          );
          if (distance > distancePref) {
            return false;
          }
        }

        // Gender filter
        if (genderFilter && genderFilter !== '' && profile.gender !== genderFilter) {
          return false;
        }

        // Looking for filter
        if (lookingForFilter.length > 0) {
          // This would need to be stored in profile data
          // For now, skip this filter
        }

        // Interests filter
        if (interestsFilter.length > 0 && profile.interests) {
          const hasCommonInterest = interestsFilter.some(interest => 
            profile.interests.includes(interest)
          );
          if (!hasCommonInterest) {
            return false;
          }
        }

        // Personality filter
        if (personalityFilter && Object.keys(personalityFilter).length > 0) {
          if (profile.personality) {
            for (const [key, value] of Object.entries(personalityFilter)) {
              if (value && value !== '' && profile.personality[key] !== value) {
                return false;
              }
            }
          }
        }

        // Dealbreakers filter
        if (dealbreakersFilter && Object.keys(dealbreakersFilter).length > 0) {
          if (profile.dealbreakers) {
            for (const [key, value] of Object.entries(dealbreakersFilter)) {
              if (value && value !== '' && profile.dealbreakers[key] !== value) {
                return false;
              }
            }
          }
        }

        // Optional filters
        if (optionalFilter.education && optionalFilter.education !== '') {
          if (!profile.optional || profile.optional.education !== optionalFilter.education) {
            return false;
          }
        }

        if (optionalFilter.profession && optionalFilter.profession !== '') {
          if (!profile.optional || !profile.optional.profession || 
              !profile.optional.profession.toLowerCase().includes(optionalFilter.profession.toLowerCase())) {
            return false;
          }
        }

        // Exclude already liked/passed profiles
        if (loadedLikes.includes(profile.id) || loadedPasses.includes(profile.id)) {
          return false;
        }

        // Exclude blocked users
        const blockedUsers = JSON.parse(localStorage.getItem('blockedUsers') || '[]');
        if (blockedUsers.includes(profile.id)) {
          return false;
        }

        // Exclude reported users (optional - you might want to show them but flag them)
        // For now, we'll exclude them too
        const reportedUsers = JSON.parse(localStorage.getItem('reportedUsers') || '[]');
        const isReported = reportedUsers.some(r => r.userId === profile.id);
        if (isReported) {
          return false;
        }

        return true;
      })
      .map(profile => {
        const matchResult = calculateMatchScore(userProfile, profile);
        return {
          ...profile,
          matchScore: matchResult.score,
          reasons: matchResult.reasons
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore);
  };

  const loadUserActions = () => {
    const savedMatches = localStorage.getItem('discoveryMatches');
    const savedDailyLikes = localStorage.getItem('dailyLikes');
    const savedPremium = localStorage.getItem('isPremium');

    if (savedMatches) setMatches(JSON.parse(savedMatches));
    if (savedDailyLikes) setDailyLikes(JSON.parse(savedDailyLikes));
    if (savedPremium) setIsPremium(JSON.parse(savedPremium) === true);
  };

  const checkDailyLikesReset = () => {
    const today = new Date().toDateString();
    const savedDailyLikes = localStorage.getItem('dailyLikes');
    
    if (savedDailyLikes) {
      const dailyData = JSON.parse(savedDailyLikes);
      if (dailyData.date !== today) {
        const newDailyLikes = { date: today, count: 0 };
        setDailyLikes(newDailyLikes);
        localStorage.setItem('dailyLikes', JSON.stringify(newDailyLikes));
      } else {
        setDailyLikes(dailyData);
      }
    } else {
      const newDailyLikes = { date: today, count: 0 };
      setDailyLikes(newDailyLikes);
      localStorage.setItem('dailyLikes', JSON.stringify(newDailyLikes));
    }
  };

  const handleLike = () => {
    if (!isPremium && dailyLikes.count >= DAILY_LIKE_LIMIT) {
      setShowPremiumPrompt(true);
      return;
    }

    const currentProfile = profiles[currentIndex];
    if (!currentProfile) return;

    const isMatch = Math.random() > 0.7;

    const newLikes = [...likes, currentProfile.id];
    setLikes(newLikes);
    localStorage.setItem('discoveryLikes', JSON.stringify(newLikes));

    if (!isPremium) {
      const newDailyLikes = { ...dailyLikes, count: dailyLikes.count + 1 };
      setDailyLikes(newDailyLikes);
      localStorage.setItem('dailyLikes', JSON.stringify(newDailyLikes));
    }

    if (isMatch) {
      const newMatches = [...matches, { ...currentProfile, matchedAt: new Date().toISOString() }];
      setMatches(newMatches);
      localStorage.setItem('discoveryMatches', JSON.stringify(newMatches));
      
      setTimeout(() => {
        alert(`🎉 It's a Match! You and ${currentProfile.name} liked each other!`);
      }, 500);
    }

    setSwipeDirection('right');
    setTimeout(() => {
      setCurrentIndex(currentIndex + 1);
      setSwipeDirection(null);
    }, 300);
  };

  const handlePass = () => {
    const currentProfile = profiles[currentIndex];
    if (!currentProfile) return;

    const newPasses = [...passes, currentProfile.id];
    setPasses(newPasses);
    localStorage.setItem('discoveryPasses', JSON.stringify(newPasses));

    setSwipeDirection('left');
    setTimeout(() => {
      setCurrentIndex(currentIndex + 1);
      setSwipeDirection(null);
    }, 300);
  };

  const handleSuperLike = () => {
    if (!isPremium && dailyLikes.count >= DAILY_LIKE_LIMIT - 1) {
      setShowPremiumPrompt(true);
      return;
    }
    handleLike();
  };

  const handleUpgradePremium = () => {
    setShowPremiumPrompt(false);
    navigate('/premium');
  };

  const currentProfile = profiles[currentIndex];
  const remainingLikes = isPremium ? '∞' : Math.max(0, DAILY_LIKE_LIMIT - dailyLikes.count);

  if (!currentUserProfile) {
    return (
      <div className="h-screen heart-background flex items-center justify-center">
        <div className="text-[#212121]">Loading...</div>
      </div>
    );
  }

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

      {/* Enhanced Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-20 bg-gradient-to-b from-white via-white/98 to-white/95 backdrop-blur-md border-b border-[#FFB6C1]/50 shadow-sm"
      >
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF91A4] to-[#FF69B4] flex items-center justify-center shadow-md">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-[#212121]">Discover</h1>
                <p className="text-xs text-[#757575]">{profiles.length} profiles available</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Matches Button */}
              {matches.length > 0 && (
                <motion.button
                  onClick={() => setShowMatches(!showMatches)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative p-2.5 bg-[#FFE4E1] rounded-xl hover:bg-[#FF91A4] hover:text-white transition-all shadow-sm"
                >
                  <MessageCircle className="w-5 h-5 text-[#FF91A4] hover:text-white transition-colors" />
                  {matches.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#FF91A4] text-white text-[10px] rounded-full flex items-center justify-center font-bold shadow-md">
                      {matches.length}
                    </span>
                  )}
                </motion.button>
              )}

              {/* Filter Button */}
              <motion.button
                onClick={() => navigate('/filters')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2.5 bg-[#FFE4E1] rounded-xl hover:bg-[#FF91A4] hover:text-white transition-all shadow-sm"
              >
                <Filter className="w-5 h-5 text-[#FF91A4] hover:text-white transition-colors" />
              </motion.button>
            </div>
          </div>

          {/* Daily Likes Progress Bar */}
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-[#FFE4E1] rounded-full h-2.5 overflow-hidden shadow-inner">
              <motion.div
                initial={{ width: 0 }}
                animate={{ 
                  width: isPremium 
                    ? '100%' 
                    : `${((DAILY_LIKE_LIMIT - remainingLikes) / DAILY_LIKE_LIMIT) * 100}%`
                }}
                className={`h-full rounded-full transition-all ${
                  isPremium
                    ? 'bg-gradient-to-r from-[#FFD700] to-[#FFA500]'
                    : remainingLikes <= 5
                      ? 'bg-gradient-to-r from-[#FF91A4] to-[#FF69B4]'
                      : 'bg-gradient-to-r from-[#FF91A4] to-[#FF91A4]'
                }`}
              />
            </div>
            <span className="text-xs font-semibold text-[#FF91A4] min-w-[40px] text-right">
              {remainingLikes} {isPremium ? '∞' : 'left'}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Profile Cards Area - Better Spacing */}
      <div className="flex-1 relative z-10 overflow-hidden pb-20 sm:pb-0 pt-3 sm:pt-6">
        <div className="h-full w-full max-w-2xl mx-auto px-3 sm:px-6 flex items-center justify-center">
          {currentProfile ? (
            <ProfileCard
                profile={currentProfile}
                currentUserLocation={currentUserLocation}
                matchScore={currentProfile.matchScore}
                reasons={currentProfile.reasons}
                onLike={handleLike}
                onPass={handlePass}
                onSuperLike={handleSuperLike}
                swipeDirection={swipeDirection}
              />
          ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl p-8 sm:p-12 text-center max-w-md mx-auto"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-[#FFE4E1] to-[#FFF0F5] rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="w-12 h-12 text-[#FF91A4]" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#212121] mb-3">No more profiles</h2>
            <p className="text-[#757575] mb-8">
              You've seen all available profiles. Check back later for new matches!
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  // Remove all filters
                  localStorage.removeItem('discoveryFilters');
                  // Remove all passes
                  setPasses([]);
                  localStorage.removeItem('discoveryPasses');
                  // Remove all likes
                  setLikes([]);
                  localStorage.removeItem('discoveryLikes');
                  // Reload profiles without filters
                  if (currentUserProfile) {
                    const filteredProfiles = filterAndScoreProfiles(mockProfiles, currentUserProfile, [], []);
                    setProfiles(filteredProfiles);
                    setCurrentIndex(0);
                  } else {
                    window.location.reload();
                  }
                }}
                className="flex-1 px-6 py-3 bg-[#FF91A4] text-white rounded-xl font-semibold hover:bg-[#FF69B4] transition-all shadow-lg"
              >
                Reset & See Again
              </button>
              {matches.length > 0 && (
                <button
                  onClick={() => setShowMatches(true)}
                  className="flex-1 px-6 py-3 bg-[#FFE4E1] text-[#FF91A4] rounded-xl font-semibold hover:bg-[#FF91A4] hover:text-white transition-all border-2 border-[#FF91A4]"
                >
                  View Matches ({matches.length})
                </button>
              )}
            </div>
          </motion.div>
          )}
        </div>
      </div>

      {/* Premium Prompt Modal */}
      <AnimatePresence>
        {showPremiumPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowPremiumPrompt(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl"
            >
              <div className="text-center mb-6">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                  className="w-16 h-16 bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
                >
                  <Crown className="w-8 h-8 text-white" />
                </motion.div>
                <h3 className="text-2xl font-bold text-[#212121] mb-2">Upgrade to Premium</h3>
                <p className="text-sm text-[#757575]">
                  You've used all {DAILY_LIKE_LIMIT} free likes today!
                </p>
              </div>

              <div className="space-y-3 mb-6">
                {[
                  'Unlimited likes',
                  'See who liked you',
                  'Boost your profile',
                  'Ad-free experience'
                ].map((feature, index) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 text-sm text-[#212121]"
                  >
                    <div className="w-6 h-6 bg-[#4CAF50] rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span>{feature}</span>
                  </motion.div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowPremiumPrompt(false)}
                  className="flex-1 px-4 py-3 border-2 border-[#E0E0E0] text-[#212121] rounded-xl font-semibold hover:border-[#757575] transition-all"
                >
                  Maybe Later
                </button>
                <button
                  onClick={handleUpgradePremium}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-[#FF91A4] to-[#FF91A4] text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Upgrade Now
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
            onClick={() => {
              // Navigate to discovery feed page
              navigate('/discover');
              setShowMatches(false);
            }}
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
              // Navigate to liked you page
              // For now, just show matches
              setShowMatches(true);
            }}
            whileTap={{ scale: 0.9 }}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors relative"
          >
            <Heart className="w-5 h-5 text-[#212121]" />
            {likes.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF91A4] text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                {likes.length}
              </span>
            )}
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
            {matches.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF91A4] text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                {matches.length}
              </span>
            )}
            <span className={`text-xs font-medium ${location.pathname === '/chats' ? 'text-[#FF91A4]' : 'text-[#212121]'}`}>
              Chats
            </span>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
