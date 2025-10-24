// src/services/userAPI.js
import { apiService } from './api';

export const userAPI = {
  /**
   * Register a new user
   */
  register: async (userData) => {
    console.log('📤 userAPI.register - Sending registration data:', userData);
    
    try {
      const response = await apiService.post('/users/register/', userData);
      console.log('📥 userAPI.register - Backend response:', response);
      return response;
    } catch (error) {
      console.error('❌ userAPI.register - Error:', error);
      throw error;
    }
  },

  /**
   * User login
   */
  login: async (credentials) => {
    console.log('📤 userAPI.login - Sending login data:', { 
      email: credentials.email, 
      firebase_uid: credentials.firebase_uid 
    });
    
    try {
      const response = await apiService.post('/users/login/', credentials);
      console.log('📥 userAPI.login - Backend response:', response);
      return response;
    } catch (error) {
      console.error('❌ userAPI.login - Error:', error);
      throw error;
    }
  },

  /**
   * Get user profile
   */
  getProfile: async () => {
    console.log('📤 userAPI.getProfile - Fetching profile');
    
    try {
      const response = await apiService.get('/users/profile/');
      console.log('📥 userAPI.getProfile - Backend response:', response);
      return response;
    } catch (error) {
      console.error('❌ userAPI.getProfile - Error:', error);
      throw error;
    }
  },
  
  /**
   * Debug authentication
   */
  debugAuth: async () => {
    console.log('🔍 userAPI.debugAuth - Testing authentication');
    
    try {
      const response = await apiService.get('/users/debug-auth/');
      console.log('🔍 userAPI.debugAuth - Response:', response);
      return response;
    } catch (error) {
      console.error('❌ userAPI.debugAuth - Error:', error);
      throw error;
    }
  },
  /**
   * Update user profile
   */
  updateProfile: async (profileData) => {
    console.log('📤 userAPI.updateProfile - Sending profile data:', profileData);
    
    try {
      const response = await apiService.put('/users/profile/', profileData);
      console.log('📥 userAPI.updateProfile - Backend response:', response);
      return response;
    } catch (error) {
      console.error('❌ userAPI.updateProfile - Error:', error);
      throw error;
    }
  },

  /**
   * User logout
   */
  logout: async () => {
    console.log('📤 userAPI.logout - Logging out');
    
    try {
      const response = await apiService.post('/users/logout/');
      console.log('📥 userAPI.logout - Backend response:', response);
      return response;
    } catch (error) {
      console.error('❌ userAPI.logout - Error:', error);
      throw error;
    }
  },

  /**
   * Get user stats/dashboard data
   */
  getDashboard: async () => {
    console.log('📤 userAPI.getDashboard - Fetching dashboard data');
    
    try {
      const response = await apiService.get('/users/stats/');
      console.log('📥 userAPI.getDashboard - Backend response:', response);
      return response;
    } catch (error) {
      console.error('❌ userAPI.getDashboard - Error:', error);
      throw error;
    }
  },

  /**
   * Get user activities
   */
  getActivities: async (limit = 50) => {
    console.log('📤 userAPI.getActivities - Fetching activities');
    
    try {
      const response = await apiService.get(`/users/activities/?limit=${limit}`);
      console.log('📥 userAPI.getActivities - Backend response:', response);
      return response;
    } catch (error) {
      console.error('❌ userAPI.getActivities - Error:', error);
      throw error;
    }
  },

  /**
   * Update user preferences
   */
  updatePreferences: async (preferences) => {
    console.log('📤 userAPI.updatePreferences - Sending preferences:', preferences);
    
    try {
      const response = await apiService.put('/users/preferences/', preferences);
      console.log('📥 userAPI.updatePreferences - Backend response:', response);
      return response;
    } catch (error) {
      console.error('❌ userAPI.updatePreferences - Error:', error);
      throw error;
    }
  }
};

export default userAPI;