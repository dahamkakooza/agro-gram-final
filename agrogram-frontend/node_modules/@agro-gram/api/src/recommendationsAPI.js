import djangoClient from './djangoClient.js';

const recommendationsAPI = {
  // Core AI Services
  getCropRecommendation: (data) => djangoClient.post('/api/v1/recommendations/crop-recommendation/', data),
  getPricePrediction: (data) => djangoClient.post('/api/v1/recommendations/price-prediction/', data),
  agricultureChat: (data) => djangoClient.post('/api/v1/recommendations/agriculture-chat/', data),
  
  // Status and Diagnostic Endpoints
  getNetworkStatus: () => djangoClient.get('/api/v1/recommendations/network-status/'),
  getGeminiStatus: () => djangoClient.get('/api/v1/recommendations/gemini-status/'),
  getGeminiTest: () => djangoClient.get('/api/v1/recommendations/gemini-test/'),
  getSystemDiagnostic: () => djangoClient.get('/api/v1/recommendations/system-diagnostic/'),
  
  // Feedback (temporarily disabled)
  submitFeedback: (data) => djangoClient.post('/api/v1/recommendations/feedback/', data),
};

export default recommendationsAPI;