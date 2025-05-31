/**
 * =================================================================
 * THEME SERVICE MOCK
 * =================================================================
 * 
 * Mock implementation of ThemeService for testing
 */

// Mock theme objects
const lightTheme = {
  primary: '#3498db',
  secondary: '#2ecc71',
  background: '#ffffff',
  surface: '#f8f9fa',
  text: '#2c3e50',
  textSecondary: '#7f8c8d',
  border: '#ecf0f1',
  error: '#e74c3c',
  warning: '#f39c12',
  success: '#27ae60',
  info: '#3498db',
  
  // Card grade colors
  gradeExcellent: '#27ae60', // Green for grades 8-10
  gradeGood: '#f39c12',      // Orange for grades 6-7
  gradeFair: '#e67e22',      // Orange-red for grades 4-5
  gradePoor: '#e74c3c',      // Red for grades 1-3
  
  // Scanner specific colors
  scannerOverlay: 'rgba(0, 0, 0, 0.6)',
  scannerBorder: '#3498db',
  scannerCorner: '#2ecc71',
};

const darkTheme = {
  primary: '#2980b9',
  secondary: '#27ae60',
  background: '#1a1a1a',
  surface: '#2c2c2c',
  text: '#ecf0f1',
  textSecondary: '#bdc3c7',
  border: '#34495e',
  error: '#c0392b',
  warning: '#d68910',
  success: '#229954',
  info: '#2980b9',
  
  // Card grade colors (slightly adjusted for dark mode)
  gradeExcellent: '#229954',
  gradeGood: '#d68910',
  gradeFair: '#d35400',
  gradePoor: '#c0392b',
  
  // Scanner specific colors
  scannerOverlay: 'rgba(0, 0, 0, 0.8)',
  scannerBorder: '#2980b9',
  scannerCorner: '#27ae60',
};

// Mock ThemeService class
const ThemeService = {
  // Static properties
  currentTheme: lightTheme,
  currentMode: 'light',
  listeners: [],

  // Mock methods
  async initialize() {
    console.log('🎨 [MOCK] Theme service initialized');
    return Promise.resolve();
  },

  getCurrentTheme() {
    return this.currentTheme;
  },

  getCurrentMode() {
    return this.currentMode;
  },

  async setThemeMode(mode) {
    console.log(`🎨 [MOCK] Setting theme mode to: ${mode}`);
    this.currentMode = mode;
    
    // Determine theme based on mode
    if (mode === 'system') {
      this.currentTheme = lightTheme; // Default to light for testing
    } else {
      this.currentTheme = mode === 'dark' ? darkTheme : lightTheme;
    }
    
    // Notify listeners
    this.notifyListeners();
    return Promise.resolve();
  },

  async toggleTheme() {
    const newMode = this.currentMode === 'dark' ? 'light' : 'dark';
    await this.setThemeMode(newMode);
  },

  addThemeListener(listener) {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  },

  isDarkMode() {
    return this.currentTheme === darkTheme;
  },

  getStatusBarStyle() {
    return this.isDarkMode() ? 'light-content' : 'dark-content';
  },

  getScannerOverlay(opacity = 0.6) {
    const baseColor = this.isDarkMode() ? '0, 0, 0' : '0, 0, 0';
    return `rgba(${baseColor}, ${opacity})`;
  },

  getGradeColor(grade) {
    if (grade >= 8) return this.currentTheme.gradeExcellent;
    if (grade >= 6) return this.currentTheme.gradeGood;
    if (grade >= 4) return this.currentTheme.gradeFair;
    return this.currentTheme.gradePoor;
  },

  // Private method (exposed for testing)
  notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener(this.currentTheme);
      } catch (error) {
        console.error('[MOCK] Theme listener error:', error);
      }
    });
  }
};

// Export both named and default exports to match the real service
module.exports = {
  ThemeService,
  Theme: lightTheme, // Export a theme type for TypeScript
  lightTheme,
  darkTheme,
  default: ThemeService
};
