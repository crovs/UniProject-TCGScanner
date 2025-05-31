import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CollectionCard } from '../../types';

interface CollectionState {
  cards: CollectionCard[];
  isLoading: boolean;
  error?: string;
}

const initialState: CollectionState = {
  cards: [],
  isLoading: false
};

export const collectionSlice = createSlice({
  name: 'collection',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setCards: (state, action: PayloadAction<CollectionCard[]>) => {
      state.cards = action.payload;
      state.isLoading = false;
    },
    addCard: (state, action: PayloadAction<CollectionCard>) => {
      const existingCard = state.cards.find(card => card.id === action.payload.id);
      if (existingCard) {
        existingCard.quantity += action.payload.quantity;
      } else {
        state.cards.push(action.payload);
      }
    },
    removeCard: (state, action: PayloadAction<string>) => {
      state.cards = state.cards.filter(card => card.id !== action.payload);
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearError: (state) => {
      state.error = undefined;
    }
  }
});

export const { setLoading, setCards, addCard, removeCard, setError, clearError } = collectionSlice.actions;
export default collectionSlice.reducer;
