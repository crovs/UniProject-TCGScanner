/**
 * =================================================================
 * REACT NAVIGATION STACK MOCK
 * =================================================================
 * 
 * Mock implementation of React Navigation Stack for testing
 */

const createStackNavigator = jest.fn(() => ({
  Navigator: ({ children }) => children,
  Screen: ({ children }) => children,
  Group: ({ children }) => children
}));

module.exports = {
  createStackNavigator,
  Header: ({ children }) => children,
  useHeaderHeight: jest.fn(() => 44),
  TransitionPresets: {
    SlideFromRightIOS: {},
    ModalSlideFromBottomIOS: {},
    FadeFromBottomAndroid: {},
    RevealFromBottomAndroid: {}
  },
  CardStyleInterpolators: {
    forHorizontalIOS: jest.fn(),
    forVerticalIOS: jest.fn(),
    forModalPresentationIOS: jest.fn(),
    forFadeFromBottomAndroid: jest.fn(),
    forRevealFromBottomAndroid: jest.fn()
  }
};
