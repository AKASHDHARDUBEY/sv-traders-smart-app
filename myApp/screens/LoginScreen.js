/**
 * LOGIN SCREEN - User authentication
 * 
 * This screen demonstrates:
 * - useState: Managing form input state
 * - useContext: Accessing user context for login
 * - Navigation: Using navigation to move between screens
 * - React Native Styling: Creating beautiful UI with StyleSheet
 * - useCallback: Memoizing functions to prevent re-renders
 * 
 * Users can:
 * - Enter username and password
 * - Select their role (B2C, B2B, or Admin)
 * - Login and navigate to main app
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useUser } from '../context/UserContext';

/**
 * LoginScreen Component
 */
const LoginScreen = ({ navigation }) => {
  // Form state using useState
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  
  // Get login function from user context
  const { login } = useUser();

  /**
   * Role options for user selection
   * useMemo caches this array - prevents recreation on every render
   */
  const roles = useMemo(() => [
    { 
      id: 'b2c', 
      title: 'Retail Customer (B2C)', 
      description: 'Buy small quantities' 
    },
    { 
      id: 'b2b', 
      title: 'Wholesale Buyer (B2B)', 
      description: 'Place bulk orders' 
    },
    { 
      id: 'admin', 
      title: 'SV Traders Admin', 
      description: 'Manage inventory & orders' 
    },
  ], []);

  /**
   * Handle login button press
   * useCallback memoizes this function - prevents recreation
   * This is important for performance (React Memoization)
   */
  const handleLogin = useCallback(() => {
    // Basic validation
    if (!username || !password || !selectedRole) {
      Alert.alert('Error', 'Please fill all fields and select a role');
      return;
    }

    if (username.length < 3 || password.length < 3) {
      Alert.alert('Error', 'Username and password must be at least 3 characters');
      return;
    }

    // Simple authentication logic
    // In a real app, you would validate against your backend API here
    try {
      console.log('Login attempt with:', { username, role: selectedRole });
      
      // Set user in context (this also saves to AsyncStorage via context)
      login({
        username,
        role: selectedRole
      });
      
      // Navigate to MainApp
      // reset() clears navigation history so user can't go back to login
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainApp' }]
      });
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Login Failed', 'An error occurred during login. Please try again.');
    }
  }, [username, password, selectedRole, login, navigation]);

  /**
   * Handle role selection
   * useCallback prevents function recreation
   */
  const handleRoleSelect = useCallback((roleId) => {
    setSelectedRole(roleId);
  }, []);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.title}>SV Traders</Text>
          <Text style={styles.subtitle}>Smart B2B & B2C Retail App</Text>
        </View>

        {/* Login Form */}
        <View style={styles.form}>
          <Text style={styles.formTitle}>Login</Text>
          
          {/* Username Input */}
          <TextInput
            style={styles.input}
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
          />
          
          {/* Password Input */}
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />

          {/* Role Selection */}
          <Text style={styles.roleTitle}>Select Your Role:</Text>
          {roles.map((role) => (
            <TouchableOpacity
              key={role.id}
              style={[
                styles.roleButton,
                selectedRole === role.id && styles.roleButtonSelected
              ]}
              onPress={() => handleRoleSelect(role.id)}
            >
              <Text style={[
                styles.roleButtonText,
                selectedRole === role.id && styles.roleButtonTextSelected
              ]}>
                {role.title}
              </Text>
              <Text style={styles.roleDescription}>{role.description}</Text>
            </TouchableOpacity>
          ))}

          {/* Login Button */}
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// React Native Styling
// StyleSheet.create optimizes styles and validates them
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  form: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 15,
    marginTop: 10,
  },
  roleButton: {
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
  },
  roleButtonSelected: {
    borderColor: '#3498db',
    backgroundColor: '#e3f2fd',
  },
  roleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 5,
  },
  roleButtonTextSelected: {
    color: '#3498db',
  },
  roleDescription: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  loginButton: {
    backgroundColor: '#3498db',
    borderRadius: 10,
    padding: 15,
    marginTop: 20,
    alignItems: 'center',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
