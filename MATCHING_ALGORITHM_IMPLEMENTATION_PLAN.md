# Complete Matching Algorithm Implementation Plan

## Overview
Implement a comprehensive rule-based matching algorithm with weighted scoring, swipe system, match detection, and dummy data seeding for testing.

---

## Phase 1: Backend Algorithm Enhancement

### 1.1 Add Last Active Status Helper Function

**File: `backend/src/controllers/discovery.controller.js`**

Add after `calculateDistance` function:

```javascript
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
```

### 1.2 Update calculateMatchScore Function

**File: `backend/src/controllers/discovery.controller.js`**

Replace existing `calculateMatchScore` function with enhanced version:

```javascript
// Helper function to calculate match score with weighted components
const calculateMatchScore = (userProfile, otherProfile) => {
  let score = 0;
  let reasons = [];

  // ✅ 1. LAST ACTIVE STATUS SCORING (15% weight = 15 points max)
  const otherUser = otherProfile.userId; // Populated User
  const lastActiveAt = otherUser?.lastActiveAt;
  
  const activeStatus = checkUserActiveStatus(lastActiveAt);
  
  let lastActiveScore = 0;
  if (activeStatus.status === 'online') {
    lastActiveScore = 15; // Full score for online
    reasons.push('Online now');
  } else if (activeStatus.status === 'recently_active') {
    lastActiveScore = 12; // High score for recently active
    reasons.push('Active recently');
  } else if (activeStatus.status === 'active_today') {
    lastActiveScore = 10; // Good score for active today
    reasons.push('Active today');
  } else if (activeStatus.status === 'active_this_week') {
    // Decay formula: 15 * (1 - hoursAgo / 168)
    const hoursAgo = activeStatus.hoursAgo;
    lastActiveScore = Math.max(0, 15 * (1 - hoursAgo / 168));
    reasons.push(`Active ${Math.floor(hoursAgo / 24)} days ago`);
  } else {
    lastActiveScore = 0; // No score for offline
  }
  
  score += lastActiveScore;
  
  // Activity Boost: +5 points if active in last 24 hours
  if (activeStatus.hoursAgo !== null && activeStatus.hoursAgo <= 24) {
    score += 5;
  }

  // ✅ 2. DISTANCE SCORING (25% weight = 25 points max)
  if (userProfile.location?.coordinates && otherProfile.location?.coordinates) {
    const distance = calculateDistance(
      userProfile.location.coordinates[1],
      userProfile.location.coordinates[0],
      otherProfile.location.coordinates[1],
      otherProfile.location.coordinates[0]
    );
    
    const maxDistance = userProfile.distancePref || 25;
    if (distance <= maxDistance) {
      const distanceScore = 25 * (1 - distance / maxDistance);
      score += distanceScore;
      reasons.push(`${Math.round(distance)}km away`);
    } else if (distance <= maxDistance * 2) {
      // Slightly far but still show
      const distanceScore = 10 * (1 - (distance - maxDistance) / maxDistance);
      score += Math.max(0, distanceScore);
      reasons.push(`${Math.round(distance)}km away`);
    }
  }

  // ✅ 3. MUTUAL INTERESTS SCORING (20% weight = 20 points max)
  if (userProfile.interests && otherProfile.interests) {
    const commonInterests = userProfile.interests.filter(interest =>
      otherProfile.interests.includes(interest)
    );
    const maxInterests = Math.max(3, userProfile.interests.length);
    const interestScore = 20 * (commonInterests.length / maxInterests);
    score += interestScore;
    if (commonInterests.length > 0) {
      reasons.push(`${commonInterests.length} common interests`);
    }
  }

  // ✅ 4. AGE PREFERENCE MATCH (15% weight = 15 points)
  if (userProfile.ageRange && otherProfile.age) {
    if (otherProfile.age >= userProfile.ageRange.min && 
        otherProfile.age <= userProfile.ageRange.max) {
      score += 15;
      reasons.push('Age compatible');
    }
  }

  // ✅ 5. PROFILE COMPLETENESS SCORING (10% weight = 10 points max)
  const completeness = otherProfile.completionPercentage || 0;
  const completenessScore = 10 * (completeness / 100);
  score += completenessScore;
  if (completeness >= 80) {
    reasons.push('Complete profile');
  }

  // ✅ 6. PERSONALITY COMPATIBILITY (10% weight = 10 points max)
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
    const personalityScore = 10 * (personalityMatches / 8);
    score += personalityScore;
    if (personalityMatches > 0) {
      reasons.push(`${personalityMatches} personality matches`);
    }
  }

  // ✅ 7. DEALBREAKERS CHECK (5% weight or -30 penalty)
  if (userProfile.dealbreakers && otherProfile.dealbreakers) {
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
      score += 5;
      reasons.push('Compatible preferences');
    } else {
      score = Math.max(0, score - 30); // Heavy penalty
      reasons.push('Dealbreaker mismatch');
    }
  }

  // ✅ 8. PREMIUM BOOST (10% boost if premium)
  if (otherUser?.isPremium) {
    score += score * 0.1; // 10% boost
    reasons.push('Premium member');
  }

  // ✅ 9. NEW USER BOOST (+5 points if created in last 7 days)
  if (otherProfile.createdAt) {
    const daysSinceCreation = (new Date() - new Date(otherProfile.createdAt)) / (1000 * 60 * 60 * 24);
    if (daysSinceCreation <= 7) {
      score += 5;
      reasons.push('New member');
    }
  }

  // ✅ 10. PHOTO QUALITY BOOST (+3 points if 6+ photos)
  if (otherProfile.photos && otherProfile.photos.length >= 6) {
    score += 3;
    reasons.push('Multiple photos');
  }

  // Cap at 100
  score = Math.min(score, 100);

  return { 
    score: Math.round(score), 
    reasons,
    activeStatus: activeStatus
  };
};
```

### 1.3 Update lastActiveAt on User Actions

**File: `backend/src/controllers/discovery.controller.js`**

**Update `likeProfile` function:**
- Add `await User.findByIdAndUpdate(userId, { lastActiveAt: new Date() });` at the start (after userId extraction)

**Update `passProfile` function:**
- Add `await User.findByIdAndUpdate(userId, { lastActiveAt: new Date() });` at the start (after userId extraction)

**Update `getDiscoveryFeed` function:**
- Add `await User.findByIdAndUpdate(userId, { lastActiveAt: new Date() });` at the start (after userId extraction)

### 1.4 Update getDiscoveryFeed Response

**File: `backend/src/controllers/discovery.controller.js`**

In `getDiscoveryFeed` function, update `profilesWithScores` mapping:

```javascript
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

  // Get active status
  const otherUser = profile.userId; // Populated
  const activeStatus = checkUserActiveStatus(otherUser?.lastActiveAt);

  return {
    ...profile.toObject(),
    matchScore: matchResult.score,
    matchReasons: matchResult.reasons,
    activeStatus: activeStatus, // ✅ Add active status
    distance: distance ? Math.round(distance) : null
  };
});
```

### 1.5 Create getNextUser Endpoint

**File: `backend/src/controllers/discovery.controller.js`**

Add new function:

```javascript
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

    // Build query
    let query = {
      userId: { $nin: excludedUserIds },
      isActive: true,
      isVisible: true,
      name: { $exists: true, $ne: null },
      gender: { $exists: true, $ne: null },
      orientation: { $exists: true, $ne: null },
      lookingFor: { $exists: true, $ne: [] }
    };

    // Age range filter
    if (userProfile.ageRange && userProfile.ageRange.min && userProfile.ageRange.max) {
      query.age = {
        $gte: Number(userProfile.ageRange.min),
        $lte: Number(userProfile.ageRange.max)
      };
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

    // Location filter
    if (userProfile.location?.coordinates && userProfile.distancePref) {
      const coordinates = userProfile.location.coordinates;
      const distancePref = Number(userProfile.distancePref) || 25;
      
      if (Array.isArray(coordinates) && coordinates.length === 2 && 
          typeof coordinates[0] === 'number' && typeof coordinates[1] === 'number') {
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

    // Get all potential matches
    let profiles = await Profile.find(query)
      .populate('userId', 'isPremium lastActiveAt')
      .limit(100); // Get more to calculate scores

    if (profiles.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No more profiles available',
        profile: null
      });
    }

    // Calculate match scores for all
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
        activeStatus: matchResult.activeStatus,
        distance: distance ? Math.round(distance) : null
      };
    });

    // Sort by match score (highest first)
    profilesWithScores.sort((a, b) => b.matchScore - a.matchScore);

    // Return top match
    const topMatch = profilesWithScores[0];

    res.status(200).json({
      success: true,
      profile: topMatch
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
```

**File: `backend/src/routes/discovery.routes.js`**

Add route:
```javascript
import { getNextUser } from '../controllers/discovery.controller.js';

router.get('/next-user', getNextUser);
```

---

## Phase 2: Frontend Integration

### 2.1 Update discoveryService

**File: `frontend/src/services/discoveryService.js`**

Add `getNextUser` function:

```javascript
export const discoveryService = {
  // ... existing functions

  // Get next best match (single user)
  getNextUser: async () => {
    const response = await api.get(API_ENDPOINTS.DISCOVERY.NEXT_USER);
    return response;
  }
};
```

**File: `frontend/src/config/api.js`**

Add endpoint:
```javascript
DISCOVERY: {
  FEED: '/discovery',
  LIKE: '/discovery/like',
  PASS: '/discovery/pass',
  MATCHES: '/discovery/matches',
  NEXT_USER: '/discovery/next-user' // ✅ Add this
}
```

### 2.2 Update DiscoveryFeedPage to Use Backend API

**File: `frontend/src/pages/DiscoveryFeedPage.jsx`**

**Replace localStorage logic with API calls:**

1. **Update profile loading:**
```javascript
// Replace loadProfiles function
const loadProfiles = async () => {
  setIsLoadingProfiles(true);
  
  try {
    // ✅ Load from backend API
    const response = await discoveryService.getDiscoveryFeed();
    
    if (response.success && response.profiles) {
      setProfiles(response.profiles);
    } else {
      setProfiles([]);
    }
  } catch (error) {
    console.error('Error loading profiles:', error);
    setProfiles([]);
  } finally {
    setIsLoadingProfiles(false);
  }
};
```

2. **Update handleLike function:**
```javascript
const handleLike = async () => {
  // Check if profile is complete
  const isComplete = await checkProfileCompletion();
  if (!isComplete) {
    setShowCompleteDetailsModal(true);
    return;
  }

  if (!isPremium && dailyLikes.count >= DAILY_LIKE_LIMIT) {
    setShowPremiumPrompt(true);
    return;
  }

  const currentProfile = profiles[currentIndex];
  if (!currentProfile) return;

  try {
    // ✅ Call backend API
    const response = await discoveryService.likeProfile(currentProfile.userId);
    
    if (response.success) {
      // Update daily likes
      if (!isPremium) {
        const newDailyLikes = { ...dailyLikes, count: dailyLikes.count + 1 };
        setDailyLikes(newDailyLikes);
        localStorage.setItem('dailyLikes', JSON.stringify(newDailyLikes));
      }

      // Check if it's a match
      if (response.isMatch) {
        setMatchedProfile(currentProfile);
        setShowMatchModal(true);
      }

      // Start swipe animation
      setSwipeDirection('right');
      
      // Move to next profile
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
        setCurrentPhotoIndex(0);
        setSwipeDirection(null);
        setDragX(0);
        
        // ✅ Load next profile from backend
        loadNextProfile();
      }, 350);
    }
  } catch (error) {
    console.error('Error liking profile:', error);
    alert('Error liking profile. Please try again.');
  }
};
```

3. **Update handlePass function:**
```javascript
const handlePass = async () => {
  // Check if profile is complete
  const isComplete = await checkProfileCompletion();
  if (!isComplete) {
    setShowCompleteDetailsModal(true);
    return;
  }

  const currentProfile = profiles[currentIndex];
  if (!currentProfile) return;

  try {
    // ✅ Call backend API
    await discoveryService.passProfile(currentProfile.userId);

    // Start swipe animation
    setSwipeDirection('left');

    // Move to next profile
    setTimeout(() => {
      setCurrentIndex(currentIndex + 1);
      setCurrentPhotoIndex(0);
      setSwipeDirection(null);
      setDragX(0);
      
      // ✅ Load next profile from backend
      loadNextProfile();
    }, 350);
  } catch (error) {
    console.error('Error passing profile:', error);
    alert('Error passing profile. Please try again.');
  }
};
```

4. **Add loadNextProfile function:**
```javascript
const loadNextProfile = async () => {
  try {
    // ✅ Get next user from backend
    const response = await discoveryService.getNextUser();
    
    if (response.success && response.profile) {
      // Add to profiles array
      setProfiles(prev => [...prev, response.profile]);
    }
  } catch (error) {
    console.error('Error loading next profile:', error);
  }
};
```

5. **Remove mock data imports:**
```javascript
// Remove this line:
// import { mockProfiles, calculateMatchScore, calculateDistance } from '../data/mockProfiles';
```

---

## Phase 3: Dummy Data Seeding Script

### 3.1 Create Seed Script

**File: `backend/seedDatabase.js`**

Create new file with complete seeding script:

```javascript
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.model.js';
import Profile from './src/models/Profile.model.js';
import { Interaction, Match } from './src/models/Interaction.model.js';

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dating-app');
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Dummy data arrays
const names = ['Priya', 'Rahul', 'Ananya', 'Arjun', 'Kavya', 'Vikram', 'Sneha', 'Rohan', 'Meera', 'Aditya'];
const cities = [
  { name: 'Mumbai', coordinates: [72.8777, 19.0760] },
  { name: 'Delhi', coordinates: [77.2090, 28.6139] },
  { name: 'Bangalore', coordinates: [77.5946, 12.9716] },
  { name: 'Hyderabad', coordinates: [78.4867, 17.3850] },
  { name: 'Chennai', coordinates: [80.2707, 13.0827] },
  { name: 'Pune', coordinates: [73.8567, 18.5204] },
  { name: 'Kolkata', coordinates: [88.3639, 22.5726] },
  { name: 'Jaipur', coordinates: [75.7873, 26.9124] }
];

const interests = [
  'Travel', 'Music', 'Cooking', 'Photography', 'Yoga', 'Fitness', 'Reading', 
  'Movies', 'Dancing', 'Art', 'Writing', 'Sports', 'Gaming', 'Trekking', 
  'Camping', 'Meditation', 'Fashion', 'Food', 'Technology', 'Nature'
];

const personalityTraits = {
  social: ['social', 'introvert', 'extrovert', 'ambivert'],
  planning: ['planner', 'spontaneous', 'balanced'],
  romantic: ['romantic', 'practical', 'balanced'],
  morning: ['morning', 'night', 'morning-person', 'night-owl', 'balanced'],
  homebody: ['homebody', 'outgoing', 'adventurer', 'balanced'],
  serious: ['serious', 'casual', 'balanced', 'fun-loving', 'fun'],
  decision: ['quick', 'thoughtful', 'decisive', 'indecisive', 'balanced', 'decision-maker', 'go-with-flow'],
  communication: ['direct', 'subtle', 'balanced']
};

const dealbreakerOptions = {
  kids: ['want-kids', 'dont-want-kids', 'have-kids', 'not-sure'],
  smoking: ['smoker', 'non-smoker', 'social-smoker', 'prefer-non-smoker'],
  pets: ['love-pets', 'have-pets', 'allergic', 'not-interested'],
  drinking: ['never', 'occasionally', 'socially', 'regularly']
};

const languages = ['Hindi', 'English', 'Marathi', 'Tamil', 'Telugu', 'Bengali', 'Gujarati', 'Kannada', 'Malayalam', 'Punjabi'];

const prompts = [
  "What's the best way to ask you out?",
  "I'm a great +1 for...",
  "The way to my heart is...",
  "My simple pleasures...",
  "I'll fall for you if...",
  "We'll get along if...",
  "I'm weirdly attracted to...",
  "The most spontaneous thing I've done...",
  "My biggest fear...",
  "I'm looking for..."
];

// Helper functions
const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];
const getRandomItems = (array, count) => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};
const getRandomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};
const calculateAge = (dob) => {
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// Create dummy users and profiles
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Clear existing data
    await User.deleteMany({});
    await Profile.deleteMany({});
    await Interaction.deleteMany({});
    await Match.deleteMany({});
    console.log('✅ Cleared existing data\n');

    const createdUsers = [];
    const createdProfiles = [];

    // Create 20 dummy users
    for (let i = 0; i < 20; i++) {
      const name = names[i % names.length] + (i > 9 ? ` ${Math.floor(i / 10)}` : '');
      const phone = `9876543${String(i).padStart(3, '0')}`;
      const gender = i % 2 === 0 ? 'female' : 'male';
      const city = getRandomItem(cities);
      
      // Create user
      const user = await User.create({
        phone: phone,
        countryCode: '+91',
        isPhoneVerified: true,
        isVerified: true,
        lastActiveAt: getRandomDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()), // Last 7 days
        isActive: true
      });
      createdUsers.push(user);

      // Calculate DOB (age between 22-35)
      const age = 22 + Math.floor(Math.random() * 14);
      const dob = new Date();
      dob.setFullYear(dob.getFullYear() - age);

      // Create profile
      const profile = await Profile.create({
        userId: user._id,
        name: name,
        dob: dob,
        age: age,
        gender: gender,
        orientation: getRandomItem(['straight', 'bisexual', 'pansexual']),
        lookingFor: gender === 'female' ? ['men'] : ['women'],
        location: {
          city: city.name,
          coordinates: {
            type: 'Point',
            coordinates: city.coordinates
          }
        },
        ageRange: {
          min: 22,
          max: 35
        },
        distancePref: 25 + Math.floor(Math.random() * 50),
        interests: getRandomItems(interests, 5 + Math.floor(Math.random() * 5)),
        personality: {
          social: getRandomItem(personalityTraits.social),
          planning: getRandomItem(personalityTraits.planning),
          romantic: getRandomItem(personalityTraits.romantic),
          morning: getRandomItem(personalityTraits.morning),
          homebody: getRandomItem(personalityTraits.homebody),
          serious: getRandomItem(personalityTraits.serious),
          decision: getRandomItem(personalityTraits.decision),
          communication: getRandomItem(personalityTraits.communication)
        },
        dealbreakers: {
          kids: getRandomItem(dealbreakerOptions.kids),
          smoking: getRandomItem(dealbreakerOptions.smoking),
          pets: getRandomItem(dealbreakerOptions.pets),
          drinking: getRandomItem(dealbreakerOptions.drinking),
          religion: Math.random() > 0.5 ? 'Hindu' : ''
        },
        optional: {
          education: getRandomItem(['high-school', 'bachelors', 'masters', 'phd', '']),
          profession: Math.random() > 0.3 ? `Profession ${i}` : '',
          languages: getRandomItems(languages, 2 + Math.floor(Math.random() * 3)),
          horoscope: Math.random() > 0.5 ? 'Aries' : '',
          prompts: getRandomItems(prompts, 3).map(prompt => ({
            prompt: prompt,
            answer: `Sample answer for ${prompt}`
          }))
        },
        photos: Array.from({ length: 4 + Math.floor(Math.random() * 3) }, (_, idx) => ({
          url: `https://images.unsplash.com/photo-${1500000000000 + i * 1000 + idx}?w=400`,
          cloudinaryId: `dummy_${i}_${idx}`,
          isMain: idx === 0,
          order: idx
        })),
        bio: `Hi! I'm ${name}, ${age} years old from ${city.name}. Love ${getRandomItems(interests, 2).join(' and ')}. Looking for someone special!`,
        completionPercentage: 80 + Math.floor(Math.random() * 20),
        onboardingCompleted: true,
        isActive: true,
        isVisible: true
      });

      // Link profile to user
      user.profile = profile._id;
      await user.save();

      createdProfiles.push(profile);
      console.log(`✅ Created user ${i + 1}/20: ${name} (${phone})`);
    }

    console.log('\n✅ Created 20 users and profiles\n');

    // Create some interactions for testing matches
    console.log('🔗 Creating test interactions...\n');
    
    // User 0 likes User 1, User 2, User 3
    if (createdUsers[0] && createdUsers[1]) {
      await Interaction.create({
        fromUser: createdUsers[0]._id,
        toUser: createdUsers[1]._id,
        type: 'like'
      });
    }
    if (createdUsers[0] && createdUsers[2]) {
      await Interaction.create({
        fromUser: createdUsers[0]._id,
        toUser: createdUsers[2]._id,
        type: 'like'
      });
    }
    if (createdUsers[0] && createdUsers[3]) {
      await Interaction.create({
        fromUser: createdUsers[0]._id,
        toUser: createdUsers[3]._id,
        type: 'pass'
      });
    }

    // User 1 likes User 0 back (MATCH!)
    if (createdUsers[1] && createdUsers[0]) {
      await Interaction.create({
        fromUser: createdUsers[1]._id,
        toUser: createdUsers[0]._id,
        type: 'like'
      });
      
      // Create match
      await Match.create({
        users: [createdUsers[0]._id, createdUsers[1]._id],
        matchedAt: new Date(),
        isActive: true
      });
      console.log('✅ Created match between User 0 and User 1');
    }

    // User 2 likes User 0 back (MATCH!)
    if (createdUsers[2] && createdUsers[0]) {
      await Interaction.create({
        fromUser: createdUsers[2]._id,
        toUser: createdUsers[0]._id,
        type: 'like'
      });
      
      // Create match
      await Match.create({
        users: [createdUsers[0]._id, createdUsers[2]._id],
        matchedAt: new Date(),
        isActive: true
      });
      console.log('✅ Created match between User 0 and User 2');
    }

    console.log('\n✅ Database seeding completed!\n');
    console.log('📊 Summary:');
    console.log(`   - Users: ${createdUsers.length}`);
    console.log(`   - Profiles: ${createdProfiles.length}`);
    console.log(`   - Interactions: ${await Interaction.countDocuments()}`);
    console.log(`   - Matches: ${await Match.countDocuments()}\n`);
    console.log('🧪 Test Accounts:');
    console.log('   - Phone: 9876543000 (User 0 - has 2 matches)');
    console.log('   - Phone: 9876543001 (User 1 - matched with User 0)');
    console.log('   - Phone: 9876543002 (User 2 - matched with User 0)\n');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
};

// Run seeding
const runSeed = async () => {
  await connectDB();
  await seedDatabase();
  await mongoose.connection.close();
  console.log('✅ Database connection closed');
  process.exit(0);
};

runSeed();
```

### 3.2 Add Seed Script to package.json

**File: `backend/package.json`**

Add script:
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "clear-db": "node clearDatabase.js",
    "seed": "node seedDatabase.js"
  }
}
```

---

## Phase 4: Testing & Verification

### 4.1 Test Scenarios

1. **Seed Database:**
   ```bash
   cd backend
   npm run seed
   ```

2. **Test Login:**
   - Login with phone: `9876543000`
   - Verify profile loads

3. **Test Discovery Feed:**
   - Navigate to `/people`
   - Verify profiles load with match scores
   - Verify active status displays

4. **Test Swipe Right:**
   - Swipe right on a profile
   - Verify `lastActiveAt` updates
   - Verify interaction saved
   - If mutual like, verify match created

5. **Test Swipe Left:**
   - Swipe left on a profile
   - Verify `lastActiveAt` updates
   - Verify pass saved
   - Verify profile doesn't show again

6. **Test Match Detection:**
   - User 0 already liked User 1
   - Login as User 1 (phone: 9876543001)
   - Like User 0 back
   - Verify match modal shows

7. **Test Match Score:**
   - Verify scores are calculated correctly
   - Verify active users get higher scores
   - Verify sorting by score works

---

## Summary of Changes

### Backend Files:
1. `backend/src/controllers/discovery.controller.js`
   - Add `checkUserActiveStatus` helper
   - Update `calculateMatchScore` with weighted scoring
   - Update `likeProfile`, `passProfile`, `getDiscoveryFeed` to update `lastActiveAt`
   - Add `getNextUser` endpoint
   - Update response to include `activeStatus`

2. `backend/src/routes/discovery.routes.js`
   - Add `/next-user` route

3. `backend/seedDatabase.js` (NEW)
   - Create dummy users and profiles
   - Create test interactions and matches

4. `backend/package.json`
   - Add `seed` script

### Frontend Files:
1. `frontend/src/services/discoveryService.js`
   - Add `getNextUser` function

2. `frontend/src/config/api.js`
   - Add `NEXT_USER` endpoint

3. `frontend/src/pages/DiscoveryFeedPage.jsx`
   - Replace localStorage with API calls
   - Update `handleLike` and `handlePass` to use backend
   - Add `loadNextProfile` function
   - Remove mock data dependencies

---

## Algorithm Formula

```
Final Score = 
  (Last Active Score × 0-15) +
  (Distance Score × 0-25) +
  (Mutual Interests × 0-20) +
  (Age Match × 0-15) +
  (Profile Completeness × 0-10) +
  (Personality Match × 0-10) +
  (Dealbreakers × 5 or -30) +
  (Premium Boost × 10%) +
  (New User Boost +5) +
  (Photo Quality Boost +3)

Capped at 100 points maximum
```

---

## Next Steps

1. Implement backend changes
2. Implement frontend changes
3. Run seed script to create dummy data
4. Test matching algorithm
5. Test swipe functionality
6. Test match detection
7. Verify active status scoring

