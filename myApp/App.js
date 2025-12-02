/**
 * MAIN APP COMPONENT
 * 
 * This file demonstrates:
 * - React Native Navigation (Stack Navigator, Bottom Tab Navigator)
 * - React Lazy Loading - screens are loaded only when needed
 * - useContext - accessing user context
 * - NavigationContainer - wraps all navigation
 * 
 * Navigation Types:
 * 1. Stack Navigator - for screen transitions (Login -> Main App)
 * 2. Bottom Tab Navigator - for main app navigation tabs (currently active)
 * 3. Drawer Navigator - side menu navigation (available in ./navigation/DrawerNavigator.js)
 * 
 * To switch to Drawer Navigator:
 * 1. Uncomment the DrawerNavigator import above
 * 2. Replace TabNavigator with DrawerNavigator in MainAppNavigator
 */

import React, { lazy, Suspense } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { CartProvider } from './context/CartContext';
import { UserProvider, useUser } from './context/UserContext';
// Uncomment to use Drawer Navigator instead of Bottom Tab Navigator:
// import DrawerNavigator from './navigation/DrawerNavigator';

/**
 * REACT LAZY LOADING
 * 
 * lazy() loads components only when they're needed, not all at once.
 * This improves initial app load time and reduces memory usage.
 * 
 * Benefits:
 * - Faster initial load
 * - Lower memory usage
 * - Better performance
 */
const LoginScreen = lazy(() => import('./screens/LoginScreen'));
const ProductListScreen = lazy(() => import('./screens/ProductListScreen'));
const CartScreen = lazy(() => import('./screens/CartScreen'));
const ProfileScreen = lazy(() => import('./screens/ProfileScreen'));
const AdminScreen = lazy(() => import('./screens/AdminScreen'));
const ScannerScreen = lazy(() => import('./screens/ScannerScreen'));

// Create navigators
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

/**
 * Loading component shown while lazy-loaded screens are loading
 * Suspense boundary catches loading state
 */
const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#3498db" />
    <Text style={styles.loadingText}>Loading...</Text>
  </View>
);

/**
 * TAB NAVIGATOR - Bottom navigation bar
 * 
 * Bottom Tab Navigator provides tabs at the bottom of screen.
 * Each tab shows a different screen.
 * 
 * Features:
 * - Icons change based on focus state
 * - Conditional tabs (Admin tab only for admin users)
 * - Custom styling
 */
function TabNavigator() {
  // Access user context to check role
  const { user } = useUser();
  const userRole = user?.role || 'b2c';
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        // Custom icon for each tab
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          // Choose icon based on route name
          if (route.name === 'ProductList') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Scanner') {
            iconName = focused ? 'barcode' : 'barcode-outline';
          } else if (route.name === 'Cart') {
            iconName = focused ? 'cart' : 'cart-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Admin') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        // Styling for tabs
        tabBarActiveTintColor: '#3498db',    // Color when tab is active
        tabBarInactiveTintColor: 'gray',      // Color when tab is inactive
        headerShown: false,                   // Hide default header
      })}
    >
      {/* Product List Tab */}
      <Tab.Screen 
        name="ProductList" 
        component={ProductListScreen}
        options={{ title: 'Products' }}
      />
      
      {/* Scanner Tab */}
      <Tab.Screen 
        name="Scanner" 
        component={ScannerScreen}
        options={{ title: 'Scan' }}
      />
      
      {/* Cart Tab */}
      <Tab.Screen 
        name="Cart" 
        component={CartScreen}
        options={{ title: 'Cart' }}
      />
      
      {/* Profile Tab */}
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
      
      {/* Admin Tab - Only visible for admin users */}
      {userRole === 'admin' && (
        <Tab.Screen 
          name="Admin" 
          component={AdminScreen}
          options={{ title: 'Admin' }}
        />
      )}
    </Tab.Navigator>
  );
}

/**
 * MAIN APP NAVIGATOR - Stack Navigator
 * 
 * Stack Navigator manages screen transitions.
 * It shows Login screen first, then Main App after login.
 * 
 * Features:
 * - Conditional routing based on user login state
 * - Smooth transitions between screens
 */
function MainAppNavigator() {
  const { user } = useUser();

  return (
    <Stack.Navigator 
      // Key changes when user logs in/out to reset navigation state
      key={user ? "main" : "login"}
      // Show Login if no user, MainApp if user exists
      initialRouteName={user ? "MainApp" : "Login"}
      screenOptions={{
        headerShown: false,
        animationEnabled: false  // Disable animation for faster transitions
      }}
    >
      {/* Login Screen */}
      <Stack.Screen name="Login" component={LoginScreen} />
      
      {/* Main App (contains Tab Navigator) */}
      <Stack.Screen name="MainApp" component={TabNavigator} />
    </Stack.Navigator>
  );
}

/**
 * ROOT APP COMPONENT
 * 
 * This is the main entry point of the app.
 * 
 * Structure:
 * 1. UserProvider - Provides user context to all children
 * 2. CartProvider - Provides cart context to all children
 * 3. NavigationContainer - Wraps all navigation
 * 4. Suspense - Handles lazy loading of screens
 * 5. MainAppNavigator - Contains all navigation logic
 * 
 * Context Providers must wrap NavigationContainer so all screens
 * can access context data.
 */
export default function App() {
  return (
    <UserProvider>
      <CartProvider>
        <NavigationContainer>
          <StatusBar style="auto" />
          {/* Suspense shows loading screen while lazy-loaded components load */}
          <Suspense fallback={<LoadingScreen />}>
            <MainAppNavigator />
          </Suspense>
        </NavigationContainer>
      </CartProvider>
    </UserProvider>
  );
}

// Styles for loading screen
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#7f8c8d',
  },
});
