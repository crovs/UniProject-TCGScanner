/**
 * =================================================================
 * ASYNC STORAGE MOCK
 * =================================================================
 * 
 * Mock implementation of AsyncStorage for testing
 */

const AsyncStorage = {
  storage: new Map(),

  async setItem(key, value) {
    console.log(`💾 [MOCK] AsyncStorage.setItem(${key})`);
    this.storage.set(key, value);
    return Promise.resolve();
  },

  async getItem(key) {
    console.log(`💾 [MOCK] AsyncStorage.getItem(${key})`);
    return Promise.resolve(this.storage.get(key) || null);
  },

  async removeItem(key) {
    console.log(`💾 [MOCK] AsyncStorage.removeItem(${key})`);
    this.storage.delete(key);
    return Promise.resolve();
  },

  async clear() {
    console.log('💾 [MOCK] AsyncStorage.clear()');
    this.storage.clear();
    return Promise.resolve();
  },

  async getAllKeys() {
    console.log('💾 [MOCK] AsyncStorage.getAllKeys()');
    return Promise.resolve(Array.from(this.storage.keys()));
  },

  async multiGet(keys) {
    console.log(`💾 [MOCK] AsyncStorage.multiGet(${keys})`);
    return Promise.resolve(
      keys.map(key => [key, this.storage.get(key) || null])
    );
  },

  async multiSet(keyValuePairs) {
    console.log(`💾 [MOCK] AsyncStorage.multiSet(${keyValuePairs.length} items)`);
    keyValuePairs.forEach(([key, value]) => {
      this.storage.set(key, value);
    });
    return Promise.resolve();
  },

  async multiRemove(keys) {
    console.log(`💾 [MOCK] AsyncStorage.multiRemove(${keys})`);
    keys.forEach(key => {
      this.storage.delete(key);
    });
    return Promise.resolve();
  }
};

module.exports = AsyncStorage;
