import Profile from '../models/Profile.model.js';
import { Interaction, Match } from '../models/Interaction.model.js';
import User from '../models/User.model.js';

// Helper function to calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
};

// Helper function to check user active status
const checkUserActiveStatus = (lastActiveAt) => {
  if (!lastActiveAt) {
    return {
      status: 'offline',
      hoursAgo: null,
      minutesAgo: null,
      isActive: false,
      displayText: 'Offline'
    };
  }

  const now = new Date();
  const lastActive = new Date(lastActiveAt);
  const diffMs = now - lastActive;
  const diffHours = diffMs / (1000 * 60 * 60);
  const diffMinutes = diffMs / (1000 * 60);

  if (diffMinutes <= 5) {
    return {
      status: 'online',
      hoursAgo: 0,
      minutesAgo: Math.floor(diffMinutes),
      isActive: true,
      displayText: 'Online'
    };
  } else if (diffMinutes <= 30) {
    return {
      status: 'recently_active',
      hoursAgo: 0,
      minutesAgo: Math.floor(diffMinutes),
      isActive: true,
      displayText: `Active ${Math.floor(diffMinutes)}m ago`
    };
  } else if (diffHours < 24) {
    return {
      status: 'active_today',
      hoursAgo: Math.floor(diffHours),
      minutesAgo: null,
      isActive: true,
      displayText: `Active ${Math.floor(diffHours)}h ago`
    };
  } else if (diffHours <= 168) { // 1 week
    return {
      status: 'active_this_week',
      hoursAgo: Math.floor(diffHours),
      minutesAgo: null,
      isActive: true,
      displayText: `Active ${Math.floor(diffHours / 24)}d ago`
    };
  } else {
    return {
      status: 'offline',
      hoursAgo: Math.floor(diffHours),
      minutesAgo: null,
      isActive: false,
      displayText: 'Offline'
    };
  }
};


// @desc    Get discovery feed
// @route   GET /api/discovery
// @access  Private
export const getDiscoveryFeed = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Update lastActiveAt
    await User.findByIdAndUpdate(userId, { lastActiveAt: new Date() });
    
    // Parse and validate page and limit
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    
    // Ensure valid values
    const validPage = page > 0 ? page : 1;
    const validLimit = limit > 0 && limit <= 100 ? limit : 20;

    console.log('=== GET DISCOVERY FEED ===');
    console.log('User ID:', userId);
    console.log('Page:', validPage, 'Limit:', validLimit);

    // Get user's profile
    const userProfile = await Profile.findOne({ userId: userId });
    if (!userProfile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found. Please complete basic information first.'
      });
    }

    // Check if user has at least basic info (name, gender, age, orientation, lookingFor)
    if (!userProfile.name || !userProfile.gender || !userProfile.orientation || !userProfile.lookingFor || userProfile.lookingFor.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please complete your basic information first',
        requiresBasicInfo: true
      });
    }

    // STEP 1: Exclude Users
    // Exclude: liked, disliked (passed), matched, blocked, incomplete profiles
    const interactions = await Interaction.find({ fromUser: userId });
    const matches = await Match.find({ users: userId, isActive: true });
    
    const likedUserIds = interactions.filter(i => i.type === 'like').map(i => i.toUser);
    const dislikedUserIds = interactions.filter(i => i.type === 'pass').map(i => i.toUser);
    const matchedUserIds = matches.flatMap(m => m.users.filter(u => u.toString() !== userId.toString()));
    
    const excludedUserIds = [
      userId,
      ...likedUserIds,
      ...dislikedUserIds,
      ...matchedUserIds
    ];

    // STEP 2: Filter by Preferences
    // Build query - exclude incomplete profiles (< 60% completion)
    let query = {
      userId: { $nin: excludedUserIds },
      isActive: true,
      isVisible: true,
      // Ensure profiles have basic info
      name: { $exists: true, $ne: null },
      gender: { $exists: true, $ne: null },
      orientation: { $exists: true, $ne: null },
      lookingFor: { $exists: true, $ne: [] },
      // Exclude incomplete profiles (< 60% completion)
      completionPercentage: { $gte: 60 }
    };
    
    console.log('Query before filters:', JSON.stringify(query, null, 2));

    // Age range filter (handle empty max age)
    // Only apply age filter if user has set preferences, otherwise show all ages
    if (userProfile.ageRange && userProfile.ageRange.min) {
      if (userProfile.ageRange.max && userProfile.ageRange.max !== '') {
        query.age = {
          $gte: Number(userProfile.ageRange.min),
          $lte: Number(userProfile.ageRange.max)
        };
      } else {
        // If max is empty, only filter by min age
        query.age = {
          $gte: Number(userProfile.ageRange.min)
        };
      }
      console.log('Age filter:', query.age);
    } else {
      // If no age range set, show profiles of all ages (18+)
      console.log('⚠️ No age range set, showing all ages');
    }

    // Gender filter (lookingFor)
    if (userProfile.lookingFor && userProfile.lookingFor.length > 0) {
      const genderMap = {
        'men': 'male',
        'women': 'female',
        'everyone': ['male', 'female', 'other']
      };
      const targetGenders = userProfile.lookingFor.flatMap(lf => {
        if (lf === 'everyone') return ['male', 'female', 'other'];
        return genderMap[lf] || [];
      });
      if (targetGenders.length > 0) {
        query.gender = { $in: targetGenders };
        console.log('Gender filter:', targetGenders);
      }
    } else {
      // If no lookingFor set, show all genders
      console.log('⚠️ No lookingFor preference set, showing all genders');
    }

    // STEP 2: Distance Preference Filter
    // Only apply distance filter if user has valid location and preference
    // If not set, show profiles from all locations
    if (userProfile.location?.coordinates && userProfile.distancePref) {
      const coordinates = userProfile.location.coordinates;
      const distancePref = Number(userProfile.distancePref) || 25;
      
      // Validate coordinates are numbers
      if (Array.isArray(coordinates) && coordinates.length === 2 && 
          typeof coordinates[0] === 'number' && typeof coordinates[1] === 'number' &&
          coordinates[0] !== 0 && coordinates[1] !== 0) { // Not default [0,0]
        query['location.coordinates'] = {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: coordinates
            },
            $maxDistance: distancePref * 1000 // Convert km to meters
          }
        };
        console.log('Distance filter applied:', distancePref, 'km');
      } else {
        console.log('⚠️ Invalid coordinates format, skipping distance filter - showing all locations');
      }
    } else {
      console.log('⚠️ No location/distance preference set, showing profiles from all locations');
    }

    // STEP 3: Get all candidates
    let profiles = await Profile.find(query)
      .populate('userId', 'isPremium lastActiveAt')
      .sort({ createdAt: -1 }); // Sort by newest first
    
    console.log('Found profiles:', profiles.length);
    console.log('Excluded user IDs:', excludedUserIds.length);
    console.log('Excluded IDs:', excludedUserIds.map(id => id.toString()));
    console.log('User profile:', {
      age: userProfile.age,
      ageRange: userProfile.ageRange,
      lookingFor: userProfile.lookingFor,
      location: userProfile.location?.city,
      coordinates: userProfile.location?.coordinates,
      distancePref: userProfile.distancePref
    });
    console.log('Query filters:', JSON.stringify(query, null, 2));
    
    // If no profiles found, try with more lenient filters
    if (profiles.length === 0) {
      console.log('⚠️ No profiles found with strict filters. Trying lenient filters...');
      
      // Try without age filter (if it was applied)
      if (query.age) {
        delete query.age;
        console.log('   - Removed age filter, trying again...');
        profiles = await Profile.find(query)
          .populate('userId', 'isPremium lastActiveAt')
          .sort({ createdAt: -1 });
        console.log('   - Found profiles without age filter:', profiles.length);
      }
      
      // If still no profiles, try without distance filter
      if (profiles.length === 0 && query['location.coordinates']) {
        delete query['location.coordinates'];
        console.log('   - Removed distance filter, trying again...');
        profiles = await Profile.find(query)
          .populate('userId', 'isPremium lastActiveAt')
          .sort({ createdAt: -1 });
        console.log('   - Found profiles without distance filter:', profiles.length);
      }
      
      // If still no profiles, log detailed info
      if (profiles.length === 0) {
        console.log('⚠️ No profiles found even with lenient filters. Possible reasons:');
        console.log('   - All profiles already interacted with');
        console.log('   - Gender filter too strict');
        console.log('   - All profiles incomplete (< 60% completion)');
        
        // Check total profiles in database for debugging
        const totalProfiles = await Profile.countDocuments({ isActive: true, isVisible: true });
        const totalMatchingBasic = await Profile.countDocuments({
          isActive: true,
          isVisible: true,
          name: { $exists: true, $ne: null },
          gender: { $exists: true, $ne: null },
          completionPercentage: { $gte: 60 }
        });
        console.log('   - Total active profiles:', totalProfiles);
        console.log('   - Total profiles with basic info (60%+):', totalMatchingBasic);
        
        // Return empty array with helpful message
        return res.status(200).json({
          success: true,
          count: 0,
          total: 0,
          profiles: [],
          message: 'No profiles found. Try adjusting your preferences or complete your profile.'
        });
      }
    }

    // Add distance and active status for display (no scoring)
    const profilesWithInfo = profiles.map(profile => {
      const otherUser = profile.userId; // Populated User
      const lastActiveAt = otherUser?.lastActiveAt;
      const activeStatus = checkUserActiveStatus(lastActiveAt);

      // Calculate distance for display
      let distance = null;
      if (userProfile.location?.coordinates && profile.location?.coordinates) {
        distance = calculateDistance(
          userProfile.location.coordinates[1],
          userProfile.location.coordinates[0],
          profile.location.coordinates[1],
          profile.location.coordinates[0]
        );
      }

      return {
        ...profile.toObject(),
        activeStatus: activeStatus,
        distance: distance ? Math.round(distance) : null
      };
    });
    
    // Apply pagination
    const paginatedProfiles = profilesWithInfo
      .slice((validPage - 1) * validLimit, validPage * validLimit);

    console.log('=== DISCOVERY FEED SUCCESS ===');
    console.log('Total candidates:', profilesWithInfo.length);
    console.log('Returning', paginatedProfiles.length, 'profiles (page', validPage, ')\n');

    res.status(200).json({
      success: true,
      count: paginatedProfiles.length,
      total: profilesWithInfo.length,
      profiles: paginatedProfiles
    });
  } catch (error) {
    console.error('\n❌ === GET DISCOVERY FEED ERROR ===');
    console.error('Error details:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('===================================\n');
    res.status(500).json({
      success: false,
      message: 'Error fetching discovery feed',
      error: error.message
    });
  }
};

// @desc    Like a profile
// @route   POST /api/discovery/like
// @access  Private
export const likeProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Update lastActiveAt
    await User.findByIdAndUpdate(userId, { lastActiveAt: new Date() });
    
    const { targetUserId, type = 'like' } = req.body;

    if (!targetUserId) {
      return res.status(400).json({
        success: false,
        message: 'Target user ID is required'
      });
    }

    if (userId.toString() === targetUserId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot like your own profile'
      });
    }

    // Check if user's profile is complete for swiping
    const userProfile = await Profile.findOne({ userId: userId });
    if (!userProfile) {
      return res.status(400).json({
        success: false,
        message: 'Please complete your basic information first',
        requiresBasicInfo: true
      });
    }

    // Check if profile has required fields for swiping
    const missingFields = [];
    if (!userProfile.location || !userProfile.location.city) missingFields.push('location');
    if (!userProfile.ageRange || !userProfile.ageRange.min || !userProfile.ageRange.max) missingFields.push('preferences');
    if (!userProfile.interests || userProfile.interests.length < 3) missingFields.push('interests');
    if (!userProfile.personality || Object.keys(userProfile.personality).length < 8) missingFields.push('personality');
    if (!userProfile.dealbreakers || Object.keys(userProfile.dealbreakers).length < 4) missingFields.push('dealbreakers');
    if (!userProfile.photos || userProfile.photos.length < 4) missingFields.push('photos');
    if (!userProfile.bio || userProfile.bio.trim().length === 0) missingFields.push('bio');

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Please complete your profile to start swiping',
        requiresProfileCompletion: true,
        missingFields: missingFields
      });
    }

    // Check if already liked
    const existingInteraction = await Interaction.findOne({
      fromUser: userId,
      toUser: targetUserId
    });

    if (existingInteraction) {
      return res.status(400).json({
        success: false,
        message: 'Already interacted with this profile'
      });
    }

    // Create interaction
    const interaction = await Interaction.create({
      fromUser: userId,
      toUser: targetUserId,
      type: type
    });

    // Check if it's a match (other user also liked this user)
    const reverseInteraction = await Interaction.findOne({
      fromUser: targetUserId,
      toUser: userId,
      type: { $in: ['like', 'superlike'] }
    });

    let isMatch = false;
    let match = null;

    if (reverseInteraction) {
      // It's a match!
      isMatch = true;
      match = await Match.create({
        users: [userId, targetUserId],
        matchedAt: new Date()
      });
    }

    res.status(200).json({
      success: true,
      message: isMatch ? 'It\'s a match!' : 'Profile liked',
      interaction: interaction,
      isMatch: isMatch,
      match: match
    });
  } catch (error) {
    console.error('Like profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error liking profile',
      error: error.message
    });
  }
};

// @desc    Pass a profile
// @route   POST /api/discovery/pass
// @access  Private
export const passProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Update lastActiveAt
    await User.findByIdAndUpdate(userId, { lastActiveAt: new Date() });
    
    const { targetUserId } = req.body;

    if (!targetUserId) {
      return res.status(400).json({
        success: false,
        message: 'Target user ID is required'
      });
    }

    // Check if user's profile is complete for swiping
    const userProfile = await Profile.findOne({ userId: userId });
    if (!userProfile) {
      return res.status(400).json({
        success: false,
        message: 'Please complete your basic information first',
        requiresBasicInfo: true
      });
    }

    // Check if profile has required fields for swiping
    const missingFields = [];
    if (!userProfile.location || !userProfile.location.city) missingFields.push('location');
    if (!userProfile.ageRange || !userProfile.ageRange.min || !userProfile.ageRange.max) missingFields.push('preferences');
    if (!userProfile.interests || userProfile.interests.length < 3) missingFields.push('interests');
    if (!userProfile.personality || Object.keys(userProfile.personality).length < 8) missingFields.push('personality');
    if (!userProfile.dealbreakers || Object.keys(userProfile.dealbreakers).length < 4) missingFields.push('dealbreakers');
    if (!userProfile.photos || userProfile.photos.length < 4) missingFields.push('photos');
    if (!userProfile.bio || userProfile.bio.trim().length === 0) missingFields.push('bio');

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Please complete your profile to start swiping',
        requiresProfileCompletion: true,
        missingFields: missingFields
      });
    }

    // Check if already interacted
    const existingInteraction = await Interaction.findOne({
      fromUser: userId,
      toUser: targetUserId
    });

    if (existingInteraction) {
      return res.status(400).json({
        success: false,
        message: 'Already interacted with this profile'
      });
    }

    // Create pass interaction
    const interaction = await Interaction.create({
      fromUser: userId,
      toUser: targetUserId,
      type: 'pass'
    });

    res.status(200).json({
      success: true,
      message: 'Profile passed',
      interaction: interaction
    });
  } catch (error) {
    console.error('Pass profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error passing profile',
      error: error.message
    });
  }
};

// @desc    Get matches
// @route   GET /api/discovery/matches
// @access  Private
export const getMatches = async (req, res) => {
  try {
    const userId = req.user._id;

    const matches = await Match.find({
      users: userId,
      isActive: true
    })
      .populate({
        path: 'users',
        select: 'phone',
        populate: {
          path: 'profile',
          model: 'Profile',
          select: 'name age photos bio'
        }
      })
      .sort({ lastMessageAt: -1, matchedAt: -1 });

    // Filter out current user from matches
    const formattedMatches = matches.map(match => {
      const otherUser = match.users.find(u => u._id.toString() !== userId.toString());
      return {
        matchId: match._id,
        user: otherUser,
        matchedAt: match.matchedAt,
        lastMessageAt: match.lastMessageAt
      };
    });

    res.status(200).json({
      success: true,
      count: formattedMatches.length,
      matches: formattedMatches
    });
  } catch (error) {
    console.error('Get matches error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching matches',
      error: error.message
    });
  }
};

// @desc    Get next best match (single user)
// @route   GET /api/discovery/next-user
// @access  Private
export const getNextUser = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Update lastActiveAt
    await User.findByIdAndUpdate(userId, { lastActiveAt: new Date() });

    // Get user's profile
    const userProfile = await Profile.findOne({ userId: userId });
    if (!userProfile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found. Please complete basic information first.'
      });
    }

    // Check basic info
    if (!userProfile.name || !userProfile.gender || !userProfile.orientation || !userProfile.lookingFor || userProfile.lookingFor.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please complete your basic information first',
        requiresBasicInfo: true
      });
    }

    // Get user's interactions (likes, passes, matches)
    const interactions = await Interaction.find({ fromUser: userId });
    const matches = await Match.find({ users: userId, isActive: true });
    
    const excludedUserIds = [
      userId,
      ...interactions.map(i => i.toUser),
      ...matches.flatMap(m => m.users.filter(u => u.toString() !== userId.toString()))
    ];

    // STEP 2: Filter by Preferences
    let query = {
      userId: { $nin: excludedUserIds },
      isActive: true,
      isVisible: true,
      name: { $exists: true, $ne: null },
      gender: { $exists: true, $ne: null },
      orientation: { $exists: true, $ne: null },
      lookingFor: { $exists: true, $ne: [] },
      // Exclude incomplete profiles (< 60% completion)
      completionPercentage: { $gte: 60 }
    };

    // Age range filter (handle empty max age)
    if (userProfile.ageRange && userProfile.ageRange.min) {
      if (userProfile.ageRange.max && userProfile.ageRange.max !== '') {
        query.age = {
          $gte: Number(userProfile.ageRange.min),
          $lte: Number(userProfile.ageRange.max)
        };
      } else {
        // If max is empty, only filter by min age
        query.age = {
          $gte: Number(userProfile.ageRange.min)
        };
      }
    }

    // Gender filter
    if (userProfile.lookingFor && userProfile.lookingFor.length > 0) {
      const genderMap = {
        'men': 'male',
        'women': 'female',
        'everyone': ['male', 'female', 'other']
      };
      const targetGenders = userProfile.lookingFor.flatMap(lf => {
        if (lf === 'everyone') return ['male', 'female', 'other'];
        return genderMap[lf] || [];
      });
      query.gender = { $in: targetGenders };
    }

    // STEP 2: Distance Preference Filter
    if (userProfile.location?.coordinates && userProfile.distancePref) {
      const coordinates = userProfile.location.coordinates;
      const distancePref = Number(userProfile.distancePref) || 25;
      
      if (Array.isArray(coordinates) && coordinates.length === 2 && 
          typeof coordinates[0] === 'number' && typeof coordinates[1] === 'number' &&
          coordinates[0] !== 0 && coordinates[1] !== 0) { // Not default [0,0]
        query['location.coordinates'] = {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: coordinates
            },
            $maxDistance: distancePref * 1000
          }
        };
      }
    }

    // STEP 3: Get all candidates
    let profiles = await Profile.find(query)
      .populate('userId', 'isPremium lastActiveAt')
      .sort({ createdAt: -1 }) // Sort by newest first
      .limit(1); // Get first profile

    if (profiles.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No more profiles available',
        profile: null
      });
    }

    // Add distance and active status for display (no scoring)
    const profile = profiles[0];
    const otherUser = profile.userId; // Populated User
    const lastActiveAt = otherUser?.lastActiveAt;
    const activeStatus = checkUserActiveStatus(lastActiveAt);

    // Calculate distance for display
    let distance = null;
    if (userProfile.location?.coordinates && profile.location?.coordinates) {
      distance = calculateDistance(
        userProfile.location.coordinates[1],
        userProfile.location.coordinates[0],
        profile.location.coordinates[1],
        profile.location.coordinates[0]
      );
    }

    const profileWithInfo = {
      ...profile.toObject(),
      activeStatus: activeStatus,
      distance: distance ? Math.round(distance) : null
    };

    res.status(200).json({
      success: true,
      profile: profileWithInfo
    });
  } catch (error) {
    console.error('Get next user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching next user',
      error: error.message
    });
  }
};


