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
    <div className="min-h-screen bg-gradient-to-br from-[#FFF0F5] via-[#FFE4E1] to-[#FFF0F5] flex flex-col">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-[#FFB6C1]/30 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-[#FFE4E1] rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#212121]" />
          </button>
          <h1 className="text-xl font-bold text-[#212121]">Basic Information</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-xl p-6 sm:p-8"
          >
            <p className="text-[#757575] mb-6 text-center">
              Tell us a bit about yourself to get started
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-[#212121] mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF91A4] focus:border-transparent"
                  disabled={isLoading}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-[#212121] mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Date of Birth
                </label>
                <CustomDatePicker
                  value={formData.dob}
                  onChange={(date) => setFormData({ ...formData, dob: date })}
                  maxDate={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                />
                {errors.dob && <p className="text-red-500 text-sm mt-1">{errors.dob}</p>}
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-[#212121] mb-2">
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
                  <div className="mt-3">
                    <input
                      type="text"
                      value={formData.customGender}
                      onChange={(e) => setFormData({ ...formData, customGender: e.target.value })}
                      placeholder="Specify your gender"
                      className="w-full px-4 py-3 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF91A4] focus:border-transparent"
                    />
                  </div>
                )}
                {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
                {errors.customGender && <p className="text-red-500 text-sm mt-1">{errors.customGender}</p>}
              </div>

              {/* Sexual Orientation */}
              <div>
                <label className="block text-sm font-medium text-[#212121] mb-2">
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
                  <div className="mt-3">
                    <input
                      type="text"
                      value={formData.customOrientation}
                      onChange={(e) => setFormData({ ...formData, customOrientation: e.target.value })}
                      placeholder="Specify your orientation"
                      className="w-full px-4 py-3 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF91A4] focus:border-transparent"
                    />
                  </div>
                )}
                {errors.orientation && <p className="text-red-500 text-sm mt-1">{errors.orientation}</p>}
                {errors.customOrientation && <p className="text-red-500 text-sm mt-1">{errors.customOrientation}</p>}
              </div>

              {/* Looking For */}
              <div>
                <label className="block text-sm font-medium text-[#212121] mb-2">
                  <Heart className="w-4 h-4 inline mr-2" />
                  Looking For
                </label>
                <CustomDropdown
                  options={lookingForOptions}
                  value={formData.lookingFor}
                  onChange={(value) => setFormData({ ...formData, lookingFor: value })}
                  placeholder="Select who you're looking for"
                />
                {errors.lookingFor && <p className="text-red-500 text-sm mt-1">{errors.lookingFor}</p>}
              </div>

              {/* General Error */}
              {errors.general && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm">
                  {errors.general}
                </div>
              )}

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
                className="w-full bg-gradient-to-r from-[#FF91A4] to-[#FF69B4] hover:from-[#FF69B4] hover:to-[#FF91A4] text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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

