// Update your ProductCard.jsx
import React, { useState } from 'react';
import { Card, Button, Input, Alert } from '@agro-gram/ui';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { cartAPI } from '@agro-gram/api';

const ProductCard = ({ product }) => {
  const { addToCart, getItemCount, syncWithBackend } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [quantity, setQuantity] = useState(1);
  const [showAlert, setShowAlert] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      // Add to backend cart
      const result = await cartAPI.addToCart(product.id, quantity);
      
      if (result.success) {
        // Also update frontend cart for immediate UI update
        addToCart(product, quantity);
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
        
        // Sync frontend with backend
        await syncWithBackend();
      } else {
        alert(result.message || 'Failed to add to cart');
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      alert('Failed to add to cart');
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      // Add to backend cart
      const result = await cartAPI.addToCart(product.id, quantity);
      
      if (result.success) {
        // Also update frontend cart
        addToCart(product, quantity);
        navigate('/checkout');
      } else {
        alert(result.message || 'Failed to add to cart');
      }
    } catch (error) {
      console.error('Buy now error:', error);
      alert('Failed to proceed to checkout');
    } finally {
      setLoading(false);
    }
  };

  const cartCount = getItemCount();

  return (
    <Card className="product-card">
      {showAlert && (
        <Alert type="success" onClose={() => setShowAlert(false)}>
          Added to cart! {cartCount} items in cart.
        </Alert>
      )}
      
      <div className="product-image">
        <img src={product.image} alt={product.title} />
      </div>
      
      <div className="product-content">
        <h3>{product.title}</h3>
        <p className="product-description">{product.description}</p>
        <div className="product-price">${product.price}</div>
        <div className="product-seller">Sold by: {product.farmer_email || product.seller_name}</div>
        
        <div className="product-actions">
          <div className="quantity-selector">
            <label>Quantity:</label>
            <Input
              type="number"
              min="1"
              max={product.quantity || 10}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              style={{ width: '80px' }}
            />
          </div>
          
          <div className="action-buttons">
            <Button 
              variant="outline" 
              onClick={handleAddToCart}
              loading={loading}
              disabled={loading || !product.is_available}
            >
              🛒 Add to Cart
            </Button>
            <Button 
              variant="primary" 
              onClick={handleBuyNow}
              loading={loading}
              disabled={loading || !product.is_available}
            >
              Buy Now
            </Button>
          </div>
        </div>
        
        {!product.is_available && (
          <Alert type="warning" style={{ marginTop: '10px' }}>
            This product is currently unavailable
          </Alert>
        )}
      </div>
    </Card>
  );
};

export default ProductCard;