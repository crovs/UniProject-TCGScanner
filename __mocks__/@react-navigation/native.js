/**
 * =================================================================
 * REACT NAVIGATION NATIVE MOCK
 * =================================================================
 * 
 * Mock implementation of React Navigation Native for testing
 */

const React = require('react');

const NavigationContainer = ({ children }) => {
  return React.createElement('NavigationContainer', {}, children);
};

module.exports = {
  NavigationContainer,
  DefaultTheme: {
    dark: false,
    colors: {
      primary: '#007AFF',
      background: '#ffffff',
      card: '#ffffff',
      text: '#000000',
      border: '#e0e0e0',
      notification: '#ff3b30'
    }
  },
  DarkTheme: {
    dark: true,
    colors: {
      primary: '#0A84FF',
      background: '#000000',
      card: '#1C1C1E',
      text: '#ffffff',
      border: '#272729',
      notification: '#ff453a'
    }
  },
  useNavigation: jest.fn(() => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    setOptions: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn()
  })),
  useRoute: jest.fn(() => ({
    params: {},
    name: 'MockScreen',
    key: 'mock-key'
  })),
  useFocusEffect: jest.fn(),
  useIsFocused: jest.fn(() => true),
  useNavigationState: jest.fn(() => ({}))
};
