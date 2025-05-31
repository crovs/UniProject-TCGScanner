/**
 * TCG Card Scanner App
 * University Project - React Native with MVVM Architecture
 *
 * @format
 */

import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { StatusBar, SafeAreaView, StyleSheet } from 'react-native';
import { store } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';
import { ThemeService, Theme } from './src/services/theme/ThemeService';
import { PermissionsService } from './src/services/permissions/PermissionsService';

function App(): React.JSX.Element {
  const [theme, setTheme] = useState<Theme>(ThemeService.getCurrentTheme());

  useEffect(() => {
    // Initialize services
    const initializeApp = async () => {
      try {
        console.log('🚀 Initializing TCG Card Scanner...');
        
        // Initialize theme service
        await ThemeService.initialize();
        
        // Request permissions on app startup
        console.log('📱 Requesting app permissions...');
        await PermissionsService.requestAllPermissions();
        
        console.log('✅ App initialization completed');
      } catch (error) {
        console.error('❌ App initialization failed:', error);
      }
    };

    initializeApp();

    // Setup theme listener
    const unsubscribeTheme = ThemeService.addThemeListener((newTheme) => {
      setTheme(newTheme);
    });

    // Cleanup
    return () => {
      unsubscribeTheme();
    };
  }, []);

  const statusBarStyle = ThemeService.getStatusBarStyle();
  const statusBarBackgroundColor = theme.primary;

  return (
    <Provider store={store}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <StatusBar
          barStyle={statusBarStyle}
          backgroundColor={statusBarBackgroundColor}
          translucent={false}
        />
        <AppNavigator />
      </SafeAreaView>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
});

export default App;
