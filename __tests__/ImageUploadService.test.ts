/**
 * =================================================================
 * IMAGE UPLOAD SERVICE TESTS
 * =================================================================
 *
 * Tests for the ImageUploadService to ensure proper image uploading
 * functionality for converting local images to public URLs.
 *
 * =================================================================
 */

import { ImageUploadService } from '../src/services/image/ImageUploadService';

// Mock axios for testing
jest.mock('axios');
import axios from 'axios';
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock react-native-config
jest.mock('react-native-config', () => ({
  IMGBB_API_KEY: undefined,
  IMGBB_BASE_URL: undefined,
}));

describe('ImageUploadService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();
  });

  describe('cleanBase64Data', () => {
    it('should remove data URI prefix from base64 string', () => {
      const base64WithPrefix = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2w==';
      const result = (ImageUploadService as any).cleanBase64Data(base64WithPrefix);
      expect(result).toBe('/9j/4AAQSkZJRgABAQEAYABgAAD/2w==');
    });

    it('should return clean base64 string as-is', () => {
      const cleanBase64 = '/9j/4AAQSkZJRgABAQEAYABgAAD/2w==';
      const result = (ImageUploadService as any).cleanBase64Data(cleanBase64);
      expect(result).toBe(cleanBase64);
    });

    it('should return empty string for null/undefined input', () => {
      expect((ImageUploadService as any).cleanBase64Data(null)).toBe('');
      expect((ImageUploadService as any).cleanBase64Data(undefined)).toBe('');
      expect((ImageUploadService as any).cleanBase64Data('')).toBe('');
    });
  });

  describe('hasValidConfiguration', () => {
    it('should return true when alternative services are available', () => {
      expect(ImageUploadService.hasValidConfiguration()).toBe(true);
    });
  });

  describe('getConfigurationStatus', () => {
    it('should return correct status when no ImgBB key is configured', () => {
      const status = ImageUploadService.getConfigurationStatus();
      expect(status).toEqual({
        imgbbConfigured: false,
        alternativeAvailable: true,
        canUpload: true,
      });
    });
  });

  describe('uploadBase64Image', () => {
    it('should successfully upload using alternative service', async () => {
      // Mock successful response from alternative service
      mockedAxios.post.mockResolvedValue({
        data: 'https://0x0.st/test-image.jpg',
      });

      const base64Image = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2w==';
      const result = await ImageUploadService.uploadBase64Image(base64Image);

      expect(result).toBe('https://0x0.st/test-image.jpg');
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://0x0.st',
        expect.any(FormData),
        expect.objectContaining({
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 30000,
        }),
      );
    });

    it('should handle upload failure gracefully', async () => {
      mockedAxios.post.mockRejectedValue(new Error('Network error'));

      const base64Image = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2w==';

      await expect(ImageUploadService.uploadBase64Image(base64Image)).rejects.toThrow(
        'Failed to upload image to temporary hosting: Network error',
      );
    });

    it('should handle invalid base64 data', async () => {
      await expect(ImageUploadService.uploadBase64Image('')).rejects.toThrow(
        'Failed to upload image to temporary hosting',
      );
    });

    it('should handle clean base64 without data URI prefix', async () => {
      mockedAxios.post.mockResolvedValue({
        data: 'https://0x0.st/test-image.jpg',
      });

      const cleanBase64 = '/9j/4AAQSkZJRgABAQEAYABgAAD/2w==';
      const result = await ImageUploadService.uploadBase64Image(cleanBase64);

      expect(result).toBe('https://0x0.st/test-image.jpg');
    });
  });

  describe('isValidBase64', () => {
    it('should validate correct base64 strings', () => {
      const validBase64 = '/9j/4AAQSkZJRgABAQEAYABgAAD/2w==';
      expect((ImageUploadService as any).isValidBase64(validBase64)).toBe(true);
    });

    it('should reject invalid base64 strings', () => {
      expect((ImageUploadService as any).isValidBase64('invalid-base64!')).toBe(false);
      expect((ImageUploadService as any).isValidBase64('')).toBe(false);
    });
  });
});
