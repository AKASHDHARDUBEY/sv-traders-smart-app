/**
 * SCANNER SCREEN - Barcode/QR Code Scanner
 * 
 * This screen demonstrates:
 * - expo-camera: Using camera for barcode scanning
 * - useCameraPermissions: Managing camera permissions
 * - CameraView: Live camera feed component
 * - Custom hooks: Using useCamera hook
 * - Error handling: Proper permission and error management
 * - useCallback: Memoizing functions to prevent memory leaks
 * 
 * The camera provides live feed and scans barcodes/QR codes.
 */

import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../context/CartContext';

/**
 * ScannerScreen Component
 * 
 * Uses expo-camera to scan barcodes and QR codes.
 * When a barcode is scanned, it adds the product to cart.
 */
const ScannerScreen = () => {
  // Navigation hook
  const navigation = useNavigation();
  
  // Cart context
  const { addItemToCart } = useCart();
  
  // Camera permissions hook from expo-camera
  const [permission, requestPermission] = useCameraPermissions();
  
  // Local state
  const [scanned, setScanned] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * Request camera permission
   * useCallback memoizes this function to prevent recreation
   * This prevents memory leaks (React Memoization)
   */
  const handleRequestPermission = useCallback(async () => {
    try {
      const { status } = await requestPermission();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Camera permission is required to scan barcodes. Please enable it in settings.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      Alert.alert('Error', 'Failed to request camera permission');
    }
  }, [requestPermission]);

  // Automatically ask for permission on first mount
  useEffect(() => {
    if (!permission || !permission.granted) {
      handleRequestPermission();
    }
  }, [permission, handleRequestPermission]);

  /**
   * Handle barcode scan
   * useCallback prevents function recreation (prevents memory leaks)
   * 
   * When barcode is scanned:
   * 1. Stop scanning temporarily
   * 2. Create mock product (in real app, fetch from API)
   * 3. Add to cart
   * 4. Show alert with options
   */
  const handleBarCodeScanned = useCallback(({ type, data }) => {
    // Prevent multiple scans
    if (scanned || isProcessing) return;
    
    setIsProcessing(true);
    setScanned(true);
    
    // In a real app, you would fetch product data from API using the barcode
    // Example: const product = await fetchProductByBarcode(data);
    
    // Mock product for demonstration
    const mockProduct = {
      id: `scanned_${data.substring(0, 8)}`,  // Unique ID from barcode
      name: `Product ${data.substring(0, 5)}`,
      price: Math.floor(Math.random() * 500) + 50,  // Random price 50-550
      barcode: data,
      scannedAt: new Date().toISOString(),
    };
    
    // Add to cart
    addItemToCart(mockProduct);
    
    // Show success alert
    Alert.alert(
      'Product Scanned Successfully!',
      `Added ${mockProduct.name} (₹${mockProduct.price}) to cart!`,
      [
        {
          text: 'Scan Again',
          onPress: () => {
            setScanned(false);
            setIsProcessing(false);
          },
        },
        {
          text: 'View Cart',
          onPress: () => {
            navigation.navigate('Cart');
            setScanned(false);
            setIsProcessing(false);
          },
        },
      ],
      { cancelable: true }
    );
  }, [scanned, isProcessing, addItemToCart, navigation]);

  // Show permission request screen if permission not granted
  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.messageText}>Requesting camera permission...</Text>
        <ActivityIndicator size="large" color="#3498db" style={styles.loader} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.messageText}>Camera permission is required</Text>
        <TouchableOpacity 
          style={styles.permissionButton} 
          onPress={handleRequestPermission}
        >
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  /**
   * MAIN CAMERA VIEW
   * 
   * CameraView provides live camera feed.
   * onBarcodeScanned is called when a barcode is detected.
   * We disable scanning when already scanned to prevent duplicates.
   */
  return (
    <View style={styles.container}>
      {/* Camera View - provides live feed */}
      <CameraView
        style={styles.camera}
        // Only scan if not already scanned (prevents duplicate scans)
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        // Configure which barcode types to scan
        barcodeScannerSettings={{
          barcodeTypes: [
            'ean13',    // European Article Number (13 digits)
            'ean8',     // European Article Number (8 digits)
            'upc_a',    // Universal Product Code A
            'upc_e',    // Universal Product Code E
            'qr',       // QR Code
            'code128',  // Code 128
            'code39',   // Code 39
          ],
        }}
      />
      
      {/* Overlay with scanning frame */}
      <View style={styles.overlay}>
        {/* Scanning frame - visual guide */}
        <View style={styles.scanFrame} />
        <Text style={styles.scanText}>
          {scanned ? 'Product Scanned!' : 'Position barcode within frame'}
        </Text>
      </View>
      
      {/* Button to scan again */}
      {scanned && (
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            setScanned(false);
            setIsProcessing(false);
          }}
        >
          <Text style={styles.buttonText}>Tap to Scan Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// Styles using React Native Styling
// StyleSheet.create optimizes styles and validates them
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',  // Semi-transparent overlay
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 3,
    borderColor: '#3498db',
    backgroundColor: 'transparent',
    borderRadius: 10,
  },
  scanText: {
    color: 'white',
    fontSize: 18,
    marginTop: 20,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 12,
    borderRadius: 8,
    fontWeight: '600',
  },
  button: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  permissionButton: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
  },
  messageText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  loader: {
    marginTop: 20,
  },
});

export default ScannerScreen;
