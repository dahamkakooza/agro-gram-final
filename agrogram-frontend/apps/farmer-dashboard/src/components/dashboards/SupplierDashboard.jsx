import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI, marketplaceAPI } from '@agro-gram/api';
import LoadingSpinner from '../UI/LoadingSpinner';
import './SupplierDashboard.css';

const SupplierDashboard = () => {
  const [stats, setStats] = useState(null);
  const [myProducts, setMyProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const [dashboardResponse, productsResponse] = await Promise.allSettled([
        userAPI.getSupplierDashboard(),
        marketplaceAPI.getMyProducts()
      ]);

      if (dashboardResponse.status === 'fulfilled' && dashboardResponse.value?.success) {
        setStats(dashboardResponse.value.data);
      } else {
        setStats(getDefaultStats());
      }

      if (productsResponse.status === 'fulfilled' && productsResponse.value?.success) {
        setMyProducts(productsResponse.value.my_products || productsResponse.value.data || []);
      }

    } catch (error) {
      console.error('Error fetching supplier dashboard:', error);
      setStats(getDefaultStats());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultStats = () => ({
    total_products: 0,
    active_products: 0,
    sold_products: 0,
    total_orders: 0,
    completed_orders: 0,
    total_revenue: 0,
    customer_count: 0,
    profile_completion: 0,
    business_rating: 0,
    role: 'supplier'
  });

  const handleAddProduct = () => {
    navigate('/marketplace/supplier?action=add-product');
  };

  const handleViewProducts = () => {
    navigate('/marketplace/supplier?view=my-products');
  };

  const handleViewAnalytics = () => {
    navigate('/supplier/analytics');
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <LoadingSpinner size="large" />
        <p>Loading your supplier dashboard...</p>
      </div>
    );
  }

  return (
    <div className="supplier-dashboard">
      <div className="dashboard__header">
        <h1>Supplier Dashboard</h1>
        <div className="dashboard__actions">
          <button className="btn-primary" onClick={handleAddProduct}>
            Add Product
          </button>
          <button className="btn-outline" onClick={handleViewAnalytics}>
            View Analytics
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="dashboard__stats">
        <div className="stat-card">
          <div className="stat-card__content">
            <div className="stat-card__icon">📦</div>
            <div className="stat-card__info">
              <h3>{stats?.total_products || 0}</h3>
              <p>Total Products</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__content">
            <div className="stat-card__icon">🛒</div>
            <div className="stat-card__info">
              <h3>{stats?.active_products || 0}</h3>
              <p>Active Listings</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__content">
            <div className="stat-card__icon">💰</div>
            <div className="stat-card__info">
              <h3>${stats?.total_revenue || 0}</h3>
              <p>Total Revenue</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__content">
            <div className="stat-card__icon">⭐</div>
            <div className="stat-card__info">
              <h3>{stats?.business_rating?.toFixed(1) || '0.0'}</h3>
              <p>Business Rating</p>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard__grid">
        {/* My Products */}
        <div className="card">
          <h3>My Products</h3>
          {myProducts.length > 0 ? (
            <div className="products-list">
              {myProducts.slice(0, 3).map(product => (
                <div key={product.id} className="product-item">
                  <div className="product-item__info">
                    <h5>{product.title}</h5>
                    <p>${product.price} • {product.quantity} {product.unit}</p>
                    <span className={`status-badge status-${product.status.toLowerCase()}`}>
                      {product.status}
                    </span>
                  </div>
                  <div className="product-item__actions">
                    <button className="btn-outline small">
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-products">
              <p>You haven't listed any products yet.</p>
              <button className="btn-primary small" onClick={handleAddProduct}>
                Add Your First Product
              </button>
            </div>
          )}
          
          {myProducts.length > 3 && (
            <div className="products-overview__footer">
              <button className="btn-outline small" onClick={handleViewProducts}>
                View All Products
              </button>
            </div>
          )}
        </div>

        {/* Business Metrics */}
        <div className="card">
          <h3>Business Metrics</h3>
          <div className="metrics-list">
            <div className="metric-item">
              <span className="metric-label">Completed Orders:</span>
              <span className="metric-value">{stats?.completed_orders || 0}</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Total Customers:</span>
              <span className="metric-value">{stats?.customer_count || 0}</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Products Sold:</span>
              <span className="metric-value">{stats?.sold_products || 0}</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Profile Completion:</span>
              <span className="metric-value">{Math.round(stats?.profile_completion || 0)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3>Quick Actions</h3>
        <div className="actions-grid">
          <button className="action-button" onClick={handleAddProduct}>
            <span className="action-icon">➕</span>
            <span>Add Product</span>
          </button>
          <button className="action-button" onClick={handleViewProducts}>
            <span className="action-icon">📦</span>
            <span>Manage Products</span>
          </button>
          <button className="action-button" onClick={() => navigate('/price-predictions')}>
            <span className="action-icon">📈</span>
            <span>Price Predictions</span>
          </button>
          <button className="action-button" onClick={() => navigate('/ai-assistant')}>
            <span className="action-icon">🤖</span>
            <span>AI Assistant</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SupplierDashboard;