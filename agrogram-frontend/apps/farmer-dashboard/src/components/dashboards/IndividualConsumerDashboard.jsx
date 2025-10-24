// src/components/dashboards/consumer/IndividualConsumerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from "../../contexts/AuthContext.jsx";
import { Card, Button, LoadingSpinner, ProductCarousel, RecommendationEngine } from '@agro-gram/ui';
import { useDashboardHandlers } from '../../hooks/useDashboardHandlers';
import UserDirectory from '../../common/UserDirectory';
import UserProfileModal from '../../common/UserProfileModal';
import ServiceRequestForm from '../../forms/ServiceRequestForm';
import { fetchMockDashboardData } from '../../data/mockDashboardData';
import './IndividualConsumerDashboard.css';

const IndividualConsumerDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
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
  //     const response = await fetch('/api/dashboard/consumer/individual/');
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
      const response = await fetch('/api/dashboard/consumer/individual/');
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setDashboardData(data.data);
          return;
        }
      }
      
      // Fallback to mock data
      console.log('Using mock data for development');
      const mockResponse = await fetchMockDashboardData('INDIVIDUAL_CONSUMER');
      if (mockResponse.success) {
        setDashboardData(mockResponse.data);
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      
      // Fallback to mock data on error
      console.log('Falling back to mock data due to error');
      const mockResponse = await fetchMockDashboardData('INDIVIDUAL_CONSUMER');
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
    <div className="dashboard individual-consumer-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>🛒 Personal Shopping Dashboard</h1>
          <p>AI-curated recommendations and convenient shopping experience</p>
        </div>
        <div className="header-actions">
          <Button variant="primary">Quick Order</Button>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Personalized Shopping */}
        <Card className="personalized-card">
          <div className="card-header">
            <h3>🎯 Personalized For You</h3>
            <Button size="small" variant="ghost">Refresh</Button>
          </div>
          <RecommendationEngine 
            preferences={user.preferences}
            onProductSelect={(product) => console.log('Selected:', product)}
          />
          <ProductCarousel 
            products={dashboardData?.personalized_recommendations || []}
            title="Based on Your Preferences"
          />
        </Card>

        {/* Professional Network */}
        <Card className="network-card">
          <div className="card-header">
            <h3>🌐 Local Food Network</h3>
            <Button 
              size="small"
              onClick={() => setShowUserDirectory(true)}
            >
              Find Farmers
            </Button>
          </div>
          <div className="network-preview">
            <p>Connect with local farmers and food producers</p>
            <div className="quick-stats">
              <span>🌾 45+ Farmers</span>
              <span>🏪 23+ Markets</span>
              <span>🥬 67+ Products</span>
            </div>
          </div>
        </Card>

        {/* Quick Order System */}
        <Card className="quick-order-card">
          <div className="card-header">
            <h3>⚡ Quick Order System</h3>
          </div>
          <div className="frequent-items">
            <h4>Frequently Ordered</h4>
            {dashboardData?.frequent_orders?.map(item => (
              <div key={item.id} className="frequent-item">
                <img src={item.image} alt={item.name} className="item-image" />
                <div className="item-info">
                  <h5>{item.name}</h5>
                  <p>${item.price} • {item.unit}</p>
                </div>
                <Button size="small">Add to Cart</Button>
              </div>
            ))}
          </div>
          <div className="scheduled-orders">
            <h4>Scheduled Deliveries</h4>
            {dashboardData?.scheduled_orders?.map(order => (
              <div key={order.id} className="scheduled-order">
                <span className="order-date">{order.delivery_date}</span>
                <span className="order-items">{order.items_count} items</span>
                <Button size="small">Manage</Button>
              </div>
            ))}
          </div>
        </Card>

        {/* Delivery Management */}
        <Card className="delivery-card">
          <div className="card-header">
            <h3>🚚 Delivery Management</h3>
          </div>
          <div className="current-deliveries">
            {dashboardData?.active_deliveries?.map(delivery => (
              <div key={delivery.id} className="delivery-item">
                <div className="delivery-status">
                  <div className={`status-indicator ${delivery.status}`}></div>
                  <span>{delivery.status}</span>
                </div>
                <div className="delivery-info">
                  <strong>Order #{delivery.order_id}</strong>
                  <span>Estimated: {delivery.estimated_time}</span>
                </div>
                <Button size="small">Track</Button>
              </div>
            ))}
          </div>
          <div className="delivery-preferences">
            <h4>Delivery Preferences</h4>
            <div className="preference-item">
              <span>Preferred Time:</span>
              <span>{dashboardData?.delivery_preferences?.preferred_time}</span>
            </div>
            <div className="preference-item">
              <span>Delivery Instructions:</span>
              <span>{dashboardData?.delivery_preferences?.instructions}</span>
            </div>
          </div>
        </Card>

        {/* Personal Analytics */}
        <Card className="analytics-card">
          <div className="card-header">
            <h3>📊 Personal Analytics</h3>
          </div>
          <div className="spending-metrics">
            <div className="spending-metric">
              <div className="metric-value">${dashboardData?.spending_analytics?.monthly_spending}</div>
              <div className="metric-label">This Month</div>
            </div>
            <div className="spending-metric">
              <div className="metric-value">{dashboardData?.spending_analytics?.orders_count}</div>
              <div className="metric-label">Orders</div>
            </div>
            <div className="spending-metric">
              <div className="metric-value">{dashboardData?.spending_analytics?.savings}</div>
              <div className="metric-label">Savings</div>
            </div>
          </div>
          <div className="health-integration">
            <h4>Health Goals Integration</h4>
            <div className="health-progress">
              <div className="goal-item">
                <span>Organic Products</span>
                <div className="progress-bar">
                  <div className="progress-fill" style={{width: '75%'}}></div>
                </div>
                <span>75%</span>
              </div>
              <div className="goal-item">
                <span>Local Sourcing</span>
                <div className="progress-bar">
                  <div className="progress-fill" style={{width: '90%'}}></div>
                </div>
                <span>90%</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Food Community */}
        <Card className="community-card">
          <div className="card-header">
            <h3>👥 Food Community</h3>
          </div>
          <div className="local-farmers">
            <h4>Local Farmers Near You</h4>
            {dashboardData?.local_farmers?.map(farmer => (
              <div key={farmer.id} className="farmer-item">
                <img src={farmer.image} alt={farmer.name} className="farmer-image" />
                <div className="farmer-info">
                  <h5>{farmer.name}</h5>
                  <p>{farmer.specialty}</p>
                  <span className="distance">{farmer.distance} away</span>
                </div>
                <Button size="small">Visit</Button>
              </div>
            ))}
          </div>
          <div className="food-events">
            <h4>Upcoming Food Events</h4>
            {dashboardData?.food_events?.map(event => (
              <div key={event.id} className="event-item">
                <div className="event-date">{event.date}</div>
                <div className="event-title">{event.title}</div>
                <Button size="small">RSVP</Button>
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

export default IndividualConsumerDashboard;