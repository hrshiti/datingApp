import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, MapPin, Heart, Star, Filter, ArrowRight, Users, Clock, TrendingUp, UserCircle, MessageCircle, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockProfiles, calculateMatchScore, calculateDistance } from '../data/mockProfiles';

export default function DiscoverPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const [recommendedProfiles, setRecommendedProfiles] = useState([]);
  const [newTodayProfiles, setNewTodayProfiles] = useState([]);
  const [nearYouProfiles, setNearYouProfiles] = useState([]);
  const [similarInterestsProfiles, setSimilarInterestsProfiles] = useState([]);
  const [isPremium, setIsPremium] = useState(false);

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
          lat: onboarding.step2?.location?.lat || 19.0760,
          lng: onboarding.step2?.location?.lng || 72.8777
        },
        ageRange: onboarding.step2?.ageRange || { min: 18, max: 100 },
        distancePref: onboarding.step2?.distancePref || 25
      };

      setCurrentUserProfile(userProfile);
      loadProfiles(userProfile);
    } catch (e) {
      console.error('Error loading user data:', e);
      navigate('/profile-setup');
    }

    const savedPremium = localStorage.getItem('isPremium');
    if (savedPremium) setIsPremium(JSON.parse(savedPremium) === true);
  }, [navigate]);

  const loadProfiles = (userProfile) => {
    const savedLikes = localStorage.getItem('discoveryLikes');
    const savedPasses = localStorage.getItem('discoveryPasses');
    const loadedLikes = savedLikes ? JSON.parse(savedLikes) : [];
    const loadedPasses = savedPasses ? JSON.parse(savedPasses) : [];

    // Filter out already liked/passed profiles
    const availableProfiles = mockProfiles.filter(profile => 
      !loadedLikes.includes(profile.id) && !loadedPasses.includes(profile.id)
    );

    // Calculate match scores and sort
    const scoredProfiles = availableProfiles
      .map(profile => {
        const matchResult = calculateMatchScore(userProfile, profile);
        const distance = userProfile.location && profile.location 
          ? calculateDistance(
              userProfile.location.lat,
              userProfile.location.lng,
              profile.location.lat,
              profile.location.lng
            )
          : null;
        return {
          ...profile,
          matchScore: matchResult.score,
          reasons: matchResult.reasons,
          distance
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore);

    // Recommended for You - Top 6 highest match scores
    setRecommendedProfiles(scoredProfiles.slice(0, 6));

    // New Today - Random 4 profiles (simulating new profiles)
    const shuffled = [...scoredProfiles].sort(() => 0.5 - Math.random());
    setNewTodayProfiles(shuffled.slice(0, 4));

    // Near You - Sort by distance, take top 4
    const nearYou = scoredProfiles
      .filter(p => p.distance !== null && p.distance <= (userProfile.distancePref || 25))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 4);
    setNearYouProfiles(nearYou);

    // Similar Interests - Profiles with most common interests
    const similarInterests = scoredProfiles
      .map(profile => {
        const commonInterests = userProfile.interests.filter(interest =>
          profile.interests?.includes(interest)
        ).length;
        return { ...profile, commonInterests };
      })
      .filter(p => p.commonInterests > 0)
      .sort((a, b) => b.commonInterests - a.commonInterests)
      .slice(0, 4);
    setSimilarInterestsProfiles(similarInterests);
  };

  const ProfileCard = ({ profile, matchScore, distance, commonInterests, index = 0 }) => {
    const [imageError, setImageError] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        whileHover={{ scale: 1.02, y: -6 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={(e) => {
          e.stopPropagation();
          navigate('/premium');
        }}
        className="relative bg-gradient-to-br from-white to-[#FFF0F5] rounded-3xl overflow-hidden shadow-xl cursor-pointer border-2 border-[#FFB6C1]/30 hover:border-[#FF91A4] hover:shadow-2xl transition-all group"
      >
        {/* Profile Image */}
        <div className="relative h-72 overflow-hidden">
          {!imageError && profile.photos?.[0] ? (
            <motion.img
              src={profile.photos[0]}
              alt={profile.name}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover"
              animate={{ scale: isHovered ? 1.1 : 1 }}
              transition={{ duration: 0.3 }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#FFE4E1] to-[#FFF0F5] flex items-center justify-center">
              <Users className="w-20 h-20 text-[#FF91A4]" />
            </div>
          )}
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          
          {/* Match Score Badge */}
          {matchScore && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 + 0.2 }}
              className="absolute top-4 right-4 bg-gradient-to-r from-[#FF91A4] to-[#FF69B4] text-white px-4 py-2 rounded-full text-sm font-bold shadow-2xl flex items-center gap-1.5 z-10"
            >
              <Star className="w-4 h-4 fill-white" />
              {Math.round(matchScore)}% Match
            </motion.div>
          )}

          {/* Distance Badge */}
          {distance !== null && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 + 0.25 }}
              className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-semibold text-[#212121] flex items-center gap-1.5 shadow-lg z-10"
            >
              <MapPin className="w-3.5 h-3.5 text-[#FF91A4]" />
              {Math.round(distance)} km
            </motion.div>
          )}

          {/* View Profile Overlay on Hover */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-20"
              >
                <motion.div
                  initial={{ scale: 0.8, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.8, y: 20 }}
                  className="bg-white rounded-2xl px-6 py-3 flex items-center gap-2 shadow-2xl"
                >
                  <Eye className="w-5 h-5 text-[#FF91A4]" />
                  <span className="font-bold text-[#212121]">View Profile</span>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile Info */}
        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xl font-bold text-[#212121] mb-1">
                {profile.name}, {profile.age}
              </h3>
              {profile.optional?.profession && (
                <p className="text-sm text-[#757575]">
                  {profile.optional.profession}
                </p>
              )}
            </div>
            {commonInterests > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 + 0.3 }}
                className="text-xs font-semibold text-[#FF91A4] bg-gradient-to-r from-[#FFE4E1] to-[#FFF0F5] px-3 py-1.5 rounded-full border border-[#FFB6C1]/30"
              >
                {commonInterests} interests
              </motion.span>
            )}
          </div>
          
          {profile.bio && (
            <p className="text-sm text-[#757575] line-clamp-2 mb-3 leading-relaxed">
              {profile.bio}
            </p>
          )}

          {/* Interests Tags */}
          {profile.interests && profile.interests.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {profile.interests.slice(0, 3).map((interest, idx) => (
                <motion.span
                  key={idx}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.35 + idx * 0.05 }}
                  className="text-xs font-semibold bg-gradient-to-r from-[#FFE4E1] to-[#FFF0F5] text-[#FF91A4] px-3 py-1 rounded-full border border-[#FFB6C1]/30"
                >
                  {interest}
                </motion.span>
              ))}
              {profile.interests.length > 3 && (
                <span className="text-xs text-[#757575] px-2 py-1 font-medium">
                  +{profile.interests.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  const SectionHeader = ({ title, icon: Icon, subtitle, onViewAll, index = 0 }) => {
    const isRecommended = index === 0;
    return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="flex items-center justify-between gap-4 mb-6 flex-wrap"
    >
      <div className="flex items-center gap-4 flex-shrink-0">
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          className={`${isRecommended ? 'w-10 h-10' : 'w-14 h-14'} rounded-2xl bg-gradient-to-br from-[#FFE4E1] via-[#FFF0F5] to-[#FFE4E1] flex items-center justify-center shadow-lg border border-[#FFB6C1]/20 flex-shrink-0`}
        >
          <Icon className={`${isRecommended ? 'w-5 h-5' : 'w-7 h-7'} text-[#FF91A4]`} />
        </motion.div>
        <div className="flex flex-col">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#FF91A4] to-[#FF69B4] bg-clip-text text-transparent leading-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs sm:text-sm text-[#757575] mt-0.5 leading-tight">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {onViewAll && (
        <motion.button
          onClick={onViewAll}
          whileHover={{ scale: 1.05, x: 5 }}
          whileTap={{ scale: 0.95 }}
          className="text-sm font-semibold text-[#FF91A4] hover:text-[#FF69B4] flex items-center gap-2 transition-colors px-4 py-2 rounded-xl hover:bg-[#FFF0F5] flex-shrink-0 whitespace-nowrap"
        >
          View All
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      )}
    </motion.div>
    );
  };

  if (!currentUserProfile) {
    return (
      <div className="h-screen heart-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-[#FF91A4] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#212121] font-medium">Loading profiles...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen heart-background pb-20 sm:pb-0 relative overflow-hidden">
      <span className="heart-decoration">💕</span>
      <span className="heart-decoration">💖</span>
      <span className="heart-decoration">💗</span>
      <span className="heart-decoration">💝</span>
      <span className="heart-decoration">❤️</span>
      <span className="heart-decoration">💓</span>
      <div className="decoration-circle"></div>
      <div className="decoration-circle"></div>

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

      {/* Header - Fixed */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-30 bg-gradient-to-b from-white via-white/98 to-white/95 backdrop-blur-lg border-b border-[#FFB6C1]/30 shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[#FF91A4] to-[#FF69B4] bg-clip-text text-transparent">
                  Discover
                </h1>
                <p className="text-sm text-[#757575] font-medium mt-1">
                  Find your perfect match
                </p>
              </div>
            </div>
            
            <motion.button
              onClick={() => navigate('/filters')}
              whileHover={{ scale: 1.08, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="p-3.5 bg-gradient-to-br from-[#FFE4E1] to-[#FFF0F5] rounded-2xl hover:from-[#FF91A4] hover:to-[#FF69B4] transition-all shadow-lg hover:shadow-xl border-2 border-[#FFB6C1]/30 group"
            >
              <Filter className="w-4 h-4 text-[#FF91A4] group-hover:text-white transition-colors" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Content - with padding for fixed header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 relative z-10 pt-28 sm:pt-32 md:ml-16">
        {/* Recommended for You */}
        {recommendedProfiles.length > 0 && (
          <section className="mb-12">
            <SectionHeader
              title="Recommended for You"
              icon={Star}
              subtitle="Handpicked matches based on your preferences"
              onViewAll={() => navigate('/people')}
              index={0}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {recommendedProfiles.map((profile, idx) => (
                <ProfileCard
                  key={profile.id}
                  profile={profile}
                  matchScore={profile.matchScore}
                  distance={profile.distance}
                  index={idx}
                />
              ))}
            </div>
          </section>
        )}

        {/* New Today */}
        {newTodayProfiles.length > 0 && (
          <section className="mb-12">
            <SectionHeader
              title="New Today"
              icon={Clock}
              subtitle="Fresh profiles just joined"
              onViewAll={() => navigate('/people')}
              index={1}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
              {newTodayProfiles.map((profile, idx) => (
                <ProfileCard
                  key={profile.id}
                  profile={profile}
                  matchScore={profile.matchScore}
                  distance={profile.distance}
                  index={idx}
                />
              ))}
            </div>
          </section>
        )}

        {/* Near You */}
        {nearYouProfiles.length > 0 && (
          <section className="mb-12">
            <SectionHeader
              title="Near You"
              icon={MapPin}
              subtitle="People in your area"
              onViewAll={() => navigate('/people')}
              index={2}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
              {nearYouProfiles.map((profile, idx) => (
                <ProfileCard
                  key={profile.id}
                  profile={profile}
                  matchScore={profile.matchScore}
                  distance={profile.distance}
                  index={idx}
                />
              ))}
            </div>
          </section>
        )}

        {/* Similar Interests */}
        {similarInterestsProfiles.length > 0 && (
          <section className="mb-12">
            <SectionHeader
              title="Similar Interests"
              icon={TrendingUp}
              subtitle="People who share your passions"
              onViewAll={() => navigate('/people')}
              index={3}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
              {similarInterestsProfiles.map((profile, idx) => (
                <ProfileCard
                  key={profile.id}
                  profile={profile}
                  matchScore={profile.matchScore}
                  distance={profile.distance}
                  commonInterests={profile.commonInterests}
                  index={idx}
                />
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {recommendedProfiles.length === 0 && 
         newTodayProfiles.length === 0 && 
         nearYouProfiles.length === 0 && 
         similarInterestsProfiles.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-white to-[#FFF0F5] rounded-3xl shadow-2xl p-8 sm:p-12 text-center max-w-md mx-auto border-2 border-[#FFB6C1]/20"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
              className="w-28 h-28 bg-gradient-to-br from-[#FFE4E1] via-[#FFF0F5] to-[#FFE4E1] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
            >
              <Users className="w-14 h-14 text-[#FF91A4]" />
            </motion.div>
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#FF91A4] to-[#FF69B4] bg-clip-text text-transparent mb-3">
              No profiles found
            </h2>
            <p className="text-[#757575] mb-8">
              Try adjusting your filters or check back later for new matches!
            </p>
            <motion.button
              onClick={() => navigate('/filters')}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3.5 bg-gradient-to-r from-[#FF91A4] to-[#FF69B4] text-white rounded-xl font-semibold hover:shadow-xl transition-all shadow-lg"
            >
              Adjust Filters
            </motion.button>
          </motion.div>
        )}

        {/* CTA to Start Swiping */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 bg-gradient-to-r from-[#FF91A4] via-[#FF69B4] to-[#FF91A4] rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <div className="relative z-10">
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Ready to start swiping?
            </h3>
            <p className="text-white/95 mb-6 text-base">
              Browse through profiles and find your perfect match
            </p>
            <motion.button
              onClick={() => navigate('/people')}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-[#FF91A4] px-8 py-4 rounded-2xl font-bold hover:shadow-2xl transition-all flex items-center gap-2 mx-auto text-lg"
            >
              <Heart className="w-6 h-6 fill-[#FF91A4]" />
              Start Swiping
            </motion.button>
          </div>
        </motion.div>
      </div>

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
            onClick={() => navigate('/people')}
            whileTap={{ scale: 0.9 }}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors"
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
