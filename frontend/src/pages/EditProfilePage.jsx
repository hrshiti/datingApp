import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, User, Mail, Phone, Edit2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function EditProfilePage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load user data from localStorage
    const onboardingData = localStorage.getItem('onboardingData');
    const authData = localStorage.getItem('authData'); // If stored during signup/login
    
    if (onboardingData) {
      try {
        const parsed = JSON.parse(onboardingData);
        if (parsed.step1) {
          setFormData({
            name: parsed.step1.name || '',
            email: parsed.step1.email || '',
            phone: parsed.step1.phone || parsed.step1.phoneNumber || ''
          });
        }
      } catch (e) {
        console.error('Error loading onboarding data:', e);
      }
    }
    
    // Also check authData if available
    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        if (parsed.phone) {
          setFormData(prev => ({ ...prev, phone: parsed.phone }));
        }
        if (parsed.email) {
          setFormData(prev => ({ ...prev, email: parsed.email }));
        }
      } catch (e) {
        console.error('Error loading auth data:', e);
      }
    }
  }, []);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    // Update onboarding data
    const onboardingData = localStorage.getItem('onboardingData');
    if (onboardingData) {
      try {
        const parsed = JSON.parse(onboardingData);
        parsed.step1 = {
          ...parsed.step1,
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.replace(/\D/g, ''),
          phoneNumber: formData.phone.replace(/\D/g, '')
        };
        localStorage.setItem('onboardingData', JSON.stringify(parsed));
      } catch (e) {
        console.error('Error updating onboarding data:', e);
      }
    }

    // Also update authData if exists
    const authData = localStorage.getItem('authData');
    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        parsed.phone = formData.phone.replace(/\D/g, '');
        parsed.email = formData.email.trim();
        localStorage.setItem('authData', JSON.stringify(parsed));
      } catch (e) {
        // If authData doesn't exist, create it
        localStorage.setItem('authData', JSON.stringify({
          phone: formData.phone.replace(/\D/g, ''),
          email: formData.email.trim()
        }));
      }
    } else {
      // Create new authData
      localStorage.setItem('authData', JSON.stringify({
        phone: formData.phone.replace(/\D/g, ''),
        email: formData.email.trim()
      }));
    }

    setTimeout(() => {
      setIsLoading(false);
      navigate('/profile');
    }, 500);
  };

  const handleEditAll = () => {
    // Navigate to onboarding page to edit everything
    // Set flags in localStorage to indicate we're coming from edit profile
    localStorage.setItem('editingOnboarding', 'true');
    localStorage.setItem('cameFromEditProfile', 'true');
    // Reset completed flag temporarily to allow editing
    const onboardingData = localStorage.getItem('onboardingData');
    if (onboardingData) {
      try {
        const parsed = JSON.parse(onboardingData);
        parsed.completed = false; // Temporarily set to false to allow editing
        parsed.currentStep = 1; // Start from step 1
        localStorage.setItem('onboardingData', JSON.stringify(parsed));
      } catch (e) {
        console.error('Error updating onboarding data:', e);
      }
    }
    navigate('/onboarding');
  };

  return (
    <div className="h-screen heart-background flex flex-col relative overflow-hidden">
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
        className="relative z-20 bg-white/95 backdrop-blur-md border-b-2 border-[#FFB6C1] shadow-sm"
      >
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <motion.button
              onClick={() => navigate('/profile')}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-1.5 hover:bg-[#FFE4E1] rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[#212121]" />
            </motion.button>
            <h1 className="text-xl font-bold text-[#212121]">Edit Profile</h1>
          </div>
        </div>
      </motion.div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto scrollbar-hide pb-24">
        <div className="max-w-2xl mx-auto px-4 py-6">
          {/* Personal Details Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6 mb-4"
          >
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-[#FF91A4] to-[#FF91A4] rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-[#212121]">Personal Details</h2>
            </div>

            <div className="space-y-4">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-semibold text-[#212121] mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <User className="w-5 h-5 text-[#757575]" />
                  </div>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your full name"
                    className={`w-full pl-12 pr-4 py-3 bg-[#FFE4E1] border-2 rounded-xl text-[#212121] placeholder-[#757575] focus:outline-none transition-all ${
                      errors.name ? 'border-[#FF91A4]' : 'border-[#FFB6C1]/30 focus:border-[#FF91A4]'
                    }`}
                  />
                </div>
                {errors.name && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-[#FF91A4] mt-1 ml-1"
                  >
                    {errors.name}
                  </motion.p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-semibold text-[#212121] mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <Mail className="w-5 h-5 text-[#757575]" />
                  </div>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      // Clear error when user starts typing
                      if (errors.email) {
                        setErrors(prev => ({ ...prev, email: '' }));
                      }
                    }}
                    onBlur={() => {
                      const emailValue = formData.email.trim();
                      if (!emailValue) {
                        setErrors(prev => ({ ...prev, email: 'Email is required' }));
                      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
                        setErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
                      }
                    }}
                    placeholder="Enter your email address"
                    className={`w-full pl-12 pr-4 py-3 bg-[#FFE4E1] border-2 rounded-xl text-[#212121] placeholder-[#757575] focus:outline-none transition-all ${
                      errors.email ? 'border-[#FF91A4]' : 'border-[#FFB6C1]/30 focus:border-[#FF91A4]'
                    }`}
                  />
                </div>
                {errors.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-[#FF91A4] mt-1 ml-1"
                  >
                    {errors.email}
                  </motion.p>
                )}
              </div>

              {/* Phone Field */}
              <div>
                <label className="block text-sm font-semibold text-[#212121] mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <Phone className="w-5 h-5 text-[#757575]" />
                  </div>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 10) {
                        setFormData({ ...formData, phone: value });
                        // Clear error when user starts typing
                        if (errors.phone) {
                          setErrors(prev => ({ ...prev, phone: '' }));
                        }
                      }
                    }}
                    onBlur={() => {
                      const phoneValue = formData.phone.replace(/\D/g, '');
                      if (!phoneValue) {
                        setErrors(prev => ({ ...prev, phone: 'Phone number is required' }));
                      } else if (phoneValue.length !== 10) {
                        setErrors(prev => ({ ...prev, phone: 'Please enter a valid 10-digit phone number' }));
                      }
                    }}
                    placeholder="Enter your 10-digit phone number"
                    maxLength={10}
                    className={`w-full pl-12 pr-4 py-3 bg-[#FFE4E1] border-2 rounded-xl text-[#212121] placeholder-[#757575] focus:outline-none transition-all ${
                      errors.phone ? 'border-[#FF91A4]' : 'border-[#FFB6C1]/30 focus:border-[#FF91A4]'
                    }`}
                  />
                </div>
                {errors.phone && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-[#FF91A4] mt-1 ml-1"
                  >
                    {errors.phone}
                  </motion.p>
                )}
              </div>
            </div>

            {/* Save Button */}
            <motion.button
              onClick={handleSave}
              disabled={isLoading}
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
              className={`w-full mt-6 py-3 rounded-xl font-semibold text-white shadow-md transition-all ${
                isLoading
                  ? 'bg-[#E0E0E0] cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#FF91A4] to-[#FF91A4] hover:shadow-lg'
              }`}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </motion.button>
          </motion.div>

          {/* Edit All Details Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#FF91A4] to-[#FF91A4] rounded-full flex items-center justify-center">
                <Edit2 className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-[#212121]">Edit All Details</h2>
            </div>

            <p className="text-sm text-[#757575] mb-6">
              Want to update your interests, personality, preferences, or other details? You can go back to the onboarding process and edit everything again.
            </p>

            <motion.button
              onClick={handleEditAll}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 bg-white border-2 border-[#FF91A4] text-[#FF91A4] rounded-xl font-semibold shadow-md hover:bg-[#FFE4E1] transition-all"
            >
              Edit All Details
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

