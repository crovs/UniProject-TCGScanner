import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { startScan, completeScan, scanError, resetScan } from '../store/slices/scannerSlice';
import { addCard } from '../store/slices/collectionSlice';
import { CameraService } from '../services';
import { Card, CollectionCard } from '../types';

/**
 * ScannerViewModel
 *
 * Business logic layer for the card scanning functionality.
 * Handles all scanner-related operations including:
 * - Camera integration
 * - Ximilar API communication
 * - State management for scanning process
 * - Error handling and user feedback
 *
 * This ViewModel follows MVVM architecture by separating
 * business logic from UI components and data access.
 */
export class ScannerViewModel {
  private dispatch: any;
  private scanResult: any;
  private isScanning: boolean;

  constructor(dispatch: any, scanResult: any, isScanning: boolean) {
    this.dispatch = dispatch;
    this.scanResult = scanResult;
    this.isScanning = isScanning;
  }

  /**
   * Initiates card scanning using device camera
   *
   * Process:
   * 1. Opens device camera
   * 2. Captures image
   * 3. Processes through Ximilar API
   * 4. Updates Redux state with results
   *
   * Includes comprehensive error handling for:
   * - Camera access failures
   * - Image capture cancellation
   * - API processing errors
   * - Network connectivity issues
   */
  async scanWithCamera(): Promise<void> {
    try {
      console.log('Starting camera scan...');
      this.dispatch(startScan());

      const imageUri = await CameraService.openCamera();
      if (!imageUri) {
        this.dispatch(scanError('No image captured. Please try again.'));
        return;
      }

      console.log('Image captured, processing with Ximilar API...');
      const result = await CameraService.recognizeCard(imageUri);

      // Check confidence level and provide user feedback
      if (result.confidence < 0.3) {
        console.warn('Low confidence recognition:', result.confidence);
        this.dispatch(scanError(
          'Card recognition confidence is low. Please ensure good lighting and card visibility.'
        ));
        return;
      }

      console.log('Card recognition successful:', result.card.name);
      this.dispatch(completeScan(result));
    } catch (error) {
      console.error('Camera scan failed:', error);
      
      // Provide specific error messages based on error type
      let errorMessage = 'Failed to scan card. ';
      if (error instanceof Error) {
        if (error.message.includes('network')) {
          errorMessage += 'Please check your internet connection.';
        } else if (error.message.includes('timeout')) {
          errorMessage += 'Request timed out. Please try again.';
        } else if (error.message.includes('API')) {
          errorMessage += 'Card recognition service unavailable.';
        } else {
          errorMessage += error.message;
        }
      } else {
        errorMessage += 'Please try again.';
      }
      
      this.dispatch(scanError(errorMessage));
    }
  }

  /**
   * Initiates card scanning from photo library
   *
   * Similar to camera scanning but uses existing photos.
   * Useful for processing previously captured card images.
   */
  async scanFromLibrary(): Promise<void> {
    try {
      console.log('Starting library scan...');
      this.dispatch(startScan());

      const imageUri = await CameraService.openImageLibrary();
      if (!imageUri) {
        this.dispatch(scanError('No image selected. Please choose an image.'));
        return;
      }

      console.log('Image selected, processing with Ximilar API...');
      const result = await CameraService.recognizeCard(imageUri);

      // Check confidence level
      if (result.confidence < 0.3) {
        console.warn('Low confidence recognition:', result.confidence);
        this.dispatch(scanError(
          'Card recognition confidence is low. Please try a clearer image.'
        ));
        return;
      }

      console.log('Card recognition successful:', result.card.name);
      this.dispatch(completeScan(result));
    } catch (error) {
      console.error('Library scan failed:', error);
      
      let errorMessage = 'Failed to process image. ';
      if (error instanceof Error) {
        if (error.message.includes('network')) {
          errorMessage += 'Please check your internet connection.';
        } else if (error.message.includes('timeout')) {
          errorMessage += 'Request timed out. Please try again.';
        } else if (error.message.includes('API')) {
          errorMessage += 'Card recognition service unavailable.';
        } else {
          errorMessage += error.message;
        }
      } else {
        errorMessage += 'Please try again.';
      }
      
      this.dispatch(scanError(errorMessage));
    }
  }

  /**
   * Adds a recognized card to the user's collection
   *
   * Creates a CollectionCard with:
   * - Current timestamp
   * - Initial quantity of 1
   * - All card metadata from API
   *
   * @param card - The card to add to collection
   */
  addToCollection(card: Card): void {
    try {
      console.log('Adding card to collection:', card.name);
      
      const collectionCard: CollectionCard = {
        ...card,
        quantity: 1,
        dateAdded: new Date().toISOString(),
      };
      
      this.dispatch(addCard(collectionCard));
      console.log('Card successfully added to collection');
    } catch (error) {
      console.error('Failed to add card to collection:', error);
      this.dispatch(scanError('Failed to add card to collection. Please try again.'));
    }
  }

  /**
   * Resets the current scan result
   * Clears any previous scan data and errors
   */
  resetScanResult(): void {
    console.log('Resetting scan result');
    this.dispatch(resetScan());
  }

  /**
   * Gets the current scan result
   * @returns Current scan result or null
   */
  getScanResult() {
    return this.scanResult;
  }

  /**
   * Gets the current scanning status
   * @returns True if currently scanning, false otherwise
   */
  getIsScanning(): boolean {
    return this.isScanning;
  }

  /**
   * Validates if a scan result has sufficient confidence
   * Helper method for quality control
   *
   * @param confidence - Confidence score from 0-1
   * @returns True if confidence meets minimum threshold
   */
  isValidConfidence(confidence: number): boolean {
    const MIN_CONFIDENCE = 0.3; // 30% minimum confidence
    return confidence >= MIN_CONFIDENCE;
  }

  /**
   * Gets user-friendly confidence level description
   * Converts numeric confidence to readable text
   *
   * @param confidence - Confidence score from 0-1
   * @returns Human-readable confidence description
   */
  getConfidenceDescription(confidence: number): string {
    if (confidence >= 0.9) return 'Very High';
    if (confidence >= 0.7) return 'High';
    if (confidence >= 0.5) return 'Medium';
    if (confidence >= 0.3) return 'Low';
    return 'Very Low';
  }
}

/**
 * Hook for using ScannerViewModel in React components
 * Connects Redux state and dispatch to ViewModel
 *
 * @returns Configured ScannerViewModel instance
 */
export const useScannerViewModel = () => {
  const dispatch = useDispatch();
  const { scanResult, isScanning } = useSelector((state: RootState) => state.scanner);

  return new ScannerViewModel(dispatch, scanResult, isScanning);
};
