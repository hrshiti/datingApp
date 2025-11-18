import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Camera } from 'lucide-react';
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
        // If profile has photos, redirect to people (swiping feed)
        if (parsed.photos && parsed.photos.length > 0) {
          navigate('/people');
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
          className="bg-gradient-to-br from-white to-[#FFF0F5] rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 md:p-8 border border-[#FFB6C1]/20 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#FF91A4]/5 to-transparent pointer-events-none"></div>
          
          {/* Header */}
          <div className="mb-4 sm:mb-6 relative z-10">
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
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#FF91A4] to-[#FF69B4] bg-clip-text text-transparent mb-2">
              Complete Your Profile
            </h1>
            <p className="text-xs sm:text-sm text-[#757575] mb-4">
              Add photos and tell others about yourself
            </p>
            <div className="bg-gradient-to-r from-[#FFE4E1] to-[#FFF0F5] border border-[#FFB6C1] rounded-xl p-3 mb-4">
              <p className="text-xs sm:text-sm text-[#212121] font-medium">
                📸 Upload at least 1 photo to continue
              </p>
              <p className="text-xs text-[#757575] mt-1">
                Add a bio to help others know more about you (optional)
              </p>
            </div>
          </div>

          <div className="space-y-6 sm:space-y-8 max-h-[65vh] overflow-y-auto pr-2 relative z-10">
            {/* Section 1: Photo Upload */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border-2 border-[#FFB6C1] shadow-sm"
            >
              <label className="block text-sm sm:text-base font-semibold text-[#212121] mb-3">
                📷 Upload Your Photos <span className="text-[#FF91A4]">*</span>
              </label>
              <p className="text-xs text-[#757575] mb-3">
                Add photos to show others who you are. At least 1 photo is required.
              </p>
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
                  className="text-xs text-[#FF91A4] mt-2"
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
              className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border-2 border-[#FFB6C1] shadow-sm"
            >
              <label className="block text-sm sm:text-base font-semibold text-[#212121] mb-2">
                ✍️ Write Your Bio <span className="text-[#757575] text-xs font-normal">(Optional)</span>
              </label>
              <p className="text-xs text-[#757575] mb-3">
                Tell others about yourself, your interests, and what you're looking for.
              </p>
              <textarea
                value={bio}
                onChange={(e) => {
                  if (e.target.value.length <= maxBioLength) {
                    setBio(e.target.value);
                  }
                }}
                placeholder="Tell others about yourself..."
                rows={4}
                className="w-full px-4 py-3 border-2 border-[#FFB6C1] rounded-xl sm:rounded-2xl text-sm sm:text-base text-[#212121] bg-white focus:outline-none focus:ring-2 focus:ring-[#FF91A4] focus:ring-opacity-20 focus:border-[#FF91A4] transition-all resize-none shadow-sm hover:shadow-md"
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
                      className="px-3 py-1.5 bg-[#FFE4E1] text-[#FF91A4] rounded-lg text-xs sm:text-sm font-medium"
                    >
                      {interest}
                    </span>
                  ))}
                  {interests.length > 8 && (
                    <span className="px-3 py-1.5 bg-[#FFE4E1] text-[#FF91A4] rounded-lg text-xs sm:text-sm font-medium">
                      +{interests.length - 8} more
                    </span>
                  )}
                </div>
              </motion.div>
            )}

            {/* Section 4: Photo Verification */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="border-2 border-[#FFB6C1] rounded-xl sm:rounded-2xl p-3 sm:p-4 bg-gradient-to-br from-white to-[#FFF0F5]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#FF91A4] to-[#FF69B4] rounded-full flex items-center justify-center shadow-md">
                    <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <label className="block text-sm sm:text-base font-semibold text-[#212121] mb-1">
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
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-[#FF91A4] hover:text-[#FF69B4] border border-[#FFB6C1] hover:border-[#FF91A4] rounded-lg transition-all whitespace-nowrap"
                >
                  Verify Later
                </motion.button>
              </div>
            </motion.div>

          </div>

          {/* Complete Button */}
          <div className="pt-4 sm:pt-6 mt-4 sm:mt-6 border-t border-[#FFB6C1] relative z-10">
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

