// Update your CartContext.jsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { cartAPI } from '@agro-gram/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CART':
      return {
        ...state,
        items: action.payload.items || [],
        loading: false
      };
    
    case 'ADD_ITEM':
      const existingItem = state.items.find(item => item.productId === action.payload.productId);
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.productId === action.payload.productId
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          )
        };
      }
      return {
        ...state,
        items: [...state.items, action.payload]
      };
    
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.productId !== action.payload)
      };
    
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item.productId === action.payload.productId
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      };
    
    case 'CLEAR_CART':
      return {
        ...state,
        items: []
      };
    
    case 'SET_SHIPPING':
      return {
        ...state,
        shippingInfo: action.payload
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    shippingInfo: null,
    loading: false
  });

  const { user } = useAuth();

  // Load cart from backend when user logs in
  useEffect(() => {
    if (user) {
      syncWithBackend();
    } else {
      // Clear cart when user logs out
      dispatch({ type: 'CLEAR_CART' });
    }
  }, [user]);

  const syncWithBackend = async () => {
    if (!user) return;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const result = await cartAPI.getCart();
      
      if (result.success && result.data.cart) {
        const backendItems = result.data.cart.items.map(item => ({
          productId: item.product,
          id: item.id,
          title: item.product_title,
          price: parseFloat(item.product_price),
          image: item.product_image,
          sellerId: item.product_seller,
          quantity: item.quantity,
          totalPrice: parseFloat(item.total_price),
          isAvailable: item.is_available
        }));
        
        dispatch({ type: 'SET_CART', payload: { items: backendItems } });
      }
    } catch (error) {
      console.error('Failed to sync cart with backend:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const addToCart = (product, quantity = 1) => {
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        productId: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
        sellerId: product.farmer?.id || product.seller_id,
        sellerName: product.farmer_email || product.seller_name,
        quantity
      }
    });
  };

  const removeFromCart = async (productId) => {
    try {
      // Find cart item ID for backend removal
      const cartItem = state.items.find(item => item.productId === productId);
      if (cartItem && cartItem.id) {
        await cartAPI.removeCartItem(cartItem.id);
      }
      
      dispatch({ type: 'REMOVE_ITEM', payload: productId });
    } catch (error) {
      console.error('Failed to remove item from backend:', error);
      // Still remove from frontend for better UX
      dispatch({ type: 'REMOVE_ITEM', payload: productId });
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      try {
        // Find cart item ID for backend update
        const cartItem = state.items.find(item => item.productId === productId);
        if (cartItem && cartItem.id) {
          await cartAPI.updateCartItem(cartItem.id, quantity);
        }
        
        dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
      } catch (error) {
        console.error('Failed to update quantity in backend:', error);
        // Still update frontend for better UX
        dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
      }
    }
  };

  const clearCart = async () => {
    try {
      await cartAPI.clearCart();
      dispatch({ type: 'CLEAR_CART' });
    } catch (error) {
      console.error('Failed to clear cart in backend:', error);
      dispatch({ type: 'CLEAR_CART' });
    }
  };

  const setShippingInfo = (shippingInfo) => {
    dispatch({ type: 'SET_SHIPPING', payload: shippingInfo });
  };

  const getCartTotal = () => {
    return state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getItemCount = () => {
    return state.items.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      items: state.items,
      shippingInfo: state.shippingInfo,
      loading: state.loading,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      setShippingInfo,
      getCartTotal,
      getItemCount,
      syncWithBackend
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};