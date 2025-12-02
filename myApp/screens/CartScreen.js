import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Button,
} from 'react-native';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';

const CartScreen = ({ navigation }) => {
  const { 
    items: cart, 
    removeItemFromCart, 
    clearCart, 
    cartTotal, 
    updateItemQuantity,
    itemCount 
  } = useCart();
  
  const { user } = useUser();
  const userRole = user?.role || 'b2c';
  
  const [customerInfo, setCustomerInfo] = useState({
    name: user?.username || '',
    phone: '',
    address: '',
  });

  // Debug log
  useEffect(() => {
    console.log('CartScreen - Current cart items:', cart);
    console.log('CartScreen - Cart total:', cartTotal);
    console.log('CartScreen - Item count:', itemCount);
  }, [cart, cartTotal, itemCount]);

  const handleQuantityChange = (productId, change) => {
    const item = cart.find(item => item.id === productId);
    if (item) {
      const newQuantity = (item.quantity || 1) + change;
      if (newQuantity > 0) {
        updateItemQuantity(productId, newQuantity);
      } else {
        removeItemFromCart(productId);
      }
    }
  };

  const discount = userRole === 'b2b' ? cartTotal * 0.1 : 0;
  const total = cartTotal - discount;
  
  const totals = {
    subtotal: cartTotal,
    discount: discount,
    total: total
  };

  const handlePlaceOrder = () => {
    if (cart.length === 0) {
      Alert.alert('Error', 'Your cart is empty');
      return;
    }

    if (!customerInfo.name || !customerInfo.phone) {
      Alert.alert('Error', 'Please fill in your name and phone number');
      return;
    }
    
    Alert.alert(
      'Order Placed!',
      `Thank you ${customerInfo.name}!\n\nOrder Total: ₹${total.toFixed(2)}\nItems: ${cart.length}\n\nOrder ID: #${Math.floor(Math.random() * 10000)}`,
      [
        {
          text: 'OK',
          onPress: () => {
            clearCart();
            navigation.navigate('Home');
          },
        },
      ]
    );
  };

  const handleScanMore = () => {
    navigation.navigate('Scanner');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Shopping Cart</Text>
        <Text style={styles.cartCount}>{itemCount} items</Text>
      </View>

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
          <View style={styles.cartItems}>
            {cart.map((item) => (
              <View key={item.id} style={styles.cartItem}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemPrice}>
                    ₹{item.price} x {item.quantity || 1} = ₹{(item.price * (item.quantity || 1)).toFixed(2)}
                  </Text>
                </View>
                
                <View style={styles.quantityContainer}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => handleQuantityChange(item.id, -1)}
                  >
                    <Text style={styles.quantityButtonText}>-</Text>
                  </TouchableOpacity>
                  
                  <Text style={styles.quantityText}>
                    {item.quantity || 1}
                  </Text>
                  
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => handleQuantityChange(item.id, 1)}
                  >
                    <Text style={styles.quantityButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.customerInfo}>
            <Text style={styles.sectionTitle}>Customer Information</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={customerInfo.name}
              onChangeText={(text) => setCustomerInfo({...customerInfo, name: text})}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              value={customerInfo.phone}
              onChangeText={(text) => setCustomerInfo({...customerInfo, phone: text})}
              keyboardType="phone-pad"
            />
            
            <TextInput
              style={[styles.input, styles.addressInput]}
              placeholder="Delivery Address"
              value={customerInfo.address}
              onChangeText={(text) => setCustomerInfo({...customerInfo, address: text})}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.orderSummary}>
            <Text style={styles.sectionTitle}>Order Summary</Text>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal:</Text>
              <Text style={styles.summaryValue}>₹{totals.subtotal}</Text>
            </View>
            
            {userRole === 'b2b' && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>B2B Discount (10%):</Text>
                <Text style={[styles.summaryValue, styles.discountValue]}>
                  -₹{totals.discount}
                </Text>
              </View>
            )}
            
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>₹{totals.total}</Text>
            </View>
          </View>

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
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
    color: '#2c3e50',
  },
  cartCount: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyCartText: {
    fontSize: 18,
    color: '#7f8c8d',
    marginBottom: 20,
  },
  continueShoppingButton: {
    backgroundColor: '#3498db',
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
    backgroundColor: 'white',
    margin: 15,
    borderRadius: 12,
    padding: 15,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 5,
  },
  itemPrice: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 15,
  },
  quantityButton: {
    backgroundColor: '#3498db',
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
  itemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27ae60',
    minWidth: 60,
    textAlign: 'right',
  },
  customerInfo: {
    backgroundColor: 'white',
    margin: 15,
    borderRadius: 12,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
  },
  addressInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  orderSummary: {
    backgroundColor: 'white',
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
    color: '#2c3e50',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  discountValue: {
    color: '#27ae60',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
    marginTop: 10,
    paddingTop: 15,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    backgroundColor: '#34C759',
  },
  placeOrderButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CartScreen;
