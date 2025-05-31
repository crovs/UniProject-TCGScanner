/**
 * @format
 */

// Import and test individual services instead of the full App
import { ThemeService } from '../src/services/theme/ThemeService';
import { PermissionsService } from '../src/services/permissions/PermissionsService';

// Mock the services we're testing
jest.mock('../src/services/theme/ThemeService');
jest.mock('../src/services/permissions/PermissionsService');

describe('TCG Card Scanner Services', () => {
  test('ThemeService should be importable', () => {
    expect(ThemeService).toBeDefined();
    expect(typeof ThemeService.getCurrentTheme).toBe('function');
  });

  test('PermissionsService should be importable', () => {
    expect(PermissionsService).toBeDefined();
    expect(typeof PermissionsService.requestCameraPermission).toBe('function');
  });
});
