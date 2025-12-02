/**
 * DRAWER NAVIGATOR - Side menu navigation
 * 
 * This file demonstrates React Native Drawer Navigator.
 * Drawer Navigator provides a side menu that slides in from the left.
 * 
 * To use this instead of Bottom Tab Navigator:
 * 1. Import this in App.js
 * 2. Replace TabNavigator with DrawerNavigator
 * 
 * Features:
 * - Side menu with navigation options
 * - Custom drawer content
 * - Gesture-based opening/closing
 */

import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../context/UserContext';
import { useCart } from '../context/CartContext';

// Note: Screens are already lazy-loaded in App.js, so we import them directly here
// If using DrawerNavigator standalone, uncomment the lazy imports below:
// import { lazy, Suspense } from 'react';
// const ProductListScreen = lazy(() => import('../screens/ProductListScreen'));
// const CartScreen = lazy(() => import('../screens/CartScreen'));
// const ProfileScreen = lazy(() => import('../screens/ProfileScreen'));
// const AdminScreen = lazy(() => import('../screens/AdminScreen'));
// const ScannerScreen = lazy(() => import('../screens/ScannerScreen'));

// Direct imports (screens are lazy-loaded in App.js)
import ProductListScreen from '../screens/ProductListScreen';
import CartScreen from '../screens/CartScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AdminScreen from '../screens/AdminScreen';
import ScannerScreen from '../screens/ScannerScreen';

const Drawer = createDrawerNavigator();

/**
 * Custom Drawer Content
 * This customizes what appears in the drawer menu
 */
const CustomDrawerContent = ({ navigation }) => {
  const { user, logout } = useUser();
  const { itemCount } = useCart();
  const userRole = user?.role || 'b2c';

  const handleLogout = () => {
    logout();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }]
    });
  };

  return (
    <View style={styles.drawerContainer}>
      {/* Drawer Header */}
      <View style={styles.drawerHeader}>
        <Text style={styles.drawerTitle}>SV Traders</Text>
        <Text style={styles.drawerSubtitle}>{user?.username || 'User'}</Text>
        <View style={[styles.roleBadge, { backgroundColor: getRoleColor(userRole) }]}>
          <Text style={styles.roleText}>{getRoleName(userRole)}</Text>
        </View>
      </View>

      {/* Navigation Items */}
      <View style={styles.drawerItems}>
        <TouchableOpacity
          style={styles.drawerItem}
          onPress={() => navigation.navigate('ProductList')}
        >
          <Ionicons name="list" size={24} color="#3498db" />
          <Text style={styles.drawerItemText}>Products</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.drawerItem}
          onPress={() => navigation.navigate('Scanner')}
        >
          <Ionicons name="barcode" size={24} color="#3498db" />
          <Text style={styles.drawerItemText}>Scanner</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.drawerItem}
          onPress={() => navigation.navigate('Cart')}
        >
          <Ionicons name="cart" size={24} color="#3498db" />
          <Text style={styles.drawerItemText}>Cart</Text>
          {itemCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{itemCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.drawerItem}
          onPress={() => navigation.navigate('Profile')}
        >
          <Ionicons name="person" size={24} color="#3498db" />
          <Text style={styles.drawerItemText}>Profile</Text>
        </TouchableOpacity>

        {userRole === 'admin' && (
          <TouchableOpacity
            style={styles.drawerItem}
            onPress={() => navigation.navigate('Admin')}
          >
            <Ionicons name="settings" size={24} color="#3498db" />
            <Text style={styles.drawerItemText}>Admin</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out" size={24} color="#e74c3c" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

// Helper functions
const getRoleName = (role) => {
  if (role === 'b2b') return 'B2B Buyer';
  if (role === 'b2c') return 'B2C Customer';
  if (role === 'admin') return 'Admin';
  return 'User';
};

const getRoleColor = (role) => {
  if (role === 'b2b') return '#f39c12';
  if (role === 'b2c') return '#3498db';
  if (role === 'admin') return '#e74c3c';
  return '#95a5a6';
};

/**
 * DRAWER NAVIGATOR COMPONENT
 * 
 * This creates a drawer navigation with all main screens.
 * The drawer can be opened by swiping from the left edge or tapping a menu button.
 */
export default function DrawerNavigator() {
  const { user } = useUser();
  const userRole = user?.role || 'b2c';

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#3498db',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        drawerActiveTintColor: '#3498db',
        drawerInactiveTintColor: '#7f8c8d',
      }}
    >
      <Drawer.Screen 
        name="ProductList" 
        component={ProductListScreen}
        options={{
          title: 'Products',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="list" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Scanner" 
        component={ScannerScreen}
        options={{
          title: 'Scanner',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="barcode" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Cart" 
        component={CartScreen}
        options={{
          title: 'Cart',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="cart" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          title: 'Profile',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
      {userRole === 'admin' && (
        <Drawer.Screen 
          name="Admin" 
          component={AdminScreen}
          options={{
            title: 'Admin',
            drawerIcon: ({ color, size }) => (
              <Ionicons name="settings" size={size} color={color} />
            ),
          }}
        />
      )}
    </Drawer.Navigator>
  );
}

// Styles
const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  drawerHeader: {
    backgroundColor: '#3498db',
    padding: 20,
    paddingTop: 50,
    alignItems: 'center',
  },
  drawerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  drawerSubtitle: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 10,
  },
  roleBadge: {
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
  },
  roleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  drawerItems: {
    flex: 1,
    paddingTop: 20,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  drawerItemText: {
    fontSize: 16,
    marginLeft: 15,
    color: '#2c3e50',
  },
  badge: {
    backgroundColor: '#e74c3c',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 'auto',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
    backgroundColor: '#fff',
  },
  logoutText: {
    fontSize: 16,
    marginLeft: 15,
    color: '#e74c3c',
    fontWeight: '600',
  },
});

