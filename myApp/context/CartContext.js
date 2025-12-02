import React, { createContext, useReducer, useContext } from 'react';
import { Alert } from 'react-native';

// Debug function to log cart actions
const logCartAction = (action, state) => {
  console.log('Cart Action:', action.type, action.payload);
  console.log('Current Cart State:', state);
};

const CartContext = createContext();

const cartReducer = (state, action) => {
  // Log the action and current state
  logCartAction(action, state);
  
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItemIndex = state.items.findIndex(
        item => item.id === action.payload.id
      );
      
      if (existingItemIndex >= 0) {
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: (updatedItems[existingItemIndex].quantity || 1) + 1
        };
        return { ...state, items: updatedItems };
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: 1 }],
      };
    }
      
    case 'UPDATE_QUANTITY': {
      return {
        ...state,
        items: state.items.map(item => 
          item.id === action.payload.id 
            ? { ...item, quantity: action.payload.quantity }
            : item
        ).filter(item => item.quantity > 0)
      };
    }
      
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload.id),
      };
      
    case 'CLEAR_CART':
      return { ...state, items: [] };
      
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  const addItemToCart = (product) => {
    dispatch({ type: 'ADD_ITEM', payload: product });
  };

  const updateItemQuantity = (productId, quantity) => {
    dispatch({ 
      type: 'UPDATE_QUANTITY', 
      payload: { id: productId, quantity: parseInt(quantity, 10) } 
    });
  };

  const removeItemFromCart = (productId) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { id: productId } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const getCartTotal = () => {
    return state.items.reduce(
      (total, item) => total + (item.price * (item.quantity || 1)),
      0
    );
  };
  
  const getItemCount = () => {
    return state.items.reduce((count, item) => count + (item.quantity || 1), 0);
  };

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        addItemToCart,
        updateItemQuantity,
        removeItemFromCart,
        clearCart,
        cartTotal: getCartTotal(),
        itemCount: getItemCount(),
      }}
    >
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
