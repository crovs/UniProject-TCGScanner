import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useScannerViewModel } from '../../../viewmodels';
import { useNavigation } from '@react-navigation/native';
import { ThemeService, Theme } from '../../../services/theme/ThemeService';

const ScannerScreen: React.FC = () => {
  const scannerViewModel = useScannerViewModel();
  const navigation = useNavigation();
  const [theme, setTheme] = useState<Theme>(ThemeService.getCurrentTheme());

  useEffect(() => {
    const unsubscribe = ThemeService.addThemeListener(setTheme);
    return unsubscribe;
  }, []);

  const styles = createStyles(theme);

  const handleCameraScan = async () => {
    try {
      await scannerViewModel.scanWithCamera();
    } catch (error) {
      Alert.alert('Error', 'Failed to open camera');
    }
  };

  const handleLibraryScan = async () => {
    try {
      await scannerViewModel.scanFromLibrary();
    } catch (error) {
      Alert.alert('Error', 'Failed to open image library');
    }
  };

  const handleAddToCollection = () => {
    const scanResult = scannerViewModel.getScanResult();
    if (scanResult.card) {
      scannerViewModel.addToCollection(scanResult.card);
      Alert.alert(
        'Success',
        'Card added to collection!',
        [
          {
            text: 'View Collection',
            onPress: () => {
              // Navigate to Collection tab
              (navigation as any).navigate('Collection');
            },
          },
          {
            text: 'OK',
            style: 'default',
          },
        ],
      );
    }
  };

  const renderScanResult = () => {
    const scanResult = scannerViewModel.getScanResult();

    if (!scanResult.card) {
      return null;
    }

    return (
      <View style={styles.resultContainer}>
        <Text style={styles.resultTitle}>Scan Result</Text>
        
        {/* Essential Card Information */}
        <View style={styles.cardBasicInfo}>
          <Text style={styles.cardName}>{scanResult.card.name}</Text>
          
          {scanResult.gradingResult && (
            <>
              <Text style={styles.cardDetails}>
                Category: {scanResult.gradingResult.category}
              </Text>
              <Text style={styles.cardDetails}>
                Damaged: {scanResult.gradingResult.isDamaged ? 'Yes' : 'No'}
              </Text>
              <Text style={styles.cardDetails}>
                Surface Grade: {scanResult.gradingResult.surfaceGrade.toFixed(1)}/10
              </Text>
            </>
          )}
        </View>
        
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddToCollection}
        >
          <Text style={styles.addButtonText}>Add to Collection</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>TCG Card Scanner</Text>
        <Text style={styles.subtitle}>Scan your Pokémon cards</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.scanButton}
          onPress={handleCameraScan}
          disabled={scannerViewModel.getIsScanning()}
        >
          <Text style={styles.scanButtonText}>
            📷 Scan with Camera
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.scanButton}
          onPress={handleLibraryScan}
          disabled={scannerViewModel.getIsScanning()}
        >
          <Text style={styles.scanButtonText}>
            📁 Choose from Library
          </Text>
        </TouchableOpacity>
      </View>

      {scannerViewModel.getIsScanning() && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Scanning card...</Text>
        </View>
      )}

      {renderScanResult()}

      {scannerViewModel.getScanResult().error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {scannerViewModel.getScanResult().error}
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 10,
  },
  header: {
    padding: 20,
    paddingTop: 30,
    alignItems: 'center',
    backgroundColor: '#2196F3',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
  },
  buttonContainer: {
    padding: 20,
    gap: 15,
  },
  scanButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  scanButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  resultContainer: {
    margin: 20,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  cardName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 10,
  },
  cardDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  confidence: {
    fontSize: 14,
    color: '#4CAF50',
    marginTop: 10,
    marginBottom: 15,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorContainer: {
    margin: 20,
    padding: 15,
    backgroundColor: '#ffebee',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  errorText: {
    color: '#f44336',
    fontSize: 14,
  },
  // Essential styles for simplified scan results
  cardBasicInfo: {
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
});

export default ScannerScreen;

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    padding: 20,
    paddingTop: 30,
    backgroundColor: theme.primary,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    marginTop: 5,
    opacity: 0.9,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  scanButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  scanButton: {
    backgroundColor: theme.primary,
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 10,
    alignItems: 'center',
  },
  scanButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 30,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: theme.textSecondary,
  },
  resultContainer: {
    margin: 20,
    padding: 20,
    backgroundColor: theme.card,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: theme.text,
  },
  cardName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 10,
  },
  cardDetails: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 5,
  },
  addButton: {
    backgroundColor: theme.success,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorContainer: {
    margin: 20,
    padding: 15,
    backgroundColor: theme.error + '20', // Add transparency
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: theme.error,
  },
  errorText: {
    color: theme.error,
    fontSize: 14,
  },
  cardBasicInfo: {
    marginBottom: 15,
  },
});
