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

// Helper function to calculate match score
const calculateMatchScore = (userProfile, otherProfile) => {
  let score = 0;
  let reasons = [];

  // Age compatibility (within age range)
  if (userProfile.ageRange && otherProfile.age) {
    if (otherProfile.age >= userProfile.ageRange.min && 
        otherProfile.age <= userProfile.ageRange.max) {
      score += 20;
      reasons.push('Age compatible');
    }
  }

  // Distance compatibility
  if (userProfile.location?.coordinates && otherProfile.location?.coordinates) {
    const distance = calculateDistance(
      userProfile.location.coordinates[1],
      userProfile.location.coordinates[0],
      otherProfile.location.coordinates[1],
      otherProfile.location.coordinates[0]
    );
    if (distance <= (userProfile.distancePref || 25)) {
      score += 15;
      reasons.push('Near you');
    }
  }

  // Common interests
  if (userProfile.interests && otherProfile.interests) {
    const commonInterests = userProfile.interests.filter(interest =>
      otherProfile.interests.includes(interest)
    );
    const interestScore = Math.min(commonInterests.length * 10, 30);
    score += interestScore;
    if (commonInterests.length > 0) {
      reasons.push(`${commonInterests.length} common interests`);
    }
  }

  // Personality compatibility
  if (userProfile.personality && otherProfile.personality) {
    let personalityMatches = 0;
    const traits = ['social', 'planning', 'romantic', 'morning', 'homebody', 'serious', 'decision', 'communication'];
    traits.forEach(trait => {
      if (userProfile.personality[trait] && 
          otherProfile.personality[trait] &&
          userProfile.personality[trait] === otherProfile.personality[trait]) {
        personalityMatches++;
      }
    });
    score += Math.min(personalityMatches * 5, 20);
    if (personalityMatches > 0) {
      reasons.push('Similar personality');
    }
  }

  // Dealbreakers check
  if (userProfile.dealbreakers && otherProfile.dealbreakers) {
    // Check for dealbreakers
    const dealbreakers = ['kids', 'smoking', 'pets', 'drinking'];
    let dealbreakerMatches = true;
    dealbreakers.forEach(dealbreaker => {
      if (userProfile.dealbreakers[dealbreaker] && 
          otherProfile.dealbreakers[dealbreaker] &&
          userProfile.dealbreakers[dealbreaker] !== otherProfile.dealbreakers[dealbreaker]) {
        dealbreakerMatches = false;
      }
    });
    if (dealbreakerMatches) {
      score += 15;
      reasons.push('Compatible preferences');
    } else {
      score = Math.max(0, score - 30); // Heavy penalty for dealbreakers
    }
  }

  return { score: Math.min(score, 100), reasons };
};

// @desc    Get discovery feed
// @route   GET /api/discovery
// @access  Private
export const getDiscoveryFeed = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20 } = req.query;

    // Get user's profile
    const userProfile = await Profile.findOne({ userId: userId });
    if (!userProfile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found. Please complete your profile first.'
      });
    }

    // Get user's interactions (likes and passes)
    const interactions = await Interaction.find({ fromUser: userId });
    const excludedUserIds = [
      userId,
      ...interactions.map(i => i.toUser)
    ];

    // Build query
    let query = {
      userId: { $nin: excludedUserIds },
      isActive: true,
      isVisible: true,
      onboardingCompleted: true
    };

    // Age range filter
    if (userProfile.ageRange) {
      query.age = {
        $gte: userProfile.ageRange.min,
        $lte: userProfile.ageRange.max
      };
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
      query.gender = { $in: targetGenders };
    }

    // Location filter (if coordinates available)
    if (userProfile.location?.coordinates && userProfile.distancePref) {
      query['location.coordinates'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: userProfile.location.coordinates
          },
          $maxDistance: userProfile.distancePref * 1000 // Convert km to meters
        }
      };
    }

    // Get profiles
    const profiles = await Profile.find(query)
      .populate('userId', 'isPremium lastActiveAt')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    // Calculate match scores
    const profilesWithScores = profiles.map(profile => {
      const matchResult = calculateMatchScore(userProfile, profile);
      const distance = userProfile.location?.coordinates && profile.location?.coordinates
        ? calculateDistance(
            userProfile.location.coordinates[1],
            userProfile.location.coordinates[0],
            profile.location.coordinates[1],
            profile.location.coordinates[0]
          )
        : null;

      return {
        ...profile.toObject(),
        matchScore: matchResult.score,
        matchReasons: matchResult.reasons,
        distance: distance ? Math.round(distance) : null
      };
    });

    // Sort by match score
    profilesWithScores.sort((a, b) => b.matchScore - a.matchScore);

    res.status(200).json({
      success: true,
      count: profilesWithScores.length,
      profiles: profilesWithScores
    });
  } catch (error) {
    console.error('Get discovery feed error:', error);
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
    const { targetUserId } = req.body;

    if (!targetUserId) {
      return res.status(400).json({
        success: false,
        message: 'Target user ID is required'
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

