// src/components/dashboards/farmer/SmallholderFarmerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from "../../contexts/AuthContext.jsx";
import { Card, Button, LoadingSpinner, Alert, WeatherWidget, MarketPriceTicker } from '@agro-gram/ui';
import { useDashboardHandlers } from '../../hooks/useDashboardHandlers';
// import { newDashboardAPI } from '@agro-gram/api'; // Use the new modular API
import UserDirectory from '../../common/UserDirectory';
import UserProfileModal from '../../common/UserProfileModal';
import ServiceRequestForm from '../../forms/ServiceRequestForm';
import { fetchMockDashboardData } from '../../data/mockDashboardData';
import './SmallholderFarmerDashboard.css';

const SmallholderFarmerDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('today');
  const [showUserDirectory, setShowUserDirectory] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [serviceRequest, setServiceRequest] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // NEW: Use the modular API structure
      console.log('🔄 Fetching smallholder farmer dashboard data...');
      
      // Option 1: Use new modular API (recommended)
      const response = await newDashboardAPI.farmer.smallholder();
      
      // Option 2: Fallback to generic dashboard API
      // const response = await dashboardAPI.getDashboardBySubRole('SMALLHOLDER_FARMER');
      
      if (response.success) {
        console.log('✅ Dashboard data loaded successfully');
        setDashboardData(response.data);
        return;
      } else {
        console.warn('⚠️ API returned success:false, using fallback data');
        throw new Error(response.error || 'API request failed');
      }
      
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
      
      // Fallback to mock data on error
      console.log('🔄 Falling back to mock data');
      try {
        const mockResponse = await fetchMockDashboardData('SMALLHOLDER_FARMER');
        if (mockResponse.success) {
          setDashboardData(mockResponse.data);
        } else {
          // Ultimate fallback
          setDashboardData(getFallbackDashboardData());
        }
      } catch (mockError) {
        console.error('❌ Mock data also failed, using hardcoded fallback');
        setDashboardData(getFallbackDashboardData());
      }
    } finally {
      setLoading(false);
    }
  };
  

  // Fallback data function
  const getFallbackDashboardData = () => ({
    dashboard_type: "smallholder_farmer",
    welcome_message: `Welcome, ${user?.first_name || 'Farmer'}!`,
    today_priorities: [
      { time: 'Morning', description: 'Check soil moisture', priority: 'High' },
      { time: 'Afternoon', description: 'Water tomato plants', priority: 'Medium' },
      { time: 'Evening', description: 'Record harvest data', priority: 'Low' }
    ],
    active_crops: [
      { icon: '🌽', name: 'Maize', progress: 65, status: 'growing' },
      { icon: '🍅', name: 'Tomatoes', progress: 30, status: 'planted' },
      { icon: '🥬', name: 'Beans', progress: 95, status: 'ready' }
    ],
    market_prices: [
      { crop: 'Maize', price: 45.50, unit: 'kg', trend: 'up' },
      { crop: 'Tomatoes', price: 68.20, unit: 'kg', trend: 'stable' },
      { crop: 'Beans', price: 85.75, unit: 'kg', trend: 'up' }
    ],
    immediate_alerts: [],
    stats: {
      total_farms: 1,
      active_crops_count: 3,
      pending_tasks: 2,
      revenue_this_month: 1250.50
    },
    quick_actions: [
      { title: "Record Harvest", icon: "🌾", url: "/farms" },
      { title: "Check Prices", icon: "💰", url: "/marketplace" },
      { title: "Get Advice", icon: "🤝", url: "/recommendations" }
    ]
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const {
    handleRefresh,
    handleVoice,
    handleQuickAction,
    handleExport,
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

  if (loading) {
    return (
      <div className="dashboard-loading">
        <LoadingSpinner size="large" />
        <p>Loading your farm dashboard...</p>
      </div>
    );
  }

  // Use dashboard data or fallback
  const data = dashboardData || getFallbackDashboardData();

  return (
    <div className="dashboard smallholder-farmer-dashboard">
      <div className="dashboard-header mobile-optimized">
        <div className="header-content">
          <h1>Smallholder Farmer Dashboard</h1>
          <p>{data.welcome_message}</p>
        </div>
        <div className="header-actions">
          <Button size="small" variant="outline" onClick={() => handleVoice("Welcome to your dashboard")}>
            🔊 Voice Command
          </Button>
          <Button size="small" variant="ghost" onClick={handleRefresh}>🔄 Refresh</Button>
        </div>
      </div>

      {data.immediate_alerts?.length > 0 && (
        <div className="alerts-section">
          {data.immediate_alerts.map((alert, index) => (
            <Alert key={index} type={alert.type} className="immediate-alert">
              <strong>{alert.title}:</strong> {alert.message}
            </Alert>
          ))}
        </div>
      )}

      <div className="dashboard-grid mobile-grid">
        {/* Today's Priorities Card */}
        <Card className="priority-card touch-optimized">
          <div className="card-header">
            <h3>📋 Today's Priorities</h3>
            <Button size="small" variant="ghost" onClick={handleRefresh}>Refresh</Button>
          </div>
          <div className="task-list">
            {data.today_priorities?.map((task, index) => (
              <div key={index} className="task-item">
                <div className="task-time">{task.time}</div>
                <div className="task-content">
                  <span className="task-description">{task.description}</span>
                  <span className={`task-priority ${task.priority?.toLowerCase()}`}>
                    {task.priority}
                  </span>
                </div>
                <Button size="small" onClick={() => handleQuickAction('log_activity', { task })}>
                  Start
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {/* Farmer Network Card */}
        <Card className="network-card touch-optimized">
          <div className="card-header">
            <h3>🌐 Farmer Network</h3>
            <Button 
              size="small"
              onClick={() => setShowUserDirectory(true)}
            >
              Connect
            </Button>
          </div>
          <div className="network-preview">
            <p>Connect with other farmers and service providers</p>
            <div className="quick-stats">
              <span>👨‍🌾 45+ Farmers</span>
              <span>🔧 23+ Services</span>
              <span>🤝 34+ Partners</span>
            </div>
          </div>
        </Card>

        {/* Active Crops Card */}
        <Card className="crops-card touch-optimized">
          <div className="card-header">
            <h3>🌱 Active Crops</h3>
            <Button size="small" variant="ghost" onClick={() => handleQuickAction('manage_crops')}>
              Manage
            </Button>
          </div>
          <div className="crops-visual">
            {data.active_crops?.map((crop, index) => (
              <div key={index} className="crop-visual-item">
                <div className="crop-icon">{crop.icon}</div>
                <div className="crop-info">
                  <h4>{crop.name}</h4>
                  <div className="crop-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${crop.progress}%` }}
                      ></div>
                    </div>
                    <span>{crop.progress}%</span>
                  </div>
                  <span className="crop-status">{crop.status}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Analytics Card */}
        <Card className="analytics-card">
          <div className="card-header">
            <h3>📊 Quick Analytics</h3>
            <Button size="small" onClick={() => handleExport('csv')}>
              Export
            </Button>
          </div>
          <div className="analytics-grid">
            <div className="metric-card">
              <div className="metric-value">${data.stats?.revenue_this_month || 0}</div>
              <div className="metric-label">This Month</div>
              <div className="metric-trend positive">+12%</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">{data.stats?.active_crops_count || 0}</div>
              <div className="metric-label">Active Crops</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">{data.stats?.pending_tasks || 0}</div>
              <div className="metric-label">Pending Tasks</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">{data.stats?.total_farms || 0}</div>
              <div className="metric-label">Total Farms</div>
            </div>
          </div>
        </Card>

        {/* Market Prices Card */}
        <Card className="prices-card">
          <div className="card-header">
            <h3>💰 Market Prices</h3>
            <Button size="small" variant="ghost" onClick={() => handleQuickAction('check_prices')}>
              View All
            </Button>
          </div>
          <MarketPriceTicker prices={data.market_prices || []} />
        </Card>

        {/* Weather Card */}
        <Card className="weather-card">
          <WeatherWidget location={user?.location} />
          <Button size="small" fullWidth onClick={() => handleQuickAction('check_weather')}>
            Detailed Forecast
          </Button>
        </Card>

        {/* Quick Actions Card */}
        <Card className="actions-card touch-optimized">
          <div className="card-header">
            <h3>⚡ Quick Actions</h3>
          </div>
          <div className="actions-grid">
            {data.quick_actions?.map((action, index) => (
              <Button 
                key={index}
                size="large" 
                variant="outline" 
                fullWidth 
                onClick={() => handleQuickAction(action.title.toLowerCase().replace(' ', '_'), action)}
              >
                {action.icon} {action.title}
              </Button>
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

export default SmallholderFarmerDashboard;
