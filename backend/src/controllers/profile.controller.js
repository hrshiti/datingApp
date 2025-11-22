import Profile from '../models/Profile.model.js';
import User from '../models/User.model.js';

// @desc    Create or update profile
// @route   POST /api/profile
// @access  Private
export const createOrUpdateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const profileData = req.body;

    // Check if profile exists
    let profile = await Profile.findOne({ userId: userId });

    if (profile) {
      // Update existing profile
      Object.keys(profileData).forEach(key => {
        if (profileData[key] !== undefined) {
          if (key === 'personality' || key === 'dealbreakers' || key === 'optional') {
            profile[key] = { ...profile[key], ...profileData[key] };
          } else if (key === 'location' && profileData[key] && profileData[key].coordinates) {
            profile[key] = {
              ...profile[key],
              ...profileData[key],
              coordinates: {
                type: 'Point',
                coordinates: profileData[key].coordinates
              }
            };
          } else if (key === 'location' && profileData[key] && !profileData[key].coordinates) {
            // Update location without coordinates
            profile[key] = { ...profile[key], ...profileData[key] };
          } else {
            profile[key] = profileData[key];
          }
        }
      });

      // Calculate age if DOB is provided
      if (profileData.dob) {
        profile.calculateAge();
      }

      await profile.save();
    } else {
      // Create new profile
      const locationData = profileData.location;
      if (locationData && locationData.coordinates) {
        locationData.coordinates = {
          type: 'Point',
          coordinates: locationData.coordinates
        };
      }

      profile = await Profile.create({
        userId: userId,
        ...profileData,
        location: locationData
      });

      // Link profile to user
      await User.findByIdAndUpdate(userId, { profile: profile._id });
    }

    res.status(200).json({
      success: true,
      message: 'Profile saved successfully',
      profile: profile
    });
  } catch (error) {
    console.error('Create/Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving profile',
      error: error.message
    });
  }
};

// @desc    Save basic info only (name, gender, age, orientation, lookingFor)
// @route   POST /api/profile/basic-info
// @access  Private
export const saveBasicInfo = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, dob, gender, customGender, orientation, customOrientation, lookingFor } = req.body;

    // Validate required fields
    if (!name || !dob || !gender || !orientation || !lookingFor) {
      return res.status(400).json({
        success: false,
        message: 'Name, date of birth, gender, orientation, and looking for are required'
      });
    }

    // Check if profile exists
    let profile = await Profile.findOne({ userId: userId });

    if (profile) {
      // Update basic info
      profile.name = name;
      profile.dob = dob;
      profile.gender = gender;
      profile.customGender = customGender || '';
      profile.orientation = orientation;
      profile.customOrientation = customOrientation || '';
      profile.lookingFor = Array.isArray(lookingFor) ? lookingFor : [lookingFor];
      profile.calculateAge();
    } else {
      // Create new profile with basic info only
      profile = await Profile.create({
        userId: userId,
        name: name,
        dob: dob,
        gender: gender,
        customGender: customGender || '',
        orientation: orientation,
        customOrientation: customOrientation || '',
        lookingFor: Array.isArray(lookingFor) ? lookingFor : [lookingFor]
      });
      profile.calculateAge();

      // Link profile to user
      await User.findByIdAndUpdate(userId, { profile: profile._id });
    }

    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Basic information saved successfully',
      profile: profile
    });
  } catch (error) {
    console.error('Save basic info error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving basic information',
      error: error.message
    });
  }
};

// @desc    Check if profile is complete for swiping
// @route   GET /api/profile/check-completion
// @access  Private
export const checkProfileCompletion = async (req, res) => {
  try {
    const userId = req.user._id;
    const profile = await Profile.findOne({ userId: userId });

    if (!profile) {
      return res.status(200).json({
        success: true,
        isComplete: false,
        hasBasicInfo: false,
        missingFields: ['name', 'dob', 'gender', 'orientation', 'lookingFor', 'location', 'interests', 'personality', 'dealbreakers', 'photos', 'bio']
      });
    }

    // Check basic info
    const hasBasicInfo = !!(profile.name && profile.dob && profile.gender && profile.orientation && profile.lookingFor && profile.lookingFor.length > 0);

    // Check if profile is complete for swiping (needs location, preferences, interests, personality, dealbreakers, photos, bio)
    const missingFields = [];
    
    if (!profile.location || !profile.location.city) missingFields.push('location');
    if (!profile.ageRange || !profile.ageRange.min || !profile.ageRange.max) missingFields.push('preferences');
    if (!profile.interests || profile.interests.length < 3) missingFields.push('interests');
    if (!profile.personality || Object.keys(profile.personality).length < 8) missingFields.push('personality');
    if (!profile.dealbreakers || Object.keys(profile.dealbreakers).length < 4) missingFields.push('dealbreakers');
    if (!profile.photos || profile.photos.length < 4) missingFields.push('photos');
    if (!profile.bio || profile.bio.trim().length === 0) missingFields.push('bio');

    const isComplete = missingFields.length === 0;

    res.status(200).json({
      success: true,
      isComplete: isComplete,
      hasBasicInfo: hasBasicInfo,
      missingFields: missingFields,
      completionPercentage: profile.completionPercentage || 0
    });
  } catch (error) {
    console.error('Check profile completion error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking profile completion',
      error: error.message
    });
  }
};

// @desc    Get user's own profile
// @route   GET /api/profile/me
// @access  Private
export const getMyProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const profile = await Profile.findOne({ userId: userId });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    res.status(200).json({
      success: true,
      profile: profile
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message
    });
  }
};

// @desc    Get profile by ID (public)
// @route   GET /api/profile/:id
// @access  Private
export const getProfileById = async (req, res) => {
  try {
    const profileId = req.params.id;
    const profile = await Profile.findById(profileId)
      .populate('userId', 'phone isPremium lastActiveAt');

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Don't show profile if it's not visible or active
    if (!profile.isVisible || !profile.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    res.status(200).json({
      success: true,
      profile: profile
    });
  } catch (error) {
    console.error('Get profile by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message
    });
  }
};

// @desc    Update onboarding step
// @route   PUT /api/profile/onboarding/:step
// @access  Private
export const updateOnboardingStep = async (req, res) => {
  try {
    const userId = req.user._id;
    const step = req.params.step;
    const stepData = req.body;

    console.log(`📝 Updating onboarding step ${step} for user: ${userId}`);
    console.log(`📤 Step ${step} data received:`, JSON.stringify(stepData, null, 2));

    let profile = await Profile.findOne({ userId: userId });

    if (!profile) {
      profile = await Profile.create({ userId: userId });
      await User.findByIdAndUpdate(userId, { profile: profile._id });
      console.log('📄 Created new profile');
    } else {
      console.log('📄 Found existing profile');
    }

    // Update based on step number
    switch (step) {
      case '1':
        profile.name = stepData.name;
        profile.dob = stepData.dob;
        profile.gender = stepData.gender;
        profile.customGender = stepData.customGender;
        profile.orientation = stepData.orientation;
        profile.customOrientation = stepData.customOrientation;
        profile.lookingFor = stepData.lookingFor;
        break;
      case '2':
        if (stepData.location) {
          profile.location = {
            city: stepData.location.city,
            coordinates: {
              type: 'Point',
              coordinates: stepData.location.coordinates || [0, 0]
            }
          };
        }
        profile.ageRange = stepData.ageRange || profile.ageRange;
        profile.distancePref = stepData.distancePref || profile.distancePref;
        break;
      case '3':
        profile.interests = stepData.interests || [];
        break;
      case '4':
        console.log('📤 Step 4 - Personality data received:', JSON.stringify(stepData.personality, null, 2));
        console.log('📤 Step 4 - Current profile personality:', JSON.stringify(profile.personality || {}, null, 2));
        
        // Merge personality data - ensure we have a valid object
        if (stepData.personality) {
          const currentPersonality = profile.personality || {};
          profile.personality = { ...currentPersonality, ...stepData.personality };
          
          // Ensure all fields are strings (handle any undefined/null values)
          Object.keys(profile.personality).forEach(key => {
            if (profile.personality[key] === null || profile.personality[key] === undefined) {
              profile.personality[key] = '';
            }
          });
        }
        
        console.log('📤 Step 4 - Merged personality:', JSON.stringify(profile.personality, null, 2));
        break;
      case '5':
        profile.dealbreakers = { ...profile.dealbreakers, ...stepData.dealbreakers };
        break;
      case '6':
        profile.optional = { ...profile.optional, ...stepData.optional };
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid step number'
        });
    }

    console.log(`💾 Attempting to save step ${step}...`);
    await profile.save();
    console.log(`✅ Step ${step} saved successfully`);

    res.status(200).json({
      success: true,
      message: `Step ${step} saved successfully`,
      profile: profile
    });
  } catch (error) {
    console.error('❌ Update onboarding step error:', error);
    console.error('❌ Error details:', {
      step: req.params.step,
      message: error.message,
      stack: error.stack,
      name: error.name,
      errors: error.errors
    });
    
    // If it's a validation error, provide more details
    if (error.name === 'ValidationError') {
      const validationErrors = {};
      Object.keys(error.errors).forEach(key => {
        validationErrors[key] = error.errors[key].message;
      });
      console.error('❌ Validation errors:', validationErrors);
      
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.message,
        validationErrors: validationErrors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error saving step',
      error: error.message
    });
  }
};

// @desc    Update bio
// @route   PUT /api/profile/bio
// @access  Private
export const updateBio = async (req, res) => {
  try {
    const userId = req.user._id;
    const { bio } = req.body;

    let profile = await Profile.findOne({ userId: userId });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    profile.bio = bio ? bio.trim() : '';
    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Bio updated successfully',
      profile: profile
    });
  } catch (error) {
    console.error('Update bio error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating bio',
      error: error.message
    });
  }
};

// @desc    Complete onboarding
// @route   POST /api/profile/complete-onboarding
// @access  Private
export const completeOnboarding = async (req, res) => {
  try {
    const userId = req.user._id;
    const profile = await Profile.findOne({ userId: userId });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Validate minimum requirements
    if (!profile.name || !profile.dob || !profile.gender || !profile.orientation) {
      return res.status(400).json({
        success: false,
        message: 'Please complete all required fields'
      });
    }

    if (!profile.photos || profile.photos.length < 4) {
      return res.status(400).json({
        success: false,
        message: 'Please upload at least 4 photos'
      });
    }

    profile.onboardingCompleted = true;
    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Onboarding completed successfully',
      profile: profile
    });
  } catch (error) {
    console.error('Complete onboarding error:', error);
    res.status(500).json({
      success: false,
      message: 'Error completing onboarding',
      error: error.message
    });
  }
};

