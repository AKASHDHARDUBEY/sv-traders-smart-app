import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { CartProvider } from './context/CartContext';
import { UserProvider, useUser } from './context/UserContext';

import LoginScreen from './screens/LoginScreen';
import ProductListScreen from './screens/ProductListScreen';
import CartScreen from './screens/CartScreen';
import ProfileScreen from './screens/ProfileScreen';
import AdminScreen from './screens/AdminScreen';
import ScannerScreen from './screens/ScannerScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  const { user } = useUser();
  const userRole = user?.role || 'b2c';
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

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
        tabBarActiveTintColor: '#3498db',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="ProductList" 
        component={ProductListScreen}
        options={{ title: 'Products' }}
      />
      <Tab.Screen 
        name="Scanner" 
        component={ScannerScreen}
        options={{ title: 'Scan' }}
      />
      <Tab.Screen 
        name="Cart" 
        component={CartScreen}
        options={{ title: 'Cart' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
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

function MainAppNavigator() {
  const { user } = useUser();

  return (
    <Stack.Navigator 
      key={user ? "main" : "login"}
      initialRouteName={user ? "MainApp" : "Login"}
      screenOptions={{
        headerShown: false,
        animationEnabled: false
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="MainApp" component={TabNavigator} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <UserProvider>
      <CartProvider>
        <NavigationContainer>
          <StatusBar style="auto" />
          <MainAppNavigator />
        </NavigationContainer>
      </CartProvider>
    </UserProvider>
  );
}
