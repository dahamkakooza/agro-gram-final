import React from 'react';
import { Badge } from '@agro-gram/ui';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';

const CartIcon = () => {
  const { getItemCount } = useCart();
  const navigate = useNavigate();
  
  const itemCount = getItemCount();

  return (
    <div className="cart-icon" onClick={() => navigate('/cart')}>
      🛒
      {itemCount > 0 && (
        <Badge variant="error" className="cart-badge">
          {itemCount}
        </Badge>
      )}
    </div>
  );
};

export default CartIcon;