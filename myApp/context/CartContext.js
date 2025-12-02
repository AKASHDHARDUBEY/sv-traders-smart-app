/**
 * CART CONTEXT - Manages shopping cart state
 * 
 * This file demonstrates:
 * - useContext: Sharing cart data across all screens
 * - useReducer: Managing complex cart state (add, remove, update quantities)
 * - React Native Data Storage: Persisting cart to AsyncStorage
 * - useCallback: Memoizing functions to prevent unnecessary re-renders
 * - useMemo: Memoizing computed values (cart total, item count)
 * 
 * The cart state includes:
 * - items: Array of products in cart
 * - Each item has: id, name, price, quantity
 */

import React, { createContext, useReducer, useContext, useEffect, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create Context for cart
const CartContext = createContext();

// Storage key for saving cart data
const CART_STORAGE_KEY = '@sv_traders_cart';

// Initial state - empty cart
const initialState = {
  items: [],  // Array of cart items
};

/**
 * CART REDUCER - Handles all cart state changes
 * 
 * Reducer pattern makes state updates predictable and testable.
 * Instead of directly modifying state, we dispatch actions.
 * 
 * Actions:
 * - ADD_ITEM: Add new item or increase quantity if exists
 * - UPDATE_QUANTITY: Change quantity of existing item
 * - REMOVE_ITEM: Remove item completely from cart
 * - CLEAR_CART: Remove all items
 * - LOAD_CART: Load cart from storage
 */
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const newItem = action.payload;
      
      // Check if item already exists in cart
      const existingItemIndex = state.items.findIndex(
        item => item.id === newItem.id
      );
      
      if (existingItemIndex >= 0) {
        // Item exists - increase quantity
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: (updatedItems[existingItemIndex].quantity || 1) + 1
        };
        return { ...state, items: updatedItems };
      }
      
      // Item doesn't exist - add new item with quantity 1
      return {
        ...state,
        items: [...state.items, { ...newItem, quantity: 1 }],
      };
    }
      
    case 'UPDATE_QUANTITY': {
      const { id, quantity } = action.payload;
      
      // Update quantity and remove items with quantity 0 or less
      return {
        ...state,
        items: state.items
          .map(item => 
            item.id === id 
              ? { ...item, quantity: Math.max(0, quantity) }
              : item
          )
          .filter(item => item.quantity > 0)  // Remove items with 0 quantity
      };
    }
      
    case 'REMOVE_ITEM':
      // Remove item completely
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload.id),
      };
      
    case 'CLEAR_CART':
      // Empty the cart
      return { ...state, items: [] };
    
    case 'LOAD_CART':
      // Load cart from storage
      return { ...state, items: action.payload || [] };
      
    default:
      return state;
  }
};

/**
 * CART PROVIDER - Provides cart functionality to entire app
 * 
 * Features:
 * 1. Manages cart state with useReducer
 * 2. Persists cart to AsyncStorage (survives app restarts)
 * 3. Provides helper functions: addItem, removeItem, updateQuantity, etc.
 * 4. Computes cart total and item count using useMemo (performance optimization)
 */
export const CartProvider = ({ children }) => {
  // useReducer manages cart state
  const [state, dispatch] = useReducer(cartReducer, initialState);

  /**
   * Load cart from AsyncStorage when app starts
   * useEffect with empty dependency array runs once on mount
   */
  useEffect(() => {
    loadCartFromStorage();
  }, []);

  /**
   * Save cart to AsyncStorage whenever cart changes
   * This ensures cart persists even if app closes
   */
  useEffect(() => {
    saveCartToStorage();
  }, [state.items]);

  /**
   * Load cart from AsyncStorage (React Native Data Storage)
   */
  const loadCartFromStorage = async () => {
    try {
      const storedCart = await AsyncStorage.getItem(CART_STORAGE_KEY);
      if (storedCart) {
        const cartItems = JSON.parse(storedCart);
        dispatch({ type: 'LOAD_CART', payload: cartItems });
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  /**
   * Save cart to AsyncStorage
   */
  const saveCartToStorage = async () => {
    try {
      await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items));
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  };

  /**
   * Add item to cart
   * useCallback memoizes this function - prevents recreation on every render
   * This is important for performance (React Memoization)
   */
  const addItemToCart = useCallback((product) => {
    dispatch({ type: 'ADD_ITEM', payload: product });
  }, []);

  /**
   * Update item quantity
   * useCallback prevents memory leaks and unnecessary re-renders
   */
  const updateItemQuantity = useCallback((productId, quantity) => {
    dispatch({ 
      type: 'UPDATE_QUANTITY', 
      payload: { id: productId, quantity: parseInt(quantity, 10) } 
    });
  }, []);

  /**
   * Remove item from cart
   */
  const removeItemFromCart = useCallback((productId) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { id: productId } });
  }, []);

  /**
   * Clear entire cart
   */
  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
  }, []);

  /**
   * Calculate cart total using useMemo
   * useMemo caches the result - only recalculates when cart items change
   * This prevents unnecessary calculations on every render (React Memoization)
   */
  const cartTotal = useMemo(() => {
    return state.items.reduce(
      (total, item) => total + (item.price * (item.quantity || 1)),
      0
    );
  }, [state.items]);
  
  /**
   * Calculate total item count using useMemo
   * Memoization prevents recalculating on every render
   */
  const itemCount = useMemo(() => {
    return state.items.reduce((count, item) => count + (item.quantity || 1), 0);
  }, [state.items]);

  // Value object provided to all children
  const value = {
    items: state.items,
    addItemToCart,
    updateItemQuantity,
    removeItemFromCart,
    clearCart,
    cartTotal,
    itemCount,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

/**
 * CUSTOM HOOK - useCart
 * 
 * Easy way to access cart context from any component.
 * Custom hooks make code reusable and cleaner.
 */
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
