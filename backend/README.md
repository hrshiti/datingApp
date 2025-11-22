# Dating App Backend API

Backend API for the dating app built with Node.js, Express, MongoDB, and Cloudinary.

## Features

- 🔐 Phone number authentication with OTP
- 👤 User profile management
- 📸 Image upload with Cloudinary
- 🔍 Discovery feed with match scoring
- ❤️ Like/Pass functionality
- 💬 Match system
- 🛡️ JWT authentication
- 📍 Location-based matching

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **Cloudinary** - Image storage
- **Multer** - File upload handling
- **JWT** - Authentication
- **bcryptjs** - Password hashing (if needed)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://aditiparihar:aditiparihar@cluster0.ewvj7vt.mongodb.net/?appName=Cluster0

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=dzbmscin0
CLOUDINARY_API_KEY=999935529526942
CLOUDINARY_API_SECRET=FF5u_f62ZOlssOtoxxg44RDNWew

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS
FRONTEND_URL=http://localhost:5173
```

### 3. Run the Server

**Development mode (with nodemon):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication

- `POST /api/auth/send-otp` - Send OTP to phone number
- `POST /api/auth/verify-otp` - Verify OTP and login
- `POST /api/auth/resend-otp` - Resend OTP
- `GET /api/auth/me` - Get current user (Protected)

### Profile

- `POST /api/profile` - Create or update profile (Protected)
- `GET /api/profile/me` - Get own profile (Protected)
- `GET /api/profile/:id` - Get profile by ID (Protected)
- `PUT /api/profile/onboarding/:step` - Update onboarding step (Protected)
- `POST /api/profile/complete-onboarding` - Complete onboarding (Protected)

### Upload

- `POST /api/upload/photo` - Upload single photo (Protected)
- `POST /api/upload/photos` - Upload multiple photos (Protected)
- `DELETE /api/upload/photo/:photoId` - Delete photo (Protected)
- `PUT /api/upload/photo/:photoId/set-main` - Set main photo (Protected)
- `POST /api/upload/verification` - Upload verification photo (Protected)

### Discovery

- `GET /api/discovery` - Get discovery feed (Protected)
- `POST /api/discovery/like` - Like a profile (Protected)
- `POST /api/discovery/pass` - Pass a profile (Protected)
- `GET /api/discovery/matches` - Get matches (Protected)

## Request/Response Examples

### Send OTP

**Request:**
```json
POST /api/auth/send-otp
{
  "phone": "1234567890",
  "countryCode": "+91"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "otp": "123456" // Only in development
}
```

### Verify OTP

**Request:**
```json
POST /api/auth/verify-otp
{
  "phone": "1234567890",
  "countryCode": "+91",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "phone": "+911234567890",
    "isPhoneVerified": true,
    "hasProfile": false,
    "hasCompletedOnboarding": false
  }
}
```

### Upload Photo

**Request:**
```
POST /api/upload/photo
Headers: Authorization: Bearer <token>
Content-Type: multipart/form-data
Body: photo (file), isMain (boolean), order (number)
```

**Response:**
```json
{
  "success": true,
  "message": "Photo uploaded successfully",
  "photo": {
    "url": "https://res.cloudinary.com/...",
    "cloudinaryId": "dating-app/photos/...",
    "isMain": true,
    "order": 0
  }
}
```

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Error Handling

All errors follow this format:

```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error (development only)"
}
```

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js
│   │   └── cloudinary.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── profile.controller.js
│   │   ├── upload.controller.js
│   │   └── discovery.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── errorHandler.middleware.js
│   │   └── upload.middleware.js
│   ├── models/
│   │   ├── User.model.js
│   │   ├── Profile.model.js
│   │   └── Interaction.model.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── profile.routes.js
│   │   ├── upload.routes.js
│   │   └── discovery.routes.js
│   └── utils/
│       ├── generateToken.js
│       └── cloudinaryUpload.js
├── server.js
├── package.json
└── .env
```

## Notes

- OTP is currently logged to console in development mode. In production, integrate with an SMS service (Twilio, AWS SNS, etc.)
- Images are automatically optimized and resized by Cloudinary
- Profile completion percentage is calculated automatically
- Match scoring considers age, distance, interests, personality, and dealbreakers

## Future Enhancements

- Real-time messaging with WebSockets
- Push notifications
- Advanced matching algorithm
- Premium subscription management
- Admin panel APIs
- Reporting and moderation features

