// src/components/dashboards/farmer/LivestockFarmerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from "../../contexts/AuthContext.jsx";
import { Card, Button, LoadingSpinner, HealthMonitor, OfflineSupport } from '@agro-gram/ui';
import { useDashboardHandlers } from '../../hooks/useDashboardHandlers';
import UserDirectory from '../../common/UserDirectory';
import UserProfileModal from '../../common/UserProfileModal';
import { fetchMockDashboardData } from '../../data/mockDashboardData';
import ServiceRequestForm from '../../forms/ServiceRequestForm';
import './LivestockFarmerDashboard.css';

const LivestockFarmerDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUserDirectory, setShowUserDirectory] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [serviceRequest, setServiceRequest] = useState(null);

  // const fetchDashboardData = async () => {
  //   try {
  //     const response = await fetch('/api/dashboard/farmer/livestock/');
  //     const data = await response.json();
  //     if (data.success) setDashboardData(data.data);
  //   } catch (error) {
  //     console.error('Error:', error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Try real API first, fallback to mock data
      const response = await fetch('/api/dashboard/farmer/livestock/');
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setDashboardData(data.data);
          return;
        }
      }
      
      // Fallback to mock data
      console.log('Using mock data for development');
      const mockResponse = await fetchMockDashboardData('LIVESTOCK_FARMER');
      if (mockResponse.success) {
        setDashboardData(mockResponse.data);
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      
      // Fallback to mock data on error
      console.log('Falling back to mock data due to error');
      const mockResponse = await fetchMockDashboardData('LIVESTOCK_FARMER');
      if (mockResponse.success) {
        setDashboardData(mockResponse.data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboardData(); }, []);

  const {
    handleHealthCheck,
    handleVetCall,
    handleFeedSchedule,
    handleRecordData,
    handleRefresh,
    handleNavigate,
  } = useDashboardHandlers(dashboardData, fetchDashboardData, setDashboardData, setLoading);

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setShowProfileModal(true);
  };

  const handleMessageUser = (user) => {
    console.log('Message user:', user);
  };

  const handleServiceRequest = (user, serviceType, formType) => {
    setServiceRequest({ user, serviceType, formType });
    setShowServiceForm(true);
    setShowProfileModal(false);
  };

  if (loading) return <LoadingSpinner size="large" />;

  return (
    <div className="livestock-farmer-dashboard">
      <div className="dashboard-header">
        <h1>🐄 Livestock Farmer Dashboard</h1>
        <Button size="small" onClick={handleRefresh}>Refresh</Button>
      </div>

      <div className="dashboard-grid">
        {/* Health Monitoring */}
        <Card className="health-card">
          <div className="card-header">
            <h3>❤️ Livestock Health Dashboard</h3>
            <Button size="small" onClick={() => handleHealthCheck()}>Report Issue</Button>
          </div>
          <HealthMonitor 
            animals={dashboardData?.livestock_health || []}
            onHealthAlert={(animal) => console.log('Health alert:', animal)}
          />
          <div className="health-metrics">
            <div className="health-metric">
              <div className="metric-value">{dashboardData?.health_stats?.healthy || 0}</div>
              <div className="metric-label">Healthy</div>
            </div>
            <div className="health-metric">
              <div className="metric-value">{dashboardData?.health_stats?.sick || 0}</div>
              <div className="metric-label">Sick</div>
            </div>
            <div className="health-metric">
              <div className="metric-value">{dashboardData?.health_stats?.pregnant || 0}</div>
              <div className="metric-label">Pregnant</div>
            </div>
          </div>
        </Card>

        {/* Professional Network */}
        <Card className="network-card">
          <div className="card-header">
            <h3>🌐 Livestock Network</h3>
            <Button 
              size="small"
              onClick={() => setShowUserDirectory(true)}
            >
              Find Partners
            </Button>
          </div>
          <div className="network-preview">
            <p>Connect with veterinarians and livestock buyers</p>
            <div className="quick-stats">
              <span>🐄 45+ Farmers</span>
              <span>🥼 23+ Vets</span>
              <span>🤝 34+ Partners</span>
            </div>
          </div>
        </Card>

        {/* Barn Quick Actions */}
        <Card className="barn-actions-card">
          <h3>⚡ Barn Quick Actions</h3>
          <div className="barn-actions-grid">
            <Button size="large" fullWidth onClick={handleFeedSchedule}>🍽️ Feed Schedule</Button>
            <Button size="large" fullWidth onClick={() => handleHealthCheck()}>💉 Health Check</Button>
            <Button size="large" fullWidth onClick={() => handleVetCall()}>🥼 Vet Call</Button>
            <Button size="large" fullWidth onClick={handleRecordData}>📊 Record Data</Button>
          </div>
        </Card>

        {/* Breeding & Production */}
        <Card className="breeding-card">
          <div className="card-header">
            <h3>🐣 Breeding & Production</h3>
          </div>
          <div className="production-metrics">
            <div className="production-metric">
              <div className="metric-value">{dashboardData?.production_stats?.births_today || 0}</div>
              <div className="metric-label">Births Today</div>
            </div>
            <div className="production-metric">
              <div className="metric-value">{dashboardData?.production_stats?.milk_production || 0}L</div>
              <div className="metric-label">Milk Production</div>
            </div>
            <div className="production-metric">
              <div className="metric-value">{dashboardData?.production_stats?.eggs_collected || 0}</div>
              <div className="metric-label">Eggs Collected</div>
            </div>
          </div>
        </Card>

        {/* Feed & Nutrition */}
        <Card className="feed-card">
          <div className="card-header">
            <h3>🌾 Feed & Nutrition</h3>
          </div>
          <div className="feed-inventory">
            <h4>Feed Inventory</h4>
            {dashboardData?.feed_inventory?.map(feed => (
              <div key={feed.id} className="feed-item">
                <div className="feed-type">{feed.type}</div>
                <div className="feed-quantity">{feed.quantity} kg</div>
                <div className="feed-status">{feed.status}</div>
              </div>
            ))}
          </div>
          <div className="nutrition-plan">
            <h4>Nutrition Plan</h4>
            <div className="plan-details">
              <div className="plan-item">
                <span>Current Diet:</span>
                <span>{dashboardData?.nutrition_plan?.current_diet}</span>
              </div>
              <div className="plan-item">
                <span>Next Feeding:</span>
                <span>{dashboardData?.nutrition_plan?.next_feeding}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Market & Sales */}
        <Card className="market-card">
          <div className="card-header">
            <h3>💰 Market & Sales</h3>
          </div>
          <div className="market-prices">
            <h4>Current Prices</h4>
            {dashboardData?.market_prices?.map(price => (
              <div key={price.product} className="price-item">
                <div className="product">{price.product}</div>
                <div className="price">${price.price}/kg</div>
                <div className="trend">{price.trend}</div>
              </div>
            ))}
          </div>
          <div className="sales-opportunities">
            <h4>Sales Opportunities</h4>
            {dashboardData?.sales_opportunities?.map(opportunity => (
              <div key={opportunity.id} className="opportunity-item">
                <div className="buyer">{opportunity.buyer}</div>
                <div className="product">{opportunity.product}</div>
                <div className="quantity">{opportunity.quantity} units</div>
                <Button size="small">Contact</Button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* User Directory Modal */}
      {showUserDirectory && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <UserDirectory 
              currentUser={user}
              onUserSelect={handleUserSelect}
              onMessageUser={handleMessageUser}
            />
            <button 
              className="close-modal"
              onClick={() => setShowUserDirectory(false)}
            >
              Close Directory
            </button>
          </div>
        </div>
      )}

      {/* User Profile Modal */}
      <UserProfileModal
        user={selectedUser}
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onMessage={handleMessageUser}
        onRequestService={handleServiceRequest}
      />

      {/* Service Request Form */}
      {showServiceForm && serviceRequest && (
        <ServiceRequestForm
          targetUser={serviceRequest.user}
          serviceType={serviceRequest.serviceType}
          formType={serviceRequest.formType}
          onClose={() => setShowServiceForm(false)}
          onSubmit={(result) => {
            console.log('Service request submitted:', result);
            setShowServiceForm(false);
          }}
        />
      )}
    </div>
  );
};

export default LivestockFarmerDashboard;