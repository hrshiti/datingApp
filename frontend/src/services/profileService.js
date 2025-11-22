import api from './api';
import { API_ENDPOINTS } from '../config/api';

export const profileService = {
  // Save basic information only (name, gender, age, orientation, lookingFor)
  saveBasicInfo: async (basicInfo) => {
    const response = await api.post(API_ENDPOINTS.PROFILE.BASIC_INFO, basicInfo);
    return response;
  },

  // Create or update profile
  createOrUpdateProfile: async (profileData) => {
    const response = await api.post(API_ENDPOINTS.PROFILE.CREATE_UPDATE, profileData);
    return response;
  },

  // Get own profile
  getMyProfile: async () => {
    const response = await api.get(API_ENDPOINTS.PROFILE.GET_ME);
    return response;
  },

  // Get profile by ID
  getProfileById: async (profileId) => {
    const response = await api.get(`${API_ENDPOINTS.PROFILE.GET_BY_ID}/${profileId}`);
    return response;
  },

  // Check profile completion
  checkProfileCompletion: async () => {
    const response = await api.get(API_ENDPOINTS.PROFILE.CHECK_COMPLETION);
    return response;
  },

  // Update onboarding step
  updateOnboardingStep: async (step, stepData) => {
    const response = await api.put(`${API_ENDPOINTS.PROFILE.UPDATE_ONBOARDING}/${step}`, stepData);
    return response;
  },

  // Complete onboarding
  completeOnboarding: async () => {
    const response = await api.post(API_ENDPOINTS.PROFILE.COMPLETE_ONBOARDING);
    return response;
  }
};

