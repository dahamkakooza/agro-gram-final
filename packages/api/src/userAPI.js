import djangoClient from './djangoClient.js';

// Helper function to check authentication
const checkAuth = () => {
  const token = localStorage.getItem('firebaseToken');
  if (!token) {
    console.warn('🔐 No authentication token found');
    return false;
  }
  return true;
};

// Helper function for default stats
function getDefaultStats() {
  return {
    total_farms: 0,
    total_plots: 0,
    active_crops: 0,
    pending_tasks: 0,
    total_orders: 0,
    total_revenue: 0,
    profile_completion: 0,
    productivity_level: 'MEDIUM',
    success_rate: 0,
    efficiency_score: 0
  };
}

// Safe error logging function
const safeLogError = (error, context) => {
  console.error(`❌ ${context}:`);
  console.error('   Status:', error.response?.status);
  console.error('   Status Text:', error.response?.statusText);
  console.error('   Error Message:', error.message);
  
  // Safely log response data without circular references
  if (error.response?.data) {
    try {
      const safeData = {};
      Object.keys(error.response.data).forEach(key => {
        if (typeof error.response.data[key] !== 'object' || error.response.data[key] === null) {
          safeData[key] = error.response.data[key];
        } else {
          safeData[key] = '[Object]';
        }
      });
      console.error('   Response Data:', safeData);
    } catch (e) {
      console.error('   Response Data: [Unable to parse]');
    }
  }
};

const userAPI = {
  /**
   * Get user profile
   */
  getProfile: async () => {
    try {
      // FIXED: Use helper function for auth check
      if (!checkAuth()) {
        return {
          success: false,
          error: 'Authentication required',
          message: 'Please log in to access your profile',
          status: 401,
          requiresLogin: true
        };
      }

      const response = await djangoClient.get('/api/v1/users/me/');
      
      // Handle different response structures
      if (response.data && response.data.success !== undefined) {
        return response.data;
      } else {
        // Direct data response, wrap it in success structure
        return {
          success: true,
          data: response.data
        };
      }
    } catch (error) {
      safeLogError(error, 'GET Profile Error');
      
      if (error.response && error.response.status === 404) {
        return {
          success: false,
          error: 'Profile not found',
          message: 'User profile does not exist yet',
          status: 404
        };
      }
      
      // FIXED: Handle authentication errors specifically
      if (error.response && error.response.status === 401) {
        console.warn('🔐 Authentication required, clearing token and redirecting...');
        localStorage.removeItem('firebaseToken');
        return {
          success: false,
          error: 'Authentication required',
          message: 'Please log in again',
          status: 401,
          requiresLogin: true
        };
      }
      
      // For other errors, return a failure response but don't throw
      return {
        success: false,
        error: 'Failed to fetch profile',
        message: error.response?.data?.error || 'Profile fetch failed',
        status: error.response?.status || 500
      };
    }
  },

  /**
   * Update user profile with comprehensive authentication handling
   */
  updateProfile: async (profileData) => {
    try {
      console.log('🔍 UPDATE Profile: Calling PUT /api/v1/users/profile/');
      
      // FIXED: Use helper function for auth check
      if (!checkAuth()) {
        console.error('❌ No authentication token found for profile update');
        return {
          success: false,
          error: 'Authentication required',
          message: 'Please log in to update your profile',
          status: 401,
          requiresLogin: true
        };
      }
      
      // Transform field names to match Django model
      const transformedData = {
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        phone_number: profileData.phone_number,
        location: profileData.location,
        farm_size: profileData.farm_size ? parseFloat(profileData.farm_size) : null,
        business_name: profileData.business_name,
        business_description: profileData.business_description,
        latitude: profileData.latitude ? parseFloat(profileData.latitude) : null,
        longitude: profileData.longitude ? parseFloat(profileData.longitude) : null
      };
      
      // Remove undefined/null values
      Object.keys(transformedData).forEach(key => {
        if (transformedData[key] === undefined || transformedData[key] === null || transformedData[key] === '') {
          delete transformedData[key];
        }
      });
      
      console.log('📦 UPDATE Profile: Transformed data for backend:', transformedData);
      
      const response = await djangoClient.put('/api/v1/users/profile/', transformedData);
      
      // Handle different response structures
      if (response.data && response.data.success !== undefined) {
        console.log('✅ UPDATE Profile: Success');
        return response.data;
      } else {
        console.log('✅ UPDATE Profile: Success (direct response)');
        return {
          success: true,
          data: response.data
        };
      }
      
    } catch (error) {
      safeLogError(error, 'UPDATE Profile');
      
      // FIXED: Handle authentication errors specifically
      if (error.response && error.response.status === 401) {
        console.warn('🔐 Authentication failed, clearing token');
        localStorage.removeItem('firebaseToken');
        return {
          success: false,
          error: 'Authentication required',
          message: 'Please log in again to update your profile',
          status: 401,
          requiresLogin: true
        };
      }
      
      return {
        success: false,
        error: 'Failed to update profile',
        message: error.response?.data?.error || error.response?.data?.detail || 'Profile update failed',
        details: error.response?.data,
        status: error.response?.status || 500
      };
    }
  },

  /**
   * Update user preferences with authentication handling
   */
  updateUserPreferences: async (preferencesData) => {
    try {
      console.log('🔍 UPDATE Preferences: Calling PUT /api/v1/users/preferences/');
      
      // FIXED: Use helper function for auth check
      if (!checkAuth()) {
        console.error('❌ No authentication token found for preferences update');
        return {
          success: false,
          error: 'Authentication required',
          message: 'Please log in to update preferences',
          status: 401,
          requiresLogin: true
        };
      }
      
      // Clean the data to ensure only primitive values are sent
      const cleanPreferences = {
        price_range_min: preferencesData.price_range_min ? parseFloat(preferencesData.price_range_min) : null,
        price_range_max: preferencesData.price_range_max ? parseFloat(preferencesData.price_range_max) : null,
        quality_preference: preferencesData.quality_preference || 'STANDARD',
        preferred_locations: Array.isArray(preferencesData.preferred_locations) 
          ? preferencesData.preferred_locations 
          : []
      };
      
      console.log('📦 UPDATE Preferences: Cleaned data for backend:', cleanPreferences);
      
      const response = await djangoClient.put('/api/v1/users/preferences/', cleanPreferences);
      
      // Handle different response structures
      if (response.data && response.data.success !== undefined) {
        console.log('✅ UPDATE Preferences: Success');
        return response.data;
      } else {
        console.log('✅ UPDATE Preferences: Success (direct response)');
        return {
          success: true,
          data: response.data
        };
      }
      
    } catch (error) {
      safeLogError(error, 'UPDATE Preferences');
      
      // FIXED: Handle authentication errors
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('firebaseToken');
        return {
          success: false,
          error: 'Authentication required',
          message: 'Please log in again to update preferences',
          status: 401,
          requiresLogin: true
        };
      }
      
      return {
        success: false,
        error: 'Failed to update preferences',
        message: error.response?.data?.error || 'Preferences update failed',
        status: error.response?.status || 500
      };
    }
  },

  /**
   * Register user
   */
  register: async (userData) => {
    try {
      console.log('🔍 REGISTER: Calling POST /api/v1/users/auth/register/');
      
      // Transform field names to match Django model
      const transformedData = {
        email: userData.email,
        firebase_uid: userData.firebase_uid,
        role: userData.role,
        first_name: userData.first_name,
        last_name: userData.last_name,
        phone_number: userData.phone_number,
        business_name: userData.business_name,
        location: userData.location,
        farm_size: userData.farm_size ? parseFloat(userData.farm_size) : null
      };
      
      // Remove undefined/null values
      Object.keys(transformedData).forEach(key => {
        if (transformedData[key] === undefined || transformedData[key] === null || transformedData[key] === '') {
          delete transformedData[key];
        }
      });
      
      console.log('📦 REGISTER: Transformed data for backend:', transformedData);
      
      const response = await djangoClient.post('/api/v1/users/auth/register/', transformedData);
      
      // Handle different response structures
      if (response.data && response.data.success !== undefined) {
        console.log('✅ REGISTER: Success');
        return response.data;
      } else {
        console.log('✅ REGISTER: Success (direct response)');
        return {
          success: true,
          data: response.data
        };
      }
      
    } catch (error) {
      safeLogError(error, 'REGISTER');
      
      // Don't throw, return a structured error response
      return {
        success: false,
        error: 'Registration failed',
        message: error.response?.data?.error || 'User registration failed',
        details: error.response?.data,
        status: error.response?.status || 500
      };
    }
  },

  /**
   * Get user activities
   */
  getActivities: async () => {
    try {
      // FIXED: Use helper function for auth check
      if (!checkAuth()) {
        return {
          success: true,
          data: { activities: [] }
        };
      }

      const response = await djangoClient.get('/api/v1/users/activities/');
      
      // Handle different response structures
      if (response.data && response.data.success !== undefined) {
        return response.data;
      } else {
        return {
          success: true,
          data: response.data
        };
      }
    } catch (error) {
      console.warn('⚠️ Activities endpoint failed, trying alternative endpoint:', error.message);
      
      try {
        // Try the viewset alternative endpoint
        const restResponse = await djangoClient.get('/api/v1/users/me/activities/');
        
        // Handle different response structures
        if (restResponse.data && restResponse.data.success !== undefined) {
          return restResponse.data;
        } else {
          return {
            success: true,
            data: restResponse.data
          };
        }
      } catch (restError) {
        console.warn('⚠️ Both activities endpoints failed, returning empty array');
        // Return empty activities as fallback
        return {
          success: true,
          data: {
            activities: []
          }
        };
      }
    }
  },

  /**
   * Get user statistics
   */
  getUserStats: async () => {
    try {
      // FIXED: Use helper function for auth check
      if (!checkAuth()) {
        return {
          success: true,
          data: getDefaultStats()
        };
      }

      const response = await djangoClient.get('/api/v1/users/stats/');
      
      // Handle different response structures
      if (response.data && response.data.success !== undefined) {
        return response.data;
      } else {
        return {
          success: true,
          data: response.data
        };
      }
    } catch (error) {
      console.warn('⚠️ Stats endpoint failed, trying alternative endpoint:', error.message);
      
      try {
        // Try the viewset alternative endpoint
        const restResponse = await djangoClient.get('/api/v1/users/me/stats/');
        
        // Handle different response structures
        if (restResponse.data && restResponse.data.success !== undefined) {
          return restResponse.data;
        } else {
          return {
            success: true,
            data: restResponse.data
          };
        }
      } catch (restError) {
        console.warn('⚠️ Both stats endpoints failed, returning default stats');
        // Return default stats as fallback
        return {
          success: true,
          data: getDefaultStats()
        };
      }
    }
  },

  /**
   * Get user preferences
   */
  getUserPreferences: async () => {
    try {
      // FIXED: Use helper function for auth check
      if (!checkAuth()) {
        return {
          success: true,
          data: {}
        };
      }

      const response = await djangoClient.get('/api/v1/users/preferences/');
      
      // Handle different response structures
      if (response.data && response.data.success !== undefined) {
        return response.data;
      } else {
        return {
          success: true,
          data: response.data
        };
      }
    } catch (error) {
      console.warn('⚠️ Preferences endpoint failed, returning empty object');
      return {
        success: true,
        data: {}
      };
    }
  },

  /**
   * Login user
   */
  login: async (email, firebase_uid) => {
    try {
      const response = await djangoClient.post('/api/v1/users/auth/login/', {
        email,
        firebase_uid
      });
      
      // Handle different response structures
      if (response.data && response.data.success !== undefined) {
        return response.data;
      } else {
        return {
          success: true,
          data: response.data
        };
      }
    } catch (error) {
      safeLogError(error, 'Login');
      return {
        success: false,
        error: 'Login failed',
        message: error.response?.data?.error || 'Authentication failed',
        status: error.response?.status || 500
      };
    }
  },

  /**
   * Logout user
   */
  logout: async () => {
    try {
      const response = await djangoClient.post('/api/v1/users/auth/logout/');
      
      // Clear local storage regardless of API response
      localStorage.removeItem('firebaseToken');
      
      // Handle different response structures
      if (response.data && response.data.success !== undefined) {
        return response.data;
      } else {
        return {
          success: true,
          data: response.data
        };
      }
    } catch (error) {
      safeLogError(error, 'Logout');
      // Still clear local storage even if API call fails
      localStorage.removeItem('firebaseToken');
      return {
        success: false,
        error: 'Logout failed',
        message: error.response?.data?.error || 'Logout failed',
        status: error.response?.status || 500
      };
    }
  },

  /**
   * Create user profile
   */
  createProfile: async (profileData) => {
    try {
      console.log('🔍 CREATE Profile: Calling POST /api/v1/users/profile/create/');
      
      // FIXED: Use helper function for auth check
      if (!checkAuth()) {
        return {
          success: false,
          error: 'Authentication required',
          message: 'Please log in to create profile',
          status: 401,
          requiresLogin: true
        };
      }

      const response = await djangoClient.post('/api/v1/users/profile/create/', profileData);
      
      // Handle different response structures
      if (response.data && response.data.success !== undefined) {
        return response.data;
      } else {
        return {
          success: true,
          data: response.data
        };
      }
    } catch (error) {
      safeLogError(error, 'CREATE Profile');
      return {
        success: false,
        error: 'Failed to create profile',
        message: error.response?.data?.error || 'Profile creation failed',
        status: error.response?.status || 500
      };
    }
  }
};

export default userAPI;