import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Camera, Upload, User, Sparkles, ChevronLeft, ChevronRight, MapPin, UserCircle, Heart, Smile, Calendar, Sun, Moon, Zap, MessageSquare, Coffee, Baby, Cigarette, Dog, GlassWater, GraduationCap, Briefcase, Languages, ShoppingBag, Plane, Mic, Dumbbell, ChefHat, Activity, Palette, Mountain, Music, Wine, Gamepad2, Waves, Users, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PhotoUpload from '../components/PhotoUpload';
import CustomDropdown from '../components/CustomDropdown';
import CustomDatePicker from '../components/CustomDatePicker';

export default function EditProfileInfoPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [photos, setPhotos] = useState([]);
  const [bio, setBio] = useState('');
  const [activeTab, setActiveTab] = useState('edit'); // 'edit' or 'preview'
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  
  // Onboarding fields state
  const [formData, setFormData] = useState({
    // Step 1
    name: '',
    email: '',
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
    }
  });
  
  const [showCustomGender, setShowCustomGender] = useState(false);
  const [showCustomOrientation, setShowCustomOrientation] = useState(false);

  const maxBioLength = 200;
  const minPhotos = 1;
  const maxPhotos = 6;
  
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
  
  const getMaxDate = () => {
    const today = new Date();
    const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    return maxDate.toISOString().split('T')[0];
  };

  useEffect(() => {
    // Check if coming from profile photo click with preview tab state
    if (location.state?.activeTab === 'preview') {
      setActiveTab('preview');
    }

    // Load existing profile setup data
    const savedData = localStorage.getItem('profileSetup');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setPhotos(parsed.photos || []);
        setBio(parsed.bio || '');
      } catch (e) {
        console.error('Error loading saved data:', e);
      }
    }

    // Load all onboarding data
    const onboardingData = localStorage.getItem('onboardingData');
    if (onboardingData) {
      try {
        const parsed = JSON.parse(onboardingData);
        // Handle backward compatibility: if lookingFor is an array, take first item
        let lookingFor = parsed.step1?.lookingFor || '';
        if (Array.isArray(lookingFor) && lookingFor.length > 0) {
          lookingFor = lookingFor[0];
        }
        
        setFormData({
          ...parsed.step1,
          lookingFor: lookingFor,
          ...parsed.step2,
          ...parsed.step3,
          personality: parsed.step4?.personality || formData.personality,
          dealbreakers: parsed.step5?.dealbreakers || formData.dealbreakers,
          prompts: parsed.step6?.prompts || [],
          optional: parsed.step7?.optional || formData.optional
        });
        
        if (parsed.step1?.gender === 'other') {
          setShowCustomGender(true);
        }
        if (parsed.step1?.orientation === 'other') {
          setShowCustomOrientation(true);
        }
      } catch (e) {
        console.error('Error loading onboarding data:', e);
      }
    }
  }, [location.state]);

  // Reset photo index when tab changes to preview
  useEffect(() => {
    if (activeTab === 'preview' && photos.length > 0) {
      setCurrentPhotoIndex(0);
    }
  }, [activeTab, photos.length]);

  const handleChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleGenderChange = (value) => {
    handleChange('gender', value);
    setShowCustomGender(value === 'other');
    if (value !== 'other') {
      handleChange('customGender', '');
    }
  };

  const handleOrientationChange = (value) => {
    handleChange('orientation', value);
    setShowCustomOrientation(value === 'other');
    if (value !== 'other') {
      handleChange('customOrientation', '');
    }
  };

  const handleSave = async () => {
    try {
      // Convert photos to base64 for storage
      const photosData = await Promise.all(
        photos.map(async (photo) => {
          if (photo.file) {
            return new Promise((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                resolve({
                  id: photo.id,
                  preview: reader.result,
                  fileName: photo.file.name,
                });
              };
              reader.readAsDataURL(photo.file);
            });
          } else {
            return {
              id: photo.id,
              preview: photo.preview,
              fileName: photo.fileName || 'photo.jpg',
            };
          }
        })
      );

      // Save profile setup data
      const profileData = {
        photos: photosData,
        bio: bio.trim(),
        completedAt: new Date().toISOString(),
      };
      localStorage.setItem('profileSetup', JSON.stringify(profileData));

      // Save onboarding data
      const existingOnboarding = JSON.parse(localStorage.getItem('onboardingData') || '{}');
      const updatedOnboarding = {
        ...existingOnboarding,
        step1: {
          name: formData.name,
          email: formData.email,
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
        completed: existingOnboarding.completed || false,
        currentStep: existingOnboarding.currentStep || 7
      };
      localStorage.setItem('onboardingData', JSON.stringify(updatedOnboarding));

      navigate('/profile');
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };
  
  const availableInterests = [
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
  ];
  
  const age = formData.dob ? calculateAge(formData.dob) : null;


  return (
    <div className="h-screen heart-background flex flex-col overflow-hidden relative">
      <span className="heart-decoration">💕</span>
      <span className="heart-decoration">💖</span>
      <span className="heart-decoration">💗</span>
      <span className="heart-decoration">💝</span>
      <span className="heart-decoration">❤️</span>
      <span className="heart-decoration">💓</span>
      <div className="decoration-circle"></div>
      <div className="decoration-circle"></div>
      
      <div className="w-full h-full relative z-10 flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-white to-[#FFF0F5] h-full w-full md:max-w-4xl md:mx-auto flex flex-col p-4 sm:p-6 md:p-6 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#FF91A4]/5 to-transparent pointer-events-none"></div>
          
          {/* Header */}
          <div className="mb-6 sm:mb-8 relative z-10 flex-shrink-0">
            <motion.button
              onClick={() => navigate('/profile')}
              whileHover={{ scale: 1.05, x: -2 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center text-[#757575] hover:text-[#212121] mb-4 sm:mb-5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              <span className="text-sm sm:text-base font-medium">Back</span>
            </motion.button>
            <div className="flex items-center gap-3 mb-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#FF91A4] to-[#FF69B4] bg-clip-text text-transparent">
                  Edit Info
                </h1>
              </div>
            </div>
            
            {/* Tabs */}
            <div className="flex gap-2 mb-4">
              <motion.button
                onClick={() => setActiveTab('edit')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm sm:text-base transition-all ${
                  activeTab === 'edit'
                    ? 'bg-gradient-to-r from-[#FF91A4] to-[#FF69B4] text-white shadow-lg'
                    : 'bg-white text-[#757575] border-2 border-[#FFB6C1] hover:border-[#FF91A4]'
                }`}
              >
                Edit
              </motion.button>
              <motion.button
                onClick={() => setActiveTab('preview')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm sm:text-base transition-all ${
                  activeTab === 'preview'
                    ? 'bg-gradient-to-r from-[#FF91A4] to-[#FF69B4] text-white shadow-lg'
                    : 'bg-white text-[#757575] border-2 border-[#FFB6C1] hover:border-[#FF91A4]'
                }`}
              >
                Preview
              </motion.button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'edit' ? (
              <motion.div
                key="edit"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6 sm:space-y-8 md:space-y-6 flex-1 overflow-y-auto pr-2 relative z-10 min-h-0"
              >
                {/* Section 1: Photo Upload */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gradient-to-br from-white to-[#FFF0F5] rounded-xl sm:rounded-2xl p-5 sm:p-6 border-2 border-[#FFB6C1] shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#FF91A4] to-[#FF69B4] rounded-xl flex items-center justify-center shadow-md">
                      <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div>
                      <label className="block text-sm sm:text-base font-bold text-[#212121]">
                        Upload Your Photos <span className="text-[#FF91A4]">*</span>
                      </label>
                      <p className="text-xs sm:text-sm text-[#757575] mt-1">
                        Add photos to show others who you are
                      </p>
                    </div>
                  </div>
                  <PhotoUpload
                    photos={photos}
                    onChange={setPhotos}
                    maxPhotos={maxPhotos}
                    minPhotos={minPhotos}
                  />
                  {photos.length > 0 && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs sm:text-sm text-[#757575] mt-3"
                    >
                      ✓ {photos.length} photo{photos.length > 1 ? 's' : ''} uploaded
                    </motion.p>
                  )}
                </motion.div>

                {/* Section 2: Bio */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-br from-white to-[#FFF0F5] rounded-xl sm:rounded-2xl p-5 sm:p-6 border-2 border-[#FFB6C1] shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#FF91A4] to-[#FF69B4] rounded-xl flex items-center justify-center shadow-md">
                      <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div>
                      <label className="block text-sm sm:text-base font-bold text-[#212121]">
                        Write Your Bio <span className="text-[#757575] text-xs font-normal">(Optional)</span>
                      </label>
                      <p className="text-xs sm:text-sm text-[#757575] mt-1">
                        Tell others about yourself, your interests, and what you're looking for
                      </p>
                    </div>
                  </div>
                  <textarea
                    value={bio}
                    onChange={(e) => {
                      if (e.target.value.length <= maxBioLength) {
                        setBio(e.target.value);
                      }
                    }}
                    placeholder="Tell others about yourself..."
                    rows={5}
                    className="w-full px-4 py-3 border-2 border-[#FFB6C1] rounded-xl sm:rounded-2xl text-sm sm:text-base text-[#212121] bg-white focus:outline-none focus:ring-2 focus:ring-[#FF91A4] focus:ring-opacity-20 focus:border-[#FF91A4] transition-all resize-none shadow-sm hover:shadow-md"
                  />
                  <div className="flex justify-between items-center mt-3">
                    <p className={`text-xs sm:text-sm font-medium ${
                      bio.length > maxBioLength * 0.9 
                        ? 'text-[#FF91A4]' 
                        : 'text-[#757575]'
                    }`}>
                      {bio.length}/{maxBioLength} characters
                    </p>
                    {bio.length > 0 && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-xs text-[#FF91A4] font-medium"
                      >
                        ✓ Bio added
                      </motion.span>
                    )}
                  </div>
                </motion.div>

                {/* Section 3: Basic Information (Step 1) */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gradient-to-br from-white to-[#FFF0F5] rounded-xl sm:rounded-2xl p-5 sm:p-6 border-2 border-[#FFB6C1] shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#FF91A4] to-[#FF69B4] rounded-xl flex items-center justify-center shadow-md">
                      <UserCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <label className="block text-sm sm:text-base font-bold text-[#212121]">
                      Basic Information
                    </label>
                  </div>
                  
                  {/* Name */}
                  <div className="mb-4">
                    <label className="block text-xs sm:text-sm font-medium text-[#212121] mb-1.5">
                      Name <span className="text-[#FF91A4]">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-[#FFB6C1] rounded-xl text-sm text-[#212121] focus:border-[#FF91A4] focus:outline-none focus:ring-2 focus:ring-[#FF91A4] focus:ring-opacity-20 transition-all shadow-sm"
                    />
                  </div>

                  {/* Email */}
                  <div className="mb-4">
                    <label className="block text-xs sm:text-sm font-medium text-[#212121] mb-1.5">
                      Email <span className="text-[#FF91A4]">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="Enter your email address"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-[#FFB6C1] rounded-xl text-sm text-[#212121] focus:border-[#FF91A4] focus:outline-none focus:ring-2 focus:ring-[#FF91A4] focus:ring-opacity-20 transition-all shadow-sm"
                    />
                  </div>

                  {/* Date of Birth */}
                  <div className="mb-4">
                    <label className="block text-xs sm:text-sm font-medium text-[#212121] mb-1.5">
                      Age / Date of Birth <span className="text-[#FF91A4]">*</span>
                    </label>
                    <CustomDatePicker
                      value={formData.dob}
                      onChange={(value) => handleChange('dob', value)}
                      maxDate={getMaxDate()}
                    />
                    {age !== null && age >= 18 && (
                      <p className="text-xs text-[#757575] mt-1">Age: {age} years</p>
                    )}
                  </div>

                  {/* Gender */}
                  <div className="mb-4">
                    <label className="block text-xs sm:text-sm font-medium text-[#212121] mb-1.5">
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
                    />
                    {showCustomGender && (
                      <motion.input
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        type="text"
                        value={formData.customGender}
                        onChange={(e) => handleChange('customGender', e.target.value)}
                        placeholder="Please specify your gender"
                        className="w-full mt-2 px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-[#FFB6C1] rounded-xl text-sm text-[#212121] focus:border-[#FF91A4] focus:outline-none focus:ring-2 focus:ring-[#FF91A4] focus:ring-opacity-20 transition-all shadow-sm"
                      />
                    )}
                  </div>

                  {/* Orientation */}
                  <div className="mb-4">
                    <label className="block text-xs sm:text-sm font-medium text-[#212121] mb-1.5">
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
                    />
                    {showCustomOrientation && (
                      <motion.input
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        type="text"
                        value={formData.customOrientation}
                        onChange={(e) => handleChange('customOrientation', e.target.value)}
                        placeholder="Please specify your orientation"
                        className="w-full mt-2 px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-[#FFB6C1] rounded-xl text-sm text-[#212121] focus:border-[#FF91A4] focus:outline-none focus:ring-2 focus:ring-[#FF91A4] focus:ring-opacity-20 transition-all shadow-sm"
                      />
                    )}
                  </div>

                  {/* Looking For */}
                  <div className="mb-4">
                    <label className="block text-xs sm:text-sm font-medium text-[#212121] mb-1.5">
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
                      onChange={(value) => handleChange('lookingFor', value)}
                      placeholder="Select what you are looking for"
                    />
                  </div>
                </motion.div>

                {/* Section 4: Location & Preferences (Step 2) */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-gradient-to-br from-white to-[#FFF0F5] rounded-xl sm:rounded-2xl p-5 sm:p-6 border-2 border-[#FFB6C1] shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#FF91A4] to-[#FF69B4] rounded-xl flex items-center justify-center shadow-md">
                      <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <label className="block text-sm sm:text-base font-bold text-[#212121]">
                      Location & Preferences
                    </label>
                  </div>
                  
                  {/* City */}
                  <div className="mb-4">
                    <label className="block text-xs sm:text-sm font-medium text-[#212121] mb-1.5">
                      City <span className="text-[#FF91A4]">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleChange('city', e.target.value)}
                      placeholder="Enter your city"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-[#FFB6C1] rounded-xl text-sm text-[#212121] focus:border-[#FF91A4] focus:outline-none focus:ring-2 focus:ring-[#FF91A4] focus:ring-opacity-20 transition-all shadow-sm"
                    />
                  </div>

                  {/* Age Range */}
                  <div className="mb-4">
                    <label className="block text-xs sm:text-sm font-medium text-[#212121] mb-1.5">
                      Age Range Preference
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <input
                          type="number"
                          min="18"
                          value={formData.ageRange.min}
                          onChange={(e) => handleChange('ageRange', { ...formData.ageRange, min: parseInt(e.target.value) || 18 })}
                          placeholder="Min"
                          className="w-full px-3 py-2.5 border-2 border-[#FFB6C1] rounded-xl text-sm text-[#212121] focus:border-[#FF91A4] focus:outline-none focus:ring-2 focus:ring-[#FF91A4] focus:ring-opacity-20 transition-all shadow-sm"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          min="18"
                          value={formData.ageRange.max}
                          onChange={(e) => handleChange('ageRange', { ...formData.ageRange, max: e.target.value ? parseInt(e.target.value) : '' })}
                          placeholder="Max"
                          className="w-full px-3 py-2.5 border-2 border-[#FFB6C1] rounded-xl text-sm text-[#212121] focus:border-[#FF91A4] focus:outline-none focus:ring-2 focus:ring-[#FF91A4] focus:ring-opacity-20 transition-all shadow-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Distance Preference */}
                  <div className="mb-4">
                    <label className="block text-xs sm:text-sm font-medium text-[#212121] mb-1.5">
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
                        className="distance-slider w-full h-2 sm:h-3 bg-[#E0E0E0] rounded-lg appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, 
                            #FF91A4 0%, 
                            #FF69B4 ${((formData.distancePref - 5) / (100 - 5)) * 100}%, 
                            #E0E0E0 ${((formData.distancePref - 5) / (100 - 5)) * 100}%, 
                            #E0E0E0 100%)`
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm text-[#757575] mt-1.5">
                      <span>5 km</span>
                      <span className="font-semibold text-[#FF91A4]">{formData.distancePref} km</span>
                      <span>100 km</span>
                    </div>
                  </div>
                </motion.div>

                {/* Section 5: Interests (Step 3) */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-gradient-to-br from-white to-[#FFF0F5] rounded-xl sm:rounded-2xl p-5 sm:p-6 border-2 border-[#FFB6C1] shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#FF91A4] to-[#FF69B4] rounded-xl flex items-center justify-center shadow-md">
                      <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <label className="block text-sm sm:text-base font-bold text-[#212121]">
                      Your Interests
                    </label>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[40vh] overflow-y-auto pr-2">
                    {availableInterests.map((interest, idx) => {
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
                          className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl transition-all border-2 ${
                            isSelected
                              ? 'bg-gradient-to-br from-[#FF91A4] to-[#FF69B4] text-white border-[#FF91A4] shadow-md'
                              : 'bg-white text-[#212121] border-[#FFB6C1] hover:border-[#FF91A4]'
                          }`}
                        >
                          <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${isSelected ? 'text-white' : 'text-[#212121]'}`} />
                          <span className="text-xs sm:text-sm font-medium text-center">{interest.name}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>

                {/* Section 6: Personality Traits (Step 4) */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-gradient-to-br from-white to-[#FFF0F5] rounded-xl sm:rounded-2xl p-5 sm:p-6 border-2 border-[#FFB6C1] shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#FF91A4] to-[#FF69B4] rounded-xl flex items-center justify-center shadow-md">
                      <Smile className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <label className="block text-sm sm:text-base font-bold text-[#212121]">
                      Personality Traits
                    </label>
                  </div>
                  
                  <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
                    {/* Social vs Introvert */}
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-[#212121] mb-2">
                        Social Style
                      </label>
                      <div className="grid grid-cols-2 gap-3">
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
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className={`px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all flex flex-col items-center gap-2 ${
                                isSelected
                                  ? 'bg-gradient-to-br from-[#FF91A4] to-[#FF69B4] text-white border-[#FF91A4] shadow-md'
                                  : 'bg-white text-[#212121] border-[#FFB6C1] hover:border-[#FF91A4]'
                              }`}
                            >
                              <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-[#FF91A4]'}`} />
                              <span>{option.label}</span>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Planner vs Spontaneous */}
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-[#212121] mb-2">
                        Planning Style
                      </label>
                      <div className="grid grid-cols-2 gap-3">
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
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className={`px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all flex flex-col items-center gap-2 ${
                                isSelected
                                  ? 'bg-gradient-to-br from-[#FF91A4] to-[#FF69B4] text-white border-[#FF91A4] shadow-md'
                                  : 'bg-white text-[#212121] border-[#FFB6C1] hover:border-[#FF91A4]'
                              }`}
                            >
                              <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-[#FF91A4]'}`} />
                              <span>{option.label}</span>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Romantic vs Practical */}
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-[#212121] mb-2">
                        Approach
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { value: 'romantic', label: 'Romantic', icon: Heart },
                          { value: 'practical', label: 'Practical', icon: Briefcase }
                        ].map((option) => {
                          const Icon = option.icon;
                          const isSelected = formData.personality.romantic === option.value;
                          return (
                            <motion.button
                              key={option.value}
                              type="button"
                              onClick={() => handleChange('personality', { ...formData.personality, romantic: option.value })}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className={`px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all flex flex-col items-center gap-2 ${
                                isSelected
                                  ? 'bg-gradient-to-br from-[#FF91A4] to-[#FF69B4] text-white border-[#FF91A4] shadow-md'
                                  : 'bg-white text-[#212121] border-[#FFB6C1] hover:border-[#FF91A4]'
                              }`}
                            >
                              <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-[#FF91A4]'}`} />
                              <span>{option.label}</span>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Morning vs Night */}
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-[#212121] mb-2">
                        Energy Time
                      </label>
                      <div className="grid grid-cols-2 gap-3">
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
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className={`px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all flex flex-col items-center gap-2 ${
                                isSelected
                                  ? 'bg-gradient-to-br from-[#FF91A4] to-[#FF69B4] text-white border-[#FF91A4] shadow-md'
                                  : 'bg-white text-[#212121] border-[#FFB6C1] hover:border-[#FF91A4]'
                              }`}
                            >
                              <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-[#FF91A4]'}`} />
                              <span>{option.label}</span>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Homebody vs Adventurous */}
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-[#212121] mb-2">
                        Lifestyle
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { value: 'homebody', label: 'Homebody', icon: Home },
                          { value: 'adventurous', label: 'Adventurous', icon: Plane }
                        ].map((option) => {
                          const Icon = option.icon;
                          const isSelected = formData.personality.homebody === option.value;
                          return (
                            <motion.button
                              key={option.value}
                              type="button"
                              onClick={() => handleChange('personality', { ...formData.personality, homebody: option.value })}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className={`px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all flex flex-col items-center gap-2 ${
                                isSelected
                                  ? 'bg-gradient-to-br from-[#FF91A4] to-[#FF69B4] text-white border-[#FF91A4] shadow-md'
                                  : 'bg-white text-[#212121] border-[#FFB6C1] hover:border-[#FF91A4]'
                              }`}
                            >
                              <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-[#FF91A4]'}`} />
                              <span>{option.label}</span>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Serious vs Fun */}
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-[#212121] mb-2">
                        Approach to Dating
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { value: 'serious', label: 'Serious', icon: Heart },
                          { value: 'fun', label: 'Fun', icon: Smile }
                        ].map((option) => {
                          const Icon = option.icon;
                          const isSelected = formData.personality.serious === option.value;
                          return (
                            <motion.button
                              key={option.value}
                              type="button"
                              onClick={() => handleChange('personality', { ...formData.personality, serious: option.value })}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className={`px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all flex flex-col items-center gap-2 ${
                                isSelected
                                  ? 'bg-gradient-to-br from-[#FF91A4] to-[#FF69B4] text-white border-[#FF91A4] shadow-md'
                                  : 'bg-white text-[#212121] border-[#FFB6C1] hover:border-[#FF91A4]'
                              }`}
                            >
                              <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-[#FF91A4]'}`} />
                              <span>{option.label}</span>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Decision Maker vs Go with Flow */}
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-[#212121] mb-2">
                        Decision Style
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { value: 'decision-maker', label: 'Decision Maker', icon: Zap },
                          { value: 'go-with-flow', label: 'Go with Flow', icon: Waves }
                        ].map((option) => {
                          const Icon = option.icon;
                          const isSelected = formData.personality.decision === option.value;
                          return (
                            <motion.button
                              key={option.value}
                              type="button"
                              onClick={() => handleChange('personality', { ...formData.personality, decision: option.value })}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className={`px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all flex flex-col items-center gap-2 ${
                                isSelected
                                  ? 'bg-gradient-to-br from-[#FF91A4] to-[#FF69B4] text-white border-[#FF91A4] shadow-md'
                                  : 'bg-white text-[#212121] border-[#FFB6C1] hover:border-[#FF91A4]'
                              }`}
                            >
                              <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-[#FF91A4]'}`} />
                              <span>{option.label}</span>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Direct vs Subtle Communication */}
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-[#212121] mb-2">
                        Communication Style
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { value: 'direct', label: 'Direct', icon: MessageSquare },
                          { value: 'subtle', label: 'Subtle', icon: Coffee }
                        ].map((option) => {
                          const Icon = option.icon;
                          const isSelected = formData.personality.communication === option.value;
                          return (
                            <motion.button
                              key={option.value}
                              type="button"
                              onClick={() => handleChange('personality', { ...formData.personality, communication: option.value })}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className={`px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all flex flex-col items-center gap-2 ${
                                isSelected
                                  ? 'bg-gradient-to-br from-[#FF91A4] to-[#FF69B4] text-white border-[#FF91A4] shadow-md'
                                  : 'bg-white text-[#212121] border-[#FFB6C1] hover:border-[#FF91A4]'
                              }`}
                            >
                              <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-[#FF91A4]'}`} />
                              <span>{option.label}</span>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Section 7: Dealbreakers (Step 5) */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="bg-gradient-to-br from-white to-[#FFF0F5] rounded-xl sm:rounded-2xl p-5 sm:p-6 border-2 border-[#FFB6C1] shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#FF91A4] to-[#FF69B4] rounded-xl flex items-center justify-center shadow-md">
                      <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <label className="block text-sm sm:text-base font-bold text-[#212121]">
                      Dealbreakers
                    </label>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Kids */}
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-[#212121] mb-2">
                        Kids
                      </label>
                      <CustomDropdown
                        options={[
                          { value: '', label: 'Select preference' },
                          { value: 'want', label: 'Want' },
                          { value: 'dont-want', label: "Don't Want" },
                          { value: 'have', label: 'Have' },
                          { value: 'open', label: 'Open' }
                        ]}
                        value={formData.dealbreakers.kids}
                        onChange={(value) => handleChange('dealbreakers.kids', value)}
                        placeholder="Select preference"
                      />
                    </div>

                    {/* Smoking */}
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-[#212121] mb-2">
                        Smoking
                      </label>
                      <CustomDropdown
                        options={[
                          { value: '', label: 'Select preference' },
                          { value: 'yes', label: 'Yes' },
                          { value: 'no', label: 'No' },
                          { value: 'sometimes', label: 'Sometimes' }
                        ]}
                        value={formData.dealbreakers.smoking}
                        onChange={(value) => handleChange('dealbreakers.smoking', value)}
                        placeholder="Select preference"
                      />
                    </div>

                    {/* Pets */}
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-[#212121] mb-2">
                        Pets
                      </label>
                      <CustomDropdown
                        options={[
                          { value: '', label: 'Select preference' },
                          { value: 'love', label: 'Love' },
                          { value: 'allergic', label: 'Allergic' },
                          { value: 'have', label: 'Have' },
                          { value: 'dont-like', label: "Don't Like" }
                        ]}
                        value={formData.dealbreakers.pets}
                        onChange={(value) => handleChange('dealbreakers.pets', value)}
                        placeholder="Select preference"
                      />
                    </div>

                    {/* Drinking */}
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-[#212121] mb-2">
                        Drinking
                      </label>
                      <CustomDropdown
                        options={[
                          { value: '', label: 'Select preference' },
                          { value: 'yes', label: 'Yes' },
                          { value: 'no', label: 'No' },
                          { value: 'sometimes', label: 'Sometimes' }
                        ]}
                        value={formData.dealbreakers.drinking}
                        onChange={(value) => handleChange('dealbreakers.drinking', value)}
                        placeholder="Select preference"
                      />
                    </div>

                    {/* Religion */}
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-[#212121] mb-2">
                        Religion
                      </label>
                      <input
                        type="text"
                        value={formData.dealbreakers.religion}
                        onChange={(e) => handleChange('dealbreakers.religion', e.target.value)}
                        placeholder="Enter religion (optional)"
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-[#FFB6C1] rounded-xl text-sm text-[#212121] focus:border-[#FF91A4] focus:outline-none focus:ring-2 focus:ring-[#FF91A4] focus:ring-opacity-20 transition-all shadow-sm"
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Section 8: Prompts (Step 6) */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="bg-gradient-to-br from-white to-[#FFF0F5] rounded-xl sm:rounded-2xl p-5 sm:p-6 border-2 border-[#FFB6C1] shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#FF91A4] to-[#FF69B4] rounded-xl flex items-center justify-center shadow-md">
                      <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <label className="block text-sm sm:text-base font-bold text-[#212121]">
                      Prompts
                    </label>
                  </div>
                  
                  <p className="text-xs sm:text-sm text-[#757575] mb-4">
                    Select at least 3 prompts and answer them to help others know you better
                  </p>

                  <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
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
                          transition={{ delay: idx * 0.02 }}
                          className="mb-3"
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
                            }}
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${
                              isSelected
                                ? 'bg-gradient-to-br from-[#FF91A4] to-[#FF69B4] text-white border-[#FF91A4] shadow-md'
                                : 'bg-white text-[#212121] border-[#FFB6C1] hover:border-[#FF91A4]'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                isSelected ? 'border-white' : 'border-[#FF91A4]'
                              }`}>
                                {isSelected && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-3 h-3 bg-white rounded-full"
                                  />
                                )}
                              </div>
                              <span className="text-sm font-medium">{promptText}</span>
                            </div>
                          </motion.button>
                          
                          {isSelected && selectedPrompt && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="mt-2"
                            >
                              <textarea
                                value={selectedPrompt.answer}
                                onChange={(e) => {
                                  const updatedPrompts = formData.prompts.map(p =>
                                    p.prompt === promptText ? { ...p, answer: e.target.value } : p
                                  );
                                  handleChange('prompts', updatedPrompts);
                                }}
                                placeholder="Type your answer here..."
                                rows={3}
                                className="w-full px-4 py-3 border-2 border-[#FFB6C1] rounded-xl text-sm text-[#212121] focus:border-[#FF91A4] focus:outline-none focus:ring-2 focus:ring-[#FF91A4] focus:ring-opacity-20 transition-all resize-none shadow-sm"
                              />
                            </motion.div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                  
                  {formData.prompts && formData.prompts.length > 0 && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`text-xs sm:text-sm mt-3 font-medium ${
                        formData.prompts.length >= 3 ? 'text-[#FF91A4]' : 'text-[#757575]'
                      }`}
                    >
                      {formData.prompts.length >= 3 ? '✓ ' : ''}
                      {formData.prompts.length} of 3+ prompts selected
                    </motion.p>
                  )}
                </motion.div>

                {/* Section 9: Optional Info (Step 7) */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="bg-gradient-to-br from-white to-[#FFF0F5] rounded-xl sm:rounded-2xl p-5 sm:p-6 border-2 border-[#FFB6C1] shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#FF91A4] to-[#FF69B4] rounded-xl flex items-center justify-center shadow-md">
                      <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <label className="block text-sm sm:text-base font-bold text-[#212121]">
                      Additional Information
                    </label>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Education */}
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-[#212121] mb-2">
                        Education
                      </label>
                      <CustomDropdown
                        options={[
                          { value: '', label: 'Select education' },
                          { value: 'high-school', label: 'High school' },
                          { value: 'bachelors', label: "Bachelor's" },
                          { value: 'masters', label: "Master's" },
                          { value: 'phd', label: 'PhD' },
                          { value: 'other', label: 'Other' }
                        ]}
                        value={formData.optional.education}
                        onChange={(value) => handleChange('optional.education', value)}
                        placeholder="Select education"
                      />
                    </div>

                    {/* Profession */}
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-[#212121] mb-2">
                        Profession
                      </label>
                      <input
                        type="text"
                        value={formData.optional.profession}
                        onChange={(e) => handleChange('optional.profession', e.target.value)}
                        placeholder="Enter your profession"
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-[#FFB6C1] rounded-xl text-sm text-[#212121] focus:border-[#FF91A4] focus:outline-none focus:ring-2 focus:ring-[#FF91A4] focus:ring-opacity-20 transition-all shadow-sm"
                      />
                    </div>

                    {/* Languages */}
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-[#212121] mb-2">
                        Languages
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {['English', 'Hindi', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Arabic'].map((lang) => {
                          const isSelected = formData.optional.languages.includes(lang);
                          return (
                            <motion.button
                              key={lang}
                              type="button"
                              onClick={() => {
                                const current = formData.optional.languages;
                                if (current.includes(lang)) {
                                  handleChange('optional.languages', current.filter(l => l !== lang));
                                } else {
                                  handleChange('optional.languages', [...current, lang]);
                                }
                              }}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all border-2 ${
                                isSelected
                                  ? 'bg-gradient-to-br from-[#FF91A4] to-[#FF69B4] text-white border-[#FF91A4] shadow-md'
                                  : 'bg-white text-[#212121] border-[#FFB6C1] hover:border-[#FF91A4]'
                              }`}
                            >
                              {lang}
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Horoscope */}
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-[#212121] mb-2">
                        Horoscope Sign
                      </label>
                      <CustomDropdown
                        options={[
                          { value: '', label: 'Select horoscope' },
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
                          { value: 'pisces', label: 'Pisces' }
                        ]}
                        value={formData.optional.horoscope}
                        onChange={(value) => handleChange('optional.horoscope', value)}
                        placeholder="Select horoscope"
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Section 10: Save Button */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0 }}
                  className="pt-4 sm:pt-6 border-t border-[#FFB6C1] relative z-10 flex-shrink-0"
                >
                  <motion.button
                    onClick={handleSave}
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-[#FF91A4] to-[#FF69B4] hover:from-[#FF69B4] hover:to-[#FF91A4] text-white font-semibold py-3 sm:py-4 rounded-xl sm:rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    <span className="text-sm sm:text-base">Save Changes</span>
                  </motion.button>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="preview"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex-1 overflow-y-auto pr-2 relative z-10 min-h-0 flex items-center justify-center p-4"
              >
                {/* Preview Section - Instagram Stories Style */}
                {photos.length > 0 ? (
                  <div className="w-full max-w-sm md:max-w-md mx-auto">
                    {/* Photo Progress Indicators */}
                    <div className="flex gap-1 mb-3 px-2">
                      {photos.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentPhotoIndex(index)}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            index === currentPhotoIndex
                              ? 'bg-gradient-to-r from-[#FF91A4] to-[#FF69B4]'
                              : index < currentPhotoIndex
                              ? 'bg-[#FF91A4]'
                              : 'bg-[#FFB6C1]/30'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Photo Display Area */}
                    <div className="relative w-full aspect-[9/16] max-h-[80vh] rounded-2xl overflow-hidden shadow-xl border-2 border-[#FFB6C1] bg-black">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={currentPhotoIndex}
                          initial={{ opacity: 0, x: 100 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -100 }}
                          transition={{ duration: 0.3 }}
                          className="absolute inset-0 w-full h-full"
                        >
                          <img
                            src={photos[currentPhotoIndex]?.preview}
                            alt={`Photo ${currentPhotoIndex + 1}`}
                            className="w-full h-full object-contain rounded-xl"
                          />
                        </motion.div>
                      </AnimatePresence>

                      {/* Navigation Buttons */}
                      {photos.length > 1 && (
                        <>
                          {currentPhotoIndex > 0 && (
                            <motion.button
                              onClick={() => setCurrentPhotoIndex(currentPhotoIndex - 1)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all"
                            >
                              <ChevronLeft className="w-6 h-6" />
                            </motion.button>
                          )}
                          {currentPhotoIndex < photos.length - 1 && (
                            <motion.button
                              onClick={() => setCurrentPhotoIndex(currentPhotoIndex + 1)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all"
                            >
                              <ChevronRight className="w-6 h-6" />
                            </motion.button>
                          )}
                        </>
                      )}

                      {/* Photo Counter */}
                      <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                        {currentPhotoIndex + 1} / {photos.length}
                      </div>
                    </div>

                    {/* Photo Dots Indicator */}
                    <div className="flex justify-center gap-2 mt-4 px-2">
                      {photos.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentPhotoIndex(index)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            index === currentPhotoIndex
                              ? 'bg-[#FF91A4] w-6'
                              : 'bg-[#FFB6C1]/50 hover:bg-[#FFB6C1]'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <User className="w-24 h-24 sm:w-32 sm:h-32 text-[#FF91A4] mx-auto mb-4" />
                    <p className="text-[#757575] text-sm sm:text-base">
                      No photos uploaded yet
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

