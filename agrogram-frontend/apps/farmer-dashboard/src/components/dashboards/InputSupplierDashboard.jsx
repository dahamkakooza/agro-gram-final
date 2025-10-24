// src/components/dashboards/supplier/InputSupplierDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from "../../contexts/AuthContext.jsx";
import { Card, Button, LoadingSpinner, InventoryManager, SalesAnalytics } from '@agro-gram/ui';
import { useDashboardHandlers } from '../../hooks/useDashboardHandlers';
import UserDirectory from '../../common/UserDirectory';
import UserProfileModal from '../../common/UserProfileModal';
import ServiceRequestForm from '../../forms/ServiceRequestForm';
import { fetchMockDashboardData } from '../../data/mockDashboardData';
import './InputSupplierDashboard.css';

const InputSupplierDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('overview');
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
  //     const response = await fetch('/api/dashboard/supplier/input/');
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
      const response = await fetch('/api/dashboard/supplier/input/');
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setDashboardData(data.data);
          return;
        }
      }
      
      // Fallback to mock data
      console.log('Using mock data for development');
      const mockResponse = await fetchMockDashboardData('INPUT_SUPPLIER');
      if (mockResponse.success) {
        setDashboardData(mockResponse.data);
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      
      // Fallback to mock data on error
      console.log('Falling back to mock data due to error');
      const mockResponse = await fetchMockDashboardData('INPUT_SUPPLIER');
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
    <div className="dashboard input-supplier-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>🌱 Input Supplier Dashboard</h1>
          <p>Agricultural input sales optimization and inventory management</p>
        </div>
        <div className="header-actions">
          <Button variant="primary">New Product</Button>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button 
          className={`tab ${activeView === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveView('overview')}
        >
          Business Overview
        </button>
        <button 
          className={`tab ${activeView === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveView('inventory')}
        >
          Inventory
        </button>
        <button 
          className={`tab ${activeView === 'sales' ? 'active' : ''}`}
          onClick={() => setActiveView('sales')}
        >
          Sales Intelligence
        </button>
        <button 
          className={`tab ${activeView === 'customers' ? 'active' : ''}`}
          onClick={() => setActiveView('customers')}
        >
          Customer Relations
        </button>
      </div>

      <div className="dashboard-content">
        {activeView === 'overview' && (
          <div className="tab-content">
            {/* Inventory & Sales Snapshot */}
            <Card className="snapshot-card full-width">
              <div className="card-header">
                <h3>📊 Inventory & Sales Snapshot</h3>
                <Button size="small">Refresh Data</Button>
              </div>
              <div className="business-metrics">
                <div className="business-metric">
                  <div className="metric-value">${dashboardData?.business_overview?.daily_sales?.toLocaleString()}</div>
                  <div className="metric-label">Daily Sales</div>
                </div>
                <div className="business-metric">
                  <div className="metric-value">{dashboardData?.business_overview?.low_stock_items}</div>
                  <div className="metric-label">Low Stock Items</div>
                </div>
                <div className="business-metric">
                  <div className="metric-value">{dashboardData?.business_overview?.pending_orders}</div>
                  <div className="metric-label">Pending Orders</div>
                </div>
                <div className="business-metric">
                  <div className="metric-value">{dashboardData?.business_overview?.customer_requests}</div>
                  <div className="metric-label">Customer Requests</div>
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
                  Find Customers
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

            {/* Product Management */}
            <Card className="products-card">
              <div className="card-header">
                <h3>📦 Product Management</h3>
                <Button size="small">Add Product</Button>
              </div>
              <div className="product-categories">
                <h4>Top Categories</h4>
                {dashboardData?.product_categories?.map(category => (
                  <div key={category.id} className="category-item">
                    <div className="category-name">{category.name}</div>
                    <div className="category-stats">
                      <span>Stock: {category.stock_level}</span>
                      <span>Sales: {category.sales_count}</span>
                    </div>
                    <div className="category-trend">
                      <span className={`trend ${category.trend}`}>
                        {category.trend === 'up' ? '↑' : '↓'} {category.growth}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pricing-strategy">
                <h4>Pricing Strategy</h4>
                <div className="strategy-actions">
                  <Button size="small" variant="outline">Adjust Prices</Button>
                  <Button size="small" variant="outline">Promotions</Button>
                </div>
              </div>
            </Card>

            {/* Market Position */}
            <Card className="market-position-card">
              <div className="card-header">
                <h3>🎯 Market Position</h3>
              </div>
              <div className="competitive-analysis">
                <h4>Competitive Analysis</h4>
                {dashboardData?.competitive_analysis?.map(competitor => (
                  <div key={competitor.id} className="competitor-item">
                    <div className="competitor-name">{competitor.name}</div>
                    <div className="competitor-rating">
                      <div className="rating-stars">
                        {'★'.repeat(competitor.rating)}{'☆'.repeat(5 - competitor.rating)}
                      </div>
                    </div>
                    <div className="market-share">{competitor.market_share}%</div>
                  </div>
                ))}
              </div>
              <div className="opportunity-identification">
                <h4>Growth Opportunities</h4>
                {dashboardData?.growth_opportunities?.map(opportunity => (
                  <div key={opportunity.id} className="opportunity-item">
                    <div className="opportunity-title">{opportunity.title}</div>
                    <div className="opportunity-potential">Potential: {opportunity.potential}</div>
                    <Button size="small">Explore</Button>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {activeView === 'inventory' && (
          <div className="tab-content">
            <InventoryManager 
              inventory={dashboardData?.inventory || []}
              locations={dashboardData?.locations || []}
              onReorder={(item) => console.log('Reorder:', item)}
              onTransfer={(item, location) => console.log('Transfer:', item, location)}
            />
          </div>
        )}

        {activeView === 'sales' && (
          <div className="tab-content">
            <SalesAnalytics 
              salesData={dashboardData?.sales_analytics || {}}
              trends={dashboardData?.sales_trends || []}
              onInsight={(insight) => console.log('Insight:', insight)}
            />
          </div>
        )}

        {activeView === 'customers' && (
          <div className="tab-content">
            <Card className="customer-relations-card full-width">
              <div className="card-header">
                <h3>👥 Customer Relations</h3>
                <Button size="small">Service Requests</Button>
              </div>
              <div className="customer-metrics">
                <div className="customer-metric">
                  <div className="metric-value">{dashboardData?.customer_metrics?.total_customers}</div>
                  <div className="metric-label">Total Customers</div>
                </div>
                <div className="customer-metric">
                  <div className="metric-value">{dashboardData?.customer_metrics?.repeat_customers}</div>
                  <div className="metric-label">Repeat Customers</div>
                </div>
                <div className="customer-metric">
                  <div className="metric-value">{dashboardData?.customer_metrics?.satisfaction_rate}%</div>
                  <div className="metric-label">Satisfaction Rate</div>
                </div>
              </div>
              <div className="order-history">
                <h4>Recent Order History</h4>
                {dashboardData?.recent_orders?.map(order => (
                  <div key={order.id} className="order-item">
                    <div className="customer-name">{order.customer_name}</div>
                    <div className="order-details">
                      <span>{order.product}</span>
                      <span>Qty: {order.quantity}</span>
                    </div>
                    <div className="order-total">${order.total}</div>
                    <Button size="small">Follow Up</Button>
                  </div>
                ))}
              </div>
              <div className="service-requests">
                <h4>Service Requests</h4>
                {dashboardData?.service_requests?.map(request => (
                  <div key={request.id} className="request-item">
                    <div className="request-type">{request.type}</div>
                    <div className="request-customer">{request.customer}</div>
                    <div className="request-status">{request.status}</div>
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

export default InputSupplierDashboard;