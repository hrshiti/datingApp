# Quick Reference Guide - Dating App Architecture

## Backend API Endpoints

### Authentication
```
POST /api/auth/send-otp
POST /api/auth/verify-otp
POST /api/auth/resend-otp
GET  /api/auth/me
```

### Profile
```
POST /api/profile
GET  /api/profile/me
GET  /api/profile/:id
PUT  /api/profile/onboarding/:step
POST /api/profile/complete-onboarding
```

### Upload
```
POST   /api/upload/photo
POST   /api/upload/photos
DELETE /api/upload/photo/:photoId
PUT    /api/upload/photo/:photoId/set-main
POST   /api/upload/verification
```

### Discovery
```
GET  /api/discovery
POST /api/discovery/like
POST /api/discovery/pass
GET  /api/discovery/matches
```

## Frontend Pages → Backend APIs Mapping

| Frontend Page | Backend APIs Used |
|---------------|-------------------|
| AuthPages.jsx | `sendOTP`, `verifyOTP`, `resendOTP` |
| OnboardingPage.jsx | `updateOnboardingStep`, `getMyProfile`, `completeOnboarding` |
| ProfileSetupPage.jsx | `uploadPhotos`, `createOrUpdateProfile` |
| ProfilePage.jsx | `getMyProfile` |
| EditProfileInfoPage.jsx | `getMyProfile`, `createOrUpdateProfile` |
| DiscoveryFeedPage.jsx | `getDiscoveryFeed`, `likeProfile`, `passProfile` |
| ChatsPage.jsx | `getMatches` |
| LikedYouPage.jsx | `getMatches` |

## Data Models Quick Reference

### User
- `phone`, `countryCode`, `otp`, `isPhoneVerified`, `profile`, `isPremium`

### Profile
- **Step 1**: `name`, `dob`, `age`, `gender`, `orientation`, `lookingFor`
- **Step 2**: `location`, `ageRange`, `distancePref`
- **Step 3**: `interests`
- **Step 4**: `personality`
- **Step 5**: `dealbreakers`
- **Step 6**: `optional`
- **Step 7**: `photos`, `bio`
- **Meta**: `completionPercentage`, `onboardingCompleted`, `isVerified`

### Interaction
- `fromUser`, `toUser`, `type` ('like'|'pass'|'superlike')

### Match
- `users` [2], `matchedAt`, `isActive`

## Response Formats

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "error": "Error details"
}
```

## Authentication

### Request Headers
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Token Storage
- Frontend: `localStorage.getItem('token')`
- Backend: Extracted from `Authorization` header

## File Structure to Create

```
frontend/src/
├── config/
│   └── api.js              # API configuration
├── services/
│   ├── api.js              # Axios instance
│   ├── authService.js      # Auth APIs
│   ├── profileService.js   # Profile APIs
│   ├── uploadService.js    # Upload APIs
│   └── discoveryService.js # Discovery APIs
└── .env                    # Environment variables
```

## Integration Priority

1. **Phase 1**: Setup (axios, config, api.js)
2. **Phase 2**: Service layer (all service files)
3. **Phase 3**: Auth integration (AuthPages.jsx)
4. **Phase 4**: Profile integration (OnboardingPage, ProfileSetupPage)
5. **Phase 5**: Discovery integration (DiscoveryFeedPage)
6. **Phase 6**: Error handling & optimization

## Common Issues & Solutions

### Issue: 401 Unauthorized
- **Cause**: Missing or invalid token
- **Solution**: Check token in localStorage, redirect to login

### Issue: CORS Error
- **Cause**: Backend CORS not configured for frontend URL
- **Solution**: Update `FRONTEND_URL` in backend `.env`

### Issue: Photo Upload Fails
- **Cause**: Missing `Content-Type: multipart/form-data`
- **Solution**: Use FormData and let axios set content type

### Issue: Profile Not Found
- **Cause**: Profile not created yet
- **Solution**: Check if profile exists, create if not

## Environment Variables

### Backend
```env
MONGODB_URI=...
JWT_SECRET=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
PORT=5000
FRONTEND_URL=http://localhost:5173
```

### Frontend
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

