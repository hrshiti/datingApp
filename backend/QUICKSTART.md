# Quick Start Guide

## Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. The `.env` file is already configured with your credentials. If you need to modify it, edit `.env` file.

4. Start the server:
```bash
npm run dev
```

The server will start on `http://localhost:5000`

## Testing the API

### 1. Health Check
```bash
curl http://localhost:5000/health
```

### 2. Send OTP
```bash
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "1234567890",
    "countryCode": "+91"
  }'
```

### 3. Verify OTP
```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "1234567890",
    "countryCode": "+91",
    "otp": "123456"
  }'
```

Note: In development mode, the OTP will be logged to the console and returned in the response.

## Frontend Integration

Update your frontend API base URL to:
```
http://localhost:5000/api
```

For authentication, include the JWT token in headers:
```
Authorization: Bearer <your_token>
```

## Common Issues

1. **MongoDB Connection Error**: Check your MongoDB URI in `.env`
2. **Cloudinary Upload Error**: Verify Cloudinary credentials in `.env`
3. **Port Already in Use**: Change PORT in `.env` or kill the process using port 5000

