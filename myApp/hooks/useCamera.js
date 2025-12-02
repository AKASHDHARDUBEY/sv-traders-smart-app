/**
 * CUSTOM HOOK - useCamera
 * 
 * This custom hook encapsulates camera functionality.
 * It demonstrates:
 * - Custom hooks pattern
 * - Managing permissions
 * - Handling camera state
 * - Error handling
 * 
 * JavaScript Closure: Functions inside have access to outer scope variables.
 */

import { useState, useEffect, useCallback } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';

/**
 * Custom hook for camera functionality
 * @returns {object} - Camera state and functions
 */
export const useCamera = () => {
  // Camera permissions hook from expo-camera
  const [permission, requestPermission] = useCameraPermissions();
  
  // Local state
  const [hasPermission, setHasPermission] = useState(null);
  const [isScanning, setIsScanning] = useState(true);

  /**
   * Request camera permission when hook is used
   * useEffect runs once when component mounts
   */
  useEffect(() => {
    checkAndRequestPermission();
  }, []);

  /**
   * Check and request camera permission
   * async/await for handling asynchronous permission request
   */
  const checkAndRequestPermission = async () => {
    try {
      // Request permission if not already granted
      const { status } = await requestPermission();
      setHasPermission(status === 'granted');
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      setHasPermission(false);
    }
  };

  /**
   * Start scanning
   * useCallback prevents function recreation (React Memoization)
   */
  const startScanning = useCallback(() => {
    setIsScanning(true);
  }, []);

  /**
   * Stop scanning
   */
  const stopScanning = useCallback(() => {
    setIsScanning(false);
  }, []);

  return {
    hasPermission,
    isScanning,
    startScanning,
    stopScanning,
    permission,
    requestPermission: checkAndRequestPermission,
  };
};

