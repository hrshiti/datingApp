# SMSIndiaHub OTP Service Integration

## ✅ Integration Complete

SMSIndiaHub OTP service has been successfully integrated into the dating app backend.

## What Was Done

1. **Added axios dependency** to `package.json`
2. **Created SMSIndiaHub service** at `src/services/smsIndiaHubService.js`
3. **Updated auth controller** to use SMSIndiaHub for sending OTP
4. **Added credentials** to `.env` file

## Configuration

The following credentials have been added to `.env`:

```env
SMSINDIAHUB_API_KEY=j8oT8a4QSkuE8UbnoUHqDw
SMSINDIAHUB_SENDER_ID=SMSHUB
```

## How It Works

1. When a user requests OTP via `/api/auth/send-otp`:
   - OTP is generated and stored in the database
   - SMSIndiaHub service sends the OTP via SMS
   - User receives SMS with OTP

2. OTP Message Format:
   ```
   Welcome to DatingApp powered by SMSINDIAHUB. Your OTP for registration is {OTP}.
   ```

3. Phone Number Normalization:
   - Automatically converts phone numbers to Indian format (91XXXXXXXXXX)
   - Handles various input formats (with/without country code)

## Features

- ✅ Automatic phone number normalization
- ✅ Error handling for SMS failures
- ✅ Fallback to console logging if SMS fails
- ✅ Support for Indian phone numbers (+91)
- ✅ Configurable via environment variables

## API Endpoints

### Send OTP
```
POST /api/auth/send-otp
Body: {
  "phone": "1234567890",
  "countryCode": "+91"
}
```

### Resend OTP
```
POST /api/auth/resend-otp
Body: {
  "phone": "1234567890",
  "countryCode": "+91"
}
```

## Testing

1. Start the server:
   ```bash
   npm run dev
   ```

2. Test OTP sending:
   ```bash
   curl -X POST http://localhost:5000/api/auth/send-otp \
     -H "Content-Type: application/json" \
     -d '{
       "phone": "1234567890",
       "countryCode": "+91"
     }'
   ```

3. Check server logs for SMSIndiaHub response

## Error Handling

- If SMSIndiaHub is not configured, OTP is logged to console (development mode)
- If SMS sending fails, error is logged but request still succeeds
- In production, ensure SMSIndiaHub credentials are properly configured

## Notes

- OTP is valid for 10 minutes
- SMSIndiaHub supports Indian phone numbers (starting with 91)
- The service automatically handles phone number formatting
- Check SMSIndiaHub dashboard for delivery status

