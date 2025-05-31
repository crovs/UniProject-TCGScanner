import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserSettings } from '../../types';

interface SettingsState {
  settings: UserSettings;
  isLoading: boolean;
}

const initialState: SettingsState = {
  settings: {
    darkMode: false,
    notifications: true,
    offlineMode: false
  },
  isLoading: false
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setSettings: (state, action: PayloadAction<UserSettings>) => {
      state.settings = action.payload;
    },
    toggleDarkMode: (state) => {
      state.settings.darkMode = !state.settings.darkMode;
    },
    toggleNotifications: (state) => {
      state.settings.notifications = !state.settings.notifications;
    },
    toggleOfflineMode: (state) => {
      state.settings.offlineMode = !state.settings.offlineMode;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    }
  }
});

export const { setSettings, toggleDarkMode, toggleNotifications, toggleOfflineMode, setLoading } = settingsSlice.actions;
export default settingsSlice.reducer;
