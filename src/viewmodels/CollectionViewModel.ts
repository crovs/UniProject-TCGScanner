import {useDispatch, useSelector} from 'react-redux';
import {useEffect, useMemo, useRef} from 'react';
import {RootState} from '../store';
import {
  setLoading,
  setCards,
  addCard,
  removeCard,
} from '../store/slices/collectionSlice';
import {StorageService} from '../services';
import {CollectionCard, Card} from '../types';

/**
 * CollectionViewModel
 *
 * Business logic layer for managing the user's card collection.
 * Handles operations including:
 * - Loading and saving collection data
 * - Adding/removing cards from collection
 * - Collection statistics and analytics
 * - Local storage persistence
 *
 * This ViewModel integrates with the StorageService for persistence
 * and Redux for state management following MVVM architecture.
 */
export class CollectionViewModel {
  private dispatch: any;
  private cards: CollectionCard[];
  private isLoading: boolean;

  constructor(dispatch: any, cards: CollectionCard[], isLoading: boolean) {
    this.dispatch = dispatch;
    this.cards = cards;
    this.isLoading = isLoading;
  }

  /**
   * Loads the collection from persistent storage
   * Updates Redux state with stored collection data
   */
  async loadCollection(): Promise<void> {
    try {
      console.log('Loading collection from storage...');
      this.dispatch(setLoading(true));
      const savedCards = await StorageService.loadCollection();
      this.dispatch(setCards(savedCards));
      console.log(`Loaded ${savedCards.length} cards from collection`);
    } catch (error) {
      console.error('Failed to load collection:', error);
    } finally {
      this.dispatch(setLoading(false));
    }
  }

  /**
   * Saves the current collection to persistent storage
   * Ensures data persistence across app sessions
   */
  async saveCollection(): Promise<void> {
    try {
      console.log('Saving collection to storage...');
      console.log('Current cards to save:', this.cards.length);
      await StorageService.saveCollection(this.cards);
      console.log('Collection saved successfully');
    } catch (error) {
      console.error('Failed to save collection:', error);
    }
  }

  /**
   * Adds a new card to the collection
   * If card already exists, increments quantity
   *
   * @param card - The card to add to collection
   */
  async addCardToCollection(card: Card): Promise<void> {
    try {
      console.log('Adding card to collection:', card.name);

      const collectionCard: CollectionCard = {
        ...card,
        quantity: 1,
        dateAdded: new Date().toISOString(),
      };

      // Add to Redux state
      this.dispatch(addCard(collectionCard));
      console.log('Card added to Redux state');

    } catch (error) {
      console.error('Failed to add card to collection:', error);
      throw error;
    }
  }

  /**
   * Removes a card from the collection
   *
   * @param cardId - The ID of the card to remove
   */
  removeCardFromCollection(cardId: string): void {
    try {
      console.log('Removing card from collection:', cardId);
      this.dispatch(removeCard(cardId));

      // Auto-save after removing
      this.saveCollection();
    } catch (error) {
      console.error('Failed to remove card from collection:', error);
    }
  }

  /**
   * Gets all cards in the collection
   * @returns Array of collection cards
   */
  getCards(): CollectionCard[] {
    return this.cards;
  }

  /**
   * Calculates total number of cards in collection
   * Takes into account individual card quantities
   *
   * @returns Total card count
   */
  getTotalCards(): number {
    return this.cards.reduce((total, card) => total + card.quantity, 0);
  }

  /**
   * Calculates total estimated value of collection
   * Uses current market prices from card data
   *
   * @returns Formatted currency string (e.g., "$123.45")
   */
  getTotalValue(): string {
    const total = this.cards.reduce((sum, card) => {
      // Handle both old string format and new numeric format for legacy data compatibility
      let price = 0;
      const cardPrice = card.price as string | number;
      if (typeof cardPrice === 'string') {
        price = parseFloat(cardPrice.replace('$', '')) || 0;
      } else if (typeof cardPrice === 'number') {
        price = cardPrice;
      }
      return sum + price * card.quantity;
    }, 0);
    return `$${total.toFixed(2)}`;
  }

  /**
   * Gets collection statistics for analytics
   * @returns Object with various collection metrics
   */
  getCollectionStats() {
    const totalCards = this.getTotalCards();
    const uniqueCards = this.cards.length;
    const totalValue = this.getTotalValue();

    // Calculate rarity distribution
    const rarityCount = this.cards.reduce((acc, card) => {
      acc[card.rarity] = (acc[card.rarity] || 0) + card.quantity;
      return acc;
    }, {} as Record<string, number>);

    // Calculate condition distribution
    const conditionCount = this.cards.reduce((acc, card) => {
      acc[card.condition] = (acc[card.condition] || 0) + card.quantity;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalCards,
      uniqueCards,
      totalValue,
      rarityDistribution: rarityCount,
      conditionDistribution: conditionCount,
      averageValue:
        totalCards > 0
          ? (parseFloat(totalValue.replace('$', '')) / totalCards).toFixed(2)
          : '0.00',
    };
  }

  /**
   * Searches collection by card name
   * Case-insensitive search
   *
   * @param query - Search query
   * @returns Filtered collection cards
   */
  searchCards(query: string): CollectionCard[] {
    const searchTerm = query.toLowerCase().trim();
    if (!searchTerm) {
      return this.cards;
    }

    return this.cards.filter(
      card =>
        card.name.toLowerCase().includes(searchTerm) ||
        card.set.toLowerCase().includes(searchTerm) ||
        card.type.toLowerCase().includes(searchTerm),
    );
  }

  /**
   * Filters collection by rarity
   *
   * @param rarity - Rarity to filter by
   * @returns Filtered collection cards
   */
  filterByRarity(rarity: string): CollectionCard[] {
    return this.cards.filter(card => card.rarity === rarity);
  }

  /**
   * Filters collection by condition
   *
   * @param condition - Condition to filter by
   * @returns Filtered collection cards
   */
  filterByCondition(condition: string): CollectionCard[] {
    return this.cards.filter(card => card.condition === condition);
  }

  /**
   * Gets current loading state
   * @returns True if collection is loading, false otherwise
   */
  isLoadingCollection(): boolean {
    return this.isLoading;
  }
}

/**
 * Hook for using CollectionViewModel in React components
 * Automatically loads collection on mount and provides ViewModel instance
 *
 * @returns Configured CollectionViewModel instance
 */
export const useCollectionViewModel = () => {
  const dispatch = useDispatch();
  const {cards, isLoading} = useSelector(
    (state: RootState) => state.collection,
  );
  const hasLoadedRef = useRef(false);
  const prevCardsRef = useRef<CollectionCard[]>([]);

  const viewModel = useMemo(
    () => new CollectionViewModel(dispatch, cards, isLoading),
    [dispatch, cards, isLoading],
  );

  // Load collection once on mount
  useEffect(() => {
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      viewModel.loadCollection();
    }
  }, [viewModel]);

  // Auto-save when cards change (but not on initial load)
  useEffect(() => {
    if (hasLoadedRef.current) {
      // Check if cards actually changed by comparing arrays
      const cardsChanged = JSON.stringify(cards) !== JSON.stringify(prevCardsRef.current);

      if (cardsChanged) {
        console.log('Cards changed, auto-saving collection...');
        console.log('Previous cards:', prevCardsRef.current.length, 'New cards:', cards.length);
        prevCardsRef.current = [...cards]; // Update reference

        StorageService.saveCollection(cards).then(() => {
          console.log('Collection auto-saved successfully with', cards.length, 'cards');
        }).catch((error) => {
          console.error('Failed to auto-save collection:', error);
        });
      }
    }
  }, [cards]);

  return viewModel;
};
