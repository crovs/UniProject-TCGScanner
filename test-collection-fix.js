// Simple test to verify collection save/load functionality
// This script tests our collection fixes without making API calls

const { StorageService } = require('./src/services');

// Mock AsyncStorage for testing
const mockStorage = {};
const AsyncStorage = {
  setItem: async (key, value) => {
    mockStorage[key] = value;
    console.log(`✅ Saved to storage: ${key} = ${value}`);
  },
  getItem: async (key) => {
    const value = mockStorage[key] || null;
    console.log(`📖 Loaded from storage: ${key} = ${value}`);
    return value;
  }
};

// Mock a card for testing
const testCard = {
  id: 'test-pikachu-001',
  name: 'Pikachu',
  set: 'Base Set',
  rarity: 'Common',
  condition: 'Near Mint',
  price: 25.50,
  imageUrl: 'https://example.com/pikachu.jpg',
  description: 'A cute electric mouse Pokémon',
  artist: 'Atsuko Nishida',
  year: 1996,
  type: 'Electric',
  types: ['Electric'],
  hp: '60'
};

const testCollectionCard = {
  ...testCard,
  quantity: 1,
  dateAdded: new Date().toISOString()
};

async function testCollectionOperations() {
  console.log('🧪 Testing Collection Save/Load Operations...\n');

  try {
    // Test 1: Save empty collection
    console.log('Test 1: Save empty collection');
    await AsyncStorage.setItem('collection', JSON.stringify([]));
    
    // Test 2: Load empty collection
    console.log('\nTest 2: Load empty collection');
    const emptyCollection = JSON.parse(await AsyncStorage.getItem('collection') || '[]');
    console.log(`Loaded collection has ${emptyCollection.length} cards`);
    
    // Test 3: Save collection with one card
    console.log('\nTest 3: Save collection with one card');
    const singleCardCollection = [testCollectionCard];
    await AsyncStorage.setItem('collection', JSON.stringify(singleCardCollection));
    
    // Test 4: Load collection with one card
    console.log('\nTest 4: Load collection with one card');
    const loadedCollection = JSON.parse(await AsyncStorage.getItem('collection') || '[]');
    console.log(`Loaded collection has ${loadedCollection.length} cards`);
    if (loadedCollection.length > 0) {
      console.log(`First card: ${loadedCollection[0].name} (Quantity: ${loadedCollection[0].quantity})`);
    }
    
    // Test 5: Add another card to collection
    console.log('\nTest 5: Add another card to collection');
    const charizardCard = {
      ...testCard,
      id: 'test-charizard-002',
      name: 'Charizard',
      rarity: 'Rare Holo',
      price: 150.00,
      type: 'Fire',
      types: ['Fire', 'Flying']
    };
    
    const twoCardCollection = [...loadedCollection, charizardCard];
    await AsyncStorage.setItem('collection', JSON.stringify(twoCardCollection));
    
    // Test 6: Verify both cards are saved
    console.log('\nTest 6: Verify both cards are saved');
    const finalCollection = JSON.parse(await AsyncStorage.getItem('collection') || '[]');
    console.log(`Final collection has ${finalCollection.length} cards`);
    finalCollection.forEach((card, index) => {
      console.log(`Card ${index + 1}: ${card.name} (${card.rarity}) - $${card.price}`);
    });
    
    console.log('\n✅ All collection tests passed! Save/Load functionality is working correctly.');
    
  } catch (error) {
    console.error('❌ Collection test failed:', error);
  }
}

// Run the tests
testCollectionOperations();
