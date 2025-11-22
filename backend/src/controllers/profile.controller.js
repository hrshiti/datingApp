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
          } else if (key === 'location' && profileData[key].coordinates) {
            profile[key] = {
              ...profile[key],
              ...profileData[key],
              coordinates: {
                type: 'Point',
                coordinates: profileData[key].coordinates
              }
            };
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

    let profile = await Profile.findOne({ userId: userId });

    if (!profile) {
      profile = await Profile.create({ userId: userId });
      await User.findByIdAndUpdate(userId, { profile: profile._id });
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
        profile.personality = { ...profile.personality, ...stepData.personality };
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

    await profile.save();

    res.status(200).json({
      success: true,
      message: `Step ${step} saved successfully`,
      profile: profile
    });
  } catch (error) {
    console.error('Update onboarding step error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving step',
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

