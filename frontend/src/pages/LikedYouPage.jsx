import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Heart, Eye, Crown, Sparkles, 
  MessageCircle, X, Lock, Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockProfiles, calculateDistance } from '../data/mockProfiles';

export default function LikedYouPage() {
  const navigate = useNavigate();
  const [isPremium, setIsPremium] = useState(false);
  const [likedYouProfiles, setLikedYouProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [currentUserLocation, setCurrentUserLocation] = useState(null);

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

  // If not premium, show premium prompt
  if (!isPremium) {
    return (
      <div className="h-screen heart-background flex flex-col relative overflow-hidden">
        <span className="heart-decoration">💕</span>
        <span className="heart-decoration">💖</span>
        <span className="heart-decoration">💗</span>
        <div className="decoration-circle"></div>
        <div className="decoration-circle"></div>

        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="relative z-20 bg-white/95 backdrop-blur-md border-b-2 border-[#FFB6C1] shadow-sm"
        >
          <div className="max-w-2xl mx-auto px-4 py-3">
            <div className="flex items-center gap-3">
              <motion.button
                onClick={() => navigate(-1)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-1.5 hover:bg-[#FFE4E1] rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-[#212121]" />
              </motion.button>
              <div className="w-10 h-10 bg-gradient-to-br from-[#FF91A4] to-[#FF69B4] rounded-lg flex items-center justify-center shadow-md">
                <Eye className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#212121]">Who Liked You</h1>
                <p className="text-xs text-[#757575]">See who's interested in you</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Premium Lock Screen */}
        <div className="flex-1 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-20 h-20 bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
            >
              <Lock className="w-10 h-10 text-white" />
            </motion.div>
            <h2 className="text-2xl font-bold text-[#212121] mb-2">Premium Feature 🔒</h2>
            <p className="text-sm text-[#757575] mb-6">
              Upgrade to Premium to see who liked your profile!
            </p>
            <div className="space-y-3 mb-6">
              {[
                'See all profiles who liked you',
                'Get notified when someone likes you',
                'Unlimited likes to match back',
                'Priority in their discovery feed'
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
            <motion.button
              onClick={() => navigate('/premium')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full px-6 py-3 bg-gradient-to-r from-[#FF91A4] to-[#FF69B4] text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <Crown className="w-5 h-5" />
              <span>Upgrade to Premium</span>
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen heart-background flex flex-col relative overflow-hidden">
      <span className="heart-decoration">💕</span>
      <span className="heart-decoration">💖</span>
      <span className="heart-decoration">💗</span>
      <span className="heart-decoration">💝</span>
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
            <div className="flex items-center gap-3">
              <motion.button
                onClick={() => navigate(-1)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-1.5 hover:bg-[#FFE4E1] rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-[#212121]" />
              </motion.button>
              <div className="w-10 h-10 bg-gradient-to-br from-[#FF91A4] to-[#FF69B4] rounded-lg flex items-center justify-center shadow-md">
                <Eye className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#212121]">Who Liked You</h1>
                <p className="text-xs text-[#757575]">
                  {likedYouProfiles.length} {likedYouProfiles.length === 1 ? 'person' : 'people'} liked you
                </p>
              </div>
            </div>
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-8 h-8 bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-full flex items-center justify-center shadow-md"
            >
              <Crown className="w-4 h-4 text-white" />
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide pt-4 pb-20">
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
                className="w-24 h-24 bg-[#FFE4E1] rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <Heart className="w-12 h-12 text-[#FF91A4]" />
              </motion.div>
              <h3 className="text-xl font-bold text-[#212121] mb-2">No Likes Yet</h3>
              <p className="text-sm text-[#757575] mb-6">
                Keep swiping! When someone likes you, they'll appear here.
              </p>
              <motion.button
                onClick={() => navigate('/discover')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-gradient-to-r from-[#FF91A4] to-[#FF69B4] text-white rounded-xl font-semibold shadow-lg"
              >
                Start Discovering
              </motion.button>
            </motion.div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto px-4 py-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {likedYouProfiles.map((profile, index) => (
                <motion.div
                  key={profile.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative group cursor-pointer"
                  onClick={() => setSelectedProfile(profile)}
                >
                  <div className="relative rounded-2xl overflow-hidden shadow-lg border-2 border-[#FFB6C1] hover:border-[#FF91A4] transition-all">
                    {/* Profile Image */}
                    <div className="aspect-[3/4] relative overflow-hidden bg-gradient-to-br from-[#FFE4E1] to-[#FFF0F5]">
                      <img
                        src={profile.photos?.[0] || `https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=600&fit=crop`}
                        alt={profile.name}
                        className="w-full h-full object-cover"
                      />
                      {/* New Badge */}
                      {profile.isNew && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-2 left-2 px-2 py-1 bg-[#4CAF50] text-white text-xs font-bold rounded-full flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>NEW</span>
                        </motion.div>
                      )}
                      {/* Premium Badge */}
                      <div className="absolute top-2 right-2 w-6 h-6 bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-full flex items-center justify-center shadow-md">
                        <Crown className="w-3 h-3 text-white" />
                      </div>
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      {/* Info */}
                      <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                        <h3 className="font-bold text-sm mb-1">{profile.name}</h3>
                        <p className="text-xs opacity-90">
                          {profile.age} • {getDistance(profile)} km
                        </p>
                        <p className="text-xs opacity-75 mt-1">
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
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden"
            >
              {/* Image Carousel */}
              <div className="relative h-96 bg-gradient-to-br from-[#FFE4E1] to-[#FFF0F5]">
                <img
                  src={selectedProfile.photos?.[0] || `https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=600&fit=crop`}
                  alt={selectedProfile.name}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setSelectedProfile(null)}
                  className="absolute top-4 right-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                >
                  <X className="w-5 h-5 text-[#212121]" />
                </button>
                {selectedProfile.isNew && (
                  <div className="absolute top-4 left-4 px-3 py-1 bg-[#4CAF50] text-white text-xs font-bold rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>NEW</span>
                  </div>
                )}
              </div>

              {/* Profile Info */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-24rem)]">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-[#212121] mb-1">
                      {selectedProfile.name}, {selectedProfile.age}
                    </h2>
                    <p className="text-sm text-[#757575]">
                      {getDistance(selectedProfile)} km away • {formatTimeAgo(selectedProfile.likedAt)}
                    </p>
                  </div>
                </div>

                {selectedProfile.bio && (
                  <p className="text-sm text-[#212121] mb-4">{selectedProfile.bio}</p>
                )}

                {selectedProfile.interests && selectedProfile.interests.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-[#212121] mb-2">Interests</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedProfile.interests.slice(0, 6).map((interest, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-[#FFE4E1] text-[#FF91A4] rounded-full text-xs font-medium"
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
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 px-4 py-3 border-2 border-[#E0E0E0] text-[#212121] rounded-xl font-semibold hover:border-[#757575] transition-all flex items-center justify-center gap-2"
                  >
                    <X className="w-5 h-5" />
                    <span>Pass</span>
                  </motion.button>
                  <motion.button
                    onClick={() => {
                      handleLike(selectedProfile.id);
                      setSelectedProfile(null);
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-[#FF91A4] to-[#FF69B4] text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
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
    </div>
  );
}

