// src/services/dashboardService.js
import { apiService } from './api';

/**
 * Dashboard endpoints mapping
 */
export const DASHBOARD_ENDPOINTS = {
  // Farmer dashboards
  SMALLHOLDER_FARMER: 'farmer/smallholder',
  COMMERCIAL_FARMER: 'farmer/commercial',
  ORGANIC_SPECIALIST: 'farmer/organic',
  LIVESTOCK_FARMER: 'farmer/livestock',
  
  // Consumer dashboards
  INDIVIDUAL_CONSUMER: 'consumer/individual',
  RESTAURANT_BUSINESS: 'consumer/restaurant',
  EXPORT_CLIENT: 'consumer/export',
  INSTITUTIONAL_BUYER: 'consumer/institutional',
  
  // Supplier dashboards
  LOGISTICS_PROVIDER: 'supplier/logistics',
  INPUT_SUPPLIER: 'supplier/input',
  MACHINERY_PROVIDER: 'supplier/machinery',
  SERVICE_PROVIDER: 'supplier/service',
  
  // Agent dashboards
  FINANCIAL_ADVISOR: 'agent/financial',
  TECHNICAL_ADVISOR: 'agent/technical',
  LEGAL_SPECIALIST: 'agent/legal',
  MARKET_ANALYST: 'agent/market',
  
  // Admin dashboards
  PLATFORM_ADMIN: 'admin/platform',
  BUSINESS_ADMIN: 'admin/business',
};

/**
 * Dashboard service for handling all dashboard-related API calls
 */
class DashboardService {
  /**
   * Get specific dashboard by type
   */
  async getDashboard(dashboardType) {
    const endpoint = DASHBOARD_ENDPOINTS[dashboardType];
    
    if (!endpoint) {
      throw new Error(`Unknown dashboard type: ${dashboardType}`);
    }
    
    return apiService.get(`/dashboard/${endpoint}/`);
  }

  /**
   * Get the appropriate dashboard based on user role and subrole
   */
  async getCurrentUserDashboard(userRole, userSubRole) {
    const dashboardMap = {
      FARMER: {
        SMALLHOLDER_FARMER: 'SMALLHOLDER_FARMER',
        COMMERCIAL_FARMER: 'COMMERCIAL_FARMER',
        ORGANIC_SPECIALIST: 'ORGANIC_SPECIALIST',
        LIVESTOCK_FARMER: 'LIVESTOCK_FARMER',
      },
      CONSUMER: {
        INDIVIDUAL_CONSUMER: 'INDIVIDUAL_CONSUMER',
        RESTAURANT_BUSINESS: 'RESTAURANT_BUSINESS',
        EXPORT_CLIENT: 'EXPORT_CLIENT',
        INSTITUTIONAL_BUYER: 'INSTITUTIONAL_BUYER',
      },
      SUPPLIER: {
        LOGISTICS_PROVIDER: 'LOGISTICS_PROVIDER',
        INPUT_SUPPLIER: 'INPUT_SUPPLIER',
        MACHINERY_PROVIDER: 'MACHINERY_PROVIDER',
        SERVICE_PROVIDER: 'SERVICE_PROVIDER',
      },
      AGENT: {
        FINANCIAL_ADVISOR: 'FINANCIAL_ADVISOR',
        TECHNICAL_ADVISOR: 'TECHNICAL_ADVISOR',
        LEGAL_SPECIALIST: 'LEGAL_SPECIALIST',
        MARKET_ANALYST: 'MARKET_ANALYST',
      },
      ADMIN: {
        PLATFORM_ADMIN: 'PLATFORM_ADMIN',
        BUSINESS_ADMIN: 'BUSINESS_ADMIN',
      }
    };

    const roleDashboards = dashboardMap[userRole];
    if (!roleDashboards) {
      throw new Error(`Unsupported user role: ${userRole}`);
    }

    const dashboardType = roleDashboards[userSubRole];
    if (!dashboardType) {
      throw new Error(`Unsupported sub-role: ${userSubRole} for role: ${userRole}`);
    }

    return this.getDashboard(dashboardType);
  }

  /**
   * Get dashboard for currently authenticated user
   */
  async getMyDashboard() {
    try {
      // First get user profile to determine role
      const userProfile = await apiService.get('/users/profile/');
      
      if (userProfile.success && userProfile.data) {
        const { role, sub_role } = userProfile.data;
        return this.getCurrentUserDashboard(role, sub_role);
      } else {
        throw new Error('Failed to get user profile');
      }
    } catch (error) {
      console.error('Error getting user dashboard:', error);
      throw error;
    }
  }

  /**
   * Get mock data for development/fallback
   */
  getMockDashboard(dashboardType) {
    const mockData = {
      SMALLHOLDER_FARMER: {
        dashboard_type: "smallholder_farmer",
        welcome_message: "Welcome, Farmer!",
        today_priorities: [
          { task: "Water tomato plants", priority: "high", time: "Morning" },
          { task: "Check soil moisture", priority: "medium", time: "Afternoon" }
        ],
        stats: { total_farms: 1, active_crops_count: 3, pending_tasks: 2, revenue_this_month: 0 }
      },
      EXPORT_CLIENT: {
        dashboard_type: "export_client",
        welcome_message: "Welcome, Export Partner!",
        global_trade: { destinations: ["EU", "USA"], shipping_logistics: 4, trade_finance: "secured" },
        stats: { active_contracts: 5, export_volume: 25000, international_markets: 3, compliance_score: 98.5 }
      }
      // Add more mock data as needed
    };

    return {
      success: true,
      data: mockData[dashboardType] || {
        dashboard_type: dashboardType.toLowerCase(),
        welcome_message: `Welcome to ${dashboardType.replace('_', ' ')} Dashboard!`,
        message: "Using mock data - API unavailable"
      }
    };
  }
}

// Create a singleton instance
export const dashboardService = new DashboardService();
export default dashboardService;