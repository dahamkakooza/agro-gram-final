// src/components/dashboards/farmer/OrganicSpecialistDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from "../../contexts/AuthContext.jsx";
import { Card, Button, LoadingSpinner, Badge, DocumentViewer } from '@agro-gram/ui';
import { useDashboardHandlers } from '../../hooks/useDashboardHandlers';
import UserDirectory from '../../common/UserDirectory';
import UserProfileModal from '../../common/UserProfileModal';
import ServiceRequestForm from '../../forms/ServiceRequestForm';
import { fetchMockDashboardData } from '../../data/mockDashboardData';
import './OrganicSpecialistDashboard.css';

const OrganicSpecialistDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCert, setActiveCert] = useState(null);
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
  //     const response = await fetch('/api/dashboard/farmer/organic/');
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
      const response = await fetch('/api/dashboard/farmer/organic/');
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setDashboardData(data.data);
          return;
        }
      }
      
      // Fallback to mock data
      console.log('Using mock data for development');
      const mockResponse = await fetchMockDashboardData('ORGANIC_SPECIALIST');
      if (mockResponse.success) {
        setDashboardData(mockResponse.data);
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      
      // Fallback to mock data on error
      console.log('Falling back to mock data due to error');
      const mockResponse = await fetchMockDashboardData('ORGANIC_SPECIALIST');
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
    <div className="dashboard organic-specialist-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>🌿 Organic Specialist Dashboard</h1>
          <p>Certification tracking & premium market access</p>
        </div>
        <div className="certification-badges">
          {dashboardData?.certifications?.map(cert => (
            <Badge key={cert.id} type={cert.status === 'ACTIVE' ? 'success' : 'warning'}>
              {cert.type}
            </Badge>
          ))}
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Certification Status */}
        <Card className="certification-card">
          <div className="card-header">
            <h3>📑 Certification Status</h3>
            <Button size="small">Renew All</Button>
          </div>
          <div className="certification-list">
            {dashboardData?.certifications?.map(cert => (
              <div 
                key={cert.id} 
                className={`certification-item ${cert.status.toLowerCase()}`}
                onClick={() => setActiveCert(cert)}
              >
                <div className="cert-icon">📋</div>
                <div className="cert-info">
                  <h4>{cert.type}</h4>
                  <p>Expires: {cert.expiry_date}</p>
                </div>
                <div className={`cert-status ${cert.status.toLowerCase()}`}>
                  {cert.status}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Professional Network */}
        <Card className="network-card">
          <div className="card-header">
            <h3>🌐 Organic Network</h3>
            <Button 
              size="small"
              onClick={() => setShowUserDirectory(true)}
            >
              Find Buyers
            </Button>
          </div>
          <div className="network-preview">
            <p>Connect with premium buyers and organic markets</p>
            <div className="quick-stats">
              <span>🛒 34+ Buyers</span>
              <span>🏪 23+ Markets</span>
              <span>🤝 45+ Partners</span>
            </div>
          </div>
        </Card>

        {/* Quality Management */}
        <Card className="quality-card">
          <div className="card-header">
            <h3>🔬 Quality Management</h3>
          </div>
          <div className="quality-metrics">
            <div className="quality-metric">
              <div className="metric-label">Soil Health</div>
              <div className="metric-value excellent">Excellent</div>
              <div className="metric-details">Last test: {dashboardData?.quality?.soil_last_test}</div>
            </div>
            <div className="quality-metric">
              <div className="metric-label">Pest Management</div>
              <div className="metric-value good">Good</div>
              <div className="metric-details">Organic methods: 95%</div>
            </div>
            <div className="quality-metric">
              <div className="metric-label">Harvest Quality</div>
              <div className="metric-value excellent">Premium</div>
              <div className="metric-details">Grade A: 98%</div>
            </div>
          </div>
        </Card>

        {/* Premium Marketplace */}
        <Card className="marketplace-card">
          <div className="card-header">
            <h3>⭐ Premium Marketplace</h3>
            <Button size="small" variant="primary">List Products</Button>
          </div>
          <div className="premium-stats">
            <div className="premium-stat">
              <div className="stat-value">${dashboardData?.premium_marketplace?.avg_premium || '0.00'}</div>
              <div className="stat-label">Avg. Premium</div>
            </div>
            <div className="premium-stat">
              <div className="stat-value">{dashboardData?.premium_marketplace?.certified_buyers || 0}</div>
              <div className="stat-label">Certified Buyers</div>
            </div>
            <div className="premium-stat">
              <div className="stat-value">{dashboardData?.premium_marketplace?.active_listings || 0}</div>
              <div className="stat-label">Active Listings</div>
            </div>
          </div>
          <div className="buyer-network">
            <h4>Certified Buyer Network</h4>
            <div className="buyer-list">
              {dashboardData?.premium_marketplace?.top_buyers?.map(buyer => (
                <div key={buyer.id} className="buyer-item">
                  <span className="buyer-name">{buyer.name}</span>
                  <Badge type="success">Verified</Badge>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Compliance Documentation */}
        <Card className="compliance-card">
          <div className="card-header">
            <h3>📂 Compliance Documentation</h3>
            <Button size="small">Prepare Audit</Button>
          </div>
          <DocumentViewer 
            documents={dashboardData?.compliance_docs || []}
            onDocumentSelect={(doc) => console.log('Selected:', doc)}
          />
          <div className="audit-status">
            <div className="audit-info">
              <strong>Next Audit:</strong> {dashboardData?.next_audit_date}
            </div>
            <div className="audit-preparedness">
              <strong>Preparedness:</strong> 
              <div className="preparedness-bar">
                <div 
                  className="preparedness-fill" 
                  style={{width: `${dashboardData?.audit_preparedness || 0}%`}}
                ></div>
              </div>
              <span>{dashboardData?.audit_preparedness || 0}%</span>
            </div>
          </div>
        </Card>

        {/* Organic Community */}
        <Card className="community-card">
          <div className="card-header">
            <h3>🤝 Organic Community</h3>
          </div>
          <div className="community-events">
            <h4>Upcoming Events</h4>
            {dashboardData?.community_events?.map(event => (
              <div key={event.id} className="event-item">
                <div className="event-date">{event.date}</div>
                <div className="event-title">{event.title}</div>
                <Button size="small">Register</Button>
              </div>
            ))}
          </div>
          <div className="network-stats">
            <div className="network-stat">
              <strong>{dashboardData?.network_stats?.farmers || 0}</strong> Organic Farmers
            </div>
            <div className="network-stat">
              <strong>{dashboardData?.network_stats?.buyers || 0}</strong> Premium Buyers
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

export default OrganicSpecialistDashboard;