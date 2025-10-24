import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI, marketplaceAPI, cartAPI } from '@agro-gram/api';
import LoadingSpinner from '../UI/LoadingSpinner';
import './ConsumerDashboard.css';

const ConsumerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [cart, setCart] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Use the correct function name from services.js
      const [dashboardResponse, cartResponse, ordersResponse] = await Promise.allSettled([
        userAPI.getConsumerDashboard(), // This is the correct function name
        cartAPI.getCart(),
        marketplaceAPI.getOrders({ status: 'PENDING,CONFIRMED,DELIVERED', limit: 5 })
      ]);

      let dashboardData = getDefaultStats();
      let cartData = null;
      let ordersData = [];

      // Process dashboard response
      if (dashboardResponse.status === 'fulfilled' && dashboardResponse.value?.success) {
        dashboardData = dashboardResponse.value.data || dashboardResponse.value;
        if (dashboardResponse.value.recent_orders) {
          ordersData = dashboardResponse.value.recent_orders;
        }
      } else {
        console.warn('Dashboard API failed, using default stats');
        // If the API call failed, provide more specific error
        if (dashboardResponse.status === 'rejected') {
          console.error('Dashboard API rejection:', dashboardResponse.reason);
        }
      }

      // Process cart response
      if (cartResponse.status === 'fulfilled' && cartResponse.value?.success) {
        cartData = cartResponse.value.data || cartResponse.value.cart || cartResponse.value;
      } else {
        console.warn('Cart API failed, cart data unavailable');
      }

      // Process orders response if needed
      if (ordersResponse.status === 'fulfilled' && ordersResponse.value?.success && ordersData.length === 0) {
        ordersData = ordersResponse.value.data?.results || ordersResponse.value.data || ordersResponse.value.orders || [];
      }

      setStats(dashboardData);
      setCart(cartData);
      setRecentOrders(Array.isArray(ordersData) ? ordersData : []);

    } catch (error) {
      console.error('Error fetching consumer dashboard:', error);
      setError('Failed to load dashboard data. Please try refreshing.');
      setStats(getDefaultStats());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultStats = () => ({
    cart_items: 0,
    cart_total: 0,
    total_orders: 0,
    completed_orders: 0,
    pending_orders: 0,
    profile_completion: 0,
    role: 'consumer'
  });

  const handleBrowseMarketplace = () => {
    navigate('/marketplace');
  };

  const handleViewCart = () => {
    navigate('/cart');
  };

  const handleViewOrders = () => {
    navigate('/orders');
  };

  const handleRetry = () => {
    fetchDashboardData();
  };

  // If the API function doesn't exist, show a fallback UI
  if (loading) {
    return (
      <div className="dashboard-loading">
        <LoadingSpinner size="large" />
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="consumer-dashboard">
      <div className="dashboard__header">
        <div className="header-content">
          <h1>Consumer Dashboard</h1>
          <p>Welcome to your agricultural shopping hub</p>
        </div>
        <div className="dashboard__actions">
          <button className="btn btn-primary" onClick={handleBrowseMarketplace}>
            Browse Marketplace
          </button>
          <button className="btn btn-outline" onClick={handleViewCart}>
            View Cart ({stats?.cart_items || 0})
          </button>
        </div>
      </div>

      {error && (
        <div className="dashboard-error">
          <div className="error-content">
            <p>{error}</p>
            <button className="btn btn-outline" onClick={handleRetry}>
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Stats Overview */}
      <div className="dashboard__stats">
        <div className="stat-card">
          <div className="stat-card__content">
            <div className="stat-card__icon">🛒</div>
            <div className="stat-card__info">
              <h3>{stats?.cart_items || 0}</h3>
              <p>Cart Items</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__content">
            <div className="stat-card__icon">📦</div>
            <div className="stat-card__info">
              <h3>{stats?.total_orders || 0}</h3>
              <p>Total Orders</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__content">
            <div className="stat-card__icon">✅</div>
            <div className="stat-card__info">
              <h3>{stats?.completed_orders || 0}</h3>
              <p>Completed Orders</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__content">
            <div className="stat-card__icon">📊</div>
            <div className="stat-card__info">
              <h3>{Math.round(stats?.profile_completion || 0)}%</h3>
              <p>Profile Complete</p>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard__grid">
        {/* Cart Summary */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Shopping Cart</h3>
            {cart && !cart.is_empty && (
              <span className="card-badge">{cart.items?.length || 0} items</span>
            )}
          </div>
          {cart && !cart.is_empty ? (
            <div className="cart-summary">
              <div className="cart-items">
                {(cart.items || []).slice(0, 3).map((item, index) => (
                  <div key={item.id || index} className="cart-item">
                    <div className="cart-item__info">
                      <h5>{item.product_title || 'Product'}</h5>
                      <p>{item.quantity || 0} x ${item.product_price || 0}</p>
                    </div>
                    <div className="cart-item__total">
                      ${(item.total_price || 0).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="cart-total">
                <strong>Subtotal: ${(cart.subtotal || 0).toFixed(2)}</strong>
              </div>
              <button className="btn btn-primary full-width" onClick={handleViewCart}>
                Go to Cart
              </button>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🛒</div>
              <p>Your cart is empty</p>
              <button className="btn btn-outline" onClick={handleBrowseMarketplace}>
                Start Shopping
              </button>
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Recent Orders</h3>
            {recentOrders.length > 0 && (
              <span className="card-badge">{recentOrders.length} orders</span>
            )}
          </div>
          {recentOrders.length > 0 ? (
            <div className="orders-list">
              {recentOrders.slice(0, 5).map((order, index) => (
                <div key={order.id || index} className="order-item">
                  <div className="order-item__info">
                    <h5>{order.product_title || 'Product'}</h5>
                    <p>Qty: {order.quantity || 0} • ${(order.total_price || 0).toFixed(2)}</p>
                    <span className={`status-badge status-${(order.status || 'PENDING').toLowerCase()}`}>
                      {order.status || 'PENDING'}
                    </span>
                  </div>
                  <small>{order.created_at ? new Date(order.created_at).toLocaleDateString() : 'Recent'}</small>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <p>No recent orders</p>
              <button className="btn btn-outline small" onClick={handleBrowseMarketplace}>
                Make Your First Order
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dashboard-card">
        <div className="card-header">
          <h3>Quick Actions</h3>
        </div>
        <div className="actions-grid">
          <button className="action-button" onClick={handleBrowseMarketplace}>
            <span className="action-icon">🛒</span>
            <span>Browse Products</span>
          </button>
          <button className="action-button" onClick={handleViewOrders}>
            <span className="action-icon">📦</span>
            <span>My Orders</span>
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

      {/* Market Insights */}
      <div className="dashboard-card">
        <div className="card-header">
          <h3>Market Insights</h3>
        </div>
        <div className="insights-content">
          <div className="insight-item">
            <div className="insight-icon">🌱</div>
            <div className="insight-text">
              <h4>Fresh Produce Available</h4>
              <p>Browse our selection of farm-fresh vegetables and fruits</p>
            </div>
          </div>
          <div className="insight-item">
            <div className="insight-icon">💰</div>
            <div className="insight-text">
              <h4>Best Prices</h4>
              <p>Get competitive prices directly from farmers</p>
            </div>
          </div>
          <div className="insight-item">
            <div className="insight-icon">🚚</div>
            <div className="insight-text">
              <h4>Fast Delivery</h4>
              <p>Quick and reliable delivery to your location</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsumerDashboard;