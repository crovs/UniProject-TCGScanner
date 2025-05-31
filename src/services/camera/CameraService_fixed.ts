import { launchImageLibrary, launchCamera, ImagePickerResponse, MediaType, PhotoQuality } from 'react-native-image-picker';
import { Card } from '../../types';
import { CardModel } from '../../models';
import { XimilarApiService } from '../api/XimilarApiService';
import { PermissionsService } from '../permissions/PermissionsService';

/**
 * CameraService
 *
 * This service handles all camera-related operations including:
 * - Taking photos with device camera
 * - Selecting images from photo library
 * - Processing images through Ximilar Card Grader API
 * - Converting API responses to Card objects
 *
 * The service integrates with the real Ximilar API to provide accurate
 * card recognition and grading functionality.
 */
export class CameraService {
  /**
   * Opens the device camera to capture a new photo
   *
   * Configuration:
   * - Photo mode only (no video)
   * - Maximum resolution: 2000x2000 (optimized for API processing)
   * - Base64 encoding disabled (for performance)
   *
   * @returns Promise<string | null> - URI of captured image or null if cancelled
   */
  static async openCamera(): Promise<string | null> {
    // Check and request camera permission first
    const hasPermission = await PermissionsService.requestCameraPermission();
    if (!hasPermission) {
      console.log('Camera permission denied');
      return null;
    }

    return new Promise((resolve) => {
      const options = {
        mediaType: 'photo' as MediaType,
        includeBase64: false,
        maxHeight: 2000,
        maxWidth: 2000,
        quality: 0.8 as PhotoQuality, // Optimize for API upload while maintaining quality
      };

      launchCamera(options, (response: ImagePickerResponse) => {
        if (response.didCancel || response.errorMessage) {
          console.log('Camera cancelled or error:', response.errorMessage);
          resolve(null);
          return;
        }

        if (response.assets && response.assets[0]) {
          resolve(response.assets[0].uri || null);
        } else {
          resolve(null);
        }
      });
    });
  }

  /**
   * Opens the photo library to select an existing image
   *
   * Configuration matches camera settings for consistency
   *
   * @returns Promise<string | null> - URI of selected image or null if cancelled
   */
  static async openImageLibrary(): Promise<string | null> {
    // Check and request photo library permission first
    const hasPermission = await PermissionsService.requestPhotoLibraryPermission();
    if (!hasPermission) {
      console.log('Photo library permission denied');
      return null;
    }

    return new Promise((resolve) => {
      const options = {
        mediaType: 'photo' as MediaType,
        includeBase64: false,
        maxHeight: 2000,
        maxWidth: 2000,
        quality: 0.8 as PhotoQuality,
      };

      launchImageLibrary(options, (response: ImagePickerResponse) => {
        if (response.didCancel || response.errorMessage) {
          console.log('Image library cancelled or error:', response.errorMessage);
          resolve(null);
          return;
        }

        if (response.assets && response.assets[0]) {
          resolve(response.assets[0].uri || null);
        } else {
          resolve(null);
        }
      });
    });
  }

  /**
   * MAIN CARD RECOGNITION METHOD
   *
   * Takes an image URI and processes it through the Ximilar Card Grader API
   * to get professional grading information, then converts the response
   * to our standardized Card model.
   *
   * Process:
   * 1. Validates the image URI
   * 2. Sends image to Ximilar API for grading
   * 3. Converts API response to our Card model
   * 4. Returns card with confidence score
   *
   * The API provides:
   * - Card grading (condition assessment)
   * - Category detection (Sport, Gaming, etc.)
   * - Damage assessment
   * - Surface quality scores
   * - Confidence scores for accuracy
   *
   * Note: Ximilar API provides grading data only, not card identification
   *
   * @param imageUri - Local URI of the card image to process
   * @returns Promise<{ card: Card; confidence: number }> - Recognized card data
   * @throws Error if API call fails or image processing fails
   */
  static async recognizeCard(imageUri: string): Promise<{ card: Card; confidence: number; gradingResult: any }> {
    try {
      console.log('Starting card recognition for image:', imageUri);

      // Call the real Ximilar API service
      const gradingResult = await XimilarApiService.gradeCard(imageUri);

      // Convert Ximilar grading result to our Card model
      // Note: Ximilar API only provides grading data, not card identification
      const card: Card = {
        id: `ximilar_${Date.now()}`, // Generate unique ID
        name: this.generateCardNameFromGrading(gradingResult), // Generate name based on available grading data
        set: gradingResult.category || 'Trading Card Collection',
        rarity: this.mapRarityFromGrade(gradingResult.finalGrade),
        condition: this.mapConditionFromGrade(gradingResult.finalGrade),
        price: 0, // Placeholder - would need market data integration
        imageUrl: imageUri, // Use local image URI
        description: `Graded ${gradingResult.category} card. Final grade: ${gradingResult.finalGrade}/10. Surface: ${gradingResult.surfaceGrade}/10. ${gradingResult.isDamaged ? 'Shows damage. ' : 'In good condition. '}${gradingResult.hasAutograph ? 'Has autograph. ' : ''}`,
        artist: 'Unknown',
        year: new Date().getFullYear(),
        type: gradingResult.subcategory || gradingResult.category || 'Trading Card',
        // Additional metadata from API
        apiData: {
          confidence: gradingResult.confidence,
          grade: gradingResult.finalGrade,
          gradingService: 'Ximilar',
        },
      };

      console.log('Card recognition successful, grade:', gradingResult.finalGrade);

      return {
        card,
        confidence: gradingResult.confidence,
        gradingResult: gradingResult,
      };
    } catch (error) {
      console.error('Card recognition failed:', error);

      // Fallback: Create a basic card with the image
      // This ensures the app doesn't crash if API fails
      const fallbackCard = CardModel.createMockCard();
      fallbackCard.imageUrl = imageUri;
      fallbackCard.name = 'Unrecognized Card';
      fallbackCard.description = 'Card could not be identified. Please try again or add details manually.';

      return {
        card: fallbackCard,
        confidence: 0.1, // Very low confidence for fallback
        gradingResult: null,
      };
    }
  }

  /**
   * Generates a descriptive card name based on available grading data
   * Since Ximilar API doesn't provide card identification, we create meaningful names
   * based on category, condition, and grading information
   */
  private static generateCardNameFromGrading(gradingResult: any): string {
    const category = gradingResult.category || 'Trading Card';
    const subcategory = gradingResult.subcategory;
    const grade = gradingResult.finalGrade;
    const isDamaged = gradingResult.isDamaged;
    const hasAutograph = gradingResult.hasAutograph;

    // Build descriptive name parts
    let nameParts: string[] = [];

    // Add condition prefix based on grade
    if (grade >= 9) {
      nameParts.push('Premium');
    } else if (grade >= 8) {
      nameParts.push('Mint');
    } else if (grade >= 7) {
      nameParts.push('Excellent');
    } else if (grade >= 5) {
      nameParts.push('Good');
    } else if (isDamaged) {
      nameParts.push('Damaged');
    }

    // Add category/subcategory
    if (subcategory) {
      nameParts.push(subcategory);
    } else {
      nameParts.push(category);
    }

    // Add special attributes
    if (hasAutograph) {
      nameParts.push('(Autographed)');
    }

    // If no descriptive parts, use grade-based name
    if (nameParts.length === 0) {
      return `Graded Card (${grade}/10)`;
    }

    return nameParts.join(' ');
  }

  /**
   * Maps numeric grade to rarity based on condition
   * Higher grades suggest rarer/more valuable cards
   */
  private static mapRarityFromGrade(grade: number): string {
    if (grade >= 9.5) {
      return 'Ultra Rare';
    }
    if (grade >= 8.5) {
      return 'Rare';
    }
    if (grade >= 7) {
      return 'Uncommon';
    }
    return 'Common';
  }

  /**
   * Maps Ximilar API category to our standard rarity format
   *
   * @param category - Category from Ximilar API
   * @returns Standard rarity string
   */
  private static mapRarityFromCategory(category?: string): string {
    if (!category) {
      return 'Common';
    }

    const categoryLower = category.toLowerCase();
    if (categoryLower.includes('rare') || categoryLower.includes('special')) {
      return 'Rare';
    }
    if (categoryLower.includes('uncommon')) {
      return 'Uncommon';
    }
    return 'Common';
  }

  /**
   * Maps Ximilar API grade (1-10 scale) to human-readable condition
   *
   * Grade Scale:
   * 10: Gem Mint (Perfect condition)
   * 9: Mint (Near perfect)
   * 8: Near Mint/Mint (Excellent)
   * 7: Near Mint (Very good)
   * 6: Excellent/Near Mint (Good)
   * 5: Very Good (Average)
   * 4: Good (Below average)
   * 3: Very Good/Good (Poor)
   * 2: Good/Fair (Very poor)
   * 1: Poor (Damaged)
   *
   * @param grade - Numeric grade from 1-10
   * @returns Human-readable condition string
   */
  private static mapConditionFromGrade(grade?: number): string {
    if (!grade) {
      return 'Unknown';
    }

    if (grade >= 10) {
      return 'Gem Mint';
    }
    if (grade >= 9) {
      return 'Mint';
    }
    if (grade >= 8) {
      return 'Near Mint/Mint';
    }
    if (grade >= 7) {
      return 'Near Mint';
    }
    if (grade >= 6) {
      return 'Excellent';
    }
    if (grade >= 5) {
      return 'Very Good';
    }
    if (grade >= 4) {
      return 'Good';
    }
    if (grade >= 3) {
      return 'Fair';
    }
    if (grade >= 2) {
      return 'Poor';
    }
    return 'Damaged';
  }
}
