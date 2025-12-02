import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import { useUser } from '../context/UserContext';

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useUser();
  const userRole = user?.role || 'b2c';
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: userRole === 'admin' ? 'Admin User' : user?.username || 'John Doe',
    email: userRole === 'admin' ? 'admin@svtraders.com' : 'john@example.com',
    phone: '+91 98765 43210',
    address: '123 Main Street, City, State - 12345',
    businessName: userRole === 'b2b' ? 'Wholesale Business' : '',
    gstNumber: userRole === 'b2b' ? '22ABCDE1234F1Z5' : '',
  });

  const handleSave = () => {
    setIsEditing(false);
    Alert.alert('Success', 'Profile updated successfully!');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => {
            logout();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }]
            });
          }
        },
      ]
    );
  };

  const getRoleDisplayName = () => {
    if (userRole === 'b2b') return 'Wholesale Buyer (B2B)';
    if (userRole === 'b2c') return 'Retail Customer (B2C)';
    if (userRole === 'admin') return 'SV Traders Admin';
    return 'User';
  };

  const getRoleColor = () => {
    if (userRole === 'b2b') return '#f39c12';
    if (userRole === 'b2c') return '#3498db';
    if (userRole === 'admin') return '#e74c3c';
    return '#95a5a6';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.roleBadge, { backgroundColor: getRoleColor() }]}>
          <Text style={styles.roleText}>{getRoleDisplayName()}</Text>
        </View>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <Text style={styles.profileTitle}>Profile Information</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setIsEditing(!isEditing)}
          >
            <Text style={styles.editButtonText}>
              {isEditing ? 'Cancel' : 'Edit'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Name</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={profile.name}
              onChangeText={(text) => setProfile({...profile, name: text})}
            />
          ) : (
            <Text style={styles.fieldValue}>{profile.name}</Text>
          )}
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Email</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={profile.email}
              onChangeText={(text) => setProfile({...profile, email: text})}
              keyboardType="email-address"
            />
          ) : (
            <Text style={styles.fieldValue}>{profile.email}</Text>
          )}
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Phone</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={profile.phone}
              onChangeText={(text) => setProfile({...profile, phone: text})}
              keyboardType="phone-pad"
            />
          ) : (
            <Text style={styles.fieldValue}>{profile.phone}</Text>
          )}
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Address</Text>
          {isEditing ? (
            <TextInput
              style={[styles.input, styles.addressInput]}
              value={profile.address}
              onChangeText={(text) => setProfile({...profile, address: text})}
              multiline
              numberOfLines={3}
            />
          ) : (
            <Text style={styles.fieldValue}>{profile.address}</Text>
          )}
        </View>

        {userRole === 'b2b' && (
          <>
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Business Name</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={profile.businessName}
                  onChangeText={(text) => setProfile({...profile, businessName: text})}
                />
              ) : (
                <Text style={styles.fieldValue}>{profile.businessName}</Text>
              )}
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>GST Number</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={profile.gstNumber}
                  onChangeText={(text) => setProfile({...profile, gstNumber: text})}
                />
              ) : (
                <Text style={styles.fieldValue}>{profile.gstNumber}</Text>
              )}
            </View>
          </>
        )}

        {isEditing && (
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>Account Statistics</Text>
        
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Orders Placed</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>₹2,450</Text>
            <Text style={styles.statLabel}>Total Spent</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>Pending Orders</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>4.8★</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
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
  roleBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  roleText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  profileCard: {
    backgroundColor: 'white',
    margin: 15,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  editButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7f8c8d',
    marginBottom: 8,
  },
  fieldValue: {
    fontSize: 16,
    color: '#2c3e50',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  addressInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#27ae60',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statsCard: {
    backgroundColor: 'white',
    margin: 15,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3498db',
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 5,
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
    margin: 15,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
