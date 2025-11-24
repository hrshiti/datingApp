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
    <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] via-[#E8ECF1] to-[#F5F7FA] flex items-center justify-center p-2 sm:p-3 md:p-4 overflow-y-auto relative">
      {/* Premium Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-[300px] sm:w-[400px] md:w-[600px] h-[300px] sm:h-[400px] md:h-[600px] bg-gradient-to-br from-[#64B5F6]/8 to-transparent rounded-full blur-3xl -translate-x-1/3 -translate-y-1/3"></div>
      <div className="absolute bottom-0 right-0 w-[350px] sm:w-[500px] md:w-[700px] h-[350px] sm:h-[500px] md:h-[700px] bg-gradient-to-tl from-[#42A5F5]/8 to-transparent rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
      
      <div className="w-full max-w-md relative z-10 my-4 sm:my-6 md:my-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-xl sm:rounded-2xl md:rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] p-3 sm:p-4 md:p-6 lg:p-8 border border-[#E8E8E8] relative overflow-hidden mx-1 sm:mx-2 md:mx-0"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#64B5F6]/5 to-transparent pointer-events-none"></div>
          
          {/* Header */}
          <div className="mb-3 sm:mb-4 md:mb-6 relative z-10">
            <button
              onClick={() => navigate('/profile-setup')}
              className="flex items-center text-[#616161] hover:text-[#1A1A1A] mb-2 sm:mb-3 md:mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
              <span className="text-xs sm:text-sm md:text-base">Back</span>
            </button>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-[#1A1A1A] mb-1 sm:mb-2 tracking-tight">
              Photo Verification
            </h1>
            <p className="text-[11px] sm:text-xs md:text-sm text-[#616161]">
              Verify your profile to get a verified badge and increase trust
            </p>
          </div>

          {isVerified ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6 sm:py-8 relative z-10"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#4CAF50] to-[#45a049] rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg"
              >
                <Check className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </motion.div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[#1A1A1A] mb-1 sm:mb-2">
                Verification Successful!
              </h2>
              <p className="text-xs sm:text-sm text-[#616161] mb-4 sm:mb-6">
                Your profile is now verified. Redirecting to discover...
              </p>
            </motion.div>
          ) : (
            <div className="space-y-4 sm:space-y-5 md:space-y-6 relative z-10">
              {/* Instructions */}
              <div className="bg-[#E3F2FD] rounded-lg sm:rounded-xl p-3 sm:p-4 border border-[#64B5F6]/30">
                <h3 className="text-xs sm:text-sm font-semibold text-[#1A1A1A] mb-2 flex items-center">
                  <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 text-[#64B5F6]" />
                  How to verify:
                </h3>
                <ul className="text-[11px] sm:text-xs text-[#616161] space-y-1 list-disc list-inside">
                  <li>Take a clear selfie holding a piece of paper with today's date</li>
                  <li>Make sure your face is clearly visible</li>
                  <li>The date on the paper should be readable</li>
                </ul>
              </div>

              {/* Photo Upload Area */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-[#1A1A1A] mb-2 sm:mb-3">
                  Verification Photo <span className="text-[#64B5F6]">*</span>
                </label>
                
                {verificationPhoto ? (
                  <div className="relative">
                    <img
                      src={verificationPhoto.preview}
                      alt="Verification"
                      className="w-full h-48 sm:h-56 md:h-64 object-cover rounded-lg sm:rounded-xl border-2 border-[#64B5F6]/30"
                    />
                    <button
                      onClick={handleRemovePhoto}
                      className="absolute top-2 right-2 p-1.5 sm:p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all"
                    >
                      <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#64B5F6]" />
                    </button>
                  </div>
                ) : (
                  <label className="block">
                    <div className="border-2 border-dashed border-[#64B5F6]/50 rounded-lg sm:rounded-xl p-6 sm:p-8 text-center cursor-pointer hover:border-[#64B5F6] hover:bg-[#E3F2FD]/50 transition-all">
                      <Upload className="w-10 h-10 sm:w-12 sm:h-12 text-[#64B5F6] mx-auto mb-2 sm:mb-3" />
                      <p className="text-xs sm:text-sm font-medium text-[#1A1A1A] mb-1">
                        Click to upload verification photo
                      </p>
                      <p className="text-[10px] sm:text-xs text-[#616161]">
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
                  <p className="text-[10px] sm:text-xs text-red-600 mt-1 sm:mt-2">{error}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 sm:gap-3 pt-2 sm:pt-4">
                <motion.button
                  onClick={handleVerify}
                  disabled={!verificationPhoto || isUploading}
                  whileHover={{ scale: verificationPhoto && !isUploading ? 1.02 : 1 }}
                  whileTap={{ scale: verificationPhoto && !isUploading ? 0.98 : 1 }}
                  className="w-full bg-[#64B5F6] hover:bg-[#42A5F5] disabled:bg-[#E0E0E0] disabled:cursor-not-allowed text-white font-semibold py-2.5 sm:py-3 rounded-lg sm:rounded-xl transition-all shadow-[0_4px_16px_rgba(100,181,246,0.3)] hover:shadow-[0_8px_24px_rgba(100,181,246,0.4)] disabled:shadow-none flex items-center justify-center gap-2 text-xs sm:text-sm md:text-base"
                >
                  {isUploading ? (
                    <>
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Verify My Profile</span>
                    </>
                  )}
                </motion.button>
                
                <motion.button
                  onClick={handleSkip}
                  disabled={isUploading}
                  whileHover={{ scale: !isUploading ? 1.02 : 1 }}
                  whileTap={{ scale: !isUploading ? 0.98 : 1 }}
                  className="w-full bg-white hover:bg-[#F5F5F5] disabled:bg-[#E0E0E0] disabled:cursor-not-allowed text-[#64B5F6] hover:text-[#42A5F5] font-semibold py-2.5 sm:py-3 rounded-lg sm:rounded-xl transition-all border-2 border-[#64B5F6]/50 hover:border-[#64B5F6] disabled:border-[#E0E0E0] text-xs sm:text-sm md:text-base"
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

