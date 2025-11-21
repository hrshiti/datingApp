# Dating App Backend API

Complete MERN stack backend with MVC architecture for rule-based matching algorithm, swipe system, and user management.

## Project Structure

```
backend/
├── config/          # Database & app configuration
├── models/          # MongoDB schemas (User, Match)
├── controllers/     # Business logic (auth, user, discover, match)
├── routes/          # API endpoints
├── services/        # Matching algorithm, profile completeness
├── middleware/      # Auth, validation, error handling
├── utils/           # Helper functions
└── uploads/         # File uploads directory
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Variables

Create a `.env` file in the `backend` directory:

```env
MONGODB_URI=mongodb://localhost:27017/datingapp
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRY=7d
PORT=5000
NODE_ENV=development
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
```

### 3. Start MongoDB

Make sure MongoDB is running on your system or use MongoDB Atlas.

### 4. Run the Server

**Development mode (with nodemon):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server will run on `http://localhost:5000`

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh JWT token (Protected)
- `GET /api/auth/me` - Get current user (Protected)

### Users

- `GET /api/users/:id/profile` - Get public profile
- `PUT /api/users/:id/profile` - Update profile (Protected)
- `POST /api/users/:id/photo` - Upload photo (Protected)
- `GET /api/users/me` - Get own profile (Protected)

### Discovery & Swiping

- `GET /api/discover/next-user` - Get next user to swipe (Protected)
- `POST /api/discover/swipe-right` - Like user (Protected)
- `POST /api/discover/swipe-left` - Dislike/pass user (Protected)

### Matches

- `GET /api/matches` - Get all matches (Protected)
- `GET /api/matches/:id` - Get specific match (Protected)

### Health Check

- `GET /api/health` - Server health check

## Features

### Rule-Based Matching Algorithm

The matching algorithm uses 5 components with weighted scoring:

1. **Distance** (25%) - Closer users score higher
2. **Last Active** (20%) - Recently active users score higher
3. **Profile Completeness** (15%) - Complete profiles score higher
4. **Mutual Interests** (30%) - More common interests = higher score
5. **Age Preference** (10%) - Users within preferred age range score higher

Final score: 0-100 (weighted sum of all components)

### Profile Completeness

Calculated based on:
- Name (5 points)
- Age (5 points)
- Photos (30 points - 6 per photo, max 5)
- Bio (15 points)
- Interests (20 points - 4 per interest, max 5)
- Location (10 points)
- Personality (10 points)
- Dealbreakers (5 points)

### Swipe System

- **Swipe Right**: Like a user
  - Adds user to `liked` array
  - Checks for mutual like
  - Creates match if both users like each other
- **Swipe Left**: Dislike/pass a user
  - Adds user to `disliked` array
- Users in `liked`, `disliked`, or `matched` arrays are excluded from discovery

## Authentication

All protected routes require JWT token in Authorization header:

```
Authorization: Bearer <token>
```

## Request/Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Success message"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": [ ... ]  // For validation errors
}
```

## Example Requests

### Signup
```bash
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "gender": "male",
  "dob": "1995-01-15"
}
```

### Get Next User
```bash
GET /api/discover/next-user
Authorization: Bearer <token>
```

### Swipe Right
```bash
POST /api/discover/swipe-right
Authorization: Bearer <token>
Content-Type: application/json

{
  "targetUserId": "507f1f77bcf86cd799439011"
}
```

## Technologies Used

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Request validation
- **multer** - File uploads

## Notes

- Make sure to change `JWT_SECRET` in production
- File uploads are saved locally in `uploads/` directory
- For production, consider using cloud storage (AWS S3, Cloudinary) for photos
- Add rate limiting for production use
- Enable CORS for your frontend domain in production

