import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, MapPin, Heart, Star, Filter, ArrowRight, Users, Clock, TrendingUp, UserCircle, MessageCircle, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockProfiles, calculateDistance } from '../data/mockProfiles';

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
        ageRange: onboarding.step2?.ageRange || { min: 18, max: '' },
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

    // Calculate distance and common interests (no scoring)
    const profilesWithInfo = availableProfiles
      .map(profile => {
        const distance = userProfile.location && profile.location 
          ? calculateDistance(
              userProfile.location.lat,
              userProfile.location.lng,
              profile.location.lat,
              profile.location.lng
            )
          : null;
        const commonInterests = userProfile.interests?.filter(interest =>
          profile.interests?.includes(interest)
        ).length || 0;
        return {
          ...profile,
          distance,
          commonInterests
        };
      });

    // Recommended for You - Random 6 profiles
    const shuffled = [...profilesWithInfo].sort(() => 0.5 - Math.random());
    setRecommendedProfiles(shuffled.slice(0, 6));

    // New Today - Random 4 profiles (simulating new profiles)
    setNewTodayProfiles(shuffled.slice(0, 4));

    // Near You - Sort by distance, take top 4
    const nearYou = profilesWithInfo
      .filter(p => p.distance !== null && p.distance <= (userProfile.distancePref || 25))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 4);
    setNearYouProfiles(nearYou);

    // Similar Interests - Profiles with most common interests
    const similarInterests = profilesWithInfo
      .filter(p => p.commonInterests > 0)
      .sort((a, b) => b.commonInterests - a.commonInterests)
      .slice(0, 4);
    setSimilarInterestsProfiles(similarInterests);
  };

  const ProfileCard = ({ profile, distance, commonInterests, index = 0 }) => {
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
        className="relative bg-white rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.08)] cursor-pointer border border-[#E8E8E8] hover:border-[#64B5F6] hover:shadow-[0_24px_72px_rgba(0,0,0,0.12)] transition-all group"
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
            <div className="w-full h-full bg-gradient-to-br from-[#E3F2FD] to-[#BBDEFB] flex items-center justify-center">
              <Users className="w-20 h-20 text-[#64B5F6]" />
            </div>
          )}
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          

          {/* Distance Badge */}
          {distance !== null && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 + 0.25 }}
              className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full text-xs font-semibold text-[#616161] flex items-center gap-2 shadow-[0_4px_16px_rgba(0,0,0,0.12)] z-10"
            >
              <MapPin className="w-4 h-4 text-[#64B5F6]" />
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
                  className="bg-white rounded-2xl px-6 py-3 flex items-center gap-2 shadow-[0_8px_32px_rgba(0,0,0,0.2)]"
                >
                  <Eye className="w-5 h-5 text-[#64B5F6]" />
                  <span className="font-bold text-[#1A1A1A]">View Profile</span>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile Info */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-[#1A1A1A] mb-1 tracking-tight">
                {profile.name}, {profile.age}
              </h3>
              {profile.optional?.profession && (
                <p className="text-sm text-[#757575] font-medium">
                  {profile.optional.profession}
                </p>
              )}
            </div>
            {commonInterests > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 + 0.3, type: "spring" }}
                className="text-xs font-semibold text-[#64B5F6] bg-gradient-to-br from-[#E3F2FD] to-[#BBDEFB] px-4 py-2 rounded-xl border border-[#BBDEFB] shadow-sm"
              >
                {commonInterests} interests
              </motion.span>
            )}
          </div>
          
          {profile.bio && (
            <p className="text-sm text-[#616161] line-clamp-2 mb-4 leading-relaxed font-medium">
              {profile.bio}
            </p>
          )}

          {/* Interests Tags */}
          {profile.interests && profile.interests.length > 0 && (
            <div className="flex flex-wrap gap-2.5">
              {profile.interests.slice(0, 3).map((interest, idx) => (
                <motion.span
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.35 + idx * 0.05, type: "spring" }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="text-xs font-semibold bg-gradient-to-br from-[#64B5F6] to-[#42A5F5] text-white px-4 py-1.5 rounded-xl shadow-[0_4px_12px_rgba(100,181,246,0.3)]"
                >
                  {interest}
                </motion.span>
              ))}
              {profile.interests.length > 3 && (
                <span className="text-xs text-[#757575] px-3 py-1.5 font-medium">
                  +{profile.interests.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  const SectionHeader = ({ title, subtitle, onViewAll, index = 0 }) => {
    return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="flex items-center justify-between gap-4 mb-8 flex-wrap"
    >
      <div className="flex items-center gap-4 flex-shrink-0">
        <div className="flex flex-col">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#1A1A1A] tracking-tight leading-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs sm:text-sm text-[#757575] mt-1 leading-tight font-medium">
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
          className="text-sm font-semibold text-[#64B5F6] hover:text-[#42A5F5] flex items-center gap-2 transition-colors px-5 py-2.5 rounded-xl hover:bg-[#E3F2FD] flex-shrink-0 whitespace-nowrap"
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
      <div className="h-screen bg-gradient-to-br from-[#F5F7FA] via-[#E8ECF1] to-[#F5F7FA] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-[#64B5F6] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#616161] font-medium">Loading profiles...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] via-[#E8ECF1] to-[#F5F7FA] pb-20 sm:pb-0 relative overflow-hidden">
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] tracking-tight">
                  Discover
                </h1>
                <p className="text-sm text-[#757575] font-medium mt-0.5">
                  Find your perfect match
                </p>
              </div>
            </div>
            
            <motion.button
              onClick={() => navigate('/filters')}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="p-3.5 bg-gradient-to-br from-white to-[#F5F5F5] rounded-2xl hover:from-[#64B5F6] hover:to-[#42A5F5] transition-all shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_rgba(100,181,246,0.3)] border border-[#E0E0E0] group"
            >
              <Filter className="w-5 h-5 text-[#64B5F6] group-hover:text-white transition-colors" />
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
              subtitle="Handpicked matches based on your preferences"
              onViewAll={() => navigate('/people')}
              index={0}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {recommendedProfiles.map((profile, idx) => (
                <ProfileCard
                  key={profile.id}
                  profile={profile}
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
              subtitle="Fresh profiles just joined"
              onViewAll={() => navigate('/people')}
              index={1}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
              {newTodayProfiles.map((profile, idx) => (
                <ProfileCard
                  key={profile.id}
                  profile={profile}
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
              subtitle="People in your area"
              onViewAll={() => navigate('/people')}
              index={2}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
              {nearYouProfiles.map((profile, idx) => (
                <ProfileCard
                  key={profile.id}
                  profile={profile}
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
              subtitle="People who share your passions"
              onViewAll={() => navigate('/people')}
              index={3}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
              {similarInterestsProfiles.map((profile, idx) => (
                <ProfileCard
                  key={profile.id}
                  profile={profile}
                  distance={profile.distance}
                  commonInterests={profile.commonInterests}
                  index={idx}
                />
              ))}
            </div>
          </section>
        )}

        {/* Empty State - Premium */}
        {recommendedProfiles.length === 0 && 
         newTodayProfiles.length === 0 && 
         nearYouProfiles.length === 0 && 
         similarInterestsProfiles.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.08)] p-10 sm:p-14 text-center max-w-md mx-auto border border-[#E8E8E8] relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-[#64B5F6]/5 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
              className="w-28 h-28 bg-gradient-to-br from-[#E3F2FD] to-[#BBDEFB] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg relative z-10"
            >
              <Users className="w-14 h-14 text-[#64B5F6]" />
            </motion.div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] mb-3 tracking-tight relative z-10">
              No profiles found
            </h2>
            <p className="text-[#616161] mb-8 font-medium relative z-10">
              Try adjusting your filters or check back later for new matches!
            </p>
            <motion.button
              onClick={() => navigate('/filters')}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-3.5 bg-gradient-to-r from-[#64B5F6] to-[#42A5F5] hover:from-[#42A5F5] hover:to-[#2196F3] text-white rounded-2xl font-semibold hover:shadow-[0_12px_32px_rgba(100,181,246,0.45)] transition-all shadow-[0_8px_24px_rgba(100,181,246,0.35)] relative z-10"
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
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3 tracking-tight">
              Ready to start swiping?
            </h3>
            <p className="text-white/90 mb-8 text-base font-medium">
              Browse through profiles and find your perfect match
            </p>
            <motion.button
              onClick={() => navigate('/people')}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white text-[#64B5F6] px-10 py-4 rounded-2xl font-bold hover:shadow-[0_12px_32px_rgba(255,255,255,0.3)] transition-all flex items-center gap-2 mx-auto text-lg shadow-[0_8px_24px_rgba(255,255,255,0.2)]"
            >
              <Heart className="w-6 h-6 fill-[#64B5F6]" />
              Start Swiping
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Bottom Navigation Bar - Mobile Only - Premium */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 backdrop-blur-xl bg-white/90 border-t border-[#E0E0E0]/50 shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
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
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors"
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
