/**
 * CUSTOM HOOK - useProducts
 * 
 * This demonstrates React Custom Hooks - reusable functions that use React hooks.
 * Custom hooks allow us to extract component logic into reusable functions.
 * 
 * This hook:
 * - Fetches products from API using JavaScript fetch
 * - Handles loading and error states
 * - Provides search functionality
 * - Uses useMemo for performance optimization
 * 
 * JavaScript Closure: The hook uses closures to maintain state between renders.
 * The functions inside have access to the outer scope (products, searchQuery).
 */

import { useState, useEffect, useMemo, useCallback } from 'react';

/**
 * API Configuration
 * In a real app, this would be your backend API URL
 */
const API_BASE_URL = 'https://api.example.com'; // Replace with your API

/**
 * Toggle this flag to true while you don't have a backend ready.
 * When true, the hook skips the network call entirely so Metro
 * doesn't spam the console with "Network request failed".
 */
const USE_MOCK_DATA = true;

/**
 * Custom hook to manage products
 * @param {string} searchQuery - Search term to filter products
 * @returns {object} - Products data, loading state, error, and functions
 */
export const useProducts = (searchQuery = '') => {
  // State management
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetch products from API using JavaScript fetch
   * 
   * fetch() is a modern JavaScript API for making HTTP requests.
   * It returns a Promise that resolves to the Response object.
   * 
   * We use async/await for cleaner asynchronous code.
   */
  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (USE_MOCK_DATA) {
        // Skip network call when mock mode is enabled
        setProducts(getMockProducts());
        return;
      }

      // JavaScript fetch API - makes HTTP request
      const response = await fetch(`${API_BASE_URL}/products`);
      
      // Check if request was successful
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Parse JSON response
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      // Handle errors
      console.error('Error fetching products:', err);
      setError(err.message);
      
      // Fallback to mock data if API fails (for development)
      setProducts(getMockProducts());
    } finally {
      setIsLoading(false);
    }
  }, []);

const getMockProducts = () => ([
  {
    id: '1',
    name: 'Premium Rice 5kg',
    price: 250,
    stock: 50,
    category: 'Food',
    description: 'High quality basmati rice',
  },
  {
    id: '2',
    name: 'Cooking Oil 1L',
    price: 120,
    stock: 30,
    category: 'Food',
    description: 'Pure sunflower cooking oil',
  },
  {
    id: '3',
    name: 'Wheat Flour 2kg',
    price: 80,
    stock: 25,
    category: 'Food',
    description: 'Fresh wheat flour',
  },
  {
    id: '4',
    name: 'Toilet Paper 12 rolls',
    price: 180,
    stock: 15,
    category: 'Home',
    description: 'Soft 3-ply toilet paper',
  },
  {
    id: '5',
    name: 'Detergent Powder 1kg',
    price: 150,
    stock: 20,
    category: 'Home',
    description: 'Powerful cleaning detergent',
  },
]);

  /**
   * Fetch products when component mounts
   * useEffect runs after render
   */
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  /**
   * Filter products based on search query
   * useMemo caches the result - only recalculates when products or searchQuery changes
   * This is React Memoization - prevents unnecessary filtering on every render
   */
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) {
      return products;
    }
    
    const query = searchQuery.toLowerCase();
    return products.filter(product => 
      product.name.toLowerCase().includes(query) || 
      product.category.toLowerCase().includes(query) ||
      product.description?.toLowerCase().includes(query)
    );
  }, [products, searchQuery]);

  /**
   * Refresh products manually
   * useCallback memoizes the function to prevent recreation
   */
  const refreshProducts = useCallback(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products: filteredProducts,
    allProducts: products,
    isLoading,
    error,
    refreshProducts,
  };
};

