import React from 'react';
import { Card, Button, Input, Alert } from '@agro-gram/ui';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const { items, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="cart-empty">
        <Card>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <h2>Your cart is empty</h2>
            <p>Add some products to get started</p>
            <Button variant="primary" onClick={() => navigate('/marketplace')}>
              Browse Marketplace
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-header">
        <h1>Shopping Cart</h1>
        <Button variant="outline" onClick={clearCart}>
          Clear Cart
        </Button>
      </div>

      <div className="cart-layout">
        <div className="cart-items">
          {items.map(item => (
            <Card key={item.productId} className="cart-item">
              <div className="item-image">
                <img src={item.image} alt={item.title} />
              </div>
              
              <div className="item-details">
                <h3>{item.title}</h3>
                <p className="item-seller">Seller: {item.sellerName}</p>
                <p className="item-price">${item.price} each</p>
                
                <div className="item-controls">
                  <div className="quantity-control">
                    <label>Qty:</label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value))}
                      style={{ width: '70px' }}
                    />
                  </div>
                  
                  <Button 
                    variant="text" 
                    onClick={() => removeFromCart(item.productId)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
              
              <div className="item-total">
                ${(item.price * item.quantity).toFixed(2)}
              </div>
            </Card>
          ))}
        </div>

        <div className="cart-summary">
          <Card title="Order Summary">
            <div className="summary-totals">
              <div className="total-line">
                <span>Items ({items.reduce((sum, item) => sum + item.quantity, 0)}):</span>
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
              onClick={() => navigate('/checkout')}
              style={{ width: '100%' }}
            >
              Proceed to Checkout
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => navigate('/marketplace')}
              style={{ width: '100%', marginTop: '10px' }}
            >
              Continue Shopping
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Cart;