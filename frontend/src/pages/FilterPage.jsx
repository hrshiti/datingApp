import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, X, Sliders } from 'lucide-react';
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
        className="relative z-20 bg-white/95 backdrop-blur-md border-b-2 border-[#90CAF9] shadow-sm"
      >
        <div className="max-w-2xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <motion.button
                onClick={() => navigate('/discover')}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-1.5 hover:bg-[#E7F3FF] rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-[#212121]" />
              </motion.button>
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#1877F2]" />
                <h1 className="text-lg font-bold text-[#212121]">Filters</h1>
              </div>
            </div>
            <motion.button
              onClick={handleReset}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-3 py-1.5 text-xs font-semibold text-[#757575] hover:text-[#1877F2] transition-colors"
            >
              Reset
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Filter Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide pb-24">
        <div className="max-w-2xl mx-auto px-4 py-4">
          {/* Age Range */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 bg-white rounded-xl p-4 shadow-sm border border-[#90CAF9]/20"
          >
            <h2 className="text-base font-bold text-[#212121] mb-3">Age Range</h2>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="block text-xs text-[#757575] mb-1.5">Min</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={filters.ageRange.min}
                  onChange={(e) => handleAgeRangeChange('min', e.target.value)}
                  onBlur={() => handleAgeRangeBlur('min')}
                  className="w-full px-3 py-2 bg-[#E7F3FF] border-2 border-[#90CAF9]/30 rounded-lg text-[#212121] font-semibold text-sm focus:outline-none focus:border-[#1877F2] transition-all"
                />
              </div>
              <div className="pt-6 text-[#757575] font-bold text-lg">-</div>
              <div className="flex-1">
                <label className="block text-xs text-[#757575] mb-1.5">Max</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={filters.ageRange.max}
                  onChange={(e) => handleAgeRangeChange('max', e.target.value)}
                  onBlur={() => handleAgeRangeBlur('max')}
                  placeholder="Any"
                  className="w-full px-3 py-2 bg-[#E7F3FF] border-2 border-[#90CAF9]/30 rounded-lg text-[#212121] font-semibold text-sm focus:outline-none focus:border-[#1877F2] transition-all"
                />
              </div>
            </div>
          </motion.div>

          {/* Distance Preference */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-4 bg-white rounded-xl p-4 shadow-sm border border-[#90CAF9]/20"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-[#212121]">Distance</h2>
              <div className="px-3 py-1 bg-gradient-to-r from-[#E7F3FF] to-[#F0F8FF] rounded-lg text-sm font-bold text-[#1877F2]">
                {filters.distancePref} km
              </div>
            </div>
            <input
              type="range"
              min="5"
              max="100"
              step="5"
              value={filters.distancePref}
              onChange={(e) => handleDistanceChange(e.target.value)}
              className="w-full h-2 bg-[#E7F3FF] rounded-lg appearance-none cursor-pointer accent-[#1877F2]"
            />
          </motion.div>

          {/* Gender & Looking For - Combined */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-4 bg-white rounded-xl p-4 shadow-sm border border-[#90CAF9]/20"
          >
            <h2 className="text-base font-bold text-[#212121] mb-3">Gender</h2>
            <CustomDropdown
              options={genderOptions}
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
            className="mb-4 bg-white rounded-xl p-4 shadow-sm border border-[#90CAF9]/20"
          >
            <h2 className="text-base font-bold text-[#212121] mb-3">Looking For</h2>
            <div className="flex flex-wrap gap-2">
              {lookingForOptions.map((option) => (
                <motion.button
                  key={option.value}
                  onClick={() => handleLookingForToggle(option.value)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all ${
                    filters.lookingFor.includes(option.value)
                      ? 'bg-gradient-to-r from-[#1877F2] to-[#42A5F5] text-white shadow-sm'
                      : 'bg-[#E7F3FF] text-[#212121] border border-[#90CAF9]/30 hover:border-[#1877F2]'
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
            className="mb-4 bg-white rounded-xl p-4 shadow-sm border border-[#90CAF9]/20"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-[#212121]">Interests</h2>
              {filters.interests.length > 0 && (
                <span className="px-2 py-0.5 bg-[#1877F2] text-white text-xs font-bold rounded-full">
                  {filters.interests.length}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {availableInterests.map((interest) => (
                <motion.button
                  key={interest}
                  onClick={() => handleInterestToggle(interest)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all ${
                    filters.interests.includes(interest)
                      ? 'bg-gradient-to-r from-[#E7F3FF] to-[#F0F8FF] text-[#1877F2] border-2 border-[#1877F2] shadow-sm'
                      : 'bg-[#E7F3FF] text-[#212121] border border-[#90CAF9]/30 hover:border-[#1877F2]'
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
            className="mb-4 bg-white rounded-xl p-4 shadow-sm border border-[#90CAF9]/20"
          >
            <h2 className="text-base font-bold text-[#212121] mb-3">Personality</h2>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(personalityOptions).map(([key, options]) => (
                <div key={key}>
                  <label className="block text-xs text-[#757575] mb-1.5 capitalize">{key}</label>
                  <CustomDropdown
                    options={options}
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
            className="mb-4 bg-white rounded-xl p-4 shadow-sm border border-[#90CAF9]/20"
          >
            <h2 className="text-base font-bold text-[#212121] mb-3">Dealbreakers</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-[#757575] mb-1.5">Kids</label>
                <CustomDropdown
                  options={kidsOptions}
                  value={filters.dealbreakers.kids}
                  onChange={(value) => setFilters(prev => ({
                    ...prev,
                    dealbreakers: { ...prev.dealbreakers, kids: value }
                  }))}
                  placeholder="Any"
                />
              </div>
              <div>
                <label className="block text-xs text-[#757575] mb-1.5">Smoking</label>
                <CustomDropdown
                  options={smokingOptions}
                  value={filters.dealbreakers.smoking}
                  onChange={(value) => setFilters(prev => ({
                    ...prev,
                    dealbreakers: { ...prev.dealbreakers, smoking: value }
                  }))}
                  placeholder="Any"
                />
              </div>
              <div>
                <label className="block text-xs text-[#757575] mb-1.5">Pets</label>
                <CustomDropdown
                  options={petsOptions}
                  value={filters.dealbreakers.pets}
                  onChange={(value) => setFilters(prev => ({
                    ...prev,
                    dealbreakers: { ...prev.dealbreakers, pets: value }
                  }))}
                  placeholder="Any"
                />
              </div>
              <div>
                <label className="block text-xs text-[#757575] mb-1.5">Drinking</label>
                <CustomDropdown
                  options={drinkingOptions}
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
            className="mb-4 bg-white rounded-xl p-4 shadow-sm border border-[#90CAF9]/20"
          >
            <h2 className="text-base font-bold text-[#212121] mb-3">Additional Filters</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-[#757575] mb-1.5">Education</label>
                <CustomDropdown
                  options={educationOptions}
                  value={filters.optional.education}
                  onChange={(value) => setFilters(prev => ({
                    ...prev,
                    optional: { ...prev.optional, education: value }
                  }))}
                  placeholder="Any"
                />
              </div>
              <div>
                <label className="block text-xs text-[#757575] mb-1.5">Profession</label>
                <input
                  type="text"
                  value={filters.optional.profession || ''}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    optional: { ...prev.optional, profession: e.target.value }
                  }))}
                  placeholder="Any profession"
                  className="w-full px-3 py-2 bg-[#E7F3FF] border-2 border-[#90CAF9]/30 rounded-lg text-[#212121] font-semibold text-sm focus:outline-none focus:border-[#1877F2] transition-all"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t-2 border-[#90CAF9]/30 shadow-lg p-3">
        <div className="max-w-2xl mx-auto flex gap-2">
          <motion.button
            onClick={() => navigate('/discover')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 px-4 py-2.5 bg-white border-2 border-[#E0E0E0] text-[#212121] rounded-lg font-semibold text-sm hover:border-[#757575] transition-all"
          >
            Cancel
          </motion.button>
          <motion.button
            onClick={handleApply}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#1877F2] to-[#42A5F5] text-white rounded-lg font-semibold text-sm shadow-md hover:shadow-lg transition-all"
          >
            Apply Filters
          </motion.button>
        </div>
      </div>
    </div>
  );
}

