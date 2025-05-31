/**
 * =================================================================
 * IMAGE SERVICE TESTS
 * =================================================================
 *
 * Unit tests for the ImageService class
 * Tests file URI to base64 conversion and validation utilities
 */

import { ImageService } from '../src/services/image/ImageService';
import RNFS from 'react-native-fs';

// Mock react-native-fs
jest.mock('react-native-fs');

const mockRNFS = RNFS as jest.Mocked<typeof RNFS>;

describe('ImageService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    mockRNFS.exists.mockResolvedValue(true);
    mockRNFS.stat.mockResolvedValue({
      size: 1024000, // 1MB
      isFile: () => true,
      path: '/mock/path/to/image.jpg',
    } as any);
    mockRNFS.readFile.mockResolvedValue('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==');
  });

  describe('convertFileUriToBase64', () => {
    it('should convert a local file URI to base64', async () => {
      const fileUri = 'file:///path/to/image.jpg';
      
      const result = await ImageService.convertFileUriToBase64(fileUri);
      
      expect(result).toMatch(/^data:image\/jpeg;base64,/);
      expect(mockRNFS.exists).toHaveBeenCalledWith('/path/to/image.jpg');
      expect(mockRNFS.stat).toHaveBeenCalledWith('/path/to/image.jpg');
      expect(mockRNFS.readFile).toHaveBeenCalledWith('/path/to/image.jpg', 'base64');
    });

    it('should handle file paths without file:// prefix', async () => {
      const filePath = '/path/to/image.png';
      
      const result = await ImageService.convertFileUriToBase64(filePath);
      
      expect(result).toMatch(/^data:image\/png;base64,/);
      expect(mockRNFS.exists).toHaveBeenCalledWith('/path/to/image.png');
    });

    it('should throw error if file URI is empty', async () => {
      await expect(ImageService.convertFileUriToBase64('')).rejects.toThrow('File URI is required');
    });

    it('should throw error if file does not exist', async () => {
      mockRNFS.exists.mockResolvedValue(false);
      
      await expect(ImageService.convertFileUriToBase64('file:///nonexistent.jpg')).rejects.toThrow('File does not exist');
    });

    it('should throw error if file is too large', async () => {
      mockRNFS.stat.mockResolvedValue({
        size: 15 * 1024 * 1024, // 15MB
        isFile: () => true,
        path: '/path/to/large-image.jpg',
      } as any);

      await expect(ImageService.convertFileUriToBase64('file:///path/to/large-image.jpg')).rejects.toThrow('File size too large');
    });

    it('should handle different image formats', async () => {
      const formats = [
        { ext: 'jpg', mime: 'image/jpeg' },
        { ext: 'png', mime: 'image/png' },
        { ext: 'gif', mime: 'image/gif' },
        { ext: 'webp', mime: 'image/webp' },
      ];

      for (const format of formats) {
        const result = await ImageService.convertFileUriToBase64(`file:///image.${format.ext}`);
        expect(result).toMatch(new RegExp(`^data:${format.mime};base64,`));
      }
    });
  });

  describe('isValidBase64DataUri', () => {
    it('should validate correct base64 data URIs', () => {
      const validUris = [
        'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
        'data:image/png;base64,SGVsbG8gV29ybGQ=',
      ];

      validUris.forEach(uri => {
        expect(ImageService.isValidBase64DataUri(uri)).toBe(true);
      });
    });

    it('should reject invalid data URIs', () => {
      const invalidUris = [
        'not-a-data-uri',
        'data:image/jpeg',
        'data:image/jpeg;base64',
        'http://example.com/image.jpg',
        '',
        null,
        undefined,
      ];

      invalidUris.forEach(uri => {
        expect(ImageService.isValidBase64DataUri(uri as any)).toBe(false);
      });
    });
  });

  describe('isLocalFileUri', () => {
    it('should identify local file URIs', () => {
      const localUris = [
        'file:///path/to/image.jpg',
        '/absolute/path/to/image.jpg',
        '/var/mobile/Containers/Data/image.jpg',
        '/data/user/0/com.app/image.jpg',
        'content://media/external/images/media/123',
      ];

      localUris.forEach(uri => {
        expect(ImageService.isLocalFileUri(uri)).toBe(true);
      });
    });

    it('should reject non-local URIs', () => {
      const nonLocalUris = [
        'http://example.com/image.jpg',
        'https://example.com/image.jpg',
        'data:image/jpeg;base64,SGVsbG8=',
        '',
        null,
        undefined,
      ];

      nonLocalUris.forEach(uri => {
        expect(ImageService.isLocalFileUri(uri as any)).toBe(false);
      });
    });
  });

  describe('isWebUrl', () => {
    it('should identify web URLs', () => {
      const webUrls = [
        'http://example.com/image.jpg',
        'https://example.com/image.jpg',
        'https://api.example.com/images/123.png',
      ];

      webUrls.forEach(url => {
        expect(ImageService.isWebUrl(url)).toBe(true);
      });
    });

    it('should reject non-web URLs', () => {
      const nonWebUrls = [
        'file:///path/to/image.jpg',
        '/absolute/path/to/image.jpg',
        'data:image/jpeg;base64,SGVsbG8=',
        '',
        null,
        undefined,
      ];

      nonWebUrls.forEach(url => {
        expect(ImageService.isWebUrl(url as any)).toBe(false);
      });
    });
  });
});
