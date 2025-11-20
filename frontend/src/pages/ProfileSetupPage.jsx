import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Camera, Upload, User, Sparkles, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import PhotoUpload from '../components/PhotoUpload';
import { colors, animations } from '../constants/theme';

export default function ProfileSetupPage() {
  const navigate = useNavigate();
  const [photos, setPhotos] = useState([]);
  const [bio, setBio] = useState('');
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const maxBioLength = 200;
  const minPhotos = 4;
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

    // Load existing profile setup data if any (but don't redirect - let user complete the page)
    const savedData = localStorage.getItem('profileSetup');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        // Load existing photos and bio, but still show the page
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

  const handleComplete = async () => {
    console.log('handleComplete called', { photos: photos.length, bio: bio.length });
    
    if (!validateForm()) {
      console.log('Validation failed');
      return;
    }

    setIsSaving(true);

    try {
      // Convert photos to base64 for storage (since preview URLs are temporary)
      const photosData = await Promise.all(
        photos.map(async (photo) => {
          if (photo.file) {
            // Convert file to base64
            return new Promise((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                resolve({
                  id: photo.id,
                  preview: reader.result, // base64 string
                  fileName: photo.file.name,
                });
              };
              reader.readAsDataURL(photo.file);
            });
          } else {
            // If already has preview (from saved data), keep it
            return {
              id: photo.id,
              preview: photo.preview,
              fileName: photo.fileName || 'photo.jpg',
            };
          }
        })
      );

      // Save profile data with photos and bio
      const profileData = {
        photos: photosData,
        bio: bio.trim(),
        completedAt: new Date().toISOString(),
      };

      console.log('Saving profile data:', { 
        photosCount: profileData.photos.length, 
        bioLength: profileData.bio.length 
      });

      // Save to localStorage
      localStorage.setItem('profileSetup', JSON.stringify(profileData));
      
      // Verify it was saved
      const saved = localStorage.getItem('profileSetup');
      console.log('Saved to localStorage:', saved ? 'Yes' : 'No');
      
      // Mark profile as complete
      const onboardingData = getOnboardingData();
      if (onboardingData) {
        onboardingData.profileComplete = true;
        localStorage.setItem('onboardingData', JSON.stringify(onboardingData));
      }

      // Small delay to show saving state
      await new Promise(resolve => setTimeout(resolve, 500));

      console.log('Navigating to photo verification');
      // Navigate to photo verification page
      navigate('/photo-verification');
    } catch (error) {
      console.error('Error saving profile:', error);
      setErrors({ general: 'Failed to save profile. Please try again.' });
      setIsSaving(false);
    }
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
    <div className="h-screen heart-background flex flex-col overflow-hidden relative">
      <span className="heart-decoration">💕</span>
      <span className="heart-decoration">💖</span>
      <span className="heart-decoration">💗</span>
      <span className="heart-decoration">💝</span>
      <span className="heart-decoration">❤️</span>
      <span className="heart-decoration">💓</span>
      <div className="decoration-circle"></div>
      <div className="decoration-circle"></div>
      
      <div className="w-full h-full relative z-10 flex flex-col">
        <motion.div
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={pageTransition}
          className="bg-gradient-to-br from-white to-[#FFF0F5] h-full w-full flex flex-col p-4 sm:p-6 md:p-8 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#FF91A4]/5 to-transparent pointer-events-none"></div>
          
          {/* Header */}
          <div className="mb-6 sm:mb-8 relative z-10">
          </div>

          <div className="space-y-6 sm:space-y-8 flex-1 overflow-y-auto pr-2 relative z-10 min-h-0">
            {/* Section 1: Photo Upload */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-white to-[#FFF0F5] rounded-xl sm:rounded-2xl p-5 sm:p-6 border-2 border-[#FFB6C1] shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#FF91A4] to-[#FF69B4] rounded-xl flex items-center justify-center shadow-md">
                  <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <label className="block text-sm sm:text-base font-bold text-[#212121]">
                    Upload Your Photos <span className="text-[#FF91A4]">*</span>
                  </label>
                  <p className="text-xs sm:text-sm text-[#757575] mt-1">
                    Add photos to show others who you are
                  </p>
                </div>
              </div>
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
                  className="text-xs text-[#FF91A4] mt-3 font-medium"
                >
                  {errors.photos}
                </motion.p>
              )}
              {photos.length > 0 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs sm:text-sm text-[#757575] mt-3"
                >
                  ✓ {photos.length} photo{photos.length > 1 ? 's' : ''} uploaded
                </motion.p>
              )}
            </motion.div>

            {/* Section 2: Bio */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-white to-[#FFF0F5] rounded-xl sm:rounded-2xl p-5 sm:p-6 border-2 border-[#FFB6C1] shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#FF91A4] to-[#FF69B4] rounded-xl flex items-center justify-center shadow-md">
                  <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <label className="block text-sm sm:text-base font-bold text-[#212121]">
                    Write Your Bio <span className="text-[#757575] text-xs font-normal">(Optional)</span>
                  </label>
                  <p className="text-xs sm:text-sm text-[#757575] mt-1">
                    Tell others about yourself, your interests, and what you're looking for
                  </p>
                </div>
              </div>
              <textarea
                value={bio}
                onChange={(e) => {
                  if (e.target.value.length <= maxBioLength) {
                    setBio(e.target.value);
                  }
                }}
                placeholder="Tell others about yourself..."
                rows={5}
                className="w-full px-4 py-3 border-2 border-[#FFB6C1] rounded-xl sm:rounded-2xl text-sm sm:text-base text-[#212121] bg-white focus:outline-none focus:ring-2 focus:ring-[#FF91A4] focus:ring-opacity-20 focus:border-[#FF91A4] transition-all resize-none shadow-sm hover:shadow-md"
              />
              <div className="flex justify-between items-center mt-3">
                <p className={`text-xs sm:text-sm font-medium ${
                  bio.length > maxBioLength * 0.9 
                    ? 'text-[#FF91A4]' 
                    : 'text-[#757575]'
                }`}>
                  {bio.length}/{maxBioLength} characters
                </p>
                {bio.length > 0 && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-xs text-[#FF91A4] font-medium"
                  >
                    ✓ Bio added
                  </motion.span>
                )}
              </div>
            </motion.div>

            {/* Section 3: Interests Preview */}
            {interests.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-white to-[#FFF0F5] rounded-xl sm:rounded-2xl p-5 sm:p-6 border-2 border-[#FFB6C1] shadow-md"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#FF91A4] to-[#FF69B4] rounded-xl flex items-center justify-center shadow-md">
                    <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <label className="block text-sm sm:text-base font-bold text-[#212121]">
                    Your Interests
                  </label>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {interests.slice(0, 8).map((interest, idx) => (
                    <motion.span
                      key={interest}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + idx * 0.03 }}
                      className="px-3 sm:px-4 py-2 bg-gradient-to-br from-[#FFE4E1] to-[#FFF0F5] text-[#FF91A4] rounded-xl text-xs sm:text-sm font-semibold border border-[#FFB6C1] shadow-sm"
                    >
                      {interest}
                    </motion.span>
                  ))}
                  {interests.length > 8 && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="px-3 sm:px-4 py-2 bg-gradient-to-br from-[#FFE4E1] to-[#FFF0F5] text-[#FF91A4] rounded-xl text-xs sm:text-sm font-semibold border border-[#FFB6C1] shadow-sm"
                    >
                      +{interests.length - 8} more
                    </motion.span>
                  )}
                </div>
              </motion.div>
            )}

            {/* Section 4: Photo Verification */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="border-2 border-[#FFB6C1] rounded-xl sm:rounded-2xl p-5 sm:p-6 bg-gradient-to-br from-white to-[#FFF0F5] shadow-md"
            >
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-[#FF91A4] to-[#FF69B4] rounded-xl flex items-center justify-center shadow-lg">
                    <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <div>
                    <label className="block text-sm sm:text-base font-bold text-[#212121] mb-1">
                      Photo Verification
                    </label>
                    <p className="text-xs sm:text-sm text-[#757575]">
                      Verify your profile to get a verified badge and increase trust
                    </p>
                  </div>
                </div>
                <motion.button
                  onClick={() => {
                    // Navigate to photo verification page
                    navigate('/photo-verification');
                  }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-[#FF91A4] hover:text-white bg-white hover:bg-gradient-to-r hover:from-[#FF91A4] hover:to-[#FF69B4] border-2 border-[#FFB6C1] hover:border-[#FF91A4] rounded-xl transition-all whitespace-nowrap shadow-sm hover:shadow-md"
                >
                  Verify Later
                </motion.button>
              </div>
            </motion.div>

          </div>

          {/* Complete Button */}
          <div className="pt-4 sm:pt-6 mt-4 sm:mt-6 border-t border-[#FFB6C1] relative z-10 flex-shrink-0">
            {errors.general && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-red-600 mb-2 text-center"
              >
                {errors.general}
              </motion.p>
            )}
            <motion.button
              onClick={handleComplete}
              disabled={photos.length < minPhotos || isSaving}
              whileHover={{ scale: photos.length >= minPhotos && !isSaving ? 1.02 : 1, y: photos.length >= minPhotos && !isSaving ? -1 : 0 }}
              whileTap={{ scale: photos.length >= minPhotos && !isSaving ? 0.98 : 1 }}
              className="w-full bg-gradient-to-r from-[#FF91A4] to-[#FF69B4] hover:from-[#FF69B4] hover:to-[#FF91A4] disabled:from-[#E0E0E0] disabled:to-[#E0E0E0] disabled:cursor-not-allowed text-white font-semibold py-3 sm:py-4 rounded-xl sm:rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:shadow-none disabled:transform-none"
            >
              {isSaving ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                  <span className="text-sm sm:text-base">Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  <span className="text-sm sm:text-base">Complete Profile</span>
                </>
              )}
            </motion.button>
            {photos.length < minPhotos && !isSaving && (
              <p className="text-xs text-[#FF91A4] mt-2 text-center">
                Please upload at least {minPhotos} photo{minPhotos > 1 ? 's' : ''} to continue
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

