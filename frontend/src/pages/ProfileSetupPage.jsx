import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Camera, User } from 'lucide-react';
import { motion } from 'framer-motion';
import PhotoUpload from '../components/PhotoUpload';
import { colors, animations } from '../constants/theme';

export default function ProfileSetupPage() {
  const navigate = useNavigate();
  const [photos, setPhotos] = useState([]);
  const [bio, setBio] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [errors, setErrors] = useState({});

  const maxBioLength = 200;
  const minPhotos = 1;
  const maxPhotos = 6;

  // Check if onboarding is completed, if not redirect to onboarding
  useEffect(() => {
    const onboardingData = localStorage.getItem('onboardingData');
    if (!onboardingData) {
      navigate('/onboarding');
      return;
    }
    
    try {
      const parsed = JSON.parse(onboardingData);
      if (!parsed.completed || parsed.currentStep < 7) {
        navigate('/onboarding');
        return;
      }
    } catch (e) {
      navigate('/onboarding');
      return;
    }

    // Check if profile setup is already complete
    const savedData = localStorage.getItem('profileSetup');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        // If profile has photos, redirect to discover
        if (parsed.photos && parsed.photos.length > 0) {
          navigate('/discover');
          return;
        }
        setPhotos(parsed.photos || []);
        setBio(parsed.bio || '');
      } catch (e) {
        console.error('Error loading saved data:', e);
      }
    }
  }, [navigate]);

  // Load interests and personality from onboarding
  const getOnboardingData = () => {
    const onboardingData = localStorage.getItem('onboardingData');
    if (onboardingData) {
      try {
        return JSON.parse(onboardingData);
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (photos.length < minPhotos) {
      newErrors.photos = `Please upload at least ${minPhotos} photo${minPhotos > 1 ? 's' : ''}`;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleComplete = () => {
    if (!validateForm()) {
      return;
    }

    // Save profile data
    const profileData = {
      photos: photos.map(photo => ({
        id: photo.id,
        // In real app, upload to server and save URL
        preview: photo.preview,
      })),
      bio: bio.trim(),
      verified: showVerification,
      completedAt: new Date().toISOString(),
    };

    localStorage.setItem('profileSetup', JSON.stringify(profileData));
    
    // Mark profile as complete
    const onboardingData = getOnboardingData();
    if (onboardingData) {
      onboardingData.profileComplete = true;
      localStorage.setItem('onboardingData', JSON.stringify(onboardingData));
    }

    // Navigate to discovery feed (will create next)
    navigate('/discover');
  };

  const onboardingData = getOnboardingData();
  const interests = onboardingData?.step3?.interests || [];
  const personality = onboardingData?.step4?.personality || {};

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  const pageTransition = {
    type: 'tween',
    ease: animations.easing.easeInOut,
    duration: animations.duration.normal
  };

  return (
    <div className="h-screen heart-background flex items-center justify-center p-3 sm:p-4 overflow-hidden relative">
      <span className="heart-decoration">💕</span>
      <span className="heart-decoration">💖</span>
      <span className="heart-decoration">💗</span>
      <span className="heart-decoration">💝</span>
      <span className="heart-decoration">❤️</span>
      <span className="heart-decoration">💓</span>
      <div className="decoration-circle"></div>
      <div className="decoration-circle"></div>
      
      <div className="w-full max-w-2xl relative z-10">
        <motion.div
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={pageTransition}
          className="bg-white rounded-2xl sm:rounded-3xl shadow-lg p-4 sm:p-6 md:p-8"
        >
          {/* Header */}
          <div className="mb-4 sm:mb-6">
            <button
              onClick={() => {
                // Go back to onboarding Step 7 (Review page)
                const onboardingData = localStorage.getItem('onboardingData');
                if (onboardingData) {
                  try {
                    const parsed = JSON.parse(onboardingData);
                    // Set current step to 7 (Review page) so user can review
                    parsed.currentStep = 7;
                    localStorage.setItem('onboardingData', JSON.stringify(parsed));
                  } catch (e) {
                    console.error('Error updating onboarding data:', e);
                  }
                }
                navigate('/onboarding');
              }}
              className="flex items-center text-[#757575] hover:text-[#212121] mb-3 sm:mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              <span className="text-sm sm:text-base">Back</span>
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-[#212121] mb-2">
              Complete Your Profile
            </h1>
            <p className="text-xs sm:text-sm text-[#757575]">
              Add photos and tell others about yourself
            </p>
          </div>

          <div className="space-y-6 sm:space-y-8 max-h-[65vh] overflow-y-auto pr-2">
            {/* Section 1: Photo Upload */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <label className="block text-sm sm:text-base font-semibold text-[#212121] mb-3">
                Photos <span className="text-[#1877F2]">*</span>
              </label>
              <PhotoUpload
                photos={photos}
                onChange={setPhotos}
                maxPhotos={maxPhotos}
                minPhotos={minPhotos}
              />
              {errors.photos && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-[#1877F2] mt-2"
                >
                  {errors.photos}
                </motion.p>
              )}
            </motion.div>

            {/* Section 2: Bio */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <label className="block text-sm sm:text-base font-semibold text-[#212121] mb-2">
                Bio <span className="text-[#757575] text-xs font-normal">(Optional)</span>
              </label>
              <textarea
                value={bio}
                onChange={(e) => {
                  if (e.target.value.length <= maxBioLength) {
                    setBio(e.target.value);
                  }
                }}
                placeholder="Tell others about yourself..."
                rows={4}
                className="w-full px-4 py-3 border-2 border-[#90CAF9] rounded-xl sm:rounded-2xl text-sm sm:text-base text-[#212121] bg-white focus:outline-none focus:ring-2 focus:ring-[#1877F2] focus:ring-opacity-20 focus:border-[#1877F2] transition-all resize-none"
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-[#757575]">
                  {bio.length}/{maxBioLength} characters
                </p>
              </div>
            </motion.div>

            {/* Section 3: Interests Preview */}
            {interests.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label className="block text-sm sm:text-base font-semibold text-[#212121] mb-2">
                  Your Interests
                </label>
                <div className="flex flex-wrap gap-2">
                  {interests.slice(0, 8).map((interest) => (
                    <span
                      key={interest}
                      className="px-3 py-1.5 bg-[#E7F3FF] text-[#1877F2] rounded-lg text-xs sm:text-sm font-medium"
                    >
                      {interest}
                    </span>
                  ))}
                  {interests.length > 8 && (
                    <span className="px-3 py-1.5 bg-[#E7F3FF] text-[#1877F2] rounded-lg text-xs sm:text-sm font-medium">
                      +{interests.length - 8} more
                    </span>
                  )}
                </div>
              </motion.div>
            )}

            {/* Section 4: Verification (Optional) */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="border-2 border-[#90CAF9] rounded-xl sm:rounded-2xl p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <Camera className="w-5 h-5 text-[#1877F2] mr-2" />
                    <h3 className="text-sm sm:text-base font-semibold text-[#212121]">
                      Photo Verification
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-[#757575] mb-3">
                    Verify your profile to get a verified badge and increase trust
                  </p>
                  {showVerification && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center text-[#4CAF50] text-xs sm:text-sm"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Verification enabled
                    </motion.div>
                  )}
                </div>
                <motion.button
                  onClick={() => setShowVerification(!showVerification)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                    showVerification
                      ? 'bg-[#4CAF50] text-white'
                      : 'bg-[#E7F3FF] text-[#1877F2] hover:bg-[#1877F2] hover:text-white'
                  }`}
                >
                  {showVerification ? 'Verified' : 'Verify Later'}
                </motion.button>
              </div>
            </motion.div>
          </div>

          {/* Complete Button */}
          <div className="pt-4 sm:pt-6 mt-4 sm:mt-6 border-t border-[#90CAF9]">
            <motion.button
              onClick={handleComplete}
              disabled={photos.length < minPhotos}
              whileHover={{ scale: photos.length >= minPhotos ? 1.02 : 1 }}
              whileTap={{ scale: photos.length >= minPhotos ? 0.98 : 1 }}
              className="w-full bg-[#1877F2] hover:bg-[#1565C0] disabled:bg-[#E0E0E0] disabled:cursor-not-allowed text-white font-semibold py-3 sm:py-4 rounded-xl sm:rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg disabled:transform-none"
            >
              <Check className="w-5 h-5" />
              <span className="text-sm sm:text-base">Complete Profile</span>
            </motion.button>
            {photos.length < minPhotos && (
              <p className="text-xs text-[#1877F2] mt-2 text-center">
                Please upload at least {minPhotos} photo{minPhotos > 1 ? 's' : ''} to continue
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

