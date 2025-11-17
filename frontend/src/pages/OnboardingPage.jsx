import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Check, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomDropdown from '../components/CustomDropdown';
import CustomDatePicker from '../components/CustomDatePicker';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const totalSteps = 7;
  const [currentStep, setCurrentStep] = useState(1);
  // Ensure progress percentage is clamped between 0-100 and never exceeds 100%
  const progressPercentage = Math.min(Math.round((currentStep / totalSteps) * 100), 100);

  // Form state for all steps
  const [formData, setFormData] = useState({
    // Step 1
    dob: '',
    gender: '',
    customGender: '',
    orientation: '',
    customOrientation: '',
    lookingFor: [],
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
    // Step 6
    optional: {
      education: '',
      profession: '',
      languages: [],
      horoscope: ''
    },
    // Step 7 - Review (no separate data, just review)
    reviewed: false
  });

  const [errors, setErrors] = useState({});
  const [showCustomGender, setShowCustomGender] = useState(false);
  const [showCustomOrientation, setShowCustomOrientation] = useState(false);

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
          setFormData(prev => ({ 
            ...prev, 
            ...parsed.step1, 
            ...parsed.step2,
            ...parsed.step3,
            personality: parsed.step4?.personality || prev.personality,
            dealbreakers: parsed.step5?.dealbreakers || prev.dealbreakers,
            optional: parsed.step6?.optional || prev.optional
          }));
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
        
        // If onboarding is already completed, check if user is coming from profile-setup (back button)
        // Allow user to review their answers even if completed
        if (parsed.completed && parsed.currentStep === 7) {
          // User is on review page, allow them to stay and review
          // Don't redirect if they're on step 7 (review page)
        } else if (parsed.completed) {
          // Onboarding completed and not on review page, check profile setup status
          const profileSetup = localStorage.getItem('profileSetup');
          if (profileSetup) {
            try {
              const profileData = JSON.parse(profileSetup);
              // If profile has photos, redirect to discover
              if (profileData.photos && profileData.photos.length > 0) {
                navigate('/discover');
                return;
              }
            } catch (e) {
              // Error parsing profile, go to profile setup
            }
          }
          // Profile setup incomplete or not started, go to profile setup
          navigate('/profile-setup');
          return;
        }
        // Clamp currentStep to valid range (1-7)
        const step = parsed.currentStep || 1;
        const validStep = Math.min(Math.max(step, 1), 7);
        
        setFormData(prev => ({ 
          ...prev, 
          ...parsed.step1, 
          ...parsed.step2,
          ...parsed.step3,
          personality: parsed.step4?.personality || prev.personality,
          dealbreakers: parsed.step5?.dealbreakers || prev.dealbreakers,
          optional: parsed.step6?.optional || prev.optional
        }));
        setCurrentStep(validStep);
        if (parsed.step1?.gender === 'other') {
          setShowCustomGender(true);
        }
        if (parsed.step1?.orientation === 'other') {
          setShowCustomOrientation(true);
        }
      } catch (e) {
        console.error('Error loading saved data:', e);
      }
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

    if (formData.lookingFor.length === 0) {
      newErrors.lookingFor = 'Please select at least one option';
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

  // Validate Step 6 (all fields are optional)
  const validateStep6 = () => {
    // All fields are optional, so always return true
    return true;
  };

  // Validate Step 7 (review step)
  const validateStep7 = () => {
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

  // Handle looking for selection
  const handleLookingForChange = (value) => {
    const current = formData.lookingFor;
    if (current.includes(value)) {
      handleChange('lookingFor', current.filter(item => item !== value));
    } else {
      handleChange('lookingFor', [...current, value]);
    }
  };

  // Save progress to localStorage
  const saveProgress = () => {
    const savedData = {
      step1: {
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
        optional: formData.optional
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
        setCurrentStep(2);
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
        // Mark onboarding as complete
        const savedData = JSON.parse(localStorage.getItem('onboardingData') || '{}');
        savedData.completed = true;
        savedData.currentStep = 7; // Keep at 7, don't go to 8
        localStorage.setItem('onboardingData', JSON.stringify(savedData));
        
        // Check if user came from edit profile page
        const cameFromEditProfile = localStorage.getItem('cameFromEditProfile') === 'true';
        localStorage.removeItem('cameFromEditProfile');
        
        if (cameFromEditProfile) {
          // Redirect back to profile page after editing
          navigate('/profile');
        } else {
          // Navigate to profile setup (photo upload) page (normal flow)
          navigate('/profile-setup');
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
        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl sm:rounded-3xl shadow-lg p-3 sm:p-4 mb-3 sm:mb-4"
        >
          <div className="flex justify-between items-center mb-1.5 sm:mb-2">
            <span className="text-xs sm:text-sm font-medium text-[#212121]">
              {progressPercentage}% Complete
            </span>
          </div>
          <div className="w-full bg-[#E0E0E0] rounded-full h-1.5 sm:h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              className="bg-[#FF91A4] h-1.5 sm:h-2 rounded-full"
            ></motion.div>
          </div>
          <div className="text-xs text-[#757575] mt-1.5 sm:mt-2">
            Step {currentStep} of {totalSteps}
          </div>
        </motion.div>

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
              className="bg-white rounded-2xl sm:rounded-3xl shadow-lg p-4 sm:p-6 md:p-8"
            >
              {/* Date of Birth */}
              <div className="mb-3 sm:mb-4">
                <label className="block text-xs sm:text-sm font-medium text-[#212121] mb-1.5 sm:mb-2">
                  Age / Date of Birth <span className="text-[#FF91A4]">*</span>
                </label>
                <CustomDatePicker
                  value={formData.dob}
                  onChange={(value) => handleChange('dob', value)}
                  maxDate={getMaxDate()}
                  error={!!errors.dob}
                />
                {age !== null && age >= 18 && (
                  <p className="text-xs text-[#757575] mt-1">Age: {age} years</p>
                )}
                {errors.dob && (
                  <p className="text-xs text-red-600 mt-1">{errors.dob}</p>
                )}
              </div>

              {/* Gender Identity */}
              <div className="mb-3 sm:mb-4">
                <label className="block text-xs sm:text-sm font-medium text-[#212121] mb-1.5 sm:mb-2">
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
                  <p className="text-xs text-red-600 mt-1">{errors.gender}</p>
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
                      className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 rounded-xl text-sm ${
                        errors.customGender
                          ? 'border-red-500 focus:border-red-600'
                          : 'border-[#FFB6C1] focus:border-[#FF91A4]'
                      } bg-white text-[#212121] focus:outline-none focus:ring-2 focus:ring-[#FF91A4] focus:ring-opacity-20 transition-colors`}
                    />
                    {errors.customGender && (
                      <p className="text-xs text-red-600 mt-1">{errors.customGender}</p>
                    )}
                  </motion.div>
                )}
              </div>

              {/* Sexual Orientation */}
              <div className="mb-3 sm:mb-4">
                <label className="block text-xs sm:text-sm font-medium text-[#212121] mb-1.5 sm:mb-2">
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
                  <p className="text-xs text-red-600 mt-1">{errors.orientation}</p>
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
                      className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 rounded-xl text-sm ${
                        errors.customOrientation
                          ? 'border-red-500 focus:border-red-600'
                          : 'border-[#FFB6C1] focus:border-[#FF91A4]'
                      } bg-white text-[#212121] focus:outline-none focus:ring-2 focus:ring-[#FF91A4] focus:ring-opacity-20 transition-colors`}
                    />
                    {errors.customOrientation && (
                      <p className="text-xs text-red-600 mt-1">{errors.customOrientation}</p>
                    )}
                  </motion.div>
                )}
              </div>

              {/* Looking For */}
              <div className="mb-4 sm:mb-6">
                <label className="block text-xs sm:text-sm font-medium text-[#212121] mb-2 sm:mb-3">
                  Looking For <span className="text-[#FF91A4]">*</span>
                </label>
                <div className="space-y-1.5 sm:space-y-2">
                  {['casual', 'relationship', 'marriage', 'friends'].map((option) => (
                    <motion.button
                      key={option}
                      type="button"
                      onClick={() => handleLookingForChange(option)}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 transition-all ${
                        formData.lookingFor.includes(option)
                          ? 'bg-[#FF91A4] text-white border-[#FF91A4]'
                          : 'bg-white text-[#212121] border-[#FFB6C1] hover:border-[#FF91A4]'
                      } ${errors.lookingFor ? 'border-red-500' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium capitalize">{option}</span>
                        {formData.lookingFor.includes(option) && (
                          <span className="text-white text-base">✓</span>
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>
                {errors.lookingFor && (
                  <p className="text-xs text-red-600 mt-1.5 sm:mt-2">{errors.lookingFor}</p>
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-2 sm:gap-3 pt-2">
                <motion.button
                  onClick={handleBack}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 bg-[#757575] hover:bg-[#616161] text-white font-semibold py-2.5 sm:py-3 rounded-xl transition-all flex items-center justify-center"
                >
                  <ArrowLeft className="w-4 h-4 mr-1.5 sm:mr-2" />
                  <span className="text-sm">Back</span>
                </motion.button>
                <motion.button
                  onClick={handleNext}
                  disabled={!formData.dob || !formData.gender || !formData.orientation || formData.lookingFor.length === 0}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 bg-[#FF91A4] hover:bg-[#FF69B4] disabled:bg-[#E0E0E0] disabled:cursor-not-allowed text-white font-semibold py-2.5 sm:py-3 rounded-xl transition-all disabled:transform-none text-sm"
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
              className="bg-white rounded-2xl sm:rounded-3xl shadow-lg p-4 sm:p-6 md:p-8"
            >
              <h2 className="text-lg sm:text-xl font-bold text-[#212121] mb-4 sm:mb-6">Location & Preferences</h2>

              {/* City */}
              <div className="mb-3 sm:mb-4">
                <label className="block text-xs sm:text-sm font-medium text-[#212121] mb-1.5 sm:mb-2">
                  City <span className="text-[#FF91A4]">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#757575] w-4 h-4 pointer-events-none" />
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    placeholder="Enter your city"
                    className={`w-full pl-10 pr-3 py-2.5 sm:py-3 border-2 rounded-xl text-sm ${
                      errors.city
                        ? 'border-red-500 focus:border-red-600'
                        : 'border-[#FFB6C1] focus:border-[#FF91A4]'
                    } bg-white text-[#212121] focus:outline-none focus:ring-2 focus:ring-[#FF91A4] focus:ring-opacity-20 transition-colors`}
                  />
                </div>
                {errors.city && (
                  <p className="text-xs text-red-600 mt-1">{errors.city}</p>
                )}
              </div>

              {/* Age Range */}
              <div className="mb-3 sm:mb-4">
                <label className="block text-xs sm:text-sm font-medium text-[#212121] mb-1.5 sm:mb-2">
                  Preferred Age Range
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="text-xs text-[#757575] mb-1 block">Min</label>
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
                      className="w-full px-3 py-2.5 border-2 border-[#FFB6C1] rounded-xl text-sm text-[#212121] focus:border-[#FF91A4] focus:outline-none focus:ring-2 focus:ring-[#FF91A4] focus:ring-opacity-20 transition-colors"
                    />
                  </div>
                  <span className="text-[#757575] mt-5">-</span>
                  <div className="flex-1">
                    <label className="text-xs text-[#757575] mb-1 block">Max</label>
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
                      className="w-full px-3 py-2.5 border-2 border-[#FFB6C1] rounded-xl text-sm text-[#212121] focus:border-[#FF91A4] focus:outline-none focus:ring-2 focus:ring-[#FF91A4] focus:ring-opacity-20 transition-colors"
                    />
                  </div>
                </div>
                {errors.ageRange && (
                  <p className="text-xs text-red-600 mt-1">{errors.ageRange}</p>
                )}
              </div>

              {/* Distance Preference */}
              <div className="mb-4 sm:mb-6">
                <label className="block text-xs sm:text-sm font-medium text-[#212121] mb-1.5 sm:mb-2">
                  Maximum Distance (km)
                </label>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  value={formData.distancePref}
                  onChange={(e) => handleChange('distancePref', parseInt(e.target.value))}
                  className="w-full h-2 bg-[#E0E0E0] rounded-lg appearance-none cursor-pointer accent-[#FF91A4]"
                />
                <div className="flex justify-between text-xs text-[#757575] mt-1">
                  <span>5 km</span>
                  <span className="font-semibold text-[#FF91A4]">{formData.distancePref} km</span>
                  <span>100 km</span>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-2 sm:gap-3 pt-2">
                <motion.button
                  onClick={handleBack}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 bg-[#757575] hover:bg-[#616161] text-white font-semibold py-2.5 sm:py-3 rounded-xl transition-all flex items-center justify-center"
                >
                  <ArrowLeft className="w-4 h-4 mr-1.5 sm:mr-2" />
                  <span className="text-sm">Back</span>
                </motion.button>
                <motion.button
                  onClick={handleNext}
                  disabled={!formData.city || formData.city.trim() === '' || (formData.ageRange.max !== '' && formData.ageRange.min >= formData.ageRange.max)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 bg-[#FF91A4] hover:bg-[#FF69B4] disabled:bg-[#E0E0E0] disabled:cursor-not-allowed text-white font-semibold py-2.5 sm:py-3 rounded-xl transition-all disabled:transform-none text-sm"
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
              className="bg-white rounded-2xl sm:rounded-3xl shadow-lg p-4 sm:p-6 md:p-8"
            >
              <h2 className="text-lg sm:text-xl font-bold text-[#212121] mb-2 sm:mb-3">Interests & Hobbies</h2>
              <p className="text-xs sm:text-sm text-[#757575] mb-4 sm:mb-6">
                Select at least 3 interests that describe you
              </p>

              {/* Interests Categories */}
              <div className="space-y-4 sm:space-y-5 max-h-[60vh] overflow-y-auto pr-2">
                {/* Adventure */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <h3 className="text-sm font-semibold text-[#212121] mb-2">Adventure</h3>
                  <div className="flex flex-wrap gap-2">
                    {['Trekking', 'Travel', 'Camping', 'Sports', 'Hiking'].map((interest, idx) => (
                      <motion.button
                        key={interest}
                        type="button"
                        onClick={() => {
                          const current = formData.interests;
                          if (current.includes(interest)) {
                            handleChange('interests', current.filter(item => item !== interest));
                          } else {
                            handleChange('interests', [...current, interest]);
                          }
                        }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 + idx * 0.03 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                          formData.interests.includes(interest)
                            ? 'bg-[#FF91A4] text-white border-2 border-[#FF91A4] shadow-md'
                            : 'bg-white text-[#212121] border-2 border-[#FFB6C1] hover:border-[#FF91A4]'
                        }`}
                      >
                        {interest}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>

                {/* Creative */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h3 className="text-sm font-semibold text-[#212121] mb-2">Creative</h3>
                  <div className="flex flex-wrap gap-2">
                    {['Cooking', 'Reading', 'Music', 'Art', 'Photography', 'Writing'].map((interest, idx) => (
                      <motion.button
                        key={interest}
                        type="button"
                        onClick={() => {
                          const current = formData.interests;
                          if (current.includes(interest)) {
                            handleChange('interests', current.filter(item => item !== interest));
                          } else {
                            handleChange('interests', [...current, interest]);
                          }
                        }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 + idx * 0.03 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                          formData.interests.includes(interest)
                            ? 'bg-[#FF91A4] text-white border-2 border-[#FF91A4] shadow-md'
                            : 'bg-white text-[#212121] border-2 border-[#FFB6C1] hover:border-[#FF91A4]'
                        }`}
                      >
                        {interest}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>

                {/* Social */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h3 className="text-sm font-semibold text-[#212121] mb-2">Social</h3>
                  <div className="flex flex-wrap gap-2">
                    {['Dancing', 'Movies', 'Gaming', 'Parties', 'Social Events'].map((interest, idx) => (
                      <motion.button
                        key={interest}
                        type="button"
                        onClick={() => {
                          const current = formData.interests;
                          if (current.includes(interest)) {
                            handleChange('interests', current.filter(item => item !== interest));
                          } else {
                            handleChange('interests', [...current, interest]);
                          }
                        }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 + idx * 0.03 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                          formData.interests.includes(interest)
                            ? 'bg-[#FF91A4] text-white border-2 border-[#FF91A4] shadow-md'
                            : 'bg-white text-[#212121] border-2 border-[#FFB6C1] hover:border-[#FF91A4]'
                        }`}
                      >
                        {interest}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>

                {/* Wellness */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h3 className="text-sm font-semibold text-[#212121] mb-2">Wellness</h3>
                  <div className="flex flex-wrap gap-2">
                    {['Yoga', 'Fitness', 'Meditation', 'Nature', 'Running'].map((interest, idx) => (
                      <motion.button
                        key={interest}
                        type="button"
                        onClick={() => {
                          const current = formData.interests;
                          if (current.includes(interest)) {
                            handleChange('interests', current.filter(item => item !== interest));
                          } else {
                            handleChange('interests', [...current, interest]);
                          }
                        }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 + idx * 0.03 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                          formData.interests.includes(interest)
                            ? 'bg-[#FF91A4] text-white border-2 border-[#FF91A4] shadow-md'
                            : 'bg-white text-[#212121] border-2 border-[#FFB6C1] hover:border-[#FF91A4]'
                        }`}
                      >
                        {interest}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>

                {/* Tech */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <h3 className="text-sm font-semibold text-[#212121] mb-2">Tech</h3>
                  <div className="flex flex-wrap gap-2">
                    {['Coding', 'Gaming', 'Tech Gadgets', 'AI/ML'].map((interest, idx) => (
                      <motion.button
                        key={interest}
                        type="button"
                        onClick={() => {
                          const current = formData.interests;
                          if (current.includes(interest)) {
                            handleChange('interests', current.filter(item => item !== interest));
                          } else {
                            handleChange('interests', [...current, interest]);
                          }
                        }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 + idx * 0.03 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                          formData.interests.includes(interest)
                            ? 'bg-[#FF91A4] text-white border-2 border-[#FF91A4] shadow-md'
                            : 'bg-white text-[#212121] border-2 border-[#FFB6C1] hover:border-[#FF91A4]'
                        }`}
                      >
                        {interest}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>

                {/* Others */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <h3 className="text-sm font-semibold text-[#212121] mb-2">Others</h3>
                  <div className="flex flex-wrap gap-2">
                    {['Pets', 'Fashion', 'Food', 'Books', 'Comedy'].map((interest, idx) => (
                      <motion.button
                        key={interest}
                        type="button"
                        onClick={() => {
                          const current = formData.interests;
                          if (current.includes(interest)) {
                            handleChange('interests', current.filter(item => item !== interest));
                          } else {
                            handleChange('interests', [...current, interest]);
                          }
                        }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6 + idx * 0.03 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                          formData.interests.includes(interest)
                            ? 'bg-[#FF91A4] text-white border-2 border-[#FF91A4] shadow-md'
                            : 'bg-white text-[#212121] border-2 border-[#FFB6C1] hover:border-[#FF91A4]'
                        }`}
                      >
                        {interest}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Selected Count */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: formData.interests.length > 0 ? 1 : 0 }}
                className="mt-4 sm:mt-5 text-center"
              >
                <p className="text-xs sm:text-sm text-[#757575]">
                  <span className="font-semibold text-[#FF91A4]">{formData.interests.length}</span> interests selected
                  {formData.interests.length < 3 && (
                    <span className="text-red-600"> (Select at least 3)</span>
                  )}
                </p>
              </motion.div>

              {errors.interests && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-red-600 mt-2 text-center"
                >
                  {errors.interests}
                </motion.p>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-2 sm:gap-3 pt-4 sm:pt-6">
                <motion.button
                  onClick={handleBack}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 bg-[#757575] hover:bg-[#616161] text-white font-semibold py-2.5 sm:py-3 rounded-xl transition-all flex items-center justify-center"
                >
                  <ArrowLeft className="w-4 h-4 mr-1.5 sm:mr-2" />
                  <span className="text-sm">Back</span>
                </motion.button>
                <motion.button
                  onClick={handleNext}
                  disabled={formData.interests.length < 3}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 bg-[#FF91A4] hover:bg-[#FF69B4] disabled:bg-[#E0E0E0] disabled:cursor-not-allowed text-white font-semibold py-2.5 sm:py-3 rounded-xl transition-all disabled:transform-none text-sm"
                >
                  Next →
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
              className="bg-white rounded-2xl sm:rounded-3xl shadow-lg p-4 sm:p-6 md:p-8"
            >
              <h2 className="text-lg sm:text-xl font-bold text-[#212121] mb-2 sm:mb-3">Personality Traits</h2>
              <p className="text-xs sm:text-sm text-[#757575] mb-4 sm:mb-6">
                Choose the option that best describes you
              </p>

              {/* Personality Questions */}
              <div className="space-y-3 sm:space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {/* Social vs Introvert */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mb-3 sm:mb-4"
                >
                  <label className="block text-xs sm:text-sm font-medium text-[#212121] mb-2">
                    Social Style <span className="text-[#FF91A4]">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'social', label: 'Social' },
                      { value: 'introvert', label: 'Introvert' }
                    ].map((option) => (
                      <motion.button
                        key={option.value}
                        type="button"
                        onClick={() => handleChange('personality', { ...formData.personality, social: option.value })}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 text-xs sm:text-sm font-medium transition-all ${
                          formData.personality.social === option.value
                            ? 'bg-[#FF91A4] text-white border-[#FF91A4] shadow-md'
                            : 'bg-white text-[#212121] border-[#FFB6C1] hover:border-[#FF91A4]'
                        } ${errors.social ? 'border-red-500' : ''}`}
                      >
                        {option.label}
                      </motion.button>
                    ))}
                  </div>
                  {errors.social && (
                    <p className="text-xs text-red-600 mt-1">{errors.social}</p>
                  )}
                </motion.div>

                {/* Planner vs Spontaneous */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="mb-3 sm:mb-4"
                >
                  <label className="block text-xs sm:text-sm font-medium text-[#212121] mb-2">
                    Planning Style <span className="text-[#FF91A4]">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'planner', label: 'Planner' },
                      { value: 'spontaneous', label: 'Spontaneous' }
                    ].map((option) => (
                      <motion.button
                        key={option.value}
                        type="button"
                        onClick={() => handleChange('personality', { ...formData.personality, planning: option.value })}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 text-xs sm:text-sm font-medium transition-all ${
                          formData.personality.planning === option.value
                            ? 'bg-[#FF91A4] text-white border-[#FF91A4] shadow-md'
                            : 'bg-white text-[#212121] border-[#FFB6C1] hover:border-[#FF91A4]'
                        } ${errors.planning ? 'border-red-500' : ''}`}
                      >
                        {option.label}
                      </motion.button>
                    ))}
                  </div>
                  {errors.planning && (
                    <p className="text-xs text-red-600 mt-1">{errors.planning}</p>
                  )}
                </motion.div>

                {/* Romantic vs Practical */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mb-3 sm:mb-4"
                >
                  <label className="block text-xs sm:text-sm font-medium text-[#212121] mb-2">
                    Approach <span className="text-[#FF91A4]">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'romantic', label: 'Romantic' },
                      { value: 'practical', label: 'Practical' }
                    ].map((option) => (
                      <motion.button
                        key={option.value}
                        type="button"
                        onClick={() => handleChange('personality', { ...formData.personality, romantic: option.value })}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 text-xs sm:text-sm font-medium transition-all ${
                          formData.personality.romantic === option.value
                            ? 'bg-[#FF91A4] text-white border-[#FF91A4] shadow-md'
                            : 'bg-white text-[#212121] border-[#FFB6C1] hover:border-[#FF91A4]'
                        } ${errors.romantic ? 'border-red-500' : ''}`}
                      >
                        {option.label}
                      </motion.button>
                    ))}
                  </div>
                  {errors.romantic && (
                    <p className="text-xs text-red-600 mt-1">{errors.romantic}</p>
                  )}
                </motion.div>

                {/* Morning vs Night */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="mb-3 sm:mb-4"
                >
                  <label className="block text-xs sm:text-sm font-medium text-[#212121] mb-2">
                    Energy Time <span className="text-[#FF91A4]">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'morning', label: 'Morning Person' },
                      { value: 'night', label: 'Night Owl' }
                    ].map((option) => (
                      <motion.button
                        key={option.value}
                        type="button"
                        onClick={() => handleChange('personality', { ...formData.personality, morning: option.value })}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 text-xs sm:text-sm font-medium transition-all ${
                          formData.personality.morning === option.value
                            ? 'bg-[#FF91A4] text-white border-[#FF91A4] shadow-md'
                            : 'bg-white text-[#212121] border-[#FFB6C1] hover:border-[#FF91A4]'
                        } ${errors.morning ? 'border-red-500' : ''}`}
                      >
                        {option.label}
                      </motion.button>
                    ))}
                  </div>
                  {errors.morning && (
                    <p className="text-xs text-red-600 mt-1">{errors.morning}</p>
                  )}
                </motion.div>

                {/* Homebody vs Outgoing */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mb-3 sm:mb-4"
                >
                  <label className="block text-xs sm:text-sm font-medium text-[#212121] mb-2">
                    Lifestyle <span className="text-[#FF91A4]">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'homebody', label: 'Homebody' },
                      { value: 'outgoing', label: 'Outgoing' }
                    ].map((option) => (
                      <motion.button
                        key={option.value}
                        type="button"
                        onClick={() => handleChange('personality', { ...formData.personality, homebody: option.value })}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 text-xs sm:text-sm font-medium transition-all ${
                          formData.personality.homebody === option.value
                            ? 'bg-[#FF91A4] text-white border-[#FF91A4] shadow-md'
                            : 'bg-white text-[#212121] border-[#FFB6C1] hover:border-[#FF91A4]'
                        } ${errors.homebody ? 'border-red-500' : ''}`}
                      >
                        {option.label}
                      </motion.button>
                    ))}
                  </div>
                  {errors.homebody && (
                    <p className="text-xs text-red-600 mt-1">{errors.homebody}</p>
                  )}
                </motion.div>

                {/* Serious vs Fun-loving */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="mb-3 sm:mb-4"
                >
                  <label className="block text-xs sm:text-sm font-medium text-[#212121] mb-2">
                    Personality <span className="text-[#FF91A4]">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'serious', label: 'Serious' },
                      { value: 'fun-loving', label: 'Fun-loving' }
                    ].map((option) => (
                      <motion.button
                        key={option.value}
                        type="button"
                        onClick={() => handleChange('personality', { ...formData.personality, serious: option.value })}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 text-xs sm:text-sm font-medium transition-all ${
                          formData.personality.serious === option.value
                            ? 'bg-[#FF91A4] text-white border-[#FF91A4] shadow-md'
                            : 'bg-white text-[#212121] border-[#FFB6C1] hover:border-[#FF91A4]'
                        } ${errors.serious ? 'border-red-500' : ''}`}
                      >
                        {option.label}
                      </motion.button>
                    ))}
                  </div>
                  {errors.serious && (
                    <p className="text-xs text-red-600 mt-1">{errors.serious}</p>
                  )}
                </motion.div>

                {/* Quick vs Thoughtful Decision */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mb-3 sm:mb-4"
                >
                  <label className="block text-xs sm:text-sm font-medium text-[#212121] mb-2">
                    Decision Making <span className="text-[#FF91A4]">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'quick', label: 'Quick Decider' },
                      { value: 'thoughtful', label: 'Thoughtful' }
                    ].map((option) => (
                      <motion.button
                        key={option.value}
                        type="button"
                        onClick={() => handleChange('personality', { ...formData.personality, decision: option.value })}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 text-xs sm:text-sm font-medium transition-all ${
                          formData.personality.decision === option.value
                            ? 'bg-[#FF91A4] text-white border-[#FF91A4] shadow-md'
                            : 'bg-white text-[#212121] border-[#FFB6C1] hover:border-[#FF91A4]'
                        } ${errors.decision ? 'border-red-500' : ''}`}
                      >
                        {option.label}
                      </motion.button>
                    ))}
                  </div>
                  {errors.decision && (
                    <p className="text-xs text-red-600 mt-1">{errors.decision}</p>
                  )}
                </motion.div>

                {/* Direct vs Subtle Communication */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                  className="mb-3 sm:mb-4"
                >
                  <label className="block text-xs sm:text-sm font-medium text-[#212121] mb-2">
                    Communication Style <span className="text-[#FF91A4]">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'direct', label: 'Direct' },
                      { value: 'subtle', label: 'Subtle' }
                    ].map((option) => (
                      <motion.button
                        key={option.value}
                        type="button"
                        onClick={() => handleChange('personality', { ...formData.personality, communication: option.value })}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 text-xs sm:text-sm font-medium transition-all ${
                          formData.personality.communication === option.value
                            ? 'bg-[#FF91A4] text-white border-[#FF91A4] shadow-md'
                            : 'bg-white text-[#212121] border-[#FFB6C1] hover:border-[#FF91A4]'
                        } ${errors.communication ? 'border-red-500' : ''}`}
                      >
                        {option.label}
                      </motion.button>
                    ))}
                  </div>
                  {errors.communication && (
                    <p className="text-xs text-red-600 mt-1">{errors.communication}</p>
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
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 bg-[#757575] hover:bg-[#616161] text-white font-semibold py-2.5 sm:py-3 rounded-xl transition-all flex items-center justify-center"
                >
                  <ArrowLeft className="w-4 h-4 mr-1.5 sm:mr-2" />
                  <span className="text-sm">Back</span>
                </motion.button>
                <motion.button
                  onClick={handleNext}
                  disabled={Object.values(formData.personality).some(v => v === '')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 bg-[#FF91A4] hover:bg-[#FF69B4] disabled:bg-[#E0E0E0] disabled:cursor-not-allowed text-white font-semibold py-2.5 sm:py-3 rounded-xl transition-all disabled:transform-none text-sm"
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
              className="bg-white rounded-2xl sm:rounded-3xl shadow-lg p-4 sm:p-6 md:p-8"
            >
              <h2 className="text-lg sm:text-xl font-bold text-[#212121] mb-2 sm:mb-3">Dealbreakers & Lifestyle</h2>
              <p className="text-xs sm:text-sm text-[#757575] mb-4 sm:mb-6">
                Tell us about your lifestyle preferences
              </p>

              {/* Dealbreakers Questions */}
              <div className="space-y-3 sm:space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {/* Kids */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mb-3 sm:mb-4"
                >
                  <label className="block text-xs sm:text-sm font-medium text-[#212121] mb-2">
                    Kids <span className="text-[#FF91A4]">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'have-kids', label: 'Have Kids' },
                      { value: 'want-kids', label: 'Want Kids' },
                      { value: 'dont-want', label: "Don't Want" },
                      { value: 'not-sure', label: 'Not Sure' }
                    ].map((option) => (
                      <motion.button
                        key={option.value}
                        type="button"
                        onClick={() => handleChange('dealbreakers', { ...formData.dealbreakers, kids: option.value })}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 text-xs sm:text-sm font-medium transition-all ${
                          formData.dealbreakers.kids === option.value
                            ? 'bg-[#FF91A4] text-white border-[#FF91A4] shadow-md'
                            : 'bg-white text-[#212121] border-[#FFB6C1] hover:border-[#FF91A4]'
                        } ${errors.kids ? 'border-red-500' : ''}`}
                      >
                        {option.label}
                      </motion.button>
                    ))}
                  </div>
                  {errors.kids && (
                    <p className="text-xs text-red-600 mt-1">{errors.kids}</p>
                  )}
                </motion.div>

                {/* Smoking */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="mb-3 sm:mb-4"
                >
                  <label className="block text-xs sm:text-sm font-medium text-[#212121] mb-2">
                    Smoking <span className="text-[#FF91A4]">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'smoker', label: 'Smoker' },
                      { value: 'non-smoker', label: 'Non-smoker' },
                      { value: 'social-smoker', label: 'Social Smoker' },
                      { value: 'prefer-non-smoker', label: 'Prefer Non-smoker' }
                    ].map((option) => (
                      <motion.button
                        key={option.value}
                        type="button"
                        onClick={() => handleChange('dealbreakers', { ...formData.dealbreakers, smoking: option.value })}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 text-xs sm:text-sm font-medium transition-all ${
                          formData.dealbreakers.smoking === option.value
                            ? 'bg-[#FF91A4] text-white border-[#FF91A4] shadow-md'
                            : 'bg-white text-[#212121] border-[#FFB6C1] hover:border-[#FF91A4]'
                        } ${errors.smoking ? 'border-red-500' : ''}`}
                      >
                        {option.label}
                      </motion.button>
                    ))}
                  </div>
                  {errors.smoking && (
                    <p className="text-xs text-red-600 mt-1">{errors.smoking}</p>
                  )}
                </motion.div>

                {/* Pets */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mb-3 sm:mb-4"
                >
                  <label className="block text-xs sm:text-sm font-medium text-[#212121] mb-2">
                    Pets <span className="text-[#FF91A4]">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'love-pets', label: 'Love Pets' },
                      { value: 'have-pets', label: 'Have Pets' },
                      { value: 'allergic', label: 'Allergic' },
                      { value: 'not-interested', label: 'Not Interested' }
                    ].map((option) => (
                      <motion.button
                        key={option.value}
                        type="button"
                        onClick={() => handleChange('dealbreakers', { ...formData.dealbreakers, pets: option.value })}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 text-xs sm:text-sm font-medium transition-all ${
                          formData.dealbreakers.pets === option.value
                            ? 'bg-[#FF91A4] text-white border-[#FF91A4] shadow-md'
                            : 'bg-white text-[#212121] border-[#FFB6C1] hover:border-[#FF91A4]'
                        } ${errors.pets ? 'border-red-500' : ''}`}
                      >
                        {option.label}
                      </motion.button>
                    ))}
                  </div>
                  {errors.pets && (
                    <p className="text-xs text-red-600 mt-1">{errors.pets}</p>
                  )}
                </motion.div>

                {/* Drinking */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="mb-3 sm:mb-4"
                >
                  <label className="block text-xs sm:text-sm font-medium text-[#212121] mb-2">
                    Drinking <span className="text-[#FF91A4]">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'never', label: 'Never' },
                      { value: 'occasionally', label: 'Occasionally' },
                      { value: 'socially', label: 'Socially' },
                      { value: 'regularly', label: 'Regularly' }
                    ].map((option) => (
                      <motion.button
                        key={option.value}
                        type="button"
                        onClick={() => handleChange('dealbreakers', { ...formData.dealbreakers, drinking: option.value })}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 text-xs sm:text-sm font-medium transition-all ${
                          formData.dealbreakers.drinking === option.value
                            ? 'bg-[#FF91A4] text-white border-[#FF91A4] shadow-md'
                            : 'bg-white text-[#212121] border-[#FFB6C1] hover:border-[#FF91A4]'
                        } ${errors.drinking ? 'border-red-500' : ''}`}
                      >
                        {option.label}
                      </motion.button>
                    ))}
                  </div>
                  {errors.drinking && (
                    <p className="text-xs text-red-600 mt-1">{errors.drinking}</p>
                  )}
                </motion.div>

                {/* Religion (Optional) */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mb-3 sm:mb-4"
                >
                  <label className="block text-xs sm:text-sm font-medium text-[#212121] mb-1.5 sm:mb-2">
                    Religion <span className="text-[#757575] text-xs">(Optional)</span>
                  </label>
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
              <div className="flex gap-2 sm:gap-3 pt-4 sm:pt-6">
                <motion.button
                  onClick={handleBack}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 bg-[#757575] hover:bg-[#616161] text-white font-semibold py-2.5 sm:py-3 rounded-xl transition-all flex items-center justify-center"
                >
                  <ArrowLeft className="w-4 h-4 mr-1.5 sm:mr-2" />
                  <span className="text-sm">Back</span>
                </motion.button>
                <motion.button
                  onClick={handleNext}
                  disabled={!formData.dealbreakers.kids || !formData.dealbreakers.smoking || !formData.dealbreakers.pets || !formData.dealbreakers.drinking}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 bg-[#FF91A4] hover:bg-[#FF69B4] disabled:bg-[#E0E0E0] disabled:cursor-not-allowed text-white font-semibold py-2.5 sm:py-3 rounded-xl transition-all disabled:transform-none text-sm"
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
              className="bg-white rounded-2xl sm:rounded-3xl shadow-lg p-4 sm:p-6 md:p-8"
            >
              <h2 className="text-lg sm:text-xl font-bold text-[#212121] mb-2 sm:mb-3">Optional Details</h2>
              <p className="text-xs sm:text-sm text-[#757575] mb-4 sm:mb-6">
                Share more about yourself (all fields are optional)
              </p>

              {/* Optional Details */}
              <div className="space-y-3 sm:space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {/* Education */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mb-3 sm:mb-4"
                >
                  <label className="block text-xs sm:text-sm font-medium text-[#212121] mb-1.5 sm:mb-2">
                    Education <span className="text-[#757575] text-xs">(Optional)</span>
                  </label>
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
                  className="mb-3 sm:mb-4"
                >
                  <label className="block text-xs sm:text-sm font-medium text-[#212121] mb-1.5 sm:mb-2">
                    Profession <span className="text-[#757575] text-xs">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.optional.profession}
                    onChange={(e) => handleChange('optional', { ...formData.optional, profession: e.target.value })}
                    placeholder="e.g., Software Engineer, Doctor, Teacher"
                    className="w-full px-4 py-2.5 sm:py-3 border-2 border-[#FFB6C1] rounded-xl sm:rounded-2xl text-sm sm:text-base text-[#212121] bg-white focus:outline-none focus:ring-2 focus:ring-[#FF91A4] focus:ring-opacity-20 focus:border-[#FF91A4] transition-all"
                  />
                </motion.div>

                {/* Languages */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mb-3 sm:mb-4"
                >
                  <label className="block text-xs sm:text-sm font-medium text-[#212121] mb-1.5 sm:mb-2">
                    Languages <span className="text-[#757575] text-xs">(Optional)</span>
                  </label>
                  <p className="text-xs text-[#757575] mb-2">Select all languages you speak</p>
                  <div className="flex flex-wrap gap-2">
                    {['Hindi', 'English', 'Bengali', 'Telugu', 'Marathi', 'Tamil', 'Gujarati', 'Kannada', 'Malayalam', 'Punjabi', 'Urdu', 'Odia', 'Assamese', 'Sanskrit', 'Other'].map((language, idx) => (
                      <motion.button
                        key={language}
                        type="button"
                        onClick={() => {
                          const current = formData.optional.languages;
                          if (current.includes(language)) {
                            handleChange('optional', { ...formData.optional, languages: current.filter(l => l !== language) });
                          } else {
                            handleChange('optional', { ...formData.optional, languages: [...current, language] });
                          }
                        }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 + idx * 0.02 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                          formData.optional.languages.includes(language)
                            ? 'bg-[#FF91A4] text-white border-2 border-[#FF91A4] shadow-md'
                            : 'bg-white text-[#212121] border-2 border-[#FFB6C1] hover:border-[#FF91A4]'
                        }`}
                      >
                        {language}
                      </motion.button>
                    ))}
                  </div>
                  {formData.optional.languages.length > 0 && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs text-[#757575] mt-2"
                    >
                      {formData.optional.languages.length} language{formData.optional.languages.length > 1 ? 's' : ''} selected
                    </motion.p>
                  )}
                </motion.div>

                {/* Horoscope */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mb-3 sm:mb-4"
                >
                  <label className="block text-xs sm:text-sm font-medium text-[#212121] mb-1.5 sm:mb-2">
                    Horoscope <span className="text-[#757575] text-xs">(Optional)</span>
                  </label>
                  <CustomDropdown
                    options={[
                      { value: '', label: 'Select horoscope sign (optional)' },
                      { value: 'aries', label: 'Aries (मेष)' },
                      { value: 'taurus', label: 'Taurus (वृषभ)' },
                      { value: 'gemini', label: 'Gemini (मिथुन)' },
                      { value: 'cancer', label: 'Cancer (कर्क)' },
                      { value: 'leo', label: 'Leo (सिंह)' },
                      { value: 'virgo', label: 'Virgo (कन्या)' },
                      { value: 'libra', label: 'Libra (तुला)' },
                      { value: 'scorpio', label: 'Scorpio (वृश्चिक)' },
                      { value: 'sagittarius', label: 'Sagittarius (धनु)' },
                      { value: 'capricorn', label: 'Capricorn (मकर)' },
                      { value: 'aquarius', label: 'Aquarius (कुम्भ)' },
                      { value: 'pisces', label: 'Pisces (मीन)' },
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
              <div className="flex gap-2 sm:gap-3 pt-4 sm:pt-6">
                <motion.button
                  onClick={handleBack}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 bg-[#757575] hover:bg-[#616161] text-white font-semibold py-2.5 sm:py-3 rounded-xl transition-all flex items-center justify-center"
                >
                  <ArrowLeft className="w-4 h-4 mr-1.5 sm:mr-2" />
                  <span className="text-sm">Back</span>
                </motion.button>
                <motion.button
                  onClick={handleNext}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 bg-[#FF91A4] hover:bg-[#FF69B4] text-white font-semibold py-2.5 sm:py-3 rounded-xl transition-all text-sm"
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
              className="bg-white rounded-2xl sm:rounded-3xl shadow-lg p-4 sm:p-6 md:p-8"
            >
              <h2 className="text-lg sm:text-xl font-bold text-[#212121] mb-2 sm:mb-3">Review Your Profile</h2>
              <p className="text-xs sm:text-sm text-[#757575] mb-4 sm:mb-6">
                Please review your information before submitting
              </p>

              {/* Review Sections */}
              <div className="space-y-3 sm:space-y-4 max-h-[60vh] overflow-y-auto pr-2">
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
                    <p><span className="font-medium text-[#212121]">Looking For:</span> {formData.lookingFor.length > 0 ? formData.lookingFor.join(', ') : 'Not provided'}</p>
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

                {/* Step 6: Optional Details */}
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
                        onClick={() => setCurrentStep(6)}
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
              </div>

              {/* Submit Button */}
              <div className="pt-4 sm:pt-6">
                <motion.button
                  onClick={handleNext}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-[#FF91A4] hover:bg-[#FF69B4] text-white font-semibold py-3 sm:py-4 rounded-xl sm:rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  <Check className="w-5 h-5" />
                  <span className="text-sm sm:text-base">Complete Profile</span>
                </motion.button>
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-4">
                <motion.button
                  onClick={handleBack}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 bg-[#757575] hover:bg-[#616161] text-white font-semibold py-2.5 sm:py-3 rounded-xl transition-all flex items-center justify-center"
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
