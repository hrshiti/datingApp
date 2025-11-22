# User API Documentation

## Table of Contents
1. [Overview](#overview)
2. [User Registration Flow](#user-registration-flow)
3. [Base URL](#base-url)
4. [Authentication](#authentication)
5. [API Endpoints](#api-endpoints)
6. [Request/Response Formats](#requestresponse-formats)
7. [Error Handling](#error-handling)
8. [User Model Schema](#user-model-schema)
9. [Profile Completion Flow](#profile-completion-flow)
10. [Examples](#examples)

---

## Overview

User API provides endpoints for user authentication, OTP management, profile management, and user information retrieval. The system follows a progressive profile completion flow where users can start with basic information and complete their profile later.

**Base Paths**: 
- `/api/auth` - Authentication endpoints
- `/api/profile` - Profile management endpoints

---

## User Registration Flow

### Complete Flow Diagram

```
1. Phone Registration
   ↓
2. OTP Sent to Phone
   ↓
3. OTP Verification → JWT Token Received
   ↓
4. Basic Information Page
   - Name
   - Date of Birth (Age)
   - Gender
   - Sexual Orientation
   - Looking For
   ↓
5. People/Discovery Page Opens
   - User can see profiles
   - User can browse
   ↓
6. User Swipes on Profile
   ↓
7. Check: Is Profile Complete?
   ├─ NO → Show "Complete Profile" Modal
   │         Redirect to Onboarding
   │         Complete: Location, Preferences, Interests, Personality, Dealbreakers, Photos, Bio
   │         ↓
   │         Return to People Page
   │         ↓
   │         Can Now Swipe
   └─ YES → Swipe Successful
            Like/Pass Recorded
```

### Flow Details

1. **Phone Registration & OTP**
   - User enters phone number
   - OTP is sent (6 digits, valid for 10 minutes)
   - User verifies OTP
   - JWT token is generated and returned

2. **Basic Information (Required)**
   - User must fill:
     - Name
     - Date of Birth
     - Gender
     - Sexual Orientation
     - Looking For
   - After saving basic info, user can access People page

3. **People Page Access**
   - User can see discovery feed
   - User can browse profiles
   - User CANNOT swipe yet (profile incomplete)

4. **Swipe Attempt**
   - When user tries to swipe (like/pass):
     - System checks if profile is complete
     - Required for swiping:
       - Location (city)
       - Preferences (age range, distance)
       - Interests (minimum 3)
       - Personality (all 8 traits)
       - Dealbreakers (all 4)
       - Photos (minimum 4)
       - Bio

5. **Profile Completion Prompt**
   - If profile incomplete:
     - Swipe is blocked
     - Modal/prompt shown: "Complete your profile to start swiping"
     - User redirected to onboarding
     - User completes remaining details
     - Returns to People page
     - Can now swipe successfully

---

## Base URL

```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

---

## Authentication

### JWT Token Authentication

Most endpoints require JWT token authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Token Generation

Token is generated after successful OTP verification and is valid for 7 days (configurable via `JWT_EXPIRE`).

### Token Storage

- **Frontend**: Store token in `localStorage` or secure cookie
- **Backend**: Token is extracted from `Authorization` header

---

## API Endpoints

### Authentication Endpoints

#### 1. Send OTP

Send OTP to user's phone number for authentication.

**Endpoint**: `POST /api/auth/send-otp`

**Access**: Public (No authentication required)

**Request Body**:
```json
{
  "phone": "1234567890",
  "countryCode": "+91"
}
```

**Request Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| phone | String | Yes | 10-digit phone number (exactly 10 digits) |
| countryCode | String | Yes | Country code with + sign (e.g., "+91", "+1") |

**Validation Rules**:
- Phone number must be exactly 10 digits
- Country code must include + sign
- Phone number format: `/^\d{10}$/`

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "otp": "123456"  // Only in development mode
}
```

**Error Responses**:

**400 Bad Request** - Missing or invalid phone number:
```json
{
  "success": false,
  "message": "Phone number and country code are required"
}
```

**400 Bad Request** - Invalid phone format:
```json
{
  "success": false,
  "message": "Phone number must be exactly 10 digits"
}
```

**500 Internal Server Error**:
```json
{
  "success": false,
  "message": "Error sending OTP",
  "error": "Error details"
}
```

**Notes**:
- If user doesn't exist, a new user is created automatically
- OTP is valid for 10 minutes
- In development mode, OTP is returned in response (remove in production)
- In production, OTP should be sent via SMS service (Twilio, AWS SNS, etc.)

**Example Request**:
```bash
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "1234567890",
    "countryCode": "+91"
  }'
```

---

### 2. Verify OTP

Verify OTP and authenticate user. Returns JWT token on success.

**Endpoint**: `POST /api/auth/verify-otp`

**Access**: Public (No authentication required)

**Request Body**:
```json
{
  "phone": "1234567890",
  "countryCode": "+91",
  "otp": "123456"
}
```

**Request Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| phone | String | Yes | 10-digit phone number |
| countryCode | String | Yes | Country code with + sign |
| otp | String | Yes | 6-digit OTP code |

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "phone": "+911234567890",
    "isPhoneVerified": true,
    "hasProfile": false,
    "hasCompletedOnboarding": false
  }
}
```

**Response Fields**:
| Field | Type | Description |
|-------|------|-------------|
| success | Boolean | Request success status |
| message | String | Success message |
| token | String | JWT token for authentication |
| user.id | String | User ID (MongoDB ObjectId) |
| user.phone | String | Full phone number with country code |
| user.isPhoneVerified | Boolean | Phone verification status |
| user.hasProfile | Boolean | Whether user has created profile |
| user.hasCompletedOnboarding | Boolean | Whether onboarding is completed |

**Error Responses**:

**400 Bad Request** - Missing parameters:
```json
{
  "success": false,
  "message": "Phone number, country code, and OTP are required"
}
```

**404 Not Found** - User not found:
```json
{
  "success": false,
  "message": "User not found. Please request OTP first."
}
```

**400 Bad Request** - Invalid or expired OTP:
```json
{
  "success": false,
  "message": "Invalid or expired OTP"
}
```

**500 Internal Server Error**:
```json
{
  "success": false,
  "message": "Error verifying OTP",
  "error": "Error details"
}
```

**Notes**:
- OTP expires after 10 minutes
- On successful verification:
  - OTP is cleared from user record
  - `isPhoneVerified` is set to `true`
  - `lastActiveAt` is updated
  - JWT token is generated and returned
- Token should be stored securely on frontend

**Example Request**:
```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "1234567890",
    "countryCode": "+91",
    "otp": "123456"
  }'
```

---

### 3. Resend OTP

Resend OTP to user's phone number.

**Endpoint**: `POST /api/auth/resend-otp`

**Access**: Public (No authentication required)

**Request Body**:
```json
{
  "phone": "1234567890",
  "countryCode": "+91"
}
```

**Request Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| phone | String | Yes | 10-digit phone number |
| countryCode | String | Yes | Country code with + sign |

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "OTP resent successfully",
  "otp": "654321"  // Only in development mode
}
```

**Error Responses**:

**400 Bad Request** - Missing parameters:
```json
{
  "success": false,
  "message": "Phone number and country code are required"
}
```

**404 Not Found** - User not found:
```json
{
  "success": false,
  "message": "User not found"
}
```

**500 Internal Server Error**:
```json
{
  "success": false,
  "message": "Error resending OTP",
  "error": "Error details"
}
```

**Notes**:
- Generates a new OTP and invalidates the previous one
- New OTP is valid for 10 minutes
- In development mode, OTP is returned in response

**Example Request**:
```bash
curl -X POST http://localhost:5000/api/auth/resend-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "1234567890",
    "countryCode": "+91"
  }'
```

---

### Profile Management Endpoints

#### 5. Save Basic Information

Save only basic information (name, gender, age, orientation, looking for). This allows user to access People page.

**Endpoint**: `POST /api/profile/basic-info`

**Access**: Private (Authentication required)

**Headers**:
```
Authorization: Bearer <your_jwt_token>
```

**Request Body**:
```json
{
  "name": "John Doe",
  "dob": "1999-01-15",
  "gender": "male",
  "customGender": "",
  "orientation": "straight",
  "customOrientation": "",
  "lookingFor": ["women"]
}
```

**Request Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| name | String | Yes | User's full name |
| dob | String/Date | Yes | Date of birth (YYYY-MM-DD format) |
| gender | String | Yes | Gender: 'male', 'female', 'other' |
| customGender | String | No | Custom gender if gender is 'other' |
| orientation | String | Yes | Sexual orientation: 'straight', 'gay', 'lesbian', 'bisexual', 'pansexual', 'asexual', 'other' |
| customOrientation | String | No | Custom orientation if orientation is 'other' |
| lookingFor | Array/String | Yes | Array of preferences: ['men'], ['women'], ['everyone'], or combination |

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Basic information saved successfully",
  "profile": {
    "_id": "507f1f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "dob": "1999-01-15T00:00:00.000Z",
    "age": 25,
    "gender": "male",
    "orientation": "straight",
    "lookingFor": ["women"],
    "completionPercentage": 15,
    "onboardingCompleted": false,
    ...
  }
}
```

**Error Responses**:

**400 Bad Request** - Missing required fields:
```json
{
  "success": false,
  "message": "Name, date of birth, gender, orientation, and looking for are required"
}
```

**500 Internal Server Error**:
```json
{
  "success": false,
  "message": "Error saving basic information",
  "error": "Error details"
}
```

**Notes**:
- Creates profile if doesn't exist
- Calculates age automatically from DOB
- After saving, user can access People/Discovery page
- User cannot swipe until profile is fully complete

**Example Request**:
```bash
curl -X POST http://localhost:5000/api/profile/basic-info \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "dob": "1999-01-15",
    "gender": "male",
    "orientation": "straight",
    "lookingFor": ["women"]
  }'
```

---

#### 6. Check Profile Completion

Check if user's profile is complete for swiping.

**Endpoint**: `GET /api/profile/check-completion`

**Access**: Private (Authentication required)

**Headers**:
```
Authorization: Bearer <your_jwt_token>
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "isComplete": false,
  "hasBasicInfo": true,
  "missingFields": ["location", "preferences", "interests", "personality", "dealbreakers", "photos", "bio"],
  "completionPercentage": 25
}
```

**Response Fields**:
| Field | Type | Description |
|-------|------|-------------|
| isComplete | Boolean | Whether profile is complete for swiping |
| hasBasicInfo | Boolean | Whether basic info (name, gender, age, orientation, lookingFor) is filled |
| missingFields | Array | List of missing fields: 'location', 'preferences', 'interests', 'personality', 'dealbreakers', 'photos', 'bio' |
| completionPercentage | Number | Profile completion percentage (0-100) |

**Missing Fields Description**:
- `location`: City not set
- `preferences`: Age range or distance preference not set
- `interests`: Less than 3 interests selected
- `personality`: Less than 8 personality traits filled
- `dealbreakers`: Less than 4 dealbreakers filled
- `photos`: Less than 4 photos uploaded
- `bio`: Bio is empty

**Example Request**:
```bash
curl -X GET http://localhost:5000/api/profile/check-completion \
  -H "Authorization: Bearer <token>"
```

---

#### 7. Update Profile (Complete)

Update or add remaining profile details (location, preferences, interests, personality, dealbreakers, photos, bio).

**Endpoint**: `POST /api/profile`

**Access**: Private (Authentication required)

**Headers**:
```
Authorization: Bearer <your_jwt_token>
```

**Request Body** (All fields optional, send only what you want to update):
```json
{
  "location": {
    "city": "Mumbai",
    "coordinates": [72.8777, 19.0760]
  },
  "ageRange": {
    "min": 18,
    "max": 35
  },
  "distancePref": 25,
  "interests": ["Travel", "Music", "Cooking", "Photography"],
  "personality": {
    "social": "extrovert",
    "planning": "spontaneous",
    "romantic": "romantic",
    "morning": "night-owl",
    "homebody": "adventurer",
    "serious": "casual",
    "decision": "indecisive",
    "communication": "direct"
  },
  "dealbreakers": {
    "kids": "want-kids",
    "smoking": "non-smoker",
    "pets": "love-pets",
    "drinking": "socially",
    "religion": "Hindu"
  },
  "optional": {
    "education": "bachelors",
    "profession": "Software Engineer",
    "languages": ["Hindi", "English"],
    "horoscope": "Capricorn"
  },
  "bio": "Love traveling, reading, and trying new cuisines!"
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Profile saved successfully",
  "profile": {
    ... // Complete profile object
  }
}
```

**Notes**:
- Merges with existing profile data
- Only updates fields that are provided
- Calculates completion percentage automatically
- Location coordinates format: [longitude, latitude]

---

### 4. Get Current User

Get authenticated user's information including profile data.

**Endpoint**: `GET /api/auth/me`

**Access**: Private (Authentication required)

**Headers**:
```
Authorization: Bearer <your_jwt_token>
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "phone": "+911234567890",
    "countryCode": "+91",
    "isPhoneVerified": true,
    "isVerified": false,
    "profile": {
      "_id": "507f1f77bcf86cd799439012",
      "userId": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "age": 25,
      "gender": "male",
      "photos": [...],
      "bio": "Love traveling...",
      "completionPercentage": 85,
      "onboardingCompleted": true,
      ...
    },
    "isPremium": false,
    "premiumExpiresAt": null,
    "lastActiveAt": "2024-01-15T10:30:00.000Z",
    "isActive": true,
    "isBlocked": false,
    "createdAt": "2024-01-01T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Response Fields**:
| Field | Type | Description |
|-------|------|-------------|
| user._id | String | User ID |
| user.phone | String | Full phone number |
| user.countryCode | String | Country code |
| user.isPhoneVerified | Boolean | Phone verification status |
| user.isVerified | Boolean | Profile verification status |
| user.profile | Object | User profile (populated if exists) |
| user.isPremium | Boolean | Premium subscription status |
| user.premiumExpiresAt | Date | Premium expiration date |
| user.lastActiveAt | Date | Last active timestamp |
| user.isActive | Boolean | Account active status |
| user.isBlocked | Boolean | Account blocked status |
| user.createdAt | Date | Account creation date |
| user.updatedAt | Date | Last update date |

**Error Responses**:

**401 Unauthorized** - Missing or invalid token:
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

**404 Not Found** - User not found:
```json
{
  "success": false,
  "message": "User not found"
}
```

**401 Unauthorized** - User inactive or blocked:
```json
{
  "success": false,
  "message": "User account is inactive or blocked"
}
```

**500 Internal Server Error**:
```json
{
  "success": false,
  "message": "Error fetching user",
  "error": "Error details"
}
```

**Notes**:
- Requires valid JWT token in Authorization header
- Profile is automatically populated if exists
- OTP field is excluded from response
- Returns complete user object with profile data

**Example Request**:
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Request/Response Formats

### Standard Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }  // Optional, endpoint-specific data
}
```

### Standard Error Response
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error information"  // Optional
}
```

### HTTP Status Codes
| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (authentication required) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Error Handling

### Common Error Scenarios

1. **Invalid Phone Number**
   - Status: 400
   - Message: "Phone number must be exactly 10 digits"

2. **Missing Required Fields**
   - Status: 400
   - Message: "Phone number and country code are required"

3. **Invalid/Expired OTP**
   - Status: 400
   - Message: "Invalid or expired OTP"

4. **User Not Found**
   - Status: 404
   - Message: "User not found"

5. **Unauthorized Access**
   - Status: 401
   - Message: "Not authorized to access this route"

6. **Token Expired**
   - Status: 401
   - Message: "Invalid token"

7. **User Blocked/Inactive**
   - Status: 401
   - Message: "User account is inactive or blocked"

### Error Response Format
All errors follow this structure:
```json
{
  "success": false,
  "message": "Human-readable error message",
  "error": "Technical error details (optional)"
}
```

---

## User Model Schema

### User Document Structure

```javascript
{
  _id: ObjectId,                    // MongoDB ObjectId
  phone: String,                     // Unique, required, trimmed
  countryCode: String,               // Default: "+91"
  otp: {
    code: String,                    // 6-digit OTP
    expiresAt: Date                  // Expires in 10 minutes
  },
  isVerified: Boolean,               // Default: false
  isPhoneVerified: Boolean,          // Default: false
  profile: ObjectId,                 // Reference to Profile model
  isPremium: Boolean,                // Default: false
  premiumExpiresAt: Date,            // Optional
  lastActiveAt: Date,               // Default: Date.now
  isActive: Boolean,                 // Default: true
  isBlocked: Boolean,                // Default: false
  createdAt: Date,                   // Auto-generated
  updatedAt: Date                    // Auto-generated
}
```

### User Model Methods

#### `generateOTP()`
Generates a 6-digit OTP and sets expiration (10 minutes).

**Returns**: String (OTP code)

**Usage**:
```javascript
const otp = user.generateOTP();
await user.save();
```

#### `verifyOTP(otpCode)`
Verifies if provided OTP is valid and not expired.

**Parameters**:
- `otpCode` (String): OTP code to verify

**Returns**: Boolean (true if valid, false otherwise)

**Usage**:
```javascript
const isValid = user.verifyOTP("123456");
```

#### `clearOTP()`
Clears OTP from user document.

**Usage**:
```javascript
user.clearOTP();
await user.save();
```

### Indexes

- `phone`: Unique index for fast phone lookups
- `profile`: Index for profile reference queries

---

## Examples

### Complete Authentication Flow

#### Step 1: Send OTP
```javascript
// Request
POST /api/auth/send-otp
{
  "phone": "1234567890",
  "countryCode": "+91"
}

// Response
{
  "success": true,
  "message": "OTP sent successfully",
  "otp": "123456"  // Development only
}
```

#### Step 2: Verify OTP
```javascript
// Request
POST /api/auth/verify-otp
{
  "phone": "1234567890",
  "countryCode": "+91",
  "otp": "123456"
}

// Response
{
  "success": true,
  "message": "OTP verified successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "phone": "+911234567890",
    "isPhoneVerified": true,
    "hasProfile": false,
    "hasCompletedOnboarding": false
  }
}
```

#### Step 3: Use Token for Authenticated Requests
```javascript
// Request
GET /api/auth/me
Headers: {
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

// Response
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "phone": "+911234567890",
    "isPhoneVerified": true,
    "profile": { ... },
    ...
  }
}
```

### Frontend Integration Example

#### Using Axios
```javascript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Send OTP
const sendOTP = async (phone, countryCode) => {
  const response = await axios.post(`${API_BASE_URL}/auth/send-otp`, {
    phone,
    countryCode
  });
  return response.data;
};

// Verify OTP
const verifyOTP = async (phone, countryCode, otp) => {
  const response = await axios.post(`${API_BASE_URL}/auth/verify-otp`, {
    phone,
    countryCode,
    otp
  });
  
  // Store token
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
  }
  
  return response.data;
};

// Get Current User
const getMe = async () => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_BASE_URL}/auth/me`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
};
```

#### Using Fetch API
```javascript
const API_BASE_URL = 'http://localhost:5000/api';

// Send OTP
const sendOTP = async (phone, countryCode) => {
  const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ phone, countryCode })
  });
  return await response.json();
};

// Verify OTP
const verifyOTP = async (phone, countryCode, otp) => {
  const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ phone, countryCode, otp })
  });
  
  const data = await response.json();
  
  // Store token
  if (data.token) {
    localStorage.setItem('token', data.token);
  }
  
  return data;
};

// Get Current User
const getMe = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return await response.json();
};
```

---

## Rate Limiting

All API endpoints are protected by rate limiting:
- **Limit**: 100 requests per 15 minutes per IP
- **Window**: 15 minutes
- **Response**: 429 Too Many Requests (if exceeded)

---

## Security Considerations

1. **OTP Security**
   - OTP expires in 10 minutes
   - OTP is cleared after successful verification
   - In production, OTP should be sent via SMS (not returned in API)

2. **Token Security**
   - Tokens expire after 7 days (configurable)
   - Store tokens securely (httpOnly cookies recommended for production)
   - Never expose tokens in URLs or logs

3. **Phone Number Validation**
   - Strict validation (exactly 10 digits)
   - Country code validation
   - Unique phone number constraint

4. **Account Security**
   - Inactive accounts cannot access protected routes
   - Blocked accounts are automatically rejected
   - Last active timestamp is tracked

---

## Testing

### Test Cases

1. **Send OTP**
   - ✅ Valid phone number
   - ✅ Invalid phone format
   - ✅ Missing parameters
   - ✅ New user creation

2. **Verify OTP**
   - ✅ Valid OTP
   - ✅ Invalid OTP
   - ✅ Expired OTP
   - ✅ Missing parameters
   - ✅ User not found

3. **Resend OTP**
   - ✅ Valid request
   - ✅ User not found
   - ✅ Missing parameters

4. **Get Current User**
   - ✅ Valid token
   - ✅ Invalid token
   - ✅ Expired token
   - ✅ Missing token
   - ✅ Blocked user
   - ✅ Inactive user

---

## Support

For issues or questions:
- Check error messages in response
- Verify request format matches documentation
- Ensure token is included for protected routes
- Check network connectivity
- Review server logs for detailed errors

---

## Changelog

### Version 1.0.0
- Initial release
- OTP-based authentication
- JWT token generation
- User information retrieval
- Profile population support

---

## License

This API documentation is part of the Dating App project.

