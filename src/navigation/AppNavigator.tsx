import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import screens (will be created next)
import ScannerScreen from '../views/screens/Scanner';
import CollectionScreen from '../views/screens/Collection';
import CardDetailsScreen from '../views/screens/CardDetails';
import SettingsScreen from '../views/screens/Settings';

import { RootStackParamList } from '../types';
import { ThemeService, Theme } from '../services/theme/ThemeService';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator<RootStackParamList>();

// Main Tab Navigator component
const MainTabNavigator = () => {
  const [theme, setTheme] = useState<Theme>(ThemeService.getCurrentTheme());

  useEffect(() => {
    const unsubscribe = ThemeService.addThemeListener((newTheme: Theme) => {
      setTheme(newTheme);
    });

    return unsubscribe;
  }, []);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: string;

          if (route.name === 'Scanner') {
            iconName = 'qr-code-scanner';
          } else if (route.name === 'Collection') {
            iconName = 'folder-special';
          } else if (route.name === 'Settings') {
            iconName = 'tune';
          } else {
            iconName = 'help';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        headerShown: false,
        tabBarStyle: {
          paddingTop: 8,
          paddingBottom: 8,
          height: 70,
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
        },
      })}
    >
      <Tab.Screen name="Scanner" component={ScannerScreen} />
      <Tab.Screen name="Collection" component={CollectionScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const [theme, setTheme] = useState<Theme>(ThemeService.getCurrentTheme());

  useEffect(() => {
    const unsubscribe = ThemeService.addThemeListener((newTheme: Theme) => {
      setTheme(newTheme);
    });

    return unsubscribe;
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.primary,
          },
          headerTintColor: theme.surface,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="Main"
          component={MainTabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CardDetails"
          component={CardDetailsScreen}
          options={{
            title: 'Card Details',
            headerStyle: {
              backgroundColor: theme.primary,
            },
            headerTintColor: theme.surface,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
