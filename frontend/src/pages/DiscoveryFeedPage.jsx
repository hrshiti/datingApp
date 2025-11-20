import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Filter, Crown, Sparkles, MessageCircle, User, Heart, Users, UserCircle, Eye, ArrowLeft, X, Star, MapPin, GraduationCap, Languages, Coffee, Briefcase, BookOpen, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState(null);
  const [dragX, setDragX] = useState(0);
  const [showCompleteDetailsModal, setShowCompleteDetailsModal] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const dragDistance = useRef(0);
  const isDragging = useRef(false);

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

      let filteredProfiles = filterAndScoreProfiles(mockProfiles, userProfile, loadedLikes, loadedPasses);
      
      // If no profiles after filtering, show all available profiles (excluding liked/passed)
      if (filteredProfiles.length === 0) {
        filteredProfiles = mockProfiles
          .filter(profile => !loadedLikes.includes(profile.id) && !loadedPasses.includes(profile.id))
          .map(profile => {
            const matchResult = calculateMatchScore(userProfile, profile);
            return {
              ...profile,
              matchScore: matchResult.score,
              reasons: matchResult.reasons
            };
          })
          .sort((a, b) => b.matchScore - a.matchScore);
      }
      
      // Add dummy prompts to profiles if they don't have any
      const profilesWithPrompts = filteredProfiles.map(profile => {
        if (!profile.prompts || profile.prompts.length === 0) {
          return {
            ...profile,
            prompts: [
              {
                prompt: "What's the best way to ask you out?",
                answer: "Just be yourself and ask me directly! I appreciate honesty and straightforwardness."
              },
              {
                prompt: "I'm a great +1 for...",
                answer: "Concerts, food festivals, and any adventure that involves trying something new!"
              },
              {
                prompt: "The way to my heart is...",
                answer: "Through good conversation, shared laughter, and genuine connection."
              }
            ]
          };
        }
        return profile;
      });
      
      setProfiles(profilesWithPrompts);
      setCurrentIndex(0); // Reset to first profile when filters change
    } catch (e) {
      console.error('Error loading user data:', e);
      navigate('/profile-setup');
    }

    loadUserActions();
    checkDailyLikesReset();
  }, [navigate]);

  // Handle navigation from chat to show specific user profile
  useEffect(() => {
    if (location.state?.showUserId && profiles.length > 0) {
      const userIndex = profiles.findIndex(p => p.id === location.state.showUserId);
      if (userIndex !== -1) {
        setCurrentIndex(userIndex);
        // Clear the state after using it to prevent re-triggering
        window.history.replaceState({}, document.title);
      }
    }
  }, [location.state, profiles]);

  // Reset photo index when profile changes
  useEffect(() => {
    setCurrentPhotoIndex(0);
    // Reset drag tracking when profile changes
    isDragging.current = false;
    dragDistance.current = 0;
  }, [currentIndex]);

  // Reload profiles when coming back from filter page
  useEffect(() => {
    const handleFocus = () => {
      if (currentUserProfile) {
        const savedLikes = localStorage.getItem('discoveryLikes');
        const savedPasses = localStorage.getItem('discoveryPasses');
        const loadedLikes = savedLikes ? JSON.parse(savedLikes) : [];
        const loadedPasses = savedPasses ? JSON.parse(savedPasses) : [];
        
        let filteredProfiles = filterAndScoreProfiles(mockProfiles, currentUserProfile, loadedLikes, loadedPasses);
        
        // If no profiles after filtering, show all available profiles (excluding liked/passed)
        if (filteredProfiles.length === 0) {
          filteredProfiles = mockProfiles
            .filter(profile => !loadedLikes.includes(profile.id) && !loadedPasses.includes(profile.id))
            .map(profile => {
              const matchResult = calculateMatchScore(currentUserProfile, profile);
              return {
                ...profile,
                matchScore: matchResult.score,
                reasons: matchResult.reasons
              };
            })
            .sort((a, b) => b.matchScore - a.matchScore);
        }
        
        // Add dummy prompts to profiles if they don't have any
        const profilesWithPrompts = filteredProfiles.map(profile => {
          if (!profile.prompts || profile.prompts.length === 0) {
            return {
              ...profile,
              prompts: [
                {
                  prompt: "What's the best way to ask you out?",
                  answer: "Just be yourself and ask me directly! I appreciate honesty and straightforwardness."
                },
                {
                  prompt: "I'm a great +1 for...",
                  answer: "Concerts, food festivals, and any adventure that involves trying something new!"
                },
                {
                  prompt: "The way to my heart is...",
                  answer: "Through good conversation, shared laughter, and genuine connection."
                }
              ]
            };
          }
          return profile;
        });
        
        setProfiles(profilesWithPrompts);
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

        // Age range filter (relaxed - use default range if not set)
        const effectiveAgeRange = ageRange || { min: 18, max: 100 };
        if (profile.age < effectiveAgeRange.min || 
            (effectiveAgeRange.max && profile.age > effectiveAgeRange.max)) {
          return false;
        }

        // Distance filter (relaxed for dummy data - allow up to 500km if no distance pref set)
        if (userProfile.location && profile.location) {
          const distance = calculateDistance(
            userProfile.location.lat,
            userProfile.location.lng,
            profile.location.lat,
            profile.location.lng
          );
          const maxDistance = distancePref || 500; // Default to 500km if no preference
          if (distance > maxDistance) {
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
    // Check if onboarding is complete
    if (!isOnboardingComplete()) {
      setShowCompleteDetailsModal(true);
      return;
    }

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

    // Start swipe animation
    setSwipeDirection('right');
    
    if (isMatch) {
      const newMatches = [...matches, { ...currentProfile, matchedAt: new Date().toISOString() }];
      setMatches(newMatches);
      localStorage.setItem('discoveryMatches', JSON.stringify(newMatches));
      
      // Show match modal after swipe animation completes
      setTimeout(() => {
        setMatchedProfile(currentProfile);
        setShowMatchModal(true);
      }, 400);
    }
    
    // Wait for exit animation to complete before showing next card
    setTimeout(() => {
      setCurrentIndex(currentIndex + 1);
      setCurrentPhotoIndex(0);
      setSwipeDirection(null);
      setDragX(0); // Reset drag position
    }, 350); // Wait for exit animation (300ms) + small buffer
  };

  const handlePass = () => {
    // Check if onboarding is complete
    if (!isOnboardingComplete()) {
      setShowCompleteDetailsModal(true);
      return;
    }

    const currentProfile = profiles[currentIndex];
    if (!currentProfile) return;

    const newPasses = [...passes, currentProfile.id];
    setPasses(newPasses);
    localStorage.setItem('discoveryPasses', JSON.stringify(newPasses));

    // Start swipe animation
    setSwipeDirection('left');
    
    // Wait for exit animation to complete before showing next card
    setTimeout(() => {
      setCurrentIndex(currentIndex + 1);
      setCurrentPhotoIndex(0); // Reset photo index for new profile
      setSwipeDirection(null);
      setDragX(0); // Reset drag position
    }, 350); // Wait for exit animation (300ms) + small buffer
  };

  // Check if onboarding is complete (has all steps from 2 onwards)
  const isOnboardingComplete = () => {
    const onboardingData = localStorage.getItem('onboardingData');
    if (!onboardingData) return false;
    
    try {
      const onboarding = JSON.parse(onboardingData);
      // Check if all required steps are present (step2 to step9)
      return !!(
        onboarding.step2 && 
        onboarding.step3 && 
        onboarding.step4 && 
        onboarding.step5 && 
        onboarding.step6 && 
        onboarding.step7 && 
        onboarding.step8 && 
        onboarding.step9 &&
        onboarding.completed
      );
    } catch (e) {
      return false;
    }
  };

  // Handle card swipe (Tinder-style)
  const handleCardSwipe = (direction) => {
    if (!currentProfile) return;
    
    // Check if onboarding is complete
    if (!isOnboardingComplete()) {
      setShowCompleteDetailsModal(true);
      return;
    }
    
    if (direction === 'right') {
      // Swipe right = Like
      handleLike();
    } else if (direction === 'left') {
      // Swipe left = Pass
      handlePass();
    }
  };

  // Handle photo swipe within current profile (vertical swipe or tap)
  const handlePhotoSwipe = (direction) => {
    if (!currentProfile || !currentProfile.photos) return;
    
    const totalPhotos = currentProfile.photos.length;
    
    if (direction === 'right') {
      // Next photo
      if (currentPhotoIndex < totalPhotos - 1) {
        setCurrentPhotoIndex(currentPhotoIndex + 1);
      }
    } else if (direction === 'left') {
      // Previous photo
      if (currentPhotoIndex > 0) {
        setCurrentPhotoIndex(currentPhotoIndex - 1);
      }
    }
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
    <div className="h-screen flex flex-col relative overflow-hidden bg-gradient-to-br from-[#FFF0F5] via-[#FFE4E1] to-[#FFF0F5]">

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

      {/* Enhanced Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-20 bg-gradient-to-b from-white via-white/98 to-white/95 backdrop-blur-lg border-b border-[#FFB6C1]/30 shadow-lg"
      >
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex items-center justify-between">
            {/* Left Arrow */}
            <motion.button
              onClick={() => navigate('/profile')}
              whileHover={{ scale: 1.1, rotate: -5 }}
              whileTap={{ scale: 0.9 }}
              className="p-2.5 hover:bg-[#FFE4E1] rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[#212121]" />
            </motion.button>

            {/* Center - Discover & Location */}
            <div className="flex-1 text-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="inline-block"
              >
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#FF91A4] to-[#FF69B4] bg-clip-text text-transparent">
                  Discover
                </h1>
                {currentUserLocation?.city && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center gap-1.5 mt-1"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#FF91A4]" />
                    <p className="text-xs sm:text-sm text-[#757575] font-medium">
                      {currentUserLocation.city}
                    </p>
                  </motion.div>
                )}
              </motion.div>
            </div>

            {/* Right - Filter Button */}
            <motion.button
              onClick={() => navigate('/filters')}
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              className="p-2.5 hover:bg-[#FFE4E1] rounded-xl transition-colors relative"
            >
              <Filter className="w-5 h-5 text-[#212121]" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Profile Cards Area - Card Stack (Figma Style) */}
      <div className="flex-1 relative z-10 overflow-y-auto pb-0 pt-0 md:pt-[90px] md:ml-16">
        <div className="min-h-full w-full md:max-w-md lg:max-w-lg md:mx-auto px-0 sm:px-0 flex flex-col items-start md:items-center justify-start md:justify-start relative pb-32">
          {/* Card Stack - Show only current card */}
          {profiles.length > 0 && currentProfile ? (
            <>
              {/* Current Card (Front) - Fully Visible - Simple Image Card */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentProfile.id}
                    drag="x"
                    dragConstraints={{ left: -500, right: 500 }}
                    dragElastic={0.2}
                    onDragStart={(event, info) => {
                      dragStartPos.current = { x: info.point.x, y: info.point.y, time: Date.now() };
                      dragDistance.current = 0;
                      isDragging.current = true;
                      setDragX(0);
                    }}
                    onDrag={(event, info) => {
                      // Track total drag distance and current position
                      const currentX = info.point.x;
                      const startX = dragStartPos.current.x;
                      dragDistance.current = Math.abs(currentX - startX);
                      setDragX(info.offset.x);
                    }}
                    onDragEnd={(event, info) => {
                      const threshold = 100; // Minimum distance to trigger swipe
                      const velocity = Math.abs(info.velocity.x);
                      const swipeDistance = Math.abs(info.offset.x);
                      
                      // Check if dragged far enough or has enough velocity
                      if (swipeDistance > threshold || velocity > 500) {
                        if (info.offset.x > 0 || info.velocity.x > 0) {
                          // Swipe right = Like
                          handleCardSwipe('right');
                        } else {
                          // Swipe left = Pass
                          handleCardSwipe('left');
                        }
                        // Don't reset dragX here - let it stay for exit animation
                      } else {
                        // Snap back to center if not swiped far enough
                        setDragX(0);
                        // This is handled by framer-motion automatically
                      }
                      
                      // Reset drag tracking after a delay
                      setTimeout(() => {
                        isDragging.current = false;
                        dragDistance.current = 0;
                      }, 100);
                    }}
                    onTap={(event, info) => {
                      // Only trigger tap if drag distance was very small (true tap, not swipe)
                      const TAP_THRESHOLD = 25; // 25px threshold for tap vs swipe
                      
                      if (!isDragging.current || dragDistance.current < TAP_THRESHOLD) {
                        console.log('Tapped on profile:', currentProfile.id, currentProfile.name);
                        navigate('/people');
                      } else {
                        // This was a swipe, not a tap - don't navigate
                        console.log('Swipe detected, ignoring tap');
                      }
                      
                      // Reset drag tracking
                      isDragging.current = false;
                      dragDistance.current = 0;
                    }}
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={swipeDirection === 'right' ? { 
                    x: 1000, 
                    rotate: 30, 
                    opacity: 0, 
                    scale: 0.8,
                    transition: { duration: 0.3, ease: "easeIn" }
                  } : 
                  swipeDirection === 'left' ? { 
                    x: -1000, 
                    rotate: -30, 
                    opacity: 0, 
                    scale: 0.8,
                    transition: { duration: 0.3, ease: "easeIn" }
                  } : 
                  { 
                    x: dragX,
                    rotate: dragX * 0.1, // Rotate based on drag position
                    scale: 1 - Math.abs(dragX) * 0.0005, // Slight scale down while dragging
                    opacity: 1, 
                    y: 0,
                    transition: swipeDirection ? {
                      duration: 0.4, 
                      type: "spring", 
                      stiffness: 300, 
                      damping: 25
                    } : { duration: 0.3, ease: "easeOut" } // Smooth fade in for new cards
                  }}
                  exit={swipeDirection === 'right' ? { 
                    x: 1000, 
                    rotate: 30, 
                    opacity: 0, 
                    scale: 0.8,
                    transition: { duration: 0.3, ease: "easeIn" }
                  } : 
                  swipeDirection === 'left' ? { 
                    x: -1000, 
                    rotate: -30, 
                    opacity: 0, 
                    scale: 0.8,
                    transition: { duration: 0.3, ease: "easeIn" }
                  } : 
                  { 
                    x: 0, 
                    rotate: 0, 
                    opacity: 0, 
                    scale: 0.9, 
                    y: 20,
                    transition: { duration: 0.3, ease: "easeIn" }
                  }}
                  style={{ 
                    cursor: 'grab',
                    touchAction: 'pan-x'
                  }}
                  className="relative w-full md:max-w-md lg:max-w-lg md:mx-auto z-10 active:cursor-grabbing"
                >
                <div 
                  className="relative w-full h-[calc(100vh-160px)] sm:h-[calc(100vh-180px)] md:h-[calc(100vh-90px)] bg-white rounded-none sm:rounded-none md:rounded-xl shadow-2xl overflow-hidden border-0 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Only navigate if it was a true tap (not a swipe)
                    const TAP_THRESHOLD = 25; // 25px threshold for tap vs swipe
                    
                    if (!isDragging.current || dragDistance.current < TAP_THRESHOLD) {
                      console.log('Card clicked, navigating to:', '/people');
                      navigate('/people');
                    } else {
                      console.log('Swipe detected, ignoring click');
                    }
                  }}
                >
                  {/* Swipe Indicators - LIKE (Right Swipe) */}
                  {dragX > 50 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ 
                        opacity: Math.min(dragX / 200, 1),
                        scale: 0.9 + (dragX / 1000) * 0.1
                      }}
                      className="absolute top-1/2 left-8 transform -translate-y-1/2 z-30 pointer-events-none"
                    >
                      <div className="bg-gradient-to-br from-green-500 to-emerald-600 px-6 py-3 rounded-2xl shadow-2xl border-4 border-white">
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 0.5, repeat: Infinity }}
                          className="text-white font-bold text-3xl sm:text-4xl"
                        >
                          LIKE
                        </motion.div>
                      </div>
                    </motion.div>
                  )}

                  {/* Swipe Indicators - PASS (Left Swipe) */}
                  {dragX < -50 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ 
                        opacity: Math.min(Math.abs(dragX) / 200, 1),
                        scale: 0.9 + (Math.abs(dragX) / 1000) * 0.1
                      }}
                      className="absolute top-1/2 right-8 transform -translate-y-1/2 z-30 pointer-events-none"
                    >
                      <div className="bg-gradient-to-br from-red-500 to-rose-600 px-6 py-3 rounded-2xl shadow-2xl border-4 border-white">
                        <motion.div
                          animate={{ rotate: [0, -10, 10, 0] }}
                          transition={{ duration: 0.5, repeat: Infinity }}
                          className="text-white font-bold text-3xl sm:text-4xl"
                        >
                          PASS
                        </motion.div>
                      </div>
                    </motion.div>
                  )}

                  {/* Color Overlay - Green for Like */}
                  {dragX > 50 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: Math.min(dragX / 300, 0.3) }}
                      className="absolute inset-0 bg-gradient-to-br from-green-500/30 to-emerald-600/30 z-20 pointer-events-none"
                    />
                  )}

                  {/* Color Overlay - Red for Pass */}
                  {dragX < -50 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: Math.min(Math.abs(dragX) / 300, 0.3) }}
                      className="absolute inset-0 bg-gradient-to-br from-red-500/30 to-rose-600/30 z-20 pointer-events-none"
                    />
                  )}

                  {/* Action Buttons - On Photo */}
                  <div className="absolute bottom-10 sm:bottom-12 left-1/2 -translate-x-1/2 flex items-center justify-center gap-4 sm:gap-5 md:gap-4 z-30">
                    {/* Pass Button - White circle with red X */}
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePass();
                      }}
                      whileHover={{ scale: 1.1, rotate: -5 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-16 h-16 sm:w-20 sm:h-20 md:w-16 md:h-16 rounded-full bg-white/95 backdrop-blur-sm border-2 border-white shadow-xl hover:border-[#E94057] hover:bg-white transition-all flex items-center justify-center"
                    >
                      <X className="w-8 h-8 sm:w-10 sm:h-10 md:w-8 md:h-8 text-[#E94057]" strokeWidth={3} />
                    </motion.button>

                    {/* Like Button - Red circle with white heart (Middle) */}
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLike();
                      }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-16 h-16 sm:w-20 sm:h-20 md:w-16 md:h-16 rounded-full bg-[#E94057] flex items-center justify-center shadow-xl hover:shadow-2xl transition-all"
                    >
                      <Heart className="w-8 h-8 sm:w-10 sm:h-10 md:w-8 md:h-8 text-white fill-white" />
                    </motion.button>

                    {/* Super Like Button - White circle with purple star */}
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSuperLike();
                      }}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-16 h-16 sm:w-20 sm:h-20 md:w-16 md:h-16 rounded-full bg-white/95 backdrop-blur-sm border-2 border-white shadow-xl hover:border-[#8A2387] hover:bg-white transition-all flex items-center justify-center"
                    >
                      <Star className="w-8 h-8 sm:w-10 sm:h-10 md:w-8 md:h-8 text-[#8A2387] fill-[#8A2387]" />
                    </motion.button>
                  </div>

                  {/* Current Card Image */}
                  {currentProfile.photos && currentProfile.photos.length > 0 ? (
                    <>
                      <AnimatePresence mode="wait">
                        <motion.img
                          key={`${currentProfile.id}-${currentPhotoIndex}`}
                          initial={{ opacity: 0, x: 50 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -50 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          src={currentProfile.photos[currentPhotoIndex]}
                          alt={currentProfile.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${currentProfile.name}&background=FF1744&color=fff&size=400`;
                          }}
                        />
                      </AnimatePresence>
                      
                      {/* Photo Navigation */}
                      {currentProfile.photos.length > 1 && (
                        <>
                          {currentPhotoIndex > 0 && (
                            <motion.button
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setCurrentPhotoIndex(currentPhotoIndex - 1);
                              }}
                              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-xl hover:bg-white transition-all z-20"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <ChevronLeft className="w-6 h-6 text-[#212121]" />
                            </motion.button>
                          )}
                          {currentPhotoIndex < currentProfile.photos.length - 1 && (
                            <motion.button
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setCurrentPhotoIndex(currentPhotoIndex + 1);
                              }}
                              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-xl hover:bg-white transition-all z-20"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <ChevronRight className="w-6 h-6 text-[#212121]" />
                            </motion.button>
                          )}
                          {/* Photo Indicators */}
                          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20 pointer-events-none">
                            {currentProfile.photos.map((_, index) => (
                              <motion.div
                                key={index}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className={`h-2 rounded-full transition-all ${
                                  index === currentPhotoIndex 
                                    ? 'w-8 bg-white shadow-lg' 
                                    : 'w-2 bg-white/50'
                                }`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />
                      
                      {/* Distance Badge */}
                      {currentUserLocation && currentProfile.location && (
                        <div className="absolute top-4 left-4 bg-white text-[#212121] px-3 py-1.5 rounded-full text-xs font-bold shadow-lg z-10 border border-[#E0E0E0] pointer-events-none">
                          {Math.round(calculateDistance(
                            currentUserLocation.lat,
                            currentUserLocation.lng,
                            currentProfile.location.lat,
                            currentProfile.location.lng
                          ))} km
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#FFE4E1] via-[#FFF0F5] to-[#FFE4E1]">
                      <div className="text-8xl text-[#FF91A4] font-bold">
                        {currentProfile.name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
              </AnimatePresence>

              {/* Profile Details Section - Below Photo Card */}
              {currentProfile && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="relative z-10 -mt-8 bg-white rounded-t-3xl shadow-2xl w-full md:max-w-md lg:max-w-lg md:mx-auto mb-4"
                  style={{ pointerEvents: 'auto' }}
                  onClick={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                >
                  <div 
                    className="px-4 sm:px-6 md:px-8 py-6"
                  >
                    {/* Name, Age, Profession Card */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="bg-gradient-to-br from-white to-[#FFF0F5] rounded-2xl p-5 mb-4 shadow-lg border border-[#FFB6C1]/20"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[#FF91A4] to-[#FF69B4] bg-clip-text text-transparent mb-2">
                            {currentProfile.name}, {currentProfile.age}
                          </h1>
                          {currentProfile.optional?.profession && (
                            <div className="flex items-center gap-2 text-base text-[#757575]">
                              <Briefcase className="w-4 h-4 text-[#FF91A4]" />
                              <span>{currentProfile.optional.profession}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>

                    {/* Location Card */}
                    {currentUserLocation && currentProfile.location && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="bg-gradient-to-br from-white to-[#FFF0F5] rounded-2xl p-4 mb-4 shadow-md border border-[#FFB6C1]/20"
                      >
                        <div className="flex items-center gap-3 text-sm text-[#757575]">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#FFE4E1] to-[#FFF0F5] rounded-full flex items-center justify-center">
                            <MapPin className="w-5 h-5 text-[#FF91A4]" />
                          </div>
                          <div>
                            <p className="font-semibold text-[#212121]">{currentProfile.location.city}</p>
                            {calculateDistance(
                              currentUserLocation.lat,
                              currentUserLocation.lng,
                              currentProfile.location.lat,
                              currentProfile.location.lng
                            ) && (
                              <p className="text-xs text-[#757575]">
                                {Math.round(calculateDistance(
                                  currentUserLocation.lat,
                                  currentUserLocation.lng,
                                  currentProfile.location.lat,
                                  currentProfile.location.lng
                                ))} km away
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* About Section */}
                    {currentProfile.bio && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-gradient-to-br from-white to-[#FFF0F5] rounded-2xl p-5 mb-4 shadow-md border border-[#FFB6C1]/20"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#FFE4E1] to-[#FFF0F5] rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-[#FF91A4]" />
                          </div>
                          <h2 className="text-lg font-bold text-[#212121]">About</h2>
                        </div>
                        <p className="text-base text-[#212121] leading-relaxed pl-13">
                          {currentProfile.bio}
                        </p>
                      </motion.div>
                    )}

                    {/* Interests Section */}
                    {currentProfile.interests && currentProfile.interests.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                        className="bg-gradient-to-br from-white to-[#FFF0F5] rounded-2xl p-5 mb-4 shadow-md border border-[#FFB6C1]/20"
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#FFE4E1] to-[#FFF0F5] rounded-full flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-[#FF91A4]" />
                          </div>
                          <h2 className="text-lg font-bold text-[#212121]">Interests</h2>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {currentProfile.interests.map((interest, idx) => (
                            <motion.span
                              key={idx}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.3 + idx * 0.05 }}
                              whileHover={{ scale: 1.05 }}
                              className="px-4 py-2 bg-gradient-to-r from-[#FFE4E1] to-[#FFF0F5] text-[#FF91A4] rounded-full text-sm font-semibold border border-[#FFB6C1]/30 shadow-sm"
                            >
                              {interest}
                            </motion.span>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Additional Details */}
                    <div className="space-y-4 mb-6">
                      {currentProfile.optional?.education && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 }}
                          className="bg-gradient-to-br from-white to-[#FFF0F5] rounded-2xl p-5 shadow-md border border-[#FFB6C1]/20"
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-[#FFE4E1] to-[#FFF0F5] rounded-full flex items-center justify-center">
                              <GraduationCap className="w-5 h-5 text-[#FF91A4]" />
                            </div>
                            <h3 className="text-base font-bold text-[#212121]">Education</h3>
                          </div>
                          <p className="text-base text-[#212121] pl-13">{currentProfile.optional.education}</p>
                        </motion.div>
                      )}
                      
                      {currentProfile.optional?.languages && currentProfile.optional.languages.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.45 }}
                          className="bg-gradient-to-br from-white to-[#FFF0F5] rounded-2xl p-5 shadow-md border border-[#FFB6C1]/20"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-[#FFE4E1] to-[#FFF0F5] rounded-full flex items-center justify-center">
                              <Languages className="w-5 h-5 text-[#FF91A4]" />
                            </div>
                            <h3 className="text-base font-bold text-[#212121]">Languages</h3>
                          </div>
                          <div className="flex flex-wrap gap-2 pl-13">
                            {currentProfile.optional.languages.map((lang, idx) => (
                              <motion.span
                                key={idx}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.5 + idx * 0.05 }}
                                className="px-3 py-1.5 bg-[#FFE4E1] text-[#212121] rounded-full text-sm font-medium shadow-sm"
                              >
                                {lang}
                              </motion.span>
                            ))}
                          </div>
                        </motion.div>
                      )}

                      {currentProfile.dealbreakers && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 }}
                          className="bg-gradient-to-br from-white to-[#FFF0F5] rounded-2xl p-5 shadow-md border border-[#FFB6C1]/20"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-[#FFE4E1] to-[#FFF0F5] rounded-full flex items-center justify-center">
                              <Coffee className="w-5 h-5 text-[#FF91A4]" />
                            </div>
                            <h3 className="text-base font-bold text-[#212121]">Lifestyle</h3>
                          </div>
                          <div className="flex flex-wrap gap-2 pl-13">
                            {currentProfile.dealbreakers.drinking && (
                              <span className="px-3 py-1.5 bg-[#FFE4E1] text-[#212121] rounded-full text-sm font-medium shadow-sm">
                                {currentProfile.dealbreakers.drinking === 'socially' ? 'Social Drinker' : 
                                 currentProfile.dealbreakers.drinking === 'never' ? 'Never Drinks' : 
                                 currentProfile.dealbreakers.drinking === 'regularly' ? 'Regular Drinker' : 
                                 currentProfile.dealbreakers.drinking}
                              </span>
                            )}
                            {currentProfile.dealbreakers.smoking && (
                              <span className="px-3 py-1.5 bg-[#FFE4E1] text-[#212121] rounded-full text-sm font-medium shadow-sm">
                                {currentProfile.dealbreakers.smoking === 'non-smoker' ? 'Non-Smoker' : 
                                 currentProfile.dealbreakers.smoking === 'socially' ? 'Social Smoker' : 
                                 currentProfile.dealbreakers.smoking === 'regularly' ? 'Smoker' : 
                                 currentProfile.dealbreakers.smoking}
                              </span>
                            )}
                            {currentProfile.dealbreakers.kids && (
                              <span className="px-3 py-1.5 bg-[#FFE4E1] text-[#212121] rounded-full text-sm font-medium shadow-sm">
                                {currentProfile.dealbreakers.kids === 'want-kids' ? 'Wants Kids' : 
                                 currentProfile.dealbreakers.kids === 'have-kids' ? 'Has Kids' : 
                                 currentProfile.dealbreakers.kids === 'dont-want' ? "Doesn't Want Kids" : 
                                 currentProfile.dealbreakers.kids}
                              </span>
                            )}
                            {currentProfile.dealbreakers.pets && (
                              <span className="px-3 py-1.5 bg-[#FFE4E1] text-[#212121] rounded-full text-sm font-medium shadow-sm">
                                {currentProfile.dealbreakers.pets === 'love-pets' ? 'Loves Pets' : 
                                 currentProfile.dealbreakers.pets === 'have-pets' ? 'Has Pets' : 
                                 currentProfile.dealbreakers.pets === 'no-pets' ? 'No Pets' : 
                                 currentProfile.dealbreakers.pets}
                              </span>
                            )}
                          </div>
                        </motion.div>
                      )}

                      {/* Prompts Section */}
                      {currentProfile.prompts && currentProfile.prompts.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.55 }}
                          className="bg-gradient-to-br from-white to-[#FFF0F5] rounded-2xl p-5 shadow-md border border-[#FFB6C1]/20"
                        >
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-[#FFE4E1] to-[#FFF0F5] rounded-full flex items-center justify-center">
                              <MessageSquare className="w-5 h-5 text-[#FF91A4]" />
                            </div>
                            <h3 className="text-base font-bold text-[#212121]">Prompts</h3>
                          </div>
                          <div className="space-y-3">
                            {currentProfile.prompts.map((prompt, idx) => (
                              <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 + idx * 0.05 }}
                                className="bg-gradient-to-br from-[#FFE4E1] to-[#FFF0F5] rounded-xl p-4 border border-[#FFB6C1]/30"
                              >
                                <p className="text-base font-semibold text-[#212121] mb-2">
                                  {prompt.prompt}
                                </p>
                                {prompt.answer && (
                                  <p className="text-sm text-[#757575] leading-relaxed">
                                    {prompt.answer}
                                  </p>
                                )}
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

            </>
          ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="bg-gradient-to-br from-white to-[#FFF0F5] rounded-3xl shadow-2xl p-8 sm:p-12 text-center max-w-md mx-auto border border-[#FFB6C1]/20 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#FF91A4]/5 to-transparent"></div>
            <motion.div 
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
              className="w-28 h-28 bg-gradient-to-br from-[#FFE4E1] via-[#FFF0F5] to-[#FFE4E1] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg relative z-10"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent rounded-full"></div>
              <User className="w-14 h-14 text-[#FF91A4] relative z-10" />
            </motion.div>
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#FF91A4] to-[#FF69B4] bg-clip-text text-transparent mb-3 relative z-10">
              No more profiles
            </h2>
            <p className="text-[#757575] mb-8 relative z-10">
              You've seen all available profiles. Check back later for new matches!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 relative z-10">
              <motion.button
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
                    let filteredProfiles = filterAndScoreProfiles(mockProfiles, currentUserProfile, [], []);
                    
                    // Add dummy prompts to profiles if they don't have any
                    const profilesWithPrompts = filteredProfiles.map(profile => {
                      if (!profile.prompts || profile.prompts.length === 0) {
                        return {
                          ...profile,
                          prompts: [
                            {
                              prompt: "What's the best way to ask you out?",
                              answer: "Just be yourself and ask me directly! I appreciate honesty and straightforwardness."
                            },
                            {
                              prompt: "I'm a great +1 for...",
                              answer: "Concerts, food festivals, and any adventure that involves trying something new!"
                            },
                            {
                              prompt: "The way to my heart is...",
                              answer: "Through good conversation, shared laughter, and genuine connection."
                            }
                          ]
                        };
                      }
                      return profile;
                    });
                    
                    setProfiles(profilesWithPrompts);
                    setCurrentIndex(0);
                  } else {
                    window.location.reload();
                  }
                }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 px-6 py-3.5 bg-gradient-to-r from-[#FF91A4] to-[#FF69B4] text-white rounded-xl font-semibold hover:shadow-xl transition-all shadow-lg"
              >
                Reset & See Again
              </motion.button>
              {matches.length > 0 && (
                <motion.button
                  onClick={() => setShowMatches(true)}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 px-6 py-3.5 bg-gradient-to-br from-[#FFE4E1] to-[#FFF0F5] text-[#FF91A4] rounded-xl font-semibold hover:from-[#FF91A4] hover:to-[#FF69B4] hover:text-white transition-all border-2 border-[#FF91A4] shadow-md"
                >
                  View Matches ({matches.length})
                </motion.button>
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
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-white to-[#FFF0F5] rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-[#FFB6C1]/20 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#FF91A4]/5 to-transparent"></div>
              <div className="text-center mb-6">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                  className="w-20 h-20 bg-gradient-to-br from-[#FFD700] via-[#FFA500] to-[#FFD700] rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent"></div>
                  <Crown className="w-10 h-10 text-white relative z-10" />
                </motion.div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-[#FF91A4] to-[#FF69B4] bg-clip-text text-transparent mb-2 relative z-10">
                  Upgrade to Premium
                </h3>
                <p className="text-sm text-[#757575] relative z-10">
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

              <div className="flex gap-3 relative z-10">
                <motion.button
                  onClick={() => setShowPremiumPrompt(false)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 px-4 py-3 border-2 border-[#E0E0E0] text-[#212121] rounded-xl font-semibold hover:border-[#757575] hover:bg-[#F5F5F5] transition-all"
                >
                  Maybe Later
                </motion.button>
                <motion.button
                  onClick={handleUpgradePremium}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-[#FF91A4] to-[#FF69B4] text-white rounded-xl font-semibold hover:shadow-xl transition-all shadow-lg"
                >
                  Upgrade Now
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Match Modal */}
      <AnimatePresence>
        {showMatchModal && matchedProfile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowMatchModal(false);
              setMatchedProfile(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-white to-[#FFF0F5] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[#FFB6C1]/20 relative overflow-hidden"
            >
              {/* Decorative Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#FF91A4]/10 to-transparent"></div>
              
              {/* Close Button */}
              <button
                onClick={() => {
                  setShowMatchModal(false);
                  setMatchedProfile(null);
                }}
                className="absolute top-4 right-4 p-2 hover:bg-[#FFE4E1] rounded-full transition-colors z-10"
              >
                <X className="w-5 h-5 text-[#212121]" />
              </button>

              <div className="text-center relative z-10">
                {/* Match Animation */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.2 }}
                  className="mb-6"
                >
                  <div className="text-6xl sm:text-7xl mb-4">🎉</div>
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[#FF91A4] to-[#FF69B4] bg-clip-text text-transparent mb-2"
                  >
                    It's a Match!
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-lg text-[#757575] mb-6"
                  >
                    You and {matchedProfile.name} liked each other!
                  </motion.p>
                </motion.div>

                {/* Matched Profile Photo */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.5 }}
                  className="mb-6"
                >
                  <div className="relative w-32 h-32 sm:w-40 sm:h-40 mx-auto">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#FF91A4] to-[#FF69B4] rounded-full p-1">
                      <div className="w-full h-full bg-white rounded-full p-1">
                        <img
                          src={matchedProfile.photos?.[0] || matchedProfile.avatar}
                          alt={matchedProfile.name}
                          className="w-full h-full object-cover rounded-full"
                        />
                      </div>
                    </div>
                    <motion.div
                      animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 0.6, delay: 0.8, repeat: 2 }}
                      className="absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-full flex items-center justify-center shadow-lg"
                    >
                      <Heart className="w-6 h-6 text-white fill-white" />
                    </motion.div>
                  </div>
                </motion.div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <motion.button
                    onClick={() => {
                      setShowMatchModal(false);
                      setMatchedProfile(null);
                    }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 px-6 py-3.5 bg-gradient-to-br from-[#FFE4E1] to-[#FFF0F5] text-[#FF91A4] rounded-xl font-semibold hover:from-[#FF91A4] hover:to-[#FF69B4] hover:text-white transition-all border-2 border-[#FF91A4] shadow-md"
                  >
                    Keep Swiping
                  </motion.button>
                  <motion.button
                    onClick={() => {
                      setShowMatchModal(false);
                      // Navigate directly to chat with matched user
                      navigate(`/chat/${matchedProfile.id}`, { 
                        state: { 
                          userId: matchedProfile.id, 
                          name: matchedProfile.name 
                        } 
                      });
                      setMatchedProfile(null);
                    }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 px-6 py-3.5 bg-gradient-to-r from-[#FF91A4] to-[#FF69B4] text-white rounded-xl font-semibold hover:shadow-xl transition-all shadow-lg"
                  >
                    Send Message
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Complete Details Modal */}
      <AnimatePresence>
        {showCompleteDetailsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowCompleteDetailsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-white to-[#FFF0F5] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[#FFB6C1]/20 relative overflow-hidden"
            >
              {/* Decorative Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#FF91A4]/10 to-transparent"></div>
              
              {/* Close Button */}
              <button
                onClick={() => setShowCompleteDetailsModal(false)}
                className="absolute top-4 right-4 p-2 hover:bg-[#FFE4E1] rounded-full transition-colors z-10"
              >
                <X className="w-5 h-5 text-[#212121]" />
              </button>

              <div className="text-center relative z-10">
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.2 }}
                  className="mb-6"
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-[#FF91A4] to-[#FF69B4] rounded-full flex items-center justify-center mx-auto shadow-lg">
                    <UserCircle className="w-10 h-10 text-white" />
                  </div>
                </motion.div>

                {/* Message */}
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#FF91A4] to-[#FF69B4] bg-clip-text text-transparent mb-3"
                >
                  Complete Your Profile
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-base text-[#757575] mb-6"
                >
                  To swipe, you have to complete your details first.
                </motion.p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <motion.button
                    onClick={() => setShowCompleteDetailsModal(false)}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 px-6 py-3.5 bg-gradient-to-br from-[#FFE4E1] to-[#FFF0F5] text-[#FF91A4] rounded-xl font-semibold hover:from-[#FF91A4] hover:to-[#FF69B4] hover:text-white transition-all border-2 border-[#FF91A4] shadow-md"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    onClick={() => {
                      setShowCompleteDetailsModal(false);
                      // Navigate to onboarding starting from step 2
                      const onboardingData = localStorage.getItem('onboardingData');
                      if (onboardingData) {
                        try {
                          const onboarding = JSON.parse(onboardingData);
                          onboarding.currentStep = 2;
                          localStorage.setItem('onboardingData', JSON.stringify(onboarding));
                        } catch (e) {
                          console.error('Error updating onboarding step:', e);
                        }
                      }
                      navigate('/onboarding');
                    }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 px-6 py-3.5 bg-gradient-to-r from-[#FF91A4] to-[#FF69B4] text-white rounded-xl font-semibold hover:shadow-xl transition-all shadow-lg"
                  >
                    Complete Details
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation Bar - Mobile Only */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-white via-white/98 to-white/95 backdrop-blur-lg border-t-2 border-[#FFB6C1]/30 shadow-2xl">
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
              // Navigate to people/swiping page
              navigate('/people');
              setShowMatches(false);
            }}
            whileTap={{ scale: 0.9 }}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors relative"
          >
            <Users className={`w-5 h-5 ${location.pathname === '/people' ? 'text-[#FF91A4]' : 'text-[#212121]'}`} />
            <span className={`text-xs font-medium ${location.pathname === '/people' ? 'text-[#FF91A4]' : 'text-[#212121]'}`}>
              People
            </span>
          </motion.button>

          {/* Liked You */}
          <motion.button
            onClick={() => navigate('/liked-you')}
            whileTap={{ scale: 0.9 }}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors relative"
          >
            <div className="relative inline-block">
              <Heart className={`w-5 h-5 ${location.pathname === '/liked-you' ? 'text-[#FF91A4]' : 'text-[#212121]'}`} />
              {likes.length > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-[#FF91A4] text-white text-[10px] rounded-full flex items-center justify-center font-bold transform translate-x-1/2 -translate-y-1/2">
                  {likes.length}
                </span>
              )}
            </div>
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
            <div className="relative inline-block">
              <MessageCircle className={`w-5 h-5 ${location.pathname === '/chats' ? 'text-[#FF91A4]' : 'text-[#212121]'}`} />
              {matches.length > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-[#FF91A4] text-white text-[10px] rounded-full flex items-center justify-center font-bold transform translate-x-1/2 -translate-y-1/2">
                  {matches.length}
                </span>
              )}
            </div>
            <span className={`text-xs font-medium ${location.pathname === '/chats' ? 'text-[#FF91A4]' : 'text-[#212121]'}`}>
              Chats
            </span>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
