// src/services/userService.js
import { apiService } from './api';

/**
 * User service for handling all user-related API calls
 */
class UserService {
  /**
   * User registration
   */
  async register(userData) {
    return apiService.post('/users/register/', userData);
  }

  /**
   * User login
   */
  async login(credentials) {
    return apiService.post('/users/login/', credentials);
  }

  /**
   * Get current user profile
   */
  async getProfile() {
    return apiService.get('/users/profile/');
  }

  /**
   * Update user profile
   */
  async updateProfile(profileData) {
    return apiService.put('/users/profile/', profileData);
  }

  /**
   * Get user statistics
   */
  async getStats() {
    return apiService.get('/users/stats/');
  }

  /**
   * Get user activity logs
   */
  async getActivities(limit = 50) {
    return apiService.get(`/users/activities/?limit=${limit}`);
  }

  /**
   * Get user directory (for admin/agents)
   */
  async getDirectory(filters = {}) {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    
    const queryString = params.toString();
    const url = queryString ? `/users/directory/?${queryString}` : '/users/directory/';
    
    return apiService.get(url);
  }

  /**
   * Update user preferences
   */
  async updatePreferences(preferences) {
    return apiService.put('/users/preferences/', preferences);
  }

  /**
   * Logout user
   */
  async logout() {
    try {
      await apiService.post('/users/logout/');
    } catch (error) {
      console.warn('Logout API call failed, clearing local token anyway:', error);
    } finally {
      // Always clear local tokens
      apiService.clearAuthToken();
    }
  }

  /**
   * Verify if user session is still valid
   */
  async checkAuth() {
    try {
      const profile = await this.getProfile();
      return profile.success;
    } catch {
      return false;
    }
  }
}

// Create a singleton instance
export const userService = new UserService();
export default userService;