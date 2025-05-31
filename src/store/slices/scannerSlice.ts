import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Card, ScanResult, XimilarGradingResult } from '../../types';

interface ScannerState {
  scanResult: ScanResult;
  isScanning: boolean;
  lastScannedCard: Card | null;
}

const initialState: ScannerState = {
  scanResult: {
    card: null,
    confidence: 0,
    isLoading: false,
  },
  isScanning: false,
  lastScannedCard: null,
};

export const scannerSlice = createSlice({
  name: 'scanner',
  initialState,
  reducers: {
    startScan: (state) => {
      state.isScanning = true;
      state.scanResult.isLoading = true;
      state.scanResult.error = undefined;
    },
    completeScan: (state, action: PayloadAction<{ card: Card; confidence: number; gradingResult?: XimilarGradingResult }>) => {
      state.isScanning = false;
      state.scanResult.isLoading = false;
      state.scanResult.card = action.payload.card;
      state.scanResult.confidence = action.payload.confidence;
      state.scanResult.gradingResult = action.payload.gradingResult;
      state.lastScannedCard = action.payload.card;
    },
    scanError: (state, action: PayloadAction<string>) => {
      state.isScanning = false;
      state.scanResult.isLoading = false;
      state.scanResult.error = action.payload;
    },
    resetScan: (state) => {
      state.scanResult = initialState.scanResult;
      state.isScanning = false;
    },
  },
});

export const { startScan, completeScan, scanError, resetScan } = scannerSlice.actions;
export default scannerSlice.reducer;
