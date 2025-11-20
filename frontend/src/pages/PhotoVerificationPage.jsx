import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Check, Upload, X } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PhotoVerificationPage() {
  const navigate = useNavigate();
  const [verificationPhoto, setVerificationPhoto] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState('');

  // Check if profile setup is completed
  useEffect(() => {
    const profileSetup = localStorage.getItem('profileSetup');
    const onboardingData = localStorage.getItem('onboardingData');
    
    if (!profileSetup || !onboardingData) {
      navigate('/profile-setup');
      return;
    }
    
    try {
      const parsed = JSON.parse(profileSetup);
      // If already verified, go to people page
      if (parsed.verified && parsed.verificationPhoto) {
        navigate('/people');
        return;
      }
      // Load existing verification photo if any
      if (parsed.verificationPhoto) {
        setVerificationPhoto(parsed.verificationPhoto);
      }
    } catch (e) {
      console.error('Error loading profile data:', e);
    }
  }, [navigate]);

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    setError('');
    const reader = new FileReader();
    reader.onloadend = () => {
      setVerificationPhoto({
        file: file,
        preview: reader.result
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setVerificationPhoto(null);
    setError('');
  };

  const handleVerify = () => {
    if (!verificationPhoto) {
      setError('Please upload a verification photo');
      return;
    }

    setIsUploading(true);
    
    // Simulate verification process
    setTimeout(() => {
      setIsUploading(false);
      setIsVerified(true);
      
      // Save verification data
      const profileSetup = localStorage.getItem('profileSetup');
      if (profileSetup) {
        try {
          const parsed = JSON.parse(profileSetup);
          parsed.verified = true;
          parsed.verificationPhoto = verificationPhoto.preview;
          parsed.verifiedAt = new Date().toISOString();
          localStorage.setItem('profileSetup', JSON.stringify(parsed));
        } catch (e) {
          console.error('Error saving verification:', e);
        }
      }

      // Navigate to people page after 2 seconds
      setTimeout(() => {
        navigate('/people');
      }, 2000);
    }, 2000);
  };

  const handleSkip = () => {
    // Save that user skipped verification
    const profileSetup = localStorage.getItem('profileSetup');
    if (profileSetup) {
      try {
        const parsed = JSON.parse(profileSetup);
        parsed.verificationSkipped = true;
        localStorage.setItem('profileSetup', JSON.stringify(parsed));
      } catch (e) {
        console.error('Error saving skip:', e);
      }
    }
    navigate('/people');
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
      
      <div className="w-full max-w-md relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-gradient-to-br from-white to-[#FFF0F5] rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 md:p-8 border border-[#FFB6C1]/20 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#FF91A4]/5 to-transparent pointer-events-none"></div>
          
          {/* Header */}
          <div className="mb-4 sm:mb-6 relative z-10">
            <button
              onClick={() => navigate('/profile-setup')}
              className="flex items-center text-[#757575] hover:text-[#212121] mb-3 sm:mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              <span className="text-sm sm:text-base">Back</span>
            </button>
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#FF91A4] to-[#FF69B4] bg-clip-text text-transparent mb-2">
              Photo Verification
            </h1>
            <p className="text-xs sm:text-sm text-[#757575]">
              Verify your profile to get a verified badge and increase trust
            </p>
          </div>

          {isVerified ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8 relative z-10"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                className="w-20 h-20 bg-gradient-to-br from-[#4CAF50] to-[#45a049] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
              >
                <Check className="w-10 h-10 text-white" />
              </motion.div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#212121] mb-2">
                Verification Successful!
              </h2>
              <p className="text-sm text-[#757575] mb-6">
                Your profile is now verified. Redirecting to discover...
              </p>
            </motion.div>
          ) : (
            <div className="space-y-6 relative z-10">
              {/* Instructions */}
              <div className="bg-[#FFE4E1] rounded-xl p-4 border border-[#FFB6C1]">
                <h3 className="text-sm font-semibold text-[#212121] mb-2 flex items-center">
                  <Camera className="w-4 h-4 mr-2 text-[#FF91A4]" />
                  How to verify:
                </h3>
                <ul className="text-xs text-[#757575] space-y-1 list-disc list-inside">
                  <li>Take a clear selfie holding a piece of paper with today's date</li>
                  <li>Make sure your face is clearly visible</li>
                  <li>The date on the paper should be readable</li>
                </ul>
              </div>

              {/* Photo Upload Area */}
              <div>
                <label className="block text-sm font-semibold text-[#212121] mb-3">
                  Verification Photo <span className="text-[#FF91A4]">*</span>
                </label>
                
                {verificationPhoto ? (
                  <div className="relative">
                    <img
                      src={verificationPhoto.preview}
                      alt="Verification"
                      className="w-full h-64 object-cover rounded-xl border-2 border-[#FFB6C1]"
                    />
                    <button
                      onClick={handleRemovePhoto}
                      className="absolute top-2 right-2 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all"
                    >
                      <X className="w-4 h-4 text-[#FF91A4]" />
                    </button>
                  </div>
                ) : (
                  <label className="block">
                    <div className="border-2 border-dashed border-[#FFB6C1] rounded-xl p-8 text-center cursor-pointer hover:border-[#FF91A4] hover:bg-[#FFE4E1]/50 transition-all">
                      <Upload className="w-12 h-12 text-[#FF91A4] mx-auto mb-3" />
                      <p className="text-sm font-medium text-[#212121] mb-1">
                        Click to upload verification photo
                      </p>
                      <p className="text-xs text-[#757575]">
                        JPG, PNG up to 5MB
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                )}
                
                {error && (
                  <p className="text-xs text-red-600 mt-2">{error}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 pt-4">
                <motion.button
                  onClick={handleVerify}
                  disabled={!verificationPhoto || isUploading}
                  whileHover={{ scale: verificationPhoto && !isUploading ? 1.02 : 1 }}
                  whileTap={{ scale: verificationPhoto && !isUploading ? 0.98 : 1 }}
                  className="w-full bg-gradient-to-r from-[#FF91A4] to-[#FF69B4] hover:from-[#FF69B4] hover:to-[#FF91A4] disabled:from-[#E0E0E0] disabled:to-[#E0E0E0] disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:shadow-none flex items-center justify-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      <span>Verify My Profile</span>
                    </>
                  )}
                </motion.button>
                
                <motion.button
                  onClick={handleSkip}
                  disabled={isUploading}
                  whileHover={{ scale: !isUploading ? 1.02 : 1 }}
                  whileTap={{ scale: !isUploading ? 0.98 : 1 }}
                  className="w-full bg-[#FFE4E1] hover:bg-[#FFB6C1] disabled:bg-[#E0E0E0] disabled:cursor-not-allowed text-[#FF91A4] hover:text-white font-semibold py-3 rounded-xl transition-all border-2 border-[#FFB6C1] disabled:border-[#E0E0E0]"
                >
                  Skip for Now
                </motion.button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

