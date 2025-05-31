import { Card, CollectionCard } from '../types';

/**
 * CardModel
 *
 * Model class representing a trading card with all relevant information
 * including Ximilar API integration data for cards processed through
 * the card grading service.
 */
export class CardModel implements Card {
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
  apiData?: {
    ximilarId?: string;
    confidence?: number;
    grade?: number;
    gradingService?: string;
  };

  constructor(data: Card) {
    this.id = data.id;
    this.name = data.name;
    this.set = data.set;
    this.rarity = data.rarity;
    this.condition = data.condition;
    this.price = data.price;
    this.imageUrl = data.imageUrl;
    this.description = data.description;
    this.artist = data.artist;
    this.year = data.year;
    this.type = data.type;
    this.types = data.types;
    this.hp = data.hp;
    this.apiData = data.apiData;
  }

  /**
   * Creates a mock card for testing and fallback scenarios
   * Used when API calls fail or for demonstration purposes
   */
  static createMockCard(): Card {
    return {
      id: `mock_${Date.now()}`,
      name: 'Pikachu',
      set: 'Base Set',
      rarity: 'Common',
      condition: 'Near Mint',
      price: 5.00,
      imageUrl: 'https://images.pokemontcg.io/base1/25.png',
      description: 'A mouse Pokémon with electricity-storing cheek pouches.',
      artist: 'Atsuko Nishida',
      year: 1996,
      type: 'Pokémon',
      types: ['Electric'],
      hp: '60',
    };
  }

  /**
   * Creates a card from Ximilar API response data
   * Helper method to convert API responses to Card objects
   */
  static fromXimilarResponse(apiRecord: any, imageUri: string): Card {
    return {
      id: `ximilar_${Date.now()}`,
      name: apiRecord._object_title || 'Unknown Card',
      set: apiRecord._set_name || 'Unknown Set',
      rarity: apiRecord._rarity || 'Common',
      condition: this.mapGradeToCondition(apiRecord._grade),
      price: apiRecord._market_price || 0,
      imageUrl: imageUri,
      description: apiRecord._description || 'Trading card recognized by Ximilar API',
      artist: apiRecord._artist || 'Unknown',
      year: apiRecord._release_year || new Date().getFullYear(),
      type: apiRecord._card_type || 'Trading Card',
      apiData: {
        ximilarId: apiRecord._ximilar_id,
        confidence: apiRecord._confidence,
        grade: apiRecord._grade,
        gradingService: apiRecord._grading_service,
      },
    };
  }

  /**
   * Maps numeric grade to condition string
   * Private helper method for API response processing
   */
  private static mapGradeToCondition(grade?: number): string {
    if (!grade) return 'Unknown';

    if (grade >= 10) return 'Gem Mint';
    if (grade >= 9) return 'Mint';
    if (grade >= 8) return 'Near Mint/Mint';
    if (grade >= 7) return 'Near Mint';
    if (grade >= 6) return 'Excellent';
    if (grade >= 5) return 'Very Good';
    if (grade >= 4) return 'Good';
    if (grade >= 3) return 'Fair';
    if (grade >= 2) return 'Poor';
    return 'Damaged';
  }
}

export class CollectionModel {
  cards: CollectionCard[];

  constructor(cards: CollectionCard[] = []) {
    this.cards = cards;
  }

  addCard(card: Card): void {
    const existingCard = this.cards.find(c => c.id === card.id);
    if (existingCard) {
      existingCard.quantity += 1;
    } else {
      this.cards.push({
        ...card,
        quantity: 1,
        dateAdded: new Date().toISOString()
      });
    }
  }

  removeCard(cardId: string): void {
    this.cards = this.cards.filter(card => card.id !== cardId);
  }

  getCardCount(): number {
    return this.cards.reduce((total, card) => total + card.quantity, 0);
  }
}
