import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Camera, Upload, User, Sparkles, ChevronLeft, ChevronRight, MapPin, UserCircle, Heart, Smile, Calendar, Sun, Moon, Zap, MessageSquare, Coffee, Baby, Cigarette, Dog, GlassWater, GraduationCap, Briefcase, Languages, ShoppingBag, Plane, Mic, Dumbbell, ChefHat, Activity, Palette, Mountain, Music, Wine, Gamepad2, Waves, Users, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PhotoUpload from '../components/PhotoUpload';
import CustomDropdown from '../components/CustomDropdown';
import CustomDatePicker from '../components/CustomDatePicker';
import { profileService } from '../services/profileService';
import { uploadService } from '../services/uploadService';

export default function EditProfileInfoPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [photos, setPhotos] = useState([]);
  const [bio, setBio] = useState('');
  const [activeTab, setActiveTab] = useState('edit'); // 'edit' or 'preview'
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  
  // Track initial state of photos and bio to prevent sections from disappearing while uploading/typing
  const [initialPhotos, setInitialPhotos] = useState([]);
  const [initialBio, setInitialBio] = useState('');
  
  // Onboarding fields state
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
    }
  });
  
  const [showCustomGender, setShowCustomGender] = useState(false);
  const [showCustomOrientation, setShowCustomOrientation] = useState(false);
  const [initialOptionalState, setInitialOptionalState] = useState({
    education: '',
    profession: '',
    languages: [],
    horoscope: ''
  }); // Track initial state of optional fields
  
  // Track initial state of ALL fields to prevent fields from disappearing while typing
  const [initialFormState, setInitialFormState] = useState({
    name: '',
    dob: '',
    gender: '',
    orientation: '',
    lookingFor: '',
    city: '',
    ageRange: { min: 18, max: '' },
    distancePref: 25,
    interests: [],
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
    dealbreakers: {
      kids: '',
      smoking: '',
      pets: '',
      drinking: '',
      religion: ''
    },
    prompts: [],
    optional: {
      education: '',
      profession: '',
      languages: [],
      horoscope: ''
    }
  });

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

  // Check if should show only incomplete fields
  const showOnlyIncomplete = location.state?.showOnlyIncomplete || false;
  
  // Function to check which sections are incomplete - memoized to recalculate when formData or photos change
  // Use initialFormState to prevent sections/fields from disappearing while user is typing
  const incompleteSections = useMemo(() => {
    if (!showOnlyIncomplete) return {};
    
    // Use optional chaining to safely check initialFormState
    // Use initialPhotos and initialBio to prevent sections from disappearing while uploading/typing
    // IMPORTANT: Only check initialOptionalState, never formData, to prevent sections from disappearing during typing/selection
    const hasLanguages = initialOptionalState?.languages && Array.isArray(initialOptionalState.languages) && initialOptionalState.languages.length > 0;
    
    // Section visibility logic:
    // - Language is mandatory, so section shows if language is missing
    // - Optional fields (education, profession, horoscope) are optional
    // - In "Complete Profile" mode, we want to show optional fields so user can fill them
    // - Section should show if language is missing OR if any optional field is empty
    // - Individual optional fields will show/hide based on their own initial state
    // The fix: Section shows if language is missing (mandatory) OR if any optional field is empty
    // This ensures section doesn't disappear when only language is filled - it will show optional fields
    const hasEducation = initialOptionalState?.education && initialOptionalState.education.trim() !== '';
    const hasProfession = initialOptionalState?.profession && initialOptionalState.profession.trim() !== '';
    const hasHoroscope = initialOptionalState?.horoscope && initialOptionalState.horoscope.trim() !== '';
    
    // Section shows if:
    // 1. Language is missing (mandatory field), OR
    // 2. Any optional field is empty (so user can fill optional fields)
    // This ensures section doesn't disappear when only language is saved
    const showSection = !initialOptionalState || !hasLanguages || !hasEducation || !hasProfession || !hasHoroscope;
    
    return {
      photos: !initialPhotos || initialPhotos.length < 4,
      bio: !initialBio || initialBio.trim().length === 0,
      // Use initialFormState to prevent fields from disappearing while typing - with optional chaining
      step1: !initialFormState?.name || !initialFormState?.dob || !initialFormState?.gender || !initialFormState?.orientation || !initialFormState?.lookingFor,
      step2: !initialFormState?.city || !initialFormState?.ageRange?.max || !initialFormState?.distancePref,
      step3: !initialFormState?.interests || initialFormState.interests?.length < 3,
      step4: !initialFormState?.personality || !initialFormState.personality?.social || !initialFormState.personality?.planning || 
             !initialFormState.personality?.romantic || !initialFormState.personality?.morning || !initialFormState.personality?.homebody ||
             !initialFormState.personality?.serious || !initialFormState.personality?.decision || !initialFormState.personality?.communication,
      // Step 5: Show section if any mandatory field is missing OR if religion is missing (optional but we want to show it)
      step5: !initialFormState?.dealbreakers || !initialFormState.dealbreakers?.kids || !initialFormState.dealbreakers?.smoking ||
             !initialFormState.dealbreakers?.pets || !initialFormState.dealbreakers?.drinking || !initialFormState.dealbreakers?.religion,
      step6: !initialFormState?.prompts || initialFormState.prompts?.length < 3 || initialFormState.prompts?.some(p => !p.answer || p.answer.trim() === ''),
      // Use the calculated showSection value
      step7: showSection
    };
  }, [showOnlyIncomplete, initialPhotos, initialBio, initialFormState, initialOptionalState]);

  useEffect(() => {
    // Check if coming from profile photo click with preview tab state
    if (location.state?.activeTab === 'preview') {
      setActiveTab('preview');
    }
    // Check if coming from Complete Profile button
    if (location.state?.activeTab === 'edit') {
      setActiveTab('edit');
    }

    // Load profile data from backend API
    // Always reload from backend to get latest data, especially after saving from OnboardingPage
    const loadProfileFromBackend = async () => {
      try {
        console.log('📥 Loading profile from backend API...');
        console.log('📍 Current location:', location.pathname, location.key, location.state);
        const response = await profileService.getMyProfile();
        
        if (response.success && response.profile) {
          const profile = response.profile;
          console.log('✅ Profile loaded from backend:', profile);
          console.log('📋 Dealbreakers from backend:', JSON.stringify(profile.dealbreakers, null, 2));
          console.log('📋 Optional fields from backend:', JSON.stringify(profile.optional, null, 2));
          
          // Only set fields that have actual data (not empty/null/undefined)
          // Start with a fresh copy to avoid stale data - use current formData as base but reset nested objects
          const updatedFormData = {
            ...formData,
            // Initialize nested objects fresh from backend to ensure proper merging
            dealbreakers: {
              kids: '',
              smoking: '',
              pets: '',
              drinking: '',
              religion: ''
            },
            optional: {
              education: '',
              profession: '',
              languages: [],
              horoscope: ''
            }
          };
          
          // Basic Info - only if exists
          if (profile.name) updatedFormData.name = profile.name;
          if (profile.dob) {
            // Convert date to YYYY-MM-DD format
            const dobDate = new Date(profile.dob);
            updatedFormData.dob = dobDate.toISOString().split('T')[0];
          }
          if (profile.gender) {
            updatedFormData.gender = profile.gender;
            if (profile.gender === 'other' && profile.customGender) {
              updatedFormData.customGender = profile.customGender;
              setShowCustomGender(true);
            }
          }
          if (profile.orientation) {
            updatedFormData.orientation = profile.orientation;
            if (profile.orientation === 'other' && profile.customOrientation) {
              updatedFormData.customOrientation = profile.customOrientation;
              setShowCustomOrientation(true);
            }
          }
          // Looking For - ALWAYS set, even if empty (to ensure proper loading)
          if (profile.lookingFor) {
            // If lookingFor is array, take first item, otherwise use as is
            updatedFormData.lookingFor = Array.isArray(profile.lookingFor) 
              ? (profile.lookingFor.length > 0 ? profile.lookingFor[0] : '')
              : profile.lookingFor;
          } else {
            updatedFormData.lookingFor = '';
          }
          console.log('✅ Looking For loaded from backend:', updatedFormData.lookingFor);

          // Location - only if exists
          if (profile.location && profile.location.city) {
            updatedFormData.city = profile.location.city;
          }
          if (profile.ageRange) {
            if (profile.ageRange.min) updatedFormData.ageRange.min = profile.ageRange.min;
            // Treat 100 as empty (default value that shouldn't be shown)
            if (profile.ageRange.max && profile.ageRange.max !== 100) {
              updatedFormData.ageRange.max = profile.ageRange.max;
            } else {
              updatedFormData.ageRange.max = '';
            }
          }
          if (profile.distancePref) {
            updatedFormData.distancePref = profile.distancePref;
          }
          
          // Interests - only if exists and has items
          if (profile.interests && profile.interests.length > 0) {
            updatedFormData.interests = profile.interests;
          }
          
          // Personality - only if exists and has values
          if (profile.personality) {
            // Initialize personality object if it doesn't exist
            if (!updatedFormData.personality) {
              updatedFormData.personality = {};
            }
            Object.keys(profile.personality).forEach(key => {
              if (profile.personality[key] && profile.personality[key] !== '') {
                updatedFormData.personality[key] = profile.personality[key];
              }
            });
          }
          
          // Dealbreakers - ALWAYS replace entire object from backend (even if profile.dealbreakers is null/undefined)
          // This ensures we always have the latest data from backend, including fields filled from People page
          updatedFormData.dealbreakers = {
            kids: (profile.dealbreakers && profile.dealbreakers.kids) ? profile.dealbreakers.kids : '',
            smoking: (profile.dealbreakers && profile.dealbreakers.smoking) ? profile.dealbreakers.smoking : '',
            pets: (profile.dealbreakers && profile.dealbreakers.pets) ? profile.dealbreakers.pets : '',
            drinking: (profile.dealbreakers && profile.dealbreakers.drinking) ? profile.dealbreakers.drinking : '',
            religion: (profile.dealbreakers && profile.dealbreakers.religion) ? profile.dealbreakers.religion : ''
          };
          console.log('✅ Dealbreakers loaded from backend:', JSON.stringify(updatedFormData.dealbreakers, null, 2));
          
          // Optional - ALWAYS replace entire object from backend (even if profile.optional is null/undefined)
          // This ensures we always have the latest data from backend
          updatedFormData.optional = {
            education: (profile.optional && profile.optional.education) ? profile.optional.education : '',
            profession: (profile.optional && profile.optional.profession) ? profile.optional.profession : '',
            languages: (profile.optional && profile.optional.languages) ? profile.optional.languages : [],
            horoscope: (profile.optional && profile.optional.horoscope) ? profile.optional.horoscope : ''
          };
          // Load prompts from optional.prompts
          if (profile.optional && profile.optional.prompts && profile.optional.prompts.length > 0) {
            updatedFormData.prompts = profile.optional.prompts;
          }
          
          console.log('✅ Optional fields loaded from backend:', JSON.stringify(updatedFormData.optional, null, 2));
          
          // Store initial state for conditional rendering - ALWAYS set, even if empty
          setInitialOptionalState({
            education: (profile.optional && profile.optional.education) ? profile.optional.education : '',
            profession: (profile.optional && profile.optional.profession) ? profile.optional.profession : '',
            languages: (profile.optional && profile.optional.languages) ? profile.optional.languages : [],
            horoscope: (profile.optional && profile.optional.horoscope) ? profile.optional.horoscope : ''
          });
          
          // Photos - only if exists
          if (profile.photos && profile.photos.length > 0) {
            const photosData = profile.photos.map(photo => ({
              id: photo._id || photo.id,
              preview: photo.url,
              url: photo.url,
              isMain: photo.isMain || false,
              order: photo.order || 0
            }));
            setPhotos(photosData);
            setInitialPhotos(photosData); // Set initial photos state
          } else {
            setInitialPhotos([]); // Set empty if no photos
          }
          
          // Bio - only if exists
          if (profile.bio) {
            setBio(profile.bio);
            setInitialBio(profile.bio); // Set initial bio state
          } else {
            setInitialBio(''); // Set empty if no bio
        }
        
          console.log('📋 Updated formData dealbreakers:', JSON.stringify(updatedFormData.dealbreakers, null, 2));
          console.log('📋 Updated formData optional:', JSON.stringify(updatedFormData.optional, null, 2));
          console.log('📋 Updated formData.optional.education:', updatedFormData.optional.education);
          
          setFormData(updatedFormData);
          
          // Store initial state of ALL fields
          setInitialFormState({
            name: updatedFormData.name || '',
            dob: updatedFormData.dob || '',
            gender: updatedFormData.gender || '',
            orientation: updatedFormData.orientation || '',
            lookingFor: updatedFormData.lookingFor || '',
            city: updatedFormData.city || '',
            ageRange: updatedFormData.ageRange || { min: 18, max: '' },
            distancePref: updatedFormData.distancePref || 25,
            interests: updatedFormData.interests || [],
            personality: updatedFormData.personality || {
              social: '',
              planning: '',
              romantic: '',
              morning: '',
              homebody: '',
              serious: '',
              decision: '',
              communication: ''
            },
            dealbreakers: updatedFormData.dealbreakers ? {
              kids: updatedFormData.dealbreakers.kids || '',
              smoking: updatedFormData.dealbreakers.smoking || '',
              pets: updatedFormData.dealbreakers.pets || '',
              drinking: updatedFormData.dealbreakers.drinking || '',
              religion: updatedFormData.dealbreakers.religion || ''
            } : {
              kids: '',
              smoking: '',
              pets: '',
              drinking: '',
              religion: ''
            },
            prompts: updatedFormData.prompts || [],
            optional: updatedFormData.optional ? {
              education: updatedFormData.optional.education || '',
              profession: updatedFormData.optional.profession || '',
              languages: updatedFormData.optional.languages || [],
              horoscope: updatedFormData.optional.horoscope || ''
            } : {
              education: '',
              profession: '',
              languages: [],
              horoscope: ''
            }
          });
          
          console.log('✅ Form data updated with backend data');
        } else {
          console.log('⚠️ No profile found in response');
          // Initialize empty states if no profile found
          setInitialFormState({
            name: '',
            dob: '',
            gender: '',
            orientation: '',
            lookingFor: '',
            city: '',
            ageRange: { min: 18, max: '' },
            distancePref: 25,
            interests: [],
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
            dealbreakers: {
              kids: '',
              smoking: '',
              pets: '',
              drinking: '',
              religion: ''
            },
            prompts: [],
            optional: {
              education: '',
              profession: '',
              languages: [],
              horoscope: ''
            }
          });
          setInitialOptionalState({
            education: '',
            profession: '',
            languages: [],
            horoscope: ''
          });
          setInitialPhotos([]);
          setInitialBio('');
        }
      } catch (error) {
        console.error('❌ Error loading profile from backend:', error);
        alert('Error loading profile. Please refresh the page.');
      }
    };
    
    loadProfileFromBackend();
  }, [location.state?.showOnlyIncomplete, location.state?.activeTab, location.state?.timestamp, location.pathname, location.key]);

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
      console.log('💾 Saving profile data to backend...');
      
      // Step 1: Save Basic Info if any field is filled
      if (formData.name || formData.dob || formData.gender || formData.orientation || formData.lookingFor) {
        const basicInfo = {
          name: formData.name.trim(),
          dob: formData.dob,
          gender: formData.gender,
          customGender: formData.customGender || '',
          orientation: formData.orientation,
          customOrientation: formData.customOrientation || '',
          lookingFor: Array.isArray(formData.lookingFor) ? formData.lookingFor : [formData.lookingFor]
        };
        await profileService.saveBasicInfo(basicInfo);
        console.log('✅ Basic info saved');
      }

      // Step 2: Save Location & Preferences
      if (formData.city || formData.ageRange || formData.distancePref) {
        const step2Data = {
          location: {
            city: formData.city
          },
          ageRange: formData.ageRange,
          distancePref: formData.distancePref
        };
        await profileService.updateOnboardingStep(2, step2Data);
        console.log('✅ Location & preferences saved');
      }

      // Step 3: Save Interests
      if (formData.interests && formData.interests.length > 0) {
        await profileService.updateOnboardingStep(3, { interests: formData.interests });
        console.log('✅ Interests saved');
      }

      // Step 4: Save Personality
      if (formData.personality) {
        await profileService.updateOnboardingStep(4, { personality: formData.personality });
        console.log('✅ Personality saved');
      }

      // Step 5: Save Dealbreakers
      if (formData.dealbreakers) {
        await profileService.updateOnboardingStep(5, { dealbreakers: formData.dealbreakers });
        console.log('✅ Dealbreakers saved');
      }

      // Step 6 & 7: Save Prompts and Optional Info together (prompts are in optional)
      if (formData.prompts || formData.optional) {
        const optionalData = {
          prompts: formData.prompts || [],
          education: formData.optional?.education || '',
          profession: formData.optional?.profession || '',
          languages: formData.optional?.languages || [],
          horoscope: formData.optional?.horoscope || ''
        };
        await profileService.updateOnboardingStep(6, { optional: optionalData });
        console.log('✅ Prompts and optional info saved');
      }

      // Step 8: Upload Photos and Save Bio
      if (photos && photos.length > 0) {
        // Filter new photo files
        const photoFiles = photos
          .filter(photo => photo && photo.file instanceof File)
          .map(photo => photo.file);

        if (photoFiles.length > 0) {
          const uploadResponse = await uploadService.uploadPhotos(photoFiles);
          if (!uploadResponse.success) {
            throw new Error(uploadResponse.message || 'Failed to upload photos');
          }
          console.log('✅ Photos uploaded');
        }
      }

      // Save Bio
      if (bio && bio.trim().length > 0) {
        await profileService.updateBio(bio.trim());
        console.log('✅ Bio saved');
      }

      // After saving, reload profile data to update initialFormState and initialOptionalState
      if (showOnlyIncomplete) {
        // Reload profile data to get updated state
        const response = await profileService.getMyProfile();
        if (response.success && response.profile) {
          const profile = response.profile;
          const updatedFormData = { ...formData };
          
          // Update all form data from backend
          if (profile.name) updatedFormData.name = profile.name;
          if (profile.dob) {
            const dobDate = new Date(profile.dob);
            updatedFormData.dob = dobDate.toISOString().split('T')[0];
          }
          if (profile.gender) updatedFormData.gender = profile.gender;
          if (profile.orientation) updatedFormData.orientation = profile.orientation;
          // Looking For - ALWAYS set, even if empty
          if (profile.lookingFor) {
            updatedFormData.lookingFor = Array.isArray(profile.lookingFor) 
              ? (profile.lookingFor.length > 0 ? profile.lookingFor[0] : '')
              : profile.lookingFor;
          } else {
            updatedFormData.lookingFor = '';
          }
          if (profile.location && profile.location.city) updatedFormData.city = profile.location.city;
          if (profile.ageRange) {
            if (profile.ageRange.min) updatedFormData.ageRange.min = profile.ageRange.min;
            // Treat 100 as empty (default value that shouldn't be shown)
            if (profile.ageRange.max && profile.ageRange.max !== 100) {
              updatedFormData.ageRange.max = profile.ageRange.max;
            } else {
              updatedFormData.ageRange.max = '';
            }
          }
          if (profile.interests && profile.interests.length > 0) updatedFormData.interests = profile.interests;
          if (profile.personality) {
            Object.keys(profile.personality).forEach(key => {
              if (profile.personality[key] && profile.personality[key] !== '') {
                updatedFormData.personality[key] = profile.personality[key];
              }
            });
          }
          if (profile.dealbreakers) {
            Object.keys(profile.dealbreakers).forEach(key => {
              if (profile.dealbreakers[key] && profile.dealbreakers[key] !== '') {
                updatedFormData.dealbreakers[key] = profile.dealbreakers[key];
              }
            });
          }
          if (profile.optional) {
            if (profile.optional.education) updatedFormData.optional.education = profile.optional.education;
            if (profile.optional.profession) updatedFormData.optional.profession = profile.optional.profession;
            if (profile.optional.languages && profile.optional.languages.length > 0) {
              updatedFormData.optional.languages = profile.optional.languages;
            }
            if (profile.optional.horoscope) updatedFormData.optional.horoscope = profile.optional.horoscope;
            if (profile.optional.prompts && profile.optional.prompts.length > 0) {
              updatedFormData.prompts = profile.optional.prompts;
            }
          }
          
          setFormData(updatedFormData);
          
          // Update initialFormState with saved data - use actual saved values, not defaults
          const savedInitialState = {
            name: profile.name || '',
            dob: profile.dob ? new Date(profile.dob).toISOString().split('T')[0] : '',
            gender: profile.gender || '',
            orientation: profile.orientation || '',
            lookingFor: profile.lookingFor 
              ? (Array.isArray(profile.lookingFor) 
                  ? (profile.lookingFor.length > 0 ? profile.lookingFor[0] : '')
                  : profile.lookingFor)
              : '',
            city: profile.location?.city || '',
            ageRange: profile.ageRange ? {
              min: profile.ageRange.min || 18,
              max: (profile.ageRange.max && profile.ageRange.max !== 100) ? profile.ageRange.max : ''
            } : { min: 18, max: '' },
            distancePref: profile.distancePref || 25,
            interests: profile.interests || [],
            personality: profile.personality || {
              social: '',
              planning: '',
              romantic: '',
              morning: '',
              homebody: '',
              serious: '',
              decision: '',
              communication: ''
            },
            dealbreakers: profile.dealbreakers || {
              kids: '',
              smoking: '',
              pets: '',
              drinking: '',
              religion: ''
            },
            prompts: profile.optional?.prompts || [],
            optional: profile.optional || {
              education: '',
              profession: '',
              languages: [],
              horoscope: ''
            }
          };
          
          setInitialFormState(savedInitialState);
          console.log('✅ Initial form state updated after save:', savedInitialState);
          
          // Update initialOptionalState with saved data
          if (profile.optional) {
            setInitialOptionalState({
              education: profile.optional.education || '',
              profession: profile.optional.profession || '',
              languages: profile.optional.languages || [],
              horoscope: profile.optional.horoscope || ''
            });
          } else {
            setInitialOptionalState({
              education: '',
              profession: '',
              languages: [],
              horoscope: ''
            });
          }
          
          // Update initialPhotos and initialBio with saved data
          if (profile.photos && profile.photos.length > 0) {
            const photosData = profile.photos.map(photo => ({
              id: photo._id || photo.id,
              preview: photo.url,
              url: photo.url,
              isMain: photo.isMain || false,
              order: photo.order || 0
            }));
            setInitialPhotos(photosData);
            setPhotos(photosData); // Also update current photos
          } else {
            setInitialPhotos([]);
          }
          
          if (profile.bio) {
            setInitialBio(profile.bio);
            setBio(profile.bio); // Also update current bio
          } else {
            setInitialBio('');
          }
          
          // Update formData with saved values
          setFormData(updatedFormData);
          
          // Check if profile is now complete after saving
          try {
            const completionResponse = await profileService.checkProfileCompletion();
            if (completionResponse.success && completionResponse.isComplete) {
              // Profile is complete, navigate to profile page
      navigate('/profile');
              return;
            }
    } catch (error) {
            console.error('Error checking profile completion:', error);
          }
        }
        
        alert('Profile updated successfully! Only unfilled fields will now be shown.');
      } else {
        // Check if profile is complete before showing alert
        try {
          const completionResponse = await profileService.checkProfileCompletion();
          if (completionResponse.success && completionResponse.isComplete) {
            // Profile is complete, navigate to profile page
            navigate('/profile');
            return;
          }
        } catch (error) {
          console.error('Error checking profile completion:', error);
        }
        
        alert('Profile updated successfully!');
        navigate('/profile');
      }
    } catch (error) {
      console.error('❌ Error saving profile:', error);
      alert('Error saving profile. Please try again.');
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
      {/* Premium Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-[#64B5F6]/8 to-transparent rounded-full blur-3xl -translate-x-1/3 -translate-y-1/3"></div>
      <div className="absolute bottom-0 right-0 w-[700px] h-[700px] bg-gradient-to-tl from-[#42A5F5]/8 to-transparent rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-[#90CAF9]/5 to-transparent rounded-full blur-3xl"></div>
      
      <div className="w-full h-full relative z-10 flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-[#F5F7FA] via-[#E8ECF1] to-[#F5F7FA] h-full w-full md:max-w-4xl md:mx-auto flex flex-col p-4 sm:p-6 md:p-6 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#64B5F6]/5 to-transparent pointer-events-none"></div>
          
          {/* Header */}
          <div className="mb-6 sm:mb-8 relative z-10 flex-shrink-0">
            <motion.button
              onClick={() => navigate('/profile')}
              whileHover={{ scale: 1.05, x: -2 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center text-[#616161] hover:text-[#1A1A1A] mb-4 sm:mb-5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              <span className="text-sm sm:text-base font-medium">Back</span>
            </motion.button>
            <div className="flex items-center gap-3 mb-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-[#1A1A1A] tracking-tight">
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
                    ? 'bg-[#64B5F6] hover:bg-[#42A5F5] text-white shadow-[0_4px_16px_rgba(100,181,246,0.3)]'
                    : 'bg-white text-[#616161] border border-[#E8E8E8] hover:border-[#64B5F6] shadow-sm'
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
                    ? 'bg-[#64B5F6] hover:bg-[#42A5F5] text-white shadow-[0_4px_16px_rgba(100,181,246,0.3)]'
                    : 'bg-white text-[#616161] border border-[#E8E8E8] hover:border-[#64B5F6] shadow-sm'
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
                {(!showOnlyIncomplete || incompleteSections.photos) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-[#E8E8E8] shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] transition-shadow"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-[#64B5F6]" />
                    <div>
                      <label className="block text-sm sm:text-base font-bold text-[#1A1A1A] tracking-tight">
                        Upload Your Photos <span className="text-[#64B5F6]">*</span>
                      </label>
                      <p className="text-xs sm:text-sm text-[#616161] mt-1 font-medium">
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
                      className="text-xs sm:text-sm text-[#616161] mt-3"
                    >
                      ✓ {photos.length} photo{photos.length > 1 ? 's' : ''} uploaded
                    </motion.p>
                  )}
                </motion.div>
                )}

                {/* Section 2: Bio */}
                {(!showOnlyIncomplete || incompleteSections.bio) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-[#E8E8E8] shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] transition-shadow"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <User className="w-5 h-5 sm:w-6 sm:h-6 text-[#64B5F6]" />
                    <div>
                      <label className="block text-sm sm:text-base font-bold text-[#1A1A1A] tracking-tight">
                        Write Your Bio <span className="text-[#616161] text-xs font-normal">(Optional)</span>
                      </label>
                      <p className="text-xs sm:text-sm text-[#616161] mt-1 font-medium">
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
                    className="w-full px-4 py-3 border border-[#E8E8E8] rounded-xl sm:rounded-2xl text-sm sm:text-base text-[#1A1A1A] bg-white focus:outline-none focus:ring-2 focus:ring-[#64B5F6] focus:ring-opacity-20 focus:border-[#64B5F6] transition-all resize-none shadow-sm hover:shadow-md font-medium"
                  />
                  <div className="flex justify-between items-center mt-3">
                    <p className={`text-xs sm:text-sm font-medium ${
                      bio.length > maxBioLength * 0.9 
                        ? 'text-[#64B5F6]' 
                        : 'text-[#616161]'
                    }`}>
                      {bio.length}/{maxBioLength} characters
                    </p>
                    {bio.length > 0 && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-xs text-[#64B5F6] font-medium"
                      >
                        ✓ Bio added
                      </motion.span>
                    )}
                  </div>
                </motion.div>
                )}

                {/* Section 3: Basic Information (Step 1) */}
                {(!showOnlyIncomplete || incompleteSections.step1) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-[#E8E8E8] shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] transition-shadow"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <UserCircle className="w-5 h-5 sm:w-6 sm:h-6 text-[#64B5F6]" />
                    <label className="block text-sm sm:text-base font-bold text-[#1A1A1A] tracking-tight">
                      Basic Information
                    </label>
                  </div>
                  
                  {/* Name */}
                  {(!showOnlyIncomplete || !initialFormState?.name) && (
                  <div className="mb-4">
                    <label className="block text-xs sm:text-sm font-medium text-[#1A1A1A] mb-1.5">
                      Name <span className="text-[#64B5F6]">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-[#E8E8E8] rounded-xl text-sm text-[#1A1A1A] focus:border-[#64B5F6] focus:outline-none focus:ring-2 focus:ring-[#64B5F6] focus:ring-opacity-20 transition-all shadow-sm font-medium"
                    />
                  </div>
                  )}

                  {/* Date of Birth */}
                  {(!showOnlyIncomplete || !initialFormState?.dob) && (
                  <div className="mb-4">
                    <label className="block text-xs sm:text-sm font-medium text-[#1A1A1A] mb-1.5">
                      Age / Date of Birth <span className="text-[#64B5F6]">*</span>
                    </label>
                    <CustomDatePicker
                      value={formData.dob}
                      onChange={(value) => handleChange('dob', value)}
                      maxDate={getMaxDate()}
                    />
                    {age !== null && age >= 18 && (
                      <p className="text-xs text-[#616161] mt-1">Age: {age} years</p>
                    )}
                  </div>
                  )}

                  {/* Gender */}
                  {(!showOnlyIncomplete || !initialFormState?.gender) && (
                  <div className="mb-4">
                    <label className="block text-xs sm:text-sm font-medium text-[#1A1A1A] mb-1.5">
                      Gender Identity <span className="text-[#64B5F6]">*</span>
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
                        className="w-full mt-2 px-3 sm:px-4 py-2.5 sm:py-3 border border-[#E8E8E8] rounded-xl text-sm text-[#1A1A1A] focus:border-[#64B5F6] focus:outline-none focus:ring-2 focus:ring-[#64B5F6] focus:ring-opacity-20 transition-all shadow-sm"
                      />
                    )}
                  </div>
                  )}

                  {/* Orientation */}
                  {(!showOnlyIncomplete || !initialFormState?.orientation) && (
                  <div className="mb-4">
                    <label className="block text-xs sm:text-sm font-medium text-[#1A1A1A] mb-1.5">
                      Sexual Orientation <span className="text-[#64B5F6]">*</span>
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
                        className="w-full mt-2 px-3 sm:px-4 py-2.5 sm:py-3 border border-[#E8E8E8] rounded-xl text-sm text-[#1A1A1A] focus:border-[#64B5F6] focus:outline-none focus:ring-2 focus:ring-[#64B5F6] focus:ring-opacity-20 transition-all shadow-sm"
                      />
                    )}
                  </div>
                  )}

                  {/* Looking For */}
                  {(!showOnlyIncomplete || !initialFormState?.lookingFor) && (
                  <div className="mb-4">
                    <label className="block text-xs sm:text-sm font-medium text-[#1A1A1A] mb-1.5">
                      Looking For <span className="text-[#64B5F6]">*</span>
                    </label>
                    <CustomDropdown
                      options={[
                        { value: '', label: 'Select who you are looking for' },
                        { value: 'men', label: 'Men' },
                        { value: 'women', label: 'Women' },
                        { value: 'everyone', label: 'Everyone' }
                      ]}
                      value={formData.lookingFor}
                      onChange={(value) => handleChange('lookingFor', value)}
                      placeholder="Select who you are looking for"
                    />
                  </div>
                  )}
                </motion.div>
                )}

                {/* Section 4: Location & Preferences (Step 2) */}
                {(!showOnlyIncomplete || incompleteSections.step2) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-[#E8E8E8] shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] transition-shadow"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#64B5F6] rounded-xl flex items-center justify-center shadow-md">
                      <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <label className="block text-sm sm:text-base font-bold text-[#1A1A1A]">
                      Location & Preferences
                    </label>
                  </div>
                  
                  {/* City */}
                  {(!showOnlyIncomplete || !initialFormState?.city) && (
                  <div className="mb-4">
                    <label className="block text-xs sm:text-sm font-medium text-[#1A1A1A] mb-1.5">
                      City <span className="text-[#64B5F6]">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleChange('city', e.target.value)}
                      placeholder="Enter your city"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-[#E8E8E8] rounded-xl text-sm text-[#1A1A1A] focus:border-[#64B5F6] focus:outline-none focus:ring-2 focus:ring-[#64B5F6] focus:ring-opacity-20 transition-all shadow-sm"
                    />
                  </div>
                  )}

                  {/* Age Range - Show if max is not filled initially */}
                  {(!showOnlyIncomplete || !initialFormState.ageRange?.max) && (
                  <div className="mb-4">
                    <label className="block text-xs sm:text-sm font-medium text-[#1A1A1A] mb-1.5">
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
                          className="w-full px-3 py-2.5 border border-[#E8E8E8] rounded-xl text-sm text-[#1A1A1A] focus:border-[#64B5F6] focus:outline-none focus:ring-2 focus:ring-[#64B5F6] focus:ring-opacity-20 transition-all shadow-sm"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          min="18"
                          value={formData.ageRange.max}
                          onChange={(e) => handleChange('ageRange', { ...formData.ageRange, max: e.target.value ? parseInt(e.target.value) : '' })}
                          placeholder="Max"
                          className="w-full px-3 py-2.5 border border-[#E8E8E8] rounded-xl text-sm text-[#1A1A1A] focus:border-[#64B5F6] focus:outline-none focus:ring-2 focus:ring-[#64B5F6] focus:ring-opacity-20 transition-all shadow-sm"
                        />
                      </div>
                    </div>
                  </div>
                  )}

                  {/* Distance Preference */}
                  {(!showOnlyIncomplete || !initialFormState?.distancePref) && (
                  <div className="mb-4">
                    <label className="block text-xs sm:text-sm font-medium text-[#1A1A1A] mb-1.5">
                      Maximum Distance (km) <span className="text-[#64B5F6]">*</span>
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
                            #64B5F6 0%, 
                            #42A5F5 ${((formData.distancePref - 5) / (100 - 5)) * 100}%, 
                            #E0E0E0 ${((formData.distancePref - 5) / (100 - 5)) * 100}%, 
                            #E0E0E0 100%)`
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm text-[#616161] mt-1.5">
                      <span>5 km</span>
                      <span className="font-semibold text-[#64B5F6]">{formData.distancePref} km</span>
                      <span>100 km</span>
                    </div>
                  </div>
                  )}
                </motion.div>
                )}

                {/* Section 5: Interests (Step 3) */}
                {(!showOnlyIncomplete || incompleteSections.step3) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-[#E8E8E8] shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] transition-shadow"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#64B5F6] rounded-xl flex items-center justify-center shadow-md">
                      <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <label className="block text-sm sm:text-base font-bold text-[#1A1A1A]">
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
                              ? 'bg-[#64B5F6] text-white border-[#64B5F6] shadow-md'
                              : 'bg-white text-[#1A1A1A] border-[#E8E8E8] hover:border-[#64B5F6]'
                          }`}
                        >
                          <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${isSelected ? 'text-white' : 'text-[#1A1A1A]'}`} />
                          <span className="text-xs sm:text-sm font-medium text-center">{interest.name}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
                )}

                {/* Section 6: Personality Traits (Step 4) */}
                {(!showOnlyIncomplete || incompleteSections.step4) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-[#E8E8E8] shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] transition-shadow"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#64B5F6] rounded-xl flex items-center justify-center shadow-md">
                      <Smile className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <label className="block text-sm sm:text-base font-bold text-[#1A1A1A]">
                      Personality Traits
                    </label>
                  </div>
                  
                  <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
                    {/* Social vs Introvert */}
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-[#1A1A1A] mb-2">
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
                                  ? 'bg-[#64B5F6] text-white border-[#64B5F6] shadow-md'
                                  : 'bg-white text-[#1A1A1A] border-[#E8E8E8] hover:border-[#64B5F6]'
                              }`}
                            >
                              <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-[#64B5F6]'}`} />
                              <span>{option.label}</span>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Planner vs Spontaneous */}
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-[#1A1A1A] mb-2">
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
                                  ? 'bg-[#64B5F6] text-white border-[#64B5F6] shadow-md'
                                  : 'bg-white text-[#1A1A1A] border-[#E8E8E8] hover:border-[#64B5F6]'
                              }`}
                            >
                              <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-[#64B5F6]'}`} />
                              <span>{option.label}</span>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Romantic vs Practical */}
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-[#1A1A1A] mb-2">
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
                                  ? 'bg-[#64B5F6] text-white border-[#64B5F6] shadow-md'
                                  : 'bg-white text-[#1A1A1A] border-[#E8E8E8] hover:border-[#64B5F6]'
                              }`}
                            >
                              <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-[#64B5F6]'}`} />
                              <span>{option.label}</span>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Morning vs Night */}
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-[#1A1A1A] mb-2">
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
                                  ? 'bg-[#64B5F6] text-white border-[#64B5F6] shadow-md'
                                  : 'bg-white text-[#1A1A1A] border-[#E8E8E8] hover:border-[#64B5F6]'
                              }`}
                            >
                              <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-[#64B5F6]'}`} />
                              <span>{option.label}</span>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Homebody vs Adventurous */}
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-[#1A1A1A] mb-2">
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
                                  ? 'bg-[#64B5F6] text-white border-[#64B5F6] shadow-md'
                                  : 'bg-white text-[#1A1A1A] border-[#E8E8E8] hover:border-[#64B5F6]'
                              }`}
                            >
                              <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-[#64B5F6]'}`} />
                              <span>{option.label}</span>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Serious vs Fun */}
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-[#1A1A1A] mb-2">
                        Approach to Dating
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { value: 'serious', label: 'Serious', icon: Heart },
                          { value: 'fun-loving', label: 'Fun-loving', icon: Smile }
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
                                  ? 'bg-[#64B5F6] text-white border-[#64B5F6] shadow-md'
                                  : 'bg-white text-[#1A1A1A] border-[#E8E8E8] hover:border-[#64B5F6]'
                              }`}
                            >
                              <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-[#64B5F6]'}`} />
                              <span>{option.label}</span>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Decision Maker vs Go with Flow */}
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-[#1A1A1A] mb-2">
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
                                  ? 'bg-[#64B5F6] text-white border-[#64B5F6] shadow-md'
                                  : 'bg-white text-[#1A1A1A] border-[#E8E8E8] hover:border-[#64B5F6]'
                              }`}
                            >
                              <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-[#64B5F6]'}`} />
                              <span>{option.label}</span>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Direct vs Subtle Communication */}
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-[#1A1A1A] mb-2">
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
                                  ? 'bg-[#64B5F6] text-white border-[#64B5F6] shadow-md'
                                  : 'bg-white text-[#1A1A1A] border-[#E8E8E8] hover:border-[#64B5F6]'
                              }`}
                            >
                              <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-[#64B5F6]'}`} />
                              <span>{option.label}</span>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </motion.div>
                )}

                {/* Section 7: Dealbreakers (Step 5) */}
                {(!showOnlyIncomplete || incompleteSections.step5) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-[#E8E8E8] shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] transition-shadow"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#64B5F6] rounded-xl flex items-center justify-center shadow-md">
                      <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <label className="block text-sm sm:text-base font-bold text-[#1A1A1A]">
                      Dealbreakers
                    </label>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Kids */}
                    {(!showOnlyIncomplete || !initialFormState?.dealbreakers?.kids) && (
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-[#1A1A1A] mb-2">
                        Kids <span className="text-[#64B5F6]">*</span>
                      </label>
                      <CustomDropdown
                        options={[
                          { value: '', label: 'Select preference' },
                          { value: 'have-kids', label: 'Have Kids' },
                          { value: 'want-kids', label: 'Want Kids' },
                          { value: 'dont-want-kids', label: "Don't Want Kids" },
                          { value: 'not-sure', label: 'Not Sure' }
                        ]}
                        value={formData.dealbreakers.kids}
                        onChange={(value) => handleChange('dealbreakers.kids', value)}
                        placeholder="Select preference"
                      />
                    </div>
                    )}

                    {/* Smoking */}
                    {(!showOnlyIncomplete || !initialFormState?.dealbreakers?.smoking) && (
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-[#1A1A1A] mb-2">
                        Smoking <span className="text-[#64B5F6]">*</span>
                      </label>
                      <CustomDropdown
                        options={[
                          { value: '', label: 'Select preference' },
                          { value: 'smoker', label: 'Smoker' },
                          { value: 'non-smoker', label: 'Non-smoker' },
                          { value: 'social-smoker', label: 'Social Smoker' },
                          { value: 'prefer-non-smoker', label: 'Prefer Non-smoker' }
                        ]}
                        value={formData.dealbreakers.smoking}
                        onChange={(value) => handleChange('dealbreakers.smoking', value)}
                        placeholder="Select preference"
                      />
                    </div>
                    )}

                    {/* Pets */}
                    {(!showOnlyIncomplete || !initialFormState?.dealbreakers?.pets) && (
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-[#1A1A1A] mb-2">
                        Pets <span className="text-[#64B5F6]">*</span>
                      </label>
                      <CustomDropdown
                        options={[
                          { value: '', label: 'Select preference' },
                          { value: 'love-pets', label: 'Love Pets' },
                          { value: 'have-pets', label: 'Have Pets' },
                          { value: 'allergic', label: 'Allergic' },
                          { value: 'not-interested', label: "Not Interested" }
                        ]}
                        value={formData.dealbreakers.pets}
                        onChange={(value) => handleChange('dealbreakers.pets', value)}
                        placeholder="Select preference"
                      />
                    </div>
                    )}

                    {/* Drinking */}
                    {(!showOnlyIncomplete || !initialFormState?.dealbreakers?.drinking) && (
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-[#1A1A1A] mb-2">
                        Drinking <span className="text-[#64B5F6]">*</span>
                      </label>
                      <CustomDropdown
                        options={[
                          { value: '', label: 'Select preference' },
                          { value: 'never', label: 'Never' },
                          { value: 'occasionally', label: 'Occasionally' },
                          { value: 'socially', label: 'Socially' },
                          { value: 'regularly', label: 'Regularly' }
                        ]}
                        value={formData.dealbreakers.drinking}
                        onChange={(value) => handleChange('dealbreakers.drinking', value)}
                        placeholder="Select preference"
                      />
                    </div>
                    )}

                    {/* Religion - Show if not filled initially */}
                    {(!showOnlyIncomplete || !initialFormState.dealbreakers?.religion) && (
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-[#1A1A1A] mb-2">
                        Religion
                      </label>
                      <input
                        type="text"
                        value={formData.dealbreakers.religion}
                        onChange={(e) => handleChange('dealbreakers.religion', e.target.value)}
                        placeholder="Enter religion (optional)"
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-[#E8E8E8] rounded-xl text-sm text-[#1A1A1A] focus:border-[#64B5F6] focus:outline-none focus:ring-2 focus:ring-[#64B5F6] focus:ring-opacity-20 transition-all shadow-sm"
                      />
                    </div>
                    )}
                  </div>
                </motion.div>
                )}

                {/* Section 8: Prompts (Step 6) */}
                {(!showOnlyIncomplete || incompleteSections.step6) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-[#E8E8E8] shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] transition-shadow"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#64B5F6] rounded-xl flex items-center justify-center shadow-md">
                      <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <label className="block text-sm sm:text-base font-bold text-[#1A1A1A]">
                      Prompts
                    </label>
                  </div>
                  
                  <p className="text-xs sm:text-sm text-[#616161] mb-4">
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
                                ? 'bg-[#64B5F6] text-white border-[#64B5F6] shadow-md'
                                : 'bg-white text-[#1A1A1A] border-[#E8E8E8] hover:border-[#64B5F6]'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                isSelected ? 'border-white' : 'border-[#64B5F6]'
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
                                className="w-full px-4 py-3 border border-[#E8E8E8] rounded-xl text-sm text-[#1A1A1A] focus:border-[#64B5F6] focus:outline-none focus:ring-2 focus:ring-[#64B5F6] focus:ring-opacity-20 transition-all resize-none shadow-sm"
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
                        formData.prompts.length >= 3 ? 'text-[#64B5F6]' : 'text-[#616161]'
                      }`}
                    >
                      {formData.prompts.length >= 3 ? '✓ ' : ''}
                      {formData.prompts.length} of 3+ prompts selected
                    </motion.p>
                  )}
                </motion.div>
                )}

                {/* Section 9: Optional Info (Step 7) - Always show section if incomplete, then show individual fields based on initial state */}
                {(!showOnlyIncomplete || incompleteSections.step7) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-[#E8E8E8] shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] transition-shadow"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#64B5F6] rounded-xl flex items-center justify-center shadow-md">
                      <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <label className="block text-sm sm:text-base font-bold text-[#1A1A1A]">
                      Additional Information
                    </label>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Education - Show if not filled initially */}
                    {(!showOnlyIncomplete || !initialOptionalState.education || initialOptionalState.education === '') && (
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-[#1A1A1A] mb-2">
                        Education
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
                        onChange={(value) => handleChange('optional.education', value)}
                        placeholder="Select education (optional)"
                      />
                    </div>
                    )}

                    {/* Profession - Show if not filled initially (always show when section is visible) */}
                    {(!showOnlyIncomplete || !initialOptionalState.profession || initialOptionalState.profession === '') && (
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-[#1A1A1A] mb-2">
                        Profession
                      </label>
                      <input
                        type="text"
                        value={formData.optional?.profession || ''}
                        onChange={(e) => handleChange('optional.profession', e.target.value)}
                        placeholder="Enter your profession"
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-[#E8E8E8] rounded-xl text-sm text-[#1A1A1A] focus:border-[#64B5F6] focus:outline-none focus:ring-2 focus:ring-[#64B5F6] focus:ring-opacity-20 transition-all shadow-sm"
                      />
                    </div>
                    )}

                    {/* Languages - Show if not filled initially */}
                    {(!showOnlyIncomplete || !initialOptionalState || !initialOptionalState.languages || !Array.isArray(initialOptionalState.languages) || initialOptionalState.languages.length === 0) && (
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-[#1A1A1A] mb-2">
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
                                  ? 'bg-[#64B5F6] text-white border-[#64B5F6] shadow-md'
                                  : 'bg-white text-[#1A1A1A] border-[#E8E8E8] hover:border-[#64B5F6]'
                              }`}
                            >
                              {lang}
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                    )}
                    {/* Horoscope - Show if not filled initially (based on initial state) */}
                    {(!showOnlyIncomplete || !initialOptionalState.horoscope || initialOptionalState.horoscope === '') && (
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-[#1A1A1A] mb-2">
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
                    )}
                  </div>
                </motion.div>
                )}

                {/* Section 10: Save Button */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0 }}
                  className="pt-4 sm:pt-6 border-t border-[#E8E8E8] relative z-10 flex-shrink-0"
                >
                  <motion.button
                    onClick={handleSave}
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-[#64B5F6] hover:bg-[#42A5F5] text-white font-semibold py-3 sm:py-4 rounded-xl sm:rounded-2xl transition-all flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(100,181,246,0.3)] hover:shadow-[0_8px_24px_rgba(100,181,246,0.4)]"
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
                              ? 'bg-[#64B5F6] hover:bg-[#42A5F5]'
                              : index < currentPhotoIndex
                              ? 'bg-[#64B5F6]/50'
                              : 'bg-[#E8E8E8]'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Photo Display Area */}
                    <div className="relative w-full aspect-[9/16] max-h-[80vh] rounded-2xl overflow-hidden shadow-xl border border-[#E8E8E8] bg-black">
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
                              ? 'bg-[#64B5F6] w-6'
                              : 'bg-[#E8E8E8] hover:bg-[#64B5F6]/50'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <User className="w-24 h-24 sm:w-32 sm:h-32 text-[#64B5F6] mx-auto mb-4" />
                    <p className="text-[#616161] text-sm sm:text-base">
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

