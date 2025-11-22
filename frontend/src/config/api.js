const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    SEND_OTP: '/auth/send-otp',
    VERIFY_OTP: '/auth/verify-otp',
    RESEND_OTP: '/auth/resend-otp',
    ME: '/auth/me'
  },
  // Profile
  PROFILE: {
    CREATE_UPDATE: '/profile',
    BASIC_INFO: '/profile/basic-info',
    GET_ME: '/profile/me',
    GET_BY_ID: '/profile',
    CHECK_COMPLETION: '/profile/check-completion',
    UPDATE_ONBOARDING: '/profile/onboarding',
    COMPLETE_ONBOARDING: '/profile/complete-onboarding'
  },
  // Upload
  UPLOAD: {
    PHOTO: '/upload/photo',
    PHOTOS: '/upload/photos',
    DELETE_PHOTO: '/upload/photo',
    SET_MAIN_PHOTO: '/upload/photo',
    VERIFICATION: '/upload/verification'
  },
  // Discovery
  DISCOVERY: {
    FEED: '/discovery',
    LIKE: '/discovery/like',
    PASS: '/discovery/pass',
    MATCHES: '/discovery/matches'
  }
};

export default API_BASE_URL;

