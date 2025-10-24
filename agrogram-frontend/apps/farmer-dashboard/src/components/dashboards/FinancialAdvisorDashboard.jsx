// src/components/dashboards/agent/FinancialAdvisorDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from "../../contexts/AuthContext.jsx";
import { Card, Button, LoadingSpinner } from '@agro-gram/ui';
import { useDashboardHandlers } from '../../hooks/useDashboardHandlers';
import UserDirectory from '../../common/UserDirectory';
import UserProfileModal from '../../common/UserProfileModal';
import ServiceRequestForm from '../../forms/ServiceRequestForm';
import { fetchMockDashboardData } from '../../data/mockDashboardData';
import { dashboardAPI } from '../../services/services';
import './FinancialAdvisorDashboard.css';

const FinancialAdvisorDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showUserDirectory, setShowUserDirectory] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [serviceRequest, setServiceRequest] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const response = await dashboardAPI.getFinancialAdvisorDashboard();
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setDashboardData(data.data);
          return;
        }
      }
      
      console.log('Using mock data for development');
      const mockResponse = await fetchMockDashboardData('FINANCIAL_ADVISOR');
      if (mockResponse.success) {
        setDashboardData(mockResponse.data);
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      
      console.log('Falling back to mock data due to error');
      const mockResponse = await fetchMockDashboardData('FINANCIAL_ADVISOR');
      if (mockResponse.success) {
        setDashboardData(mockResponse.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const {
    handleNewLoanApplication,
    handleGenerateReport,
    handleProcessApplication,
    handleReviewCase,
    handleAssessNew,
    handleDevelopProduct,
    handleNavigate,
  } = useDashboardHandlers(dashboardData, fetchDashboardData, setDashboardData, setLoading);

  useEffect(() => {
    fetchDashboardData();
  }, []);

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
    <div className="dashboard financial-advisor-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>💰 Financial Advisor Dashboard</h1>
          <p>Agricultural financial services and farmer financial health management</p>
          <div className="header-stats">
            <div className="stat">
              <span className="value">${dashboardData?.portfolio_stats?.total_loans?.toLocaleString() || '0'}</span>
              <span className="label">Loan Portfolio</span>
            </div>
            <div className="stat">
              <span className="value">{dashboardData?.portfolio_stats?.active_loans || 0}</span>
              <span className="label">Active Loans</span>
            </div>
            <div className="stat">
              <span className="value">{dashboardData?.portfolio_stats?.default_rate || '0'}%</span>
              <span className="label">Default Rate</span>
            </div>
          </div>
        </div>
        <div className="header-actions">
          <Button 
            variant="primary"
            onClick={handleNewLoanApplication}
          >
            New Loan Application
          </Button>
        </div>
      </div>

      <div className="dashboard-grid">
        <Card className="portfolio-card full-width">
          <div className="card-header">
            <h3>📊 Financial Portfolio Overview</h3>
            <Button 
              size="small"
              onClick={() => handleGenerateReport('financial')}
            >
              Generate Report
            </Button>
          </div>
          <div className="portfolio-summary">
            <div className="portfolio-metric">
              <div className="metric-value">${dashboardData?.portfolio_stats?.total_loans?.toLocaleString() || '0'}</div>
              <div className="metric-label">Total Loan Portfolio</div>
            </div>
            <div className="portfolio-metric">
              <div className="metric-value">{dashboardData?.portfolio_stats?.active_loans || 0}</div>
              <div className="metric-label">Active Loans</div>
            </div>
            <div className="portfolio-metric">
              <div className="metric-value">{dashboardData?.portfolio_stats?.default_rate || '0'}%</div>
              <div className="metric-label">Default Rate</div>
            </div>
            <div className="portfolio-metric">
              <div className="metric-value">{dashboardData?.portfolio_stats?.recovery_rate || '0'}%</div>
              <div className="metric-label">Recovery Rate</div>
            </div>
          </div>
        </Card>

        <Card className="loan-management-card">
          <div className="card-header">
            <h3>📝 Loan Management</h3>
            <Button 
              size="small"
              onClick={handleProcessApplication}
            >
              Process Applications
            </Button>
          </div>
          <div className="application-pipeline">
            <h4>Application Pipeline</h4>
            {dashboardData?.loan_applications?.map(application => (
              <div key={application.id} className="application-item">
                <div className="applicant-name">{application.farmer_name}</div>
                <div className="loan-amount">${application.amount}</div>
                <div className={`application-status ${application.status.toLowerCase()}`}>
                  {application.status}
                </div>
                <Button 
                  size="small"
                  onClick={() => handleReviewCase(application.id)}
                >
                  Review
                </Button>
              </div>
            ))}
          </div>
          <div className="active-loan-monitoring">
            <h4>Active Loan Monitoring</h4>
            {dashboardData?.active_loans?.map(loan => (
              <div key={loan.id} className="loan-item">
                <div className="loan-details">
                  <strong>{loan.farmer_name}</strong>
                  <span>Balance: ${loan.remaining_balance}</span>
                  <span>Next Payment: {loan.next_payment_date}</span>
                </div>
                <div className={`loan-status ${loan.status}`}>{loan.status}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="risk-card">
          <div className="card-header">
            <h3>⚖️ Risk Assessment</h3>
            <Button 
              size="small"
              onClick={handleAssessNew}
            >
              Assess New
            </Button>
          </div>
          <div className="credit-scoring">
            <h4>Credit Scoring</h4>
            {dashboardData?.credit_scores?.map(score => (
              <div key={score.farmer_id} className="credit-item">
                <div className="farmer-name">{score.farmer_name}</div>
                <div className="credit-score">{score.score}/100</div>
                <div className={`risk-level ${score.risk_level}`}>{score.risk_level}</div>
              </div>
            ))}
          </div>
          <div className="collateral-valuation">
            <h4>Collateral Valuation</h4>
            {dashboardData?.collateral_valuations?.map(collateral => (
              <div key={collateral.id} className="collateral-item">
                <div className="asset-type">{collateral.asset_type}</div>
                <div className="valuation">${collateral.valuation}</div>
                <div className="coverage">{collateral.coverage}%</div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="ecosystem-card">
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
            <p>Connect with farmers and agricultural businesses</p>
            <div className="quick-stats">
              <span>🌾 156+ Farmers</span>
              <span>🏭 45+ Businesses</span>
              <span>🤝 23+ Partners</span>
            </div>
          </div>
        </Card>

        <Card className="products-card">
          <div className="card-header">
            <h3>💳 Financial Products</h3>
            <Button 
              size="small"
              onClick={handleDevelopProduct}
            >
              Develop New
            </Button>
          </div>
          <div className="product-performance">
            <h4>Product Performance</h4>
            {dashboardData?.financial_products?.map(product => (
              <div key={product.id} className="product-item">
                <div className="product-name">{product.name}</div>
                <div className="product-stats">
                  <span>Uptake: {product.uptake_rate}%</span>
                  <span>Default: {product.default_rate}%</span>
                </div>
                <div className="product-rating">⭐ {product.performance_rating}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="impact-card">
          <div className="card-header">
            <h3>📈 Impact Analytics</h3>
          </div>
          <div className="farmer-success-tracking">
            <h4>Farmer Success Tracking</h4>
            {dashboardData?.farmer_success?.map(farmer => (
              <div key={farmer.id} className="success-item">
                <div className="farmer-name">{farmer.name}</div>
                <div className="success-metrics">
                  <span>Revenue Growth: {farmer.revenue_growth}%</span>
                  <span>Yield Increase: {farmer.yield_increase}%</span>
                </div>
                <div className="impact-score">{farmer.impact_score}/10</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

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

      <UserProfileModal
        user={selectedUser}
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onMessage={handleMessageUser}
        onRequestService={handleServiceRequest}
      />

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

export default FinancialAdvisorDashboard;