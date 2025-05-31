import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useCollectionViewModel } from '../../../viewmodels';
import { RootStackParamList, CollectionCard } from '../../../types';
import { ThemeService, Theme } from '../../../services/theme/ThemeService';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const CollectionScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const collectionViewModel = useCollectionViewModel();
  const [theme, setTheme] = useState<Theme>(ThemeService.getCurrentTheme());

  useEffect(() => {
    const unsubscribe = ThemeService.addThemeListener(setTheme);
    return unsubscribe;
  }, []);

  const styles = createStyles(theme);

  const handleCardPress = (card: CollectionCard) => {
    navigation.navigate('CardDetails', { card });
  };

  const handleRemoveCard = (cardId: string) => {
    Alert.alert(
      'Remove Card',
      'Are you sure you want to remove this card from your collection?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => collectionViewModel.removeCardFromCollection(cardId),
        },
      ]
    );
  };

  const renderCard = ({ item }: { item: CollectionCard }) => (
    <TouchableOpacity
      style={styles.cardItem}
      onPress={() => handleCardPress(item)}
    >
      <View style={styles.cardInfo}>
        <Text style={styles.cardName}>{item.name}</Text>
        <Text style={styles.cardDetails}>{item.set} • {item.rarity}</Text>
        <Text style={styles.cardPrice}>{item.price}</Text>
        <Text style={styles.cardQuantity}>Quantity: {item.quantity}</Text>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveCard(item.id)}
      >
        <Text style={styles.removeButtonText}>✕</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderEmptyCollection = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No cards in your collection</Text>
      <Text style={styles.emptySubtext}>
        Start scanning cards to build your collection!
      </Text>
    </View>
  );

  const renderCollectionStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{collectionViewModel.getTotalCards()}</Text>
        <Text style={styles.statLabel}>Total Cards</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{collectionViewModel.getCards().length}</Text>
        <Text style={styles.statLabel}>Unique Cards</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{collectionViewModel.getTotalValue()}</Text>
        <Text style={styles.statLabel}>Total Value</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Collection</Text>
      </View>

      {collectionViewModel.getCards().length > 0 && renderCollectionStats()}

      <FlatList
        data={collectionViewModel.getCards()}
        renderItem={renderCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyCollection}
      />
    </View>
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
    backgroundColor: '#2196F3',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    margin: 15,
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  listContainer: {
    padding: 15,
  },
  cardItem: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  cardDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 5,
  },
  cardQuantity: {
    fontSize: 12,
    color: '#999',
  },
  removeButton: {
    backgroundColor: '#f44336',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

export default CollectionScreen;

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    paddingTop: 10,
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
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: theme.surface,
    margin: 15,
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.primary,
  },
  statLabel: {
    fontSize: 12,
    color: theme.textSecondary,
    marginTop: 5,
  },
  listContainer: {
    padding: 15,
  },
  cardItem: {
    backgroundColor: theme.card,
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 5,
  },
  cardDetails: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 5,
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.success,
    marginBottom: 5,
  },
  cardQuantity: {
    fontSize: 12,
    color: theme.textSecondary,
  },
  removeButton: {
    backgroundColor: theme.error,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.textSecondary,
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
  },
});
