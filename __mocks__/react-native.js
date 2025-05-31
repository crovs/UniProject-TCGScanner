/**
 * =================================================================
 * REACT NATIVE MOCK
 * =================================================================
 * 
 * Mock implementation of React Native core modules for testing
 */

const mockAppearance = {
  getColorScheme: jest.fn(() => 'light'),
  addChangeListener: jest.fn((listener) => {
    // Return a mock subscription
    return {
      remove: jest.fn()
    };
  }),
  removeChangeListener: jest.fn()
};

const mockPlatform = {
  OS: 'ios',
  Version: '14.0',
  select: jest.fn((config) => config.ios || config.default)
};

const mockDimensions = {
  get: jest.fn(() => ({
    width: 375,
    height: 812,
    scale: 3,
    fontScale: 1
  })),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn()
};

const mockAlert = {
  alert: jest.fn((title, message, buttons) => {
    console.log(`🚨 [MOCK] Alert: ${title} - ${message}`);
    // Simulate pressing the first button if available
    if (buttons && buttons.length > 0 && buttons[0].onPress) {
      buttons[0].onPress();
    }
  })
};

const mockLinking = {
  openSettings: jest.fn(() => {
    console.log('⚙️ [MOCK] Opening settings');
    return Promise.resolve();
  }),
  openURL: jest.fn((url) => {
    console.log(`🔗 [MOCK] Opening URL: ${url}`);
    return Promise.resolve();
  })
};

const mockStatusBar = {
  setBarStyle: jest.fn(),
  setBackgroundColor: jest.fn(),
  setTranslucent: jest.fn()
};

// Mock components
const mockView = 'View';
const mockText = 'Text';
const mockScrollView = 'ScrollView';
const mockImage = 'Image';
const mockTouchableOpacity = 'TouchableOpacity';
const mockTextInput = 'TextInput';

// StatusBar component mock
const StatusBar = (props) => null;
StatusBar.setBarStyle = mockStatusBar.setBarStyle;
StatusBar.setBackgroundColor = mockStatusBar.setBackgroundColor;
StatusBar.setTranslucent = mockStatusBar.setTranslucent;

module.exports = {
  // Core modules
  Appearance: mockAppearance,
  Platform: mockPlatform,
  Dimensions: mockDimensions,
  Alert: mockAlert,
  Linking: mockLinking,
  StatusBar,

  // Components
  View: mockView,
  Text: mockText,
  ScrollView: mockScrollView,
  Image: mockImage,
  TouchableOpacity: mockTouchableOpacity,
  TextInput: mockTextInput,

  // StyleSheet
  StyleSheet: {
    create: jest.fn((styles) => styles),
    flatten: jest.fn((style) => style)
  },

  // PixelRatio
  PixelRatio: {
    get: jest.fn(() => 3),
    getFontScale: jest.fn(() => 1)
  }
};
