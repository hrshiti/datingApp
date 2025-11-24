import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Calendar, Users, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import CustomDatePicker from '../components/CustomDatePicker';
import CustomDropdown from '../components/CustomDropdown';
import { profileService } from '../services/profileService';

export default function BasicInfoPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    gender: '',
    customGender: '',
    orientation: '',
    customOrientation: '',
    lookingFor: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showCustomGender, setShowCustomGender] = useState(false);
  const [showCustomOrientation, setShowCustomOrientation] = useState(false);

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' }
  ];

  const orientationOptions = [
    { value: 'straight', label: 'Straight' },
    { value: 'gay', label: 'Gay' },
    { value: 'lesbian', label: 'Lesbian' },
    { value: 'bisexual', label: 'Bisexual' },
    { value: 'pansexual', label: 'Pansexual' },
    { value: 'asexual', label: 'Asexual' },
    { value: 'other', label: 'Other' }
  ];

  const lookingForOptions = [
    { value: 'men', label: 'Men' },
    { value: 'women', label: 'Women' },
    { value: 'everyone', label: 'Everyone' }
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name || formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.dob) {
      newErrors.dob = 'Date of birth is required';
    } else {
      const dob = new Date(formData.dob);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      if (age < 18) {
        newErrors.dob = 'You must be at least 18 years old';
      }
    }

    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    } else if (formData.gender === 'other' && !formData.customGender.trim()) {
      newErrors.customGender = 'Please specify your gender';
    }

    if (!formData.orientation) {
      newErrors.orientation = 'Sexual orientation is required';
    } else if (formData.orientation === 'other' && !formData.customOrientation.trim()) {
      newErrors.customOrientation = 'Please specify your orientation';
    }

    if (!formData.lookingFor) {
      newErrors.lookingFor = 'Please select who you are looking for';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const basicInfo = {
        name: formData.name.trim(),
        dob: formData.dob,
        gender: formData.gender,
        customGender: formData.customGender || '',
        orientation: formData.orientation,
        customOrientation: formData.customOrientation || '',
        lookingFor: Array.isArray(formData.lookingFor) ? formData.lookingFor : [formData.lookingFor]
      };

      const response = await profileService.saveBasicInfo(basicInfo);

      if (response.success) {
        // Navigate directly to people page after basic info
        console.log('✅ Basic info saved, navigating to people page');
        navigate('/people');
      } else {
        setErrors({ general: response.message || 'Failed to save basic information' });
      }
    } catch (error) {
      console.error('Error saving basic info:', error);
      setErrors({ general: error.message || 'Failed to save basic information. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] via-[#E8ECF1] to-[#F5F7FA] flex flex-col">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-lg border-b border-[#E8E8E8] px-3 sm:px-4 py-3 sm:py-4 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        <div className="max-w-2xl mx-auto flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-[#F5F5F5] rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-[#616161]" />
          </button>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-[#1A1A1A] tracking-tight">Basic Information</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl sm:rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] p-4 sm:p-6 md:p-8 border border-[#E8E8E8]"
          >
            <p className="text-xs sm:text-sm md:text-base text-[#616161] mb-4 sm:mb-6 text-center font-medium">
              Tell us a bit about yourself to get started
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6">
              {/* Name */}
              <div>
                <label className="block text-xs sm:text-sm md:text-base font-medium text-[#1A1A1A] mb-2 tracking-tight">
                  <User className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1.5 sm:mr-2 text-[#64B5F6]" />
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your name"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-[#E8E8E8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#64B5F6]/20 focus:border-[#64B5F6] text-sm sm:text-base text-[#1A1A1A] bg-white shadow-sm"
                  disabled={isLoading}
                />
                {errors.name && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.name}</p>}
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-xs sm:text-sm md:text-base font-medium text-[#1A1A1A] mb-2 tracking-tight">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1.5 sm:mr-2 text-[#64B5F6]" />
                  Date of Birth
                </label>
                <CustomDatePicker
                  value={formData.dob}
                  onChange={(date) => setFormData({ ...formData, dob: date })}
                  maxDate={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                />
                {errors.dob && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.dob}</p>}
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs sm:text-sm md:text-base font-medium text-[#1A1A1A] mb-2 tracking-tight">
                  Gender Identity
                </label>
                <CustomDropdown
                  options={genderOptions}
                  value={formData.gender}
                  onChange={(value) => {
                    setFormData({ ...formData, gender: value, customGender: '' });
                    setShowCustomGender(value === 'other');
                  }}
                  placeholder="Select gender"
                />
                {showCustomGender && (
                  <div className="mt-2 sm:mt-3">
                    <input
                      type="text"
                      value={formData.customGender}
                      onChange={(e) => setFormData({ ...formData, customGender: e.target.value })}
                      placeholder="Specify your gender"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-[#E8E8E8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#64B5F6]/20 focus:border-[#64B5F6] text-sm sm:text-base text-[#1A1A1A] bg-white shadow-sm"
                    />
                  </div>
                )}
                {errors.gender && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.gender}</p>}
                {errors.customGender && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.customGender}</p>}
              </div>

              {/* Sexual Orientation */}
              <div>
                <label className="block text-xs sm:text-sm md:text-base font-medium text-[#1A1A1A] mb-2 tracking-tight">
                  Sexual Orientation
                </label>
                <CustomDropdown
                  options={orientationOptions}
                  value={formData.orientation}
                  onChange={(value) => {
                    setFormData({ ...formData, orientation: value, customOrientation: '' });
                    setShowCustomOrientation(value === 'other');
                  }}
                  placeholder="Select orientation"
                />
                {showCustomOrientation && (
                  <div className="mt-2 sm:mt-3">
                    <input
                      type="text"
                      value={formData.customOrientation}
                      onChange={(e) => setFormData({ ...formData, customOrientation: e.target.value })}
                      placeholder="Specify your orientation"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-[#E8E8E8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#64B5F6]/20 focus:border-[#64B5F6] text-sm sm:text-base text-[#1A1A1A] bg-white shadow-sm"
                    />
                  </div>
                )}
                {errors.orientation && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.orientation}</p>}
                {errors.customOrientation && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.customOrientation}</p>}
              </div>

              {/* Looking For */}
              <div>
                <label className="block text-xs sm:text-sm md:text-base font-medium text-[#1A1A1A] mb-2 tracking-tight">
                  <Heart className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1.5 sm:mr-2 text-[#64B5F6]" />
                  Looking For
                </label>
                <CustomDropdown
                  options={lookingForOptions}
                  value={formData.lookingFor}
                  onChange={(value) => setFormData({ ...formData, lookingFor: value })}
                  placeholder="Select who you're looking for"
                />
                {errors.lookingFor && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.lookingFor}</p>}
              </div>

              {/* General Error */}
              {errors.general && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 sm:p-4 text-red-600 text-xs sm:text-sm">
                  {errors.general}
                </div>
              )}

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: isLoading ? 1 : 1.02, y: isLoading ? 0 : -2 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
                className="w-full bg-[#64B5F6] hover:bg-[#42A5F5] text-white font-semibold py-3 sm:py-4 rounded-xl sm:rounded-2xl shadow-[0_4px_16px_rgba(100,181,246,0.3)] hover:shadow-[0_8px_24px_rgba(100,181,246,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base md:text-lg"
              >
                {isLoading ? 'Saving...' : 'Continue'}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

