// src/services/api.js

// src/services/api.js

class ApiService {
  constructor() {
    // Vite uses import.meta.env
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
    console.log('API Base URL:', this.baseURL);
  }

  async request(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Get token with retry logic for timing issues
    const token = await this.getAuthTokenWithRetry();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔐 Token added to request');
    } else {
      console.warn('⚠️ No auth token available for request');
    }

    if (options.body && typeof options.body === 'object') {
      config.body = JSON.stringify(options.body);
    }

    try {
      console.log(`📤 API Request: ${config.method || 'GET'} ${url}`);
      
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await this.parseErrorResponse(response);
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
      
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // NEW: Get auth token with retry for timing issues
  async getAuthTokenWithRetry(maxRetries = 3, delay = 100) {
    for (let i = 0; i < maxRetries; i++) {
      const token = this.getAuthToken();
      if (token) {
        console.log(`✅ Token found on attempt ${i + 1}`);
        return token;
      }
      
      if (i < maxRetries - 1) {
        console.log(`🔄 No token found, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        // Increase delay for next retry
        delay *= 2;
      }
    }
    
    console.warn('❌ No auth token found after retries');
    return null;
  }

  async parseErrorResponse(response) {
    try {
      return await response.json();
    } catch {
      return {
        message: `Server error: ${response.status} ${response.statusText}`
      };
    }
  }

  getAuthToken() {
    // Check both storage locations
    const token = localStorage.getItem('firebaseToken') || 
           sessionStorage.getItem('firebaseToken');
    
    if (token) {
      console.log('🔑 Token found in storage');
    } else {
      console.log('🔑 No token found in storage');
    }
    
    return token;
  }

  setAuthToken(token, remember = true) {
    if (remember) {
      localStorage.setItem('firebaseToken', token);
      console.log('💾 Token stored in localStorage');
    } else {
      sessionStorage.setItem('firebaseToken', token);
      console.log('💾 Token stored in sessionStorage');
    }
  }

  clearAuthToken() {
    localStorage.removeItem('firebaseToken');
    sessionStorage.removeItem('firebaseToken');
    console.log('🧹 Token cleared from storage');
  }

  isAuthenticated() {
    return !!this.getAuthToken();
  }

  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  async post(endpoint, data = {}, options = {}) {
    return this.request(endpoint, { ...options, method: 'POST', body: data });
  }

  async put(endpoint, data = {}, options = {}) {
    return this.request(endpoint, { ...options, method: 'PUT', body: data });
  }

  async patch(endpoint, data = {}, options = {}) {
    return this.request(endpoint, { ...options, method: 'PATCH', body: data });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiService = new ApiService();
export default apiService;