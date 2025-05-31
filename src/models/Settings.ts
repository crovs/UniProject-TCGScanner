import { UserSettings } from '../types';

export class SettingsModel implements UserSettings {
  darkMode: boolean;
  notifications: boolean;
  offlineMode: boolean;

  constructor(settings: Partial<UserSettings> = {}) {
    this.darkMode = settings.darkMode ?? false;
    this.notifications = settings.notifications ?? true;
    this.offlineMode = settings.offlineMode ?? false;
  }

  static getDefaultSettings(): UserSettings {
    return {
      darkMode: false,
      notifications: true,
      offlineMode: false
    };
  }

  toJSON(): UserSettings {
    return {
      darkMode: this.darkMode,
      notifications: this.notifications,
      offlineMode: this.offlineMode
    };
  }
}
