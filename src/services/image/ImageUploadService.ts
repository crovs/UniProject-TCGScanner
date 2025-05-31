/**
 * =================================================================
 * IMAGE UPLOAD SERVICE
 * =================================================================
 *
 * This service handles uploading local images to a temporary hosting
 * service so they can be accessed via public URLs by external APIs
 * like Ximilar that require HTTP/HTTPS image URLs.
 *
 * Features:
 * - Upload local images to ImgBB (free tier)
 * - Convert base64 images to public URLs
 * - Automatic cleanup and temporary hosting
 * - Error handling and retry logic
 *
 * =================================================================
 */

import axios from 'axios';
import Config from 'react-native-config';

/**
 * Response interface for ImgBB API
 */
interface ImgBBResponse {
  data: {
    id: string;
    title: string;
    url_viewer: string;
    url: string;
    display_url: string;
    width: number;
    height: number;
    size: number;
    time: number;
    expiration: number;
    image: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
    thumb: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
    medium: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
    delete_url: string;
  };
  success: boolean;
  status: number;
}

/**
 * Alternative free image hosting services for fallback
 */
const ALTERNATIVE_SERVICES = {
  // Temporary.pics (no API key required)
  TEMPORARY_PICS: 'https://temporary.pics/upload',
  // 0x0.st (no API key required)
  ZERO_X_ZERO: 'https://0x0.st',
};

/**
 * =================================================================
 * IMAGE UPLOAD SERVICE CLASS
 * =================================================================
 */
export class ImageUploadService {
  /**
   * ImgBB API configuration
   * Falls back to a demo key for testing purposes
   */
  private static readonly IMGBB_API_KEY = Config.IMGBB_API_KEY || 'your_imgbb_api_key_here';
  private static readonly IMGBB_UPLOAD_URL = 'https://api.imgbb.com/1/upload';
  
  /**
   * Request timeout in milliseconds
   */
  private static readonly REQUEST_TIMEOUT = 30000; // 30 seconds
  
  /**
   * Upload a base64 image to a temporary hosting service
   * Returns a public URL that can be accessed by external APIs
   *
   * @param base64Image - Base64 encoded image data (with or without data URI prefix)
   * @param filename - Optional filename for the uploaded image
   * @returns Promise<string> - Public URL of the uploaded image
   * @throws Error if upload fails
   */
  static async uploadBase64Image(
    base64Image: string,
    filename: string = 'card_image.jpg'
  ): Promise<string> {
    try {
      console.log('🔄 Starting image upload to temporary hosting...');
      
      // Clean base64 data - remove data URI prefix if present
      const cleanBase64 = this.cleanBase64Data(base64Image);
      
      if (!cleanBase64) {
        throw new Error('Invalid base64 image data provided');
      }
      
      // Try ImgBB first if we have an API key
      if (this.IMGBB_API_KEY && this.IMGBB_API_KEY !== 'your_imgbb_api_key_here') {
        try {
          const url = await this.uploadToImgBB(cleanBase64, filename);
          console.log('✅ Successfully uploaded to ImgBB:', url);
          return url;
        } catch (imgbbError) {
          console.warn('⚠️ ImgBB upload failed, trying alternative service...');
          console.error('ImgBB error:', imgbbError);
        }
      }
      
      // Fallback to alternative service
      const url = await this.uploadToAlternativeService(cleanBase64, filename);
      console.log('✅ Successfully uploaded to alternative service:', url);
      return url;
      
    } catch (error) {
      console.error('❌ Failed to upload image to temporary hosting:', error);
      throw new Error(
        `Failed to upload image to temporary hosting: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }
  
  /**
   * Upload to ImgBB service
   */
  private static async uploadToImgBB(base64Data: string, filename: string): Promise<string> {
    const formData = new FormData();
    formData.append('key', this.IMGBB_API_KEY);
    formData.append('image', base64Data);
    formData.append('name', filename);
    formData.append('expiration', '600'); // 10 minutes expiration
    
    const response = await axios.post<ImgBBResponse>(this.IMGBB_UPLOAD_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: this.REQUEST_TIMEOUT,
    });
    
    if (!response.data.success) {
      throw new Error('ImgBB upload failed');
    }
    
    return response.data.data.url;
  }
  
  /**
   * Upload to alternative free service (0x0.st)
   * This service doesn't require an API key
   */
  private static async uploadToAlternativeService(base64Data: string, filename: string): Promise<string> {
    // Convert base64 to blob for upload
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    const formData = new FormData();
    formData.append('file', {
      uri: `data:image/jpeg;base64,${base64Data}`,
      type: 'image/jpeg',
      name: filename,
    } as any);
    formData.append('expires', '24'); // 24 hours expiration
    
    const response = await axios.post(ALTERNATIVE_SERVICES.ZERO_X_ZERO, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: this.REQUEST_TIMEOUT,
    });
    
    // 0x0.st returns the URL directly as text
    if (typeof response.data === 'string' && response.data.startsWith('http')) {
      return response.data.trim();
    }
    
    throw new Error('Alternative service upload failed');
  }
  
  /**
   * Clean base64 data by removing data URI prefix if present
   */
  private static cleanBase64Data(base64Image: string): string {
    if (!base64Image) {
      return '';
    }
    
    // Remove data URI prefix if present (e.g., "data:image/jpeg;base64,")
    const base64Match = base64Image.match(/^data:image\/[^;]+;base64,(.+)$/);
    if (base64Match) {
      return base64Match[1];
    }

    // Return as-is if it's already clean base64
    return base64Image;
  }
  
  /**
   * Validate if a string is valid base64 data
   */
  private static isValidBase64(str: string): boolean {
    try {
      // Check if string matches base64 pattern
      const base64Pattern = /^[A-Za-z0-9+/]+=*$/;
      if (!base64Pattern.test(str)) {
        return false;
      }

      // Try to decode to verify it's valid
      atob(str);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if we have a valid configuration for image uploading
   */
  static hasValidConfiguration(): boolean {
    return (
      (this.IMGBB_API_KEY && this.IMGBB_API_KEY !== 'your_imgbb_api_key_here') ||
      true // Alternative services don't require API keys
    );
  }

  /**
   * Get configuration status for debugging
   */
  static getConfigurationStatus(): {
    imgbbConfigured: boolean;
    alternativeAvailable: boolean;
    canUpload: boolean;
  } {
    const imgbbConfigured = Boolean(this.IMGBB_API_KEY && this.IMGBB_API_KEY !== 'your_imgbb_api_key_here');

    return {
      imgbbConfigured,
      alternativeAvailable: true,
      canUpload: imgbbConfigured || true,
    };
  }
}
