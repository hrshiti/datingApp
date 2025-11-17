import React, { useState } from 'react';
import { MapPin, X, Heart, Star, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { calculateDistance } from '../data/mockProfiles';

export default function ProfileCard({ 
  profile, 
  currentUserLocation, 
  matchScore, 
  reasons = [],
  onLike, 
  onPass, 
  onSuperLike,
  swipeDirection = null 
}) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleDragStart = (event, info) => {
    setDragStart({ x: info.point.x, y: info.point.y });
  };

  const handleDragEnd = (event, info) => {
    const deltaX = info.point.x - dragStart.x;
    const threshold = 100;

    if (Math.abs(deltaX) > threshold) {
      if (deltaX > 0) {
        onLike();
      } else {
        onPass();
      }
    }
  };

  const distance = currentUserLocation && profile.location
    ? calculateDistance(
        currentUserLocation.lat,
        currentUserLocation.lng,
        profile.location.lat,
        profile.location.lng
      )
    : null;

  const nextPhoto = () => {
    if (profile.photos && currentPhotoIndex < profile.photos.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1);
    }
  };

  const prevPhoto = () => {
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(currentPhotoIndex - 1);
    }
  };

  const getSwipeStyle = () => {
    if (swipeDirection === 'right') {
      return { x: 500, rotate: 30, opacity: 0 };
    } else if (swipeDirection === 'left') {
      return { x: -500, rotate: -30, opacity: 0 };
    }
    return { x: 0, rotate: 0, opacity: 1 };
  };

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

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={profile.id}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={getSwipeStyle()}
        exit={getSwipeStyle()}
        transition={{ duration: 0.3 }}
        className="relative w-full max-w-2xl mx-auto h-full flex flex-col bg-white sm:rounded-2xl sm:shadow-xl overflow-hidden"
      >
        {/* Scrollable Container - Image scrolls first, then content */}
        <div className="flex-1 overflow-y-auto scrollbar-hide pb-20 sm:pb-0 -mt-2">
          {/* Full Width Photo Carousel - Scrollable */}
          <div className="relative w-full h-[70vh] bg-gradient-to-br from-[#FFE4E1] via-[#FFF0F5] to-[#FFE4E1]">
          {profile.photos && profile.photos.length > 0 ? (
            <>
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentPhotoIndex}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  src={profile.photos[currentPhotoIndex]}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${profile.name}&background=FF1744&color=fff&size=400`;
                  }}
                />
              </AnimatePresence>
              
              {/* Gradient Overlay for Name */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              
              {/* Photo Indicators - Bottom Center */}
              {profile.photos.length > 1 && (
                <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
                  {profile.photos.map((_, index) => (
                    <motion.div
                      key={index}
                      initial={{ width: 6, opacity: 0.4 }}
                      animate={{ 
                        width: index === currentPhotoIndex ? 24 : 6,
                        opacity: index === currentPhotoIndex ? 1 : 0.4
                      }}
                      transition={{ duration: 0.2 }}
                      className="h-1.5 bg-white rounded-full"
                    />
                  ))}
                </div>
              )}

              {/* Photo Navigation Arrows */}
              {profile.photos.length > 1 && (
                <>
                  {currentPhotoIndex > 0 && (
                    <motion.button
                      onClick={prevPhoto}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white rounded-full p-2 shadow-lg transition-all z-10"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </motion.button>
                  )}
                  {currentPhotoIndex < profile.photos.length - 1 && (
                    <motion.button
                      onClick={nextPhoto}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white rounded-full p-2 shadow-lg transition-all z-10"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </motion.button>
                  )}
                </>
              )}

              {/* Match Score Badge - Top Right */}
              {matchScore && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute top-4 right-4 bg-gradient-to-br from-[#FF91A4] to-[#FF91A4] text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg z-10"
                >
                  {matchScore}% Match
                </motion.div>
              )}

              {/* Why Suggested Badges - Top Left */}
              {reasons.length > 0 && (
                <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                  {reasons.slice(0, 2).map((reason, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white/95 backdrop-blur-sm text-[#212121] px-3 py-1.5 rounded-full text-xs font-semibold shadow-md flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-[#FF91A4]" />
                      <span>{reason.text}</span>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Name and Age Overlay - Bottom Left (Bumble Style) */}
              <div className="absolute bottom-0 left-0 right-0 p-5 text-white z-10">
                <h2 className="text-3xl sm:text-4xl font-bold mb-1 drop-shadow-lg">
                  {profile.name}, {profile.age}
                </h2>
                {distance !== null && profile.location?.city && (
                  <div className="flex items-center text-white/90 text-sm">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{distance} km away • {profile.location.city}</span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-8xl text-[#FF91A4] font-bold">
                {profile.name.charAt(0).toUpperCase()}
              </div>
            </div>
          )}
          </div>

          {/* Scrollable Content Section - Bumble Style */}
          <div className="bg-white">
            <div className="px-4 py-4">
            {/* Bio Section */}
            {profile.bio && (
              <div className="mb-5">
                <h3 className="text-sm font-semibold text-[#212121] mb-2">My bio</h3>
                <p className="text-base text-[#212121] leading-relaxed">
                  {profile.bio}
                </p>
              </div>
            )}

            {/* About Me Section - Badge Style */}
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-[#212121] mb-3">About me</h3>
              <div className="flex flex-wrap gap-2">
                {profile.optional?.education && (
                  <span className="px-3 py-1.5 bg-[#FFE4E1] text-[#212121] rounded-full text-xs font-medium">
                    {formatEducation(profile.optional.education)}
                  </span>
                )}
                {profile.dealbreakers?.drinking && (
                  <span className="px-3 py-1.5 bg-[#FFE4E1] text-[#212121] rounded-full text-xs font-medium">
                    {formatDealbreaker('drinking', profile.dealbreakers.drinking)}
                  </span>
                )}
                {profile.dealbreakers?.smoking && (
                  <span className="px-3 py-1.5 bg-[#FFE4E1] text-[#212121] rounded-full text-xs font-medium">
                    {formatDealbreaker('smoking', profile.dealbreakers.smoking)}
                  </span>
                )}
                {profile.dealbreakers?.kids && (
                  <span className="px-3 py-1.5 bg-[#FFE4E1] text-[#212121] rounded-full text-xs font-medium">
                    {formatDealbreaker('kids', profile.dealbreakers.kids)}
                  </span>
                )}
                {profile.dealbreakers?.pets && (
                  <span className="px-3 py-1.5 bg-[#FFE4E1] text-[#212121] rounded-full text-xs font-medium">
                    {formatDealbreaker('pets', profile.dealbreakers.pets)}
                  </span>
                )}
                {profile.personality?.social && (
                  <span className="px-3 py-1.5 bg-[#FFE4E1] text-[#212121] rounded-full text-xs font-medium capitalize">
                    {profile.personality.social.replace('-', ' ')}
                  </span>
                )}
              </div>
            </div>

            {/* Interests Section */}
            {profile.interests && profile.interests.length > 0 && (
              <div className="mb-5">
                <h3 className="text-sm font-semibold text-[#212121] mb-3">My interests</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest) => (
                    <motion.span
                      key={interest}
                      whileHover={{ scale: 1.05 }}
                      className="px-3 py-1.5 bg-gradient-to-r from-[#FFE4E1] to-[#FFF0F5] text-[#FF91A4] rounded-full text-xs font-semibold border border-[#FFB6C1]/30"
                    >
                      {interest}
                    </motion.span>
                  ))}
                </div>
              </div>
            )}

            {/* Personality Traits */}
            {profile.personality && (
              <div className="mb-5">
                <h3 className="text-sm font-semibold text-[#212121] mb-3">Personality</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(profile.personality).map(([key, value]) => (
                    value && (
                      <span key={key} className="px-3 py-1.5 bg-[#FFF0F5] text-[#212121] rounded-full text-xs font-medium capitalize border border-[#FFB6C1]/20">
                        {value.replace('-', ' ')}
                      </span>
                    )
                  ))}
                </div>
              </div>
            )}

            {/* Additional Details */}
            {profile.optional && (profile.optional.profession || profile.optional.languages) && (
              <div className="mb-5">
                {profile.optional.profession && (
                  <div className="mb-3">
                    <h3 className="text-sm font-semibold text-[#212121] mb-2">Profession</h3>
                    <p className="text-sm text-[#212121]">{profile.optional.profession}</p>
                  </div>
                )}
                {profile.optional.languages && profile.optional.languages.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-[#212121] mb-2">Languages</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.optional.languages.map((lang) => (
                        <span key={lang} className="px-3 py-1.5 bg-[#FFE4E1] text-[#212121] rounded-full text-xs font-medium">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Location Details */}
            {profile.location?.city && (
              <div className="mb-5 pb-4 border-b border-[#FFB6C1]/20">
                <h3 className="text-sm font-semibold text-[#212121] mb-2">My location</h3>
                <div className="flex items-center text-sm text-[#757575]">
                  <MapPin className="w-4 h-4 mr-1 text-[#FF91A4]" />
                  <span>{profile.location.city}</span>
                  {distance !== null && (
                    <span className="ml-2">• {distance} km away</span>
                  )}
                </div>
              </div>
            )}
            </div>

            {/* Action Buttons - Scrollable (Inside Content) */}
            <div className="flex items-center justify-center gap-6 p-6 bg-white border-t border-[#FFB6C1]/20 pb-8">
              <motion.button
                onClick={onPass}
                whileHover={{ scale: 1.1, rotate: -5 }}
                whileTap={{ scale: 0.9 }}
                className="w-16 h-16 rounded-full bg-white border-2 border-[#E0E0E0] flex items-center justify-center shadow-md hover:border-[#757575] hover:bg-[#F5F5F5] transition-all"
              >
                <X className="w-7 h-7 text-[#757575]" />
              </motion.button>

              <motion.button
                onClick={onSuperLike}
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FFD700] to-[#FFA500] flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
              >
                <Star className="w-7 h-7 text-white fill-white" />
              </motion.button>

              <motion.button
                onClick={onLike}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FF91A4] to-[#FF91A4] flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
              >
                <Heart className="w-7 h-7 text-white fill-white" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
