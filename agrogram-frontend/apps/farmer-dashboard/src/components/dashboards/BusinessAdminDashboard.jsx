// src/components/dashboards/admin/BusinessAdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from "../../contexts/AuthContext.jsx";
import { Card, Button, LoadingSpinner, RevenueAnalytics, BusinessIntelligence } from '@agro-gram/ui';
import { useDashboardHandlers } from '../../hooks/useDashboardHandlers';
import UserDirectory from '../../common/UserDirectory';
import UserProfileModal from '../../common/UserProfileModal';
import ServiceRequestForm from '../../forms/ServiceRequestForm';
import { fetchMockDashboardData } from '../../data/mockDashboardData';
import './BusinessAdminDashboard.css';

const BusinessAdminDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [showUserDirectory, setShowUserDirectory] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [serviceRequest, setServiceRequest] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  // const fetchDashboardData = async () => {
  //   try {
  //     const response = await fetch(`/api/dashboard/admin/business/?time_range=${timeRange}`);
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
      const response = await fetch(`/api/dashboard/admin/business/?time_range=${timeRange}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setDashboardData(data.data);
          return;
        }
      }
      
      // Fallback to mock data
      console.log('Using mock data for development');
      const mockResponse = await fetchMockDashboardData('BUSINESS_ADMIN');
      if (mockResponse.success) {
        setDashboardData(mockResponse.data);
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      
      // Fallback to mock data on error
      console.log('Falling back to mock data due to error');
      const mockResponse = await fetchMockDashboardData('BUSINESS_ADMIN');
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
    <div className="dashboard business-admin-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>💼 Business Admin Dashboard</h1>
          <p>Revenue tracking and strategic business intelligence</p>
        </div>
        <div className="header-controls">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="time-range-selector"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
          <Button variant="primary">Export Report</Button>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Business Overview */}
        <Card className="overview-card full-width">
          <div className="card-header">
            <h3>📊 Business Overview</h3>
            <Button size="small">Customize</Button>
          </div>
          <div className="revenue-streams">
            <h4>Revenue Streams</h4>
            <div className="revenue-metrics">
              <div className="revenue-metric">
                <div className="metric-value">${dashboardData?.revenue_streams?.marketplace?.toLocaleString()}</div>
                <div className="metric-label">Marketplace</div>
                <div className="metric-trend positive">+12%</div>
              </div>
              <div className="revenue-metric">
                <div className="metric-value">${dashboardData?.revenue_streams?.subscriptions?.toLocaleString()}</div>
                <div className="metric-label">Subscriptions</div>
                <div className="metric-trend positive">+25%</div>
              </div>
              <div className="revenue-metric">
                <div className="metric-value">${dashboardData?.revenue_streams?.premium_features?.toLocaleString()}</div>
                <div className="metric-label">Premium Features</div>
                <div className="metric-trend positive">+18%</div>
              </div>
              <div className="revenue-metric">
                <div className="metric-value">${dashboardData?.revenue_streams?.consulting?.toLocaleString()}</div>
                <div className="metric-label">Consulting</div>
                <div className="metric-trend negative">-5%</div>
              </div>
            </div>
          </div>
          <div className="platform-growth">
            <h4>Platform Growth Metrics</h4>
            <div className="growth-metrics">
              <div className="growth-metric">
                <div className="metric-value">{dashboardData?.platform_growth?.active_users}</div>
                <div className="metric-label">Active Users</div>
              </div>
              <div className="growth-metric">
                <div className="metric-value">{dashboardData?.platform_growth?.new_registrations}</div>
                <div className="metric-label">New Registrations</div>
              </div>
              <div className="growth-metric">
                <div className="metric-value">{dashboardData?.platform_growth?.transaction_volume}</div>
                <div className="metric-label">Transactions</div>
              </div>
              <div className="growth-metric">
                <div className="metric-value">{dashboardData?.platform_growth?.retention_rate}%</div>
                <div className="metric-label">Retention Rate</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Professional Network */}
        <Card className="network-card">
          <div className="card-header">
            <h3>🌐 Professional Network</h3>
            <Button 
              size="small"
              onClick={() => setShowUserDirectory(true)}
            >
              Find Partners
            </Button>
          </div>
          <div className="network-preview">
            <p>Connect with platform users and business partners</p>
            <div className="quick-stats">
              <span>🌾 156+ Farmers</span>
              <span>🏭 45+ Businesses</span>
              <span>🤝 23+ Partners</span>
            </div>
          </div>
        </Card>

        {/* Financial Analytics */}
        <Card className="financial-card">
          <div className="card-header">
            <h3>💰 Financial Analytics</h3>
            <Button size="small">Detailed Report</Button>
          </div>
          <RevenueAnalytics 
            revenueData={dashboardData?.financial_analytics || {}}
            timeRange={timeRange}
          />
          <div className="cost-management">
            <h4>Cost Management</h4>
            <div className="cost-breakdown">
              {dashboardData?.cost_breakdown?.map(cost => (
                <div key={cost.category} className="cost-item">
                  <div className="cost-category">{cost.category}</div>
                  <div className="cost-amount">${cost.amount?.toLocaleString()}</div>
                  <div className="cost-percentage">{cost.percentage}%</div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Partnership Management */}
        <Card className="partnerships-card">
          <div className="card-header">
            <h3>🤝 Partnership Management</h3>
            <Button size="small">New Partner</Button>
          </div>
          <div className="partner-performance">
            <h4>Partner Performance</h4>
            {dashboardData?.partner_performance?.map(partner => (
              <div key={partner.id} className="partner-item">
                <div className="partner-name">{partner.name}</div>
                <div className="partner-metrics">
                  <span>Revenue: ${partner.revenue}</span>
                  <span>Growth: {partner.growth}%</span>
                </div>
                <div className="partner-rating">⭐ {partner.rating}</div>
                <Button size="small">Review</Button>
              </div>
            ))}
          </div>
          <div className="relationship-tracking">
            <h4>Relationship Tracking</h4>
            <div className="relationship-metrics">
              <div className="relationship-metric">
                <div className="metric-value">{dashboardData?.relationship_tracking?.active_partners}</div>
                <div className="metric-label">Active Partners</div>
              </div>
              <div className="relationship-metric">
                <div className="metric-value">{dashboardData?.relationship_tracking?.satisfaction_score}%</div>
                <div className="metric-label">Satisfaction Score</div>
              </div>
              <div className="relationship-metric">
                <div className="metric-value">{dashboardData?.relationship_tracking?.renewal_rate}%</div>
                <div className="metric-label">Renewal Rate</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Strategic Planning */}
        <Card className="strategic-card">
          <div className="card-header">
            <h3>🎯 Strategic Planning</h3>
            <Button size="small">New Initiative</Button>
          </div>
          <BusinessIntelligence 
            insights={dashboardData?.strategic_insights || []}
            onInsightSelect={(insight) => console.log('Selected insight:', insight)}
          />
          <div className="market-expansion">
            <h4>Market Expansion</h4>
            {dashboardData?.market_expansion_opportunities?.map(opportunity => (
              <div key={opportunity.id} className="expansion-item">
                <div className="expansion-market">{opportunity.market}</div>
                <div className="expansion-potential">{opportunity.potential}</div>
                <div className="expansion-investment">${opportunity.investment}</div>
                <Button size="small">Analyze</Button>
              </div>
            ))}
          </div>
          <div className="feature-development">
            <h4>Feature Development Pipeline</h4>
            {dashboardData?.feature_pipeline?.map(feature => (
              <div key={feature.id} className="feature-item">
                <div className="feature-name">{feature.name}</div>
                <div className="feature-stage">{feature.stage}</div>
                <div className="feature-priority">{feature.priority}</div>
                <Button size="small">Track</Button>
              </div>
            ))}
          </div>
        </Card>

        {/* Performance Reporting */}
        <Card className="reporting-card">
          <div className="card-header">
            <h3>📈 Performance Reporting</h3>
            <Button size="small">Generate</Button>
          </div>
          <div className="executive-reporting">
            <h4>Executive Reporting</h4>
            <div className="report-types">
              <Button size="small" variant="outline" fullWidth>
                📊 Monthly Performance
              </Button>
              <Button size="small" variant="outline" fullWidth>
                💰 Financial Summary
              </Button>
              <Button size="small" variant="outline" fullWidth>
                👥 User Analytics
              </Button>
              <Button size="small" variant="outline" fullWidth>
                🎯 Strategic Review
              </Button>
            </div>
          </div>
          <div className="stakeholder-updates">
            <h4>Stakeholder Updates</h4>
            {dashboardData?.stakeholder_updates?.map(update => (
              <div key={update.id} className="update-item">
                <div className="update-type">{update.type}</div>
                <div className="update-frequency">{update.frequency}</div>
                <div className="update-status">{update.status}</div>
                <Button size="small">Prepare</Button>
              </div>
            ))}
          </div>
        </Card>

        {/* Business Health */}
        <Card className="health-card">
          <div className="card-header">
            <h3>❤️ Business Health</h3>
          </div>
          <div className="health-metrics">
            <div className="health-metric excellent">
              <div className="metric-value">{dashboardData?.business_health?.revenue_health}%</div>
              <div className="metric-label">Revenue Health</div>
            </div>
            <div className="health-metric good">
              <div className="metric-value">{dashboardData?.business_health?.user_health}%</div>
              <div className="metric-label">User Health</div>
            </div>
            <div className="health-metric warning">
              <div className="metric-value">{dashboardData?.business_health?.cost_health}%</div>
              <div className="metric-label">Cost Health</div>
            </div>
            <div className="health-metric excellent">
              <div className="metric-value">{dashboardData?.business_health?.growth_health}%</div>
              <div className="metric-label">Growth Health</div>
            </div>
          </div>
          <div className="risk-assessment">
            <h4>Risk Assessment</h4>
            {dashboardData?.business_risks?.map(risk => (
              <div key={risk.id} className="risk-item">
                <div className="risk-type">{risk.type}</div>
                <div className="risk-level">{risk.level}</div>
                <div className="risk-impact">{risk.impact}</div>
                <Button size="small">Mitigate</Button>
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

export default BusinessAdminDashboard;