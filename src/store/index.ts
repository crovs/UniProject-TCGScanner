import { configureStore } from '@reduxjs/toolkit';
import scannerReducer from './slices/scannerSlice';
import collectionReducer from './slices/collectionSlice';
import settingsReducer from './slices/settingsSlice';

export const store = configureStore({
  reducer: {
    scanner: scannerReducer,
    collection: collectionReducer,
    settings: settingsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
