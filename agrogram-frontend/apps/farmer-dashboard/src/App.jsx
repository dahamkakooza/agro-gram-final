import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/Layout/Layout';
import LoadingSpinner from './components/UI/LoadingSpinner';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import all dashboard components
import SmallholderFarmerDashboard from './components/dashboards/SmallholderFarmerDashboard';
import CommercialFarmerDashboard from './components/dashboards/CommercialFarmerDashboard';
import OrganicSpecialistDashboard from './components/dashboards/OrganicSpecialistDashboard';
import LivestockFarmerDashboard from './components/dashboards/LivestockFarmerDashboard';
import IndividualConsumerDashboard from './components/dashboards/IndividualConsumerDashboard';
import RestaurantBusinessDashboard from './components/dashboards/RestaurantBusinessDashboard';
import ExportClientDashboard from './components/dashboards/ExportClientDashboard';
import InstitutionalBuyerDashboard from './components/dashboards/InstitutionalBuyerDashboard';
import FinancialAdvisorDashboard from './components/dashboards/FinancialAdvisorDashboard';
import TechnicalAdvisorDashboard from './components/dashboards/TechnicalAdvisorDashboard';
import LegalSpecialistDashboard from './components/dashboards/LegalSpecialistDashboard';
import MarketAnalystDashboard from './components/dashboards/MarketAnalystDashboard';
import InputSupplierDashboard from './components/dashboards/InputSupplierDashboard';
import MachineryProviderDashboard from './components/dashboards/MachineryProviderDashboard';
import LogisticsProviderDashboard from './components/dashboards/LogisticsProviderDashboard';
import ServiceProviderDashboard from './components/dashboards/ServiceProviderDashboard';
import PlatformAdminDashboard from './components/dashboards/PlatformAdminDashboard';
import BusinessAdminDashboard from './components/dashboards/BusinessAdminDashboard';

// Import pages with React.lazy for code splitting
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const Marketplace = React.lazy(() => import('./pages/Marketplace'));
const Farms = React.lazy(() => import('./pages/Farms'));
const FarmDetail = React.lazy(() => import('./pages/FarmDetail'));
const Recommendations = React.lazy(() => import('./pages/Recommendations'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Cart = React.lazy(() => import('./pages/Cart'));
const Checkout = React.lazy(() => import('./pages/Checkout'));
const Messages = React.lazy(() => import('./pages/Messages'));
const Orders = React.lazy(() => import('./pages/Orders'));

// SubRoleBasedDashboard Component - Handles routing to specific dashboards
function SubRoleBasedDashboard() {
  const { userProfile, profileLoading, refreshProfile } = useAuth();
  
  console.log('🔍 SubRoleBasedDashboard - User profile:', userProfile);
  
  // Force refresh profile on mount to ensure we have latest data
  React.useEffect(() => {
    if (userProfile) {
      console.log('🔄 Force refreshing profile data');
      refreshProfile();
    }
  }, []);

  if (profileLoading || !userProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" />
        <p className="ml-4">Loading your dashboard...</p>
      </div>
    );
  }
  
  const { sub_role, role, first_name, email } = userProfile;
  
  console.log('📍 Routing to dashboard for:', { sub_role, role, email });

  const getDashboardComponent = () => {
    try {
      console.log(`🎯 Checking dashboard for role: ${role}, sub-role: ${sub_role}`);

      // Map ALL available dashboards by role + sub_role combination
      const dashboardMap = {
        // FARMER Dashboards
        'FARMER_SMALLHOLDER_FARMER': SmallholderFarmerDashboard,
        'FARMER_COMMERCIAL_FARMER': CommercialFarmerDashboard,
        'FARMER_ORGANIC_SPECIALIST': OrganicSpecialistDashboard,
        'FARMER_LIVESTOCK_FARMER': LivestockFarmerDashboard,
        
        // CONSUMER Dashboards  
        'CONSUMER_INDIVIDUAL_CONSUMER': IndividualConsumerDashboard,
        'CONSUMER_RESTAURANT_BUSINESS': RestaurantBusinessDashboard,
        'CONSUMER_EXPORT_CLIENT': ExportClientDashboard,
        'CONSUMER_INSTITUTIONAL_BUYER': InstitutionalBuyerDashboard,
        
        // AGENT Dashboards
        'AGENT_FINANCIAL_ADVISOR': FinancialAdvisorDashboard,
        'AGENT_TECHNICAL_ADVISOR': TechnicalAdvisorDashboard,
        'AGENT_LEGAL_SPECIALIST': LegalSpecialistDashboard,
        'AGENT_MARKET_ANALYST': MarketAnalystDashboard,
        
        // SUPPLIER Dashboards
        'SUPPLIER_INPUT_SUPPLIER': InputSupplierDashboard,
        'SUPPLIER_EQUIPMENT_SUPPLIER': MachineryProviderDashboard,
        'SUPPLIER_SEED_SUPPLIER': InputSupplierDashboard,
        'SUPPLIER_FERTILIZER_SUPPLIER': InputSupplierDashboard,
        'SUPPLIER_SMALLHOLDER_FARMER': InputSupplierDashboard,
        'SUPPLIER_LOGISTICS_PROVIDER': LogisticsProviderDashboard,
        'SUPPLIER_MACHINERY_PROVIDER': MachineryProviderDashboard,
        'SUPPLIER_SERVICE_PROVIDER': ServiceProviderDashboard,
        
        // ADMIN Dashboards
        'ADMIN_PLATFORM_ADMIN': PlatformAdminDashboard,
        'ADMIN_BUSINESS_ADMIN': BusinessAdminDashboard,
        'ADMIN_ADMIN': PlatformAdminDashboard
      };

      const dashboardKey = `${role}_${sub_role}`;
      console.log(`🔑 Looking for dashboard with key: ${dashboardKey}`);

      const DashboardComponent = dashboardMap[dashboardKey];

      if (DashboardComponent) {
        console.log(`✅ Found specific dashboard: ${dashboardKey}`);
        return <DashboardComponent />;
      }

      // If no exact match, try to find the closest match
      console.log(`❌ No exact dashboard match for ${dashboardKey}, trying fallback strategies...`);

      // Strategy 1: Try role-based default dashboards
      const roleDefaultDashboards = {
        'FARMER': SmallholderFarmerDashboard,
        'CONSUMER': IndividualConsumerDashboard,
        'SUPPLIER': InputSupplierDashboard,
        'AGENT': FinancialAdvisorDashboard,
        'ADMIN': PlatformAdminDashboard
      };

      const RoleDefaultComponent = roleDefaultDashboards[role];
      if (RoleDefaultComponent) {
        console.log(`🔄 Using role default dashboard for: ${role}`);
        return <RoleDefaultComponent />;
      }

      // Final fallback - should never reach here if all roles are covered
      console.error(`🚨 No dashboard found for role: ${role}, sub-role: ${sub_role}`);
      return (
        <div className="p-8">
          <h1 className="text-2xl font-bold text-red-600">Dashboard Configuration Error</h1>
          <div className="mt-4 p-4 bg-red-50 rounded">
            <p>No dashboard configured for: <strong>{role} - {sub_role}</strong></p>
            <p>Please contact support to configure your dashboard.</p>
            <p className="mt-2 text-sm">User: {email}</p>
          </div>
        </div>
      );
      
    } catch (error) {
      console.error(`❌ Error loading dashboard for ${role}/${sub_role}:`, error);
      return (
        <div className="p-8">
          <h1 className="text-2xl font-bold text-red-600">Dashboard Error</h1>
          <div className="mt-4 p-4 bg-red-50 rounded">
            <p>Error loading dashboard: {error.message}</p>
            <p>Role: <strong>{role}</strong>, Sub-role: <strong>{sub_role}</strong></p>
          </div>
        </div>
      );
    }
  };

  return getDashboardComponent();
}

// Main App Component
function App() {
  const { user, loading, userProfile } = useAuth();

  console.log('🚀 App.jsx - Auth State:', { 
    loading, 
    user: user ? `Yes (${user.email})` : 'No',
    userProfile: userProfile ? `Yes (${userProfile.role} - ${userProfile.sub_role})` : 'No',
    timestamp: new Date().toISOString()
  });

  // Enhanced loading states to prevent premature dashboard rendering
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <LoadingSpinner size="large" />
        <p className="mt-4 text-lg text-gray-600">Loading Agro-Gram...</p>
        <p className="text-sm text-gray-500">Please wait while we authenticate your session</p>
      </div>
    );
  }

  // More specific check for user profile loading
  if (user && !userProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <LoadingSpinner size="large" />
        <p className="mt-4 text-lg text-gray-600">Loading your profile...</p>
        <p className="text-sm text-gray-500">Setting up your personalized dashboard</p>
      </div>
    );
  }

  return (
    <CartProvider>
      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      
      <React.Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner />
        </div>
      }>
        <Routes>
          {/* Public Routes - Accessible without authentication */}
          {!user && (
            <>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </>
          )}

          {/* Protected Routes - Require authentication */}
          {user && userProfile && (
            <>
              {/* Main Layout Route with Navigation */}
              <Route path="/" element={<Layout userProfile={userProfile} user={user} />}>
                {/* Default Dashboard - Automatically routes based on role + sub-role */}
                <Route index element={<SubRoleBasedDashboard />} />
                
                {/* Common Features */}
                <Route path="marketplace" element={<Marketplace />} />
                <Route path="profile" element={<Profile />} />
                <Route path="messages" element={<Messages />} />
                <Route path="orders" element={<Orders />} />
                
                {/* Farmer-specific Features */}
                <Route 
                  path="farms" 
                  element={
                    <ProtectedRoute requiredRole="FARMER">
                      <Farms />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="farms/:id" 
                  element={
                    <ProtectedRoute requiredRole="FARMER">
                      <FarmDetail />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="recommendations" 
                  element={
                    <ProtectedRoute requiredRoles={['FARMER', 'AGENT', 'ADMIN']}>
                      <Recommendations />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Consumer-specific Features */}
                <Route 
                  path="cart" 
                  element={
                    <ProtectedRoute requiredRole="CONSUMER">
                      <Cart />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="checkout" 
                  element={
                    <ProtectedRoute requiredRole="CONSUMER">
                      <Checkout />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Direct Dashboard Routes - For specific navigation */}
                <Route path="dashboard" element={<SubRoleBasedDashboard />} />
                <Route path="farmer-dashboard" element={<SubRoleBasedDashboard />} />
                <Route path="consumer-dashboard" element={<SubRoleBasedDashboard />} />
                <Route path="supplier-dashboard" element={<SubRoleBasedDashboard />} />
                <Route path="agent-dashboard" element={<SubRoleBasedDashboard />} />
                <Route path="admin-dashboard" element={<SubRoleBasedDashboard />} />
              </Route>

              {/* Specific Dashboard Routes - For direct links */}
              <Route 
                path="/dashboard/farmer/smallholder" 
                element={
                  <ProtectedRoute requiredSubRole="SMALLHOLDER_FARMER">
                    <SmallholderFarmerDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/farmer/commercial" 
                element={
                  <ProtectedRoute requiredSubRole="COMMERCIAL_FARMER">
                    <CommercialFarmerDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/farmer/organic" 
                element={
                  <ProtectedRoute requiredSubRole="ORGANIC_SPECIALIST">
                    <OrganicSpecialistDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/farmer/livestock" 
                element={
                  <ProtectedRoute requiredSubRole="LIVESTOCK_FARMER">
                    <LivestockFarmerDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/consumer/individual" 
                element={
                  <ProtectedRoute requiredSubRole="INDIVIDUAL_CONSUMER">
                    <IndividualConsumerDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/consumer/restaurant" 
                element={
                  <ProtectedRoute requiredSubRole="RESTAURANT_BUSINESS">
                    <RestaurantBusinessDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/consumer/export" 
                element={
                  <ProtectedRoute requiredSubRole="EXPORT_CLIENT">
                    <ExportClientDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/consumer/institutional" 
                element={
                  <ProtectedRoute requiredSubRole="INSTITUTIONAL_BUYER">
                    <InstitutionalBuyerDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/agent/financial" 
                element={
                  <ProtectedRoute requiredSubRole="FINANCIAL_ADVISOR">
                    <FinancialAdvisorDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/agent/technical" 
                element={
                  <ProtectedRoute requiredSubRole="TECHNICAL_ADVISOR">
                    <TechnicalAdvisorDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/agent/legal" 
                element={
                  <ProtectedRoute requiredSubRole="LEGAL_SPECIALIST">
                    <LegalSpecialistDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/agent/market" 
                element={
                  <ProtectedRoute requiredSubRole="MARKET_ANALYST">
                    <MarketAnalystDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/supplier/input" 
                element={
                  <ProtectedRoute requiredSubRole="INPUT_SUPPLIER">
                    <InputSupplierDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/supplier/machinery" 
                element={
                  <ProtectedRoute requiredSubRole="MACHINERY_PROVIDER">
                    <MachineryProviderDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/supplier/logistics" 
                element={
                  <ProtectedRoute requiredSubRole="LOGISTICS_PROVIDER">
                    <LogisticsProviderDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/supplier/service" 
                element={
                  <ProtectedRoute requiredSubRole="SERVICE_PROVIDER">
                    <ServiceProviderDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/admin/platform" 
                element={
                  <ProtectedRoute requiredSubRole="PLATFORM_ADMIN">
                    <PlatformAdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/admin/business" 
                element={
                  <ProtectedRoute requiredSubRole="BUSINESS_ADMIN">
                    <BusinessAdminDashboard />
                  </ProtectedRoute>
                } 
              />

              {/* Catch-all route for authenticated users */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          )}

          {/* Edge case: User exists but profile is still loading */}
          {user && !userProfile && (
            <Route path="*" element={
              <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
                <LoadingSpinner size="large" />
                <p className="mt-4 text-lg text-gray-600">Finalizing your dashboard...</p>
                <p className="text-sm text-gray-500">Almost ready!</p>
              </div>
            } />
          )}
        </Routes>
      </React.Suspense>
    </CartProvider>
  );
}

export default App;