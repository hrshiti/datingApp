import api from './api';
import { API_ENDPOINTS } from '../config/api';

export const discoveryService = {
  // Get discovery feed
  getDiscoveryFeed: async () => {
    const response = await api.get(API_ENDPOINTS.DISCOVERY.FEED);
    return response;
  },

  // Like a profile
  likeProfile: async (targetUserId) => {
    const response = await api.post(API_ENDPOINTS.DISCOVERY.LIKE, {
      targetUserId
    });
    return response;
  },

  // Pass a profile
  passProfile: async (targetUserId) => {
    const response = await api.post(API_ENDPOINTS.DISCOVERY.PASS, {
      targetUserId
    });
    return response;
  },

  // Get matches
  getMatches: async () => {
    const response = await api.get(API_ENDPOINTS.DISCOVERY.MATCHES);
    return response;
  },

  // Get next best match (single user)
  getNextUser: async () => {
    const response = await api.get(API_ENDPOINTS.DISCOVERY.NEXT_USER);
    return response;
  }
};

