// Core type definitions for the TCG Card Scanner app

export interface Card {
  id: string;
  name: string;
  set: string;
  rarity: string;
  condition: string;
  price: number;
  imageUrl: string;
  description: string;
  artist: string;
  year: number;
  type: string;
  types?: string[];
  hp?: string;
  // API metadata for cards recognized by Ximilar
  apiData?: {
    ximilarId?: string;
    confidence?: number;
    grade?: number;
    gradingService?: string;
  };
}

export interface CollectionCard extends Card {
  quantity: number;
  dateAdded: string;
}

export interface ScanResult {
  card: Card | null;
  confidence: number;
  isLoading: boolean;
  error?: string;
  // Adding Ximilar-specific grading data
  gradingResult?: XimilarGradingResult;
}

export interface UserSettings {
  darkMode: boolean;
  notifications: boolean;
  offlineMode: boolean;
}

export type RootStackParamList = {
  Main: undefined;
  Scanner: undefined;
  Collection: undefined;
  CardDetails: { card: Card };
  Settings: undefined;
};

// =====================================================
// XIMILAR API TYPE DEFINITIONS
// =====================================================

/**
 * Main response structure from Ximilar Card Grader API
 * This represents the complete response when grading a card
 */
export interface XimilarApiResponse {
  records: XimilarRecord[];
  status: XimilarStatus;
  statistics: XimilarStatistics;
}

/**
 * Individual record for each processed image
 * Contains all grading information for a single card
 */
export interface XimilarRecord {
  _url: string;                    // Original image URL
  _status: XimilarStatus;          // Processing status for this record
  _id: string;                     // Unique identifier for this record
  _width: number;                  // Image width in pixels
  _height: number;                 // Image height in pixels
  _objects: XimilarObject[];       // Detected objects (cards) in the image
  corners: XimilarCorner[];        // Corner condition analysis
  edges: XimilarEdge[];           // Edge condition analysis
  card: XimilarCardAnalysis[];    // Overall card analysis
  versions: XimilarVersions;       // API version information
  grades: XimilarGrades;          // Final grading scores
  _full_url_card?: string;        // Full processed card image URL
  _exact_url_card?: string;       // Exact card crop image URL
}

/**
 * Status information for API requests
 */
export interface XimilarStatus {
  code: number;                   // HTTP status code
  text: string;                   // Status message
  request_id: string;             // Unique request identifier
  proc_id?: string;               // Processing identifier
}

/**
 * Processing statistics
 */
export interface XimilarStatistics {
  'processing time': number;      // Time taken to process in seconds
}

/**
 * Detected object (card) in the image
 */
export interface XimilarObject {
  name: string;                   // Object type (usually "Card")
  id: string;                     // Unique object identifier
  bound_box: [number, number, number, number]; // [x, y, width, height]
  prob: number;                   // Detection confidence (0-1)
  area: number;                   // Detection area
  _tags?: XimilarTags;           // Card categorization tags
  _tags_simple?: string[];       // Simplified tags array
  _identification?: XimilarIdentification; // Card identification data
}

/**
 * Corner analysis for card condition
 * Each corner is analyzed for damage/wear
 */
export interface XimilarCorner {
  name: 'UPPER_LEFT' | 'UPPER_RIGHT' | 'DOWN_RIGHT' | 'DOWN_LEFT';
  bound_box: [number, number, number, number]; // Corner detection area
  point: [number, number];        // Exact corner point coordinates
  grade: number;                  // Corner condition grade (1-10)
}

/**
 * Edge analysis for card condition
 * Each edge is analyzed for damage/wear
 */
export interface XimilarEdge {
  name: 'UPPER' | 'RIGHT' | 'DOWN' | 'LEFT';
  polygon: Array<[number, number]>; // Edge outline polygon
  grade: number;                  // Edge condition grade (1-10)
}

/**
 * Comprehensive card analysis including categorization
 */
export interface XimilarCardAnalysis {
  name: string;                   // Analysis type (usually "CARD")
  polygon: Array<[number, number]>; // Card outline polygon
  bound_box: [number, number, number, number]; // Card bounding box
  _tags: XimilarTags;            // Card categorization tags
  surface: XimilarSurfaceAnalysis; // Surface condition analysis
  centering: XimilarCenteringAnalysis; // Card centering analysis
}

/**
 * Card categorization tags
 * Includes sport type, damage assessment, autograph detection, etc.
 */
export interface XimilarTags {
  Category?: XimilarTag[];        // Sport/game category
  Damaged?: XimilarTag[];         // Damage assessment
  Autograph?: XimilarTag[];       // Autograph detection
  Side?: XimilarTag[];           // Front/back identification
  Subcategory?: XimilarTag[];    // Card subcategory (e.g., Pokemon)
  'Foil/Holo'?: XimilarTag[];    // Foil/holographic detection
  Alphabet?: XimilarTag[];       // Text alphabet detection
}

/**
 * Card identification data from TCG ID API
 */
export interface XimilarIdentification {
  best_match?: XimilarCardMatch;  // Best matching card
  alternatives?: XimilarCardMatch[]; // Alternative matches
  distances?: number[];           // Match confidence distances
}

/**
 * Individual card match from database
 */
export interface XimilarCardMatch {
  year?: number;                  // Card year
  full_name?: string;            // Full card name with set info
  name?: string;                 // Card name
  set?: string;                  // Set name
  color?: string;                // Card color
  type?: string;                 // Card type
  set_code?: string;             // Set abbreviation
  rarity?: string;               // Card rarity
  out_of?: string;               // Total cards in set
  card_number?: string;          // Card number
  series?: string;               // Series name
  subcategory?: string;          // Subcategory
  links?: {                      // External links
    'tcgplayer.com'?: string;
    'ebay.com'?: string;
  };
  pricing?: {                    // Pricing information
    list?: XimilarPriceItem[];
  };
}

/**
 * Price item from marketplace
 */
export interface XimilarPriceItem {
  item_id: string;               // Unique item identifier
  item_link: string;             // Link to listing
  name: string;                  // Listing name
  price: number;                 // Price value
  currency: string;              // Currency code
  country_code: string;          // Country code
  source: string;                // Marketplace source
  date_of_creation: string;      // Listing creation date
  date_of_sale?: string;         // Sale date if sold
  grade_company?: string;        // Grading company
  grade?: string;                // Grade value
  version?: string;              // Card version
  variation?: string;            // Card variation
}

/**
 * Individual tag with confidence score
 */
export interface XimilarTag {
  prob: number;                   // Confidence score (0-1)
  name: string;                   // Tag name/value
  id: string;                     // Unique tag identifier
}

/**
 * Surface condition analysis
 */
export interface XimilarSurfaceAnalysis {
  grade: number;                  // Surface condition grade (1-10)
}

/**
 * Card centering analysis
 * Measures how well-centered the card image is
 */
export interface XimilarCenteringAnalysis {
  'left/right': string;          // Left/right centering ratio (e.g., "66/34")
  'top/bottom': string;          // Top/bottom centering ratio (e.g., "59/41")
  bound_box: [number, number, number, number]; // Centering measurement area
  grade: number;                  // Centering grade (1-10)
}

/**
 * API version information for tracking
 */
export interface XimilarVersions {
  detection: string;              // Detection model version
  points: string;                 // Point detection version
  corners: string;                // Corner analysis version
  edges: string;                  // Edge analysis version
  surface: string;                // Surface analysis version
  centering: string;              // Centering analysis version
  final: string;                  // Combined version string
}

/**
 * Final grading scores for all aspects
 */
export interface XimilarGrades {
  corners: number;                // Average corner grade (1-10)
  edges: number;                  // Average edge grade (1-10)
  surface: number;                // Surface condition grade (1-10)
  centering: number;              // Centering grade (1-10)
  final: number;                  // Overall final grade (1-10)
}

/**
 * Simplified grading result for app usage
 * Extracted from XimilarRecord for easier handling
 */
export interface XimilarGradingResult {
  finalGrade: number;             // Overall grade (1-10)
  cornerGrade: number;            // Corner condition (1-10)
  edgeGrade: number;             // Edge condition (1-10)
  surfaceGrade: number;          // Surface condition (1-10)
  centeringGrade: number;        // Centering quality (1-10)
  confidence: number;            // Detection confidence (0-1)
  category: string;              // Card category (Sport, etc.)
  isDamaged: boolean;            // Whether card shows damage
  hasAutograph: boolean;         // Whether card has autograph
  isfront: boolean;              // Whether showing front side
  imageUrl?: string;             // Processed card image URL

  // Card identification fields from TCG ID API
  cardName?: string;             // Identified card name
  setName?: string;              // Card set name
  rarity?: string;               // Card rarity
  cardNumber?: string;           // Card number
  year?: number;                 // Card year
  subcategory?: string;          // Card subcategory
  isHolo?: boolean;              // Whether card is holographic
  estimatedPrice?: number;       // Estimated market price
  currency?: string;             // Price currency
}
