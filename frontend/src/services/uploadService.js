import api from './api';
import { API_ENDPOINTS } from '../config/api';

export const uploadService = {
  // Upload single photo
  uploadPhoto: async (photoFile, isMain = false, order = 0) => {
    const formData = new FormData();
    formData.append('photo', photoFile);
    formData.append('isMain', isMain);
    formData.append('order', order);

    const response = await api.post(API_ENDPOINTS.UPLOAD.PHOTO, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response;
  },

  // Upload multiple photos
  uploadPhotos: async (photoFiles) => {
    const formData = new FormData();
    photoFiles.forEach((file) => {
      formData.append('photos', file);
    });

    const response = await api.post(API_ENDPOINTS.UPLOAD.PHOTOS, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response;
  },

  // Delete photo
  deletePhoto: async (photoId) => {
    const response = await api.delete(`${API_ENDPOINTS.UPLOAD.DELETE_PHOTO}/${photoId}`);
    return response;
  },

  // Set main photo
  setMainPhoto: async (photoId) => {
    const response = await api.put(`${API_ENDPOINTS.UPLOAD.SET_MAIN_PHOTO}/${photoId}/set-main`);
    return response;
  },

  // Upload verification photo
  uploadVerificationPhoto: async (photoFile) => {
    const formData = new FormData();
    formData.append('photo', photoFile);

    const response = await api.post(API_ENDPOINTS.UPLOAD.VERIFICATION, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response;
  }
};

