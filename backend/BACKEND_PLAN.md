# Backend Structure Plan - MVC Architecture

## Overview
Complete MERN stack backend with MVC architecture for rule-based matching algorithm, swipe system, and user management.

## Project Structure

```
backend/
├── package.json
├── server.js                 # Entry point
├── .env.example
├── .gitignore
├── config/
│   ├── db.js                # MongoDB connection
│   └── app.js               # App configuration
├── models/
│   ├── User.js              # User schema with all required fields
│   └── Match.js             # Match schema
├── controllers/
│   ├── authController.js    # signup, login, refresh, getMe
│   ├── userController.js    # getProfile, updateProfile, uploadPhoto, getMyProfile
│   ├── discoverController.js # getNextUser, swipeRight, swipeLeft
│   └── matchController.js    # getMatches, getMatchById
├── routes/
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── discoverRoutes.js
│   └── matchRoutes.js
├── services/
│   ├── matchingAlgorithm.js # Rule-based matching (5 components)
│   └── profileCompleteness.js # Calculate 0-100 score
├── middleware/
│   ├── auth.js              # JWT verification
│   ├── validate.js          # Request validation
│   ├── errorHandler.js      # Error handling
│   └── responseFormatter.js # Consistent responses
└── utils/
    └── helpers.js           # Helper functions
```

## 1. Project Setup

### Dependencies to Install
```json
{
  "express": "^4.18.2",
  "mongoose": "^7.0.0",
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.0",
  "dotenv": "^16.0.3",
  "cors": "^2.8.5",
  "express-validator": "^7.0.1",
  "multer": "^1.4.5-lts.1"
}
```

## 2. Models Layer

### User Model (models/User.js)
**Required Fields:**
- `name`: String (required)
- `age`: Number (calculated from dob)
- `gender`: String (required)
- `email`: String (required, unique)
- `phone`: String
- `password`: String (hashed, required)
- `dob`: Date
- `location`: { city: String, lat: Number, lon: Number }
- `interests`: [String] (array)
- `bio`: String
- `photos`: [String] (array of URLs)
- `profileCompleted`: Number (0-100)
- `lastActive`: Date
- `createdAt`: Date
- `preferences`: {
    gender: String,
    minAge: Number,
    maxAge: Number,
    distancePref: Number
  }
- `swipes`: {
    liked: [ObjectId],
    disliked: [ObjectId],
    matched: [ObjectId]
  }
- `personality`: Object
- `dealbreakers`: Object
- `optional`: Object
- `isVerified`: Boolean
- `isPremium`: Boolean

**Methods:**
- `comparePassword(candidatePassword)` - Compare hashed password
- `generateJWT()` - Generate JWT token

**Hooks:**
- Pre-save: Calculate `profileCompleted`, update `lastActive`

### Match Model (models/Match.js)
- `userA`: ObjectId (ref: User)
- `userB`: ObjectId (ref: User)
- `matchedAt`: Date
- `status`: String (active/blocked)
- `lastMessageAt`: Date
- Indexes on userA and userB

## 3. Services Layer

### Matching Algorithm Service (services/matchingAlgorithm.js)

**Functions:**
1. `calculateDistance(lat1, lon1, lat2, lon2)` - Haversine formula for km
2. `scoreByDistance(userLocation, targetLocation, maxDistance)` - Returns 0-1
3. `scoreByLastActive(lastActive)` - Returns 0-1 based on recency
4. `scoreByProfileCompleteness(profileCompleted)` - Converts 0-100 to 0-1
5. `scoreByMutualInterests(userInterests, targetInterests)` - Jaccard similarity
6. `scoreByAgePreference(userAge, targetAge, userPreferences)` - Returns 0-1
7. `getMatchScore(currentUser, targetUser)` - Main function:
   - Weights: distance (25%), lastActive (20%), profileCompleteness (15%), mutualInterests (30%), agePreference (10%)
   - Returns score 0-100

### Profile Completeness Service (services/profileCompleteness.js)
- `calculateProfileCompleteness(user)` - Calculate 0-100:
  - Name: 5 points
  - Age: 5 points
  - Photos: 30 points (6 per photo, max 5 photos)
  - Bio: 15 points (50+ chars = full, else partial)
  - Interests: 20 points (4 per interest, max 5)
  - Location: 10 points
  - Personality: 10 points
  - Dealbreakers: 5 points

## 4. Controllers Layer

### Auth Controller (controllers/authController.js)
- `signup(req, res, next)` - Create user, hash password, generate JWT
- `login(req, res, next)` - Verify credentials, return JWT
- `refreshToken(req, res, next)` - Refresh JWT token
- `getMe(req, res, next)` - Get current authenticated user

### User Controller (controllers/userController.js)
- `getProfile(req, res, next)` - Get public profile (exclude sensitive data)
- `updateProfile(req, res, next)` - Update profile, recalculate profileCompleteness
- `uploadPhoto(req, res, next)` - Handle photo upload using multer
- `getMyProfile(req, res, next)` - Get own complete profile

### Discover Controller (controllers/discoverController.js)
- `getNextUser(req, res, next)` - Get next user to swipe:
  - Query users excluding: current user, liked, disliked, matched
  - Apply hard filters: gender preference, age range, distance
  - Calculate match scores for all candidates
  - Sort by highest score
  - Return best user with match score
- `swipeRight(req, res, next)` - Like user:
  - Add to liked array
  - Check for mutual like
  - If match: create Match document, update both users
  - Return match status
- `swipeLeft(req, res, next)` - Dislike/pass user:
  - Add to disliked array

### Match Controller (controllers/matchController.js)
- `getMatches(req, res, next)` - Get all matches for current user
- `getMatchById(req, res, next)` - Get specific match details

## 5. Routes Layer

### Auth Routes (routes/authRoutes.js)
- `POST /api/auth/signup` → `authController.signup` (with validation)
- `POST /api/auth/login` → `authController.login` (with validation)
- `POST /api/auth/refresh` → `authController.refreshToken`
- `GET /api/auth/me` → `authController.getMe` (protected)

### User Routes (routes/userRoutes.js)
- `GET /api/users/:id/profile` → `userController.getProfile`
- `PUT /api/users/:id/profile` → `userController.updateProfile` (protected)
- `POST /api/users/:id/photo` → `userController.uploadPhoto` (protected, multer)
- `GET /api/users/me` → `userController.getMyProfile` (protected)

### Discover Routes (routes/discoverRoutes.js)
- `GET /api/discover/next-user` → `discoverController.getNextUser` (protected)
- `POST /api/discover/swipe-right` → `discoverController.swipeRight` (protected, validation)
- `POST /api/discover/swipe-left` → `discoverController.swipeLeft` (protected, validation)

### Match Routes (routes/matchRoutes.js)
- `GET /api/matches` → `matchController.getMatches` (protected)
- `GET /api/matches/:id` → `matchController.getMatchById` (protected)

## 6. Middleware Layer

### Auth Middleware (middleware/auth.js)
- `authenticate` - Verify JWT token from Authorization header, attach user to req.user

### Validation Middleware (middleware/validate.js)
- `validateSignup` - Validate name, email, password, gender, age
- `validateLogin` - Validate email/phone and password
- `validateSwipe` - Validate targetUserId
- `validateProfileUpdate` - Validate profile fields

### Error Handler (middleware/errorHandler.js)
- Centralized error handling
- Format: `{ success: false, message, error }`
- Handle Mongoose errors, JWT errors, validation errors

### Response Formatter (middleware/responseFormatter.js)
- Success: `{ success: true, data: {...}, message: "..." }`
- Error handled by errorHandler

## 7. Configuration

### Database Config (config/db.js)
- MongoDB connection using Mongoose
- Connection error handling and retry logic

### App Config (config/app.js)
- Environment variables validation
- App constants (JWT expiry, file upload limits)

## 8. Server Entry Point (server.js)
- Express app initialization
- Middleware setup (CORS, JSON, response formatter)
- Database connection
- Route mounting (auth, users, discover, matches)
- Error handling middleware (must be last)
- Server start

## 9. Environment Variables (.env.example)
```
MONGODB_URI=mongodb://localhost:27017/datingapp
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRY=7d
PORT=5000
NODE_ENV=development
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
```

## Implementation Order

1. Project setup and folder structure
2. Database configuration
3. User and Match models
4. Profile completeness service
5. Matching algorithm service
6. Authentication middleware
7. Auth controller and routes
8. User controller and routes
9. Discover controller and routes (matching algorithm integration)
10. Match controller and routes
11. Error handling and response formatting
12. Server configuration
13. Testing

## Key Features

### Rule-Based Matching Algorithm (NO ML)
- Score by distance (25%)
- Score by last active time (20%)
- Profile completeness score (15%)
- Mutual interests score (30%)
- Age preference match (10%)
- Final score = weighted sum (0-100)

### Swipe System
- Swipe Right (like) - POST /api/discover/swipe-right
- Swipe Left (dislike) - POST /api/discover/swipe-left
- Detect match when both users like each other
- Save match to both user profiles
- Prevent showing same user again

### Next User Fetching
- Exclude users already liked, disliked, or matched
- Apply rule-based score to all remaining candidates
- Sort by highest score
- Return only the best next user - GET /api/discover/next-user

