# API Summary

## Backend Structure

The backend has been set up with the following structure:

### Models
- **User.model.js**: User authentication and basic info
- **Profile.model.js**: Complete user profile with onboarding steps
- **Interaction.model.js**: Likes, passes, and matches

### Controllers
- **auth.controller.js**: OTP-based authentication
- **profile.controller.js**: Profile CRUD operations
- **upload.controller.js**: Image upload to Cloudinary
- **discovery.controller.js**: Discovery feed and matching

### Routes
- `/api/auth/*` - Authentication endpoints
- `/api/profile/*` - Profile management
- `/api/upload/*` - Image uploads
- `/api/discovery/*` - Discovery and matching

### Key Features Implemented

1. **Authentication**
   - Phone number + OTP verification
   - JWT token generation
   - User session management

2. **Profile Management**
   - Multi-step onboarding support
   - Profile completion tracking
   - Photo management
   - Verification system

3. **Image Upload**
   - Cloudinary integration
   - Multiple photo upload
   - Photo deletion
   - Main photo selection
   - Verification photo upload

4. **Discovery & Matching**
   - Location-based matching
   - Match score calculation
   - Like/Pass functionality
   - Match detection

### Database Schema

**User Collection:**
- Phone number (unique)
- OTP management
- Premium status
- Profile reference

**Profile Collection:**
- Basic info (name, age, gender, orientation)
- Location (with geospatial indexing)
- Interests, personality, dealbreakers
- Photos array
- Bio
- Verification status
- Completion percentage

**Interaction Collection:**
- Like/Pass/Superlike tracking
- Match detection

### Next Steps for Frontend Integration

1. Update API base URL in frontend to `http://localhost:5000/api`
2. Replace localStorage calls with API calls:
   - Auth: Use `/api/auth/send-otp` and `/api/auth/verify-otp`
   - Profile: Use `/api/profile/*` endpoints
   - Photos: Use `/api/upload/*` endpoints
   - Discovery: Use `/api/discovery/*` endpoints
3. Store JWT token and include in Authorization header
4. Handle API responses and errors

### Environment Variables

All credentials are configured in `.env`:
- MongoDB connection string
- Cloudinary credentials
- JWT secret
- Server port

### Security Features

- JWT authentication
- Rate limiting
- Helmet security headers
- CORS configuration
- Input validation
- Error handling

