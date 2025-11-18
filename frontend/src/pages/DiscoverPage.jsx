import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, MapPin, Heart, Star, Filter, ArrowRight, Users, Clock, TrendingUp, UserCircle, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
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
          lat: 19.0760,
          lng: 72.8777
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

  const ProfileCard = ({ profile, matchScore, distance, commonInterests }) => {
    const [imageError, setImageError] = useState(false);
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.02, y: -4 }}
        onClick={() => navigate('/people')}
        className="relative bg-white rounded-2xl overflow-hidden shadow-lg cursor-pointer border border-[#FFB6C1]/20 hover:shadow-xl transition-all"
      >
        {/* Profile Image */}
        <div className="relative h-64 overflow-hidden">
          {!imageError && profile.photos?.[0] ? (
            <img
              src={profile.photos[0]}
              alt={profile.name}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#FFE4E1] to-[#FFF0F5] flex items-center justify-center">
              <Users className="w-16 h-16 text-[#FF91A4]" />
            </div>
          )}
          
          {/* Match Score Badge */}
          {matchScore && (
            <div className="absolute top-3 right-3 bg-gradient-to-r from-[#FF91A4] to-[#FF69B4] text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
              <Star className="w-3 h-3" />
              {Math.round(matchScore)}%
            </div>
          )}

          {/* Distance Badge */}
          {distance !== null && (
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-semibold text-[#212121] flex items-center gap-1 shadow-md">
              <MapPin className="w-3 h-3 text-[#FF91A4]" />
              {Math.round(distance)} km
            </div>
          )}
        </div>

        {/* Profile Info */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-[#212121]">
              {profile.name}, {profile.age}
            </h3>
            {commonInterests > 0 && (
              <span className="text-xs text-[#757575] bg-[#FFE4E1] px-2 py-1 rounded-full">
                {commonInterests} interests
              </span>
            )}
          </div>
          
          {profile.bio && (
            <p className="text-sm text-[#757575] line-clamp-2 mb-2">
              {profile.bio}
            </p>
          )}

          {/* Interests Tags */}
          {profile.interests && profile.interests.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {profile.interests.slice(0, 3).map((interest, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-[#FFE4E1] text-[#FF91A4] px-2 py-0.5 rounded-full"
                >
                  {interest}
                </span>
              ))}
              {profile.interests.length > 3 && (
                <span className="text-xs text-[#757575] px-2 py-0.5">
                  +{profile.interests.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  const SectionHeader = ({ title, icon: Icon, subtitle, onViewAll }) => (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFE4E1] to-[#FFF0F5] flex items-center justify-center">
          <Icon className="w-5 h-5 text-[#FF91A4]" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#212121]">{title}</h2>
          {subtitle && <p className="text-xs text-[#757575]">{subtitle}</p>}
        </div>
      </div>
      {onViewAll && (
        <button
          onClick={onViewAll}
          className="text-sm font-semibold text-[#FF91A4] hover:text-[#FF69B4] flex items-center gap-1 transition-colors"
        >
          View All
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );

  if (!currentUserProfile) {
    return (
      <div className="h-screen heart-background flex items-center justify-center">
        <div className="text-[#212121]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen heart-background pb-20 sm:pb-0">
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
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative z-20 bg-gradient-to-b from-white via-white/98 to-white/95 backdrop-blur-lg border-b border-[#FFB6C1]/30 shadow-lg sticky top-0"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF91A4] via-[#FF69B4] to-[#FF91A4] flex items-center justify-center shadow-lg relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                <Sparkles className="w-6 h-6 text-white relative z-10" />
              </motion.div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#FF91A4] to-[#FF69B4] bg-clip-text text-transparent">
                  Discover
                </h1>
                <p className="text-xs sm:text-sm text-[#757575] font-medium">
                  Find your perfect match
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2.5">
              <motion.button
                onClick={() => navigate('/filters')}
                whileHover={{ scale: 1.08, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 bg-gradient-to-br from-[#FFE4E1] to-[#FFF0F5] rounded-2xl hover:from-[#FF91A4] hover:to-[#FF69B4] transition-all shadow-md hover:shadow-xl border border-[#FFB6C1]/30"
              >
                <Filter className="w-5 h-5 text-[#FF91A4] transition-colors" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Recommended for You */}
        {recommendedProfiles.length > 0 && (
          <section className="mb-8">
            <SectionHeader
              title="Recommended for You"
              icon={Star}
              subtitle="Handpicked matches based on your preferences"
              onViewAll={() => navigate('/people')}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {recommendedProfiles.map((profile) => (
                <ProfileCard
                  key={profile.id}
                  profile={profile}
                  matchScore={profile.matchScore}
                  distance={profile.distance}
                />
              ))}
            </div>
          </section>
        )}

        {/* New Today */}
        {newTodayProfiles.length > 0 && (
          <section className="mb-8">
            <SectionHeader
              title="New Today"
              icon={Clock}
              subtitle="Fresh profiles just joined"
              onViewAll={() => navigate('/people')}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {newTodayProfiles.map((profile) => (
                <ProfileCard
                  key={profile.id}
                  profile={profile}
                  matchScore={profile.matchScore}
                  distance={profile.distance}
                />
              ))}
            </div>
          </section>
        )}

        {/* Near You */}
        {nearYouProfiles.length > 0 && (
          <section className="mb-8">
            <SectionHeader
              title="Near You"
              icon={MapPin}
              subtitle="People in your area"
              onViewAll={() => navigate('/people')}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {nearYouProfiles.map((profile) => (
                <ProfileCard
                  key={profile.id}
                  profile={profile}
                  matchScore={profile.matchScore}
                  distance={profile.distance}
                />
              ))}
            </div>
          </section>
        )}

        {/* Similar Interests */}
        {similarInterestsProfiles.length > 0 && (
          <section className="mb-8">
            <SectionHeader
              title="Similar Interests"
              icon={TrendingUp}
              subtitle="People who share your passions"
              onViewAll={() => navigate('/people')}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {similarInterestsProfiles.map((profile) => (
                <ProfileCard
                  key={profile.id}
                  profile={profile}
                  matchScore={profile.matchScore}
                  distance={profile.distance}
                  commonInterests={profile.commonInterests}
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
            className="bg-gradient-to-br from-white to-[#FFF0F5] rounded-3xl shadow-2xl p-8 sm:p-12 text-center max-w-md mx-auto border border-[#FFB6C1]/20"
          >
            <div className="w-28 h-28 bg-gradient-to-br from-[#FFE4E1] via-[#FFF0F5] to-[#FFE4E1] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Users className="w-14 h-14 text-[#FF91A4]" />
            </div>
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
          transition={{ delay: 0.3 }}
          className="mt-8 bg-gradient-to-r from-[#FF91A4] to-[#FF69B4] rounded-2xl p-6 text-center shadow-xl"
        >
          <h3 className="text-xl font-bold text-white mb-2">
            Ready to start swiping?
          </h3>
          <p className="text-white/90 mb-4 text-sm">
            Browse through profiles and find your perfect match
          </p>
          <motion.button
            onClick={() => navigate('/people')}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-[#FF91A4] px-6 py-3 rounded-xl font-semibold hover:shadow-xl transition-all flex items-center gap-2 mx-auto"
          >
            <Heart className="w-5 h-5" />
            Start Swiping
          </motion.button>
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

