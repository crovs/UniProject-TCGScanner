/**
 * =================================================================
 * XIMILAR API SERVICE
 * =================================================================
 *
 * This service integrates with the Ximilar Card Grader API to provide
 * real card condition analysis and grading functionality.
 *
 * Features:
 * - Secure API token management
 * - Real card gr      // Send a minimal request to check connectivity
      const response = await axios.post(
        `${this.BASE_URL}${this.GRADE_ENDPOINT}`,
        { records: [] }, // Empty request to test authentication
        {
          headers: {
            'Authorization': `Token ${this.API_TOKEN}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          timeout: 10000, // Short timeout for status check
        }
      );is
 * - Comprehensive error handling
 * - Type-safe API responses
 * - Image upload and processing
 *
 * - ✅ External API Integration
 * - ✅ Network Error Handling
 * - ✅ Secure Configuration Management
 * - ✅ TypeScript Type Safety
 * =================================================================
 */

import axios, { AxiosResponse } from 'axios';
import Config from 'react-native-config';
import {
  XimilarApiResponse,
  XimilarGradingResult,
  XimilarRecord,
  Card,
} from '../../types';
import { ImageService } from '../image/ImageService';
import { ImageUploadService } from '../image/ImageUploadService';

/**
 * =================================================================
 * XIMILAR API SERVICE CLASS
 * =================================================================
 *
 * Handles all communication with the Ximilar Card Grader API
 * Provides methods for card grading and image analysis
 */
export class XimilarApiService {
  // ===============================================================
  // PRIVATE CONFIGURATION
  // ===============================================================

  /**
   * API Configuration loaded from environment variables
   * This ensures secure token management and prevents hardcoding
   */
  private static readonly API_TOKEN = Config.XIMILAR_API_TOKEN || 'INSERT YOUR API TOEKN HERE';
  private static readonly BASE_URL = Config.XIMILAR_BASE_URL || 'https://api.ximilar.com/card-grader/v2';
  private static readonly GRADE_ENDPOINT = '/grade';

  /**
   * Request timeout in milliseconds
   * Prevents hanging requests and improves user experience
   */
  private static readonly REQUEST_TIMEOUT = 30000; // 30 seconds

  // ===============================================================
  // PUBLIC API METHODS
  // ===============================================================

  /**
   * MAIN CARD GRADING METHOD
   *
   * Takes an image URL and sends it to Ximilar for professional grading
   * Returns comprehensive grading information including:
   * - Corner condition analysis
   * - Edge wear assessment
   * - Surface quality evaluation
   * - Centering measurement
   * - Overall condition grade
   *
   * @param imageUrl - URL or base64 string of the card image
   * @returns Promise<XimilarGradingResult> - Processed grading data
   * @throws Error if API request fails or response is invalid
   */
  static async gradeCard(imageUrl: string): Promise<XimilarGradingResult> {
    try {
      console.log('🔄 Starting card grading process...');

      // Step 1: Validate input
      if (!imageUrl || imageUrl.trim() === '') {
        throw new Error('Image URL is required for grading');
      }

      // Step 2: Convert local files and base64 data to public URLs
      let processedImageUrl = imageUrl;

      if (ImageService.isLocalFileUri(imageUrl)) {
        console.log('🔄 Local file URI detected, converting to base64 and uploading...');
        try {
          const base64Image = await ImageService.convertFileUriToBase64(imageUrl);
          console.log('✅ Successfully converted local file to base64');
          
          // Upload to get public URL
          processedImageUrl = await ImageUploadService.uploadBase64Image(base64Image, 'card_image.jpg');
          console.log('✅ Successfully uploaded image to public URL:', processedImageUrl);
        } catch (conversionError) {
          console.error('❌ Failed to process local file:', conversionError);
          throw new Error(`Failed to process local image file: ${conversionError instanceof Error ? conversionError.message : 'Unknown error'}`);
        }
      } else if (ImageService.isValidBase64DataUri(imageUrl)) {
        console.log('📊 Base64 data URI detected, uploading to get public URL...');
        try {
          processedImageUrl = await ImageUploadService.uploadBase64Image(imageUrl, 'card_image.jpg');
          console.log('✅ Successfully uploaded base64 image to public URL:', processedImageUrl);
        } catch (uploadError) {
          console.error('❌ Failed to upload base64 image:', uploadError);
          throw new Error(`Failed to upload base64 image: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}`);
        }
      } else if (ImageService.isWebUrl(imageUrl)) {
        console.log('🌐 Web URL detected, using as-is');
      } else {
        console.warn('⚠️ Unknown image URL format, attempting to use as-is:', imageUrl);
      }

      // Step 3: Verify we have a valid HTTP/HTTPS URL
      if (!processedImageUrl.startsWith('http://') && !processedImageUrl.startsWith('https://')) {
        throw new Error('Ximilar API requires a public HTTP/HTTPS image URL. Local files and base64 data must be uploaded first.');
      }

      // Step 4: Prepare API request with records format (matching Python example)
      const requestBody = {
        records: [
          {
            _url: processedImageUrl,
          },
        ],
      };

      console.log('📤 Sending request to Ximilar API...');
      console.log('🔗 Request URL:', `${this.BASE_URL}${this.GRADE_ENDPOINT}`);
      console.log('📦 Request body:', {
        records: [{ _url: processedImageUrl }],
      });

      // Log headers for debugging
      console.log('📋 Request headers:', {
        'Authorization': `Token ${this.API_TOKEN.substring(0, 8)}...`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      });

      // Step 5: Make API request with proper headers and authentication
      const response: AxiosResponse<XimilarApiResponse> = await axios.post(
        `${this.BASE_URL}${this.GRADE_ENDPOINT}`,
        requestBody,
        {
          headers: {
            'Authorization': `Token ${this.API_TOKEN}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          timeout: this.REQUEST_TIMEOUT,
        },
      );

      console.log('✅ Received response from Ximilar API');

      // Step 6: Validate response structure
      if (!response.data || !response.data.records || response.data.records.length === 0) {
        throw new Error('Invalid response from Ximilar API: No records found');
      }

      // Step 7: Extract first record (primary card analysis)
      const record = response.data.records[0];

      // Step 6: Process and return structured grading result
      const gradingResult = this.processGradingResponse(record);

      console.log('🎯 Card grading completed successfully');
      return gradingResult;

    } catch (error) {
      console.error('❌ Card grading failed:', error);

      // Enhanced error handling for different failure scenarios
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Authentication failed. Please check your API token.');
        } else if (error.response?.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        } else if (error.code === 'ECONNABORTED') {
          throw new Error('Request timed out. Please check your internet connection.');
        } else if (error.response?.status === 400) {
          throw new Error('Invalid request. Please check the image format.');
        } else if (error.response?.status && error.response.status >= 500) {
          throw new Error('Ximilar API server error. Please try again later.');
        } else if (!error.response) {
          throw new Error('Network error. Please check your internet connection.');
        }
      }

      throw new Error(`Card grading failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * BATCH CARD GRADING METHOD (ALIAS)
   *
   * Processes multiple card images with validation
   *
   * @param imageUrls - Array of image URLs to grade
   * @returns Promise<XimilarApiResponse> - Raw API response for batch processing
   */
  static async gradeBatchCards(imageUrls: string[]): Promise<XimilarApiResponse> {
    // Validation checks as expected by tests
    if (!imageUrls || imageUrls.length === 0) {
      throw new Error('No images provided for batch processing');
    }

    if (imageUrls.length > 10) {
      throw new Error('Batch size too large. Maximum 10 images per batch.');
    }

    try {
      console.log(`🔄 Starting batch grading for ${imageUrls.length} cards...`);

      // Process each image URL to handle local file URIs
      const processedUrls: string[] = [];
      
      for (let i = 0; i < imageUrls.length; i++) {
        const imageUrl = imageUrls[i];
        console.log(`🔄 Processing image ${i + 1}/${imageUrls.length}...`);
        
        if (ImageService.isLocalFileUri(imageUrl)) {
          console.log('🔄 Local file URI detected, converting to base64...');
          try {
            const base64Url = await ImageService.convertFileUriToBase64(imageUrl);
            processedUrls.push(base64Url);
            console.log('✅ Successfully converted local file to base64');
          } catch (conversionError) {
            console.error('❌ Failed to convert local file to base64:', conversionError);
            throw new Error(`Failed to process local image file ${i + 1}: ${conversionError instanceof Error ? conversionError.message : 'Unknown error'}`);
          }
        } else {
          processedUrls.push(imageUrl);
        }
      }

      // Prepare batch request (matching Python example format)
      const requestBody = {
        records: processedUrls.map(url => ({ _url: url })),
      };

      const response: AxiosResponse<XimilarApiResponse> = await axios.post(
        `${this.BASE_URL}${this.GRADE_ENDPOINT}`,
        requestBody,
        {
          headers: {
            'Authorization': `Token ${this.API_TOKEN}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          timeout: this.REQUEST_TIMEOUT * 2, // Longer timeout for batch processing
        }
      );

      console.log(`✅ Received batch response for ${response.data.records.length} cards`);
      return response.data;

    } catch (error) {
      console.error('❌ Batch card grading failed:', error);

      // Enhanced error handling to match test expectations
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Authentication failed. Please check your API token.');
        } else if (error.response?.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        } else if (error.code === 'ECONNABORTED') {
          throw new Error('Request timed out. Please check your internet connection.');
        } else if (error.response?.status === 400) {
          throw new Error('Invalid request. Please check the image format.');
        } else if (error.response?.status && error.response.status >= 500) {
          throw new Error('Ximilar API server error. Please try again later.');
        } else if (!error.response) {
          throw new Error('Network error. Please check your internet connection.');
        }
      }

      throw new Error(`Batch grading failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ===============================================================
  // PRIVATE HELPER METHODS
  // ===============================================================

  /**
   * RESPONSE PROCESSING METHOD
   *
   * Converts the Ximilar Card Grader API response into a simplified,
   * app-friendly format that includes actual card grading information
   *
   * @param record - Raw Ximilar API record
   * @returns XimilarGradingResult - Processed card grading data
   */
  static processGradingResponse(record: XimilarRecord): XimilarGradingResult {
    console.log('🔄 Processing Ximilar Card Grader API response...');

    // Extract the card grading data from the response
    const grades = record.grades;
    const cardData = record.card?.[0];
    const tags = cardData?._tags || {};

    // Extract identification from object detection (not card analysis)
    const cardObject = record._objects?.find(obj => obj.name === 'Card');
    const identification = cardObject?._identification;

    if (!grades) {
      throw new Error('No grading data found in the response');
    }

    // Extract actual grading scores
    const finalGrade = grades.final || 0;
    const cornerGrade = grades.corners || 0;
    const edgeGrade = grades.edges || 0;
    const surfaceGrade = grades.surface || 0;
    const centeringGrade = grades.centering || 0;

    // Extract card detection info
    const confidence = cardObject?.prob || 0;

    // Process category information
    const category = tags.Category?.[0]?.name || 'Trading Card';
    const subcategory = tags.Subcategory?.[0]?.name;
    const isDamaged = tags.Damaged?.[0]?.name !== 'OK';
    const hasAutograph = tags.Autograph?.[0]?.name === 'Yes';
    const sideInfo = tags.Side?.[0];
    const isfront = sideInfo?.name === 'Front';

    // Extract card identification info if available
    let cardName: string | undefined;
    let setName: string | undefined;
    let rarity: string | undefined;
    let cardNumber: string | undefined;
    let year: number | undefined;

    if (identification?.best_match) {
      cardName = identification.best_match.name || identification.best_match.full_name;
      setName = identification.best_match.set;
      rarity = identification.best_match.rarity;
      cardNumber = identification.best_match.card_number;
      year = identification.best_match.year;
    }

    // Build comprehensive result object
    const result: XimilarGradingResult = {
      // Actual grading scores from the API
      finalGrade: finalGrade,
      cornerGrade: cornerGrade,
      edgeGrade: edgeGrade,
      surfaceGrade: surfaceGrade,
      centeringGrade: centeringGrade,

      // Detection and identification data
      confidence: confidence,
      category: category,
      subcategory: subcategory,
      isDamaged: isDamaged,
      hasAutograph: hasAutograph,
      isfront: isfront,
      imageUrl: record._full_url_card || record._exact_url_card,

      // Card identification fields
      cardName: cardName,
      setName: setName,
      rarity: rarity,
      cardNumber: cardNumber,
      year: year,
    };

    console.log('✅ Card Grader response processing completed');
    console.log(`🎯 Final Grade: ${result.finalGrade}`);
    console.log(`📐 Corner Grade: ${result.cornerGrade}`);
    console.log(`📏 Edge Grade: ${result.edgeGrade}`);
    console.log(`🌊 Surface Grade: ${result.surfaceGrade}`);
    console.log(`🎯 Centering Grade: ${result.centeringGrade}`);
    console.log(`🔍 Confidence: ${Math.round(result.confidence * 100)}%`);

    // Log card identification if available
    if (cardName) {
      console.log(`🃏 Identified Card: ${cardName}`);
      if (setName) {
        console.log(`📦 Set: ${setName}`);
      }
      if (rarity) {
        console.log(`💎 Rarity: ${rarity}`);
      }
    } else {
      console.log('🃏 Card identification not available');
    }

    return result;
  }

  /**
   * GRADE INTERPRETATION METHOD
   *
   * Converts numeric grades (1-10) to human-readable condition descriptions
   * This helps users understand what each grade means in real-world terms
   *
   * @param grade - Numeric grade from 0-10 (or undefined/null)
   * @returns string - Human-readable condition description
   */
  static interpretGrade(grade: number | undefined | null): string {
    // Handle edge cases where grade might be undefined or null
    if (grade === undefined || grade === null) {
      return 'Not Graded';
    }

    // Clamp grade to valid range (0-10)
    const normalizedGrade = Math.max(0, Math.min(10, grade));

    // Convert to condition descriptions based on industry standards
    if (normalizedGrade >= 10) { return 'Gem Mint'; }
    if (normalizedGrade >= 9.5) { return 'Gem Mint'; }
    if (normalizedGrade >= 9.0) { return 'Mint'; }
    if (normalizedGrade >= 8.5) { return 'Near Mint+'; }
    if (normalizedGrade >= 8.0) { return 'Near Mint/Mint'; }
    if (normalizedGrade >= 7.5) { return 'Near Mint'; }
    if (normalizedGrade >= 7.0) { return 'Excellent'; }
    if (normalizedGrade >= 6.5) { return 'Very Good+'; }
    if (normalizedGrade >= 6.0) { return 'Very Good'; }
    if (normalizedGrade >= 5.5) { return 'Good+'; }
    if (normalizedGrade >= 5.0) { return 'Good'; }
    if (normalizedGrade >= 4.0) { return 'Fair'; }
    if (normalizedGrade >= 3.0) { return 'Poor'; }
    if (normalizedGrade >= 2.0) { return 'Damaged'; }
    if (normalizedGrade >= 1.0) { return 'Authentic (Damaged)'; }

    // For grades below 1 or exactly 0
    return 'Damaged';
  }

  /**
   * API STATUS CHECK METHOD
   *
   * Verifies that the Ximilar API is accessible and the token is valid
   * Useful for troubleshooting connectivity issues
   *
   * @returns Promise<boolean> - True if API is accessible
   */
  static async checkApiStatus(): Promise<boolean> {
    try {
      console.log('🔄 Checking Ximilar API status...');

      // Send a minimal request to check connectivity
      const response = await axios.post(
        `${this.BASE_URL}${this.GRADE_ENDPOINT}`,
        { records: [] }, // Empty request to test authentication
        {
          headers: {
            'Authorization': `Token ${this.API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000, // Short timeout for status check
        }
      );

      const isOk = response.status === 200;
      console.log(isOk ? '✅ API is accessible' : '❌ API is not responding correctly');
      return isOk;

    } catch (error) {
      console.log('❌ API is not responding correctly');
      return false;
    }
  }
}

/**
 * =================================================================
 * MOCK DATA SERVICE (for development/testing)
 * =================================================================
 *
 * Provides mock card data for development and testing purposes
 * Useful when API quota is limited or during offline development
 */
export class MockCardDataService {
  // Mock card database for development
  private static mockCards: Card[] = [
    {
      id: '1',
      name: 'Pikachu',
      set: 'Base Set',
      rarity: 'Common',
      condition: 'Near Mint',
      price: 5.00,
      imageUrl: 'https://images.pokemontcg.io/base1/25.png',
      description: 'Electric mouse Pokémon',
      artist: 'Atsuko Nishida',
      year: 1998,
      type: 'Pokémon',
      types: ['Electric'],
      hp: '60',
    },
    {
      id: '2',
      name: 'Charizard',
      set: 'Base Set',
      rarity: 'Rare Holo',
      condition: 'Near Mint',
      price: 350.00,
      imageUrl: 'https://images.pokemontcg.io/base1/4.png',
      description: 'Fire-type dragon Pokémon',
      artist: 'Mitsuhiro Arita',
      year: 1998,
      type: 'Pokémon',
      types: ['Fire'],
      hp: '120',
    },
    {
      id: '3',
      name: 'Blastoise',
      set: 'Base Set',
      rarity: 'Rare Holo',
      condition: 'Near Mint',
      price: 120.00,
      imageUrl: 'https://images.pokemontcg.io/base1/2.png',
      description: 'Water-type turtle Pokémon',
      artist: 'Ken Sugimori',
      year: 1998,
      type: 'Pokémon',
      types: ['Water'],
      hp: '100',
    },
  ];

  /**
   * Search for cards by name (mock implementation)
   */
  static async searchCard(query: string): Promise<Card[]> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return this.mockCards.filter(card =>
      card.name.toLowerCase().includes(query.toLowerCase())
    );
  }

  /**
   * Get card by ID (mock implementation)
   */
  static async getCardById(id: string): Promise<Card | null> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return this.mockCards.find(card => card.id === id) || null;
  }

  /**
   * Get random card (mock implementation)
   */
  static async getRandomCard(): Promise<Card> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const randomIndex = Math.floor(Math.random() * this.mockCards.length);
    return this.mockCards[randomIndex];
  }
}
