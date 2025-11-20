import React, { useState, useEffect } from 'react';
import { MapPin, X, Heart, Star, ChevronLeft, ChevronRight, Sparkles, MoreVertical, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { calculateDistance } from '../data/mockProfiles';
import ReportBlockModal from './ReportBlockModal';

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
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showReportBlockModal, setShowReportBlockModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Reset drag state when swipe direction changes (card is being removed)
  useEffect(() => {
    if (swipeDirection) {
      setDragX(0);
      setIsDragging(false);
    }
  }, [swipeDirection]);

  const handleDrag = (event, info) => {
    setDragX(info.offset.x);
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (event, info) => {
    setIsDragging(false);
    const threshold = 100;
    const velocity = info.velocity.x;

    // Check if dragged far enough or has enough velocity
    if (Math.abs(info.offset.x) > threshold || Math.abs(velocity) > 500) {
      if (info.offset.x > 0 || velocity > 0) {
        // Swipe right = Like
        onLike();
      } else {
        // Swipe left = Pass
        onPass();
      }
    } else {
      // Snap back to center with animation
      setDragX(0);
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

  const nextPhoto = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (profile.photos && currentPhotoIndex < profile.photos.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1);
    }
  };

  const prevPhoto = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
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
    // During drag, use the actual drag position
    if (isDragging) {
      const rotate = dragX * 0.1; // Rotation based on drag distance
      return { x: dragX, rotate, opacity: 1 };
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
        dragConstraints={{ left: -500, right: 500 }}
        dragElastic={0.2}
        onDrag={handleDrag}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={getSwipeStyle()}
        exit={getSwipeStyle()}
        transition={isDragging ? { type: "spring", stiffness: 300, damping: 30 } : { duration: 0.3 }}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        className="relative w-full max-h-[90vh] sm:max-h-[85vh] flex flex-col bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-[#FFB6C1]/20 touch-none select-none"
      >
        {/* Swipe Feedback Overlay */}
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: Math.min(Math.abs(dragX) / 150, 0.8) }}
            className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none"
          >
            {dragX > 50 && (
              <motion.div
                initial={{ scale: 0.8, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                className="px-8 py-4 bg-green-500 text-white rounded-2xl text-3xl font-bold shadow-2xl border-4 border-white"
              >
                LIKE
              </motion.div>
            )}
            {dragX < -50 && (
              <motion.div
                initial={{ scale: 0.8, rotate: 10 }}
                animate={{ scale: 1, rotate: 0 }}
                className="px-8 py-4 bg-red-500 text-white rounded-2xl text-3xl font-bold shadow-2xl border-4 border-white"
              >
                PASS
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Scrollable Container - Image scrolls first, then content */}
        <div 
          className={`flex-1 overflow-y-auto scrollbar-hide pb-20 sm:pb-0 ${isDragging ? 'pointer-events-none' : ''}`}
          onTouchStart={(e) => {
            // Prevent scrolling when starting a drag
            if (e.touches.length === 1) {
              e.stopPropagation();
            }
          }}
        >
          {/* Full Width Photo Carousel - Scrollable */}
          <div className="relative w-full h-[70vh] sm:h-[75vh] bg-gradient-to-br from-[#FFE4E1] via-[#FFF0F5] to-[#FFE4E1]">
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
              
              {/* Report/Block Menu Button - Top Right */}
              <div className="absolute top-4 right-4 z-20">
                <div className="relative">
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(!showMenu);
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 bg-white/20 backdrop-blur-md hover:bg-white/30 rounded-full transition-all"
                  >
                    <MoreVertical className="w-5 h-5 text-white" />
                  </motion.button>
                  
                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {showMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-2xl border-2 border-[#FFB6C1] overflow-hidden z-40"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => {
                            setShowMenu(false);
                            setShowReportBlockModal(true);
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-[#FFE4E1] transition-colors flex items-center gap-3 text-[#212121]"
                        >
                          <Shield className="w-4 h-4 text-[#FF91A4]" />
                          <span className="text-sm font-medium">Report & Block</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              
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

              {/* Distance Badge - Top Left (Figma Style) */}
              {distance !== null && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm text-[#212121] px-3 py-1.5 rounded-full text-xs font-bold shadow-lg z-10"
                >
                  {distance} km
                </motion.div>
              )}

              {/* Name, Age & Profession Overlay - Bottom (Figma Style) */}
              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 text-white z-10">
                <h2 className="text-2xl sm:text-3xl font-bold mb-1 drop-shadow-lg">
                  {profile.name}, {profile.age}
                </h2>
                {profile.optional?.profession && (
                  <p className="text-sm sm:text-base text-white/95 drop-shadow-md">
                    {profile.optional.profession}
                  </p>
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

            {/* Action Buttons - Figma Style */}
            <div className="flex items-center justify-center gap-4 sm:gap-6 p-4 sm:p-6 bg-white border-t border-[#FFB6C1]/20 pb-8">
              {/* Pass Button - White circle with red X */}
              <motion.button
                onClick={onPass}
                whileHover={{ scale: 1.1, rotate: -5 }}
                whileTap={{ scale: 0.9 }}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white border-2 border-[#E0E0E0] flex items-center justify-center shadow-md hover:border-[#E94057] hover:bg-[#F5F5F5] transition-all"
              >
                <X className="w-6 h-6 sm:w-7 sm:h-7 text-[#E94057]" strokeWidth={3} />
              </motion.button>

              {/* Super Like Button - White circle with purple star */}
              <motion.button
                onClick={onSuperLike}
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white border-2 border-[#E0E0E0] flex items-center justify-center shadow-md hover:border-[#8A2387] hover:bg-[#F5F5F5] transition-all"
              >
                <Star className="w-6 h-6 sm:w-7 sm:h-7 text-[#8A2387] fill-[#8A2387]" />
              </motion.button>

              {/* Like Button - Red circle with white heart */}
              <motion.button
                onClick={onLike}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#E94057] flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
              >
                <Heart className="w-6 h-6 sm:w-7 sm:h-7 text-white fill-white" />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Report/Block Modal */}
        <ReportBlockModal
          isOpen={showReportBlockModal}
          onClose={() => {
            setShowReportBlockModal(false);
            setShowMenu(false);
          }}
          userName={profile?.name || 'User'}
          onReport={(reason) => {
            // Store reported user in localStorage
            const reportedUsers = JSON.parse(localStorage.getItem('reportedUsers') || '[]');
            const alreadyReported = reportedUsers.some(r => r.userId === profile.id);
            if (!alreadyReported) {
              reportedUsers.push({
                userId: profile.id,
                userName: profile.name,
                reason: reason,
                reportedAt: new Date().toISOString()
              });
              localStorage.setItem('reportedUsers', JSON.stringify(reportedUsers));
              alert(`Thank you for reporting. We'll review this profile.`);
            } else {
              alert('You have already reported this user.');
            }
            setShowReportBlockModal(false);
          }}
          onBlock={() => {
            // Store blocked user in localStorage
            const blockedUsers = JSON.parse(localStorage.getItem('blockedUsers') || '[]');
            if (!blockedUsers.includes(profile.id)) {
              blockedUsers.push(profile.id);
              localStorage.setItem('blockedUsers', JSON.stringify(blockedUsers));
            }
            alert(`${profile.name} has been blocked.`);
            // Trigger pass action to remove from feed
            onPass();
            setShowReportBlockModal(false);
          }}
        />

        {/* Click outside to close menu */}
        {showMenu && (
          <div
            className="fixed inset-0 z-30"
            onClick={() => setShowMenu(false)}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}
