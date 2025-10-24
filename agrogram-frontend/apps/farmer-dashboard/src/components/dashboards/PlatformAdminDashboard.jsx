// src/components/dashboards/admin/PlatformAdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from "../../contexts/AuthContext.jsx";
import { Card, Button, LoadingSpinner, SystemMonitor, UserManagement } from '@agro-gram/ui';
import { useDashboardHandlers } from '../../hooks/useDashboardHandlers';
import UserDirectory from '../../common/UserDirectory';
import UserProfileModal from '../../common/UserProfileModal';
import ServiceRequestForm from '../../forms/ServiceRequestForm';

import './PlatformAdminDashboard.css';
import mockDashboardData from '../../data/mockDashboardData.js';

const PlatformAdminDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');
  const [showUserDirectory, setShowUserDirectory] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [serviceRequest, setServiceRequest] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard/admin/platform/');
      const data = await response.json();
      
      if (data.success) {
        setDashboardData(data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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
    <div className="dashboard platform-admin-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>🖥️ Platform Admin Dashboard</h1>
          <p>System health monitoring and user management</p>
        </div>
        <div className="header-actions">
          <Button variant="primary">System Settings</Button>
        </div>
      </div>

      <div className="admin-tabs">
        <button 
          className={`tab ${activeSection === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveSection('overview')}
        >
          System Overview
        </button>
        <button 
          className={`tab ${activeSection === 'users' ? 'active' : ''}`}
          onClick={() => setActiveSection('users')}
        >
          User Management
        </button>
        <button 
          className={`tab ${activeSection === 'monitoring' ? 'active' : ''}`}
          onClick={() => setActiveSection('monitoring')}
        >
          System Monitoring
        </button>
        <button 
          className={`tab ${activeSection === 'features' ? 'active' : ''}`}
          onClick={() => setActiveSection('features')}
        >
          Feature Management
        </button>
        <button 
          className={`tab ${activeSection === 'support' ? 'active' : ''}`}
          onClick={() => setActiveSection('support')}
        >
          Support Operations
        </button>
      </div>

      <div className="dashboard-content">
        {activeSection === 'overview' && (
          <div className="tab-content">
            {/* Platform Health Overview */}
            <Card className="health-card full-width">
              <div className="card-header">
                <h3>❤️ Platform Health Overview</h3>
                <Button size="small">Refresh Status</Button>
              </div>
              <SystemMonitor 
                systems={dashboardData?.system_health || []}
                onSystemAlert={(system) => console.log('System alert:', system)}
              />
              <div className="health-metrics">
                <div className="health-metric healthy">
                  <div className="metric-value">{dashboardData?.health_metrics?.uptime}%</div>
                  <div className="metric-label">Uptime</div>
                </div>
                <div className="health-metric healthy">
                  <div className="metric-value">{dashboardData?.health_metrics?.response_time}ms</div>
                  <div className="metric-label">Avg. Response Time</div>
                </div>
                <div className="health-metric warning">
                  <div className="metric-value">{dashboardData?.health_metrics?.active_issues}</div>
                  <div className="metric-label">Active Issues</div>
                </div>
                <div className="health-metric healthy">
                  <div className="metric-value">{dashboardData?.health_metrics?.system_load}%</div>
                  <div className="metric-label">System Load</div>
                </div>
              </div>
            </Card>

            {/* Professional Network */}
            <Card className="network-card">
              <div className="card-header">
                <h3>🌐 Platform Network</h3>
                <Button 
                  size="small"
                  onClick={() => setShowUserDirectory(true)}
                >
                  View Users
                </Button>
              </div>
              <div className="network-preview">
                <p>Connect with platform users and administrators</p>
                <div className="quick-stats">
                  <span>👥 1,234+ Users</span>
                  <span>👨‍💼 45+ Admins</span>
                  <span>🤝 89+ Partners</span>
                </div>
              </div>
            </Card>

            {/* User Activity */}
            <Card className="activity-card">
              <div className="card-header">
                <h3>👥 User Activity</h3>
                <Button size="small">Analytics</Button>
              </div>
              <div className="activity-metrics">
                <div className="activity-metric">
                  <div className="metric-value">{dashboardData?.user_activity?.active_users}</div>
                  <div className="metric-label">Active Users Now</div>
                </div>
                <div className="activity-metric">
                  <div className="metric-value">{dashboardData?.user_activity?.new_today}</div>
                  <div className="metric-label">New Today</div>
                </div>
                <div className="activity-metric">
                  <div className="metric-value">{dashboardData?.user_activity?.sessions_today}</div>
                  <div className="metric-label">Sessions Today</div>
                </div>
              </div>
              <div className="activity-breakdown">
                <h4>Activity by Role</h4>
                {dashboardData?.activity_by_role?.map(role => (
                  <div key={role.role} className="role-activity">
                    <div className="role-name">{role.role}</div>
                    <div className="role-count">{role.active_users} active</div>
                    <div className="activity-percent">{role.percentage}%</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {activeSection === 'users' && (
          <div className="tab-content">
            <UserManagement 
              users={dashboardData?.users || []}
              onUserAction={(user, action) => console.log('User action:', user, action)}
            />
            <div className="user-growth">
              <h4>User Growth Tracking</h4>
              <div className="growth-metrics">
                <div className="growth-metric">
                  <div className="metric-value">{dashboardData?.user_growth?.total_users}</div>
                  <div className="metric-label">Total Users</div>
                </div>
                <div className="growth-metric">
                  <div className="metric-value">{dashboardData?.user_growth?.growth_rate}%</div>
                  <div className="metric-label">Growth Rate (30d)</div>
                </div>
                <div className="growth-metric">
                  <div className="metric-value">{dashboardData?.user_growth?.retention_rate}%</div>
                  <div className="metric-label">Retention Rate</div>
                </div>
              </div>
            </div>
            <div className="role-administration">
              <h4>Role Administration</h4>
              {dashboardData?.role_distribution?.map(role => (
                <div key={role.role} className="role-item">
                  <div className="role-name">{role.role}</div>
                  <div className="role-count">{role.count} users</div>
                  <div className="role-percentage">{role.percentage}%</div>
                  <Button size="small">Manage</Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'monitoring' && (
          <div className="tab-content">
            <Card className="monitoring-card full-width">
              <div className="card-header">
                <h3>📊 System Monitoring</h3>
                <Button size="small">Real-time Logs</Button>
              </div>
              <div className="performance-metrics">
                <div className="performance-metric">
                  <div className="metric-label">CPU Usage</div>
                  <div className="metric-value">{dashboardData?.performance_metrics?.cpu_usage}%</div>
                  <div className="metric-trend stable">Stable</div>
                </div>
                <div className="performance-metric">
                  <div className="metric-label">Memory Usage</div>
                  <div className="metric-value">{dashboardData?.performance_metrics?.memory_usage}%</div>
                  <div className="metric-trend stable">Stable</div>
                </div>
                <div className="performance-metric">
                  <div className="metric-label">Database Load</div>
                  <div className="metric-value">{dashboardData?.performance_metrics?.database_load}%</div>
                  <div className="metric-trend warning">High</div>
                </div>
                <div className="performance-metric">
                  <div className="metric-label">API Response Time</div>
                  <div className="metric-value">{dashboardData?.performance_metrics?.api_response_time}ms</div>
                  <div className="metric-trend stable">Optimal</div>
                </div>
              </div>
            </Card>

            <Card className="error-tracking-card">
              <div className="card-header">
                <h3>🚨 Error Tracking</h3>
                <Button size="small">View All</Button>
              </div>
              <div className="error-summary">
                <div className="error-metric">
                  <div className="metric-value">{dashboardData?.error_tracking?.total_errors}</div>
                  <div className="metric-label">Total Errors (24h)</div>
                </div>
                <div className="error-metric">
                  <div className="metric-value">{dashboardData?.error_tracking?.critical_errors}</div>
                  <div className="metric-label">Critical Errors</div>
                </div>
                <div className="error-metric">
                  <div className="metric-value">{dashboardData?.error_tracking?.resolved_errors}</div>
                  <div className="metric-label">Resolved</div>
                </div>
              </div>
              <div className="recent-errors">
                <h4>Recent Errors</h4>
                {dashboardData?.recent_errors?.map(error => (
                  <div key={error.id} className="error-item">
                    <div className="error-type">{error.type}</div>
                    <div className="error-message">{error.message}</div>
                    <div className="error-time">{error.timestamp}</div>
                    <Button size="small">Investigate</Button>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {activeSection === 'features' && (
          <div className="tab-content">
            <Card className="features-card full-width">
              <div className="card-header">
                <h3>🚀 Feature Management</h3>
                <Button size="small">Deploy New</Button>
              </div>
              <div className="deployment-tracking">
                <h4>Deployment Tracking</h4>
                {dashboardData?.feature_deployments?.map(deployment => (
                  <div key={deployment.id} className="deployment-item">
                    <div className="feature-name">{deployment.feature_name}</div>
                    <div className="deployment-status">{deployment.status}</div>
                    <div className="deployment-date">{deployment.deployment_date}</div>
                    <div className="user-adoption">{deployment.adoption_rate}% adoption</div>
                    <Button size="small">Manage</Button>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="usage-analytics-card">
              <div className="card-header">
                <h3>📈 Usage Analytics</h3>
              </div>
              <div className="feature-usage">
                <h4>Feature Usage</h4>
                {dashboardData?.feature_usage?.map(feature => (
                  <div key={feature.id} className="usage-item">
                    <div className="feature-name">{feature.name}</div>
                    <div className="usage-metrics">
                      <span>Active Users: {feature.active_users}</span>
                      <span>Usage Rate: {feature.usage_rate}%</span>
                    </div>
                    <div className="usage-trend">
                      <span className={`trend ${feature.trend}`}>
                        {feature.trend === 'up' ? '↑' : '↓'} {feature.growth}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {activeSection === 'support' && (
          <div className="tab-content">
            <Card className="support-card full-width">
              <div className="card-header">
                <h3>🛟 Support Operations</h3>
                <Button size="small">Support Center</Button>
              </div>
              <div className="support-metrics">
                <div className="support-metric">
                  <div className="metric-value">{dashboardData?.support_operations?.open_tickets}</div>
                  <div className="metric-label">Open Tickets</div>
                </div>
                <div className="support-metric">
                  <div className="metric-value">{dashboardData?.support_operations?.avg_response_time}</div>
                  <div className="metric-label">Avg. Response Time</div>
                </div>
                <div className="support-metric">
                  <div className="metric-value">{dashboardData?.support_operations?.resolution_rate}%</div>
                  <div className="metric-label">Resolution Rate</div>
                </div>
                <div className="support-metric">
                  <div className="metric-value">{dashboardData?.support_operations?.satisfaction_rate}%</div>
                  <div className="metric-label">Satisfaction Rate</div>
                </div>
              </div>
              <div className="support-cases">
                <h4>Recent Support Cases</h4>
                {dashboardData?.recent_support_cases?.map(supportCase => (
                  <div key={supportCase.id} className="support-case-item">
                    <div className="case-id">#{supportCase.id}</div>
                    <div className="case-subject">{supportCase.subject}</div>
                    <div className="case-priority">{supportCase.priority}</div>
                    <div className="case-status">{supportCase.status}</div>
                    <Button size="small">Handle</Button>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
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

export default PlatformAdminDashboard;