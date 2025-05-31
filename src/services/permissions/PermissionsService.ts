/**
 * =================================================================
 * PERMISSIONS SERVICE
 * =================================================================
 *
 * This service handles all permission-related operations for the app:
 * - Camera permissions for taking photos
 * - Photo library permissions for selecting existing images
 * - Permission status checking and requesting
 * - User-friendly error messages and guidance
 *
 * Features:
 * - ✅ Cross-platform permission handling
 * - ✅ User-friendly permission flow
 * - ✅ Comprehensive error messaging
 * - ✅ TypeScript type safety
 * =================================================================
 */

import { Platform, Alert, Linking } from 'react-native';
import { 
  check, 
  request, 
  PERMISSIONS, 
  RESULTS, 
  Permission,
  PermissionStatus 
} from 'react-native-permissions';

/**
 * =================================================================
 * PERMISSIONS SERVICE CLASS
 * =================================================================
 *
 * Handles all permission requests and status checks
 */
export class PermissionsService {
  
  /**
   * Camera permission for iOS and Android
   */
  private static getCameraPermission(): Permission {
    return Platform.OS === 'ios' 
      ? PERMISSIONS.IOS.CAMERA 
      : PERMISSIONS.ANDROID.CAMERA;
  }

  /**
   * Photo library permission for iOS and Android
   */
  private static getPhotoLibraryPermission(): Permission {
    return Platform.OS === 'ios' 
      ? PERMISSIONS.IOS.PHOTO_LIBRARY 
      : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
  }

  /**
   * Checks current camera permission status
   * 
   * @returns Promise<PermissionStatus> - Current permission status
   */
  static async checkCameraPermission(): Promise<PermissionStatus> {
    try {
      const permission = this.getCameraPermission();
      return await check(permission);
    } catch (error) {
      console.error('Error checking camera permission:', error);
      return RESULTS.UNAVAILABLE;
    }
  }

  /**
   * Checks current photo library permission status
   * 
   * @returns Promise<PermissionStatus> - Current permission status
   */
  static async checkPhotoLibraryPermission(): Promise<PermissionStatus> {
    try {
      const permission = this.getPhotoLibraryPermission();
      return await check(permission);
    } catch (error) {
      console.error('Error checking photo library permission:', error);
      return RESULTS.UNAVAILABLE;
    }
  }

  /**
   * Requests camera permission with user-friendly messaging
   * 
   * @returns Promise<boolean> - True if permission granted
   */
  static async requestCameraPermission(): Promise<boolean> {
    try {
      console.log('Requesting camera permission...');
      
      const permission = this.getCameraPermission();
      const currentStatus = await check(permission);
      
      // If already granted, return true
      if (currentStatus === RESULTS.GRANTED) {
        console.log('Camera permission already granted');
        return true;
      }
      
      // If denied or blocked, show guidance
      if (currentStatus === RESULTS.DENIED || currentStatus === RESULTS.BLOCKED) {
        const shouldRequest = await this.showPermissionRationale(
          'Camera Permission Required',
          'This app needs access to your camera to scan trading cards for identification and grading. Please grant camera permission to continue.'
        );
        
        if (!shouldRequest) {
          return false;
        }
        
        // If blocked, guide to settings
        if (currentStatus === RESULTS.BLOCKED) {
          this.showSettingsAlert('Camera Permission');
          return false;
        }
      }
      
      // Request permission
      const result = await request(permission);
      const granted = result === RESULTS.GRANTED;
      
      console.log('Camera permission result:', result);
      
      if (!granted) {
        this.showPermissionDeniedAlert('Camera');
      }
      
      return granted;
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      return false;
    }
  }

  /**
   * Requests photo library permission with user-friendly messaging
   * 
   * @returns Promise<boolean> - True if permission granted
   */
  static async requestPhotoLibraryPermission(): Promise<boolean> {
    try {
      console.log('Requesting photo library permission...');
      
      const permission = this.getPhotoLibraryPermission();
      const currentStatus = await check(permission);
      
      // If already granted, return true
      if (currentStatus === RESULTS.GRANTED) {
        console.log('Photo library permission already granted');
        return true;
      }
      
      // If denied or blocked, show guidance
      if (currentStatus === RESULTS.DENIED || currentStatus === RESULTS.BLOCKED) {
        const shouldRequest = await this.showPermissionRationale(
          'Photo Library Permission Required',
          'This app needs access to your photo library to analyze existing trading card images. Please grant photo library permission to continue.'
        );
        
        if (!shouldRequest) {
          return false;
        }
        
        // If blocked, guide to settings
        if (currentStatus === RESULTS.BLOCKED) {
          this.showSettingsAlert('Photo Library Permission');
          return false;
        }
      }
      
      // Request permission
      const result = await request(permission);
      const granted = result === RESULTS.GRANTED;
      
      console.log('Photo library permission result:', result);
      
      if (!granted) {
        this.showPermissionDeniedAlert('Photo Library');
      }
      
      return granted;
    } catch (error) {
      console.error('Error requesting photo library permission:', error);
      return false;
    }
  }

  /**
   * Shows a permission rationale alert to the user
   * 
   * @param title - Alert title
   * @param message - Alert message explaining why permission is needed
   * @returns Promise<boolean> - True if user agrees to grant permission
   */
  private static showPermissionRationale(title: string, message: string): Promise<boolean> {
    return new Promise((resolve) => {
      Alert.alert(
        title,
        message,
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => resolve(false),
          },
          {
            text: 'Grant Permission',
            onPress: () => resolve(true),
          },
        ],
        { cancelable: false }
      );
    });
  }

  /**
   * Shows an alert when permission is denied
   * 
   * @param permissionType - Type of permission that was denied
   */
  private static showPermissionDeniedAlert(permissionType: string): void {
    Alert.alert(
      `${permissionType} Permission Denied`,
      `Without ${permissionType.toLowerCase()} permission, you won't be able to use this feature. You can enable it later in Settings.`,
      [
        {
          text: 'OK',
          style: 'default',
        },
        {
          text: 'Open Settings',
          onPress: () => Linking.openSettings(),
        },
      ]
    );
  }

  /**
   * Shows an alert guiding user to settings when permission is blocked
   * 
   * @param permissionType - Type of permission that is blocked
   */
  private static showSettingsAlert(permissionType: string): void {
    Alert.alert(
      `${permissionType} Access Required`,
      `${permissionType} access has been denied. Please enable it in Settings to use this feature.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Open Settings',
          onPress: () => Linking.openSettings(),
        },
      ]
    );
  }

  /**
   * Requests all necessary permissions for the app
   * 
   * @returns Promise<{camera: boolean, photoLibrary: boolean}> - Permission status for each type
   */
  static async requestAllPermissions(): Promise<{camera: boolean, photoLibrary: boolean}> {
    console.log('Requesting all app permissions...');
    
    const cameraGranted = await this.requestCameraPermission();
    const photoLibraryGranted = await this.requestPhotoLibraryPermission();
    
    console.log('Permission results:', {
      camera: cameraGranted,
      photoLibrary: photoLibraryGranted
    });
    
    return {
      camera: cameraGranted,
      photoLibrary: photoLibraryGranted
    };
  }

  /**
   * Checks if all necessary permissions are granted
   * 
   * @returns Promise<boolean> - True if all permissions are granted
   */
  static async checkAllPermissions(): Promise<boolean> {
    const cameraStatus = await this.checkCameraPermission();
    const photoLibraryStatus = await this.checkPhotoLibraryPermission();
    
    return cameraStatus === RESULTS.GRANTED && photoLibraryStatus === RESULTS.GRANTED;
  }
}
