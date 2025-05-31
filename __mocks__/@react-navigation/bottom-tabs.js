/**
 * =================================================================
 * REACT NAVIGATION BOTTOM TABS MOCK
 * =================================================================
 * 
 * Mock implementation of React Navigation Bottom Tabs for testing
 */

const createBottomTabNavigator = jest.fn(() => ({
  Navigator: ({ children }) => children,
  Screen: ({ children }) => children,
  Group: ({ children }) => children
}));

module.exports = {
  createBottomTabNavigator,
  BottomTabBar: ({ children }) => children,
  useBottomTabBarHeight: jest.fn(() => 49)
};
