// djangoClient.js
import axios from "axios";

const BASE_URL = import.meta.env.VITE_DJANGO_API_URL || 'http://localhost:8000';

const djangoClient = axios.create({
  baseURL: BASE_URL,
  timeout: 130000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// FIXED: Simplified and reliable token retrieval
djangoClient.interceptors.request.use(
  async (config) => {
    try {
      // Get token from localStorage (set by AuthContext)
      const token = localStorage.getItem('firebaseToken');
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('✅ Token added to request for:', config.url);
      } else {
        console.warn('⚠️ No Firebase token found for request to:', config.url);
        delete config.headers.Authorization;
      }
    } catch (error) {
      console.error('❌ Error in request interceptor:', error);
      // Continue without token
      delete config.headers.Authorization;
    }
    
    // Don't set Content-Type for FormData, let axios handle it
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);
    console.log('   Headers:', { 
      ...config.headers,
      Authorization: config.headers.Authorization ? 'Bearer [TOKEN]' : 'None' 
    });
    
    if (config.data instanceof FormData) {
      console.log('   Data: [FormData]');
      for (let [key, value] of config.data.entries()) {
        if (value instanceof File) {
          console.log(`     ${key}: [File] ${value.name}`);
        } else {
          console.log(`     ${key}:`, value);
        }
      }
    } else {
      console.log('   Data:', config.data);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
djangoClient.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}: ${response.status}`);
    return response;
  },
  (error) => {
    console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url}: ${error.response?.status}`);
    console.error('   Error details:', error.response?.data);
    
    if (error.response?.status === 401) {
      console.warn('🔐 401 Unauthorized - token may be invalid');
      // Clear stored token
      localStorage.removeItem('firebaseToken');
    }
    
    if (error.response?.status === 403) {
      console.warn('🚫 403 Forbidden - check permissions or authentication');
    }
    
    return Promise.reject(error);
  }
);

export default djangoClient;