/**
 * Mock for react-native-fs
 * Provides mock implementations for file system operations needed by ImageService
 */

const RNFS = {
  // Mock file operations
  exists: jest.fn().mockResolvedValue(true),
  stat: jest.fn().mockResolvedValue({
    size: 1024000, // 1MB
    isFile: () => true,
    path: '/mock/path/to/image.jpg',
  }),
  readFile: jest.fn().mockResolvedValue('mock-base64-data'),

  // Mock directories
  DocumentDirectoryPath: '/mock/documents',
  CachesDirectoryPath: '/mock/caches',
  ExternalDirectoryPath: '/mock/external',

  // Mock constants
  MainBundlePath: '/mock/bundle',
  TemporaryDirectoryPath: '/mock/tmp',
};

export default RNFS;
