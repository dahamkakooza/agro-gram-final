import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './UI/LoadingSpinner';

// Import all dashboard components
import SmallholderFarmerDashboard from './dashboards/SmallholderFarmerDashboard';
import CommercialFarmerDashboard from './dashboards/CommercialFarmerDashboard';
import OrganicSpecialistDashboard from './dashboards/OrganicSpecialistDashboard';
import LivestockFarmerDashboard from './dashboards/LivestockFarmerDashboard';

import IndividualConsumerDashboard from './dashboards/IndividualConsumerDashboard';
import RestaurantBusinessDashboard from './dashboards/RestaurantBusinessDashboard';
import ExportClientDashboard from './dashboards/ExportClientDashboard';
import InstitutionalBuyerDashboard from './dashboards/InstitutionalBuyerDashboard';

import FinancialAdvisorDashboard from './dashboards/FinancialAdvisorDashboard';
import TechnicalAdvisorDashboard from './dashboards/TechnicalAdvisorDashboard';
import LegalSpecialistDashboard from './dashboards/LegalSpecialistDashboard';
import MarketAnalystDashboard from './dashboards/MarketAnalystDashboard';

const DashboardRouter = () => {
  const { user, userProfile, loading, profileLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('🔄 DashboardRouter Debug:', {
      loading,
      profileLoading,
      user: user ? `Yes (${user.email})` : 'No',
      userProfile: userProfile ? `Yes (${userProfile.sub_role})` : 'No'
    });
  }, [user, userProfile, loading, profileLoading]);

  // Show loading only if we're still checking auth AND don't have user data
  if (loading && !user) {
    console.log('⏳ DashboardRouter - Initial auth loading...');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" />
        <p className="ml-4">Checking authentication...</p>
      </div>
    );
  }

  // Show profile loading if we have user but no profile
  if (profileLoading && user && !userProfile) {
    console.log('⏳ DashboardRouter - Profile loading...');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" />
        <p className="ml-4">Loading your dashboard...</p>
      </div>
    );
  }

  // If no user after loading, redirect to login
  if (!loading && !user) {
    console.log('❌ DashboardRouter - No user, should redirect to login');
    useEffect(() => {
      navigate('/login');
    }, [navigate]);
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" />
        <p className="ml-4">Redirecting to login...</p>
      </div>
    );
  }

  // If we have user but no profile after loading, show error
  if (!profileLoading && user && !userProfile) {
    console.log('❌ DashboardRouter - User exists but no profile');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8 bg-red-50 rounded-lg">
          <h2 className="text-xl font-semibold text-red-800 mb-4">Profile Error</h2>
          <p className="text-red-600 mb-4">Unable to load your profile. Please try refreshing the page.</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  // If we have both user and profile, render the dashboard
  if (user && userProfile) {
    console.log('📍 DashboardRouter - Rendering dashboard for:', userProfile.sub_role);

    const renderDashboard = () => {
      // Farmer Dashboards
      if (userProfile.role === 'FARMER') {
        switch (userProfile.sub_role) {
          case 'SMALLHOLDER_FARMER':
            console.log('➡️ Routing to SmallholderFarmerDashboard');
            return <SmallholderFarmerDashboard />;
          case 'COMMERCIAL_FARMER':
            console.log('➡️ Routing to CommercialFarmerDashboard');
            return <CommercialFarmerDashboard />;
          case 'ORGANIC_SPECIALIST':
            console.log('➡️ Routing to OrganicSpecialistDashboard');
            return <OrganicSpecialistDashboard />;
          case 'LIVESTOCK_FARMER':
            console.log('➡️ Routing to LivestockFarmerDashboard');
            return <LivestockFarmerDashboard />;
          default:
            console.log('➡️ Routing to DEFAULT SmallholderFarmerDashboard');
            return <SmallholderFarmerDashboard />;
        }
      }

      // Consumer Dashboards
      if (userProfile.role === 'CONSUMER') {
        switch (userProfile.sub_role) {
          case 'INDIVIDUAL_CONSUMER':
            console.log('➡️ Routing to IndividualConsumerDashboard');
            return <IndividualConsumerDashboard />;
          case 'RESTAURANT_BUSINESS':
            console.log('➡️ Routing to RestaurantBusinessDashboard');
            return <RestaurantBusinessDashboard />;
          case 'EXPORT_CLIENT':
            console.log('➡️ Routing to ExportClientDashboard');
            return <ExportClientDashboard />;
          case 'INSTITUTIONAL_BUYER':
            console.log('➡️ Routing to InstitutionalBuyerDashboard');
            return <InstitutionalBuyerDashboard />;
          default:
            console.log('➡️ Routing to DEFAULT IndividualConsumerDashboard');
            return <IndividualConsumerDashboard />;
        }
      }

      // Agent Dashboards
      if (userProfile.role === 'AGENT') {
        switch (userProfile.sub_role) {
          case 'FINANCIAL_ADVISOR':
            console.log('➡️ Routing to FinancialAdvisorDashboard');
            return <FinancialAdvisorDashboard />;
          case 'TECHNICAL_ADVISOR':
            console.log('➡️ Routing to TechnicalAdvisorDashboard');
            return <TechnicalAdvisorDashboard />;
          case 'LEGAL_SPECIALIST':
            console.log('➡️ Routing to LegalSpecialistDashboard');
            return <LegalSpecialistDashboard />;
          case 'MARKET_ANALYST':
            console.log('➡️ Routing to MarketAnalystDashboard');
            return <MarketAnalystDashboard />;
          default:
            console.log('➡️ Routing to DEFAULT FinancialAdvisorDashboard');
            return <FinancialAdvisorDashboard />;
        }
      }

      // Admin Dashboards
      if (userProfile.role === 'ADMIN') {
        switch (userProfile.sub_role) {
          case 'PLATFORM_ADMIN':
          case 'BUSINESS_ADMIN':
          default:
            console.log('➡️ Routing to Admin Dashboard');
            return (
              <div className="p-8">
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p>Welcome, {userProfile.first_name}! (Admin: {userProfile.sub_role})</p>
                <div className="mt-4 p-4 bg-blue-50 rounded">
                  <p>Admin features coming soon...</p>
                </div>
              </div>
            );
        }
      }

      // Supplier Dashboards
      if (userProfile.role === 'SUPPLIER') {
        switch (userProfile.sub_role) {
          case 'LOGISTICS_PROVIDER':
          case 'INPUT_SUPPLIER':
          case 'MACHINERY_PROVIDER':
          case 'SERVICE_PROVIDER':
          default:
            console.log('➡️ Routing to Supplier Dashboard');
            return (
              <div className="p-8">
                <h1 className="text-2xl font-bold">Supplier Dashboard</h1>
                <p>Welcome, {userProfile.first_name}! (Supplier: {userProfile.sub_role})</p>
                <div className="mt-4 p-4 bg-green-50 rounded">
                  <p>Supplier features coming soon...</p>
                </div>
              </div>
            );
        }
      }

      console.log('➡️ Routing to fallback dashboard for role:', userProfile.role);
      return (
        <div className="p-8">
          <h1 className="text-2xl font-bold">Welcome to Agro-Gram</h1>
          <p>Dashboard for {userProfile.sub_role} is coming soon!</p>
          <div className="mt-4 p-4 bg-yellow-100 border border-yellow-400 rounded">
            <p><strong>Debug Info:</strong></p>
            <p>Role: {userProfile.role}</p>
            <p>Sub-role: {userProfile.sub_role}</p>
            <p>Email: {userProfile.email}</p>
            <p>Name: {userProfile.first_name} {userProfile.last_name}</p>
          </div>
        </div>
      );
    };

    return (
      <div className="dashboard-container">
        {renderDashboard()}
      </div>
    );
  }

  // Final fallback - should never reach here
  console.log('❌ DashboardRouter - Unexpected state');
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-4">Unexpected Error</h2>
        <p>Please refresh the page or contact support.</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Refresh Page
        </button>
      </div>
    </div>
  );
};

// Add this to your DashboardRouter component
const { refreshProfile } = useAuth();

// Add a refresh button in the error state
<button 
  onClick={() => refreshProfile(true)}
  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
>
  Refresh Profile
</button>
export default DashboardRouter;