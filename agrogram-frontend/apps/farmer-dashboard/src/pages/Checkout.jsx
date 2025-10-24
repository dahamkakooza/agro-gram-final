import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { marketplaceAPI } from '@agro-gram/api';
import { Card, Button, Input, Select, Alert, LoadingSpinner } from '@agro-gram/ui';
import { useNavigate } from 'react-router-dom';

const Checkout = () => {
  const { items, getCartTotal, clearCart, setShippingInfo, shippingInfo } = useCart();
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    // Shipping Information
    fullName: userProfile?.first_name + ' ' + userProfile?.last_name || '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    phone: '',
    
    // Payment Information
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
    
    // Order Notes
    notes: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    const required = ['fullName', 'address', 'city', 'state', 'zipCode', 'phone', 'cardNumber', 'expiryDate', 'cvv', 'cardName'];
    for (let field of required) {
      if (!formData[field]?.trim()) {
        setError(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');

    try {
      // Group items by seller for multiple orders
      const ordersBySeller = {};
      items.forEach(item => {
        if (!ordersBySeller[item.sellerId]) {
          ordersBySeller[item.sellerId] = [];
        }
        ordersBySeller[item.sellerId].push(item);
      });

      // Create orders for each seller
      const orderPromises = Object.entries(ordersBySeller).map(([sellerId, sellerItems]) => {
        const orderData = {
          seller_id: sellerId,
          items: sellerItems.map(item => ({
            product_id: item.productId,
            quantity: item.quantity,
            price: item.price
          })),
          shipping_address: `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}, ${formData.country}`,
          contact_number: formData.phone,
          customer_notes: formData.notes,
          total_price: sellerItems.reduce((total, item) => total + (item.price * item.quantity), 0)
        };

        return marketplaceAPI.createOrder(orderData);
      });

      const results = await Promise.all(orderPromises);
      
      // Check if all orders were created successfully
      const allSuccess = results.every(result => result.success);
      
      if (allSuccess) {
        // Save shipping info for future orders
        setShippingInfo({
          fullName: formData.fullName,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
          phone: formData.phone
        });

        // Clear cart
        clearCart();
        
        // Redirect to orders page with success message
        navigate('/orders', { 
          state: { 
            message: 'Order placed successfully! Sellers will confirm your orders shortly.' 
          } 
        });
      } else {
        setError('Some orders failed to process. Please try again.');
      }
    } catch (err) {
      console.error('Order creation error:', err);
      setError('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="checkout-empty">
        <Card>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <h2>Your cart is empty</h2>
            <p>Add some products to your cart before checkout</p>
            <Button variant="primary" onClick={() => navigate('/marketplace')}>
              Continue Shopping
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <h1>Checkout</h1>
      
      {error && <Alert type="error">{error}</Alert>}

      <div className="checkout-layout">
        <div className="checkout-form">
          {/* Shipping Information */}
          <Card title="Shipping Information">
            <div className="form-grid">
              <Input
                label="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
              />
              <Input
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
              />
              <Input
                label="City"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                required
              />
              <Input
                label="State"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                required
              />
              <Input
                label="ZIP Code"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleInputChange}
                required
              />
              <Input
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </div>
          </Card>

          {/* Payment Information */}
          <Card title="Payment Information">
            <div className="form-grid">
              <Input
                label="Cardholder Name"
                name="cardName"
                value={formData.cardName}
                onChange={handleInputChange}
                required
              />
              <Input
                label="Card Number"
                name="cardNumber"
                value={formData.cardNumber}
                onChange={handleInputChange}
                placeholder="1234 5678 9012 3456"
                required
              />
              <Input
                label="Expiry Date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleInputChange}
                placeholder="MM/YY"
                required
              />
              <Input
                label="CVV"
                name="cvv"
                value={formData.cvv}
                onChange={handleInputChange}
                required
              />
            </div>
          </Card>

          {/* Order Notes */}
          <Card title="Order Notes (Optional)">
            <Input
              type="textarea"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Any special instructions for the sellers..."
              rows={3}
            />
          </Card>
        </div>

        {/* Order Summary */}
        <div className="order-summary-sidebar">
          <Card title="Order Summary">
            <div className="order-items">
              {items.map(item => (
                <div key={item.productId} className="order-item">
                  <div className="item-info">
                    <strong>{item.title}</strong>
                    <span>Qty: {item.quantity}</span>
                  </div>
                  <div className="item-price">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="order-totals">
              <div className="total-line">
                <span>Subtotal:</span>
                <span>${getCartTotal().toFixed(2)}</span>
              </div>
              <div className="total-line">
                <span>Shipping:</span>
                <span>$0.00</span>
              </div>
              <div className="total-line grand-total">
                <span>Total:</span>
                <span>${getCartTotal().toFixed(2)}</span>
              </div>
            </div>

            <Button 
              variant="success" 
              size="large" 
              loading={loading}
              onClick={handlePlaceOrder}
              style={{ width: '100%', marginTop: '20px' }}
            >
              Place Order
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;