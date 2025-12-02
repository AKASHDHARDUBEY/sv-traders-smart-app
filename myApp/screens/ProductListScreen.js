/**
 * PRODUCT LIST SCREEN - Displays all available products
 * 
 * This screen demonstrates:
 * - React.memo: Memoizing components to prevent unnecessary re-renders
 * - useCallback: Memoizing functions to prevent memory leaks
 * - useMemo: Memoizing computed values (filtered products)
 * - FlatList Virtual Scrolling: Efficient rendering of large lists
 * - Custom hooks: Using useProducts hook for data fetching
 * - JavaScript fetch: Fetching products from API (via custom hook)
 * - React Native Styling: Using StyleSheet for optimized styles
 * 
 * Virtual Scrolling: FlatList only renders visible items, making it efficient
 * for large lists. Items are recycled as user scrolls.
 */

import React, { useState, useMemo, useCallback, memo } from 'react';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { useProducts } from '../hooks/useProducts';
import { useThemeMode } from '../theme/ThemeContext';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';

/**
 * PRODUCT CARD COMPONENT
 *
 * React.memo prevents this component from re-rendering unless its props change.
 * Styles are passed in as a prop so that it works with the themed styles
 * created inside the screen component.
 */
const ProductCard = memo(({ item, onAddToCart, userRole, styles }) => {
  /**
   * Memoize the button style to prevent recalculation
   * useMemo caches the result
   */
  const buttonStyle = useMemo(() => [
    styles.addButton,
    item.stock === 0 && styles.disabledButton
  ], [item.stock]);

  const buttonTextStyle = useMemo(() => [
    styles.addButtonText,
    item.stock === 0 && styles.disabledButtonText
  ], [item.stock]);

  const stockStyle = useMemo(() => [
    styles.productStock,
    item.stock < 10 ? styles.lowStock : styles.goodStock
  ], [item.stock]);

  return (
    <View style={styles.productCard}>
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productDescription}>{item.description}</Text>
        <Text style={styles.productCategory}>Category: {item.category}</Text>
        <View style={styles.priceStockContainer}>
          <Text style={styles.productPrice}>₹{item.price}</Text>
          <Text style={stockStyle}>
            Stock: {item.stock}
          </Text>
        </View>
      </View>
      
      <TouchableOpacity
        style={buttonStyle}
        onPress={() => onAddToCart(item)}
        disabled={item.stock === 0}
      >
        <Text style={buttonTextStyle}>
          {item.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </Text>
      </TouchableOpacity>
    </View>
  );
});

// Set display name for debugging
ProductCard.displayName = 'ProductCard';

/**
 * MAIN PRODUCT LIST SCREEN COMPONENT
 */
const ProductListScreen = ({ navigation }) => {
  // Context hooks
  const { user } = useUser();
  const userRole = user?.role || 'b2c';
  const { addItemToCart, items: cart, itemCount } = useCart();
  const { theme, mode, toggleTheme } = useThemeMode();
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  
  // Custom hook for products - handles fetching and filtering
  // This hook uses JavaScript fetch internally to get products from API
  const { products, isLoading, error, refreshProducts } = useProducts(searchQuery);

  const styles = useMemo(() => createStyles(theme), [theme]);

  /**
   * Handle adding product to cart
   * useCallback memoizes this function - prevents recreation on every render
   * This prevents memory leaks and unnecessary re-renders of ProductCard
   * (React Memoization concept)
   */
  const handleAddToCart = useCallback((product) => {
    addItemToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.category,
    });
    Alert.alert('Success', `${product.name} added to cart!`);
  }, [addItemToCart]);

  /**
   * Render function for FlatList
   * useCallback prevents function recreation - important for FlatList performance
   * FlatList uses this function reference to determine if items need re-rendering
   */
  const renderProduct = useCallback(
    ({ item }) => (
      <ProductCard
        item={item}
        onAddToCart={handleAddToCart}
        userRole={userRole}
        styles={styles}
      />
    ),
    [handleAddToCart, userRole, styles]
  );

  /**
   * Key extractor for FlatList
   * useCallback memoizes this function
   * FlatList needs this to uniquely identify each item
   */
  const keyExtractor = useCallback((item) => item.id, []);

  /**
   * Get bulk discount info
   * useMemo caches the result - only recalculates when userRole changes
   */
  const bulkDiscountInfo = useMemo(() => {
    if (userRole === 'b2b') {
      return (
        <View style={styles.bulkInfo}>
          <Text style={styles.bulkInfoText}>
            🏢 B2B Mode: Bulk orders available with special pricing
          </Text>
        </View>
      );
    }
    return null;
  }, [userRole]);

  /**
   * Header title based on user role
   * useMemo prevents recalculation on every render
   */
  const headerTitle = useMemo(() => {
    if (userRole === 'b2b') return 'Wholesale Products';
    if (userRole === 'admin') return 'Inventory Management';
    return 'Products';
  }, [userRole]);

  // Show loading state
  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    );
  }

  // Show error state
  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refreshProducts}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <Text style={styles.headerTitle}>{headerTitle}</Text>
          <TouchableOpacity
            style={styles.themeToggle}
            onPress={toggleTheme}
          >
            <Text style={styles.themeToggleText}>
              {mode === 'dark' ? 'Light' : 'Dark'}
            </Text>
          </TouchableOpacity>
        </View>
        {bulkDiscountInfo}
      </View>

      {/* Search Input */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search products..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholderTextColor={theme.textSecondary}
      />

      {/* 
        FLATLIST - Virtual Scrolling
        FlatList uses virtual scrolling - only renders visible items.
        This makes it very efficient for large lists.
        
        Key optimizations:
        - getItemLayout: Helps FlatList calculate item positions (if items have fixed height)
        - removeClippedSubviews: Removes off-screen views from native view hierarchy
        - maxToRenderPerBatch: Controls how many items render per batch
        - windowSize: Controls how many screen lengths to render ahead
        - initialNumToRender: Number of items to render initially
      */}
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.productList}
        // Virtual scrolling optimizations
        removeClippedSubviews={true}        // Remove off-screen views
        maxToRenderPerBatch={10}            // Render 10 items per batch
        windowSize={5}                       // Render 5 screen lengths ahead
        initialNumToRender={10}              // Render 10 items initially
        updateCellsBatchingPeriod={50}       // Batch updates every 50ms
        // Performance optimizations
        getItemLayout={(data, index) => ({
          length: 200,  // Approximate item height
          offset: 200 * index,
          index,
        })}
      />

      {/* Cart Button - Only show if cart has items */}
      {itemCount > 0 && (
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => navigation.navigate('Cart')}
        >
          <Text style={styles.cartButtonText}>
            Cart ({itemCount} items)
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// React Native Styling using StyleSheet
// Styles depend on current theme (light / dark)
const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: theme.card,
    padding: 20,
    paddingTop: 50,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.textPrimary,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  themeToggle: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: theme.background,
    borderWidth: 1,
    borderColor: theme.border,
  },
  themeToggleText: {
    color: theme.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  bulkInfo: {
    backgroundColor: theme.mode === 'dark' ? theme.background : '#e8f5e8',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  bulkInfoText: {
    color: theme.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  searchInput: {
    backgroundColor: theme.card,
    margin: 15,
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: theme.border,
    color: theme.textPrimary,
  },
  productList: {
    padding: 15,
    paddingBottom: 100, // Space for cart button
  },
  productCard: {
    backgroundColor: theme.card,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productInfo: {
    marginBottom: 15,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.textPrimary,
    marginBottom: 5,
  },
  productDescription: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 5,
  },
  productCategory: {
    fontSize: 12,
    color: theme.textSecondary,
    marginBottom: 10,
  },
  priceStockContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.mode === 'dark' ? theme.textPrimary : '#27ae60',
  },
  productStock: {
    fontSize: 14,
    fontWeight: '500',
  },
  goodStock: {
    color: theme.success,
  },
  lowStock: {
    color: theme.danger,
  },
  addButton: {
    backgroundColor: theme.accent,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#bdc3c7',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButtonText: {
    color: '#7f8c8d',
  },
  cartButton: {
    position: 'absolute',
    bottom: 20,
    left: 15,
    right: 15,
    backgroundColor: theme.accent,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  cartButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: theme.textSecondary,
  },
  errorText: {
    fontSize: 16,
    color: theme.danger,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: theme.accent,
    padding: 12,
    borderRadius: 8,
    paddingHorizontal: 20,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProductListScreen;
