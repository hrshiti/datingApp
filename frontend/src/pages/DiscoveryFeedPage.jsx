import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Filter, Crown, Sparkles, MessageCircle, User, Heart, Users, UserCircle, Eye, ArrowLeft, X, Star, MapPin, GraduationCap, Languages, Coffee, Briefcase, BookOpen, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProfileCard from '../components/ProfileCard';
import { mockProfiles, calculateDistance } from '../data/mockProfiles';
import { authService } from '../services/authService';
import { profileService } from '../services/profileService';

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
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(true);
  const [profileCompletionStatus, setProfileCompletionStatus] = useState(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const dragDistance = useRef(0);
  const isDragging = useRef(false);

  const DAILY_LIKE_LIMIT = 20;

  // Check if user is authenticated and load profile completion status
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/welcome');
      return;
    }

    // Load profile completion status from backend
    const loadProfileCompletion = async () => {
      try {
        const response = await profileService.checkProfileCompletion();
        if (response.success) {
          setProfileCompletionStatus(response);
        }
      } catch (error) {
        console.error('Error loading profile completion:', error);
      }
    };
    
    loadProfileCompletion();
  }, [navigate]);

  // Load user profile and discovery feed from localStorage/mock data
  useEffect(() => {
    // Load user actions (likes, passes, matches, premium status)
    loadUserActions();
    checkDailyLikesReset();
      
    const loadUserProfile = () => {
      const savedProfile = localStorage.getItem('userProfile');
      if (savedProfile) {
        try {
          const profile = JSON.parse(savedProfile);
          setCurrentUserProfile(profile);
          if (profile.location) {
            setCurrentUserLocation(profile.location);
          }
        } catch (e) {
          console.error('Error loading user profile:', e);
        }
      }
    };

    const loadProfiles = () => {
      setIsLoadingProfiles(true);
      
      // Load user profile first
      const userProfileData = loadUserProfile();
      
      try {
        // ✅ Load from localStorage/mockProfiles (NOT from backend)
        const savedLikes = localStorage.getItem('discoveryLikes');
        const savedPasses = localStorage.getItem('discoveryPasses');
        const loadedLikes = savedLikes ? JSON.parse(savedLikes) : [];
        const loadedPasses = savedPasses ? JSON.parse(savedPasses) : [];
        
        // Get user profile for filtering
        const savedProfile = localStorage.getItem('userProfile');
        const userProfile = currentUserProfile || (savedProfile ? JSON.parse(savedProfile) : {});
        
        // Filter out already liked/passed profiles
        const availableProfiles = mockProfiles.filter(profile => 
          !loadedLikes.includes(profile.id) && !loadedPasses.includes(profile.id)
        );
        
        // Add distance and active status for display
        const profilesWithInfo = availableProfiles.map(profile => {
          let distance = null;
          if (userProfile.location && profile.location) {
            distance = calculateDistance(
              userProfile.location.lat || userProfile.location.coordinates?.[1],
              userProfile.location.lng || userProfile.location.coordinates?.[0],
              profile.location.lat,
              profile.location.lng
            );
          }
          
          return {
            ...profile,
            distance: distance ? Math.round(distance) : null,
            activeStatus: 'Active recently' // Mock status
          };
        });
        
        setProfiles(profilesWithInfo);
        console.log(`✅ Loaded ${profilesWithInfo.length} profiles from localStorage/mock data`);
        
        if (profilesWithInfo.length === 0) {
          console.warn('⚠️ No profiles available. All profiles have been liked or passed.');
        }
      } catch (error) {
        console.error('Error loading profiles:', error);
        setProfiles([]);
      } finally {
        setIsLoadingProfiles(false);
      }
    };

    loadProfiles();
  }, [location.pathname, location.key]);

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

  // Reload profiles when coming back from filter page or tab regains focus
  useEffect(() => {
    const handleFocus = () => {
      // Reload profiles from localStorage when tab regains focus
      const savedLikes = localStorage.getItem('discoveryLikes');
      const savedPasses = localStorage.getItem('discoveryPasses');
      const loadedLikes = savedLikes ? JSON.parse(savedLikes) : [];
      const loadedPasses = savedPasses ? JSON.parse(savedPasses) : [];
      
      const userProfile = currentUserProfile || JSON.parse(localStorage.getItem('userProfile') || '{}');
      
      const availableProfiles = mockProfiles.filter(profile => 
        !loadedLikes.includes(profile.id) && !loadedPasses.includes(profile.id)
      );
      
      // Add distance and active status
      const profilesWithInfo = availableProfiles.map(profile => {
        let distance = null;
        if (userProfile.location && profile.location) {
          distance = calculateDistance(
            userProfile.location.lat || userProfile.location.coordinates?.[1],
            userProfile.location.lng || userProfile.location.coordinates?.[0],
            profile.location.lat,
            profile.location.lng
          );
        }
        return {
          ...profile,
          distance: distance ? Math.round(distance) : null,
          activeStatus: 'Active recently'
        };
      });
      
      setProfiles(profilesWithInfo);
      // Reset to first profile if current index is out of bounds
      if (currentIndex >= profilesWithInfo.length) {
        setCurrentIndex(0);
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [currentIndex, currentUserProfile]);

  // This function is no longer used - profiles are now loaded from localStorage/mockProfiles
  // Keeping it commented for reference
  /* const filterAndScoreProfiles = (allProfiles, userProfile, loadedLikes = [], loadedPasses = []) => {
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
        const effectiveAgeRange = ageRange || { min: 18, max: '' };
        // If max is empty/null, don't filter by max age (show all ages above min)
        if (profile.age < effectiveAgeRange.min || 
            (effectiveAgeRange.max && effectiveAgeRange.max !== '' && profile.age > effectiveAgeRange.max)) {
          return false;
        }

        // Distance filter (relaxed for dummy data - allow up to 500km if no distance pref set)
        if (userProfile.location && profile.location) {
          // Handle both old format (lat/lng) and new format (coordinates array)
          const userLat = userProfile.location.coordinates?.[1] || userProfile.location.lat;
          const userLng = userProfile.location.coordinates?.[0] || userProfile.location.lng;
          const profileLat = profile.location.coordinates?.[1] || profile.location.lat;
          const profileLng = profile.location.coordinates?.[0] || profile.location.lng;
          
          if (userLat && userLng && profileLat && profileLng) {
            const distance = calculateDistance(userLat, userLng, profileLat, profileLng);
            const maxDistance = distancePref || 500; // Default to 500km if no preference
            if (distance > maxDistance) {
              return false;
            }
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
        // calculateMatchScore is no longer available (was from mockProfiles)
        // Backend now provides matchScore in the API response
        return {
          ...profile,
          matchScore: profile.matchScore || 0,
          reasons: profile.matchReasons || []
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore);
  }; */

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

  const handleLike = async () => {
    // Check if profile is complete
    const isComplete = await checkProfileCompletion();
    if (!isComplete) {
      setShowCompleteDetailsModal(true);
      return;
    }

    if (!isPremium && dailyLikes.count >= DAILY_LIKE_LIMIT) {
      setShowPremiumPrompt(true);
      return;
    }

    const currentProfile = profiles[currentIndex];
    if (!currentProfile) return;

    try {
      // ✅ Save to localStorage (NOT backend)
      const savedLikes = localStorage.getItem('discoveryLikes');
      const likes = savedLikes ? JSON.parse(savedLikes) : [];
      
      // Check if already liked
      if (likes.includes(currentProfile.id)) {
        // Already liked - just remove from list and move to next
        const newProfiles = profiles.filter((p, idx) => idx !== currentIndex);
        setProfiles(newProfiles);
        const newIndex = currentIndex >= newProfiles.length ? newProfiles.length - 1 : currentIndex;
        setCurrentIndex(newIndex >= 0 ? newIndex : 0);
        return;
      }
      
      // Add to likes
      likes.push(currentProfile.id);
      localStorage.setItem('discoveryLikes', JSON.stringify(likes));
      setLikes(likes);
      
      // Update daily likes
      if (!isPremium) {
        const newDailyLikes = { ...dailyLikes, count: dailyLikes.count + 1 };
        setDailyLikes(newDailyLikes);
        localStorage.setItem('dailyLikes', JSON.stringify(newDailyLikes));
      }

      // Check if it's a match (simplified - check if other user also liked this user)
      // For now, we'll skip match logic since it's localStorage only
      // You can add match logic later if needed

      // Start swipe animation
      setSwipeDirection('right');
      
      // Move to next profile
      setTimeout(() => {
        // Remove liked profile from list
        const newProfiles = profiles.filter((p, idx) => idx !== currentIndex);
        setProfiles(newProfiles);
        
        const newIndex = currentIndex >= newProfiles.length ? newProfiles.length - 1 : currentIndex;
        setCurrentIndex(newIndex >= 0 ? newIndex : 0);
        setCurrentPhotoIndex(0);
        setSwipeDirection(null);
        setDragX(0);
      }, 350);
    } catch (error) {
      console.error('Error liking profile:', error);
      alert(error.message || 'Error liking profile. Please try again.');
    }
  };

  const handlePass = async () => {
    // Check if profile is complete
    const isComplete = await checkProfileCompletion();
    if (!isComplete) {
      setShowCompleteDetailsModal(true);
      return;
    }

    const currentProfile = profiles[currentIndex];
    if (!currentProfile) return;

    try {
      // ✅ Save to localStorage (NOT backend)
      const savedPasses = localStorage.getItem('discoveryPasses');
      const passes = savedPasses ? JSON.parse(savedPasses) : [];
      
      // Check if already passed
      if (passes.includes(currentProfile.id)) {
        // Already passed - just remove from list and move to next
        const newProfiles = profiles.filter((p, idx) => idx !== currentIndex);
        setProfiles(newProfiles);
        const newIndex = currentIndex >= newProfiles.length ? newProfiles.length - 1 : currentIndex;
        setCurrentIndex(newIndex >= 0 ? newIndex : 0);
        return;
      }
      
      // Add to passes
      passes.push(currentProfile.id);
      localStorage.setItem('discoveryPasses', JSON.stringify(passes));
      setPasses(passes);

      // Start swipe animation
      setSwipeDirection('left');

      // Move to next profile
      setTimeout(() => {
        // Remove passed profile from list
        const newProfiles = profiles.filter((p, idx) => idx !== currentIndex);
        setProfiles(newProfiles);
        
        const newIndex = currentIndex >= newProfiles.length ? newProfiles.length - 1 : currentIndex;
        setCurrentIndex(newIndex >= 0 ? newIndex : 0);
        setCurrentPhotoIndex(0);
        setSwipeDirection(null);
        setDragX(0);
      }, 350);
    } catch (error) {
      console.error('Error passing profile:', error);
      alert(error.message || 'Error passing profile. Please try again.');
    }
  };

  // Load next profile from localStorage (not needed anymore since we load all at once)
  const loadNextProfile = () => {
    // Profiles are already loaded from localStorage in loadProfiles()
    // This function is kept for compatibility but does nothing
    console.log('loadNextProfile called - profiles already loaded from localStorage');
  };

  // Check if profile is complete (using backend API)
  const checkProfileCompletion = async () => {
    try {
      const response = await profileService.checkProfileCompletion();
      if (response.success) {
        setProfileCompletionStatus(response);
        return response.isComplete;
      }
      return false;
    } catch (error) {
      console.error('Error checking profile completion:', error);
      return false;
    }
  };

  // Check if onboarding is complete (using backend API)
  const isOnboardingComplete = () => {
    // If we have cached status, use it
    if (profileCompletionStatus) {
      return profileCompletionStatus.isComplete;
    }
    // Otherwise return false (will trigger API call)
    return false;
  };

  // Handle card swipe (Tinder-style)
  const handleCardSwipe = async (direction) => {
    if (!currentProfile) return;
    
    // Check if profile is complete using backend API
    const isComplete = await checkProfileCompletion();
    if (!isComplete) {
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

  // Show loading state
  if (isLoadingProfiles) {
    return (
      <div className="h-screen bg-gradient-to-br from-[#F5F7FA] via-[#E8ECF1] to-[#F5F7FA] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#64B5F6] mx-auto mb-4"></div>
          <div className="text-[#1A1A1A] font-medium">Loading profiles...</div>
        </div>
      </div>
    );
  }

  // Don't show empty state - always show the people page interface
  // Even if no profiles, show the page structure (user can see filters, navigation, etc.)

  return (
    <div className="h-screen flex flex-col relative overflow-hidden bg-gradient-to-br from-[#F5F7FA] via-[#E8ECF1] to-[#F5F7FA]">
      {/* Premium Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-[#64B5F6]/8 to-transparent rounded-full blur-3xl -translate-x-1/3 -translate-y-1/3"></div>
      <div className="absolute bottom-0 right-0 w-[700px] h-[700px] bg-gradient-to-tl from-[#42A5F5]/8 to-transparent rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

      {/* Left Sidebar Navigation - Desktop Only (Instagram Style) */}
      <div className="hidden md:flex fixed left-0 top-0 bottom-0 w-16 bg-white/80 backdrop-blur-xl border-r border-[#E0E0E0]/50 z-30 flex-col items-center justify-center py-4 shadow-[4px_0_16px_rgba(0,0,0,0.04)]">
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
        className="fixed top-0 left-0 right-0 z-20 backdrop-blur-xl bg-white/80 border-b border-[#E0E0E0]/50 shadow-[0_8px_32px_rgba(0,0,0,0.06)]"
      >
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-5 sm:py-6">
          <div className="flex items-center justify-between">
            {/* Left Arrow */}
            <motion.button
              onClick={() => navigate('/profile')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 hover:bg-[#F5F5F5] rounded-xl transition-all duration-200"
            >
              <ArrowLeft className="w-5 h-5 text-[#616161]" />
            </motion.button>

            {/* Center - Discover & Location */}
            <div className="flex-1 text-center">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="inline-block"
              >
                <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] tracking-tight">
                  Discover
                </h1>
                {currentUserLocation?.city && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center gap-1.5 mt-1"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#64B5F6]" />
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
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 hover:bg-[#F5F5F5] rounded-xl transition-all duration-200 relative"
            >
              <Filter className="w-5 h-5 text-[#616161]" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Profile Cards Area - Card Stack (Figma Style) */}
      <div className="flex-1 relative z-10 overflow-y-auto pb-0 pt-0 md:pt-[90px] md:ml-16">
        <div className="min-h-full w-full md:max-w-md lg:max-w-lg md:mx-auto px-0 sm:px-0 flex flex-col items-start md:items-center justify-start md:justify-start relative pb-32">
          {/* Card Stack - Show only current card */}
          {profiles.length > 0 ? (
            currentProfile ? (
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
                      {currentProfile.distance !== null && currentProfile.distance !== undefined ? (
                        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm text-[#1A1A1A] px-3 py-1.5 rounded-full text-xs font-semibold shadow-[0_4px_16px_rgba(0,0,0,0.1)] z-10 border border-[#E8E8E8] pointer-events-none">
                          {currentProfile.distance} km
                        </div>
                      ) : currentUserLocation && currentProfile.location && currentProfile.location.coordinates ? (
                        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm text-[#1A1A1A] px-3 py-1.5 rounded-full text-xs font-semibold shadow-[0_4px_16px_rgba(0,0,0,0.1)] z-10 border border-[#E8E8E8] pointer-events-none">
                          {Math.round(calculateDistance(
                            currentUserLocation.coordinates?.[1] || currentUserLocation.lat,
                            currentUserLocation.coordinates?.[0] || currentUserLocation.lng,
                            currentProfile.location.coordinates[1],
                            currentProfile.location.coordinates[0]
                          ))} km
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#E3F2FD] via-[#BBDEFB] to-[#E3F2FD]">
                      <div className="text-8xl text-[#64B5F6] font-bold">
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
                  className="relative z-10 -mt-8 bg-white rounded-t-3xl shadow-[0_-8px_32px_rgba(0,0,0,0.1)] w-full md:max-w-md lg:max-w-lg md:mx-auto mb-4 border border-[#E8E8E8]"
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
                      className="bg-white rounded-3xl p-6 mb-5 shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-[#E0E0E0] hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] transition-all duration-300"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h1 className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] tracking-tight mb-3">
                            {currentProfile.name}, {currentProfile.age}
                          </h1>
                          {currentProfile.optional?.profession && (
                            <div className="flex items-center gap-2.5 text-base text-[#616161] font-semibold">
                              <Briefcase className="w-4 h-4 text-[#64B5F6]" />
                              <span className="capitalize">{currentProfile.optional.profession}</span>
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
                        className="bg-white rounded-3xl p-5 mb-5 shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-[#E0E0E0] hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] transition-all duration-300"
                      >
                        <div className="flex items-center gap-3 text-sm text-[#616161]">
                          <MapPin className="w-5 h-5 text-[#64B5F6] flex-shrink-0" />
                          <div>
                            <p className="font-bold text-[#1A1A1A] text-base">{currentProfile.location.city}</p>
                            {currentProfile.distance !== null && currentProfile.distance !== undefined ? (
                              <p className="text-xs text-[#757575] font-medium mt-1">
                                {currentProfile.distance} km away
                              </p>
                            ) : currentUserLocation && currentProfile.location && currentProfile.location.coordinates ? (
                              <p className="text-xs text-[#757575] font-medium mt-1">
                                {Math.round(calculateDistance(
                                  currentUserLocation.coordinates?.[1] || currentUserLocation.lat,
                                  currentUserLocation.coordinates?.[0] || currentUserLocation.lng,
                                  currentProfile.location.coordinates[1],
                                  currentProfile.location.coordinates[0]
                                ))} km away
                              </p>
                            ) : null}
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
                        className="bg-white rounded-3xl p-6 mb-5 shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-[#E0E0E0] hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] transition-all duration-300"
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <User className="w-5 h-5 text-[#64B5F6]" />
                          <h2 className="text-lg font-bold text-[#1A1A1A] tracking-tight">About</h2>
                        </div>
                        <p className="text-base text-[#1A1A1A] leading-relaxed font-medium">
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
                        className="bg-white rounded-3xl p-6 mb-5 shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-[#E0E0E0] hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] transition-all duration-300"
                      >
                        <div className="flex items-center gap-3 mb-5">
                          <BookOpen className="w-5 h-5 text-[#64B5F6]" />
                          <h2 className="text-lg font-bold text-[#1A1A1A] tracking-tight">Interests</h2>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          {currentProfile.interests.map((interest, idx) => (
                            <motion.span
                              key={idx}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.3 + idx * 0.05 }}
                              whileHover={{ scale: 1.05, y: -1 }}
                              className="px-4 py-2 bg-white border-2 border-[#64B5F6] text-[#64B5F6] rounded-xl text-sm font-semibold shadow-sm hover:bg-[#E3F2FD] hover:border-[#42A5F5] hover:shadow-md transition-all cursor-default"
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
                          className="bg-white rounded-3xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-[#E0E0E0] hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] transition-all duration-300"
                        >
                          <div className="flex items-center gap-3 mb-4">
                            <GraduationCap className="w-5 h-5 text-[#64B5F6]" />
                            <h3 className="text-base font-bold text-[#1A1A1A] tracking-tight">Education</h3>
                          </div>
                          <p className="text-base text-[#1A1A1A] font-semibold capitalize">{currentProfile.optional.education}</p>
                        </motion.div>
                      )}
                      
                      {currentProfile.optional?.languages && currentProfile.optional.languages.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.45 }}
                          className="bg-white rounded-3xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-[#E0E0E0] hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] transition-all duration-300"
                        >
                          <div className="flex items-center gap-3 mb-4">
                            <Languages className="w-5 h-5 text-[#64B5F6]" />
                            <h3 className="text-base font-bold text-[#1A1A1A] tracking-tight">Languages</h3>
                          </div>
                          <div className="flex flex-wrap gap-3">
                            {currentProfile.optional.languages.map((lang, idx) => (
                              <motion.span
                                key={idx}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.5 + idx * 0.05 }}
                                whileHover={{ scale: 1.05, y: -1 }}
                                className="px-4 py-2 bg-white border-2 border-[#64B5F6] text-[#64B5F6] rounded-xl text-sm font-semibold shadow-sm hover:bg-[#E3F2FD] hover:border-[#42A5F5] hover:shadow-md transition-all cursor-default"
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
                          className="bg-white rounded-3xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-[#E0E0E0] hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] transition-all duration-300"
                        >
                          <div className="flex items-center gap-3 mb-4">
                            <Coffee className="w-5 h-5 text-[#64B5F6]" />
                            <h3 className="text-base font-bold text-[#1A1A1A] tracking-tight">Lifestyle</h3>
                          </div>
                          <div className="flex flex-wrap gap-3">
                            {currentProfile.dealbreakers.drinking && (
                              <motion.span
                                whileHover={{ scale: 1.05, y: -1 }}
                                className="px-4 py-2 bg-white border-2 border-[#64B5F6] text-[#64B5F6] rounded-xl text-sm font-semibold shadow-sm hover:bg-[#E3F2FD] hover:border-[#42A5F5] hover:shadow-md transition-all cursor-default inline-block"
                              >
                                {currentProfile.dealbreakers.drinking === 'socially' ? 'Social Drinker' : 
                                 currentProfile.dealbreakers.drinking === 'never' ? 'Never Drinks' : 
                                 currentProfile.dealbreakers.drinking === 'regularly' ? 'Regular Drinker' : 
                                 currentProfile.dealbreakers.drinking}
                              </motion.span>
                            )}
                            {currentProfile.dealbreakers.smoking && (
                              <motion.span
                                whileHover={{ scale: 1.05, y: -1 }}
                                className="px-4 py-2 bg-white border-2 border-[#64B5F6] text-[#64B5F6] rounded-xl text-sm font-semibold shadow-sm hover:bg-[#E3F2FD] hover:border-[#42A5F5] hover:shadow-md transition-all cursor-default inline-block"
                              >
                                {currentProfile.dealbreakers.smoking === 'non-smoker' ? 'Non-Smoker' : 
                                 currentProfile.dealbreakers.smoking === 'socially' ? 'Social Smoker' : 
                                 currentProfile.dealbreakers.smoking === 'regularly' ? 'Smoker' : 
                                 currentProfile.dealbreakers.smoking}
                              </motion.span>
                            )}
                            {currentProfile.dealbreakers.kids && (
                              <motion.span
                                whileHover={{ scale: 1.05, y: -1 }}
                                className="px-4 py-2 bg-white border-2 border-[#64B5F6] text-[#64B5F6] rounded-xl text-sm font-semibold shadow-sm hover:bg-[#E3F2FD] hover:border-[#42A5F5] hover:shadow-md transition-all cursor-default inline-block"
                              >
                                {currentProfile.dealbreakers.kids === 'want-kids' ? 'Wants Kids' : 
                                 currentProfile.dealbreakers.kids === 'have-kids' ? 'Has Kids' : 
                                 currentProfile.dealbreakers.kids === 'dont-want' ? "Doesn't Want Kids" : 
                                 currentProfile.dealbreakers.kids}
                              </motion.span>
                            )}
                            {currentProfile.dealbreakers.pets && (
                              <motion.span
                                whileHover={{ scale: 1.05, y: -1 }}
                                className="px-4 py-2 bg-white border-2 border-[#64B5F6] text-[#64B5F6] rounded-xl text-sm font-semibold shadow-sm hover:bg-[#E3F2FD] hover:border-[#42A5F5] hover:shadow-md transition-all cursor-default inline-block"
                              >
                                {currentProfile.dealbreakers.pets === 'love-pets' ? 'Loves Pets' : 
                                 currentProfile.dealbreakers.pets === 'have-pets' ? 'Has Pets' : 
                                 currentProfile.dealbreakers.pets === 'no-pets' ? 'No Pets' : 
                                 currentProfile.dealbreakers.pets}
                              </motion.span>
                            )}
                          </div>
                        </motion.div>
                      )}

                      {/* Prompts Section */}
                      {currentProfile.optional?.prompts && currentProfile.optional.prompts.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.55 }}
                          className="bg-white rounded-3xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-[#E0E0E0] hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] transition-all duration-300"
                        >
                          <div className="flex items-center gap-3 mb-5">
                            <MessageSquare className="w-5 h-5 text-[#64B5F6]" />
                            <h3 className="text-base font-bold text-[#1A1A1A] tracking-tight">Prompts</h3>
                          </div>
                          <div className="space-y-3">
                            {currentProfile.optional.prompts.map((prompt, idx) => (
                              <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 + idx * 0.05 }}
                                whileHover={{ scale: 1.02, y: -2 }}
                                className="bg-gradient-to-br from-[#F5F7FA] to-[#E8ECF1] rounded-2xl p-5 border border-[#E0E0E0] shadow-sm hover:shadow-md transition-all"
                              >
                                <p className="text-base font-bold text-[#1A1A1A] mb-3 tracking-tight">
                                  {prompt.prompt}
                                </p>
                                {prompt.answer && (
                                  <p className="text-sm text-[#616161] leading-relaxed font-medium">
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
              // Profiles exist but currentProfile is not set - ensure index is valid
              (() => {
                if (profiles.length > 0 && currentIndex >= profiles.length) {
                    setCurrentIndex(0);
                }
                return (
                  <div className="flex items-center justify-center min-h-[400px] w-full">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#64B5F6] mx-auto mb-4"></div>
                      <p className="text-[#616161] font-medium">Loading profile...</p>
            </div>
                  </div>
                );
              })()
            )
          ) : (
            // Empty state - No profiles found
            <div className="flex items-center justify-center min-h-[400px] w-full">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center px-4"
              >
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_8px_24px_rgba(0,0,0,0.1)] border border-[#E8E8E8]">
                  <Users className="w-12 h-12 text-[#64B5F6]" />
                </div>
                <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2 tracking-tight">No profiles found</h2>
                <p className="text-[#616161] mb-6 max-w-md mx-auto font-medium">
                  We couldn't find any profiles matching your preferences. Try adjusting your filters or complete your profile to see more people.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <motion.button
                    onClick={() => navigate('/filters')}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 bg-[#64B5F6] hover:bg-[#42A5F5] text-white rounded-xl font-semibold shadow-[0_4px_16px_rgba(100,181,246,0.3)] hover:shadow-[0_8px_24px_rgba(100,181,246,0.4)] transition-all"
                  >
                    Adjust Filters
                  </motion.button>
                  <motion.button
                    onClick={() => navigate('/profile')}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 bg-white border border-[#64B5F6] text-[#64B5F6] rounded-xl font-semibold hover:bg-[#E3F2FD] transition-all shadow-sm"
                  >
                    Complete Profile
                  </motion.button>
                </div>
              </motion.div>
            </div>
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
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-[0_20px_60px_rgba(0,0,0,0.3)] border border-[#E8E8E8] relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#64B5F6]/5 to-transparent"></div>
              <div className="text-center mb-6">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                  className="w-20 h-20 bg-gradient-to-br from-[#FFD700] via-[#FFA500] to-[#FFD700] rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent"></div>
                  <Crown className="w-10 h-10 text-white relative z-10" />
                </motion.div>
                <h3 className="text-2xl font-bold text-[#1A1A1A] mb-2 relative z-10 tracking-tight">
                  Upgrade to Premium
                </h3>
                <p className="text-sm text-[#616161] relative z-10 font-medium">
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
                    className="flex items-center gap-3 text-sm text-[#1A1A1A]"
                  >
                    <div className="w-6 h-6 bg-[#4CAF50] rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="font-medium">{feature}</span>
                  </motion.div>
                ))}
              </div>

              <div className="flex gap-3 relative z-10">
                <motion.button
                  onClick={() => setShowPremiumPrompt(false)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 px-4 py-3 border border-[#E0E0E0] text-[#1A1A1A] rounded-xl font-semibold hover:border-[#757575] hover:bg-[#F5F5F5] transition-all shadow-sm"
                >
                  Maybe Later
                </motion.button>
                <motion.button
                  onClick={handleUpgradePremium}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 px-4 py-3 bg-[#64B5F6] hover:bg-[#42A5F5] text-white rounded-xl font-semibold hover:shadow-[0_8px_24px_rgba(100,181,246,0.4)] transition-all shadow-[0_4px_16px_rgba(100,181,246,0.3)]"
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
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-[0_20px_60px_rgba(0,0,0,0.3)] border border-[#E8E8E8] relative overflow-hidden"
            >
              {/* Decorative Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#64B5F6]/10 to-transparent"></div>
              
              {/* Close Button */}
              <button
                onClick={() => {
                  setShowMatchModal(false);
                  setMatchedProfile(null);
                }}
                className="absolute top-4 right-4 p-2 hover:bg-[#F5F5F5] rounded-full transition-colors z-10"
              >
                <X className="w-5 h-5 text-[#616161]" />
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
                    className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] mb-2 tracking-tight"
                  >
                    It's a Match!
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-lg text-[#616161] mb-6 font-medium"
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
                    <div className="absolute inset-0 bg-gradient-to-br from-[#64B5F6] to-[#42A5F5] rounded-full p-1">
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
                    className="flex-1 px-6 py-3.5 bg-white border border-[#64B5F6] text-[#64B5F6] rounded-xl font-semibold hover:bg-[#E3F2FD] transition-all shadow-sm"
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
                    className="flex-1 px-6 py-3.5 bg-[#64B5F6] hover:bg-[#42A5F5] text-white rounded-xl font-semibold hover:shadow-[0_8px_24px_rgba(100,181,246,0.4)] transition-all shadow-[0_4px_16px_rgba(100,181,246,0.3)]"
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
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-[0_20px_60px_rgba(0,0,0,0.3)] border border-[#E8E8E8] relative overflow-hidden"
            >
              {/* Decorative Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#64B5F6]/10 to-transparent"></div>
              
              {/* Close Button */}
              <button
                onClick={() => setShowCompleteDetailsModal(false)}
                className="absolute top-4 right-4 p-2 hover:bg-[#F5F5F5] rounded-full transition-colors z-10"
              >
                <X className="w-5 h-5 text-[#616161]" />
              </button>

              <div className="text-center relative z-10">
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.2 }}
                  className="mb-6"
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-[#64B5F6] to-[#42A5F5] rounded-full flex items-center justify-center mx-auto shadow-lg">
                    <UserCircle className="w-10 h-10 text-white" />
                  </div>
                </motion.div>

                {/* Message */}
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] mb-3 tracking-tight"
                >
                  Complete Your Profile
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-base text-[#616161] mb-6 font-medium"
                >
                  To swipe, you have to complete your details first.
                </motion.p>

                {/* Action Button */}
                <div className="flex justify-center mt-6">
                  <motion.button
                    onClick={() => {
                      setShowCompleteDetailsModal(false);
                      // Navigate to onboarding page - it will automatically find and show first incomplete step
                      navigate('/onboarding', { 
                        state: { 
                          showOnlyIncomplete: true
                        }
                      });
                    }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-3.5 bg-[#64B5F6] hover:bg-[#42A5F5] text-white rounded-xl font-semibold hover:shadow-[0_8px_24px_rgba(100,181,246,0.4)] transition-all shadow-[0_4px_16px_rgba(100,181,246,0.3)]"
                  >
                    Complete Profile
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation Bar - Mobile Only */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 backdrop-blur-xl bg-white/80 border-t border-[#E0E0E0]/50 shadow-[0_-8px_32px_rgba(0,0,0,0.06)]">
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
            onClick={() => {
              // Navigate to people/swiping page
              navigate('/people');
              setShowMatches(false);
            }}
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
            <div className="relative inline-block">
              <Heart className={`w-5 h-5 ${location.pathname === '/liked-you' ? 'text-[#64B5F6] fill-[#64B5F6]' : 'text-[#616161]'}`} />
              {likes.length > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-[#64B5F6] text-white text-[10px] rounded-full flex items-center justify-center font-bold transform translate-x-1/2 -translate-y-1/2">
                  {likes.length}
                </span>
              )}
            </div>
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
            <div className="relative inline-block">
              <MessageCircle className={`w-5 h-5 ${location.pathname === '/chats' ? 'text-[#64B5F6]' : 'text-[#616161]'}`} />
              {matches.length > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-[#64B5F6] text-white text-[10px] rounded-full flex items-center justify-center font-bold transform translate-x-1/2 -translate-y-1/2">
                  {matches.length}
                </span>
              )}
            </div>
            <span className={`text-xs font-medium ${location.pathname === '/chats' ? 'text-[#64B5F6]' : 'text-[#616161]'}`}>
              Chats
            </span>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
