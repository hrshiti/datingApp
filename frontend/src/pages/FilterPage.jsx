import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, X, Sliders, Users, MapPin, Heart, Sparkles, Smile, Home, GraduationCap, Briefcase, RotateCcw, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomDropdown from '../components/CustomDropdown';

export default function FilterPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    ageRange: { min: 18, max: '' },
    distancePref: 25,
    gender: '',
    lookingFor: [],
    interests: [],
    personality: {
      social: '',
      planning: '',
      romantic: '',
      morning: ''
    },
    dealbreakers: {
      kids: '',
      smoking: '',
      pets: '',
      drinking: ''
    },
    optional: {
      education: '',
      profession: '',
      languages: []
    }
  });

  // Load existing filters from localStorage
  useEffect(() => {
    const savedFilters = localStorage.getItem('discoveryFilters');
    if (savedFilters) {
      try {
        const parsed = JSON.parse(savedFilters);
        setFilters(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error('Error loading filters:', e);
      }
    } else {
      // Load from onboarding data as defaults
      const onboardingData = localStorage.getItem('onboardingData');
      if (onboardingData) {
        try {
          const parsed = JSON.parse(onboardingData);
          setFilters(prev => ({
            ...prev,
            ageRange: parsed.step2?.ageRange || { min: 18, max: '' },
            distancePref: parsed.step2?.distancePref || 25,
            gender: parsed.step1?.gender || '',
            lookingFor: parsed.step1?.lookingFor || [],
            interests: parsed.step3?.interests || [],
            personality: parsed.step4?.personality || prev.personality,
            dealbreakers: parsed.step5?.dealbreakers || prev.dealbreakers,
            optional: parsed.step6?.optional || prev.optional
          }));
        } catch (e) {
          console.error('Error loading onboarding data:', e);
        }
      }
    }
  }, []);

  const handleAgeRangeChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      ageRange: {
        ...prev.ageRange,
        [field]: value === '' ? '' : parseInt(value) || ''
      }
    }));
  };

  const handleAgeRangeBlur = (field) => {
    const value = filters.ageRange[field];
    if (field === 'min') {
      const min = value === '' ? 18 : Math.max(18, Math.min(100, parseInt(value) || 18));
      const max = filters.ageRange.max === '' ? '' : Math.max(min, parseInt(filters.ageRange.max) || min);
      setFilters(prev => ({
        ...prev,
        ageRange: { min, max }
      }));
    } else if (field === 'max' && value !== '') {
      const min = parseInt(filters.ageRange.min) || 18;
      const max = Math.max(min, Math.min(100, parseInt(value) || min));
      setFilters(prev => ({
        ...prev,
        ageRange: { ...prev.ageRange, max }
      }));
    }
  };

  const handleDistanceChange = (value) => {
    setFilters(prev => ({
      ...prev,
      distancePref: parseInt(value) || 25
    }));
  };

  const handleLookingForToggle = (option) => {
    setFilters(prev => ({
      ...prev,
      lookingFor: prev.lookingFor.includes(option)
        ? prev.lookingFor.filter(item => item !== option)
        : [...prev.lookingFor, option]
    }));
  };

  const handleInterestToggle = (interest) => {
    setFilters(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(item => item !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleReset = () => {
    const onboardingData = localStorage.getItem('onboardingData');
    if (onboardingData) {
      try {
        const parsed = JSON.parse(onboardingData);
        setFilters({
          ageRange: parsed.step2?.ageRange || { min: 18, max: '' },
          distancePref: parsed.step2?.distancePref || 25,
          gender: parsed.step1?.gender || '',
          lookingFor: parsed.step1?.lookingFor || [],
          interests: parsed.step3?.interests || [],
          personality: parsed.step4?.personality || {
            social: '',
            planning: '',
            romantic: '',
            morning: ''
          },
          dealbreakers: parsed.step5?.dealbreakers || {
            kids: '',
            smoking: '',
            pets: '',
            drinking: ''
          },
          optional: parsed.step6?.optional || {
            education: '',
            profession: '',
            languages: []
          }
        });
      } catch (e) {
        console.error('Error resetting filters:', e);
      }
    }
  };

  const handleApply = () => {
    localStorage.setItem('discoveryFilters', JSON.stringify(filters));
    navigate('/discover');
  };

  const availableInterests = [
    'Trekking', 'Cooking', 'Reading', 'Music', 'Dance', 'Photography',
    'Travel', 'Fitness', 'Art', 'Movies', 'Gaming', 'Sports',
    'Writing', 'Yoga', 'Meditation', 'Food', 'Nature', 'Adventure'
  ];

  const lookingForOptions = [
    { value: 'casual', label: 'Casual' },
    { value: 'relationship', label: 'Relationship' },
    { value: 'marriage', label: 'Marriage' },
    { value: 'friends', label: 'Friends' }
  ];

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'non-binary', label: 'Non-binary' },
    { value: 'trans', label: 'Trans' },
    { value: 'other', label: 'Other' }
  ];

  const educationOptions = [
    { value: 'high-school', label: 'High school' },
    { value: 'diploma', label: 'Diploma' },
    { value: 'bachelors', label: "Bachelor's degree" },
    { value: 'masters', label: "Master's degree" },
    { value: 'phd', label: 'PhD' }
  ];

  const kidsOptions = [
    { value: 'want-kids', label: 'Want kids' },
    { value: 'dont-want-kids', label: "Don't want kids" },
    { value: 'have-kids', label: 'Have kids' },
    { value: 'not-sure', label: 'Not sure' }
  ];

  const smokingOptions = [
    { value: 'non-smoker', label: 'Non-smoker' },
    { value: 'social-smoker', label: 'Social smoker' },
    { value: 'smoker', label: 'Smoker' },
    { value: 'prefer-non-smoker', label: 'Prefer non-smoker' }
  ];

  const petsOptions = [
    { value: 'have-pets', label: 'Have pets' },
    { value: 'love-pets', label: 'Love pets' },
    { value: 'not-interested', label: "Don't have pets" }
  ];

  const drinkingOptions = [
    { value: 'never', label: 'Never' },
    { value: 'occasionally', label: 'Occasionally' },
    { value: 'socially', label: 'Socially' },
    { value: 'regularly', label: 'Regularly' }
  ];

  const personalityOptions = {
    social: [
      { value: 'social', label: 'Social' },
      { value: 'introvert', label: 'Introvert' }
    ],
    planning: [
      { value: 'planner', label: 'Planner' },
      { value: 'spontaneous', label: 'Spontaneous' }
    ],
    romantic: [
      { value: 'romantic', label: 'Romantic' },
      { value: 'practical', label: 'Practical' }
    ],
    morning: [
      { value: 'morning-person', label: 'Morning person' },
      { value: 'night-owl', label: 'Night owl' }
    ]
  };

  return (
    <div className="min-h-screen heart-background flex flex-col relative overflow-hidden">
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
        className="relative z-20 bg-white/95 backdrop-blur-md border-b-2 border-[#FFB6C1] shadow-md"
      >
        <div className="max-w-2xl mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.button
                onClick={() => navigate('/discover')}
                whileHover={{ scale: 1.1, x: -2 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 hover:bg-[#FFE4E1] rounded-xl transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-[#212121]" />
              </motion.button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#FF91A4] to-[#FF69B4] rounded-xl flex items-center justify-center shadow-md">
                  <Sliders className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-[#FF91A4] to-[#FF69B4] bg-clip-text text-transparent">
                    Filters
                  </h1>
                  <p className="text-xs text-[#757575]">Customize your discovery</p>
                </div>
              </div>
            </div>
            <motion.button
              onClick={handleReset}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-[#757575] hover:text-[#FF91A4] transition-colors bg-[#FFE4E1] hover:bg-[#FFB6C1] rounded-xl"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Reset</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Filter Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide pb-24">
        <div className="max-w-2xl mx-auto px-4 py-4 sm:py-6">
          {/* Age Range */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 sm:mb-5 bg-gradient-to-br from-white to-[#FFF0F5] rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-md border-2 border-[#FFB6C1]"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#FF91A4] to-[#FF69B4] rounded-xl flex items-center justify-center shadow-md">
                <Users className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-[#212121]">Age Range</h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-xs sm:text-sm text-[#757575] mb-2 font-medium">Min Age</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={filters.ageRange.min}
                  onChange={(e) => handleAgeRangeChange('min', e.target.value)}
                  onBlur={() => handleAgeRangeBlur('min')}
                  className="w-full px-4 py-3 bg-white border-2 border-[#FFB6C1] rounded-xl text-[#212121] font-semibold text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#FF91A4] focus:ring-opacity-20 focus:border-[#FF91A4] transition-all shadow-sm hover:shadow-md"
                />
              </div>
              <div className="pt-8 text-[#FF91A4] font-bold text-xl sm:text-2xl">-</div>
              <div className="flex-1">
                <label className="block text-xs sm:text-sm text-[#757575] mb-2 font-medium">Max Age</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={filters.ageRange.max}
                  onChange={(e) => handleAgeRangeChange('max', e.target.value)}
                  onBlur={() => handleAgeRangeBlur('max')}
                  placeholder="Any"
                  className="w-full px-4 py-3 bg-white border-2 border-[#FFB6C1] rounded-xl text-[#212121] font-semibold text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#FF91A4] focus:ring-opacity-20 focus:border-[#FF91A4] transition-all shadow-sm hover:shadow-md"
                />
              </div>
            </div>
          </motion.div>

          {/* Distance Preference */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-4 sm:mb-5 bg-gradient-to-br from-white to-[#FFF0F5] rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-md border-2 border-[#FFB6C1]"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#FF91A4] to-[#FF69B4] rounded-xl flex items-center justify-center shadow-md">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-bold text-[#212121]">Distance</h2>
                <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-[#FF91A4] to-[#FF69B4] rounded-xl text-sm sm:text-base font-bold text-white shadow-md">
                  {filters.distancePref} km
                </div>
              </div>
            </div>
            <input
              type="range"
              min="5"
              max="100"
              step="5"
              value={filters.distancePref}
              onChange={(e) => handleDistanceChange(e.target.value)}
              className="w-full h-3 bg-gradient-to-r from-[#FFE4E1] to-[#FFF0F5] rounded-lg appearance-none cursor-pointer accent-[#FF91A4] shadow-inner"
              style={{
                background: `linear-gradient(to right, #FF91A4 0%, #FF91A4 ${((filters.distancePref - 5) / 95) * 100}%, #FFE4E1 ${((filters.distancePref - 5) / 95) * 100}%, #FFE4E1 100%)`
              }}
            />
          </motion.div>

          {/* Gender */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-4 sm:mb-5 bg-gradient-to-br from-white to-[#FFF0F5] rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-md border-2 border-[#FFB6C1]"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#FF91A4] to-[#FF69B4] rounded-xl flex items-center justify-center shadow-md">
                <Users className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-[#212121]">Gender</h2>
            </div>
            <CustomDropdown
              options={[{ value: '', label: 'Any gender' }, ...genderOptions]}
              value={filters.gender}
              onChange={(value) => setFilters(prev => ({ ...prev, gender: value }))}
              placeholder="Any gender"
            />
          </motion.div>

          {/* Looking For */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-4 sm:mb-5 bg-gradient-to-br from-white to-[#FFF0F5] rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-md border-2 border-[#FFB6C1]"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#FF91A4] to-[#FF69B4] rounded-xl flex items-center justify-center shadow-md">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-[#212121]">Looking For</h2>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {lookingForOptions.map((option) => (
                <motion.button
                  key={option.value}
                  onClick={() => handleLookingForToggle(option.value)}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all ${
                    filters.lookingFor.includes(option.value)
                      ? 'bg-gradient-to-br from-[#FF91A4] to-[#FF69B4] text-white shadow-md'
                      : 'bg-white text-[#212121] border-2 border-[#FFB6C1] hover:border-[#FF91A4] shadow-sm'
                  }`}
                >
                  {option.label}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Interests */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-4 sm:mb-5 bg-gradient-to-br from-white to-[#FFF0F5] rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-md border-2 border-[#FFB6C1]"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#FF91A4] to-[#FF69B4] rounded-xl flex items-center justify-center shadow-md">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-[#212121]">Interests</h2>
              </div>
              {filters.interests.length > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="px-3 py-1 bg-gradient-to-r from-[#FF91A4] to-[#FF69B4] text-white text-xs sm:text-sm font-bold rounded-full shadow-md"
                >
                  {filters.interests.length}
                </motion.span>
              )}
            </div>
            <div className="flex flex-wrap gap-2.5">
              {availableInterests.map((interest, idx) => (
                <motion.button
                  key={interest}
                  onClick={() => handleInterestToggle(interest)}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + idx * 0.02 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-3 sm:px-4 py-2 rounded-xl font-semibold text-xs sm:text-sm transition-all ${
                    filters.interests.includes(interest)
                      ? 'bg-gradient-to-br from-[#FF91A4] to-[#FF69B4] text-white border-2 border-[#FF91A4] shadow-md'
                      : 'bg-white text-[#212121] border-2 border-[#FFB6C1] hover:border-[#FF91A4] shadow-sm'
                  }`}
                >
                  {interest}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Personality */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-4 sm:mb-5 bg-gradient-to-br from-white to-[#FFF0F5] rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-md border-2 border-[#FFB6C1]"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#FF91A4] to-[#FF69B4] rounded-xl flex items-center justify-center shadow-md">
                <Smile className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-[#212121]">Personality</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(personalityOptions).map(([key, options]) => (
                <div key={key}>
                  <label className="block text-xs sm:text-sm text-[#757575] mb-2 font-medium capitalize">{key}</label>
                  <CustomDropdown
                    options={[{ value: '', label: 'Any' }, ...options]}
                    value={filters.personality[key]}
                    onChange={(value) => setFilters(prev => ({
                      ...prev,
                      personality: { ...prev.personality, [key]: value }
                    }))}
                    placeholder={`Any`}
                  />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Dealbreakers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-4 sm:mb-5 bg-gradient-to-br from-white to-[#FFF0F5] rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-md border-2 border-[#FFB6C1]"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#FF91A4] to-[#FF69B4] rounded-xl flex items-center justify-center shadow-md">
                <Home className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-[#212121]">Dealbreakers</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs sm:text-sm text-[#757575] mb-2 font-medium">Kids</label>
                <CustomDropdown
                  options={[{ value: '', label: 'Any' }, ...kidsOptions]}
                  value={filters.dealbreakers.kids}
                  onChange={(value) => setFilters(prev => ({
                    ...prev,
                    dealbreakers: { ...prev.dealbreakers, kids: value }
                  }))}
                  placeholder="Any"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm text-[#757575] mb-2 font-medium">Smoking</label>
                <CustomDropdown
                  options={[{ value: '', label: 'Any' }, ...smokingOptions]}
                  value={filters.dealbreakers.smoking}
                  onChange={(value) => setFilters(prev => ({
                    ...prev,
                    dealbreakers: { ...prev.dealbreakers, smoking: value }
                  }))}
                  placeholder="Any"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm text-[#757575] mb-2 font-medium">Pets</label>
                <CustomDropdown
                  options={[{ value: '', label: 'Any' }, ...petsOptions]}
                  value={filters.dealbreakers.pets}
                  onChange={(value) => setFilters(prev => ({
                    ...prev,
                    dealbreakers: { ...prev.dealbreakers, pets: value }
                  }))}
                  placeholder="Any"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm text-[#757575] mb-2 font-medium">Drinking</label>
                <CustomDropdown
                  options={[{ value: '', label: 'Any' }, ...drinkingOptions]}
                  value={filters.dealbreakers.drinking}
                  onChange={(value) => setFilters(prev => ({
                    ...prev,
                    dealbreakers: { ...prev.dealbreakers, drinking: value }
                  }))}
                  placeholder="Any"
                />
              </div>
            </div>
          </motion.div>

          {/* Optional Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mb-4 sm:mb-5 bg-gradient-to-br from-white to-[#FFF0F5] rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-md border-2 border-[#FFB6C1]"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#FF91A4] to-[#FF69B4] rounded-xl flex items-center justify-center shadow-md">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-[#212121]">Additional Filters</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs sm:text-sm text-[#757575] mb-2 font-medium">Education</label>
                <CustomDropdown
                  options={[{ value: '', label: 'Any' }, ...educationOptions]}
                  value={filters.optional.education}
                  onChange={(value) => setFilters(prev => ({
                    ...prev,
                    optional: { ...prev.optional, education: value }
                  }))}
                  placeholder="Any"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm text-[#757575] mb-2 font-medium">Profession</label>
                <input
                  type="text"
                  value={filters.optional.profession || ''}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    optional: { ...prev.optional, profession: e.target.value }
                  }))}
                  placeholder="Any profession"
                  className="w-full px-4 py-3 bg-white border-2 border-[#FFB6C1] rounded-xl text-[#212121] font-semibold text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#FF91A4] focus:ring-opacity-20 focus:border-[#FF91A4] transition-all shadow-sm hover:shadow-md"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t-2 border-[#FFB6C1] shadow-xl p-4">
        <div className="max-w-2xl mx-auto flex gap-3">
          <motion.button
            onClick={() => navigate('/discover')}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 px-4 py-3 bg-white border-2 border-[#E0E0E0] text-[#212121] rounded-xl font-semibold text-sm sm:text-base hover:border-[#757575] transition-all shadow-sm hover:shadow-md"
          >
            Cancel
          </motion.button>
          <motion.button
            onClick={handleApply}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-[#FF91A4] to-[#FF69B4] hover:from-[#FF69B4] hover:to-[#FF91A4] text-white rounded-xl font-semibold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4 sm:w-5 sm:h-5" />
            Apply Filters
          </motion.button>
        </div>
      </div>
    </div>
  );
}

