import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, Heart, Eye, Crown, Sparkles, 
  MessageCircle, X, Lock, Star, UserCircle, Users, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockProfiles, calculateDistance } from '../data/mockProfiles';

export default function LikedYouPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isPremium, setIsPremium] = useState(false);
  const [likedYouProfiles, setLikedYouProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [currentUserLocation, setCurrentUserLocation] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'new', 'nearby'

  useEffect(() => {
    // Check premium status
    const savedPremium = localStorage.getItem('isPremium');
    if (savedPremium) {
      setIsPremium(JSON.parse(savedPremium) === true);
    }

    // Load current user location
    const onboardingData = localStorage.getItem('onboardingData');
    if (onboardingData) {
      try {
        const onboarding = JSON.parse(onboardingData);
        setCurrentUserLocation({
          city: onboarding.step2?.city || 'Mumbai',
          lat: 19.0760,
          lng: 72.8777
        });
      } catch (e) {
        console.error('Error loading user location:', e);
      }
    }

    // Load profiles who liked you
    loadLikedYouProfiles();
  }, []);

  const loadLikedYouProfiles = () => {
    // In a real app, this would come from backend
    // For now, we'll simulate by getting some profiles and marking them as "liked you"
    const savedLikes = localStorage.getItem('discoveryLikes');
    const userLikes = savedLikes ? JSON.parse(savedLikes) : [];
    
    // Get profiles that user hasn't liked yet (simulating they liked you)
    const availableProfiles = mockProfiles.filter(profile => 
      !userLikes.includes(profile.id)
    );

    // Simulate some profiles that liked you
    // In real app, this would be from backend API
    const simulatedLikedYou = availableProfiles.slice(0, 8).map(profile => ({
      ...profile,
      likedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(), // Random time in last 7 days
      isNew: Math.random() > 0.5 // Random new/old
    }));

    setLikedYouProfiles(simulatedLikedYou);
  };

  const handleLike = (profileId) => {
    // Add to user's likes
    const savedLikes = localStorage.getItem('discoveryLikes');
    const userLikes = savedLikes ? JSON.parse(savedLikes) : [];
    
    if (!userLikes.includes(profileId)) {
      userLikes.push(profileId);
      localStorage.setItem('discoveryLikes', JSON.stringify(userLikes));
    }

    // Check for match
    const savedMatches = localStorage.getItem('discoveryMatches');
    const matches = savedMatches ? JSON.parse(savedMatches) : [];
    
    // In real app, backend would check if they also liked you
    // For now, simulate a match
    const isMatch = Math.random() > 0.7; // 30% chance of match
    
    if (isMatch) {
      const newMatch = {
        userId: profileId,
        matchedAt: new Date().toISOString()
      };
      matches.push(newMatch);
      localStorage.setItem('discoveryMatches', JSON.stringify(matches));
      
      // Show match animation
      alert(`🎉 It's a Match! You and ${mockProfiles.find(p => p.id === profileId)?.name} liked each other!`);
      navigate('/chats');
    } else {
      // Remove from liked you list
      setLikedYouProfiles(prev => prev.filter(p => p.id !== profileId));
      alert(`You liked ${mockProfiles.find(p => p.id === profileId)?.name}! They'll see your like.`);
    }
  };

  const handlePass = (profileId) => {
    // Add to passes
    const savedPasses = localStorage.getItem('discoveryPasses');
    const passes = savedPasses ? JSON.parse(savedPasses) : [];
    
    if (!passes.includes(profileId)) {
      passes.push(profileId);
      localStorage.setItem('discoveryPasses', JSON.stringify(passes));
    }

    // Remove from liked you list
    setLikedYouProfiles(prev => prev.filter(p => p.id !== profileId));
  };

  const getDistance = (profile) => {
    if (!currentUserLocation) return 'N/A';
    return calculateDistance(
      currentUserLocation.lat,
      currentUserLocation.lng,
      profile.location?.lat || 19.0760,
      profile.location?.lng || 72.8777
    );
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  // Calculate filter counts
  const allCount = likedYouProfiles.length;
  const newCount = likedYouProfiles.filter(p => p.isNew).length;
  const nearbyCount = likedYouProfiles.filter(p => {
    if (!currentUserLocation) return false;
    const distance = getDistance(p);
    return distance <= 30; // Within 30 km
  }).length;

  // If not premium, show premium prompt with new design
  if (!isPremium) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] via-[#E8ECF1] to-[#F5F7FA] flex flex-col relative overflow-hidden">
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
          className="fixed top-0 left-0 right-0 z-30 backdrop-blur-xl bg-white/80 border-b border-[#E0E0E0]/50 shadow-[0_8px_32px_rgba(0,0,0,0.06)]"
        >
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-5 sm:py-6">
            <div className="flex items-center justify-center">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] tracking-tight">
                Liked You
              </h1>
            </div>
          </div>
        </motion.div>

        {/* Content - with padding for fixed header */}
        <div className="flex-1 overflow-y-auto scrollbar-hide pb-24 relative z-10 pt-24 sm:pt-28 md:ml-16">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
            {/* Descriptive Text */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-base sm:text-lg text-[#616161] text-center mb-5 font-medium"
            >
              See who likes you and match with them instantly, with Premium.
            </motion.p>

            {/* Filter Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="flex gap-3 mb-6 overflow-x-auto scrollbar-hide pb-2"
            >
              <motion.button
                onClick={() => setActiveFilter('all')}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm whitespace-nowrap transition-all shadow-sm ${
                  activeFilter === 'all'
                    ? 'bg-[#64B5F6] text-white shadow-[0_4px_16px_rgba(100,181,246,0.3)]'
                    : 'bg-white text-[#1A1A1A] border border-[#E0E0E0] hover:border-[#64B5F6] hover:shadow-md'
                }`}
              >
                {activeFilter === 'all' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500 }}
                  >
                    <Check className="w-4 h-4" />
                  </motion.div>
                )}
                <span>All</span>
                <span className="text-xs font-bold">• {allCount > 50 ? '50+' : allCount}</span>
              </motion.button>
              
              <motion.button
                onClick={() => setActiveFilter('new')}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm whitespace-nowrap transition-all shadow-sm ${
                  activeFilter === 'new'
                    ? 'bg-[#64B5F6] text-white shadow-[0_4px_16px_rgba(100,181,246,0.3)]'
                    : 'bg-white text-[#1A1A1A] border border-[#E0E0E0] hover:border-[#64B5F6] hover:shadow-md'
                }`}
              >
                {activeFilter === 'new' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500 }}
                  >
                    <Check className="w-4 h-4" />
                  </motion.div>
                )}
                <span>New</span>
                <span className="text-xs font-bold">• {newCount > 50 ? '50+' : newCount}</span>
              </motion.button>
              
              <motion.button
                onClick={() => setActiveFilter('nearby')}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm whitespace-nowrap transition-all shadow-sm ${
                  activeFilter === 'nearby'
                    ? 'bg-[#64B5F6] text-white shadow-[0_4px_16px_rgba(100,181,246,0.3)]'
                    : 'bg-white text-[#1A1A1A] border border-[#E0E0E0] hover:border-[#64B5F6] hover:shadow-md'
                }`}
              >
                {activeFilter === 'nearby' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500 }}
                  >
                    <Check className="w-4 h-4" />
                  </motion.div>
                )}
                <span>Nearby</span>
                <span className="text-xs font-bold">• {nearbyCount > 30 ? '30+' : nearbyCount}</span>
              </motion.button>
            </motion.div>

            {/* Blurred Profile Boxes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 sm:gap-6">
                {likedYouProfiles.slice(0, 4).map((profile, index) => (
                  <motion.div
                    key={profile.id}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 0.25 + index * 0.05, type: "spring", stiffness: 200 }}
                    className="relative rounded-3xl overflow-hidden shadow-xl border-2 border-white/50"
                    style={{ filter: 'blur(20px)' }}
                  >
                    <div className="aspect-[3/4] relative overflow-hidden bg-gradient-to-br from-[#E3F2FD] to-[#BBDEFB]">
                      <img
                        src={profile.photos?.[0] || `https://ui-avatars.com/api/?name=${profile.name}&background=FF1744&color=fff&size=400`}
                        alt={profile.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                        <div className="h-4 bg-white/40 rounded-full mb-2 w-24 shadow-md"></div>
                        <div className="h-3 bg-white/30 rounded-full w-20 shadow-md"></div>
                      </div>
                    </div>
                    {/* Lock Icon Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-black/30 to-black/50 backdrop-blur-sm">
                      <motion.div
                        animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-14 h-14 bg-gradient-to-br from-white to-white/90 rounded-full flex items-center justify-center shadow-2xl border-2 border-white/50"
                      >
                        <Lock className="w-7 h-7 text-[#64B5F6]" />
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
                {/* If less than 4 profiles, show placeholder boxes */}
                {Array.from({ length: Math.max(0, 4 - likedYouProfiles.length) }).map((_, index) => (
                  <motion.div
                    key={`placeholder-${index}`}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 0.25 + (likedYouProfiles.length + index) * 0.05, type: "spring", stiffness: 200 }}
                    className="relative rounded-3xl overflow-hidden shadow-xl border-2 border-white/50"
                    style={{ filter: 'blur(20px)' }}
                  >
                    <div className="aspect-[3/4] relative overflow-hidden bg-gradient-to-br from-[#FFE4E1] via-[#FF91A4] to-[#FF69B4]">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                        <div className="h-4 bg-white/40 rounded-full mb-2 w-24 shadow-md"></div>
                        <div className="h-3 bg-white/30 rounded-full w-20 shadow-md"></div>
                      </div>
                    </div>
                    {/* Lock Icon Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-black/30 to-black/50 backdrop-blur-sm">
                      <motion.div
                        animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-14 h-14 bg-gradient-to-br from-white to-white/90 rounded-full flex items-center justify-center shadow-2xl border-2 border-white/50"
                      >
                        <Lock className="w-7 h-7 text-[#64B5F6]" />
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* See Who Likes You Button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              onClick={() => navigate('/premium')}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 sm:py-5 bg-[#64B5F6] hover:bg-[#42A5F5] text-white rounded-2xl font-semibold text-lg sm:text-xl shadow-[0_8px_24px_rgba(100,181,246,0.4)] hover:shadow-[0_12px_32px_rgba(100,181,246,0.5)] transition-all mt-6 relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <Crown className="w-5 h-5 sm:w-6 sm:h-6" />
                See who likes you
              </span>
            </motion.button>
          </div>
        </div>

        {/* Bottom Navigation Bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 backdrop-blur-xl bg-white/80 border-t border-[#E0E0E0]/50 shadow-[0_-8px_32px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-around px-2 py-2">
            {/* Profile */}
            <motion.button
              onClick={() => navigate('/profile')}
              whileTap={{ scale: 0.9 }}
              className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors relative"
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
              <Heart className={`w-5 h-5 ${location.pathname === '/liked-you' ? 'text-[#64B5F6] fill-[#64B5F6]' : 'text-[#616161]'}`} />
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] via-[#E8ECF1] to-[#F5F7FA] flex flex-col relative overflow-hidden">
      {/* Premium Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-[#64B5F6]/8 to-transparent rounded-full blur-3xl -translate-x-1/3 -translate-y-1/3"></div>
      <div className="absolute bottom-0 right-0 w-[700px] h-[700px] bg-gradient-to-tl from-[#42A5F5]/8 to-transparent rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-[#90CAF9]/5 to-transparent rounded-full blur-3xl"></div>

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
        className="fixed top-0 left-0 right-0 z-30 backdrop-blur-xl bg-white/80 border-b border-[#E0E0E0]/50 shadow-[0_8px_32px_rgba(0,0,0,0.06)]"
      >
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-5 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.button
                onClick={() => navigate(-1)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 hover:bg-[#F5F5F5] rounded-xl transition-all duration-200"
              >
                <ArrowLeft className="w-5 h-5 text-[#616161]" />
              </motion.button>
              <Eye className="w-5 h-5 text-[#64B5F6]" />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] tracking-tight">
                  Who Liked You
                </h1>
                <p className="text-xs sm:text-sm text-[#757575] font-medium mt-0.5">
                  {likedYouProfiles.length} {likedYouProfiles.length === 1 ? 'person' : 'people'} liked you
                </p>
              </div>
            </div>
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-12 h-12 bg-gradient-to-br from-[#FFD700] via-[#FFA500] to-[#FFD700] rounded-2xl flex items-center justify-center shadow-lg relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
              <Crown className="w-6 h-6 text-white relative z-10" />
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Content - with padding for fixed header */}
      <div className="flex-1 overflow-y-auto scrollbar-hide pb-24 relative z-10 pt-24 sm:pt-28 md:ml-16">
        {likedYouProfiles.length === 0 ? (
          <div className="flex items-center justify-center h-full px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_8px_24px_rgba(0,0,0,0.1)] border border-[#E8E8E8]"
              >
                <Heart className="w-12 h-12 text-[#64B5F6]" />
              </motion.div>
              <h3 className="text-2xl font-bold text-[#1A1A1A] mb-2 tracking-tight">No Likes Yet</h3>
              <p className="text-sm text-[#616161] mb-6 font-medium">
                Keep swiping! When someone likes you, they'll appear here.
              </p>
              <motion.button
                onClick={() => navigate('/discover')}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-[#64B5F6] hover:bg-[#42A5F5] text-white rounded-xl font-semibold shadow-[0_4px_16px_rgba(100,181,246,0.3)] hover:shadow-[0_8px_24px_rgba(100,181,246,0.4)] transition-all"
              >
                Start Discovering
              </motion.button>
            </motion.div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
              {likedYouProfiles.map((profile, index) => (
                <motion.div
                  key={profile.id}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: index * 0.05, type: "spring", stiffness: 200 }}
                  className="relative group cursor-pointer"
                  onClick={() => setSelectedProfile(profile)}
                  whileHover={{ y: -5 }}
                >
                  <div className="relative rounded-3xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-[#E8E8E8] hover:border-[#64B5F6] hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] transition-all bg-white">
                    {/* Profile Image */}
                    <div className="aspect-[3/4] relative overflow-hidden bg-gradient-to-br from-[#E3F2FD] to-[#BBDEFB]">
                      <motion.img
                        src={profile.photos?.[0] || `https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=600&fit=crop`}
                        alt={profile.name}
                        className="w-full h-full object-cover"
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.3 }}
                      />
                      {/* New Badge */}
                      {profile.isNew && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-3 left-3 px-3 py-1.5 bg-gradient-to-r from-[#4CAF50] to-[#2E7D32] text-white text-xs font-bold rounded-full flex items-center gap-1.5 shadow-lg"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>NEW</span>
                        </motion.div>
                      )}
                      {/* Premium Badge */}
                      <motion.div 
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute top-3 right-3 w-8 h-8 bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-full flex items-center justify-center shadow-lg"
                      >
                        <Crown className="w-4 h-4 text-white" />
                      </motion.div>
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      {/* Info */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                        <h3 className="font-bold text-base mb-1 drop-shadow-lg">{profile.name}</h3>
                        <p className="text-xs opacity-95 drop-shadow-md mb-1">
                          {profile.age} • {getDistance(profile)} km
                        </p>
                        <p className="text-xs opacity-80 drop-shadow-sm">
                          {formatTimeAgo(profile.likedAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Profile Detail Modal */}
      <AnimatePresence>
        {selectedProfile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedProfile(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] max-w-md w-full max-h-[90vh] overflow-hidden border border-[#E8E8E8]"
            >
              {/* Image Carousel */}
              <div className="relative h-96 bg-gradient-to-br from-[#E3F2FD] to-[#BBDEFB]">
                <img
                  src={selectedProfile.photos?.[0] || `https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=600&fit=crop`}
                  alt={selectedProfile.name}
                  className="w-full h-full object-cover"
                />
                  <button
                    onClick={() => setSelectedProfile(null)}
                    className="absolute top-4 right-4 w-10 h-10 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                  >
                    <X className="w-5 h-5 text-[#616161]" />
                  </button>
                  {selectedProfile.isNew && (
                    <div className="absolute top-4 left-4 px-3 py-1 bg-[#4CAF50] text-white text-xs font-bold rounded-full flex items-center gap-1 shadow-sm">
                      <Sparkles className="w-3 h-3" />
                      <span>NEW</span>
                    </div>
                  )}
              </div>

              {/* Profile Info */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-24rem)]">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-[#1A1A1A] mb-1 tracking-tight">
                      {selectedProfile.name}, {selectedProfile.age}
                    </h2>
                    <p className="text-sm text-[#616161] font-medium">
                      {getDistance(selectedProfile)} km away • {formatTimeAgo(selectedProfile.likedAt)}
                    </p>
                  </div>
                </div>

                {selectedProfile.bio && (
                  <p className="text-sm text-[#1A1A1A] mb-4 font-medium">{selectedProfile.bio}</p>
                )}

                {selectedProfile.interests && selectedProfile.interests.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-[#1A1A1A] mb-2 tracking-tight">Interests</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedProfile.interests.slice(0, 6).map((interest, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-white border-2 border-[#64B5F6] text-[#64B5F6] rounded-xl text-xs font-semibold shadow-sm"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6">
                  <motion.button
                    onClick={() => {
                      handlePass(selectedProfile.id);
                      setSelectedProfile(null);
                    }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 px-4 py-3 border border-[#E0E0E0] text-[#1A1A1A] rounded-xl font-semibold hover:border-[#757575] hover:bg-[#F5F5F5] transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <X className="w-5 h-5" />
                    <span>Pass</span>
                  </motion.button>
                  <motion.button
                    onClick={() => {
                      handleLike(selectedProfile.id);
                      setSelectedProfile(null);
                    }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 px-4 py-3 bg-[#64B5F6] hover:bg-[#42A5F5] text-white rounded-xl font-semibold shadow-[0_4px_16px_rgba(100,181,246,0.3)] hover:shadow-[0_8px_24px_rgba(100,181,246,0.4)] transition-all flex items-center justify-center gap-2"
                  >
                    <Heart className="w-5 h-5" />
                    <span>Like Back</span>
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
            <Heart className={`w-5 h-5 ${location.pathname === '/liked-you' ? 'text-[#64B5F6] fill-[#64B5F6]' : 'text-[#616161]'}`} />
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

