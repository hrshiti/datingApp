import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Check, Edit2, Camera, ShoppingBag, User, Plane, Mic, Dumbbell, ChefHat, Activity, Palette, Mountain, Music, Wine, Gamepad2, Waves, UserCircle, MapPin as MapPinIcon, Heart, Smile, Home, Settings, Users, Calendar, Sun, Moon, Zap, MessageSquare, Sparkles, Coffee, Baby, Cigarette, Dog, GlassWater, GraduationCap, Briefcase, Languages, Star, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomDropdown from '../components/CustomDropdown';
import CustomDatePicker from '../components/CustomDatePicker';
import PhotoUpload from '../components/PhotoUpload';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const totalSteps = 10;
  const [currentStep, setCurrentStep] = useState(1);
  // Ensure progress percentage is clamped between 0-100 and never exceeds 100%
  const progressPercentage = Math.min(Math.round((currentStep / totalSteps) * 100), 100);

  // Form state for all steps
  const [formData, setFormData] = useState({
    // Step 1
    name: '',
    dob: '',
    gender: '',
    customGender: '',
    orientation: '',
    customOrientation: '',
    lookingFor: '',
    // Step 2
    city: '',
    ageRange: { min: 18, max: '' },
    distancePref: 25,
    // Step 3
    interests: [],
    // Step 4
    personality: {
      social: '',
      planning: '',
      romantic: '',
      morning: '',
      homebody: '',
      serious: '',
      decision: '',
      communication: ''
    },
    // Step 5
    dealbreakers: {
      kids: '',
      smoking: '',
      pets: '',
      drinking: '',
      religion: ''
    },
    // Step 6 - Prompts
    prompts: [],
    // Step 7
    optional: {
      education: '',
      profession: '',
      languages: [],
      horoscope: ''
    },
    // Step 8 - Profile Setup
    photos: [],
    bio: '',
    // Step 9 - Verification (no separate data, just verification)
    verified: false,
    // Step 10 - Review (no separate data, just review)
    reviewed: false
  });

  const [errors, setErrors] = useState({});
  const [showCustomGender, setShowCustomGender] = useState(false);
  const [showCustomOrientation, setShowCustomOrientation] = useState(false);
  
  const maxBioLength = 200;
  const minPhotos = 4;
  const maxPhotos = 6;

  // Load saved data from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('onboardingData');
    const isEditingOnboarding = localStorage.getItem('editingOnboarding') === 'true';
    
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        // If user is editing onboarding from edit profile page, allow editing
        if (isEditingOnboarding) {
          // Allow editing, don't redirect
          // Load all saved data for editing
          // Start from step 1 so user can go through all steps
          setFormData(prev => {
            // Handle backward compatibility: if lookingFor is an array, take first item
            let lookingFor = parsed.step1?.lookingFor || '';
            if (Array.isArray(lookingFor) && lookingFor.length > 0) {
              lookingFor = lookingFor[0];
            }
            
            return {
              ...prev, 
              ...parsed.step1,
              lookingFor: lookingFor,
              ...parsed.step2,
              ...parsed.step3,
              personality: parsed.step4?.personality || prev.personality,
              dealbreakers: parsed.step5?.dealbreakers || prev.dealbreakers,
              optional: parsed.step6?.optional || prev.optional
            };
          });
          setCurrentStep(1); // Always start from step 1 when editing
          if (parsed.step1?.gender === 'other') {
            setShowCustomGender(true);
          }
          if (parsed.step1?.orientation === 'other') {
            setShowCustomOrientation(true);
          }
          // Remove the editing flag after loading
          localStorage.removeItem('editingOnboarding');
          return;
        }
        
        // If onboarding is already completed, redirect to people page
        if (parsed.completed) {
          navigate('/people');
          return;
        }
        
        // Onboarding not completed - load saved progress
        // Clamp currentStep to valid range (1-9)
        const step = parsed.currentStep || 1;
        const validStep = Math.min(Math.max(step, 1), 9);
        
        setFormData(prev => {
          // Handle backward compatibility: if lookingFor is an array, take first item
          let lookingFor = parsed.step1?.lookingFor || '';
          if (Array.isArray(lookingFor) && lookingFor.length > 0) {
            lookingFor = lookingFor[0];
          }
          
          return {
            ...prev, 
            ...parsed.step1,
            lookingFor: lookingFor,
            ...parsed.step2,
            ...parsed.step3,
            personality: parsed.step4?.personality || prev.personality,
            dealbreakers: parsed.step5?.dealbreakers || prev.dealbreakers,
            optional: parsed.step6?.optional || prev.optional,
            photos: parsed.step7?.photos || prev.photos,
            bio: parsed.step7?.bio || prev.bio,
            verified: parsed.step8?.verified || prev.verified
          };
        });
        setCurrentStep(validStep);
        if (parsed.step1?.gender === 'other') {
          setShowCustomGender(true);
        }
        if (parsed.step1?.orientation === 'other') {
          setShowCustomOrientation(true);
        }
      } catch (e) {
        console.error('Error loading saved data:', e);
        // If error, start fresh from step 1
        setCurrentStep(1);
      }
    } else {
      // No saved data - new user starting onboarding from step 1
      setCurrentStep(1);
    }
  }, [navigate]);

  // Calculate age from date of birth
  const calculateAge = (dob) => {
    if (!dob) return null;
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Validate Step 1
  const validateStep1 = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.dob) {
      newErrors.dob = 'Date of birth is required';
    } else {
      const age = calculateAge(formData.dob);
      if (age < 18) {
        newErrors.dob = 'You must be at least 18 years old';
      }
    }

    if (!formData.gender) {
      newErrors.gender = 'Gender identity is required';
    } else if (formData.gender === 'other' && !formData.customGender.trim()) {
      newErrors.customGender = 'Please specify your gender';
    }

    if (!formData.orientation) {
      newErrors.orientation = 'Sexual orientation is required';
    } else if (formData.orientation === 'other' && !formData.customOrientation.trim()) {
      newErrors.customOrientation = 'Please specify your orientation';
    }

    if (!formData.lookingFor) {
      newErrors.lookingFor = 'Please select an option';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate Step 2
  const validateStep2 = () => {
    const newErrors = {};

    if (!formData.city || formData.city.trim() === '') {
      newErrors.city = 'City is required';
    }

    // Only validate age range if max is provided
    if (formData.ageRange.max !== '' && formData.ageRange.min >= formData.ageRange.max) {
      newErrors.ageRange = 'Minimum age must be less than maximum age';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate Step 3
  const validateStep3 = () => {
    const newErrors = {};

    if (formData.interests.length < 3) {
      newErrors.interests = 'Please select at least 3 interests';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate Step 4
  const validateStep4 = () => {
    const newErrors = {};
    const personality = formData.personality;
    
    if (!personality.social) newErrors.social = 'Please select an option';
    if (!personality.planning) newErrors.planning = 'Please select an option';
    if (!personality.romantic) newErrors.romantic = 'Please select an option';
    if (!personality.morning) newErrors.morning = 'Please select an option';
    if (!personality.homebody) newErrors.homebody = 'Please select an option';
    if (!personality.serious) newErrors.serious = 'Please select an option';
    if (!personality.decision) newErrors.decision = 'Please select an option';
    if (!personality.communication) newErrors.communication = 'Please select an option';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate Step 5
  const validateStep5 = () => {
    const newErrors = {};
    const dealbreakers = formData.dealbreakers;
    
    if (!dealbreakers.kids) newErrors.kids = 'Please select an option';
    if (!dealbreakers.smoking) newErrors.smoking = 'Please select an option';
    if (!dealbreakers.pets) newErrors.pets = 'Please select an option';
    if (!dealbreakers.drinking) newErrors.drinking = 'Please select an option';
    // Religion is optional, so no validation

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate Step 6 (Prompts - at least 3 required)
  const validateStep6 = () => {
    const newErrors = {};
    
    if (!formData.prompts || formData.prompts.length < 3) {
      newErrors.prompts = 'Please select and answer at least 3 prompts';
    } else {
      // Check if all selected prompts have answers
      const incompletePrompts = formData.prompts.filter(p => !p.answer || p.answer.trim() === '');
      if (incompletePrompts.length > 0) {
        newErrors.prompts = 'Please provide answers for all selected prompts';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate Step 7 (Optional Details - language is mandatory)
  const validateStep7 = () => {
    const newErrors = {};
    
    // Language is mandatory - at least one must be selected
    if (!formData.optional.languages || formData.optional.languages.length === 0) {
      newErrors.languages = 'Please select at least one language';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate Step 8 (Profile Setup - minimum 4 photos required)
  const validateStep8 = () => {
    const newErrors = {};
    
    if (!formData.photos || formData.photos.length < 4) {
      newErrors.photos = 'Please upload at least 4 photos';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate Step 9 (Photo Verification - optional)
  const validateStep9 = () => {
    // Verification is optional, so always return true
    return true;
  };

  // Validate Step 10 (Review step)
  const validateStep10 = () => {
    // User just needs to confirm/submit, no validation needed
    return true;
  };

  // Handle input changes
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle gender change
  const handleGenderChange = (value) => {
    handleChange('gender', value);
    setShowCustomGender(value === 'other');
    if (value !== 'other') {
      handleChange('customGender', '');
    }
  };

  // Handle orientation change
  const handleOrientationChange = (value) => {
    handleChange('orientation', value);
    setShowCustomOrientation(value === 'other');
    if (value !== 'other') {
      handleChange('customOrientation', '');
    }
  };

  // Handle looking for selection (single selection)
  const handleLookingForChange = (value) => {
    handleChange('lookingFor', value);
  };

  // Save progress to localStorage
  const saveProgress = () => {
    const savedData = {
      step1: {
        name: formData.name,
        dob: formData.dob,
        gender: formData.gender,
        customGender: formData.customGender,
        orientation: formData.orientation,
        customOrientation: formData.customOrientation,
        lookingFor: formData.lookingFor
      },
      step2: {
        city: formData.city,
        ageRange: formData.ageRange,
        distancePref: formData.distancePref
      },
      step3: {
        interests: formData.interests
      },
      step4: {
        personality: formData.personality
      },
      step5: {
        dealbreakers: formData.dealbreakers
      },
      step6: {
        prompts: formData.prompts
      },
      step7: {
        optional: formData.optional
      },
      step8: {
        photos: formData.photos,
        bio: formData.bio
      },
      currentStep: currentStep
    };
    localStorage.setItem('onboardingData', JSON.stringify(savedData));
  };

  // Handle next button
  const handleNext = () => {
    if (currentStep === 1) {
      if (validateStep1()) {
        saveProgress();
        // After basic information, navigate directly to people page
        navigate('/people');
        return;
      }
    } else if (currentStep === 2) {
      if (validateStep2()) {
        saveProgress();
        setCurrentStep(3);
      }
    } else if (currentStep === 3) {
      if (validateStep3()) {
        saveProgress();
        setCurrentStep(4);
      }
    } else if (currentStep === 4) {
      if (validateStep4()) {
        saveProgress();
        setCurrentStep(5);
      }
    } else if (currentStep === 5) {
      if (validateStep5()) {
        saveProgress();
        setCurrentStep(6);
      }
    } else if (currentStep === 6) {
      if (validateStep6()) {
        saveProgress();
        setCurrentStep(7);
      }
    } else if (currentStep === 7) {
      if (validateStep7()) {
        saveProgress();
        setCurrentStep(8);
      }
    } else if (currentStep === 8) {
      if (validateStep8()) {
        saveProgress();
        setCurrentStep(9);
      }
    } else if (currentStep === 9) {
      if (validateStep9()) {
        saveProgress();
        setCurrentStep(10);
      }
    } else if (currentStep === 10) {
      if (validateStep10()) {
        // Convert photos to base64 for storage
        const photosData = formData.photos.map(photo => {
          if (photo.file) {
            // If it's a file, we need to convert it (this will be handled in the final save)
            return photo;
          } else {
            // Already converted
            return photo;
          }
        });

        // Save profile setup data
        const profileData = {
          photos: photosData,
          bio: formData.bio.trim(),
          completedAt: new Date().toISOString(),
        };
        localStorage.setItem('profileSetup', JSON.stringify(profileData));

        // Mark onboarding as complete
        const savedData = JSON.parse(localStorage.getItem('onboardingData') || '{}');
        savedData.completed = true;
        savedData.currentStep = 10;
        savedData.step8 = {
          photos: formData.photos,
          bio: formData.bio
        };
        savedData.step9 = {
          verified: formData.verified
        };
        localStorage.setItem('onboardingData', JSON.stringify(savedData));
        
        // Check if user came from edit profile page
        const cameFromEditProfile = localStorage.getItem('cameFromEditProfile') === 'true';
        localStorage.removeItem('cameFromEditProfile');
        
        if (cameFromEditProfile) {
          // Redirect back to profile page after editing
          navigate('/profile');
        } else {
          // Navigate to people page (normal flow)
          navigate('/people');
        }
      }
    }
  };

  // Handle back button
  const handleBack = () => {
    if (currentStep === 1) {
      saveProgress();
      navigate('/home');
    } else {
      saveProgress();
      setCurrentStep(currentStep - 1);
    }
  };

  // Get max date for date picker (18 years ago)
  const getMaxDate = () => {
    const today = new Date();
    const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    return maxDate.toISOString().split('T')[0];
  };

  const age = formData.dob ? calculateAge(formData.dob) : null;

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  const pageTransition = {
    type: 'tween',
    ease: [0.4, 0, 0.2, 1],
    duration: 0.3
  };

  return (
    <div className="h-screen heart-background flex flex-col items-center justify-center p-3 sm:p-4 md:p-4 lg:p-6 overflow-hidden relative">
      <span className="heart-decoration">💕</span>
      <span className="heart-decoration">💖</span>
      <span className="heart-decoration">💗</span>
      <span className="heart-decoration">💝</span>
      <span className="heart-decoration">❤️</span>
      <span className="heart-decoration">💓</span>
      <div className="decoration-circle"></div>
      <div className="decoration-circle"></div>
      
      <div className="w-full max-w-md md:max-w-2xl lg:max-w-3xl relative z-10 flex flex-col h-full justify-center md:justify-start md:py-2">
        {/* Enhanced Progress Bar - Hidden for Step 1 */}
        {currentStep !== 1 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="bg-gradient-to-br from-white to-[#FFF0F5] rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 md:p-3 mb-3 sm:mb-4 md:mb-3 border border-[#FFB6C1]/20 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#FF91A4]/5 to-transparent"></div>
            <div className="flex justify-between items-center mb-1.5 sm:mb-2 relative z-10">
              <span className="text-base sm:text-lg md:text-sm font-bold bg-gradient-to-r from-[#FF91A4] to-[#FF69B4] bg-clip-text text-transparent">
                {progressPercentage}% Complete
              </span>
              <span className="text-sm sm:text-base md:text-xs font-semibold text-[#757575]">
                Step {currentStep} of {totalSteps}
              </span>
            </div>
            <div className="w-full bg-gradient-to-r from-[#FFE4E1] to-[#FFF0F5] rounded-full h-2 sm:h-2.5 md:h-2 overflow-hidden shadow-inner border border-[#FFB6C1]/20 relative z-10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                className="h-full rounded-full bg-gradient-to-r from-[#FF91A4] via-[#FF69B4] to-[#FF91A4] relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Form Card */}
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
              className="bg-gradient-to-br from-white to-[#FFF0F5] rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 md:p-4 border border-[#FFB6C1]/20 relative flex flex-col max-h-[calc(100vh-180px)] md:max-h-[calc(100vh-140px)]"
              style={{ zIndex: 1 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#FF91A4]/5 to-transparent pointer-events-none"></div>
              <div className="flex items-center gap-2 mb-2 sm:mb-3 md:mb-2 relative z-10 flex-shrink-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#FF91A4] to-[#FF69B4] rounded-lg flex items-center justify-center shadow-md">
                  <UserCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl md:text-lg font-bold bg-gradient-to-r from-[#FF91A4] to-[#FF69B4] bg-clip-text text-transparent">
                  Basic Information
                </h2>
              </div>
              
              <div className="flex-1 overflow-y-auto pr-1 -mr-1 min-h-0">
              {/* Name */}
              <div className="mb-2 sm:mb-3 relative">
                <label className="block text-base sm:text-lg font-medium text-[#212121] mb-2 sm:mb-2.5">
                  Name <span className="text-[#FF91A4]">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Enter your full name"
                  className={`w-full px-4 sm:px-5 py-3 sm:py-3.5 border-2 rounded-lg text-base sm:text-lg ${
                    errors.name
                      ? 'border-red-500 focus:border-red-600 bg-red-50'
                      : 'border-[#FFB6C1] focus:border-[#FF91A4] bg-white'
                  } text-[#212121] focus:outline-none focus:ring-2 focus:ring-[#FF91A4] focus:ring-opacity-20 transition-all shadow-sm hover:shadow-md`}
                />
                {errors.name && (
                  <p className="text-sm sm:text-base text-red-600 mt-1.5">{errors.name}</p>
                )}
              </div>

              {/* Date of Birth */}
              <div className="mb-3 sm:mb-4 relative">
                <label className="block text-base sm:text-lg font-medium text-[#212121] mb-2 sm:mb-2.5">
                  Age / Date of Birth <span className="text-[#FF91A4]">*</span>
                </label>
                <CustomDatePicker
                  value={formData.dob}
                  onChange={(value) => handleChange('dob', value)}
                  maxDate={getMaxDate()}
                  error={!!errors.dob}
                />
                {age !== null && age >= 18 && (
                  <p className="text-sm sm:text-base text-[#757575] mt-1.5">Age: {age} years</p>
                )}
                {errors.dob && (
                  <p className="text-sm sm:text-base text-red-600 mt-1.5">{errors.dob}</p>
                )}
              </div>

              {/* Gender Identity */}
              <div className="mb-3 sm:mb-4 relative">
                <label className="block text-base sm:text-lg font-medium text-[#212121] mb-2 sm:mb-2.5">
                  Gender Identity <span className="text-[#FF91A4]">*</span>
                </label>
                <CustomDropdown
                  options={[
                    { value: '', label: 'Select gender' },
                    { value: 'male', label: 'Male' },
                    { value: 'female', label: 'Female' },
                    { value: 'non-binary', label: 'Non-binary' },
                    { value: 'trans', label: 'Trans' },
                    { value: 'other', label: 'Other' }
                  ]}
                  value={formData.gender}
                  onChange={handleGenderChange}
                  placeholder="Select gender"
                  error={!!errors.gender}
                />
                {errors.gender && (
                  <p className="text-sm sm:text-base text-red-600 mt-1.5">{errors.gender}</p>
                )}
                {showCustomGender && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-2 sm:mt-3 overflow-hidden"
                  >
                    <input
                      type="text"
                      value={formData.customGender}
                      onChange={(e) => handleChange('customGender', e.target.value)}
                      placeholder="Please specify your gender"
                      className={`w-full px-4 sm:px-5 py-3 sm:py-3.5 border-2 rounded-lg text-base sm:text-lg ${
                        errors.customGender
                          ? 'border-red-500 focus:border-red-600 bg-red-50'
                          : 'border-[#FFB6C1] focus:border-[#FF91A4] bg-white'
                      } text-[#212121] focus:outline-none focus:ring-2 focus:ring-[#FF91A4] focus:ring-opacity-20 transition-all shadow-sm hover:shadow-md`}
                    />
                    {errors.customGender && (
                      <p className="text-sm sm:text-base text-red-600 mt-1.5">{errors.customGender}</p>
                    )}
                  </motion.div>
                )}
              </div>

              {/* Sexual Orientation */}
              <div className="mb-3 sm:mb-4 relative">
                <label className="block text-base sm:text-lg font-medium text-[#212121] mb-2 sm:mb-2.5">
                  Sexual Orientation <span className="text-[#FF91A4]">*</span>
                </label>
                <CustomDropdown
                  options={[
                    { value: '', label: 'Select orientation' },
                    { value: 'straight', label: 'Straight' },
                    { value: 'gay', label: 'Gay' },
                    { value: 'lesbian', label: 'Lesbian' },
                    { value: 'bisexual', label: 'Bisexual' },
                    { value: 'queer', label: 'Queer' },
                    { value: 'other', label: 'Other' }
                  ]}
                  value={formData.orientation}
                  onChange={handleOrientationChange}
                  placeholder="Select orientation"
                  error={!!errors.orientation}
                />
                {errors.orientation && (
                  <p className="text-sm sm:text-base text-red-600 mt-1.5">{errors.orientation}</p>
                )}
                {showCustomOrientation && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-2 sm:mt-3 overflow-hidden"
                  >
                    <input
                      type="text"
                      value={formData.customOrientation}
                      onChange={(e) => handleChange('customOrientation', e.target.value)}
                      placeholder="Please specify your orientation"
                      className={`w-full px-4 sm:px-5 py-3 sm:py-3.5 border-2 rounded-lg text-base sm:text-lg ${
                        errors.customOrientation
                          ? 'border-red-500 focus:border-red-600 bg-red-50'
                          : 'border-[#FFB6C1] focus:border-[#FF91A4] bg-white'
                      } text-[#212121] focus:outline-none focus:ring-2 focus:ring-[#FF91A4] focus:ring-opacity-20 transition-all shadow-sm hover:shadow-md`}
                    />
                    {errors.customOrientation && (
                      <p className="text-sm sm:text-base text-red-600 mt-1.5">{errors.customOrientation}</p>
                    )}
                  </motion.div>
                )}
              </div>

              {/* Looking For */}
              <div className="mb-3 sm:mb-4 relative">
                <label className="block text-base sm:text-lg font-medium text-[#212121] mb-2 sm:mb-2.5">
                  Looking For <span className="text-[#FF91A4]">*</span>
                </label>
                <CustomDropdown
                  options={[
                    { value: '', label: 'Select what you are looking for' },
                    { value: 'casual', label: 'Casual' },
                    { value: 'relationship', label: 'Relationship' },
                    { value: 'marriage', label: 'Marriage' },
                    { value: 'friends', label: 'Friends' }
                  ]}
                  value={formData.lookingFor}
                  onChange={handleLookingForChange}
                  placeholder="Select what you are looking for"
                  error={!!errors.lookingFor}
                />
                {errors.lookingFor && (
                  <p className="text-sm sm:text-base text-red-600 mt-1.5">{errors.lookingFor}</p>
                )}
              </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-2 pt-2 md:pt-2 relative flex-shrink-0 mt-2">
                <motion.button
                  onClick={handleBack}
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 bg-gradient-to-r from-[#757575] to-[#616161] hover:from-[#616161] hover:to-[#757575] text-white font-bold py-3.5 sm:py-4 md:py-2.5 rounded-xl transition-all flex items-center justify-center shadow-lg hover:shadow-xl text-base sm:text-lg md:text-base"
                >
                  <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 md:w-4 md:h-4 mr-2" />
                  <span className="text-base sm:text-lg md:text-base">Back</span>
                </motion.button>
                <motion.button
                  onClick={handleNext}
                  disabled={!formData.name || !formData.dob || !formData.gender || !formData.orientation || !formData.lookingFor}
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 bg-gradient-to-r from-[#FF91A4] to-[#FF69B4] hover:from-[#FF69B4] hover:to-[#FF91A4] disabled:from-[#E0E0E0] disabled:to-[#E0E0E0] disabled:cursor-not-allowed text-white font-bold py-3.5 sm:py-4 md:py-2.5 rounded-xl transition-all disabled:transform-none text-base sm:text-lg md:text-base shadow-xl hover:shadow-2xl disabled:shadow-none"
                >
                  Next →
                </motion.button>
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step2"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
              className="bg-gradient-to-br from-white to-[#FFF0F5] rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 md:p-4 border border-[#FFB6C1]/20 relative flex flex-col max-h-[calc(100vh-180px)] md:max-h-[calc(100vh-140px)]"
              style={{ zIndex: 1 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#FF91A4]/5 to-transparent pointer-events-none"></div>
              <div className="flex items-center gap-2 mb-3 sm:mb-4 relative z-10">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#FF91A4] to-[#FF69B4] rounded-lg flex items-center justify-center shadow-md">
                  <MapPinIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#FF91A4] to-[#FF69B4] bg-clip-text text-transparent">
                  Location & Preferences
                </h2>
              </div>

              {/* City */}
              <div className="mb-3 sm:mb-4">
                <label className="block text-base sm:text-lg font-medium text-[#212121] mb-2 sm:mb-2.5">
                  City <span className="text-[#FF91A4]">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#757575] w-4 h-4 pointer-events-none" />
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    placeholder="Enter your city"
                    className={`w-full pl-10 pr-3 py-3 sm:py-3.5 border-2 rounded-xl text-base sm:text-lg ${
                      errors.city
                        ? 'border-red-500 focus:border-red-600 bg-red-50'
                        : 'border-[#FFB6C1] focus:border-[#FF91A4] bg-white'
                    } text-[#212121] focus:outline-none focus:ring-2 focus:ring-[#FF91A4] focus:ring-opacity-20 transition-all shadow-sm hover:shadow-md`}
                  />
                </div>
                {errors.city && (
                  <p className="text-sm sm:text-base text-red-600 mt-1.5">{errors.city}</p>
                )}
              </div>

              {/* Age Range */}
              <div className="mb-3 sm:mb-4">
                <label className="block text-base sm:text-lg font-medium text-[#212121] mb-2 sm:mb-2.5">
                  Preferred Age Range
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="text-sm sm:text-base text-[#757575] mb-1.5 block">Min</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formData.ageRange.min}
                      onChange={(e) => {
                        const val = e.target.value;
                        // Allow empty or numbers only
                        if (val === '' || /^\d+$/.test(val)) {
                          if (val === '') {
                            handleChange('ageRange', { ...formData.ageRange, min: '' });
                          } else {
                            const numVal = parseInt(val);
                            // Allow any number while typing, validate on blur
                            handleChange('ageRange', { ...formData.ageRange, min: numVal });
                          }
                        }
                      }}
                      onBlur={(e) => {
                        // Ensure value is between 18-100 on blur, default to 18 if empty
                        const val = e.target.value === '' ? 18 : parseInt(e.target.value) || 18;
                        const clampedVal = Math.max(18, Math.min(100, val));
                        handleChange('ageRange', { ...formData.ageRange, min: clampedVal });
                      }}
                      placeholder="18"
                      className="w-full px-4 py-3 border-2 border-[#FFB6C1] rounded-xl text-base sm:text-lg text-[#212121] focus:border-[#FF91A4] focus:outline-none focus:ring-2 focus:ring-[#FF91A4] focus:ring-opacity-20 transition-colors"
                    />
                  </div>
                  <span className="text-[#757575] mt-5">-</span>
                  <div className="flex-1">
                    <label className="text-sm sm:text-base text-[#757575] mb-1.5 block">Max</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formData.ageRange.max === '' ? '' : formData.ageRange.max}
                      onChange={(e) => {
                        const val = e.target.value;
                        // Allow empty or numbers only - user can freely edit
                        if (val === '' || /^\d+$/.test(val)) {
                          if (val === '') {
                            handleChange('ageRange', { ...formData.ageRange, max: '' });
                          } else {
                            const numVal = parseInt(val);
                            // Allow any number while typing, validate on blur
                            handleChange('ageRange', { ...formData.ageRange, max: numVal });
                          }
                        }
                      }}
                      onBlur={(e) => {
                        // Only validate if user entered something
                        if (e.target.value !== '') {
                          const val = parseInt(e.target.value);
                          if (!isNaN(val)) {
                            const clampedVal = Math.max(18, Math.min(100, val));
                            // Ensure max is >= min
                            const finalVal = Math.max(clampedVal, formData.ageRange.min || 18);
                            handleChange('ageRange', { ...formData.ageRange, max: finalVal });
                          }
                        }
                        // If empty, keep it empty - user can fill later
                      }}
                      placeholder="Enter max age"
                      className="w-full px-4 py-3 border-2 border-[#FFB6C1] rounded-xl text-base sm:text-lg text-[#212121] focus:border-[#FF91A4] focus:outline-none focus:ring-2 focus:ring-[#FF91A4] focus:ring-opacity-20 transition-colors"
                    />
                  </div>
                </div>
                {errors.ageRange && (
                  <p className="text-sm sm:text-base text-red-600 mt-1.5">{errors.ageRange}</p>
                )}
              </div>

              {/* Distance Preference */}
              <div className="mb-3 sm:mb-4">
                <label className="block text-base sm:text-lg font-medium text-[#212121] mb-2 sm:mb-2.5">
                  Maximum Distance (km)
                </label>
                <div className="relative">
                  <input
                    type="range"
                    min="5"
                    max="100"
                    step="5"
                    value={formData.distancePref}
                    onChange={(e) => handleChange('distancePref', parseInt(e.target.value))}
                    className="distance-slider w-full h-3 bg-[#E0E0E0] rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, 
                        #FF91A4 0%, 
                        #FF69B4 ${((formData.distancePref - 5) / (100 - 5)) * 100}%, 
                        #E0E0E0 ${((formData.distancePref - 5) / (100 - 5)) * 100}%, 
                        #E0E0E0 100%)`
                    }}
                  />
                </div>
                <div className="flex justify-between text-sm sm:text-base text-[#757575] mt-1.5">
                  <span>5 km</span>
                  <span className="font-semibold text-[#FF91A4]">{formData.distancePref} km</span>
                  <span>100 km</span>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-2 sm:gap-3 pt-2">
                <motion.button
                  onClick={handleBack}
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 bg-gradient-to-r from-[#757575] to-[#616161] hover:from-[#616161] hover:to-[#757575] text-white font-semibold py-2.5 sm:py-3 md:py-2 rounded-xl transition-all flex items-center justify-center shadow-md hover:shadow-lg relative z-10 text-sm md:text-sm"
                >
                  <ArrowLeft className="w-4 h-4 mr-1.5 sm:mr-2" />
                  <span className="text-sm">Back</span>
                </motion.button>
                <motion.button
                  onClick={handleNext}
                  disabled={!formData.city || formData.city.trim() === '' || (formData.ageRange.max !== '' && formData.ageRange.min >= formData.ageRange.max)}
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 bg-gradient-to-r from-[#FF91A4] to-[#FF69B4] hover:from-[#FF69B4] hover:to-[#FF91A4] disabled:from-[#E0E0E0] disabled:to-[#E0E0E0] disabled:cursor-not-allowed text-white font-bold py-3.5 sm:py-4 md:py-2.5 rounded-xl transition-all disabled:transform-none text-base sm:text-lg md:text-base shadow-xl hover:shadow-2xl disabled:shadow-none relative z-10"
                >
                  Next →
                </motion.button>
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step3"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
              className="bg-gradient-to-br from-white to-[#FFF0F5] rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 md:p-4 border border-[#FFB6C1]/20 relative flex flex-col max-h-[calc(100vh-180px)] md:max-h-[calc(100vh-140px)]"
              style={{ zIndex: 1 }}
            >
              {/* Header with Back */}
              <div className="flex items-center justify-start mb-4 relative z-10">
                <button
                  onClick={handleBack}
                  className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 text-[#212121]" />
                </button>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#FF91A4] to-[#FF69B4] bg-clip-text text-transparent mb-3 relative z-10">
                Your Interests
              </h2>
              <p className="text-base sm:text-lg text-[#757575] mb-4 relative z-10">
                Select a few of your interests and let everyone know what you're passionate about.
              </p>

              {/* Interests Grid - All in one grid like Figma design */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4 max-h-[35vh] md:max-h-[40vh] overflow-y-auto pr-2 mb-3 md:mb-2">
                {[
                  { name: 'Photography', icon: Camera },
                  { name: 'Shopping', icon: ShoppingBag },
                  { name: 'Run', icon: User },
                  { name: 'Traveling', icon: Plane },
                  { name: 'Karaoke', icon: Mic },
                  { name: 'Yoga', icon: Dumbbell },
                  { name: 'Cooking', icon: ChefHat },
                  { name: 'Tennis', icon: Activity },
                  { name: 'Art', icon: Palette },
                  { name: 'Extreme', icon: Mountain },
                  { name: 'Music', icon: Music },
                  { name: 'Drink', icon: Wine },
                  { name: 'Video games', icon: Gamepad2 },
                  { name: 'Swimming', icon: Waves },
                ].map((interest, idx) => {
                  const Icon = interest.icon;
                  const isSelected = formData.interests.includes(interest.name);
                  return (
                    <motion.button
                      key={interest.name}
                      type="button"
                      onClick={() => {
                        const current = formData.interests;
                        if (current.includes(interest.name)) {
                          handleChange('interests', current.filter(item => item !== interest.name));
                        } else {
                          handleChange('interests', [...current, interest.name]);
                        }
                      }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.03 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex flex-col items-center justify-center gap-1.5 p-3 sm:p-4 rounded-xl transition-all border-2 ${
                        isSelected
                          ? 'bg-gradient-to-br from-[#FF91A4] to-[#FF69B4] text-white border-[#FF91A4] shadow-md'
                          : 'bg-white text-[#212121] border-[#FFB6C1] hover:border-[#FF91A4]'
                      }`}
                    >
                      <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${isSelected ? 'text-white' : 'text-[#212121]'}`} />
                      <span className="text-sm sm:text-base font-medium text-center">{interest.name}</span>
                    </motion.button>
                  );
                })}
              </div>

              {errors.interests && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm sm:text-base text-[#FF91A4] mb-4 text-center"
                >
                  {errors.interests}
                </motion.p>
              )}

              {/* Continue Button */}
              <div className="pt-4">
                <motion.button
                  onClick={handleNext}
                  disabled={formData.interests.length < 3}
                  whileHover={{ scale: formData.interests.length >= 3 ? 1.02 : 1 }}
                  whileTap={{ scale: formData.interests.length >= 3 ? 0.98 : 1 }}
                  className="w-full bg-gradient-to-r from-[#FF91A4] to-[#FF69B4] hover:from-[#FF69B4] hover:to-[#FF91A4] disabled:from-[#E0E0E0] disabled:to-[#E0E0E0] disabled:cursor-not-allowed text-white font-semibold py-4 sm:py-5 md:py-3 rounded-2xl transition-all text-base sm:text-lg md:text-base shadow-lg hover:shadow-xl disabled:shadow-none relative z-10"
                >
                  Continue
                </motion.button>
              </div>
            </motion.div>
          )}

          {currentStep === 4 && (
            <motion.div
              key="step4"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
              className="bg-gradient-to-br from-white to-[#FFF0F5] rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 md:p-4 border border-[#FFB6C1]/20 relative flex flex-col max-h-[calc(100vh-180px)] md:max-h-[calc(100vh-140px)]"
              style={{ zIndex: 1 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#FF91A4]/5 to-transparent pointer-events-none"></div>
              <div className="flex items-center gap-2 mb-3 sm:mb-4 relative z-10">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#FF91A4] to-[#FF69B4] rounded-lg flex items-center justify-center shadow-md">
                  <Smile className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#FF91A4] to-[#FF69B4] bg-clip-text text-transparent">
                  Personality Traits
                </h2>
              </div>
              <p className="text-base sm:text-lg text-[#757575] mb-3 sm:mb-4">
                Choose the option that best describes you
              </p>

              {/* Personality Questions */}
              <div className="space-y-4 sm:space-y-5 max-h-[45vh] md:max-h-[50vh] overflow-y-auto pr-2 relative z-10 flex-1">
                {/* Social vs Introvert */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mb-4 sm:mb-5"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF91A4]" />
                    <label className="text-base sm:text-lg font-semibold text-[#212121]">
                      Social Style <span className="text-[#FF91A4]">*</span>
                    </label>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                    {[
                      { value: 'social', label: 'Social', icon: Users },
                      { value: 'introvert', label: 'Introvert', icon: User }
                    ].map((option) => {
                      const Icon = option.icon;
                      const isSelected = formData.personality.social === option.value;
                      return (
                        <motion.button
                          key={option.value}
                          type="button"
                          onClick={() => handleChange('personality', { ...formData.personality, social: option.value })}
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          className={`relative px-3 sm:px-4 py-3 sm:py-4 rounded-xl border-2 text-base sm:text-lg font-semibold transition-all flex flex-col items-center gap-1.5 ${
                            isSelected
                              ? 'bg-gradient-to-br from-[#FF91A4] to-[#FF69B4] text-white border-[#FF91A4] shadow-lg'
                              : 'bg-white text-[#212121] border-[#FFB6C1] hover:border-[#FF91A4] hover:shadow-md'
                          } ${errors.social ? 'border-red-500' : ''}`}
                        >
                          <Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${isSelected ? 'text-white' : 'text-[#FF91A4]'}`} />
                          <span>{option.label}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                  {errors.social && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm sm:text-base text-[#FF91A4] mt-2"
                    >
                      {errors.social}
                    </motion.p>
                  )}
                </motion.div>

                {/* Planner vs Spontaneous */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="mb-4 sm:mb-5"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF91A4]" />
                    <label className="text-base sm:text-lg font-semibold text-[#212121]">
                      Planning Style <span className="text-[#FF91A4]">*</span>
                    </label>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                    {[
                      { value: 'planner', label: 'Planner', icon: Calendar },
                      { value: 'spontaneous', label: 'Spontaneous', icon: Zap }
                    ].map((option) => {
                      const Icon = option.icon;
                      const isSelected = formData.personality.planning === option.value;
                      return (
                        <motion.button
                          key={option.value}
                          type="button"
                          onClick={() => handleChange('personality', { ...formData.personality, planning: option.value })}
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          className={`relative px-3 sm:px-4 py-3 sm:py-4 rounded-xl border-2 text-base sm:text-lg font-semibold transition-all flex flex-col items-center gap-1.5 ${
                            isSelected
                              ? 'bg-gradient-to-br from-[#FF91A4] to-[#FF69B4] text-white border-[#FF91A4] shadow-lg'
                              : 'bg-white text-[#212121] border-[#FFB6C1] hover:border-[#FF91A4] hover:shadow-md'
                          } ${errors.planning ? 'border-red-500' : ''}`}
                        >
                          <Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${isSelected ? 'text-white' : 'text-[#FF91A4]'}`} />
                          <span>{option.label}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                  {errors.planning && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm sm:text-base text-[#FF91A4] mt-2"
                    >
                      {errors.planning}
                    </motion.p>
                  )}
                </motion.div>

                {/* Romantic vs Practical */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mb-4 sm:mb-5"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF91A4]" />
                    <label className="text-base sm:text-lg font-semibold text-[#212121]">
                      Approach <span className="text-[#FF91A4]">*</span>
                    </label>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                    {[
                      { value: 'romantic', label: 'Romantic', icon: Heart },
                      { value: 'practical', label: 'Practical', icon: Check }
                    ].map((option) => {
                      const Icon = option.icon;
                      const isSelected = formData.personality.romantic === option.value;
                      return (
                        <motion.button
                          key={option.value}
                          type="button"
                          onClick={() => handleChange('personality', { ...formData.personality, romantic: option.value })}
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          className={`relative px-3 sm:px-4 py-3 sm:py-4 rounded-xl border-2 text-base sm:text-lg font-semibold transition-all flex flex-col items-center gap-1.5 ${
                            isSelected
                              ? 'bg-gradient-to-br from-[#FF91A4] to-[#FF69B4] text-white border-[#FF91A4] shadow-lg'
                              : 'bg-white text-[#212121] border-[#FFB6C1] hover:border-[#FF91A4] hover:shadow-md'
                          } ${errors.romantic ? 'border-red-500' : ''}`}
                        >
                          <Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${isSelected ? 'text-white' : 'text-[#FF91A4]'}`} />
                          <span>{option.label}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                  {errors.romantic && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm sm:text-base text-[#FF91A4] mt-2"
                    >
                      {errors.romantic}
                    </motion.p>
                  )}
                </motion.div>

                {/* Morning vs Night */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="mb-4 sm:mb-5"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF91A4]" />
                    <label className="text-base sm:text-lg font-semibold text-[#212121]">
                      Energy Time <span className="text-[#FF91A4]">*</span>
                    </label>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                    {[
                      { value: 'morning', label: 'Morning Person', icon: Sun },
                      { value: 'night', label: 'Night Owl', icon: Moon }
                    ].map((option) => {
                      const Icon = option.icon;
                      const isSelected = formData.personality.morning === option.value;
                      return (
                        <motion.button
                          key={option.value}
                          type="button"
                          onClick={() => handleChange('personality', { ...formData.personality, morning: option.value })}
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          className={`relative px-3 sm:px-4 py-3 sm:py-4 rounded-xl border-2 text-base sm:text-lg font-semibold transition-all flex flex-col items-center gap-1.5 ${
                            isSelected
                              ? 'bg-gradient-to-br from-[#FF91A4] to-[#FF69B4] text-white border-[#FF91A4] shadow-lg'
                              : 'bg-white text-[#212121] border-[#FFB6C1] hover:border-[#FF91A4] hover:shadow-md'
                          } ${errors.morning ? 'border-red-500' : ''}`}
                        >
                          <Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${isSelected ? 'text-white' : 'text-[#FF91A4]'}`} />
                          <span>{option.label}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                  {errors.morning && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm sm:text-base text-[#FF91A4] mt-2"
                    >
                      {errors.morning}
                    </motion.p>
                  )}
                </motion.div>

                {/* Homebody vs Outgoing */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mb-4 sm:mb-5"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Home className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF91A4]" />
                    <label className="text-base sm:text-lg font-semibold text-[#212121]">
                      Lifestyle <span className="text-[#FF91A4]">*</span>
                    </label>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                    {[
                      { value: 'homebody', label: 'Homebody', icon: Home },
                      { value: 'outgoing', label: 'Outgoing', icon: Plane }
                    ].map((option) => {
                      const Icon = option.icon;
                      const isSelected = formData.personality.homebody === option.value;
                      return (
                        <motion.button
                          key={option.value}
                          type="button"
                          onClick={() => handleChange('personality', { ...formData.personality, homebody: option.value })}
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          className={`relative px-3 sm:px-4 py-3 sm:py-4 rounded-xl border-2 text-base sm:text-lg font-semibold transition-all flex flex-col items-center gap-1.5 ${
                            isSelected
                              ? 'bg-gradient-to-br from-[#FF91A4] to-[#FF69B4] text-white border-[#FF91A4] shadow-lg'
                              : 'bg-white text-[#212121] border-[#FFB6C1] hover:border-[#FF91A4] hover:shadow-md'
                          } ${errors.homebody ? 'border-red-500' : ''}`}
                        >
                          <Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${isSelected ? 'text-white' : 'text-[#FF91A4]'}`} />
                          <span>{option.label}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                  {errors.homebody && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm sm:text-base text-[#FF91A4] mt-2"
                    >
                      {errors.homebody}
                    </motion.p>
                  )}
                </motion.div>

                {/* Serious vs Fun-loving */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="mb-4 sm:mb-5"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Smile className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF91A4]" />
                    <label className="text-base sm:text-lg font-semibold text-[#212121]">
                      Personality <span className="text-[#FF91A4]">*</span>
                    </label>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                    {[
                      { value: 'serious', label: 'Serious', icon: Check },
                      { value: 'fun-loving', label: 'Fun-loving', icon: Sparkles }
                    ].map((option) => {
                      const Icon = option.icon;
                      const isSelected = formData.personality.serious === option.value;
                      return (
                        <motion.button
                          key={option.value}
                          type="button"
                          onClick={() => handleChange('personality', { ...formData.personality, serious: option.value })}
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          className={`relative px-3 sm:px-4 py-3 sm:py-4 rounded-xl border-2 text-base sm:text-lg font-semibold transition-all flex flex-col items-center gap-1.5 ${
                            isSelected
                              ? 'bg-gradient-to-br from-[#FF91A4] to-[#FF69B4] text-white border-[#FF91A4] shadow-lg'
                              : 'bg-white text-[#212121] border-[#FFB6C1] hover:border-[#FF91A4] hover:shadow-md'
                          } ${errors.serious ? 'border-red-500' : ''}`}
                        >
                          <Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${isSelected ? 'text-white' : 'text-[#FF91A4]'}`} />
                          <span>{option.label}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                  {errors.serious && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm sm:text-base text-[#FF91A4] mt-2"
                    >
                      {errors.serious}
                    </motion.p>
                  )}
                </motion.div>

                {/* Quick vs Thoughtful Decision */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mb-4 sm:mb-5"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF91A4]" />
                    <label className="text-base sm:text-lg font-semibold text-[#212121]">
                      Decision Making <span className="text-[#FF91A4]">*</span>
                    </label>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                    {[
                      { value: 'quick', label: 'Quick Decider', icon: Zap },
                      { value: 'thoughtful', label: 'Thoughtful', icon: Coffee }
                    ].map((option) => {
                      const Icon = option.icon;
                      const isSelected = formData.personality.decision === option.value;
                      return (
                        <motion.button
                          key={option.value}
                          type="button"
                          onClick={() => handleChange('personality', { ...formData.personality, decision: option.value })}
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          className={`relative px-3 sm:px-4 py-3 sm:py-4 rounded-xl border-2 text-base sm:text-lg font-semibold transition-all flex flex-col items-center gap-1.5 ${
                            isSelected
                              ? 'bg-gradient-to-br from-[#FF91A4] to-[#FF69B4] text-white border-[#FF91A4] shadow-lg'
                              : 'bg-white text-[#212121] border-[#FFB6C1] hover:border-[#FF91A4] hover:shadow-md'
                          } ${errors.decision ? 'border-red-500' : ''}`}
                        >
                          <Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${isSelected ? 'text-white' : 'text-[#FF91A4]'}`} />
                          <span>{option.label}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                  {errors.decision && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm sm:text-base text-[#FF91A4] mt-2"
                    >
                      {errors.decision}
                    </motion.p>
                  )}
                </motion.div>

                {/* Direct vs Subtle Communication */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                  className="mb-4 sm:mb-5"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF91A4]" />
                    <label className="text-base sm:text-lg font-semibold text-[#212121]">
                      Communication Style <span className="text-[#FF91A4]">*</span>
                    </label>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                    {[
                      { value: 'direct', label: 'Direct', icon: MessageSquare },
                      { value: 'subtle', label: 'Subtle', icon: Heart }
                    ].map((option) => {
                      const Icon = option.icon;
                      const isSelected = formData.personality.communication === option.value;
                      return (
                        <motion.button
                          key={option.value}
                          type="button"
                          onClick={() => handleChange('personality', { ...formData.personality, communication: option.value })}
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          className={`relative px-3 sm:px-4 py-3 sm:py-4 rounded-xl border-2 text-base sm:text-lg font-semibold transition-all flex flex-col items-center gap-1.5 ${
                            isSelected
                              ? 'bg-gradient-to-br from-[#FF91A4] to-[#FF69B4] text-white border-[#FF91A4] shadow-lg'
                              : 'bg-white text-[#212121] border-[#FFB6C1] hover:border-[#FF91A4] hover:shadow-md'
                          } ${errors.communication ? 'border-red-500' : ''}`}
                        >
                          <Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${isSelected ? 'text-white' : 'text-[#FF91A4]'}`} />
                          <span>{option.label}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                  {errors.communication && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm sm:text-base text-[#FF91A4] mt-2"
                    >
                      {errors.communication}
                    </motion.p>
                  )}
                </motion.div>
              </div>

              {/* Progress Indicator */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 sm:mt-5 text-center"
              >
                <p className="text-xs sm:text-sm text-[#757575]">
                  {Object.values(formData.personality).filter(v => v !== '').length} of 8 questions answered
                </p>
              </motion.div>

              {/* Navigation Buttons */}
              <div className="flex gap-2 sm:gap-3 pt-4 sm:pt-6">
                <motion.button
                  onClick={handleBack}
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 bg-gradient-to-r from-[#757575] to-[#616161] hover:from-[#616161] hover:to-[#757575] text-white font-semibold py-2.5 sm:py-3 md:py-2 rounded-xl transition-all flex items-center justify-center shadow-md hover:shadow-lg relative z-10 text-sm md:text-sm"
                >
                  <ArrowLeft className="w-4 h-4 mr-1.5 sm:mr-2" />
                  <span className="text-sm">Back</span>
                </motion.button>
                <motion.button
                  onClick={handleNext}
                  disabled={Object.values(formData.personality).some(v => v === '')}
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 bg-gradient-to-r from-[#FF91A4] to-[#FF69B4] hover:from-[#FF69B4] hover:to-[#FF91A4] disabled:from-[#E0E0E0] disabled:to-[#E0E0E0] disabled:cursor-not-allowed text-white font-bold py-3.5 sm:py-4 md:py-2.5 rounded-xl transition-all disabled:transform-none text-base sm:text-lg md:text-base shadow-xl hover:shadow-2xl disabled:shadow-none relative z-10"
                >
                  Next →
                </motion.button>
              </div>
            </motion.div>
          )}

          {currentStep === 5 && (
            <motion.div
              key="step5"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
              className="bg-gradient-to-br from-white to-[#FFF0F5] rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 md:p-4 border border-[#FFB6C1]/20 relative flex flex-col max-h-[calc(100vh-180px)] md:max-h-[calc(100vh-140px)]"
              style={{ zIndex: 1 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#FF91A4]/5 to-transparent pointer-events-none"></div>
              <div className="flex items-center gap-2 mb-3 sm:mb-4 relative z-10">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#FF91A4] to-[#FF69B4] rounded-lg flex items-center justify-center shadow-md">
                  <Home className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <h2 className="text-base sm:text-lg font-bold bg-gradient-to-r from-[#FF91A4] to-[#FF69B4] bg-clip-text text-transparent">
                  Dealbreakers & Lifestyle
                </h2>
              </div>
              <p className="text-xs sm:text-sm md:text-xs text-[#757575] mb-4 sm:mb-6 md:mb-2 relative z-10">
                Tell us about your lifestyle preferences
              </p>

              {/* Dealbreakers Questions */}
              <div className="space-y-4 sm:space-y-5 md:space-y-2 max-h-[45vh] md:max-h-[50vh] overflow-y-auto pr-2 relative z-10 flex-1">
                {/* Kids */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mb-4 sm:mb-5 md:mb-2"
                >
                  <div className="flex items-center gap-2 mb-3 md:mb-1.5">
                    <Baby className="w-4 h-4 sm:w-5 sm:h-5 md:w-4 md:h-4 text-[#FF91A4]" />
                    <label className="text-base sm:text-lg md:text-sm font-semibold text-[#212121]">
                      Kids <span className="text-[#FF91A4]">*</span>
                    </label>
                  </div>
                  <CustomDropdown
                    options={[
                      { value: '', label: 'Select an option' },
                      { value: 'have-kids', label: 'Have Kids' },
                      { value: 'want-kids', label: 'Want Kids' },
                      { value: 'dont-want-kids', label: "Don't Want Kids" },
                      { value: 'not-sure', label: 'Not Sure' }
                    ]}
                    value={formData.dealbreakers.kids}
                    onChange={(value) => handleChange('dealbreakers', { ...formData.dealbreakers, kids: value })}
                    placeholder="Select an option"
                    error={!!errors.kids}
                  />
                  {errors.kids && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm sm:text-base md:text-xs text-[#FF91A4] mt-2 md:mt-1"
                    >
                      {errors.kids}
                    </motion.p>
                  )}
                </motion.div>

                {/* Smoking */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="mb-4 sm:mb-5 md:mb-2"
                >
                  <div className="flex items-center gap-2 mb-3 md:mb-1.5">
                    <Cigarette className="w-4 h-4 sm:w-5 sm:h-5 md:w-4 md:h-4 text-[#FF91A4]" />
                    <label className="text-base sm:text-lg md:text-sm font-semibold text-[#212121]">
                      Smoking <span className="text-[#FF91A4]">*</span>
                    </label>
                  </div>
                  <CustomDropdown
                    options={[
                      { value: '', label: 'Select an option' },
                      { value: 'smoker', label: 'Smoker' },
                      { value: 'non-smoker', label: 'Non-smoker' },
                      { value: 'social-smoker', label: 'Social Smoker' },
                      { value: 'prefer-non-smoker', label: 'Prefer Non-smoker' }
                    ]}
                    value={formData.dealbreakers.smoking}
                    onChange={(value) => handleChange('dealbreakers', { ...formData.dealbreakers, smoking: value })}
                    placeholder="Select an option"
                    error={!!errors.smoking}
                  />
                  {errors.smoking && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm sm:text-base md:text-xs text-[#FF91A4] mt-2 md:mt-1"
                    >
                      {errors.smoking}
                    </motion.p>
                  )}
                </motion.div>

                {/* Pets */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mb-4 sm:mb-5 md:mb-2"
                >
                  <div className="flex items-center gap-2 mb-3 md:mb-1.5">
                    <Dog className="w-4 h-4 sm:w-5 sm:h-5 md:w-4 md:h-4 text-[#FF91A4]" />
                    <label className="text-base sm:text-lg md:text-sm font-semibold text-[#212121]">
                      Pets <span className="text-[#FF91A4]">*</span>
                    </label>
                  </div>
                  <CustomDropdown
                    options={[
                      { value: '', label: 'Select an option' },
                      { value: 'love-pets', label: 'Love Pets' },
                      { value: 'have-pets', label: 'Have Pets' },
                      { value: 'allergic', label: 'Allergic' },
                      { value: 'not-interested', label: 'Not Interested' }
                    ]}
                    value={formData.dealbreakers.pets}
                    onChange={(value) => handleChange('dealbreakers', { ...formData.dealbreakers, pets: value })}
                    placeholder="Select an option"
                    error={!!errors.pets}
                  />
                  {errors.pets && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm sm:text-base md:text-xs text-[#FF91A4] mt-2 md:mt-1"
                    >
                      {errors.pets}
                    </motion.p>
                  )}
                </motion.div>

                {/* Drinking */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="mb-4 sm:mb-5 md:mb-2"
                >
                  <div className="flex items-center gap-2 mb-3 md:mb-1.5">
                    <GlassWater className="w-4 h-4 sm:w-5 sm:h-5 md:w-4 md:h-4 text-[#FF91A4]" />
                    <label className="text-base sm:text-lg md:text-sm font-semibold text-[#212121]">
                      Drinking <span className="text-[#FF91A4]">*</span>
                    </label>
                  </div>
                  <CustomDropdown
                    options={[
                      { value: '', label: 'Select an option' },
                      { value: 'never', label: 'Never' },
                      { value: 'occasionally', label: 'Occasionally' },
                      { value: 'socially', label: 'Socially' },
                      { value: 'regularly', label: 'Regularly' }
                    ]}
                    value={formData.dealbreakers.drinking}
                    onChange={(value) => handleChange('dealbreakers', { ...formData.dealbreakers, drinking: value })}
                    placeholder="Select an option"
                    error={!!errors.drinking}
                  />
                  {errors.drinking && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm sm:text-base md:text-xs text-[#FF91A4] mt-2 md:mt-1"
                    >
                      {errors.drinking}
                    </motion.p>
                  )}
                </motion.div>

                {/* Religion (Optional) */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mb-4 sm:mb-5 md:mb-2"
                >
                  <div className="flex items-center gap-2 mb-3 md:mb-1.5">
                    <Heart className="w-4 h-4 sm:w-5 sm:h-5 md:w-4 md:h-4 text-[#FF91A4]" />
                    <label className="text-base sm:text-lg md:text-sm font-semibold text-[#212121]">
                      Religion <span className="text-[#757575] text-xs md:text-[10px] font-normal">(Optional)</span>
                    </label>
                  </div>
                  <CustomDropdown
                    options={[
                      { value: '', label: 'Select religion (optional)' },
                      { value: 'hindu', label: 'Hindu' },
                      { value: 'muslim', label: 'Muslim' },
                      { value: 'christian', label: 'Christian' },
                      { value: 'sikh', label: 'Sikh' },
                      { value: 'buddhist', label: 'Buddhist' },
                      { value: 'jain', label: 'Jain' },
                      { value: 'other', label: 'Other' },
                      { value: 'prefer-not-to-say', label: 'Prefer not to say' }
                    ]}
                    value={formData.dealbreakers.religion}
                    onChange={(value) => handleChange('dealbreakers', { ...formData.dealbreakers, religion: value })}
                    placeholder="Select religion (optional)"
                    error={false}
                  />
                </motion.div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-2 sm:gap-3 pt-4 sm:pt-6 relative" style={{ zIndex: 1 }}>
                <motion.button
                  onClick={handleBack}
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 bg-gradient-to-r from-[#757575] to-[#616161] hover:from-[#616161] hover:to-[#757575] text-white font-semibold py-2.5 sm:py-3 md:py-2 rounded-xl transition-all flex items-center justify-center shadow-md hover:shadow-lg text-sm md:text-sm"
                >
                  <ArrowLeft className="w-4 h-4 md:w-3 md:h-3 mr-1.5 sm:mr-2" />
                  <span className="text-sm">Back</span>
                </motion.button>
                <motion.button
                  onClick={handleNext}
                  disabled={!formData.dealbreakers.kids || !formData.dealbreakers.smoking || !formData.dealbreakers.pets || !formData.dealbreakers.drinking}
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 bg-gradient-to-r from-[#FF91A4] to-[#FF69B4] hover:from-[#FF69B4] hover:to-[#FF91A4] disabled:from-[#E0E0E0] disabled:to-[#E0E0E0] disabled:cursor-not-allowed text-white font-bold py-3.5 sm:py-4 md:py-2.5 rounded-xl transition-all disabled:transform-none text-base sm:text-lg md:text-base shadow-xl hover:shadow-2xl disabled:shadow-none"
                >
                  Next →
                </motion.button>
              </div>
            </motion.div>
          )}

          {currentStep === 6 && (
            <motion.div
              key="step6"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
              className="bg-gradient-to-br from-white to-[#FFF0F5] rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 md:p-4 border border-[#FFB6C1]/20 relative flex flex-col max-h-[calc(100vh-180px)] md:max-h-[calc(100vh-140px)]"
              style={{ zIndex: 1 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#FF91A4]/5 to-transparent pointer-events-none"></div>
              <div className="flex items-center gap-2 mb-3 sm:mb-4 relative z-10">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#FF91A4] to-[#FF69B4] rounded-lg flex items-center justify-center shadow-md">
                  <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <h2 className="text-base sm:text-lg font-bold bg-gradient-to-r from-[#FF91A4] to-[#FF69B4] bg-clip-text text-transparent">
                  Answer Prompts
                </h2>
              </div>
              <p className="text-[10px] sm:text-xs md:text-[10px] text-[#757575] mb-3 sm:mb-4 md:mb-2">
                Select at least 3 prompts and answer them to help others know you better
              </p>

              {/* Prompts Section */}
              <div className="space-y-4 sm:space-y-5 md:space-y-3 max-h-[45vh] md:max-h-[50vh] overflow-y-auto pr-2 relative z-10 flex-1">
                {/* Prompt List */}
                {[
                  "What's the best way to ask you out?",
                  "I'm a great +1 for...",
                  "The way to my heart is...",
                  "I'll fall for you if...",
                  "My simple pleasures...",
                  "I'm weirdly attracted to...",
                  "The best way to ask me out is by...",
                  "I'll know it's a match when...",
                  "I'm looking for...",
                  "My love language is...",
                  "I'm a great +1 because...",
                  "The quickest way to my heart is...",
                  "We'll get along if...",
                  "I'm the type of person who...",
                  "My ideal first date...",
                  "I'm weirdly attracted to people who...",
                  "The way to win me over is...",
                  "I'll fall for you if you...",
                  "My biggest ick is...",
                  "I'm looking for someone who..."
                ].map((promptText, idx) => {
                  const selectedPrompt = formData.prompts.find(p => p.prompt === promptText);
                  const isSelected = !!selectedPrompt;
                  
                  return (
                    <motion.div
                      key={promptText}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="mb-3 sm:mb-4 md:mb-2"
                    >
                      <motion.button
                        type="button"
                        onClick={() => {
                          const current = formData.prompts || [];
                          let newPrompts;
                          if (isSelected) {
                            // Remove prompt
                            newPrompts = current.filter(p => p.prompt !== promptText);
                          } else {
                            // Add prompt with empty answer
                            newPrompts = [...current, { prompt: promptText, answer: '' }];
                          }
                          handleChange('prompts', newPrompts);
                          // Clear error if at least 3 prompts are selected
                          if (newPrompts.length >= 3 && errors.prompts) {
                            setErrors(prev => {
                              const newErrors = { ...prev };
                              delete newErrors.prompts;
                              return newErrors;
                            });
                          }
                        }}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full text-left px-4 sm:px-5 md:px-3 py-3 sm:py-3.5 md:py-2.5 rounded-xl sm:rounded-2xl md:rounded-lg border-2 transition-all ${
                          isSelected
                            ? 'bg-gradient-to-br from-[#FF91A4] to-[#FF69B4] text-white border-[#FF91A4] shadow-md'
                            : 'bg-white text-[#212121] border-[#FFB6C1] hover:border-[#FF91A4] hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-5 h-5 sm:w-6 sm:h-6 md:w-5 md:h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            isSelected
                              ? 'border-white bg-white/20'
                              : 'border-[#FF91A4] bg-transparent'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 sm:w-4 sm:h-4 md:w-3 md:h-3 text-white" />}
                          </div>
                          <span className={`text-sm sm:text-base md:text-sm font-medium ${isSelected ? 'text-white' : 'text-[#212121]'}`}>
                            {promptText}
                          </span>
                        </div>
                      </motion.button>
                      
                      {/* Answer Input - Show when prompt is selected */}
                      {isSelected && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-2 sm:mt-3 md:mt-2"
                        >
                          <textarea
                            value={selectedPrompt.answer || ''}
                            onChange={(e) => {
                              const updatedPrompts = formData.prompts.map(p =>
                                p.prompt === promptText ? { ...p, answer: e.target.value } : p
                              );
                              handleChange('prompts', updatedPrompts);
                            }}
                            placeholder="Type your answer here..."
                            rows={3}
                            className="w-full px-4 md:px-3 py-2.5 sm:py-3 md:py-2 border-2 border-[#FFB6C1] rounded-xl sm:rounded-2xl md:rounded-lg text-sm sm:text-base md:text-sm text-[#212121] bg-white focus:outline-none focus:ring-2 focus:ring-[#FF91A4] focus:ring-opacity-20 focus:border-[#FF91A4] transition-all shadow-sm hover:shadow-md resize-none"
                          />
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
                
                {/* Error Message */}
                {errors.prompts && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs sm:text-sm md:text-[10px] text-red-600 mt-2 md:mt-1 font-medium"
                  >
                    {errors.prompts}
                  </motion.p>
                )}
                
                {/* Selected Count */}
                {formData.prompts && formData.prompts.length > 0 && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`text-xs sm:text-sm md:text-[10px] mt-2 md:mt-1 font-medium ${
                      formData.prompts.length >= 3 ? 'text-[#FF91A4]' : 'text-[#757575]'
                    }`}
                  >
                    {formData.prompts.length >= 3 ? '✓ ' : ''}
                    {formData.prompts.length} of 3+ prompts selected
                    {formData.prompts.some(p => !p.answer || p.answer.trim() === '') && ' (Please answer all selected prompts)'}
                  </motion.p>
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-2 sm:gap-3 pt-4 sm:pt-6 relative" style={{ zIndex: 1 }}>
                <motion.button
                  onClick={handleBack}
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 bg-gradient-to-r from-[#757575] to-[#616161] hover:from-[#616161] hover:to-[#757575] text-white font-semibold py-2.5 sm:py-3 md:py-2 rounded-xl transition-all flex items-center justify-center shadow-md hover:shadow-lg"
                >
                  <ArrowLeft className="w-4 h-4 mr-1.5 sm:mr-2" />
                  <span className="text-sm md:text-sm">Back</span>
                </motion.button>
                <motion.button
                  onClick={handleNext}
                  disabled={!formData.prompts || formData.prompts.length < 3 || formData.prompts.some(p => !p.answer || p.answer.trim() === '')}
                  whileHover={{ scale: (!formData.prompts || formData.prompts.length < 3 || formData.prompts.some(p => !p.answer || p.answer.trim() === '')) ? 1 : 1.02, y: (!formData.prompts || formData.prompts.length < 3 || formData.prompts.some(p => !p.answer || p.answer.trim() === '')) ? 0 : -1 }}
                  whileTap={{ scale: (!formData.prompts || formData.prompts.length < 3 || formData.prompts.some(p => !p.answer || p.answer.trim() === '')) ? 1 : 0.98 }}
                  className={`flex-1 font-semibold py-2.5 sm:py-3 md:py-2 rounded-xl transition-all text-sm md:text-sm shadow-lg ${
                    (!formData.prompts || formData.prompts.length < 3 || formData.prompts.some(p => !p.answer || p.answer.trim() === ''))
                      ? 'bg-[#E0E0E0] text-[#9E9E9E] cursor-not-allowed shadow-none'
                      : 'bg-gradient-to-r from-[#FF91A4] to-[#FF69B4] hover:from-[#FF69B4] hover:to-[#FF91A4] text-white hover:shadow-xl'
                  }`}
                >
                  Next →
                </motion.button>
              </div>
            </motion.div>
          )}

          {currentStep === 7 && (
            <motion.div
              key="step7"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
              className="bg-gradient-to-br from-white to-[#FFF0F5] rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 md:p-4 border border-[#FFB6C1]/20 relative flex flex-col max-h-[calc(100vh-180px)] md:max-h-[calc(100vh-140px)]"
              style={{ zIndex: 1 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#FF91A4]/5 to-transparent pointer-events-none"></div>
              <div className="flex items-center gap-2 mb-3 sm:mb-4 relative z-10">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#FF91A4] to-[#FF69B4] rounded-lg flex items-center justify-center shadow-md">
                  <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <h2 className="text-base sm:text-lg font-bold bg-gradient-to-r from-[#FF91A4] to-[#FF69B4] bg-clip-text text-transparent">
                  Optional Details
                </h2>
              </div>
              <p className="text-[10px] sm:text-xs md:text-[10px] text-[#757575] mb-3 sm:mb-4 md:mb-2">
                Share more about yourself (all fields are optional)
              </p>

              {/* Optional Details */}
              <div className="space-y-4 sm:space-y-5 md:space-y-2 max-h-[45vh] md:max-h-[50vh] overflow-y-auto pr-2 relative z-10 flex-1">
                {/* Education */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mb-4 sm:mb-5 md:mb-2"
                >
                  <div className="flex items-center gap-2 mb-3 md:mb-1.5">
                    <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 md:w-4 md:h-4 text-[#FF91A4]" />
                    <label className="text-base sm:text-lg md:text-sm font-semibold text-[#212121]">
                      Education <span className="text-[#757575] text-xs md:text-[10px] font-normal">(Optional)</span>
                    </label>
                  </div>
                  <CustomDropdown
                    options={[
                      { value: '', label: 'Select education (optional)' },
                      { value: 'high-school', label: 'High School' },
                      { value: 'diploma', label: 'Diploma' },
                      { value: 'bachelors', label: "Bachelor's Degree" },
                      { value: 'masters', label: "Master's Degree" },
                      { value: 'phd', label: 'PhD' },
                      { value: 'professional', label: 'Professional Degree' },
                      { value: 'other', label: 'Other' },
                      { value: 'prefer-not-to-say', label: 'Prefer not to say' }
                    ]}
                    value={formData.optional.education}
                    onChange={(value) => handleChange('optional', { ...formData.optional, education: value })}
                    placeholder="Select education (optional)"
                    error={false}
                  />
                </motion.div>

                {/* Profession */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="mb-4 sm:mb-5 md:mb-2"
                >
                  <div className="flex items-center gap-2 mb-3 md:mb-1.5">
                    <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 md:w-4 md:h-4 text-[#FF91A4]" />
                    <label className="text-base sm:text-lg md:text-sm font-semibold text-[#212121]">
                      Profession <span className="text-[#757575] text-xs md:text-[10px] font-normal">(Optional)</span>
                    </label>
                  </div>
                  <input
                    type="text"
                    value={formData.optional.profession}
                    onChange={(e) => handleChange('optional', { ...formData.optional, profession: e.target.value })}
                    placeholder="e.g., Software Engineer, Doctor, Teacher"
                    className="w-full px-4 md:px-3 py-2.5 sm:py-3 md:py-2 border-2 border-[#FFB6C1] rounded-xl sm:rounded-2xl md:rounded-lg text-sm sm:text-base md:text-sm text-[#212121] bg-white focus:outline-none focus:ring-2 focus:ring-[#FF91A4] focus:ring-opacity-20 focus:border-[#FF91A4] transition-all shadow-sm hover:shadow-md"
                  />
                </motion.div>

                {/* Languages */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mb-4 sm:mb-5 md:mb-2"
                >
                  <div className="flex items-center gap-2 mb-3 md:mb-1.5">
                    <Languages className="w-4 h-4 sm:w-5 sm:h-5 md:w-4 md:h-4 text-[#FF91A4]" />
                    <label className="text-base sm:text-lg md:text-sm font-semibold text-[#212121]">
                      Languages <span className="text-[#FF91A4] text-xs md:text-[10px] font-normal">*</span>
                    </label>
                  </div>
                  <p className="text-xs sm:text-sm md:text-[10px] text-[#757575] mb-3 md:mb-2">Select at least one language you speak</p>
                  <div className="flex flex-wrap gap-2.5 sm:gap-3 md:gap-2">
                    {['Hindi', 'English', 'Bengali', 'Telugu', 'Marathi', 'Tamil', 'Gujarati', 'Kannada', 'Malayalam', 'Punjabi', 'Urdu', 'Odia', 'Assamese', 'Sanskrit', 'Other'].map((language, idx) => (
                      <motion.button
                        key={language}
                        type="button"
                        onClick={() => {
                          const current = formData.optional.languages;
                          let newLanguages;
                          if (current.includes(language)) {
                            newLanguages = current.filter(l => l !== language);
                          } else {
                            newLanguages = [...current, language];
                          }
                          handleChange('optional', { ...formData.optional, languages: newLanguages });
                          // Clear error if at least one language is selected
                          if (newLanguages.length > 0 && errors.languages) {
                            setErrors(prev => {
                              const newErrors = { ...prev };
                              delete newErrors.languages;
                              return newErrors;
                            });
                          }
                        }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 + idx * 0.02 }}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-3 sm:px-4 md:px-2.5 py-2 sm:py-2.5 md:py-1.5 rounded-xl sm:rounded-2xl md:rounded-lg text-xs sm:text-sm md:text-[11px] font-semibold transition-all ${
                          formData.optional.languages.includes(language)
                            ? 'bg-gradient-to-br from-[#FF91A4] to-[#FF69B4] text-white border-2 border-[#FF91A4] shadow-md'
                            : 'bg-white text-[#212121] border-2 border-[#FFB6C1] hover:border-[#FF91A4] hover:shadow-sm'
                        }`}
                      >
                        {language}
                      </motion.button>
                    ))}
                  </div>
                  {formData.optional.languages.length > 0 && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs sm:text-sm md:text-[10px] text-[#FF91A4] mt-3 md:mt-2 font-medium"
                    >
                      ✓ {formData.optional.languages.length} language{formData.optional.languages.length > 1 ? 's' : ''} selected
                    </motion.p>
                  )}
                  {errors.languages && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs sm:text-sm md:text-[10px] text-red-600 mt-2 md:mt-1 font-medium"
                    >
                      {errors.languages}
                    </motion.p>
                  )}
                </motion.div>

                {/* Horoscope */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mb-4 sm:mb-5 md:mb-2"
                >
                  <div className="flex items-center gap-2 mb-3 md:mb-1.5">
                    <Star className="w-4 h-4 sm:w-5 sm:h-5 md:w-4 md:h-4 text-[#FF91A4]" />
                    <label className="text-base sm:text-lg md:text-sm font-semibold text-[#212121]">
                      Horoscope <span className="text-[#757575] text-xs md:text-[10px] font-normal">(Optional)</span>
                    </label>
                  </div>
                  <CustomDropdown
                    options={[
                      { value: '', label: 'Select horoscope sign (optional)' },
                      { value: 'aries', label: 'Aries' },
                      { value: 'taurus', label: 'Taurus' },
                      { value: 'gemini', label: 'Gemini' },
                      { value: 'cancer', label: 'Cancer' },
                      { value: 'leo', label: 'Leo' },
                      { value: 'virgo', label: 'Virgo' },
                      { value: 'libra', label: 'Libra' },
                      { value: 'scorpio', label: 'Scorpio' },
                      { value: 'sagittarius', label: 'Sagittarius' },
                      { value: 'capricorn', label: 'Capricorn' },
                      { value: 'aquarius', label: 'Aquarius' },
                      { value: 'pisces', label: 'Pisces' },
                      { value: 'prefer-not-to-say', label: 'Prefer not to say' }
                    ]}
                    value={formData.optional.horoscope}
                    onChange={(value) => handleChange('optional', { ...formData.optional, horoscope: value })}
                    placeholder="Select horoscope sign (optional)"
                    error={false}
                  />
                </motion.div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-2 sm:gap-3 pt-4 sm:pt-6 relative" style={{ zIndex: 1 }}>
                <motion.button
                  onClick={handleBack}
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 bg-gradient-to-r from-[#757575] to-[#616161] hover:from-[#616161] hover:to-[#757575] text-white font-semibold py-2.5 sm:py-3 md:py-2 rounded-xl transition-all flex items-center justify-center shadow-md hover:shadow-lg"
                >
                  <ArrowLeft className="w-4 h-4 mr-1.5 sm:mr-2" />
                  <span className="text-sm md:text-sm">Back</span>
                </motion.button>
                <motion.button
                  onClick={handleNext}
                  disabled={!formData.optional.languages || formData.optional.languages.length === 0}
                  whileHover={{ scale: (!formData.optional.languages || formData.optional.languages.length === 0) ? 1 : 1.02, y: (!formData.optional.languages || formData.optional.languages.length === 0) ? 0 : -1 }}
                  whileTap={{ scale: (!formData.optional.languages || formData.optional.languages.length === 0) ? 1 : 0.98 }}
                  className={`flex-1 font-semibold py-2.5 sm:py-3 md:py-2 rounded-xl transition-all text-sm md:text-sm shadow-lg ${
                    (!formData.optional.languages || formData.optional.languages.length === 0)
                      ? 'bg-[#E0E0E0] text-[#9E9E9E] cursor-not-allowed shadow-none'
                      : 'bg-gradient-to-r from-[#FF91A4] to-[#FF69B4] hover:from-[#FF69B4] hover:to-[#FF91A4] text-white hover:shadow-xl'
                  }`}
                >
                  Next →
                </motion.button>
              </div>
            </motion.div>
          )}

          {currentStep === 8 && (
            <motion.div
              key="step8"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
              className="bg-gradient-to-br from-white to-[#FFF0F5] rounded-xl sm:rounded-2xl shadow-lg border border-[#FFB6C1]/20 relative flex flex-col"
              style={{ zIndex: 1, maxHeight: 'calc(100vh - 200px)' }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#FF91A4]/5 to-transparent pointer-events-none"></div>
              
              {/* Header - Fixed */}
              <div className="flex items-center gap-2 p-3 sm:p-4 md:p-5 pb-2 relative z-10 flex-shrink-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#FF91A4] to-[#FF69B4] rounded-lg flex items-center justify-center shadow-md">
                  <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold bg-gradient-to-r from-[#FF91A4] to-[#FF69B4] bg-clip-text text-transparent">
                    Profile Setup
                  </h2>
                  <p className="text-[10px] sm:text-xs text-[#757575] mt-0.5">
                    Upload your photos and write a bio to complete your profile
                  </p>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto px-3 sm:px-4 md:px-4 pb-2 relative z-10 scrollbar-hide min-h-0">

              {/* Photo Upload Section */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-4 sm:mb-5"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#FF91A4] to-[#FF69B4] rounded-xl flex items-center justify-center shadow-md">
                    <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-[#212121]">
                      Upload Your Photos <span className="text-[#FF91A4]">*</span>
                    </label>
                    <p className="text-[10px] sm:text-xs text-[#757575]">
                      Add at least {minPhotos} photos
                    </p>
                  </div>
                </div>
                <PhotoUpload
                  photos={formData.photos}
                  onChange={(newPhotos) => handleChange('photos', newPhotos)}
                  maxPhotos={maxPhotos}
                  minPhotos={minPhotos}
                />
                {errors.photos && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-[#FF91A4] mt-2 font-medium"
                  >
                    {errors.photos}
                  </motion.p>
                )}
                {formData.photos.length > 0 && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-[10px] sm:text-xs text-[#757575] mt-2"
                  >
                    ✓ {formData.photos.length} photo{formData.photos.length > 1 ? 's' : ''} uploaded
                  </motion.p>
                )}
              </motion.div>

              {/* Bio Section */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-4 sm:mb-5"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#FF91A4] to-[#FF69B4] rounded-xl flex items-center justify-center shadow-md">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-[#212121]">
                      Write Your Bio <span className="text-[#757575] text-[10px] font-normal">(Optional)</span>
                    </label>
                    <p className="text-[10px] sm:text-xs text-[#757575]">
                      Tell others about yourself
                    </p>
                  </div>
                </div>
                <textarea
                  value={formData.bio}
                  onChange={(e) => {
                    if (e.target.value.length <= maxBioLength) {
                      handleChange('bio', e.target.value);
                    }
                  }}
                  placeholder="Tell others about yourself..."
                  rows={4}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-[#FFB6C1] rounded-xl text-xs sm:text-sm text-[#212121] bg-white focus:outline-none focus:ring-2 focus:ring-[#FF91A4] focus:ring-opacity-20 focus:border-[#FF91A4] transition-all resize-none shadow-sm"
                />
                <div className="flex justify-between items-center mt-2">
                  <p className={`text-[10px] sm:text-xs font-medium ${
                    formData.bio.length > maxBioLength * 0.9 
                      ? 'text-[#FF91A4]' 
                      : 'text-[#757575]'
                  }`}>
                    {formData.bio.length}/{maxBioLength} characters
                  </p>
                </div>
              </motion.div>

              </div>

              {/* Navigation Buttons - Fixed at bottom */}
              <div className="flex gap-2 sm:gap-3 p-3 sm:p-4 md:p-5 pt-3 relative z-10 flex-shrink-0 border-t border-[#FFB6C1]/20 bg-gradient-to-br from-white to-[#FFF0F5] rounded-b-xl sm:rounded-b-2xl">
                <motion.button
                  onClick={handleBack}
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 bg-gradient-to-r from-[#757575] to-[#616161] hover:from-[#616161] hover:to-[#757575] text-white font-semibold py-2.5 sm:py-3 rounded-xl transition-all flex items-center justify-center shadow-md hover:shadow-lg"
                >
                  <ArrowLeft className="w-4 h-4 mr-1.5 sm:mr-2" />
                  <span className="text-xs sm:text-sm">Back</span>
                </motion.button>
                <motion.button
                  onClick={handleNext}
                  disabled={!formData.photos || formData.photos.length < minPhotos}
                  whileHover={{ scale: (!formData.photos || formData.photos.length < minPhotos) ? 1 : 1.02, y: (!formData.photos || formData.photos.length < minPhotos) ? 0 : -1 }}
                  whileTap={{ scale: (!formData.photos || formData.photos.length < minPhotos) ? 1 : 0.98 }}
                  className={`flex-1 font-semibold py-2.5 sm:py-3 rounded-xl transition-all text-xs sm:text-sm shadow-lg ${
                    (!formData.photos || formData.photos.length < minPhotos)
                      ? 'bg-[#E0E0E0] text-[#9E9E9E] cursor-not-allowed shadow-none'
                      : 'bg-gradient-to-r from-[#FF91A4] to-[#FF69B4] hover:from-[#FF69B4] hover:to-[#FF91A4] text-white hover:shadow-xl'
                  }`}
                >
                  Next →
                </motion.button>
              </div>
            </motion.div>
          )}

          {currentStep === 9 && (
            <motion.div
              key="step9"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
              className="bg-gradient-to-br from-white to-[#FFF0F5] rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 md:p-4 border border-[#FFB6C1]/20 relative flex flex-col max-h-[calc(100vh-180px)] md:max-h-[calc(100vh-140px)]"
              style={{ zIndex: 1 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#FF91A4]/5 to-transparent pointer-events-none"></div>
              <div className="flex items-center gap-2 mb-3 sm:mb-4 relative z-10">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#FF91A4] to-[#FF69B4] rounded-lg flex items-center justify-center shadow-md">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <h2 className="text-base sm:text-lg font-bold bg-gradient-to-r from-[#FF91A4] to-[#FF69B4] bg-clip-text text-transparent">
                  Photo Verification
                </h2>
              </div>
              <p className="text-[10px] sm:text-xs text-[#757575] mb-4 sm:mb-5">
                Verify your profile to get a verified badge and increase trust
              </p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-2 border-[#FFB6C1] rounded-xl sm:rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-white to-[#FFF0F5] shadow-md mb-4"
              >
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#FF91A4] to-[#FF69B4] rounded-xl flex items-center justify-center shadow-lg">
                      <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-[#212121] mb-1">
                        Photo Verification
                      </label>
                      <p className="text-[10px] sm:text-xs text-[#757575]">
                        Verify your profile to get a verified badge
                      </p>
                    </div>
                  </div>
                  <motion.button
                    onClick={() => {
                      handleChange('verified', true);
                      navigate('/photo-verification');
                    }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-3 sm:px-4 py-2 text-[10px] sm:text-xs font-semibold text-[#FF91A4] hover:text-white bg-white hover:bg-gradient-to-r hover:from-[#FF91A4] hover:to-[#FF69B4] border-2 border-[#FFB6C1] hover:border-[#FF91A4] rounded-xl transition-all whitespace-nowrap shadow-sm hover:shadow-md"
                  >
                    Verify Now
                  </motion.button>
                </div>
              </motion.div>

              <motion.button
                onClick={handleNext}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mb-3 sm:mb-4 bg-gradient-to-r from-[#FF91A4] to-[#FF69B4] hover:from-[#FF69B4] hover:to-[#FF91A4] text-white font-semibold py-2.5 sm:py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl relative z-10"
              >
                <span className="text-xs sm:text-sm">Skip for Now</span>
              </motion.button>

              {/* Navigation Buttons */}
              <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-4">
                <motion.button
                  onClick={handleBack}
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 bg-gradient-to-r from-[#757575] to-[#616161] hover:from-[#616161] hover:to-[#757575] text-white font-semibold py-2.5 sm:py-3 md:py-2 rounded-xl transition-all flex items-center justify-center shadow-md hover:shadow-lg relative z-10 text-sm md:text-sm"
                >
                  <ArrowLeft className="w-4 h-4 mr-1.5 sm:mr-2" />
                  <span className="text-xs sm:text-sm">Back</span>
                </motion.button>
                <motion.button
                  onClick={handleNext}
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 bg-gradient-to-r from-[#FF91A4] to-[#FF69B4] hover:from-[#FF69B4] hover:to-[#FF91A4] text-white font-semibold py-2.5 sm:py-3 rounded-xl transition-all flex items-center justify-center shadow-lg hover:shadow-xl relative z-10"
                >
                  <span className="text-xs sm:text-sm">Next →</span>
                </motion.button>
              </div>
            </motion.div>
          )}

          {currentStep === 10 && (
            <motion.div
              key="step10"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
              className="bg-gradient-to-br from-white to-[#FFF0F5] rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 md:p-4 border border-[#FFB6C1]/20 relative flex flex-col max-h-[calc(100vh-180px)] md:max-h-[calc(100vh-140px)]"
              style={{ zIndex: 1 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#FF91A4]/5 to-transparent pointer-events-none"></div>
              <div className="flex items-center gap-2 mb-3 sm:mb-4 relative z-10">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#FF91A4] to-[#FF69B4] rounded-lg flex items-center justify-center shadow-md">
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <h2 className="text-base sm:text-lg font-bold bg-gradient-to-r from-[#FF91A4] to-[#FF69B4] bg-clip-text text-transparent">
                  Review Your Profile
                </h2>
              </div>
              <p className="text-[10px] sm:text-xs text-[#757575] mb-3 sm:mb-4">
                Please review your information before submitting
              </p>

              {/* Review Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 max-h-[45vh] md:max-h-[50vh] overflow-y-auto pr-2">
                {/* Step 1: Basic Info */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="border-2 border-[#FFB6C1] rounded-xl sm:rounded-2xl p-3 sm:p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm sm:text-base font-semibold text-[#212121]">Basic Information</h3>
                    <motion.button
                      onClick={() => setCurrentStep(1)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="text-[#FF91A4] hover:text-[#FF69B4] transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                  <div className="space-y-1.5 text-xs sm:text-sm text-[#757575]">
                    <p><span className="font-medium text-[#212121]">Name:</span> {formData.name || 'Not provided'}</p>
                    <p><span className="font-medium text-[#212121]">Date of Birth:</span> {formData.dob || 'Not provided'}</p>
                    <p><span className="font-medium text-[#212121]">Age:</span> {age ? `${age} years` : 'Not provided'}</p>
                    <p><span className="font-medium text-[#212121]">Gender:</span> {formData.gender === 'other' ? formData.customGender || formData.gender : formData.gender || 'Not provided'}</p>
                    <p><span className="font-medium text-[#212121]">Orientation:</span> {formData.orientation === 'other' ? formData.customOrientation || formData.orientation : formData.orientation || 'Not provided'}</p>
                    <p><span className="font-medium text-[#212121]">Looking For:</span> {formData.lookingFor ? formData.lookingFor.charAt(0).toUpperCase() + formData.lookingFor.slice(1) : 'Not provided'}</p>
                  </div>
                </motion.div>

                {/* Step 2: Location & Preferences */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="border-2 border-[#FFB6C1] rounded-xl sm:rounded-2xl p-3 sm:p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm sm:text-base font-semibold text-[#212121]">Location & Preferences</h3>
                    <motion.button
                      onClick={() => setCurrentStep(2)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="text-[#FF91A4] hover:text-[#FF69B4] transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                  <div className="space-y-1.5 text-xs sm:text-sm text-[#757575]">
                    <p><span className="font-medium text-[#212121]">City:</span> {formData.city || 'Not provided'}</p>
                    <p><span className="font-medium text-[#212121]">Age Range:</span> {formData.ageRange.min} - {formData.ageRange.max || 'Any'}</p>
                    <p><span className="font-medium text-[#212121]">Distance Preference:</span> {formData.distancePref} km</p>
                  </div>
                </motion.div>

                {/* Step 3: Interests */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="border-2 border-[#FFB6C1] rounded-xl sm:rounded-2xl p-3 sm:p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm sm:text-base font-semibold text-[#212121]">Interests & Hobbies</h3>
                    <motion.button
                      onClick={() => setCurrentStep(3)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="text-[#FF91A4] hover:text-[#FF69B4] transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.interests.length > 0 ? (
                      formData.interests.map((interest) => (
                        <span
                          key={interest}
                          className="px-2 sm:px-3 py-1 bg-[#FFE4E1] text-[#FF91A4] rounded-lg text-xs sm:text-sm font-medium"
                        >
                          {interest}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs sm:text-sm text-[#757575]">Not provided</span>
                    )}
                  </div>
                </motion.div>

                {/* Step 4: Personality */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="border-2 border-[#FFB6C1] rounded-xl sm:rounded-2xl p-3 sm:p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm sm:text-base font-semibold text-[#212121]">Personality Traits</h3>
                    <motion.button
                      onClick={() => setCurrentStep(4)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="text-[#FF91A4] hover:text-[#FF69B4] transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                  <div className="space-y-1.5 text-xs sm:text-sm text-[#757575]">
                    <p><span className="font-medium text-[#212121]">Social Style:</span> {formData.personality.social || 'Not provided'}</p>
                    <p><span className="font-medium text-[#212121]">Planning Style:</span> {formData.personality.planning || 'Not provided'}</p>
                    <p><span className="font-medium text-[#212121]">Romantic Style:</span> {formData.personality.romantic || 'Not provided'}</p>
                    <p><span className="font-medium text-[#212121]">Morning Person:</span> {formData.personality.morning || 'Not provided'}</p>
                  </div>
                </motion.div>

                {/* Step 5: Dealbreakers */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="border-2 border-[#FFB6C1] rounded-xl sm:rounded-2xl p-3 sm:p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm sm:text-base font-semibold text-[#212121]">Lifestyle</h3>
                    <motion.button
                      onClick={() => setCurrentStep(5)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="text-[#FF91A4] hover:text-[#FF69B4] transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                  <div className="space-y-1.5 text-xs sm:text-sm text-[#757575]">
                    <p><span className="font-medium text-[#212121]">Kids:</span> {formData.dealbreakers.kids || 'Not provided'}</p>
                    <p><span className="font-medium text-[#212121]">Smoking:</span> {formData.dealbreakers.smoking || 'Not provided'}</p>
                    <p><span className="font-medium text-[#212121]">Pets:</span> {formData.dealbreakers.pets || 'Not provided'}</p>
                    <p><span className="font-medium text-[#212121]">Drinking:</span> {formData.dealbreakers.drinking || 'Not provided'}</p>
                    {formData.dealbreakers.religion && (
                      <p><span className="font-medium text-[#212121]">Religion:</span> {formData.dealbreakers.religion}</p>
                    )}
                  </div>
                </motion.div>

                {/* Step 6: Prompts */}
                {formData.prompts && formData.prompts.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-br from-white to-[#FFF0F5] rounded-xl p-4 border border-[#FFB6C1]/20 shadow-md"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <MessageSquare className="w-4 h-4 text-[#FF91A4]" />
                      <h3 className="text-sm sm:text-base font-semibold text-[#212121]">Prompts</h3>
                      <motion.button
                        onClick={() => setCurrentStep(6)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="ml-auto text-[#FF91A4] hover:text-[#FF69B4] transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                    <div className="space-y-2">
                      {formData.prompts.slice(0, 3).map((prompt, idx) => (
                        <div key={idx} className="text-xs text-[#757575]">
                          <span className="font-semibold text-[#212121]">{prompt.prompt}</span>
                          <p className="mt-1">{prompt.answer || 'No answer provided'}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Step 7: Optional Details */}
                {(formData.optional.education || formData.optional.profession || formData.optional.languages.length > 0 || formData.optional.horoscope) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="border-2 border-[#FFB6C1] rounded-xl sm:rounded-2xl p-3 sm:p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm sm:text-base font-semibold text-[#212121]">Additional Details</h3>
                      <motion.button
                        onClick={() => setCurrentStep(7)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="text-[#FF91A4] hover:text-[#FF69B4] transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                    <div className="space-y-1.5 text-xs sm:text-sm text-[#757575]">
                      {formData.optional.education && (
                        <p><span className="font-medium text-[#212121]">Education:</span> {formData.optional.education}</p>
                      )}
                      {formData.optional.profession && (
                        <p><span className="font-medium text-[#212121]">Profession:</span> {formData.optional.profession}</p>
                      )}
                      {formData.optional.languages.length > 0 && (
                        <p><span className="font-medium text-[#212121]">Languages:</span> {formData.optional.languages.join(', ')}</p>
                      )}
                      {formData.optional.horoscope && (
                        <p><span className="font-medium text-[#212121]">Horoscope:</span> {formData.optional.horoscope}</p>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Step 8: Profile Setup */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="border-2 border-[#FFB6C1] rounded-xl sm:rounded-2xl p-3 sm:p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm sm:text-base font-semibold text-[#212121]">Profile Setup</h3>
                    <motion.button
                      onClick={() => setCurrentStep(8)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="text-[#FF91A4] hover:text-[#FF69B4] transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                  <div className="space-y-1.5 text-xs sm:text-sm text-[#757575]">
                    <p><span className="font-medium text-[#212121]">Photos:</span> {formData.photos.length} photo{formData.photos.length !== 1 ? 's' : ''} uploaded</p>
                    {formData.bio && (
                      <p><span className="font-medium text-[#212121]">Bio:</span> {formData.bio.substring(0, 50)}{formData.bio.length > 50 ? '...' : ''}</p>
                    )}
                  </div>
                </motion.div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 sm:pt-6 relative z-10">
                <motion.button
                  onClick={handleNext}
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-[#FF91A4] to-[#FF69B4] hover:from-[#FF69B4] hover:to-[#FF91A4] text-white font-semibold py-3 sm:py-4 md:py-2.5 rounded-xl sm:rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl text-sm sm:text-base md:text-sm"
                >
                  <Check className="w-5 h-5 md:w-4 md:h-4" />
                  <span>Complete Profile</span>
                </motion.button>
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-4">
                <motion.button
                  onClick={handleBack}
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 bg-gradient-to-r from-[#757575] to-[#616161] hover:from-[#616161] hover:to-[#757575] text-white font-semibold py-2.5 sm:py-3 md:py-2 rounded-xl transition-all flex items-center justify-center shadow-md hover:shadow-lg relative z-10 text-sm md:text-sm"
                >
                  <ArrowLeft className="w-4 h-4 mr-1.5 sm:mr-2" />
                  <span className="text-sm">Back</span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
