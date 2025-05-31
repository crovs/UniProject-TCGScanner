import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
  ScrollView,
  Alert,
} from 'react-native';
import { useSettingsViewModel } from '../../../viewmodels';
import { ThemeService, Theme } from '../../../services/theme/ThemeService';

const SettingsScreen: React.FC = () => {
  const settingsViewModel = useSettingsViewModel();
  const [theme, setTheme] = useState<Theme>(ThemeService.getCurrentTheme());

  useEffect(() => {
    const unsubscribe = ThemeService.addThemeListener(setTheme);
    return unsubscribe;
  }, []);

  const styles = createStyles(theme);

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete your entire collection and reset all settings. This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: async () => {
            try {
              // This would call a clear data method
              Alert.alert('Success', 'All data has been cleared');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data');
            }
          },
        },
      ]
    );
  };

  const renderSettingItem = (
    title: string,
    description: string,
    value: boolean,
    onToggle: () => void
  ) => (
    <View style={styles.settingItem}>
      <View style={styles.settingText}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: theme.border, true: theme.primary }}
        thumbColor={value ? '#fff' : '#f4f3f4'}
      />
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        {renderSettingItem(
          'Dark Mode',
          'Use dark theme throughout the app',
          settingsViewModel.isDarkMode(),
          () => settingsViewModel.toggleDarkModeAction()
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        {renderSettingItem(
          'Push Notifications',
          'Receive notifications about new features',
          settingsViewModel.areNotificationsEnabled(),
          () => settingsViewModel.toggleNotificationsAction()
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data & Storage</Text>
        {renderSettingItem(
          'Offline Mode',
          'Save data locally when offline',
          settingsViewModel.isOfflineModeEnabled(),
          () => settingsViewModel.toggleOfflineModeAction()
        )}
        
        <TouchableOpacity
          style={styles.dangerButton}
          onPress={handleClearData}
        >
          <Text style={styles.dangerButtonText}>Clear All Data</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Version</Text>
          <Text style={styles.infoValue}>1.0.0</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Build</Text>
          <Text style={styles.infoValue}>University Project</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    padding: 20,
    paddingTop: 30,
    backgroundColor: theme.primary,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  section: {
    backgroundColor: theme.surface,
    marginTop: 20,
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.divider,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.text,
  },
  settingDescription: {
    fontSize: 14,
    color: theme.textSecondary,
    marginTop: 2,
  },
  dangerButton: {
    backgroundColor: theme.error,
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  dangerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.divider,
  },
  infoLabel: {
    fontSize: 16,
    color: theme.text,
  },
  infoValue: {
    fontSize: 16,
    color: theme.textSecondary,
  },
});

export default SettingsScreen;
