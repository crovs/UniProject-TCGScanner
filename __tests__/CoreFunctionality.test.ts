// Basic functionality tests for TCG Card Scanner
import { CardModel, CollectionModel } from '../src/models/Card';

describe('TCG Card Scanner Core Functionality', () => {
  describe('CardModel', () => {
    it('should create a mock card with correct properties', () => {
      const mockCard = CardModel.createMockCard();
      
      expect(mockCard).toHaveProperty('id');
      expect(mockCard).toHaveProperty('name');
      expect(mockCard).toHaveProperty('set');
      expect(mockCard).toHaveProperty('rarity');
      expect(mockCard).toHaveProperty('price');
      expect(mockCard).toHaveProperty('imageUrl');
      expect(mockCard.name).toBe('Pikachu');
    });
  });

  describe('CollectionModel', () => {
    it('should add card to collection', () => {
      const collection = new CollectionModel();
      const mockCard = CardModel.createMockCard();
      
      collection.addCard(mockCard);
      
      expect(collection.getCardCount()).toBe(1);
      expect(collection.cards).toHaveLength(1);
      expect(collection.cards[0].quantity).toBe(1);
    });

    it('should increment quantity for existing card', () => {
      const collection = new CollectionModel();
      const mockCard = CardModel.createMockCard();
      
      collection.addCard(mockCard);
      collection.addCard(mockCard); // Add same card again
      
      expect(collection.getCardCount()).toBe(2);
      expect(collection.cards).toHaveLength(1); // Still one unique card
      expect(collection.cards[0].quantity).toBe(2);
    });

    it('should remove card from collection', () => {
      const collection = new CollectionModel();
      const mockCard = CardModel.createMockCard();
      
      collection.addCard(mockCard);
      collection.removeCard(mockCard.id);
      
      expect(collection.getCardCount()).toBe(0);
      expect(collection.cards).toHaveLength(0);
    });
  });
});
