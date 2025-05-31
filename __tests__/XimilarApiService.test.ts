/**
 * =================================================================
 * XIMILAR API SERVICE TESTS
 * =================================================================
 * 
 * Comprehensive test suite for the XimilarApiService
 * Tests all public methods and error handling scenarios
 * Validates API integration and response processing
 */

import { XimilarApiService } from '../src/services/api/XimilarApiService';
import { XimilarApiResponse } from '../src/types';
import axios from 'axios';

// Mock axios for testing
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock ImageUploadService
jest.mock('../src/services/image/ImageUploadService', () => ({
  ImageUploadService: {
    uploadBase64Image: jest.fn().mockResolvedValue('https://example.com/uploaded-image.jpg'),
  },
}));

// Mock console methods to test logging
const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

describe('XimilarApiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    consoleLogSpy.mockClear();
    consoleErrorSpy.mockClear();
    // Mock axios.isAxiosError to return true by default for test errors
    jest.spyOn(axios, 'isAxiosError').mockImplementation((error: any) => {
      return error && error.isAxiosError === true;
    });
  });

  afterAll(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('gradeCard', () => {
    it('should successfully grade a card with valid response', async () => {
      const mockApiResponse: XimilarApiResponse = {
        records: [
          {
            _id: 'record-123',
            _url: 'https://example.com/test-image.jpg',
            _status: {
              code: 200,
              text: 'OK',
              request_id: 'test-123',
            },
            _width: 800,
            _height: 1200,
            _objects: [
              {
                id: 'card-1',
                name: 'Card',
                prob: 0.95,
                bound_box: [0, 0, 800, 1200],
                area: 960000,
              },
            ],
            grades: {
              final: 8.5,
              corners: 8,
              edges: 8.5,
              surface: 9,
              centering: 8,
            },
            card: [
              {
                name: 'CARD',
                polygon: [[0, 0], [800, 0], [800, 1200], [0, 1200]],
                bound_box: [0, 0, 800, 1200],
                _tags: {
                  Category: [{ id: 'cat1', name: 'Pokemon', prob: 0.95 }],
                  Damaged: [{ id: 'dmg1', name: 'Minor Damage', prob: 0.7 }],
                  Autograph: [{ id: 'aut1', name: 'No', prob: 0.9 }],
                  Side: [{ id: 'side1', name: 'Back', prob: 0.8 }],
                },
                surface: { grade: 9 },
                centering: {
                  'left/right': '50/50',
                  'top/bottom': '50/50',
                  bound_box: [0, 0, 800, 1200],
                  grade: 8,
                },
              },
            ],
            corners: [],
            edges: [],
            versions: {
              detection: '1.0',
              points: '1.0',
              corners: '1.0',
              edges: '1.0',
              surface: '1.0',
              centering: '1.0',
              final: '1.0',
            },
          },
        ],
        status: {
          code: 200,
          text: 'OK',
          request_id: 'test-123',
        },
        statistics: {
          'processing time': 2.5,
        },
      };

      mockedAxios.post.mockResolvedValueOnce({ data: mockApiResponse });

      const result = await XimilarApiService.gradeCard('https://example.com/test-image.jpg');

      expect(result).toEqual({
        category: 'Pokemon',
        centeringGrade: 8,
        confidence: 0.95,
        cornerGrade: 8,
        edgeGrade: 8.5,
        finalGrade: 8.5,
        hasAutograph: false,
        imageUrl: undefined,
        isDamaged: true,
        isfront: false,
        surfaceGrade: 9,
      });

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://api.ximilar.com/card-grader/v2/grade',
        {
          records: [{ _url: 'https://example.com/test-image.jpg' }],
        },
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          }),
          timeout: 30000,
        }),
      );
    });

    it('should handle API authentication errors (401)', async () => {
      const error = {
        response: { status: 401, data: { message: 'Invalid token' } },
        isAxiosError: true,
      };
      mockedAxios.post.mockRejectedValueOnce(error);
      jest.spyOn(axios, 'isAxiosError').mockReturnValueOnce(true);

      await expect(XimilarApiService.gradeCard('https://example.com/test-image.jpg'))
        .rejects.toThrow('Authentication failed. Please check your API token.');
    });

    it('should handle rate limiting errors (429)', async () => {
      const error = {
        response: { status: 429, data: { message: 'Rate limit exceeded' } },
        isAxiosError: true,
      };
      mockedAxios.post.mockRejectedValueOnce(error);
      jest.spyOn(axios, 'isAxiosError').mockReturnValueOnce(true);

      await expect(XimilarApiService.gradeCard('https://example.com/test-image.jpg'))
        .rejects.toThrow('Rate limit exceeded. Please try again later.');
    });

    it('should handle network timeout errors', async () => {
      const error = {
        code: 'ECONNABORTED',
        isAxiosError: true,
      };
      mockedAxios.post.mockRejectedValueOnce(error);
      jest.spyOn(axios, 'isAxiosError').mockReturnValueOnce(true);

      await expect(XimilarApiService.gradeCard('https://example.com/test-image.jpg'))
        .rejects.toThrow('Request timed out. Please check your internet connection.');
    });
  });

  describe('gradeBatchCards', () => {
    it('should process multiple cards in batch', async () => {
      const mockResponse: XimilarApiResponse = {
        records: [
          {
            _id: 'card1',
            _url: 'https://example.com/card1.jpg',
            _status: { code: 200, text: 'OK', request_id: 'batch-1' },
            _width: 800,
            _height: 1200,
            grades: { final: 9.0, corners: 9.0, edges: 9.0, surface: 9.0, centering: 8.5 },
            _objects: [{ id: 'obj1', name: 'Card', prob: 0.95, bound_box: [0, 0, 800, 1200], area: 960000 }],
            card: [],
            corners: [],
            edges: [],
            versions: {
              detection: '1.0',
              points: '1.0',
              corners: '1.0',
              edges: '1.0',
              surface: '1.0',
              centering: '1.0',
              final: '1.0',
            },
          },
        ],
        status: { code: 200, text: 'OK', request_id: 'batch-request' },
        statistics: { 'processing time': 4.2 },
      };

      mockedAxios.post.mockResolvedValueOnce({ data: mockResponse });

      const imageUris = ['https://example.com/card1.jpg'];
      const result = await XimilarApiService.gradeBatchCards(imageUris);

      expect(result).toEqual(mockResponse);
      expect(result.records).toHaveLength(1);
    });

    it('should reject empty batch requests', async () => {
      await expect(XimilarApiService.gradeBatchCards([]))
        .rejects.toThrow('No images provided for batch processing');
    });

    it('should reject oversized batch requests', async () => {
      const largeImageArray = new Array(11).fill('image.jpg');

      await expect(XimilarApiService.gradeBatchCards(largeImageArray))
        .rejects.toThrow('Batch size too large. Maximum 10 images per batch.');
    });
  });

  describe('checkApiStatus', () => {
    it('should return true for healthy API', async () => {
      mockedAxios.post.mockResolvedValueOnce({ status: 200 });

      const isHealthy = await XimilarApiService.checkApiStatus();
      expect(isHealthy).toBe(true);
    });

    it('should return false for unhealthy API', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Network error'));

      const isHealthy = await XimilarApiService.checkApiStatus();
      expect(isHealthy).toBe(false);
    });
  });

  describe('interpretGrade', () => {
    it('should interpret grades correctly', () => {
      expect(XimilarApiService.interpretGrade(10)).toBe('Gem Mint');
      expect(XimilarApiService.interpretGrade(9)).toBe('Mint');
      expect(XimilarApiService.interpretGrade(8)).toBe('Near Mint/Mint');
      expect(XimilarApiService.interpretGrade(7)).toBe('Excellent');
      expect(XimilarApiService.interpretGrade(6)).toBe('Very Good');
      expect(XimilarApiService.interpretGrade(5)).toBe('Good');
      expect(XimilarApiService.interpretGrade(4)).toBe('Fair');
      expect(XimilarApiService.interpretGrade(3)).toBe('Poor');
      expect(XimilarApiService.interpretGrade(2)).toBe('Damaged');
      expect(XimilarApiService.interpretGrade(1)).toBe('Authentic (Damaged)');
      expect(XimilarApiService.interpretGrade(0)).toBe('Damaged');
    });

    it('should handle edge cases', () => {
      expect(XimilarApiService.interpretGrade(undefined)).toBe('Not Graded');
      expect(XimilarApiService.interpretGrade(null as any)).toBe('Not Graded');
      expect(XimilarApiService.interpretGrade(0)).toBe('Damaged');
      expect(XimilarApiService.interpretGrade(11)).toBe('Gem Mint');
      expect(XimilarApiService.interpretGrade(-1)).toBe('Damaged');
    });
  });
});
