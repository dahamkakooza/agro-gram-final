// src/components/dashboards/supplier/MachineryProviderDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from "../../contexts/AuthContext.jsx";
import { Card, Button, LoadingSpinner, EquipmentTracker, MaintenanceScheduler } from '@agro-gram/ui';
import { useDashboardHandlers } from '../../hooks/useDashboardHandlers';
import UserDirectory from '../../common/UserDirectory';
import UserProfileModal from '../../common/UserProfileModal';
import ServiceRequestForm from '../../forms/ServiceRequestForm';
import { fetchMockDashboardData } from '../../data/mockDashboardData';
import './MachineryProviderDashboard.css';

const MachineryProviderDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
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
  //     const response = await fetch('/api/dashboard/supplier/machinery/');
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
      const response = await fetch('/api/dashboard/supplier/machinery/');
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setDashboardData(data.data);
          return;
        }
      }
      
      // Fallback to mock data
      console.log('Using mock data for development');
      const mockResponse = await fetchMockDashboardData('MACHINERY_PROVIDER');
      if (mockResponse.success) {
        setDashboardData(mockResponse.data);
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      
      // Fallback to mock data on error
      console.log('Falling back to mock data due to error');
      const mockResponse = await fetchMockDashboardData('MACHINERY_PROVIDER');
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
    <div className="dashboard machinery-provider-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>🚜 Machinery Provider Dashboard</h1>
          <p>Equipment rental optimization and maintenance management</p>
        </div>
        <div className="header-actions">
          <Button variant="primary">New Rental</Button>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Equipment Fleet Overview */}
        <Card className="fleet-card full-width">
          <div className="card-header">
            <h3>🏭 Equipment Fleet Overview</h3>
            <Button size="small">Add Equipment</Button>
          </div>
          <EquipmentTracker 
            equipment={dashboardData?.equipment_fleet || []}
            onEquipmentSelect={setSelectedEquipment}
          />
          <div className="fleet-summary">
            <div className="fleet-metric">
              <div className="metric-value">{dashboardData?.fleet_stats?.total_equipment || 0}</div>
              <div className="metric-label">Total Equipment</div>
            </div>
            <div className="fleet-metric">
              <div className="metric-value">{dashboardData?.fleet_stats?.rented || 0}</div>
              <div className="metric-label">Rented Out</div>
            </div>
            <div className="fleet-metric">
              <div className="metric-value">{dashboardData?.fleet_stats?.available || 0}</div>
              <div className="metric-label">Available</div>
            </div>
            <div className="fleet-metric">
              <div className="metric-value">{dashboardData?.fleet_stats?.maintenance || 0}</div>
              <div className="metric-label">Under Maintenance</div>
            </div>
          </div>
        </Card>

        {/* Professional Network */}
        <Card className="network-card">
          <div className="card-header">
            <h3>🌐 Machinery Network</h3>
            <Button 
              size="small"
              onClick={() => setShowUserDirectory(true)}
            >
              Find Clients
            </Button>
          </div>
          <div className="network-preview">
            <p>Connect with farmers and agricultural businesses</p>
            <div className="quick-stats">
              <span>🌾 156+ Farmers</span>
              <span>🏭 45+ Businesses</span>
              <span>🤝 23+ Partners</span>
            </div>
          </div>
        </Card>

        {/* Rental Operations */}
        <Card className="rental-card">
          <div className="card-header">
            <h3>📋 Rental Operations</h3>
            <Button size="small">New Booking</Button>
          </div>
          <div className="booking-management">
            <h4>Active Bookings</h4>
            {dashboardData?.active_bookings?.map(booking => (
              <div key={booking.id} className="booking-item">
                <div className="booking-id">#{booking.id}</div>
                <div className="booking-customer">{booking.customer}</div>
                <div className="booking-period">
                  {booking.start_date} to {booking.end_date}
                </div>
                <div className="booking-status">{booking.status}</div>
                <Button size="small">Manage</Button>
              </div>
            ))}
          </div>
          <div className="contract-administration">
            <h4>Contract Administration</h4>
            <div className="contract-stats">
              <div className="contract-stat">
                <span>Active Contracts: </span>
                <strong>{dashboardData?.contract_stats?.active || 0}</strong>
              </div>
              <div className="contract-stat">
                <span>Expiring Soon: </span>
                <strong>{dashboardData?.contract_stats?.expiring || 0}</strong>
              </div>
              <div className="contract-stat">
                <span>Renewal Rate: </span>
                <strong>{dashboardData?.contract_stats?.renewal_rate}%</strong>
              </div>
            </div>
          </div>
        </Card>

        {/* Maintenance Scheduling */}
        <Card className="maintenance-card">
          <div className="card-header">
            <h3>🔧 Maintenance Scheduling</h3>
            <Button size="small">Schedule</Button>
          </div>
          <MaintenanceScheduler 
            maintenance={dashboardData?.maintenance_schedule || []}
            onScheduleMaintenance={(equipment) => console.log('Schedule:', equipment)}
          />
          <div className="maintenance-alerts">
            <h4>Maintenance Alerts</h4>
            {dashboardData?.maintenance_alerts?.map(alert => (
              <div key={alert.id} className={`alert-item ${alert.priority}`}>
                <div className="alert-equipment">{alert.equipment_name}</div>
                <div className="alert-message">{alert.message}</div>
                <div className="alert-due">{alert.due_date}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Revenue Optimization */}
        <Card className="revenue-card">
          <div className="card-header">
            <h3>💰 Revenue Optimization</h3>
            <Button size="small">Pricing</Button>
          </div>
          <div className="revenue-metrics">
            <div className="revenue-metric">
              <div className="metric-value">${dashboardData?.revenue_metrics?.monthly_revenue?.toLocaleString()}</div>
              <div className="metric-label">Monthly Revenue</div>
            </div>
            <div className="revenue-metric">
              <div className="metric-value">{dashboardData?.revenue_metrics?.utilization_rate}%</div>
              <div className="metric-label">Utilization Rate</div>
            </div>
            <div className="revenue-metric">
              <div className="metric-value">${dashboardData?.revenue_metrics?.avg_daily_rate}</div>
              <div className="metric-label">Avg. Daily Rate</div>
            </div>
          </div>
          <div className="dynamic-pricing">
            <h4>Dynamic Pricing</h4>
            <div className="pricing-recommendations">
              {dashboardData?.pricing_recommendations?.map(recommendation => (
                <div key={recommendation.equipment_type} className="pricing-item">
                  <div className="equipment-type">{recommendation.equipment_type}</div>
                  <div className="current-price">${recommendation.current_price}</div>
                  <div className="recommended-price">${recommendation.recommended_price}</div>
                  <Button size="small">Apply</Button>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Customer Management */}
        <Card className="customer-card">
          <div className="card-header">
            <h3>👥 Customer Management</h3>
          </div>
          <div className="customer-insights">
            <h4>Customer Insights</h4>
            {dashboardData?.customer_insights?.map(customer => (
              <div key={customer.id} className="customer-item">
                <div className="customer-name">{customer.name}</div>
                <div className="customer-stats">
                  <span>Rentals: {customer.total_rentals}</span>
                  <span>Value: ${customer.total_value}</span>
                </div>
                <div className="customer-rating">
                  <span className="rating">⭐ {customer.rating}</span>
                </div>
                <Button size="small">Contact</Button>
              </div>
            ))}
          </div>
          <div className="training-records">
            <h4>Equipment Training Records</h4>
            {dashboardData?.training_records?.map(record => (
              <div key={record.id} className="training-item">
                <div className="customer-name">{record.customer_name}</div>
                <div className="equipment-trained">{record.equipment}</div>
                <div className="training-date">{record.training_date}</div>
                <div className="training-status">{record.status}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Equipment Analytics */}
        <Card className="analytics-card">
          <div className="card-header">
            <h3>📊 Equipment Analytics</h3>
          </div>
          <div className="equipment-performance">
            <h4>Performance Metrics</h4>
            <div className="performance-metrics">
              <div className="performance-metric">
                <div className="metric-label">Uptime</div>
                <div className="metric-value">{dashboardData?.performance_metrics?.uptime}%</div>
              </div>
              <div className="performance-metric">
                <div className="metric-label">Maintenance Cost</div>
                <div className="metric-value">${dashboardData?.performance_metrics?.maintenance_cost}/hr</div>
              </div>
              <div className="performance-metric">
                <div className="metric-label">Revenue/Hr</div>
                <div className="metric-value">${dashboardData?.performance_metrics?.revenue_per_hour}</div>
              </div>
            </div>
          </div>
          <div className="equipment-health">
            <h4>Equipment Health Scores</h4>
            {dashboardData?.equipment_health?.map(equipment => (
              <div key={equipment.id} className="health-item">
                <div className="equipment-name">{equipment.name}</div>
                <div className="health-score">
                  <div className="score-bar">
                    <div 
                      className="score-fill" 
                      style={{width: `${equipment.health_score}%`}}
                    ></div>
                  </div>
                  <span>{equipment.health_score}%</span>
                </div>
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

export default MachineryProviderDashboard;