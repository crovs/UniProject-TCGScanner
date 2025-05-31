/**
 * Mock for react-native-permissions
 * Used in testing environment to simulate permission flows
 */

export const PERMISSIONS = {
  IOS: {
    CAMERA: 'ios.permission.CAMERA',
    PHOTO_LIBRARY: 'ios.permission.PHOTO_LIBRARY',
  },
  ANDROID: {
    CAMERA: 'android.permission.CAMERA',
    READ_EXTERNAL_STORAGE: 'android.permission.READ_EXTERNAL_STORAGE',
  },
};

export const RESULTS = {
  UNAVAILABLE: 'unavailable',
  DENIED: 'denied',
  LIMITED: 'limited',
  GRANTED: 'granted',
  BLOCKED: 'blocked',
};

export const check = jest.fn(() => Promise.resolve(RESULTS.GRANTED));
export const request = jest.fn(() => Promise.resolve(RESULTS.GRANTED));

export default {
  PERMISSIONS,
  RESULTS,
  check,
  request,
};
