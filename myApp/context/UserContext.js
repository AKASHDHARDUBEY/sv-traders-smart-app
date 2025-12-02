/**
 * USER CONTEXT - Manages user authentication and profile data
 * 
 * This file uses React Context API with useReducer to manage user state.
 * Context API allows us to share user data across all screens without prop drilling.
 * useReducer helps manage complex state updates in a predictable way.
 * 
 * We also use AsyncStorage to persist user login data so users stay logged in
 * even after closing the app (React Native Data Storage).
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create a Context - this is like a global state container
const UserContext = createContext();

// Storage key for saving user data
const USER_STORAGE_KEY = '@sv_traders_user';

// Initial state - starting point for user data
const initialState = {
  user: null,        // Current logged-in user information
  isLoading: true,   // Loading state while checking stored data
};

/**
 * REDUCER FUNCTION - Handles all user-related state changes
 * 
 * A reducer is a pure function that takes current state and an action,
 * then returns the new state. This makes state updates predictable.
 * 
 * Actions are like commands: 'LOGIN', 'LOGOUT', 'LOAD_USER'
 */
const userReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      // When user logs in, save their data
      return {
        ...state,
        user: action.payload,
        isLoading: false,
      };
    
    case 'LOGOUT':
      // When user logs out, clear their data
      return {
        ...state,
        user: null,
        isLoading: false,
      };
    
    case 'SET_LOADING':
      // Update loading state
      return {
        ...state,
        isLoading: action.payload,
      };
    
    default:
      // If action type doesn't match, return state unchanged
      return state;
  }
};

/**
 * USER PROVIDER - Wraps the app and provides user context to all children
 * 
 * This component:
 * 1. Uses useReducer to manage user state
 * 2. Saves user data to AsyncStorage when user logs in (persistent storage)
 * 3. Loads user data from AsyncStorage when app starts
 * 4. Provides login/logout functions to child components
 */
export const UserProvider = ({ children }) => {
  // useReducer gives us state and dispatch function
  // state = current user data
  // dispatch = function to send actions (like LOGIN, LOGOUT)
  const [state, dispatch] = useReducer(userReducer, initialState);

  /**
   * Load user data from AsyncStorage when app starts
   * useEffect runs after component mounts (when app opens)
   */
  useEffect(() => {
    loadStoredUser();
  }, []);

  /**
   * Load user from AsyncStorage (React Native Data Storage)
   * AsyncStorage is like localStorage in web browsers
   */
  const loadStoredUser = async () => {
    try {
      // Get stored user data from device storage
      const storedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
      
      if (storedUser) {
        // If user data exists, parse it and set as current user
        const userData = JSON.parse(storedUser);
        dispatch({ type: 'LOGIN', payload: userData });
      } else {
        // No stored user, set loading to false
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } catch (error) {
      // If error reading storage, just set loading to false
      console.error('Error loading user:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  /**
   * Login function - saves user data and stores it persistently
   * useCallback memoizes this function to prevent unnecessary re-renders
   * (React Memoization concept)
   */
  const login = useCallback(async (userData) => {
    try {
      // Save user data to AsyncStorage for persistence
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
      
      // Update state with user data
      dispatch({ type: 'LOGIN', payload: userData });
    } catch (error) {
      console.error('Error saving user:', error);
      // Still update state even if storage fails
      dispatch({ type: 'LOGIN', payload: userData });
    }
  }, []);

  /**
   * Logout function - clears user data from memory and storage
   * useCallback prevents function recreation on every render
   */
  const logout = useCallback(async () => {
    try {
      // Remove user data from AsyncStorage
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
      
      // Clear user from state
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.error('Error removing user:', error);
      // Still clear state even if storage removal fails
      dispatch({ type: 'LOGOUT' });
    }
  }, []);

  // Value object - what we're providing to all child components
  const value = {
    user: state.user,
    isLoading: state.isLoading,
    login,
    logout,
  };

  // Provide the context value to all children
  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

/**
 * CUSTOM HOOK - useUser
 * 
 * This is a custom hook that makes it easy to access user context.
 * Custom hooks are reusable functions that use React hooks internally.
 * 
 * Instead of writing useContext(UserContext) everywhere, we use useUser()
 * 
 * This also includes error handling - if hook is used outside provider,
 * it throws a helpful error message.
 */
export const useUser = () => {
  const context = useContext(UserContext);
  
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  
  return context;
};
