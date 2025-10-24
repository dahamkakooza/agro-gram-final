// src/components/dashboards/farmer/CommercialFarmerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from "../../contexts/AuthContext.jsx";
import { Card, Button, LoadingSpinner, DataGrid, Chart } from '@agro-gram/ui';
import { useDashboardHandlers } from '../../hooks/useDashboardHandlers';
import UserDirectory from '../../common/UserDirectory';
import UserProfileModal from '../../common/UserProfileModal';
import ServiceRequestForm from '../../forms/ServiceRequestForm';
// FIXED IMPORT PATH
// TRY THIS IMPORT
import djangoClient from '../../api/djangoClient';
import './CommercialFarmerDashboard.css';

const CommercialFarmerDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFarm, setSelectedFarm] = useState('all');
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
      setLoading(true);
      setError(null);
      console.log('📊 Fetching commercial farmer dashboard data...');
      
      const response = await djangoClient.get('/api/v1/dashboard/farmer/commercial/');
      
      console.log('✅ Dashboard response:', response);
      
      if (response.data && response.data.success) {
        setDashboardData(response.data.data);
      } else {
        setDashboardData(response.data || {});
      }
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
      setError(error.message);
      
      setDashboardData({
        dashboard_type: "commercial_farmer",
        welcome_message: `Welcome, Commercial Farmer!`,
        enterprise_overview: {
          total_operations: 5,
          active_contracts: 3,
          production_volume: 15000
        },
        supply_chain: {
          suppliers: 8,
          distribution_channels: 3,
          logistics_partners: 2
        },
        business_intel: {
          market_share: "15%",
          growth_rate: "12%",
          customer_satisfaction: "94%"
        },
        stats: {
          total_farms: 3,
          total_employees: 45,
          monthly_revenue: 125000,
          profit_margin: 25.5
        },
        farms: [
          { id: 1, name: 'Main Farm' },
          { id: 2, name: 'North Fields' },
          { id: 3, name: 'South Estate' }
        ],
        operations: {
          active_harvests: 2,
          labor_count: 45,
          equipment_utilization: '78%',
          yield_per_hectare: '4.2t'
        },
        market_opportunities: [
          { id: 1, opportunity: 'Export to EU Market', potential_revenue: '$50,000', risk_level: 'Medium' },
          { id: 2, opportunity: 'Organic Certification', potential_revenue: '$25,000', risk_level: 'Low' },
          { id: 3, opportunity: 'New Crop Variety', potential_revenue: '$35,000', risk_level: 'High' }
        ],
        farm_performance: [
          { farm_name: 'Main Farm', crop_type: 'Corn', yield: '5.2', revenue: '$65,000', profitability: 'High', status: 'Active' },
          { farm_name: 'North Fields', crop_type: 'Soybeans', yield: '3.8', revenue: '$42,000', profitability: 'Medium', status: 'Active' },
          { farm_name: 'South Estate', crop_type: 'Wheat', yield: '4.1', revenue: '$38,000', profitability: 'Medium', status: 'Harvesting' }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const {
    handleHarvestPlanning,
    handleLaborManagement,
    handleEquipmentTracking,
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
        <p>Loading Commercial Farming Dashboard...</p>
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="dashboard-error">
        <h2>⚠️ Dashboard Error</h2>
        <p>{error}</p>
        <Button onClick={fetchDashboardData}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="commercial-farmer-dashboard">
      <div className="dashboard-header enterprise-header">
        <div className="header-content">
          <h1>🏭 Commercial Farming Enterprise</h1>
          <p>Multi-farm operational intelligence & business analytics</p>
          {error && (
            <div className="warning-banner">
              ⚠️ Using demo data: {error}
            </div>
          )}
          <div className="header-stats">
            <div className="stat">
              <span className="value">{dashboardData?.stats?.total_farms || dashboardData?.total_farms || 0}</span>
              <span className="label">Active Farms</span>
            </div>
            <div className="stat">
              <span className="value">${(dashboardData?.stats?.monthly_revenue || dashboardData?.total_revenue || 0)?.toLocaleString()}</span>
              <span className="label">Monthly Revenue</span>
            </div>
            <div className="stat">
              <span className="value">{dashboardData?.stats?.total_employees || 0}</span>
              <span className="label">Employees</span>
            </div>
          </div>
        </div>
        <div className="header-controls">
          <select 
            value={selectedFarm} 
            onChange={(e) => setSelectedFarm(e.target.value)}
            className="farm-selector"
          >
            <option value="all">All Farms</option>
            {dashboardData?.farms?.map(farm => (
              <option key={farm.id} value={farm.id}>{farm.name}</option>
            ))}
          </select>
          <Button 
            variant="primary"
            onClick={() => handleExport('pdf')}
          >
            Export Report
          </Button>
          <Button 
            variant="secondary"
            onClick={fetchDashboardData}
          >
            Refresh Data
          </Button>
        </div>
      </div>

      <div className="dashboard-grid">
        <Card className="operations-card full-width">
          <div className="card-header">
            <h3>🏭 Operations Command Center</h3>
            <div className="card-actions">
              <Button 
                size="small"
                onClick={handleHarvestPlanning}
              >
                Harvest Planning
              </Button>
              <Button 
                size="small"
                onClick={handleLaborManagement}
              >
                Labor Management
              </Button>
              <Button 
                size="small"
                onClick={handleEquipmentTracking}
              >
                Equipment Tracking
              </Button>
            </div>
          </div>
          <div className="operations-grid">
            <div className="operation-metric">
              <div className="metric-value">{dashboardData?.operations?.active_harvests || 0}</div>
              <div className="metric-label">Active Harvests</div>
            </div>
            <div className="operation-metric">
              <div className="metric-value">{dashboardData?.operations?.labor_count || 0}</div>
              <div className="metric-label">Labor Force</div>
            </div>
            <div className="operation-metric">
              <div className="metric-value">{dashboardData?.operations?.equipment_utilization || '0%'}</div>
              <div className="metric-label">Equipment Utilization</div>
            </div>
            <div className="operation-metric">
              <div className="metric-value">{dashboardData?.operations?.yield_per_hectare || '0t'}</div>
              <div className="metric-label">Yield/Hectare</div>
            </div>
          </div>
        </Card>

        <Card className="supply-chain-card">
          <div className="card-header">
            <h3>🔗 Supply Chain Management</h3>
          </div>
          <div className="supply-chain-visual">
            <div className="chain-stage">
              <div className="stage-icon">🌱</div>
              <div className="stage-label">Input</div>
              <div className="stage-status active">Active</div>
            </div>
            <div className="chain-arrow">→</div>
            <div className="chain-stage">
              <div className="stage-icon">🏭</div>
              <div className="stage-label">Production</div>
              <div className="stage-status active">Active</div>
            </div>
            <div className="chain-arrow">→</div>
            <div className="chain-stage">
              <div className="stage-icon">🚚</div>
              <div className="stage-label">Logistics</div>
              <div className="stage-status pending">Pending</div>
            </div>
            <div className="chain-arrow">→</div>
            <div className="chain-stage">
              <div className="stage-icon">🏪</div>
              <div className="stage-label">Market</div>
              <div className="stage-status upcoming">Upcoming</div>
            </div>
          </div>
          <div className="supply-chain-stats">
            <div className="supply-stat">
              <strong>{dashboardData?.supply_chain?.suppliers || 8}</strong> Suppliers
            </div>
            <div className="supply-stat">
              <strong>{dashboardData?.supply_chain?.distribution_channels || 3}</strong> Channels
            </div>
            <div className="supply-stat">
              <strong>{dashboardData?.supply_chain?.logistics_partners || 2}</strong> Logistics Partners
            </div>
          </div>
        </Card>

        <Card className="business-intel-card">
          <div className="card-header">
            <h3>📈 Business Intelligence</h3>
          </div>
          <div className="profit-metrics">
            <div className="profit-metric">
              <div className="metric-label">Market Share</div>
              <div className="metric-value">{dashboardData?.business_intel?.market_share || '15%'}</div>
            </div>
            <div className="profit-metric">
              <div className="metric-label">Growth Rate</div>
              <div className="metric-value">{dashboardData?.business_intel?.growth_rate || '12%'}</div>
            </div>
            <div className="profit-metric">
              <div className="metric-label">Customer Satisfaction</div>
              <div className="metric-value">{dashboardData?.business_intel?.customer_satisfaction || '94%'}</div>
            </div>
          </div>
          <div className="profit-metrics">
            <div className="profit-metric">
              <div className="metric-label">Gross Profit</div>
              <div className="metric-value">${dashboardData?.business_intel?.gross_profit?.toLocaleString() || '85,000'}</div>
              <div className="metric-change positive">+15.2%</div>
            </div>
            <div className="profit-metric">
              <div className="metric-label">Operating Costs</div>
              <div className="metric-value">${dashboardData?.business_intel?.operating_costs?.toLocaleString() || '40,000'}</div>
              <div className="metric-change negative">+8.1%</div>
            </div>
            <div className="profit-metric">
              <div className="metric-label">Net Profit Margin</div>
              <div className="metric-value">{dashboardData?.stats?.profit_margin || dashboardData?.business_intel?.profit_margin || '22.5'}%</div>
              <div className="metric-change positive">+2.3%</div>
            </div>
          </div>
        </Card>

        <Card className="enterprise-card">
          <div className="card-header">
            <h3>🏢 Enterprise Overview</h3>
          </div>
          <div className="enterprise-stats">
            <div className="enterprise-stat">
              <div className="stat-value">{dashboardData?.enterprise_overview?.total_operations || 5}</div>
              <div className="stat-label">Total Operations</div>
            </div>
            <div className="enterprise-stat">
              <div className="stat-value">{dashboardData?.enterprise_overview?.active_contracts || 3}</div>
              <div className="stat-label">Active Contracts</div>
            </div>
            <div className="enterprise-stat">
              <div className="stat-value">{dashboardData?.enterprise_overview?.production_volume?.toLocaleString() || '15,000'}</div>
              <div className="stat-label">Production Volume</div>
            </div>
          </div>
        </Card>

        <Card className="ecosystem-card">
          <div className="card-header">
            <h3>🌐 Ecosystem Network</h3>
            <Button 
              size="small"
              onClick={() => setShowUserDirectory(true)}
            >
              Browse Network
            </Button>
          </div>
          <div className="network-preview">
            <p>Connect with other professionals in the Agro-Gram ecosystem</p>
            <div className="quick-stats">
              <span>👥 245+ Farmers</span>
              <span>🏪 89+ Suppliers</span>
              <span>💼 34+ Advisors</span>
            </div>
          </div>
        </Card>

        <Card className="opportunities-card">
          <div className="card-header">
            <h3>🎯 Market Opportunities</h3>
          </div>
          <DataGrid
            data={dashboardData?.market_opportunities || []}
            columns={[
              { key: 'opportunity', header: 'Opportunity' },
              { key: 'potential_revenue', header: 'Potential Revenue' },
              { key: 'risk_level', header: 'Risk' },
              { 
                key: 'action', 
                header: 'Action', 
                render: (value, row) => (
                  <Button 
                    size="small"
                    onClick={() => handleNavigate(`/opportunities/${row.id}`)}
                  >
                    Explore
                  </Button>
                )
              }
            ]}
          />
        </Card>

        <Card className="farms-performance-card full-width">
          <div className="card-header">
            <h3>🏘️ Multi-Farm Performance</h3>
          </div>
          <DataGrid
            data={dashboardData?.farm_performance || []}
            columns={[
              { key: 'farm_name', header: 'Farm Name' },
              { key: 'crop_type', header: 'Main Crop' },
              { key: 'yield', header: 'Yield (t/ha)' },
              { key: 'revenue', header: 'Revenue' },
              { key: 'profitability', header: 'Profitability' },
              { key: 'status', header: 'Status' }
            ]}
          />
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

export default CommercialFarmerDashboard;