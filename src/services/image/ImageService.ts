/**
 * =================================================================
 * IMAGE SERVICE
 * =================================================================
 *
 * This service handles image processing operations including:
 * - Converting local file URIs to base64 format
 * - File system operations for images
 * - Image format validation and conversion
 *
 * Features:
 * - ✅ File URI to Base64 conversion
 * - ✅ Error handling and validation
 * - ✅ Support for common image formats
 * - ✅ Memory-efficient processing
 * =================================================================
 */

import RNFS from 'react-native-fs';

/**
 * =================================================================
 * IMAGE SERVICE CLASS
 * =================================================================
 *
 * Provides utilities for image processing and conversion
 */
export class ImageService {
  
  /**
   * Convert a local file URI to base64 format
   * 
   * This method reads a local image file and converts it to a base64 string
   * that can be sent to external APIs. Handles React Native file URIs from
   * camera and image picker.
   *
   * @param fileUri - Local file URI (e.g., "file:///path/to/image.jpg")
   * @returns Promise<string> - Base64 encoded image data with data URI prefix
   * @throws Error if file doesn't exist, cannot be read, or is invalid
   */
  static async convertFileUriToBase64(fileUri: string): Promise<string> {
    try {
      console.log('🔄 Converting file URI to base64:', fileUri);
      
      // Step 1: Validate input
      if (!fileUri || fileUri.trim() === '') {
        throw new Error('File URI is required');
      }

      // Step 2: Clean up the URI - remove 'file://' prefix if present
      let filePath = fileUri;
      if (filePath.startsWith('file://')) {
        filePath = filePath.replace('file://', '');
      }

      console.log('📂 Reading file from path:', filePath);

      // Step 3: Check if file exists
      const fileExists = await RNFS.exists(filePath);
      if (!fileExists) {
        throw new Error(`File does not exist at path: ${filePath}`);
      }

      // Step 4: Get file info to validate it's an image
      const fileInfo = await RNFS.stat(filePath);
      console.log('📊 File info:', {
        size: fileInfo.size,
        isFile: fileInfo.isFile(),
        path: fileInfo.path,
      });

      if (!fileInfo.isFile()) {
        throw new Error('Path does not point to a file');
      }

      // Validate file size (prevent memory issues with very large files)
      const maxFileSizeBytes = 10 * 1024 * 1024; // 10MB limit
      if (fileInfo.size > maxFileSizeBytes) {
        throw new Error(`File size too large: ${fileInfo.size} bytes. Maximum allowed: ${maxFileSizeBytes} bytes`);
      }

      // Step 5: Read file as base64
      console.log('📖 Reading file as base64...');
      const base64Data = await RNFS.readFile(filePath, 'base64');
      
      // Step 6: Determine MIME type from file extension
      const mimeType = this.getMimeTypeFromPath(filePath);
      
      // Step 7: Create data URI
      const dataUri = `data:${mimeType};base64,${base64Data}`;
      
      console.log('✅ Successfully converted to base64:', {
        originalSize: fileInfo.size,
        base64Length: base64Data.length,
        mimeType: mimeType,
        dataUriLength: dataUri.length,
      });

      return dataUri;
      
    } catch (error) {
      console.error('❌ Failed to convert file URI to base64:', error);
      throw new Error(`Image conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Determine MIME type from file path
   *
   * @param filePath - Path to the image file
   * @returns MIME type string
   */
  private static getMimeTypeFromPath(filePath: string): string {
    const extension = filePath.toLowerCase().split('.').pop();
    
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'gif':
        return 'image/gif';
      case 'webp':
        return 'image/webp';
      case 'bmp':
        return 'image/bmp';
      case 'tiff':
      case 'tif':
        return 'image/tiff';
      default:
        // Default to JPEG for unknown extensions
        console.warn(`Unknown image extension: ${extension}. Defaulting to image/jpeg`);
        return 'image/jpeg';
    }
  }

  /**
   * Validate if a string is a valid base64 data URI
   *
   * @param dataUri - Data URI to validate
   * @returns boolean - true if valid base64 data URI
   */
  static isValidBase64DataUri(dataUri: string): boolean {
    if (!dataUri || typeof dataUri !== 'string') {
      return false;
    }

    // Check if it starts with data URI prefix
    if (!dataUri.startsWith('data:')) {
      return false;
    }

    // Check if it contains base64 indicator
    if (!dataUri.includes('base64,')) {
      return false;
    }

    // Basic validation of base64 content
    try {
      const base64Part = dataUri.split('base64,')[1];
      if (!base64Part) {
        return false;
      }

      // Check if base64 string has valid characters
      const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
      return base64Regex.test(base64Part);
    } catch {
      return false;
    }
  }

  /**
   * Check if a URI is a local file URI
   *
   * @param uri - URI to check
   * @returns boolean - true if it's a local file URI
   */
  static isLocalFileUri(uri: string): boolean {
    if (!uri || typeof uri !== 'string') {
      return false;
    }

    // Check for common local file URI patterns
    return uri.startsWith('file://') || 
           uri.startsWith('/') || 
           (uri.includes('/var/mobile/') || uri.includes('/data/')) ||
           uri.startsWith('content://'); // Android content URIs
  }

  /**
   * Check if a URI is a web URL
   *
   * @param uri - URI to check
   * @returns boolean - true if it's a web URL
   */
  static isWebUrl(uri: string): boolean {
    if (!uri || typeof uri !== 'string') {
      return false;
    }

    return uri.startsWith('http://') || uri.startsWith('https://');
  }
}
