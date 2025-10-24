import React, { useState, useEffect } from 'react';
import { marketplaceAPI } from '@agro-gram/api';
import { Card, Button, LoadingSpinner, Input, Select, Alert, Badge } from '@agro-gram/ui';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Import your auth context

import { 
  BuyerCancelOrderForm, 
  BuyerRefundRequestForm,
  BuyerDeliveryConfirmationForm 
} from '../components/Orders/BuyerOrderForms';

import { 
  SellerOrderConfirmationForm,
  SellerOrderRejectionForm,
  SellerShippingForm,
  SellerRefundProcessingForm 
} from '../components/Orders/SellerOrderForms';

import '../components/Orders/Orders.css';
import '../components/Orders/OrderForms.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    type: ''
  });
  const [activeOrder, setActiveOrder] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [currentForm, setCurrentForm] = useState(null);

  const navigate = useNavigate();
  
  // Get user from your auth context
  const { user, userProfile } = useAuth();

  // Get current user from auth context
  const getCurrentUser = () => {
    if (userProfile) {
      // Use the detailed user profile from your backend
      return {
        email: userProfile.email || user?.email || '',
        id: userProfile.id || userProfile._id || user?.uid || '',
        type: userProfile.role || userProfile.user_type || 'USER'
      };
    } else if (user) {
      // Fallback to Firebase user data
      return {
        email: user.email || '',
        id: user.uid || '',
        type: 'USER' // Default type
      };
    } else {
      // No user logged in
      return {
        email: '',
        id: '',
        type: 'USER'
      };
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, filters]);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await marketplaceAPI.getOrders();
      if (result.success) {
        const ordersData = result.data.results || result.data || [];
        setOrders(ordersData);
      } else {
        setError(result.message || 'Failed to load orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];
    const currentUser = getCurrentUser();

    if (filters.status) {
      filtered = filtered.filter(order => order.status === filters.status);
    }

    if (filters.type) {
      if (filters.type === 'BUYING') {
        filtered = filtered.filter(order => 
          order.buyer_email === currentUser.email || 
          order.buyer_id === currentUser.id ||
          order.buyer_type === 'USER'
        );
      } else if (filters.type === 'SELLING') {
        filtered = filtered.filter(order => 
          order.seller_email === currentUser.email ||
          order.seller_id === currentUser.id ||
          order.seller_type === 'USER'
        );
      }
    }

    setFilteredOrders(filtered);
  };

  // Open the appropriate form based on action type
  const openForm = (order, actionType) => {
    if (!order) {
      setError('Cannot open form: Order information is missing');
      return;
    }

    // Map action types to form components
    const formMap = {
      // Buyer forms
      'CANCEL_ORDER': BuyerCancelOrderForm,
      'REQUEST_REFUND': BuyerRefundRequestForm,
      'CONFIRM_DELIVERY': BuyerDeliveryConfirmationForm,
      
      // Seller forms  
      'CONFIRM_ORDER': SellerOrderConfirmationForm,
      'REJECT_ORDER': SellerOrderRejectionForm,
      'MARK_SHIPPED': SellerShippingForm,
      'PROCESS_REFUND': SellerRefundProcessingForm
    };

    const selectedForm = formMap[actionType];
    if (!selectedForm) {
      setError(`No form available for action: ${actionType}`);
      return;
    }

    setActiveOrder(order);
    setCurrentForm(() => selectedForm);
    setShowFormModal(true);
  };

  // Handle form submissions from all forms
  const handleFormSubmit = async (formData) => {
    try {
      const { orderId, action, ...submitData } = formData;
      let result;
      let updateData = {};

      switch (action) {
        case 'CONFIRM_ORDER':
          updateData = { 
            status: 'CONFIRMED',
            processing_time: submitData.processingTime,
            seller_notes: submitData.notes,
            estimated_ship_date: submitData.estimatedShipDate,
            confirmed_at: submitData.confirmedAt
          };
          break;
          
        case 'REJECT_ORDER':
          updateData = { 
            status: 'CANCELLED',
            cancellation_reason: submitData.details || submitData.reason || 'Order rejected by seller',
            rejected_at: submitData.rejectedAt
          };
          break;
          
        case 'MARK_SHIPPED':
          updateData = { 
            status: 'SHIPPED',
            shipping_date: submitData.shipDate,
            carrier: submitData.carrier,
            tracking_number: submitData.trackingNumber,
            shipping_notes: submitData.notes,
            shipped_at: submitData.shippedAt
          };
          break;
          
        case 'CONFIRM_DELIVERY':
          updateData = { 
            status: 'DELIVERED',
            delivery_date: new Date().toISOString(),
            delivery_condition: submitData.condition,
            delivery_rating: submitData.rating,
            delivery_feedback: submitData.feedback,
            confirmed_at: submitData.confirmedAt
          };
          break;
          
        case 'CANCEL_ORDER':
          updateData = { 
            status: 'CANCELLED',
            cancellation_reason: submitData.reason || 'Cancelled by buyer',
            additional_details: submitData.additionalDetails
          };
          break;
          
        case 'REQUEST_REFUND':
          updateData = { 
            status: 'REFUND_REQUESTED',
            refund_reason: submitData.description || submitData.reason || 'Refund requested by buyer',
            refund_type: submitData.refundType,
            requested_refund_amount: submitData.requestedAmount
          };
          break;
          
        case 'PROCESS_REFUND':
          updateData = { 
            status: 'REFUNDED',
            refund_processed_date: new Date().toISOString(),
            refund_amount: submitData.refundAmount,
            refund_method: submitData.refundMethod,
            refund_notes: submitData.notes,
            processed_at: submitData.processedAt
          };
          break;
          
        default:
          throw new Error('Invalid action');
      }

      result = await marketplaceAPI.updateOrder(orderId, updateData);

      if (result.success) {
        const actionMessages = {
          'CONFIRM_ORDER': 'Order confirmed successfully!',
          'REJECT_ORDER': 'Order rejected.',
          'MARK_SHIPPED': 'Order marked as shipped!',
          'CONFIRM_DELIVERY': 'Delivery confirmed!',
          'CANCEL_ORDER': 'Order cancelled.',
          'REQUEST_REFUND': 'Refund requested successfully!',
          'PROCESS_REFUND': 'Refund processed successfully!'
        };
        
        setSuccess(actionMessages[action] || 'Action completed successfully');
        setTimeout(() => setSuccess(''), 4000);
        fetchOrders(); // Refresh orders
        setShowFormModal(false);
        setCurrentForm(null);
        setActiveOrder(null);
      } else {
        setError(result.message || 'Failed to perform action');
      }
    } catch (error) {
      console.error('Error performing order action:', error);
      setError('Failed to perform action: ' + error.message);
    }
  };

  // Render the current form in the modal
  const renderCurrentForm = () => {
    if (!currentForm || !activeOrder) return null;
    
    const FormComponent = currentForm;
    return (
      <FormComponent
        order={activeOrder}
        onSubmit={handleFormSubmit}
        onCancel={() => {
          setShowFormModal(false);
          setCurrentForm(null);
          setActiveOrder(null);
        }}
      />
    );
  };

  const handleViewProduct = (productId) => {
    if (productId) {
      navigate(`/marketplace/product/${productId}`);
    } else {
      setError('Product information not available');
    }
  };

  // PERMANENT FIX: Proper role detection and action management
  const getAvailableActions = (order) => {
    const currentUser = getCurrentUser();
    
    // Enhanced role detection using actual user data
    const isBuyer = 
      order.buyer_email === currentUser.email ||
      order.buyer_id === currentUser.id ||
      order.buyer_type === 'USER';

    const isSeller =
      order.seller_email === currentUser.email ||
      order.seller_id === currentUser.id ||
      order.seller_type === 'USER';

    console.log('🔍 DEBUG Role Detection:', { 
      currentUser: currentUser.email,
      orderBuyer: order.buyer_email,
      orderSeller: order.seller_email,
      isBuyer, 
      isSeller, 
      status: order.status 
    });

    const actions = [];

    // PENDING Orders
    if (order.status === 'PENDING') {
      if (isSeller) {
        actions.push(
          { type: 'CONFIRM_ORDER', label: '✅ Confirm Order', variant: 'primary' },
          { type: 'REJECT_ORDER', label: '❌ Reject Order', variant: 'outline' }
        );
      }
      if (isBuyer) {
        actions.push(
          { type: 'CANCEL_ORDER', label: '🚫 Cancel Order', variant: 'outline' }
        );
      }
    }

    // CONFIRMED Orders
    else if (order.status === 'CONFIRMED') {
      if (isSeller) {
        actions.push(
          { type: 'MARK_SHIPPED', label: '📦 Mark as Shipped', variant: 'primary' }
        );
      }
      if (isBuyer) {
        actions.push(
          { type: 'CANCEL_ORDER', label: '🚫 Cancel Order', variant: 'outline' }
        );
      }
    }

    // SHIPPED Orders
    else if (order.status === 'SHIPPED') {
      if (isBuyer) {
        actions.push(
          { type: 'CONFIRM_DELIVERY', label: '✅ Confirm Delivery', variant: 'primary' },
          { type: 'REQUEST_REFUND', label: '💸 Request Refund', variant: 'outline' }
        );
      }
      if (isSeller) {
        actions.push(
          { type: 'CONFIRM_DELIVERY', label: '✅ Confirm Delivery', variant: 'primary' }
        );
      }
    }

    // DELIVERED Orders
    else if (order.status === 'DELIVERED') {
      if (isBuyer) {
        actions.push(
          { type: 'REQUEST_REFUND', label: '💸 Request Refund', variant: 'outline' }
        );
      }
    }

    // REFUND_REQUESTED Orders
    else if (order.status === 'REFUND_REQUESTED') {
      if (isSeller) {
        actions.push(
          { type: 'PROCESS_REFUND', label: '💰 Process Refund', variant: 'primary' }
        );
      }
    }

    // Always allow contacting the other party
    const contactLabel = isBuyer ? '💬 Contact Seller' : '💬 Contact Buyer';
    actions.push({
      type: 'CONTACT',
      label: contactLabel,
      variant: 'text'
    });

    console.log('🔍 DEBUG Final Actions:', actions);
    return actions;
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'PENDING': return 'warning';
      case 'CONFIRMED': return 'info';
      case 'SHIPPED': return 'primary';
      case 'DELIVERED': return 'success';
      case 'CANCELLED': return 'error';
      case 'REFUND_REQUESTED': return 'warning';
      case 'REFUNDED': return 'secondary';
      default: return 'default';
    }
  };

  const getTimelineStatus = (order, step) => {
    const statusOrder = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];
    const currentStatusIndex = statusOrder.indexOf(order.status);
    const stepIndex = statusOrder.indexOf(step);

    if (stepIndex < currentStatusIndex) return 'completed';
    if (stepIndex === currentStatusIndex) return 'current';
    return 'pending';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not yet';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="orders-loading">
        <LoadingSpinner size="large" />
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="orders-header">
        <h1>Orders</h1>
        <div className="orders-actions">
          <Button variant="outline" onClick={fetchOrders}>
            🔄 Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Alert type="error" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert type="success" onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Filters */}
      <Card className="orders-filters">
        <div className="filters-grid">
          <Select
            label="Order Status"
            options={[
              { value: '', label: 'All Statuses' },
              { value: 'PENDING', label: '🟡 Pending' },
              { value: 'CONFIRMED', label: '🔵 Confirmed' },
              { value: 'SHIPPED', label: '📦 Shipped' },
              { value: 'DELIVERED', label: '✅ Delivered' },
              { value: 'CANCELLED', label: '❌ Cancelled' },
              { value: 'REFUND_REQUESTED', label: '💸 Refund Requested' },
              { value: 'REFUNDED', label: '💰 Refunded' }
            ]}
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          />
          <Select
            label="Order Type"
            options={[
              { value: '', label: 'All Orders' },
              { value: 'BUYING', label: '🛒 Orders I\'m Buying' },
              { value: 'SELLING', label: '🏪 Orders I\'m Selling' }
            ]}
            value={filters.type}
            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
          />
          <div className="filter-stats">
            <span>📊 Showing {filteredOrders.length} of {orders.length} orders</span>
          </div>
        </div>
      </Card>

      {/* Orders List */}
      <div className="orders-list">
        {filteredOrders.length === 0 ? (
          <Card className="no-orders">
            <div className="no-orders-content">
              <h3>No orders found</h3>
              <p>
                {orders.length === 0 
                  ? "You haven't placed or received any orders yet." 
                  : "No orders match your current filters."}
              </p>
              {orders.length === 0 && (
                <Button variant="primary" onClick={() => navigate('/marketplace')}>
                  🏪 Browse Marketplace
                </Button>
              )}
            </div>
          </Card>
        ) : (
          filteredOrders.map(order => {
            const availableActions = getAvailableActions(order);

            return (
              <Card key={order.id} className="order-card">
                <div className="order-header">
                  <div className="order-info">
                    <h3>Order #{order.id}</h3>
                    <div className="status-badge-container">
                      <Badge variant={getStatusBadgeVariant(order.status)}>
                        {order.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  <div className="order-meta">
                    <span className="order-date">📅 {formatDate(order.created_at)}</span>
                    <span className="order-total">💵 {formatCurrency(order.total_price)}</span>
                  </div>
                </div>

                <div className="order-details">
                  <div className="product-info">
                    <div className="product-image">
                      {order.product_details?.image ? (
                        <img src={order.product_details.image} alt={order.product_details.title} />
                      ) : (
                        <div className="product-image-placeholder">🌱</div>
                      )}
                    </div>
                    <div className="product-details">
                      <h4>{order.product_details?.title || 'Product'}</h4>
                      <p className="product-description">
                        {order.product_details?.description || 'No description available'}
                      </p>
                      <div className="product-specs">
                        <span>📦 Quantity: {order.quantity}</span>
                        <span>💰 Price: {formatCurrency(order.product_details?.price)} each</span>
                      </div>
                    </div>
                  </div>

                  <div className="order-parties">
                    <div className="party-info">
                      <strong>👤 Buyer:</strong>
                      <span>{order.buyer_name || order.buyer_email || 'Unknown'}</span>
                    </div>
                    <div className="party-info">
                      <strong>🏪 Seller:</strong>
                      <span>{order.seller_name || order.seller_email || 'Unknown'}</span>
                    </div>
                  </div>

                  <div className="shipping-info">
                    <div className="shipping-address">
                      <strong>📮 Shipping Address:</strong>
                      <p>{order.shipping_address || 'Not specified'}</p>
                    </div>
                    <div className="contact-info">
                      <strong>📞 Contact:</strong>
                      <span>{order.contact_number || 'Not provided'}</span>
                    </div>
                  </div>

                  {/* Order Timeline - Only show for active orders */}
                  {!['CANCELLED', 'REFUNDED', 'REFUND_REQUESTED'].includes(order.status) && (
                    <div className="order-timeline">
                      <div className={`timeline-step ${getTimelineStatus(order, 'PENDING')}`}>
                        <span className="step-number">1</span>
                        <span className="step-label">Order Placed</span>
                        <span className="step-description">{formatDate(order.created_at)}</span>
                      </div>
                      <div className={`timeline-step ${getTimelineStatus(order, 'CONFIRMED')}`}>
                        <span className="step-number">2</span>
                        <span className="step-label">Confirmed</span>
                        <span className="step-description">
                          {order.status === 'CONFIRMED' ? 'Seller confirmed' : 'Awaiting seller confirmation'}
                        </span>
                      </div>
                      <div className={`timeline-step ${getTimelineStatus(order, 'SHIPPED')}`}>
                        <span className="step-number">3</span>
                        <span className="step-label">Shipped</span>
                        <span className="step-description">
                          {order.status === 'SHIPPED' ? `Shipped ${formatDate(order.shipping_date)}` : 'Ready for shipping'}
                        </span>
                      </div>
                      <div className={`timeline-step ${getTimelineStatus(order, 'DELIVERED')}`}>
                        <span className="step-number">4</span>
                        <span className="step-label">Delivered</span>
                        <span className="step-description">
                          {order.status === 'DELIVERED' ? `Delivered ${formatDate(order.delivery_date)}` : 'In transit'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Special status messages */}
                  {order.status === 'CANCELLED' && order.cancellation_reason && (
                    <div className="status-message error">
                      <strong>❌ Order Cancelled:</strong> {order.cancellation_reason}
                    </div>
                  )}

                  {order.status === 'REFUND_REQUESTED' && order.refund_reason && (
                    <div className="status-message warning">
                      <strong>💸 Refund Requested:</strong> {order.refund_reason}
                      {order.refund_requested_date && (
                        <span> (Requested: {formatDate(order.refund_requested_date)})</span>
                      )}
                    </div>
                  )}

                  {order.status === 'REFUNDED' && order.refund_processed_date && (
                    <div className="status-message info">
                      <strong>💰 Refund Processed:</strong> {formatDate(order.refund_processed_date)}
                    </div>
                  )}
                </div>

                {/* Order Actions - PERMANENT FIX */}
                {availableActions.length > 0 && (
                  <div className="order-actions">
                    {availableActions.map((action, index) => (
                      <Button
                        key={index}
                        variant={action.variant}
                        size="small"
                        onClick={() => {
                          if (action.type === 'CONTACT') {
                            navigate('/messages');
                          } else {
                            openForm(order, action.type);
                          }
                        }}
                      >
                        {action.label}
                      </Button>
                    ))}

                    {/* Always show View Product button */}
                    {order.product_details?.id && (
                      <Button 
                        variant="text" 
                        size="small"
                        onClick={() => handleViewProduct(order.product_details.id)}
                      >
                        👀 View Product
                      </Button>
                    )}
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>

      {/* Form Modal */}
      {showFormModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            {renderCurrentForm()}
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;