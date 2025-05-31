import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useMemo } from 'react';
import { RootState } from '../store';
import { setSettings, toggleDarkMode, toggleNotifications, toggleOfflineMode, setLoading } from '../store/slices/settingsSlice';
import { StorageService } from '../services';
import { ThemeService } from '../services/theme/ThemeService';
import { UserSettings } from '../types';

export class SettingsViewModel {
  private dispatch: any;
  private settings: UserSettings;
  private loading: boolean;

  constructor(dispatch: any, settings: UserSettings, isLoading: boolean) {
    this.dispatch = dispatch;
    this.settings = settings;
    this.loading = isLoading;
  }

  async loadSettings(): Promise<void> {
    try {
      this.dispatch(setLoading(true));
      const savedSettings = await StorageService.loadSettings();
      this.dispatch(setSettings(savedSettings));
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }

  async saveSettings(): Promise<void> {
    try {
      await StorageService.saveSettings(this.settings);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  async toggleDarkModeAction(): Promise<void> {
    this.dispatch(toggleDarkMode());
    await this.saveSettings();
    
    // Update ThemeService to reflect the new setting
    await ThemeService.toggleTheme();
  }

  toggleNotificationsAction(): void {
    this.dispatch(toggleNotifications());
    this.saveSettings();
  }

  toggleOfflineModeAction(): void {
    this.dispatch(toggleOfflineMode());
    this.saveSettings();
  }

  getSettings(): UserSettings {
    return this.settings;
  }

  isDarkMode(): boolean {
    return this.settings.darkMode;
  }

  areNotificationsEnabled(): boolean {
    return this.settings.notifications;
  }

  isOfflineModeEnabled(): boolean {
    return this.settings.offlineMode;
  }

  isLoading(): boolean {
    return this.loading;
  }
}

// Hook for using SettingsViewModel
export const useSettingsViewModel = () => {
  const dispatch = useDispatch();
  const { settings, isLoading } = useSelector((state: RootState) => state.settings);
  
  const viewModel = useMemo(() => new SettingsViewModel(dispatch, settings, isLoading), [dispatch, settings, isLoading]);
  
  useEffect(() => {
    viewModel.loadSettings();
  }, [viewModel]);

  return viewModel;
};
