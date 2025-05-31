import AsyncStorage from '@react-native-async-storage/async-storage';
import { CollectionCard, UserSettings } from '../../types';

export class StorageService {
  private static readonly COLLECTION_KEY = '@tcg_collection';
  private static readonly SETTINGS_KEY = '@tcg_settings';

  // Collection Storage
  static async saveCollection(cards: CollectionCard[]): Promise<void> {
    try {
      const jsonValue = JSON.stringify(cards);
      await AsyncStorage.setItem(this.COLLECTION_KEY, jsonValue);
    } catch (error) {
      console.error('Error saving collection:', error);
      throw new Error('Failed to save collection');
    }
  }

  static async loadCollection(): Promise<CollectionCard[]> {
    try {
      const jsonValue = await AsyncStorage.getItem(this.COLLECTION_KEY);
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (error) {
      console.error('Error loading collection:', error);
      return [];
    }
  }

  // Settings Storage
  static async saveSettings(settings: UserSettings): Promise<void> {
    try {
      const jsonValue = JSON.stringify(settings);
      await AsyncStorage.setItem(this.SETTINGS_KEY, jsonValue);
    } catch (error) {
      console.error('Error saving settings:', error);
      throw new Error('Failed to save settings');
    }
  }

  static async loadSettings(): Promise<UserSettings> {
    try {
      const jsonValue = await AsyncStorage.getItem(this.SETTINGS_KEY);
      return jsonValue != null ? JSON.parse(jsonValue) : {
        darkMode: false,
        notifications: true,
        offlineMode: false
      };
    } catch (error) {
      console.error('Error loading settings:', error);
      return {
        darkMode: false,
        notifications: true,
        offlineMode: false
      };
    }
  }

  // Clear all data
  static async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([this.COLLECTION_KEY, this.SETTINGS_KEY]);
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw new Error('Failed to clear storage');
    }
  }
}
