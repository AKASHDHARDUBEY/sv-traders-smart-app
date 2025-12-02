/**
 * CART SCREEN - Shopping cart and checkout
 * 
 * This screen demonstrates:
 * - useContext: Accessing cart and user context
 * - useMemo: Memoizing calculated values (discounts, totals)
 * - useCallback: Memoizing functions to prevent re-renders
 * - React.memo: Memoizing cart item components
 * - React Native Styling: Creating beautiful cart UI
 * 
 * Features:
 * - View cart items
 * - Update quantities
 * - Remove items
 * - Calculate totals with B2B discounts
 * - Place orders
 */

import React, { useState, useMemo, useCallback, memo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { useThemeMode } from '../theme/ThemeContext';

/**
 * CART ITEM COMPONENT
 *
 * React.memo prevents re-rendering unless props change.
 * Styles are passed in so it works with themed styles created
 * inside the CartScreen component.
 */
const CartItem = memo(({ item, onQuantityChange, onRemove, styles }) => {
  return (
    <View style={styles.cartItem}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>
          ₹{item.price} x {item.quantity || 1} = ₹{(item.price * (item.quantity || 1)).toFixed(2)}
        </Text>
      </View>
      
      <View style={styles.quantityContainer}>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => onQuantityChange(item.id, -1)}
        >
          <Text style={styles.quantityButtonText}>-</Text>
        </TouchableOpacity>
        
        <Text style={styles.quantityText}>
          {item.quantity || 1}
        </Text>
        
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => onQuantityChange(item.id, 1)}
        >
          <Text style={styles.quantityButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

CartItem.displayName = 'CartItem';

/**
 * MAIN CART SCREEN COMPONENT
 */
const CartScreen = ({ navigation }) => {
  // Get cart data and functions from context
  const { 
    items: cart, 
    removeItemFromCart, 
    clearCart, 
    cartTotal, 
    updateItemQuantity,
    itemCount 
  } = useCart();
  
  // Get user data from context
  const { user } = useUser();
  const userRole = user?.role || 'b2c';
  const { theme } = useThemeMode();
  
  // Customer information state
  const [customerInfo, setCustomerInfo] = useState({
    name: user?.username || '',
    phone: '',
    address: '',
  });

  /**
   * Calculate discount and total
   * useMemo caches the result - only recalculates when cartTotal or userRole changes
   * This is React Memoization - prevents unnecessary calculations
   */
  const totals = useMemo(() => {
    const discount = userRole === 'b2b' ? cartTotal * 0.1 : 0;
    const total = cartTotal - discount;
    
    return {
      subtotal: cartTotal,
      discount: discount,
      total: total
    };
  }, [cartTotal, userRole]);

  /**
   * Handle quantity change
   * useCallback memoizes this function - prevents recreation
   * This prevents CartItem from re-rendering unnecessarily
   */
  const handleQuantityChange = useCallback((productId, change) => {
    const item = cart.find(item => item.id === productId);
    if (item) {
      const newQuantity = (item.quantity || 1) + change;
      if (newQuantity > 0) {
        updateItemQuantity(productId, newQuantity);
      } else {
        removeItemFromCart(productId);
      }
    }
  }, [cart, updateItemQuantity, removeItemFromCart]);

  /**
   * Handle place order
   * useCallback prevents function recreation
   */
  const handlePlaceOrder = useCallback(() => {
    if (cart.length === 0) {
      Alert.alert('Error', 'Your cart is empty');
      return;
    }

    if (!customerInfo.name || !customerInfo.phone) {
      Alert.alert('Error', 'Please fill in your name and phone number');
      return;
    }
    
    // Generate order ID
    const orderId = Math.floor(Math.random() * 10000);
    
    Alert.alert(
      'Order Placed!',
      `Thank you ${customerInfo.name}!\n\nOrder Total: ₹${totals.total.toFixed(2)}\nItems: ${cart.length}\n\nOrder ID: #${orderId}`,
      [
        {
          text: 'OK',
          onPress: () => {
            clearCart();
            navigation.navigate('ProductList');
          },
        },
      ]
    );
  }, [cart, customerInfo, totals, clearCart, navigation]);

  /**
   * Navigate to scanner
   * useCallback memoizes this function
   */
  const handleScanMore = useCallback(() => {
    navigation.navigate('Scanner');
  }, [navigation]);

  /**
   * Update customer info field
   * useCallback prevents recreation
   */
  const updateCustomerInfo = useCallback((field, value) => {
    setCustomerInfo(prev => ({ ...prev, [field]: value }));
  }, []);

  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Shopping Cart</Text>
        <Text style={styles.cartCount}>{itemCount} items</Text>
      </View>

      {/* Empty Cart State */}
      {cart.length === 0 ? (
        <View style={styles.emptyCart}>
          <Text style={styles.emptyCartText}>Your cart is empty</Text>
          <TouchableOpacity
            style={styles.continueShoppingButton}
            onPress={() => navigation.navigate('ProductList')}
          >
            <Text style={styles.continueShoppingText}>Continue Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Cart Items */}
          <View style={styles.cartItems}>
            {cart.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onQuantityChange={handleQuantityChange}
                onRemove={removeItemFromCart}
                styles={styles}
              />
            ))}
          </View>

          {/* Customer Information Form */}
          <View style={styles.customerInfo}>
            <Text style={styles.sectionTitle}>Customer Information</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={customerInfo.name}
              onChangeText={(text) => updateCustomerInfo('name', text)}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              value={customerInfo.phone}
              onChangeText={(text) => updateCustomerInfo('phone', text)}
              keyboardType="phone-pad"
            />
            
            <TextInput
              style={[styles.input, styles.addressInput]}
              placeholder="Delivery Address"
              value={customerInfo.address}
              onChangeText={(text) => updateCustomerInfo('address', text)}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Order Summary */}
          <View style={styles.orderSummary}>
            <Text style={styles.sectionTitle}>Order Summary</Text>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal:</Text>
              <Text style={styles.summaryValue}>₹{totals.subtotal.toFixed(2)}</Text>
            </View>
            
            {/* B2B Discount */}
            {userRole === 'b2b' && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>B2B Discount (10%):</Text>
                <Text style={[styles.summaryValue, styles.discountValue]}>
                  -₹{totals.discount.toFixed(2)}
                </Text>
              </View>
            )}
            
            {/* Total */}
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>₹{totals.total.toFixed(2)}</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.scanButton]}
              onPress={handleScanMore}
            >
              <Text style={styles.buttonText}>Scan More Items</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.placeOrderButton]}
              onPress={handlePlaceOrder}
            >
              <Text style={styles.buttonText}>Place Order</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </ScrollView>
  );
};

// React Native Styling depends on current theme
const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    backgroundColor: theme.card,
    padding: 20,
    paddingTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  cartCount: {
    fontSize: 16,
    color: theme.textSecondary,
  },
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 300,
  },
  emptyCartText: {
    fontSize: 18,
    color: theme.textSecondary,
    marginBottom: 20,
  },
  continueShoppingButton: {
    backgroundColor: theme.accent,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
  },
  continueShoppingText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cartItems: {
    backgroundColor: theme.card,
    margin: 15,
    borderRadius: 12,
    padding: 15,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textPrimary,
    marginBottom: 5,
  },
  itemPrice: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 15,
  },
  quantityButton: {
    backgroundColor: theme.accent,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 15,
    minWidth: 20,
    textAlign: 'center',
  },
  customerInfo: {
    backgroundColor: theme.card,
    margin: 15,
    borderRadius: 12,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.textPrimary,
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: theme.background,
    color: theme.textPrimary,
  },
  addressInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  orderSummary: {
    backgroundColor: theme.card,
    margin: 15,
    borderRadius: 12,
    padding: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: theme.textPrimary,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textPrimary,
  },
  discountValue: {
    color: theme.success,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: theme.border,
    marginTop: 10,
    paddingTop: 15,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.textPrimary,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.success,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 15,
    marginTop: 20,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  scanButton: {
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.accent,
  },
  placeOrderButton: {
    backgroundColor: theme.accent,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CartScreen;
