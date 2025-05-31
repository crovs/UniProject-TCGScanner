/**
 * =================================================================
 * PERMISSIONS SERVICE MOCK
 * =================================================================
 * 
 * Mock implementation of PermissionsService for testing
 */

// Mock PermissionsService class
const PermissionsService = {
  // Mock methods
  async requestCameraPermission() {
    console.log('📱 [MOCK] Camera permission requested');
    return Promise.resolve(true);
  },

  async requestPhotoLibraryPermission() {
    console.log('📱 [MOCK] Photo library permission requested');
    return Promise.resolve(true);
  },

  async requestAllPermissions() {
    console.log('📱 [MOCK] All permissions requested');
    return Promise.resolve({
      camera: true,
      photoLibrary: true
    });
  },

  async checkCameraPermission() {
    console.log('📱 [MOCK] Camera permission checked');
    return Promise.resolve('granted');
  },

  async checkPhotoLibraryPermission() {
    console.log('📱 [MOCK] Photo library permission checked');
    return Promise.resolve('granted');
  },

  async checkAllPermissions() {
    console.log('📱 [MOCK] All permissions checked');
    return Promise.resolve(true);
  }
};

// Export both named and default exports to match the real service
module.exports = {
  PermissionsService,
  default: PermissionsService
};
