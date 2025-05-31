/**
 * =================================================================
 * THEME SERVICE
 * =================================================================
 *
 * This service handles all theme-related operations for the app:
 * - Light and dark mode support
 * - Theme color management
 * - Theme persistence across app restarts
 * - System theme detection and following
 *
 * Features:
 * - ✅ Light/Dark mode switching
 * - ✅ System theme following
 * - ✅ Theme persistence
 * - ✅ TypeScript type safety
 * =================================================================
 */

import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Theme configuration constants
 */
const THEME_STORAGE_KEY = '@tcg_scanner_theme';

/**
 * Theme color definitions
 */
export const lightTheme = {
  // Primary colors
  primary: '#2196F3',
  primaryDark: '#1976D2',
  primaryLight: '#BBDEFB',
  
  // Secondary colors
  secondary: '#FF9800',
  secondaryDark: '#F57C00',
  secondaryLight: '#FFE0B2',
  
  // Background colors
  background: '#FFFFFF',
  surface: '#F5F5F5',
  card: '#FFFFFF',
  
  // Text colors
  text: '#212121',
  textSecondary: '#757575',
  textInverse: '#FFFFFF',
  
  // Status colors
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
  
  // Border and divider
  border: '#E0E0E0',
  divider: '#E0E0E0',
  
  // Scanner specific
  scannerOverlay: 'rgba(0, 0, 0, 0.6)',
  scannerFrame: '#2196F3',
  
  // Grade colors
  gradeExcellent: '#4CAF50',
  gradeGood: '#8BC34A',
  gradeFair: '#FF9800',
  gradePoor: '#F44336',
};

export const darkTheme = {
  // Primary colors
  primary: '#2196F3',
  primaryDark: '#1565C0',
  primaryLight: '#42A5F5',
  
  // Secondary colors
  secondary: '#FF9800',
  secondaryDark: '#E65100',
  secondaryLight: '#FFB74D',
  
  // Background colors
  background: '#121212',
  surface: '#1E1E1E',
  card: '#2C2C2C',
  
  // Text colors
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  textInverse: '#000000',
  
  // Status colors
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
  
  // Border and divider
  border: '#404040',
  divider: '#404040',
  
  // Scanner specific
  scannerOverlay: 'rgba(0, 0, 0, 0.8)',
  scannerFrame: '#2196F3',
  
  // Grade colors
  gradeExcellent: '#4CAF50',
  gradeGood: '#8BC34A',
  gradeFair: '#FF9800',
  gradePoor: '#F44336',
};

export type Theme = typeof lightTheme;

/**
 * Theme mode options
 */
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * =================================================================
 * THEME SERVICE CLASS
 * =================================================================
 *
 * Handles all theme-related operations
 */
export class ThemeService {
  private static currentTheme: Theme = lightTheme;
  private static currentMode: ThemeMode = 'system';
  private static listeners: Array<(theme: Theme) => void> = [];

  /**
   * Initialize the theme service
   * This should be called when the app starts
   */
  static async initialize(): Promise<void> {
    try {
      console.log('🎨 Initializing theme service...');
      
      // Load saved theme preference
      const savedMode = await this.getSavedThemeMode();
      await this.setThemeMode(savedMode);
      
      // Listen for system theme changes
      this.setupSystemThemeListener();
      
      console.log('✅ Theme service initialized');
    } catch (error) {
      console.error('❌ Theme service initialization failed:', error);
      // Fallback to light theme
      this.currentTheme = lightTheme;
      this.currentMode = 'light';
    }
  }

  /**
   * Get the current theme
   */
  static getCurrentTheme(): Theme {
    return this.currentTheme;
  }

  /**
   * Get the current theme mode
   */
  static getCurrentMode(): ThemeMode {
    return this.currentMode;
  }

  /**
   * Set the theme mode
   * 
   * @param mode - Theme mode to set
   */
  static async setThemeMode(mode: ThemeMode): Promise<void> {
    try {
      console.log(`🎨 Setting theme mode to: ${mode}`);
      
      this.currentMode = mode;
      
      // Determine actual theme based on mode
      let actualTheme: Theme;
      if (mode === 'system') {
        const systemScheme = Appearance.getColorScheme();
        actualTheme = systemScheme === 'dark' ? darkTheme : lightTheme;
      } else {
        actualTheme = mode === 'dark' ? darkTheme : lightTheme;
      }
      
      // Update current theme
      this.currentTheme = actualTheme;
      
      // Save preference
      await this.saveThemeMode(mode);
      
      // Notify listeners
      this.notifyListeners();
      
      console.log(`✅ Theme updated to ${mode === 'system' ? 'system (' + (actualTheme === darkTheme ? 'dark' : 'light') + ')' : mode}`);
    } catch (error) {
      console.error('❌ Failed to set theme mode:', error);
    }
  }

  /**
   * Toggle between light and dark theme
   * (Skips system mode for quick toggling)
   */
  static async toggleTheme(): Promise<void> {
    const newMode = this.currentMode === 'dark' ? 'light' : 'dark';
    await this.setThemeMode(newMode);
  }

  /**
   * Add a theme change listener
   * 
   * @param listener - Function to call when theme changes
   * @returns Unsubscribe function
   */
  static addThemeListener(listener: (theme: Theme) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Check if current theme is dark
   */
  static isDarkMode(): boolean {
    return this.currentTheme === darkTheme;
  }

  /**
   * Get theme colors for specific component types
   */
  static getStatusBarStyle(): 'light-content' | 'dark-content' {
    return this.isDarkMode() ? 'light-content' : 'dark-content';
  }

  /**
   * Get scanner overlay color with opacity
   */
  static getScannerOverlay(opacity: number = 0.6): string {
    const baseColor = this.isDarkMode() ? '0, 0, 0' : '0, 0, 0';
    return `rgba(${baseColor}, ${opacity})`;
  }

  /**
   * Get grade color based on score
   * 
   * @param grade - Grade score (1-10)
   * @returns Color string
   */
  static getGradeColor(grade: number): string {
    if (grade >= 8) return this.currentTheme.gradeExcellent;
    if (grade >= 6) return this.currentTheme.gradeGood;
    if (grade >= 4) return this.currentTheme.gradeFair;
    return this.currentTheme.gradePoor;
  }

  // ===============================================================
  // PRIVATE METHODS
  // ===============================================================

  /**
   * Load saved theme mode from storage
   */
  private static async getSavedThemeMode(): Promise<ThemeMode> {
    try {
      const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (saved && ['light', 'dark', 'system'].includes(saved)) {
        return saved as ThemeMode;
      }
    } catch (error) {
      console.error('Failed to load saved theme mode:', error);
    }
    
    // Default to system theme
    return 'system';
  }

  /**
   * Save theme mode to storage
   */
  private static async saveThemeMode(mode: ThemeMode): Promise<void> {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.error('Failed to save theme mode:', error);
    }
  }

  /**
   * Setup listener for system theme changes
   */
  private static setupSystemThemeListener(): void {
    Appearance.addChangeListener(({ colorScheme }) => {
      if (this.currentMode === 'system') {
        console.log(`🎨 System theme changed to: ${colorScheme}`);
        const newTheme = colorScheme === 'dark' ? darkTheme : lightTheme;
        this.currentTheme = newTheme;
        this.notifyListeners();
      }
    });
  }

  /**
   * Notify all theme listeners of changes
   */
  private static notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.currentTheme);
      } catch (error) {
        console.error('Theme listener error:', error);
      }
    });
  }
}
