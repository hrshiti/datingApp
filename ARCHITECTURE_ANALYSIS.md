# Complete Architecture Analysis - Dating App

## Table of Contents
1. [Backend Architecture](#backend-architecture)
2. [Frontend Architecture](#frontend-architecture)
3. [Data Flow Diagrams](#data-flow-diagrams)
4. [API Integration Points](#api-integration-points)
5. [Current State Analysis](#current-state-analysis)
6. [Integration Requirements](#integration-requirements)
7. [Future Update Recommendations](#future-update-recommendations)

---

## Backend Architecture

### Technology Stack
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Storage**: Cloudinary (Image hosting)
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet, CORS, Rate Limiting

### Directory Structure
```
backend/
├── server.js                 # Entry point, middleware setup, route mounting
├── src/
│   ├── config/
│   │   ├── database.js       # MongoDB connection
│   │   └── cloudinary.js     # Cloudinary configuration
│   ├── models/
│   │   ├── User.model.js     # User authentication model
│   │   ├── Profile.model.js  # User profile model (onboarding data)
│   │   └── Interaction.model.js # Likes, passes, matches
│   ├── controllers/
│   │   ├── auth.controller.js      # OTP send/verify, getMe
│   │   ├── profile.controller.js   # Profile CRUD, onboarding steps
│   │   ├── upload.controller.js    # Photo upload/delete
│   │   └── discovery.controller.js # Discovery feed, like/pass, matches
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── profile.routes.js
│   │   ├── upload.routes.js
│   │   ├── discovery.routes.js
│   │   └── user.routes.js (empty)
│   ├── middleware/
│   │   ├── auth.middleware.js      # JWT protection
│   │   ├── errorHandler.middleware.js # Global error handling
│   │   └── upload.middleware.js    # Multer file upload
│   └── utils/
│       ├── cloudinaryUpload.js     # Cloudinary upload helpers
│       └── generateToken.js         # JWT generation
```

### Database Schema

#### User Model
```javascript
{
  phone: String (unique, required),
  countryCode: String (default: '+91'),
  otp: { code: String, expiresAt: Date },
  isPhoneVerified: Boolean,
  profile: ObjectId (ref: Profile),
  isPremium: Boolean,
  premiumExpiresAt: Date,
  lastActiveAt: Date,
  isActive: Boolean,
  isBlocked: Boolean,
  timestamps: true
}
```

#### Profile Model
```javascript
{
  userId: ObjectId (ref: User, unique, required),
  // Step 1: Basic Info
  name, dob, age, gender, customGender,
  orientation, customOrientation, lookingFor,
  // Step 2: Location & Preferences
  location: { city, coordinates: [lon, lat] },
  ageRange: { min, max },
  distancePref: Number,
  // Step 3: Interests
  interests: [String],
  // Step 4: Personality
  personality: { social, planning, romantic, morning, homebody, serious, decision, communication },
  // Step 5: Dealbreakers
  dealbreakers: { kids, smoking, pets, drinking, religion },
  // Step 6: Optional
  optional: { education, profession, languages: [String], horoscope },
  // Step 7: Photos & Bio
  photos: [{ url, cloudinaryId, isMain, order, uploadedAt }],
  bio: String (max 500),
  // Verification
  isVerified: Boolean,
  verificationPhoto: { url, cloudinaryId, status, submittedAt, reviewedAt },
  // Completion
  completionPercentage: Number (0-100),
  onboardingCompleted: Boolean,
  // Visibility
  isActive: Boolean,
  isVisible: Boolean,
  timestamps: true
}
```

#### Interaction Model
```javascript
{
  fromUser: ObjectId (ref: User),
  toUser: ObjectId (ref: User),
  type: 'like' | 'pass' | 'superlike',
  createdAt: Date
}
```

#### Match Model
```javascript
{
  users: [ObjectId] (ref: User, 2 users),
  matchedAt: Date,
  lastMessageAt: Date,
  isActive: Boolean,
  blockedBy: ObjectId (ref: User),
  timestamps: true
}
```

### API Endpoints

#### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/send-otp` | Public | Send OTP to phone number |
| POST | `/verify-otp` | Public | Verify OTP, get JWT token |
| POST | `/resend-otp` | Public | Resend OTP |
| GET | `/me` | Private | Get current user |

#### Profile (`/api/profile`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/` | Private | Create or update profile |
| GET | `/me` | Private | Get own profile |
| GET | `/:id` | Private | Get profile by ID |
| PUT | `/onboarding/:step` | Private | Update specific onboarding step |
| POST | `/complete-onboarding` | Private | Mark onboarding as complete |

#### Upload (`/api/upload`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/photo` | Private | Upload single photo |
| POST | `/photos` | Private | Upload multiple photos |
| DELETE | `/photo/:photoId` | Private | Delete photo |
| PUT | `/photo/:photoId/set-main` | Private | Set main photo |
| POST | `/verification` | Private | Upload verification photo |

#### Discovery (`/api/discovery`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Private | Get discovery feed (with match scores) |
| POST | `/like` | Private | Like a profile (detects matches) |
| POST | `/pass` | Private | Pass a profile |
| GET | `/matches` | Private | Get all matches |

### Backend Features

1. **Authentication Flow**
   - Phone number validation (10 digits)
   - OTP generation (6 digits, 10 min expiry)
   - JWT token generation on OTP verification
   - Token stored in Authorization header: `Bearer <token>`

2. **Profile Management**
   - Multi-step onboarding (7 steps)
   - Automatic age calculation from DOB
   - Profile completion percentage calculation
   - Geospatial indexing for location queries

3. **Matching Algorithm**
   - Distance-based scoring (Haversine formula)
   - Age compatibility check
   - Common interests matching
   - Personality compatibility
   - Dealbreaker filtering
   - Final score: 0-100

4. **Discovery Feed**
   - Excludes already liked/passed users
   - Filters by age range, gender preference, distance
   - Sorts by match score (highest first)
   - Returns profiles with match scores and reasons

5. **Match Detection**
   - Checks for mutual likes
   - Creates Match document when both users like each other
   - Returns match notification

---

## Frontend Architecture

### Technology Stack
- **Framework**: React 19.2.0
- **Routing**: React Router DOM 7.9.6
- **Styling**: Tailwind CSS 4.1.17
- **Animations**: Framer Motion 12.23.24
- **Icons**: Lucide React 0.553.0
- **Build Tool**: Vite 7.2.2

### Directory Structure
```
frontend/src/
├── App.jsx                    # Main router, route definitions
├── main.jsx                   # React entry point
├── pages/
│   ├── auth/
│   │   └── AuthPages.jsx     # Splash, phone input, OTP verification
│   ├── OnboardingPage.jsx    # 10-step onboarding flow
│   ├── ProfileSetupPage.jsx  # Photo upload and bio
│   ├── PhotoVerificationPage.jsx
│   ├── ProfilePage.jsx       # View own profile
│   ├── EditProfileInfoPage.jsx
│   ├── DiscoveryFeedPage.jsx # Main swipe interface (Tinder-style)
│   ├── DiscoverPage.jsx      # Browse profiles grid
│   ├── FilterPage.jsx
│   ├── ChatsPage.jsx
│   ├── ChatDetailPage.jsx
│   ├── LikedYouPage.jsx
│   ├── SettingsPage.jsx
│   ├── SafetyCenterPage.jsx
│   ├── PremiumPage.jsx
│   └── admin/                # Admin panel pages
├── components/
│   ├── CustomDatePicker.jsx
│   ├── CustomDropdown.jsx
│   ├── PhotoUpload.jsx
│   ├── ProfileCard.jsx
│   └── ReportBlockModal.jsx
├── data/
│   └── mockProfiles.js       # Mock data (to be replaced)
├── services/                 # EMPTY - Needs API services
├── config/                   # EMPTY - Needs API config
└── constants/
    └── theme.js
```

### Frontend Routes

#### Public Routes
- `/welcome` - Splash/Welcome screen
- `/phone` - Phone number input
- `/verify-otp` - OTP verification

#### Protected Routes (Require Auth)
- `/onboarding` - Multi-step profile creation
- `/profile-setup` - Photo upload and bio
- `/photo-verification` - Verification photo upload
- `/profile` - View own profile
- `/edit-profile-info` - Edit profile
- `/discover` - Browse profiles grid
- `/people` - Main swipe interface
- `/filters` - Filter preferences
- `/chats` - Chat list
- `/chat/:userId` - Individual chat
- `/liked-you` - Users who liked you
- `/settings` - App settings
- `/safety` - Safety center
- `/premium` - Premium subscription

#### Admin Routes
- `/admin/login` - Admin login
- `/admin/dashboard` - Admin dashboard
- `/admin/users` - User management
- `/admin/verification` - Photo verification review
- `/admin/moderation` - Content moderation
- `/admin/premium` - Premium management
- `/admin/promo-codes` - Promo code management
- `/admin/activity-logs` - Activity logs
- `/admin/payments` - Payment management
- `/admin/settings` - Admin settings

### Current Frontend State

**Data Storage**: All data stored in `localStorage`
- `authData` - Phone and country code
- `onboardingData` - Onboarding form data
- `profileSetup` - Photos and bio
- `discoveryLikes` - Liked profile IDs
- `discoveryPasses` - Passed profile IDs
- `discoveryMatches` - Matched profiles
- `token` - JWT token (if exists)

**API Integration**: ❌ NONE
- No API service files
- No axios installed
- No API configuration
- All data is mock/localStorage

---

## Data Flow Diagrams

### Authentication Flow
```
User → Frontend (AuthPages.jsx)
  ↓
Enter Phone → handleSendOtp()
  ↓
[NEEDS] POST /api/auth/send-otp
  ↓
Backend generates OTP → Returns OTP (dev mode)
  ↓
User enters OTP → handleVerifyOtp()
  ↓
[NEEDS] POST /api/auth/verify-otp
  ↓
Backend verifies → Returns JWT token
  ↓
Frontend stores token → localStorage.setItem('token', token)
  ↓
Navigate to onboarding or people page
```

### Onboarding Flow
```
User → OnboardingPage.jsx
  ↓
Step 1: Basic Info → handleNext()
  ↓
[NEEDS] PUT /api/profile/onboarding/1
  ↓
Step 2: Location → handleNext()
  ↓
[NEEDS] PUT /api/profile/onboarding/2
  ↓
... (Steps 3-6)
  ↓
Step 7: Photos & Bio → ProfileSetupPage.jsx
  ↓
[NEEDS] POST /api/upload/photos
[NEEDS] POST /api/profile (update bio)
  ↓
Step 10: Complete → handleCompleteOnboarding()
  ↓
[NEEDS] POST /api/profile/complete-onboarding
  ↓
Navigate to /people
```

### Discovery Flow
```
User → DiscoveryFeedPage.jsx
  ↓
[NEEDS] GET /api/discovery
  ↓
Backend returns profiles with match scores
  ↓
User swipes right → handleLike()
  ↓
[NEEDS] POST /api/discovery/like
  ↓
Backend checks for match → Returns isMatch
  ↓
If match → Show match modal
  ↓
User swipes left → handlePass()
  ↓
[NEEDS] POST /api/discovery/pass
  ↓
Get next profile
```

---

## API Integration Points

### 1. Authentication Service
**File**: `frontend/src/services/authService.js`
```javascript
- sendOTP(phone, countryCode)
- verifyOTP(phone, countryCode, otp)
- resendOTP(phone, countryCode)
- getMe()
- logout()
- isAuthenticated()
```

### 2. Profile Service
**File**: `frontend/src/services/profileService.js`
```javascript
- createOrUpdateProfile(profileData)
- getMyProfile()
- getProfileById(profileId)
- updateOnboardingStep(step, stepData)
- completeOnboarding()
```

### 3. Upload Service
**File**: `frontend/src/services/uploadService.js`
```javascript
- uploadPhoto(photoFile, isMain, order)
- uploadPhotos(photoFiles)
- deletePhoto(photoId)
- setMainPhoto(photoId)
- uploadVerificationPhoto(photoFile)
```

### 4. Discovery Service
**File**: `frontend/src/services/discoveryService.js`
```javascript
- getDiscoveryFeed()
- likeProfile(profileId)
- passProfile(profileId)
- getMatches()
```

### 5. API Configuration
**File**: `frontend/src/config/api.js`
```javascript
- API_BASE_URL
- API_ENDPOINTS (all endpoint paths)
```

### 6. Axios Instance
**File**: `frontend/src/services/api.js`
```javascript
- Axios instance with baseURL
- Request interceptor (adds JWT token)
- Response interceptor (handles errors, 401 redirects)
```

---

## Current State Analysis

### Backend Status: ✅ COMPLETE
- All models defined
- All controllers implemented
- All routes configured
- Middleware in place
- Error handling implemented
- Security features enabled

### Frontend Status: ⚠️ PARTIAL
- ✅ UI/UX complete
- ✅ Routing configured
- ✅ Components built
- ❌ No API integration
- ❌ No service layer
- ❌ Using localStorage for all data
- ❌ Using mockProfiles for discovery

### Integration Gap
| Feature | Backend | Frontend | Status |
|---------|---------|----------|--------|
| Authentication | ✅ | ❌ | Needs integration |
| Profile Creation | ✅ | ❌ | Needs integration |
| Photo Upload | ✅ | ❌ | Needs integration |
| Discovery Feed | ✅ | ❌ | Needs integration |
| Like/Pass | ✅ | ❌ | Needs integration |
| Matches | ✅ | ❌ | Needs integration |

---

## Integration Requirements

### Phase 1: Setup (Priority: HIGH)
1. **Install Dependencies**
   ```bash
   cd frontend
   npm install axios
   ```

2. **Create API Configuration**
   - `frontend/src/config/api.js` - Base URL and endpoints
   - `frontend/.env` - Environment variables

3. **Create Axios Instance**
   - `frontend/src/services/api.js` - Configured axios with interceptors

### Phase 2: Service Layer (Priority: HIGH)
1. **Create Service Files**
   - `frontend/src/services/authService.js`
   - `frontend/src/services/profileService.js`
   - `frontend/src/services/uploadService.js`
   - `frontend/src/services/discoveryService.js`

### Phase 3: Page Integration (Priority: HIGH)
1. **AuthPages.jsx**
   - Replace mock OTP with `authService.sendOTP()`
   - Replace mock verification with `authService.verifyOTP()`

2. **OnboardingPage.jsx**
   - Replace localStorage with `profileService.updateOnboardingStep()`
   - Load existing profile with `profileService.getMyProfile()`

3. **ProfileSetupPage.jsx**
   - Use `uploadService.uploadPhotos()` for photos
   - Use `profileService.createOrUpdateProfile()` for bio

4. **DiscoveryFeedPage.jsx**
   - Replace `mockProfiles` with `discoveryService.getDiscoveryFeed()`
   - Use `discoveryService.likeProfile()` and `discoveryService.passProfile()`

5. **ProfilePage.jsx**
   - Load profile with `profileService.getMyProfile()`

### Phase 4: Error Handling (Priority: MEDIUM)
1. **Global Error Handler**
   - Toast notifications for errors
   - Loading states
   - Retry mechanisms

2. **Token Management**
   - Auto-refresh on 401
   - Redirect to login on token expiry
   - Clear localStorage on logout

### Phase 5: Optimization (Priority: LOW)
1. **Caching**
   - Cache profile data
   - Cache discovery feed
   - Invalidate on updates

2. **Performance**
   - Lazy loading
   - Image optimization
   - Pagination for discovery

---

## Future Update Recommendations

### Backend Enhancements

1. **Chat/Messaging System**
   - WebSocket integration (Socket.IO)
   - Message model
   - Real-time message delivery
   - Read receipts

2. **Push Notifications**
   - Firebase Cloud Messaging (FCM)
   - Match notifications
   - Message notifications
   - Like notifications

3. **Advanced Matching**
   - Machine learning integration (optional)
   - Preference learning
   - Behavioral analysis

4. **Analytics**
   - User engagement metrics
   - Match success rates
   - Popular profiles
   - Geographic distribution

5. **Admin Features**
   - User moderation API
   - Content moderation API
   - Analytics API
   - Report management API

6. **Payment Integration**
   - Stripe/PayPal integration
   - Premium subscription management
   - Payment history

7. **Search & Filters**
   - Advanced search API
   - Filter combinations
   - Saved searches

8. **Social Features**
   - Block/unblock users
   - Report users
   - Share profile
   - Social media integration

### Frontend Enhancements

1. **State Management**
   - Redux or Zustand for global state
   - Context API for auth state
   - Cache management

2. **Real-time Updates**
   - WebSocket client
   - Real-time match notifications
   - Live chat

3. **Offline Support**
   - Service workers
   - Offline data caching
   - Sync on reconnect

4. **Performance**
   - Code splitting
   - Lazy loading routes
   - Image lazy loading
   - Virtual scrolling for lists

5. **Testing**
   - Unit tests (Jest)
   - Integration tests
   - E2E tests (Cypress/Playwright)

6. **Accessibility**
   - ARIA labels
   - Keyboard navigation
   - Screen reader support

7. **Internationalization**
   - i18n support
   - Multi-language
   - RTL support

8. **PWA Features**
   - Install prompt
   - Offline mode
   - Push notifications
   - App manifest

### Security Enhancements

1. **Backend**
   - Rate limiting per user
   - IP blocking
   - Content sanitization
   - SQL injection prevention (if using SQL)
   - XSS protection

2. **Frontend**
   - Input validation
   - XSS prevention
   - CSRF protection
   - Secure token storage (consider httpOnly cookies)

### Scalability Considerations

1. **Database**
   - Indexing optimization
   - Query optimization
   - Sharding (if needed)
   - Read replicas

2. **Caching**
   - Redis for session management
   - Redis for discovery feed caching
   - CDN for static assets

3. **Load Balancing**
   - Multiple server instances
   - Load balancer configuration
   - Session stickiness

4. **Monitoring**
   - Error tracking (Sentry)
   - Performance monitoring
   - Analytics (Google Analytics/Mixpanel)
   - Logging (Winston/Morgan)

---

## Data Mapping Reference

### Frontend → Backend Mapping

#### Onboarding Steps
- **Step 1** → `name, dob, gender, customGender, orientation, customOrientation, lookingFor`
- **Step 2** → `location, ageRange, distancePref`
- **Step 3** → `interests`
- **Step 4** → `personality`
- **Step 5** → `dealbreakers`
- **Step 6** → `optional`
- **Step 7** → `photos, bio`

#### Profile Display
- Backend `Profile` → Frontend `onboardingData` + `profileSetup`
- Backend `photos[].url` → Frontend `photos[].preview`
- Backend `completionPercentage` → Frontend calculated percentage

#### Discovery
- Backend `profiles[]` → Frontend `profiles[]`
- Backend `matchScore` → Frontend `matchScore`
- Backend `matchReasons` → Frontend `reasons`
- Backend `distance` → Frontend `distance`

---

## Environment Variables

### Backend (.env)
```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## Testing Checklist

### Backend Testing
- [ ] Unit tests for controllers
- [ ] Unit tests for models
- [ ] Integration tests for routes
- [ ] Authentication flow tests
- [ ] Matching algorithm tests

### Frontend Testing
- [ ] Component tests
- [ ] Service tests
- [ ] Integration tests
- [ ] E2E tests for user flows

### Integration Testing
- [ ] End-to-end authentication
- [ ] Profile creation flow
- [ ] Photo upload flow
- [ ] Discovery feed flow
- [ ] Like/pass flow
- [ ] Match detection

---

## Deployment Checklist

### Backend
- [ ] Environment variables configured
- [ ] Database connection string
- [ ] Cloudinary credentials
- [ ] JWT secret (strong)
- [ ] CORS configured for production domain
- [ ] Rate limiting configured
- [ ] Error logging setup
- [ ] Health check endpoint

### Frontend
- [ ] API base URL configured
- [ ] Build optimization
- [ ] Environment variables
- [ ] Error boundary
- [ ] Loading states
- [ ] Error handling

---

## Conclusion

The backend is **fully implemented** and ready for integration. The frontend has **complete UI/UX** but needs **API integration**. 

**Next Steps:**
1. Create API service layer (Phase 1-2)
2. Integrate services into pages (Phase 3)
3. Test end-to-end flows
4. Deploy and monitor

**Estimated Integration Time:** 2-3 days for complete integration

**Priority Order:**
1. Authentication (Critical)
2. Profile Management (Critical)
3. Discovery Feed (High)
4. Photo Upload (High)
5. Matches (Medium)
6. Error Handling (Medium)
7. Optimization (Low)
