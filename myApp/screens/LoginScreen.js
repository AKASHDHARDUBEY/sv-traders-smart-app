import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { useUser } from '../context/UserContext';

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const { login } = useUser();

  const handleLogin = () => {
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
    try {
      // For demo purposes, accept any username/password
      // In a real app, you would validate against your backend here
      console.log('Login attempt with:', { username, role: selectedRole });
      
      // Set user in context
      login({
        username,
        role: selectedRole
      });
      
      // Navigate to MainApp
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainApp' }]
      });
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Login Failed', 'An error occurred during login. Please try again.');
    }
  };

  const roles = [
    { id: 'b2c', title: 'Retail Customer (B2C)', description: 'Buy small quantities' },
    { id: 'b2b', title: 'Wholesale Buyer (B2B)', description: 'Place bulk orders' },
    { id: 'admin', title: 'SV Traders Admin', description: 'Manage inventory & orders' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>SV Traders</Text>
        <Text style={styles.subtitle}>Smart B2B & B2C Retail App</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.formTitle}>Login</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Text style={styles.roleTitle}>Select Your Role:</Text>
        {roles.map((role) => (
          <TouchableOpacity
            key={role.id}
            style={[
              styles.roleButton,
              selectedRole === role.id && styles.roleButtonSelected
            ]}
            onPress={() => setSelectedRole(role.id)}
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

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 20,
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
