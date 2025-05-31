import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../../types';
import { useCollectionViewModel } from '../../../viewmodels';
import { ThemeService, Theme } from '../../../services/theme/ThemeService';

type CardDetailsRouteProp = RouteProp<RootStackParamList, 'CardDetails'>;

const CardDetailsScreen: React.FC = () => {
  const route = useRoute<CardDetailsRouteProp>();
  const navigation = useNavigation();
  const collectionViewModel = useCollectionViewModel();
  const { card } = route.params;

  // Theme state management
  const [theme, setTheme] = useState<Theme>(ThemeService.getCurrentTheme());

  useEffect(() => {
    const unsubscribe = ThemeService.addThemeListener((newTheme: Theme) => {
      setTheme(newTheme);
    });

    return unsubscribe;
  }, []);

  // Create dynamic styles
  const styles = createStyles(theme);

  const handleAddToCollection = async () => {
    try {
      await collectionViewModel.addCardToCollection(card);
      Alert.alert('Success', 'Card added to collection!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to add card to collection. Please try again.');
    }
  };

  const renderDetailRow = (label: string, value: string | number | undefined) => {
    if (!value) { return null; }
    
    return (
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>{label}:</Text>
        <Text style={styles.detailValue}>{String(value)}</Text>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardName}>{card.name}</Text>
        <Text style={styles.cardSet}>{card.set}</Text>
      </View>

      <View style={styles.imageContainer}>
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imagePlaceholderText}>🎴</Text>
          <Text style={styles.imagePlaceholderLabel}>Card Image</Text>
        </View>
      </View>

      <View style={styles.detailsContainer}>
        <Text style={styles.sectionTitle}>Card Details</Text>
        
        {renderDetailRow('Rarity', card.rarity)}
        {renderDetailRow('Price', card.price)}
        {renderDetailRow('HP', card.hp)}
        
        {card.types && card.types.length > 0 && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Types:</Text>
            <View style={styles.typesContainer}>
              {card.types.map((type, index) => (
                <View style={styles.typeTag} key={index}>
                  <Text style={styles.typeText}>{type}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddToCollection}
        >
          <Text style={styles.addButtonText}>Add to Collection</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  cardHeader: {
    backgroundColor: theme.primary,
    padding: 20,
    alignItems: 'center',
  },
  cardName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.surface,
    textAlign: 'center',
  },
  cardSet: {
    fontSize: 16,
    color: theme.surface,
    opacity: 0.9,
    marginTop: 5,
  },
  imageContainer: {
    backgroundColor: theme.card,
    margin: 20,
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    shadowColor: theme.text,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  imagePlaceholder: {
    width: 200,
    height: 280,
    backgroundColor: theme.surface,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.border,
    borderStyle: 'dashed',
  },
  imagePlaceholderText: {
    fontSize: 60,
    marginBottom: 10,
  },
  imagePlaceholderLabel: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  detailsContainer: {
    backgroundColor: theme.card,
    margin: 20,
    marginTop: 0,
    borderRadius: 15,
    padding: 20,
    shadowColor: theme.text,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textSecondary,
    width: 80,
  },
  detailValue: {
    fontSize: 16,
    color: theme.text,
    flex: 1,
  },
  typesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
  },
  typeTag: {
    backgroundColor: theme.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 4,
  },
  typeText: {
    color: theme.surface,
    fontSize: 12,
    fontWeight: '600',
  },
  actionContainer: {
    padding: 20,
  },
  addButton: {
    backgroundColor: theme.success,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  addButtonText: {
    color: theme.surface,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CardDetailsScreen;
