// src/components/dashboards/consumer/InstitutionalBuyerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from "../../contexts/AuthContext.jsx";
import { Card, Button, LoadingSpinner, BudgetTracker, ContractManager } from '@agro-gram/ui';
import { useDashboardHandlers } from '../../hooks/useDashboardHandlers';
import UserDirectory from '../../common/UserDirectory';
import UserProfileModal from '../../common/UserProfileModal';
import ServiceRequestForm from '../../forms/ServiceRequestForm';
import { fetchMockDashboardData } from '../../data/mockDashboardData';
import './InstitutionalBuyerDashboard.css';

const InstitutionalBuyerDashboard = () => {
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
  //     const response = await fetch('/api/dashboard/consumer/institutional/');
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
      const response = await fetch('/api/dashboard/consumer/institutional/');
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setDashboardData(data.data);
          return;
        }
      }
      
      // Fallback to mock data
      console.log('Using mock data for development');
      const mockResponse = await fetchMockDashboardData('INSTITUTIONAL_BUYER');
      if (mockResponse.success) {
        setDashboardData(mockResponse.data);
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      
      // Fallback to mock data on error
      console.log('Falling back to mock data due to error');
      const mockResponse = await fetchMockDashboardData('INSTITUTIONAL_BUYER');
      if (mockResponse.success) {
        setDashboardData(mockResponse.data);
      }
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchDashboardData(); }, []);

  const {
    handleNewTender,
    handleManageContracts,
    handleCheckCompliance,
    handleReviewSupplier,
    handleGenerateReport,
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

  if (loading) return <LoadingSpinner />;

  return (
    <div className="institutional-buyer-dashboard">
      <div className="dashboard-header">
        <h1>🏛️ Institutional Buyer Dashboard</h1>
        <Button variant="primary" onClick={handleNewTender}>New Tender</Button>
      </div>

      <div className="dashboard-grid">
        {/* Contract Overview */}
        <Card>
          <div className="card-header">
            <h3>📋 Contract Overview</h3>
            <Button size="small" onClick={handleManageContracts}>Manage Contracts</Button>
          </div>
          <div className="contract-stats">
            <div className="contract-metric">
              <div className="metric-value">{dashboardData?.contract_stats?.active || 0}</div>
              <div className="metric-label">Active Contracts</div>
            </div>
            <div className="contract-metric">
              <div className="metric-value">{dashboardData?.contract_stats?.pending || 0}</div>
              <div className="metric-label">Pending</div>
            </div>
            <div className="contract-metric">
              <div className="metric-value">{dashboardData?.contract_stats?.expiring || 0}</div>
              <div className="metric-label">Expiring Soon</div>
            </div>
          </div>
        </Card>

        {/* Professional Network */}
        <Card className="network-card">
          <div className="card-header">
            <h3>🌐 Supplier Network</h3>
            <Button 
              size="small"
              onClick={() => setShowUserDirectory(true)}
            >
              Find Suppliers
            </Button>
          </div>
          <div className="network-preview">
            <p>Connect with certified suppliers and farmers</p>
            <div className="quick-stats">
              <span>🌾 89+ Farmers</span>
              <span>🏭 45+ Suppliers</span>
              <span>🤝 34+ Partners</span>
            </div>
          </div>
        </Card>

        {/* Tender Management */}
        <Card>
          <div className="card-header">
            <h3>📝 Tender Management</h3>
            <Button size="small" onClick={handleNewTender}>New Tender</Button>
          </div>
          {dashboardData?.active_tenders?.map(tender => (
            <div key={tender.id} className="tender-item">
              <span>{tender.title} - Due: {tender.deadline}</span>
              <Button size="small" onClick={() => handleNavigate(`/tenders/${tender.id}`)}>Manage</Button>
            </div>
          ))}
        </Card>

        {/* Budget Compliance */}
        <Card>
          <div className="card-header">
            <h3>💰 Budget Compliance</h3>
          </div>
          <BudgetTracker 
            budgets={dashboardData?.budgets || []}
            onBudgetAlert={(budget) => console.log('Budget alert:', budget)}
          />
          {dashboardData?.budget_alerts?.map(alert => (
            <div key={alert.id} className={`alert ${alert.severity}`}>
              <span>{alert.message}</span>
              <span>{alert.amount}</span>
            </div>
          ))}
        </Card>

        {/* Quality Assurance */}
        <Card>
          <div className="card-header">
            <h3>🔍 Quality Assurance</h3>
            <Button size="small" onClick={handleCheckCompliance}>Standards</Button>
          </div>
          <div className="quality-metrics">
            <div className="quality-metric">
              <div className="metric-value">{dashboardData?.quality_metrics?.compliance_rate}%</div>
              <div className="metric-label">Compliance Rate</div>
            </div>
            <div className="quality-metric">
              <div className="metric-value">{dashboardData?.quality_metrics?.inspections_passed}</div>
              <div className="metric-label">Inspections Passed</div>
            </div>
          </div>
        </Card>

        {/* Supplier Performance */}
        <Card>
          <div className="card-header">
            <h3>📊 Supplier Performance</h3>
          </div>
          {dashboardData?.supplier_performance?.map(supplier => (
            <div key={supplier.id} className="supplier-item">
              <span>{supplier.name} - Overall: {supplier.overall_score}%</span>
              <Button size="small" onClick={() => handleReviewSupplier(supplier.id)}>Review</Button>
            </div>
          ))}
        </Card>

        {/* Procurement Analytics */}
        <Card>
          <div className="card-header">
            <h3>📈 Procurement Analytics</h3>
          </div>
          <Button size="small" onClick={() => handleGenerateReport('monthly')}>Monthly Report</Button>
          <Button size="small" onClick={() => handleGenerateReport('quarterly')}>Quarterly Review</Button>
          <Button size="small" onClick={() => handleGenerateReport('annual')}>Annual Audit</Button>
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

export default InstitutionalBuyerDashboard;