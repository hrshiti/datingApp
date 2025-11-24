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
    <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] via-[#E8ECF1] to-[#F5F7FA] flex flex-col relative overflow-hidden">
      {/* Premium Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-[300px] sm:w-[400px] md:w-[600px] h-[300px] sm:h-[400px] md:h-[600px] bg-gradient-to-br from-[#64B5F6]/8 to-transparent rounded-full blur-3xl -translate-x-1/3 -translate-y-1/3"></div>
      <div className="absolute bottom-0 right-0 w-[350px] sm:w-[500px] md:w-[700px] h-[350px] sm:h-[500px] md:h-[700px] bg-gradient-to-tl from-[#42A5F5]/8 to-transparent rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-20 bg-white/95 backdrop-blur-lg border-b border-[#E8E8E8] shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
      >
        <div className="max-w-2xl mx-auto px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3">
              <motion.button
                onClick={() => navigate('/discover')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-1.5 sm:p-2 hover:bg-[#F5F5F5] rounded-xl transition-colors"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-[#616161]" />
              </motion.button>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#64B5F6] to-[#42A5F5] rounded-xl flex items-center justify-center shadow-md">
                  <Sliders className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-base sm:text-lg md:text-xl font-bold text-[#1A1A1A]">
                    Filters
                  </h1>
                  <p className="text-[10px] sm:text-xs text-[#616161]">Customize your discovery</p>
                </div>
              </div>
            </div>
            <motion.button
              onClick={handleReset}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs md:text-sm font-semibold text-[#616161] hover:text-[#64B5F6] transition-colors bg-white hover:bg-[#E3F2FD] border border-[#E8E8E8] hover:border-[#64B5F6] rounded-lg sm:rounded-xl"
            >
              <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
            className="mb-4 sm:mb-5 bg-gradient-to-br bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-md border border-[#E8E8E8]"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#64B5F6] to-[#42A5F5] rounded-xl flex items-center justify-center shadow-md">
                <Users className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-[#1A1A1A]">Age Range</h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-xs sm:text-sm text-[#616161] mb-2 font-medium">Min Age</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={filters.ageRange.min}
                  onChange={(e) => handleAgeRangeChange('min', e.target.value)}
                  onBlur={() => handleAgeRangeBlur('min')}
                  className="w-full px-4 py-3 bg-white border border-[#E8E8E8] rounded-xl text-[#1A1A1A] font-semibold text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#64B5F6] focus:ring-opacity-20 focus:border-[#64B5F6] transition-all shadow-sm hover:shadow-md"
                />
              </div>
              <div className="pt-8 text-[#64B5F6] font-bold text-xl sm:text-2xl">-</div>
              <div className="flex-1">
                <label className="block text-xs sm:text-sm text-[#616161] mb-2 font-medium">Max Age</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={filters.ageRange.max}
                  onChange={(e) => handleAgeRangeChange('max', e.target.value)}
                  onBlur={() => handleAgeRangeBlur('max')}
                  placeholder="Any"
                  className="w-full px-4 py-3 bg-white border border-[#E8E8E8] rounded-xl text-[#1A1A1A] font-semibold text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#64B5F6] focus:ring-opacity-20 focus:border-[#64B5F6] transition-all shadow-sm hover:shadow-md"
                />
              </div>
            </div>
          </motion.div>

          {/* Distance Preference */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-4 sm:mb-5 bg-gradient-to-br bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-md border border-[#E8E8E8]"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#64B5F6] to-[#42A5F5] rounded-xl flex items-center justify-center shadow-md">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-bold text-[#1A1A1A]">Distance</h2>
                <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-[#64B5F6] to-[#42A5F5] rounded-xl text-sm sm:text-base font-bold text-white shadow-md">
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
              className="w-full h-3 bg-gradient-to-r from-[#E3F2FD] to-[#F5F7FA] rounded-lg appearance-none cursor-pointer accent-[#64B5F6] shadow-inner"
              style={{
                background: `linear-gradient(to right, #64B5F6 0%, #64B5F6 ${((filters.distancePref - 5) / 95) * 100}%, #E0E0E0 ${((filters.distancePref - 5) / 95) * 100}%, #E0E0E0 100%)`
              }}
            />
          </motion.div>

          {/* Gender */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-4 sm:mb-5 bg-gradient-to-br bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-md border border-[#E8E8E8]"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#64B5F6] to-[#42A5F5] rounded-xl flex items-center justify-center shadow-md">
                <Users className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-[#1A1A1A]">Gender</h2>
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
            className="mb-4 sm:mb-5 bg-gradient-to-br bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-md border border-[#E8E8E8]"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#64B5F6] to-[#42A5F5] rounded-xl flex items-center justify-center shadow-md">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-[#1A1A1A]">Looking For</h2>
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
                      ? 'bg-gradient-to-br from-[#64B5F6] to-[#42A5F5] text-white shadow-md'
                      : 'bg-white text-[#1A1A1A] border border-[#E8E8E8] hover:border-[#64B5F6] shadow-sm'
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
            className="mb-4 sm:mb-5 bg-gradient-to-br bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-md border border-[#E8E8E8]"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#64B5F6] to-[#42A5F5] rounded-xl flex items-center justify-center shadow-md">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-[#1A1A1A]">Interests</h2>
              </div>
              {filters.interests.length > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="px-3 py-1 bg-gradient-to-r from-[#64B5F6] to-[#42A5F5] text-white text-xs sm:text-sm font-bold rounded-full shadow-md"
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
                      ? 'bg-gradient-to-br from-[#64B5F6] to-[#42A5F5] text-white border-2 border-[#64B5F6] shadow-md'
                      : 'bg-white text-[#1A1A1A] border border-[#E8E8E8] hover:border-[#64B5F6] shadow-sm'
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
            className="mb-4 sm:mb-5 bg-gradient-to-br bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-md border border-[#E8E8E8]"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#64B5F6] to-[#42A5F5] rounded-xl flex items-center justify-center shadow-md">
                <Smile className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-[#1A1A1A]">Personality</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(personalityOptions).map(([key, options]) => (
                <div key={key}>
                  <label className="block text-xs sm:text-sm text-[#616161] mb-2 font-medium capitalize">{key}</label>
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
            className="mb-4 sm:mb-5 bg-gradient-to-br bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-md border border-[#E8E8E8]"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#64B5F6] to-[#42A5F5] rounded-xl flex items-center justify-center shadow-md">
                <Home className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-[#1A1A1A]">Dealbreakers</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs sm:text-sm text-[#616161] mb-2 font-medium">Kids</label>
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
                <label className="block text-xs sm:text-sm text-[#616161] mb-2 font-medium">Smoking</label>
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
                <label className="block text-xs sm:text-sm text-[#616161] mb-2 font-medium">Pets</label>
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
                <label className="block text-xs sm:text-sm text-[#616161] mb-2 font-medium">Drinking</label>
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
            className="mb-4 sm:mb-5 bg-gradient-to-br bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-md border border-[#E8E8E8]"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#64B5F6] to-[#42A5F5] rounded-xl flex items-center justify-center shadow-md">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-[#1A1A1A]">Additional Filters</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs sm:text-sm text-[#616161] mb-2 font-medium">Education</label>
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
                <label className="block text-xs sm:text-sm text-[#616161] mb-2 font-medium">Profession</label>
                <input
                  type="text"
                  value={filters.optional.profession || ''}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    optional: { ...prev.optional, profession: e.target.value }
                  }))}
                  placeholder="Any profession"
                  className="w-full px-4 py-3 bg-white border border-[#E8E8E8] rounded-xl text-[#1A1A1A] font-semibold text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#64B5F6] focus:ring-opacity-20 focus:border-[#64B5F6] transition-all shadow-sm hover:shadow-md"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-lg border-t border-[#E8E8E8] shadow-xl p-2 sm:p-3 md:p-4">
        <div className="max-w-2xl mx-auto flex gap-2 sm:gap-3">
          <motion.button
            onClick={() => navigate('/discover')}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 bg-white border border-[#E8E8E8] text-[#1A1A1A] rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm md:text-base hover:border-[#616161] transition-all shadow-sm hover:shadow-md"
          >
            Cancel
          </motion.button>
          <motion.button
            onClick={handleApply}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-r from-[#64B5F6] to-[#42A5F5] hover:from-[#42A5F5] hover:to-[#64B5F6] text-white rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm md:text-base shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4 sm:w-5 sm:h-5" />
            Apply Filters
          </motion.button>
        </div>
      </div>
    </div>
  );
}

