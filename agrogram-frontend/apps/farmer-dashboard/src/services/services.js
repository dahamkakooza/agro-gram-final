// services.js - COMPLETE FIXED VERSION WITH BACKEND MIGRATION
import djangoClient from '/../../packages/api/src/djangoClient.js'

// Enhanced error handler with dashboard-specific handling
const handleApiError = (error, defaultMessage = 'An error occurred') => {
  console.error('API Error:', error);
  
  if (error.response) {
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return {
          success: false,
          error: 'Bad Request',
          message: data.details || data.error || 'Invalid data provided',
          details: data.details || null,
          status
        };
      case 401:
        return {
          success: false,
          error: 'Unauthorized',
          message: 'Please log in again',
          status
        };
      case 403:
        return {
          success: false,
          error: 'Forbidden',
          message: 'You do not have permission to perform this action',
          status
        };
      case 404:
        // FIXED: Handle 404 errors specifically for dashboard endpoints
        if (error.config?.url?.includes('/dashboard/')) {
          return {
            success: true, // Return success with empty data for missing dashboards
            data: {
              dashboard_type: 'fallback',
              welcome_message: 'Welcome to Agro-Gram!',
              message: 'Dashboard data is being prepared',
              stats: {},
              features: []
            },
            fromCache: false
          };
        }
        return {
          success: false,
          error: 'Not Found',
          message: 'The requested resource was not found',
          status
        };
      case 409:
        return {
          success: false,
          error: 'Conflict',
          message: 'A conflict occurred with the current state',
          status
        };
      case 422:
        return {
          success: false,
          error: 'Validation Error',
          message: 'Data validation failed',
          details: data.details || data.errors || null,
          status
        };
      case 429:
        return {
          success: false,
          error: 'Too Many Requests',
          message: 'Rate limit exceeded. Please try again later.',
          status
        };
      case 500:
        return {
          success: false,
          error: 'Server Error',
          message: 'Internal server error. Please try again later.',
          status
        };
      case 502:
      case 503:
      case 504:
        return {
          success: false,
          error: 'Service Unavailable',
          message: 'Service is temporarily unavailable. Please try again later.',
          status
        };
      default:
        return {
          success: false,
          error: `Error ${status}`,
          message: data.error || data.message || defaultMessage,
          status
        };
    }
  } else if (error.request) {
    if (error.code === 'ECONNABORTED') {
      return {
        success: false,
        error: 'Timeout',
        message: 'Request timed out. Please check your connection and try again.',
        status: 0
      };
    }
    return {
      success: false,
      error: 'Network Error',
      message: 'Unable to connect to server. Please check your internet connection.',
      status: 0
    };
  } else {
    return {
      success: false,
      error: 'Unknown Error',
      message: defaultMessage,
      status: 0
    };
  }
};

// Enhanced API call wrapper with retry logic
const apiCall = async (apiFunction, ...args) => {
  const maxRetries = 2;
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await apiFunction(...args);
      
      if (response.data && response.data.success === false) {
        return {
          success: false,
          error: response.data.error || 'Operation failed',
          message: response.data.message || 'The operation could not be completed',
          details: response.data.details || null,
          data: response.data
        };
      }
      
      return {
        success: true,
        data: response.data,
        status: response.status
      };
    } catch (error) {
      lastError = error;
      
      // Don't retry on client errors (4xx) except 429
      if (error.response && error.response.status >= 400 && error.response.status < 500 && error.response.status !== 429) {
        break;
      }
      
      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        console.log(`Retrying API call (attempt ${attempt + 1})...`);
      }
    }
  }
  
  return handleApiError(lastError);
};

// =============================================================================
// UPDATED: Dashboard API with NEW BACKEND ENDPOINTS (SAFE MIGRATION)
// =============================================================================

export const dashboardAPI = {
  // Farmer Dashboards - UPDATED ENDPOINTS
  getSmallholderFarmerDashboard: () => 
    apiCall(djangoClient.get, '/api/v1/dashboard/farmer/smallholder/'),
  
  getCommercialFarmerDashboard: () => 
    apiCall(djangoClient.get, '/api/v1/dashboard/farmer/commercial/'),
  
  getOrganicSpecialistDashboard: () => 
    apiCall(djangoClient.get, '/api/v1/dashboard/farmer/organic/'),
  
  getLivestockFarmerDashboard: () => 
    apiCall(djangoClient.get, '/api/v1/dashboard/farmer/livestock/'),

  // Consumer Dashboards - UPDATED ENDPOINTS
  getIndividualConsumerDashboard: () => 
    apiCall(djangoClient.get, '/api/v1/dashboard/consumer/individual/'),
  
  getRestaurantBusinessDashboard: () => 
    apiCall(djangoClient.get, '/api/v1/dashboard/consumer/restaurant/'),
  
  getExportClientDashboard: () => 
    apiCall(djangoClient.get, '/api/v1/dashboard/consumer/export/'),
  
  getInstitutionalBuyerDashboard: () => 
    apiCall(djangoClient.get, '/api/v1/dashboard/consumer/institutional/'),

  // Supplier Dashboards - UPDATED ENDPOINTS
  getLogisticsProviderDashboard: () => 
    apiCall(djangoClient.get, '/api/v1/dashboard/supplier/logistics/'),
  
  getInputSupplierDashboard: () => 
    apiCall(djangoClient.get, '/api/v1/dashboard/supplier/input/'),
  
  getMachineryProviderDashboard: () => 
    apiCall(djangoClient.get, '/api/v1/dashboard/supplier/machinery/'),
  
  getServiceProviderDashboard: () => 
    apiCall(djangoClient.get, '/api/v1/dashboard/supplier/service/'),

  // Agent Dashboards - UPDATED ENDPOINTS
  getFinancialAdvisorDashboard: () => 
    apiCall(djangoClient.get, '/api/v1/dashboard/agent/financial/dashboard/'),
  
  getTechnicalAdvisorDashboard: () => 
    apiCall(djangoClient.get, '/api/v1/dashboard/agent/technical/dashboard/'),
  
  getLegalSpecialistDashboard: () => 
    apiCall(djangoClient.get, '/api/v1/dashboard/agent/legal/dashboard/'),
  
  getMarketAnalystDashboard: () => 
    apiCall(djangoClient.get, '/api/v1/dashboard/agent/market/dashboard/'),

  // Admin Dashboards - UPDATED ENDPOINTS
  getPlatformAdminDashboard: () => 
    apiCall(djangoClient.get, '/api/v1/dashboard/admin/platform/'),
  
  getBusinessAdminDashboard: () => 
    apiCall(djangoClient.get, '/api/v1/dashboard/admin/business/'),
  
  // Financial Advisor - Real endpoints (UPDATED)
  getLoanApplications: (params = {}) => 
    apiCall(djangoClient.get, '/api/v1/financial/loan-applications/', { params }),
  
  createLoanApplication: (data) => 
    apiCall(djangoClient.post, '/api/v1/financial/loan-applications/', data),
  
  updateLoanApplication: (id, data) => 
    apiCall(djangoClient.patch, `/api/v1/financial/loan-applications/${id}/`, data),
  
  getRiskAssessments: () => 
    apiCall(djangoClient.get, '/api/v1/financial/risk-assessments/'),
  
  createRiskAssessment: (data) => 
    apiCall(djangoClient.post, '/api/v1/financial/risk-assessments/', data),
  
  getCollateralValuations: () => 
    apiCall(djangoClient.get, '/api/v1/financial/collateral-valuations/'),
  
  createCollateralValuation: (data) => 
    apiCall(djangoClient.post, '/api/v1/financial/collateral-valuations/', data),

  // Technical Advisor - Real endpoints (UPDATED)
  getActiveCases: (params = {}) => 
    apiCall(djangoClient.get, '/api/v1/technical/cases/', { params }),
  
  createCase: (data) => 
    apiCall(djangoClient.post, '/api/v1/technical/cases/', data),
  
  updateCase: (id, data) => 
    apiCall(djangoClient.patch, `/api/v1/technical/cases/${id}/`, data),
  
  getKnowledgeBase: (params = {}) => 
    apiCall(djangoClient.get, '/api/v1/technical/knowledge-base/', { params }),
  
  createKnowledgeEntry: (data) => 
    apiCall(djangoClient.post, '/api/v1/technical/knowledge-base/', data),
  
  getFieldVisits: () => 
    apiCall(djangoClient.get, '/api/v1/technical/field-visits/'),
  
  scheduleFieldVisit: (data) => 
    apiCall(djangoClient.post, '/api/v1/technical/field-visits/', data),

  // Legal Specialist - Real endpoints (UPDATED)
  getLegalCases: (params = {}) => 
    apiCall(djangoClient.get, '/api/v1/legal/cases/', { params }),
  
  createLegalCase: (data) => 
    apiCall(djangoClient.post, '/api/v1/legal/cases/', data),
  
  getComplianceUpdates: () => 
    apiCall(djangoClient.get, '/api/v1/legal/compliance-updates/'),
  
  getLegalDocuments: (params = {}) => 
    apiCall(djangoClient.get, '/api/v1/legal/documents/', { params }),
  
  uploadLegalDocument: (data) => 
    apiCall(djangoClient.post, '/api/v1/legal/documents/', data),
  
  getContractTemplates: () => 
    apiCall(djangoClient.get, '/api/v1/legal/contract-templates/'),
  
  createContractTemplate: (data) => 
    apiCall(djangoClient.post, '/api/v1/legal/contract-templates/', data),

  // Market Analyst - Real endpoints (UPDATED)
  getMarketIntelligence: (params = {}) => 
    apiCall(djangoClient.get, '/api/v1/market/intelligence/', { params }),
  
  getPriceAnalysis: (commodity, timeframe = '1m') => 
    apiCall(djangoClient.get, `/api/v1/market/prices/${commodity}/`, { 
      params: { timeframe } 
    }),
  
  getCompetitorAnalysis: () => 
    apiCall(djangoClient.get, '/api/v1/market/competitors/'),
  
  createMarketReport: (data) => 
    apiCall(djangoClient.post, '/api/v1/market/reports/', data),
  
  getScheduledReports: () => 
    apiCall(djangoClient.get, '/api/v1/market/scheduled-reports/'),
  
  scheduleReport: (data) => 
    apiCall(djangoClient.post, '/api/v1/market/scheduled-reports/', data),
  
  getAlerts: () => 
    apiCall(djangoClient.get, '/api/v1/market/alerts/'),
  
  createAlert: (data) => 
    apiCall(djangoClient.post, '/api/v1/market/alerts/', data),

  // Generic dashboard fallback - UPDATED to use new endpoints
  getDashboardBySubRole: (subRole) => {
    const dashboardMap = {
      // Farmer - UPDATED
      'SMALLHOLDER_FARMER': dashboardAPI.getSmallholderFarmerDashboard,
      'COMMERCIAL_FARMER': dashboardAPI.getCommercialFarmerDashboard,
      'ORGANIC_SPECIALIST': dashboardAPI.getOrganicSpecialistDashboard,
      'LIVESTOCK_FARMER': dashboardAPI.getLivestockFarmerDashboard,
      // Consumer - UPDATED
      'INDIVIDUAL_CONSUMER': dashboardAPI.getIndividualConsumerDashboard,
      'RESTAURANT_BUSINESS': dashboardAPI.getRestaurantBusinessDashboard,
      'EXPORT_CLIENT': dashboardAPI.getExportClientDashboard,
      'INSTITUTIONAL_BUYER': dashboardAPI.getInstitutionalBuyerDashboard,
      // Supplier - UPDATED
      'LOGISTICS_PROVIDER': dashboardAPI.getLogisticsProviderDashboard,
      'INPUT_SUPPLIER': dashboardAPI.getInputSupplierDashboard,
      'MACHINERY_PROVIDER': dashboardAPI.getMachineryProviderDashboard,
      'SERVICE_PROVIDER': dashboardAPI.getServiceProviderDashboard,
      // Agent - UPDATED
      'FINANCIAL_ADVISOR': dashboardAPI.getFinancialAdvisorDashboard,
      'TECHNICAL_ADVISOR': dashboardAPI.getTechnicalAdvisorDashboard,
      'LEGAL_SPECIALIST': dashboardAPI.getLegalSpecialistDashboard,
      'MARKET_ANALYST': dashboardAPI.getMarketAnalystDashboard,
      // Admin - UPDATED
      'PLATFORM_ADMIN': dashboardAPI.getPlatformAdminDashboard,
      'BUSINESS_ADMIN': dashboardAPI.getBusinessAdminDashboard,
    };
    
    const dashboardFunction = dashboardMap[subRole];
    if (!dashboardFunction) {
      return {
        success: true, // Return success with fallback data
        data: {
          dashboard_type: 'fallback',
          welcome_message: 'Welcome to Agro-Gram!',
          message: `Dashboard for ${subRole} is being prepared`,
          stats: {},
          features: []
        }
      };
    }
    
    return dashboardFunction();
  }
};

// =============================================================================
// NEW: Modular Dashboard API Structure (FOR FUTURE USE)
// =============================================================================

export const newDashboardAPI = {
  // Farmer endpoints
  farmer: {
    smallholder: () => apiCall(djangoClient.get, '/api/v1/dashboard/farmer/smallholder/'),
    commercial: () => apiCall(djangoClient.get, '/api/v1/dashboard/farmer/commercial/'),
    organic: () => apiCall(djangoClient.get, '/api/v1/dashboard/farmer/organic/'),
    livestock: () => apiCall(djangoClient.get, '/api/v1/dashboard/farmer/livestock/'),
  },
  
  // Consumer endpoints
  consumer: {
    individual: () => apiCall(djangoClient.get, '/api/v1/dashboard/consumer/individual/'),
    restaurant: () => apiCall(djangoClient.get, '/api/v1/dashboard/consumer/restaurant/'),
    export: () => apiCall(djangoClient.get, '/api/v1/dashboard/consumer/export/'),
    institutional: () => apiCall(djangoClient.get, '/api/v1/dashboard/consumer/institutional/'),
  },
  
  // Supplier endpoints
  supplier: {
    logistics: () => apiCall(djangoClient.get, '/api/v1/dashboard/supplier/logistics/'),
    input: () => apiCall(djangoClient.get, '/api/v1/dashboard/supplier/input/'),
    machinery: () => apiCall(djangoClient.get, '/api/v1/dashboard/supplier/machinery/'),
    service: () => apiCall(djangoClient.get, '/api/v1/dashboard/supplier/service/'),
  },
  
  // Agent endpoints
  agent: {
    financial: {
      dashboard: () => apiCall(djangoClient.get, '/api/v1/dashboard/agent/financial/dashboard/'),
      loans: () => apiCall(djangoClient.get, '/api/v1/dashboard/agent/financial/loans/'),
    },
    technical: {
      dashboard: () => apiCall(djangoClient.get, '/api/v1/dashboard/agent/technical/dashboard/'),
    },
    legal: {
      dashboard: () => apiCall(djangoClient.get, '/api/v1/dashboard/agent/legal/dashboard/'),
    },
    market: {
      dashboard: () => apiCall(djangoClient.get, '/api/v1/dashboard/agent/market/dashboard/'),
    }
  },
  
  // Admin endpoints
  admin: {
    platform: () => apiCall(djangoClient.get, '/api/v1/dashboard/admin/platform/'),
    business: () => apiCall(djangoClient.get, '/api/v1/dashboard/admin/business/'),
  }
};

// =============================================================================
// REST OF THE APIs (UNCHANGED)
// =============================================================================

// FIXED: Enhanced User API with proper getAllUsers function
export const userAPI = {
  getProfile: () => apiCall(djangoClient.get, '/api/v1/users/me/'),
  createProfile: (data) => apiCall(djangoClient.post, '/api/v1/users/profiles/', data),
  updateProfile: (data) => apiCall(djangoClient.patch, '/api/v1/users/me/update/', data),
  getUserStats: () => apiCall(djangoClient.get, '/api/v1/users/me/stats/'),
  getActivities: () => apiCall(djangoClient.get, '/api/v1/users/me/activities/'),
  register: (data) => apiCall(djangoClient.post, '/api/v1/users/register/', data),
  login: (data) => apiCall(djangoClient.post, '/api/v1/users/login/', data),
  logout: () => apiCall(djangoClient.post, '/api/v1/users/auth/logout/'),
  
  // FIXED: User Directory functions - CORRECTED
  getUsersDirectory: (filters = {}) => 
    apiCall(djangoClient.get, '/api/v1/users/directory/', { params: filters }),
  
  getAllUsers: () => apiCall(djangoClient.get, '/api/v1/users/directory/'),
  
  // Role-specific dashboard endpoints (KEEP FOR LEGACY SUPPORT)
  getFarmerDashboard: () => apiCall(djangoClient.get, '/api/v1/users/dashboard/farmer/'),
  getConsumerDashboard: () => apiCall(djangoClient.get, '/api/v1/users/dashboard/consumer/'),
  getSupplierDashboard: () => apiCall(djangoClient.get, '/api/v1/users/dashboard/supplier/'),
  getAdminDashboard: () => apiCall(djangoClient.get, '/api/v1/users/dashboard/admin/'),
  getAgentDashboard: () => apiCall(djangoClient.get, '/api/v1/users/dashboard/agent/'),

  // Role-specific stats
  getFarmerStats: () => apiCall(djangoClient.get, '/api/v1/users/stats/farmer/'),
  getConsumerStats: () => apiCall(djangoClient.get, '/api/v1/users/stats/consumer/'),
  getSupplierStats: () => apiCall(djangoClient.get, '/api/v1/users/stats/supplier/'),

  // NEW: Sub-role management
  updateSubRole: (subRole) => 
    apiCall(djangoClient.patch, '/api/v1/users/me/update/', { sub_role: subRole }),
  
  getSubRoleFeatures: (subRole) => 
    apiCall(djangoClient.get, `/api/v1/users/sub-roles/${subRole}/features/`),
};

// FIXED: Remove duplicate getAllUsers from farmerAPI and consumerAPI
export const farmerAPI = {
  // Smallholder Farmer
  getTodayPriorities: () => apiCall(djangoClient.get, '/api/v1/farmer/smallholder/today-priorities/'),
  updateCropStatus: (cropId, status) => 
    apiCall(djangoClient.patch, `/api/v1/farmer/smallholder/crops/${cropId}/`, { status }),
  
  // Commercial Farmer
  getEnterpriseOverview: () => apiCall(djangoClient.get, '/api/v1/farmer/commercial/enterprise/'),
  getSupplyChainData: () => apiCall(djangoClient.get, '/api/v1/farmer/commercial/supply-chain/'),
  
  // Organic Specialist
  getCertificationStatus: () => apiCall(djangoClient.get, '/api/v1/farmer/organic/certifications/'),
  getPremiumMarketplace: () => apiCall(djangoClient.get, '/api/v1/farmer/organic/premium-market/'),
  
  // Livestock Farmer
  getLivestockHealth: () => apiCall(djangoClient.get, '/api/v1/farmer/livestock/health/'),
  getProductProcessing: () => apiCall(djangoClient.get, '/api/v1/farmer/livestock/processing/'),
};

export const consumerAPI = {
  // Individual Consumer
  getPersonalizedRecommendations: () => 
    apiCall(djangoClient.get, '/api/v1/consumer/individual/recommendations/'),
  getQuickOrderHistory: () => apiCall(djangoClient.get, '/api/v1/consumer/individual/quick-orders/'),
  
  // Restaurant/Business
  getSupplyChainOverview: () => apiCall(djangoClient.get, '/api/v1/consumer/restaurant/supply-chain/'),
  getInventoryIntegration: () => apiCall(djangoClient.get, '/api/v1/consumer/restaurant/inventory/'),
  
  // Export Client
  getGlobalTradeOverview: () => apiCall(djangoClient.get, '/api/v1/consumer/export/trade-overview/'),
  getComplianceDocuments: () => apiCall(djangoClient.get, '/api/v1/consumer/export/compliance/'),
  
  // Institutional Buyer
  getContractOverview: () => apiCall(djangoClient.get, '/api/v1/consumer/institutional/contracts/'),
  getBudgetCompliance: () => apiCall(djangoClient.get, '/api/v1/consumer/institutional/budget/'),
};

export const supplierAPI = {
  // Logistics Provider
  getFleetCommandCenter: () => apiCall(djangoClient.get, '/api/v1/supplier/logistics/fleet/'),
  getRouteOptimization: () => apiCall(djangoClient.get, '/api/v1/supplier/logistics/routes/'),
  
  // Input Supplier
  getInventorySalesSnapshot: () => apiCall(djangoClient.get, '/api/v1/supplier/input/snapshot/'),
  getSalesIntelligence: () => apiCall(djangoClient.get, '/api/v1/supplier/input/intelligence/'),
  
  // Machinery Provider
  getEquipmentFleet: () => apiCall(djangoClient.get, '/api/v1/supplier/machinery/fleet/'),
  getRentalOperations: () => apiCall(djangoClient.get, '/api/v1/supplier/machinery/rentals/'),
  
  // Service Provider
  getServiceOperations: () => apiCall(djangoClient.get, '/api/v1/supplier/service/operations/'),
  getMobileWorkforce: () => apiCall(djangoClient.get, '/api/v1/supplier/service/workforce/'),
};

export const agentAPI = {
  // Financial Advisor
  getFinancialPortfolio: () => apiCall(djangoClient.get, '/api/v1/agent/financial/portfolio/'),
  getRiskAssessment: () => apiCall(djangoClient.get, '/api/v1/agent/financial/risk/'),
  
  // Technical Advisor
  getActiveCases: () => apiCall(djangoClient.get, '/api/v1/agent/technical/cases/'),
  getKnowledgeBase: () => apiCall(djangoClient.get, '/api/v1/agent/technical/knowledge/'),
  
  // Legal Specialist
  getLegalCases: () => apiCall(djangoClient.get, '/api/v1/agent/legal/cases/'),
  getComplianceHub: () => apiCall(djangoClient.get, '/api/v1/agent/legal/compliance/'),
  
  // Market Analyst
  getMarketIntelligence: () => apiCall(djangoClient.get, '/api/v1/agent/market/intelligence/'),
  getPriceIntelligence: () => apiCall(djangoClient.get, '/api/v1/agent/market/prices/'),
};

export const adminAPI = {
  // Platform Admin
  getPlatformHealth: () => apiCall(djangoClient.get, '/api/v1/admin/platform/health/'),
  getUserManagement: () => apiCall(djangoClient.get, '/api/v1/admin/platform/users/'),
  
  // Business Admin
  getBusinessOverview: () => apiCall(djangoClient.get, '/api/v1/admin/business/overview/'),
  getRevenueAnalytics: () => apiCall(djangoClient.get, '/api/v1/admin/business/revenue/'),
};

// Enhanced Marketplace API with sub-role specific endpoints
export const marketplaceAPI = {
  // Basic marketplace operations
  getProducts: (params = {}) => apiCall(djangoClient.get, '/api/v1/marketplace/products/', { params }),
  getProduct: (id) => apiCall(djangoClient.get, `/api/v1/marketplace/products/${id}/`),
  createProduct: (data) => apiCall(djangoClient.post, '/api/v1/marketplace/products/', data),
  updateProduct: (id, data) => apiCall(djangoClient.patch, `/api/v1/marketplace/products/${id}/`, data),
  deleteProduct: (id) => apiCall(djangoClient.delete, `/api/v1/marketplace/products/${id}/`),
  
  // Categories and filters
  getCategories: () => apiCall(djangoClient.get, '/api/v1/marketplace/categories/'),
  getFeaturedProducts: () => apiCall(djangoClient.get, '/api/v1/marketplace/products/featured/'),
  
  // Search and recommendations
  searchProducts: (query, filters = {}) => 
    apiCall(djangoClient.get, '/api/v1/marketplace/search/', { 
      params: { q: query, ...filters } 
    }),
  
  getRecommendedProducts: () => apiCall(djangoClient.get, '/api/v1/marketplace/recommendations/'),
  
  // Reviews and ratings
  getProductReviews: (productId) => 
    apiCall(djangoClient.get, `/api/v1/marketplace/products/${productId}/reviews/`),
  
  createReview: (productId, data) => 
    apiCall(djangoClient.post, `/api/v1/marketplace/products/${productId}/reviews/`, data),
  
  // Add sub-role specific marketplace endpoints
  getRoleSpecificMarketplace: (subRole) => {
    const marketplaceEndpoints = {
      'INDIVIDUAL_CONSUMER': '/api/v1/marketplace/consumer/individual/',
      'RESTAURANT_BUSINESS': '/api/v1/marketplace/consumer/restaurant/',
      'INPUT_SUPPLIER': '/api/v1/marketplace/supplier/input/',
      'LOGISTICS_PROVIDER': '/api/v1/marketplace/supplier/logistics/',
      // Add more mappings as needed
    };
    
    const endpoint = marketplaceEndpoints[subRole];
    return endpoint ? apiCall(djangoClient.get, endpoint) : marketplaceAPI.getProducts();
  },
  
  // Enhanced product creation with sub-role context
  createProductWithSubRole: (data, subRole = null) => {
    const productData = { ...data };
    
    // Add sub-role specific metadata
    if (subRole) {
      productData.metadata = {
        ...productData.metadata,
        created_by_sub_role: subRole,
        timestamp: new Date().toISOString()
      };
    }
    
    // Use FormData for file uploads
    if (productData.images || productData.files) {
      const formData = new FormData();
      
      // Append all data to FormData
      Object.keys(productData).forEach(key => {
        if (key === 'images' || key === 'files') {
          // Handle multiple files
          productData[key].forEach(file => {
            formData.append(key, file);
          });
        } else {
          formData.append(key, productData[key]);
        }
      });
      
      return apiCall(
        djangoClient.post, 
        '/api/v1/marketplace/products/', 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        }
      );
    }
    
    return apiCall(djangoClient.post, '/api/v1/marketplace/products/', productData);
  },
};

// Farm management API
export const farmAPI = {
  getFarms: () => apiCall(djangoClient.get, '/api/v1/farms/'),
  getFarm: (id) => apiCall(djangoClient.get, `/api/v1/farms/${id}/`),
  createFarm: (data) => apiCall(djangoClient.post, '/api/v1/farms/', data),
  updateFarm: (id, data) => apiCall(djangoClient.patch, `/api/v1/farms/${id}/`, data),
  deleteFarm: (id) => apiCall(djangoClient.delete, `/api/v1/farms/${id}/`),
  
  // Farm operations
  getFarmOperations: (farmId) => apiCall(djangoClient.get, `/api/v1/farms/${farmId}/operations/`),
  createOperation: (farmId, data) => apiCall(djangoClient.post, `/api/v1/farms/${farmId}/operations/`, data),
  
  // Crops and livestock
  getCrops: (farmId) => apiCall(djangoClient.get, `/api/v1/farms/${farmId}/crops/`),
  getLivestock: (farmId) => apiCall(djangoClient.get, `/api/v1/farms/${farmId}/livestock/`),
};

// Messaging API
export const messagingAPI = {
  getConversations: () => apiCall(djangoClient.get, '/api/v1/messaging/conversations/'),
  getMessages: (conversationId) => apiCall(djangoClient.get, `/api/v1/messaging/conversations/${conversationId}/messages/`),
  sendMessage: (conversationId, data) => apiCall(djangoClient.post, `/api/v1/messaging/conversations/${conversationId}/messages/`, data),
  createConversation: (data) => apiCall(djangoClient.post, '/api/v1/messaging/conversations/', data),
  
  // Notifications
  getNotifications: () => apiCall(djangoClient.get, '/api/v1/messaging/notifications/'),
  markNotificationRead: (notificationId) => apiCall(djangoClient.patch, `/api/v1/messaging/notifications/${notificationId}/`, { read: true }),
};

// Tasks and scheduling API
export const tasksAPI = {
  getTasks: (params = {}) => apiCall(djangoClient.get, '/api/v1/tasks/', { params }),
  createTask: (data) => apiCall(djangoClient.post, '/api/v1/tasks/', data),
  updateTask: (id, data) => apiCall(djangoClient.patch, `/api/v1/tasks/${id}/`, data),
  deleteTask: (id) => apiCall(djangoClient.delete, `/api/v1/tasks/${id}/`),
  
  // Task categories and priorities
  getTaskCategories: () => apiCall(djangoClient.get, '/api/v1/tasks/categories/'),
  getTaskPriorities: () => apiCall(djangoClient.get, '/api/v1/tasks/priorities/'),
};

// Products API (extended marketplace functionality)
export const productsAPI = {
  getUserProducts: () => apiCall(djangoClient.get, '/api/v1/products/my-products/'),
  getProductAnalytics: (productId) => apiCall(djangoClient.get, `/api/v1/products/${productId}/analytics/`),
  updateProductStatus: (productId, status) => apiCall(djangoClient.patch, `/api/v1/products/${productId}/`, { status }),
};

// Cart API
export const cartAPI = {
  getCart: () => apiCall(djangoClient.get, '/api/v1/cart/'),
  addToCart: (data) => apiCall(djangoClient.post, '/api/v1/cart/items/', data),
  updateCartItem: (itemId, data) => apiCall(djangoClient.patch, `/api/v1/cart/items/${itemId}/`, data),
  removeFromCart: (itemId) => apiCall(djangoClient.delete, `/api/v1/cart/items/${itemId}/`),
  clearCart: () => apiCall(djangoClient.delete, '/api/v1/cart/clear/'),
  
  // Orders
  createOrder: (data) => apiCall(djangoClient.post, '/api/v1/orders/', data),
  getOrders: (params = {}) => apiCall(djangoClient.get, '/api/v1/orders/', { params }),
  getOrder: (orderId) => apiCall(djangoClient.get, `/api/v1/orders/${orderId}/`),
  cancelOrder: (orderId) => apiCall(djangoClient.patch, `/api/v1/orders/${orderId}/cancel/`),
};

// Enhanced utility functions
export const apiUtils = {
  // FormData creation utility
  createFormData: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (Array.isArray(data[key])) {
        data[key].forEach(item => {
          formData.append(key, item);
        });
      } else {
        formData.append(key, data[key]);
      }
    });
    return formData;
  },
  
  // Query parameter builder
  buildQueryParams: (params) => {
    const searchParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined) {
        searchParams.append(key, params[key]);
      }
    });
    return searchParams.toString();
  },
  
  // Response data extractor
  extractData: (response) => {
    return response.data;
  },
  
  // Error message formatter
  formatErrorMessage: (error) => {
    if (error.response?.data) {
      const data = error.response.data;
      if (typeof data === 'string') return data;
      if (data.message) return data.message;
      if (data.error) return data.error;
      if (data.details) return JSON.stringify(data.details);
    }
    return error.message || 'An unexpected error occurred';
  },
  
  // Dashboard-specific utilities
  getDashboardConfig: (subRole) => {
    const dashboardConfigs = {
      'SMALLHOLDER_FARMER': {
        refreshInterval: 30000, // 30 seconds
        features: ['today_priorities', 'active_crops', 'market_prices'],
        mobileOptimized: true
      },
      'COMMERCIAL_FARMER': {
        refreshInterval: 60000, // 1 minute
        features: ['enterprise_overview', 'supply_chain', 'business_intel'],
        multiMonitor: true
      },
      'ORGANIC_SPECIALIST': {
        refreshInterval: 45000,
        features: ['certification_status', 'premium_marketplace', 'quality_metrics'],
        mobileOptimized: true
      },
      'LIVESTOCK_FARMER': {
        refreshInterval: 30000,
        features: ['livestock_health', 'product_processing', 'vet_coordination'],
        mobileOptimized: true
      },
      'INDIVIDUAL_CONSUMER': {
        refreshInterval: 25000,
        features: ['personalized_shopping', 'quick_order', 'delivery_management'],
        mobileOptimized: true
      },
      'RESTAURANT_BUSINESS': {
        refreshInterval: 60000,
        features: ['supply_chain', 'inventory', 'menu_planning'],
        multiMonitor: true
      },
      'EXPORT_CLIENT': {
        refreshInterval: 45000,
        features: ['global_trade', 'compliance', 'market_intelligence'],
        realTime: true
      },
      'INSTITUTIONAL_BUYER': {
        refreshInterval: 60000,
        features: ['contract_management', 'budget_compliance', 'supplier_performance'],
        multiMonitor: true
      },
      'LOGISTICS_PROVIDER': {
        refreshInterval: 30000,
        features: ['fleet_management', 'route_optimization', 'delivery_tracking'],
        realTime: true
      },
      'INPUT_SUPPLIER': {
        refreshInterval: 45000,
        features: ['inventory_sales', 'product_management', 'market_position'],
        multiMonitor: true
      },
      'MACHINERY_PROVIDER': {
        refreshInterval: 60000,
        features: ['equipment_fleet', 'rental_operations', 'maintenance'],
        realTime: true
      },
      'SERVICE_PROVIDER': {
        refreshInterval: 30000,
        features: ['service_operations', 'booking_management', 'workforce'],
        realTime: true
      },
      'FINANCIAL_ADVISOR': {
        refreshInterval: 60000,
        features: ['portfolio_overview', 'loan_management', 'risk_assessment'],
        multiMonitor: true
      },
      'TECHNICAL_ADVISOR': {
        refreshInterval: 45000,
        features: ['active_cases', 'knowledge_base', 'impact_measurement'],
        mobileOptimized: true
      },
      'LEGAL_SPECIALIST': {
        refreshInterval: 60000,
        features: ['legal_cases', 'compliance_hub', 'document_management'],
        multiMonitor: true
      },
      'MARKET_ANALYST': {
        refreshInterval: 30000,
        features: ['market_intelligence', 'price_analysis', 'trends'],
        realTime: true
      },
      'PLATFORM_ADMIN': {
        refreshInterval: 15000, // 15 seconds
        features: ['system_health', 'user_management', 'error_tracking'],
        realTime: true
      },
      'BUSINESS_ADMIN': {
        refreshInterval: 60000,
        features: ['business_overview', 'financial_analytics', 'strategic_planning'],
        multiMonitor: true
      }
    };
    
    return dashboardConfigs[subRole] || {
      refreshInterval: 30000,
      features: ['basic_stats'],
      mobileOptimized: false
    };
  },
  
  // Helper to determine which API module to use based on sub-role
  getAPIForSubRole: (subRole) => {
    if (subRole?.includes('FARMER')) return farmerAPI;
    if (subRole?.includes('CONSUMER')) return consumerAPI;
    if (subRole?.includes('SUPPLIER')) return supplierAPI;
    if (subRole?.includes('ADVISOR') || subRole?.includes('SPECIALIST') || subRole?.includes('ANALYST')) return agentAPI;
    if (subRole?.includes('ADMIN')) return adminAPI;
    return null;
  },
  
  // Cache management for dashboard data
  createDashboardCache: (subRole) => {
    const cache = new Map();
    const config = apiUtils.getDashboardConfig(subRole);
    
    return {
      set: (key, data) => {
        cache.set(key, {
          data,
          timestamp: Date.now(),
          ttl: config.refreshInterval
        });
      },
      
      get: (key) => {
        const item = cache.get(key);
        if (!item) return null;
        
        if (Date.now() - item.timestamp > item.ttl) {
          cache.delete(key);
          return null;
        }
        
        return item.data;
      },
      
      clear: () => cache.clear(),
      
      getStale: (key) => {
        const item = cache.get(key);
        return item ? item.data : null;
      },
      
      size: () => cache.size,
      
      keys: () => Array.from(cache.keys())
    };
  }
};

// NEW: Dashboard data fetcher with caching
export const createDashboardFetcher = (subRole) => {
  const cache = apiUtils.createDashboardCache(subRole);
  const apiModule = apiUtils.getAPIForSubRole(subRole);
  
  return {
    fetch: async (endpoint, forceRefresh = false) => {
      const cacheKey = `${subRole}:${endpoint}`;
      
      // Return cached data if available and not forcing refresh
      if (!forceRefresh) {
        const cached = cache.get(cacheKey);
        if (cached) {
          console.log(`📊 Using cached data for ${cacheKey}`);
          return { success: true, data: cached, fromCache: true };
        }
      }
      
      try {
        // Fetch fresh data
        let result;
        if (apiModule && apiModule[endpoint]) {
          result = await apiModule[endpoint]();
        } else {
          // Fallback to generic dashboard API
          result = await dashboardAPI.getDashboardBySubRole(subRole);
        }
        
        if (result.success) {
          cache.set(cacheKey, result.data);
        }
        
        return result;
      } catch (error) {
        // Return stale data if available
        const staleData = cache.getStale(cacheKey);
        if (staleData) {
          console.warn(`⚠️ Using stale data for ${cacheKey} due to error:`, error);
          return { success: true, data: staleData, fromCache: true };
        }
        
        return handleApiError(error, 'Unable to fetch dashboard data');
      }
    },
    
    prefetch: (endpoints) => {
      endpoints.forEach(endpoint => {
        const cacheKey = `${subRole}:${endpoint}`;
        if (!cache.get(cacheKey)) {
          // Trigger background fetch
          createDashboardFetcher(subRole).fetch(endpoint)
            .then(result => {
              if (result.success) {
                console.log(`✅ Prefetched ${cacheKey}`);
              }
            })
            .catch(error => {
              console.error(`❌ Prefetch failed for ${cacheKey}:`, error);
            });
        }
      });
    },
    
    clearCache: () => cache.clear(),
    
    getCacheInfo: () => ({
      size: cache.size(),
      keys: cache.keys(),
      subRole,
      config: apiUtils.getDashboardConfig(subRole)
    })
  };
};

// Export all APIs and utilities
export default {
  // Core APIs
  userAPI,
  farmAPI,
  marketplaceAPI,
  messagingAPI,
  tasksAPI,
  productsAPI,
  cartAPI,
  
  // Dashboard APIs
  dashboardAPI,
  newDashboardAPI, // NEW: For future migration
  farmerAPI,
  consumerAPI,
  supplierAPI,
  agentAPI,
  adminAPI,
  
  // Utilities
  apiUtils,
  apiCall,
  createDashboardFetcher,
  handleApiError,
};