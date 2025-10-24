// src/components/dashboards/supplier/LogisticsProviderDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from "../../contexts/AuthContext.jsx";
import { Card, Button, LoadingSpinner, FleetTracker, RouteOptimizer } from '@agro-gram/ui';
import { useDashboardHandlers } from '../../hooks/useDashboardHandlers';
import UserDirectory from '../../common/UserDirectory';
import UserProfileModal from '../../common/UserProfileModal';
import ServiceRequestForm from '../../forms/ServiceRequestForm';
import { fetchMockDashboardData } from '../../data/mockDashboardData';
import './LogisticsProviderDashboard.css';

const LogisticsProviderDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showUserDirectory, setShowUserDirectory] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [serviceRequest, setServiceRequest] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // const fetchDashboardData = async () => {
  //   try {
  //     const response = await fetch('/api/dashboard/supplier/logistics/');
  //     const data = await response.json();
      
  //     if (data.success) {
  //       setDashboardData(data.data);
  //     }
  //   } catch (error) {
  //     console.error('Error fetching dashboard data:', error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Try real API first, fallback to mock data
      const response = await fetch('/api/dashboard/supplier/logistics/');
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setDashboardData(data.data);
          return;
        }
      }
      
      // Fallback to mock data
      console.log('Using mock data for development');
      const mockResponse = await fetchMockDashboardData('LOGISTICS_PROVIDER');
      if (mockResponse.success) {
        setDashboardData(mockResponse.data);
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      
      // Fallback to mock data on error
      console.log('Falling back to mock data due to error');
      const mockResponse = await fetchMockDashboardData('LOGISTICS_PROVIDER');
      if (mockResponse.success) {
        setDashboardData(mockResponse.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const { handleNavigate } = useDashboardHandlers(dashboardData, fetchDashboardData, setDashboardData, setLoading);

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

  if (loading) {
    return <div className="dashboard-loading"><LoadingSpinner size="large" /></div>;
  }

  return (
    <div className="dashboard logistics-provider-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>🚚 Logistics Provider Dashboard</h1>
          <p>Fleet optimization and delivery efficiency management</p>
        </div>
        <div className="header-actions">
          <Button variant="primary">Dispatch Center</Button>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Fleet Command Center */}
        <Card className="fleet-card full-width">
          <div className="card-header">
            <h3>🏭 Fleet Command Center</h3>
            <Button size="small">Live Tracking</Button>
          </div>
          <FleetTracker 
            vehicles={dashboardData?.fleet || []}
            onVehicleSelect={setSelectedVehicle}
          />
          <div className="fleet-summary">
            <div className="fleet-metric">
              <div className="metric-value">{dashboardData?.fleet_stats?.active || 0}</div>
              <div className="metric-label">Active Vehicles</div>
            </div>
            <div className="fleet-metric">
              <div className="metric-value">{dashboardData?.fleet_stats?.in_transit || 0}</div>
              <div className="metric-label">In Transit</div>
            </div>
            <div className="fleet-metric">
              <div className="metric-value">{dashboardData?.fleet_stats?.available || 0}</div>
              <div className="metric-label">Available</div>
            </div>
            <div className="fleet-metric">
              <div className="metric-value">{dashboardData?.fleet_stats?.maintenance || 0}</div>
              <div className="metric-label">Maintenance</div>
            </div>
          </div>
        </Card>

        {/* Professional Network */}
        <Card className="network-card">
          <div className="card-header">
            <h3>🌐 Logistics Network</h3>
            <Button 
              size="small"
              onClick={() => setShowUserDirectory(true)}
            >
              Find Clients
            </Button>
          </div>
          <div className="network-preview">
            <p>Connect with businesses and delivery clients</p>
            <div className="quick-stats">
              <span>🏪 45+ Businesses</span>
              <span>🏭 23+ Suppliers</span>
              <span>🤝 34+ Partners</span>
            </div>
          </div>
        </Card>

        {/* Delivery Queue */}
        <Card className="delivery-queue-card">
          <div className="card-header">
            <h3>📦 Delivery Queue</h3>
            <Button size="small">Optimize</Button>
          </div>
          <div className="delivery-priorities">
            <h4>Priority Deliveries</h4>
            {dashboardData?.priority_deliveries?.map(delivery => (
              <div key={delivery.id} className="delivery-item priority">
                <div className="delivery-id">#{delivery.id}</div>
                <div className="delivery-route">{delivery.from} → {delivery.to}</div>
                <div className="delivery-eta">{delivery.eta}</div>
                <Button size="small">Assign</Button>
              </div>
            ))}
          </div>
          <div className="scheduled-deliveries">
            <h4>Scheduled Deliveries</h4>
            {dashboardData?.scheduled_deliveries?.map(delivery => (
              <div key={delivery.id} className="delivery-item">
                <div className="delivery-id">#{delivery.id}</div>
                <div className="delivery-time">{delivery.scheduled_time}</div>
                <div className="delivery-status">{delivery.status}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Route Optimization */}
        <Card className="routes-card">
          <div className="card-header">
            <h3>🗺️ Route Optimization</h3>
            <Button size="small">AI Optimize</Button>
          </div>
          <RouteOptimizer 
            routes={dashboardData?.routes || []}
            onRouteSelect={(route) => console.log('Selected route:', route)}
          />
          <div className="optimization-metrics">
            <div className="optimization-metric">
              <div className="metric-label">Fuel Savings</div>
              <div className="metric-value">15%</div>
            </div>
            <div className="optimization-metric">
              <div className="metric-label">Time Saved</div>
              <div className="metric-value">2.5h</div>
            </div>
            <div className="optimization-metric">
              <div className="metric-label">Efficiency Gain</div>
              <div className="metric-value">22%</div>
            </div>
          </div>
        </Card>

        {/* Fleet Management */}
        <Card className="maintenance-card">
          <div className="card-header">
            <h3>🔧 Fleet Management</h3>
            <Button size="small">Schedule</Button>
          </div>
          <div className="maintenance-schedule">
            <h4>Upcoming Maintenance</h4>
            {dashboardData?.maintenance_schedule?.map(item => (
              <div key={item.id} className="maintenance-item">
                <div className="vehicle-id">{item.vehicle_id}</div>
                <div className="maintenance-type">{item.type}</div>
                <div className="maintenance-date">{item.due_date}</div>
                <Button size="small">Schedule</Button>
              </div>
            ))}
          </div>
          <div className="cost-tracking">
            <h4>Cost Tracking</h4>
            <div className="cost-metrics">
              <div className="cost-metric">
                <div className="metric-label">Fuel Cost</div>
                <div className="metric-value">${dashboardData?.costs?.fuel}</div>
              </div>
              <div className="cost-metric">
                <div className="metric-label">Maintenance</div>
                <div className="metric-value">${dashboardData?.costs?.maintenance}</div>
              </div>
              <div className="cost-metric">
                <div className="metric-label">Total This Month</div>
                <div className="metric-value">${dashboardData?.costs?.total}</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Performance Analytics */}
        <Card className="performance-card">
          <div className="card-header">
            <h3>📊 Performance Analytics</h3>
          </div>
          <div className="delivery-metrics">
            <div className="delivery-metric">
              <div className="metric-value">{dashboardData?.performance?.on_time_rate}%</div>
              <div className="metric-label">On-time Delivery</div>
            </div>
            <div className="delivery-metric">
              <div className="metric-value">{dashboardData?.performance?.customer_rating}/5</div>
              <div className="metric-label">Customer Rating</div>
            </div>
            <div className="delivery-metric">
              <div className="metric-value">{dashboardData?.performance?.utilization_rate}%</div>
              <div className="metric-label">Fleet Utilization</div>
            </div>
          </div>
          <div className="performance-trends">
            <h4>Performance Trends</h4>
            <div className="trend-item positive">
              <span>On-time deliveries: </span>
              <span>+5% this month</span>
            </div>
            <div className="trend-item positive">
              <span>Fuel efficiency: </span>
              <span>+8% improvement</span>
            </div>
            <div className="trend-item negative">
              <span>Maintenance costs: </span>
              <span>+3% increase</span>
            </div>
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

export default LogisticsProviderDashboard;