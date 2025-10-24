// src/components/dashboards/consumer/RestaurantBusinessDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from "../../contexts/AuthContext.jsx";
import { Card, Button, LoadingSpinner, DataGrid, InventoryTracker, POSIntegration } from '@agro-gram/ui';
import { useDashboardHandlers } from '../../hooks/useDashboardHandlers';
import UserDirectory from '../../common/UserDirectory';
import UserProfileModal from '../../common/UserProfileModal';
import ServiceRequestForm from '../../forms/ServiceRequestForm';
import { fetchMockDashboardData } from '../../data/mockDashboardData';
import './RestaurantBusinessDashboard.css';

const RestaurantBusinessDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('supply-chain');
  const [posSyncing, setPosSyncing] = useState(false);
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
  //     const response = await fetch('/api/dashboard/consumer/restaurant/');
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
      const response = await fetch('/api/dashboard/consumer/restaurant/');
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setDashboardData(data.data);
          return;
        }
      }
      
      // Fallback to mock data
      console.log('Using mock data for development');
      const mockResponse = await fetchMockDashboardData('RESTAURANT_BUSINESS');
      if (mockResponse.success) {
        setDashboardData(mockResponse.data);
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      
      // Fallback to mock data on error
      console.log('Falling back to mock data due to error');
      const mockResponse = await fetchMockDashboardData('RESTAURANT_BUSINESS');
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

  const handlePosSync = async () => {
    setPosSyncing(true);
    try {
      // Simulate POS sync
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('POS systems synchronized');
      // Add actual POS sync logic here
    } catch (error) {
      console.error('POS sync failed:', error);
    } finally {
      setPosSyncing(false);
    }
  };

  const handleOptimizeRoutes = () => {
    console.log('Optimizing supply chain routes...');
    // Add route optimization logic
  };

  const handleCreateTemplate = () => {
    console.log('Creating new order template...');
    // Navigate to template creation or open modal
  };

  const handleUseTemplate = (templateId) => {
    console.log('Using template:', templateId);
    // Implement template usage logic
  };

  const handleCostAnalysis = () => {
    console.log('Running menu cost analysis...');
    // Add cost analysis logic
  };

  const handleNewInspection = () => {
    console.log('Starting new quality inspection...');
    // Add inspection logic
  };

  const handleReorder = (item) => {
    console.log('Reordering item:', item);
    // Add reorder logic
  };

  const handleSourceIngredient = (ingredient) => {
    console.log('Sourcing ingredient:', ingredient);
    // Add sourcing logic
  };

  if (loading) {
    return <div className="dashboard-loading"><LoadingSpinner size="large" /></div>;
  }

  return (
    <div className="dashboard restaurant-business-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>🏪 Restaurant/Business Dashboard</h1>
          <p>Professional procurement platform with inventory integration</p>
        </div>
        <div className="header-integrations">
          <POSIntegration 
            systems={dashboardData?.pos_systems || []}
            onSync={handlePosSync}
            syncing={posSyncing}
          />
          <Button variant="primary" onClick={handleCreateTemplate}>
            Order Templates
          </Button>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button 
          className={`tab ${activeTab === 'supply-chain' ? 'active' : ''}`}
          onClick={() => setActiveTab('supply-chain')}
        >
          Supply Chain
        </button>
        <button 
          className={`tab ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          Inventory
        </button>
        <button 
          className={`tab ${activeTab === 'menu-planning' ? 'active' : ''}`}
          onClick={() => setActiveTab('menu-planning')}
        >
          Menu Planning
        </button>
        <button 
          className={`tab ${activeTab === 'quality' ? 'active' : ''}`}
          onClick={() => setActiveTab('quality')}
        >
          Quality Control
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'supply-chain' && (
          <div className="tab-content">
            {/* Supply Chain Overview */}
            <Card className="supply-chain-card full-width">
              <div className="card-header">
                <h3>🔗 Supply Chain Overview</h3>
                <Button size="small" onClick={handleOptimizeRoutes}>
                  Optimize Routes
                </Button>
              </div>
              <div className="supply-chain-map">
                <div className="chain-stage active">
                  <div className="stage-icon">🌱</div>
                  <div className="stage-info">
                    <h4>Farmers</h4>
                    <p>{dashboardData?.supply_chain?.farmers_count} active</p>
                  </div>
                </div>
                <div className="chain-arrow">→</div>
                <div className="chain-stage active">
                  <div className="stage-icon">🚚</div>
                  <div className="stage-info">
                    <h4>Logistics</h4>
                    <p>{dashboardData?.supply_chain?.deliveries_today} today</p>
                  </div>
                </div>
                <div className="chain-arrow">→</div>
                <div className="chain-stage">
                  <div className="stage-icon">🏪</div>
                  <div className="stage-info">
                    <h4>Your Business</h4>
                    <p>Inventory levels monitored</p>
                  </div>
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
                <p>Connect with farmers and food suppliers</p>
                <div className="quick-stats">
                  <span>🌾 89+ Farmers</span>
                  <span>🏭 34+ Suppliers</span>
                  <span>🤝 56+ Partners</span>
                </div>
              </div>
            </Card>

            {/* Procurement Center */}
            <Card className="procurement-card">
              <div className="card-header">
                <h3>📋 Procurement Center</h3>
                <Button size="small" onClick={handleCreateTemplate}>
                  New Template
                </Button>
              </div>
              <div className="order-templates">
                <h4>Order Templates</h4>
                {dashboardData?.order_templates?.map(template => (
                  <div key={template.id} className="template-item">
                    <div className="template-name">{template.name}</div>
                    <div className="template-items">{template.items_count} items</div>
                    <Button size="small" onClick={() => handleUseTemplate(template.id)}>
                      Use Template
                    </Button>
                  </div>
                ))}
              </div>
              <div className="supplier-management">
                <h4>Supplier Management</h4>
                <DataGrid
                  data={dashboardData?.suppliers || []}
                  columns={[
                    { key: 'name', header: 'Supplier' },
                    { key: 'rating', header: 'Rating' },
                    { key: 'reliability', header: 'Reliability' },
                    { key: 'last_delivery', header: 'Last Delivery' },
                    { key: 'action', header: 'Action', render: (row) => (
                      <Button size="small" onClick={() => console.log('View supplier:', row.id)}>
                        View
                      </Button>
                    )}
                  ]}
                />
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="tab-content">
            <InventoryTracker 
              inventory={dashboardData?.inventory || []}
              lowStockThreshold={10}
              onReorder={handleReorder}
            />
          </div>
        )}

        {activeTab === 'menu-planning' && (
          <div className="tab-content">
            <Card className="menu-planning-card full-width">
              <div className="card-header">
                <h3>📝 Menu Planning Tools</h3>
                <Button size="small" onClick={handleCostAnalysis}>
                  Cost Analysis
                </Button>
              </div>
              <div className="menu-costing">
                <h4>Current Menu Cost Analysis</h4>
                <div className="cost-metrics">
                  <div className="cost-metric">
                    <div className="metric-value">32%</div>
                    <div className="metric-label">Food Cost %</div>
                  </div>
                  <div className="cost-metric">
                    <div className="metric-value">$18.50</div>
                    <div className="metric-label">Avg. Plate Cost</div>
                  </div>
                  <div className="cost-metric">
                    <div className="metric-value">68%</div>
                    <div className="metric-label">Gross Margin</div>
                  </div>
                </div>
              </div>
              <div className="ingredient-sourcing">
                <h4>Ingredient Sourcing</h4>
                <DataGrid
                  data={dashboardData?.ingredient_sourcing || []}
                  columns={[
                    { key: 'ingredient', header: 'Ingredient' },
                    { key: 'current_supplier', header: 'Supplier' },
                    { key: 'cost', header: 'Cost' },
                    { key: 'alternatives', header: 'Alternatives' },
                    { key: 'action', header: 'Action', render: (row) => (
                      <Button size="small" onClick={() => handleSourceIngredient(row)}>
                        Source
                      </Button>
                    )}
                  ]}
                />
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'quality' && (
          <div className="tab-content">
            <Card className="quality-control-card full-width">
              <div className="card-header">
                <h3>🔍 Quality Control</h3>
                <Button size="small" onClick={handleNewInspection}>
                  New Inspection
                </Button>
              </div>
              <div className="quality-metrics">
                <div className="quality-metric">
                  <div className="metric-value">94%</div>
                  <div className="metric-label">Quality Score</div>
                </div>
                <div className="quality-metric">
                  <div className="metric-value">98%</div>
                  <div className="metric-label">On-time Delivery</div>
                </div>
                <div className="quality-metric">
                  <div className="metric-value">2</div>
                  <div className="metric-label">Issues This Week</div>
                </div>
              </div>
              <div className="supplier-ratings">
                <h4>Supplier Performance</h4>
                <DataGrid
                  data={dashboardData?.supplier_ratings || []}
                  columns={[
                    { key: 'supplier', header: 'Supplier' },
                    { key: 'quality_score', header: 'Quality' },
                    { key: 'delivery_score', header: 'Delivery' },
                    { key: 'communication_score', header: 'Communication' },
                    { key: 'overall_rating', header: 'Overall' },
                    { key: 'action', header: 'Action', render: (row) => (
                      <Button size="small" onClick={() => console.log('Review supplier:', row.id)}>
                        Review
                      </Button>
                    )}
                  ]}
                />
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

export default RestaurantBusinessDashboard;