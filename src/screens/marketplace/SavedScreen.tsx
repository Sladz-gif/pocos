import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, Radius } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import { PCard, PBadge, PButton } from '../../components/ui';
import { useMarketplaceStore } from '../../store/marketplaceStore';
import { useAuthStore } from '../../store/authStore';
import { StackNavigationProp } from '@react-navigation/stack';
import { MarketplaceTabParamList } from '../../navigation/types';

type SavedScreenProps = {
  navigation: StackNavigationProp<MarketplaceTabParamList, 'Saved'>;
};

export const SavedScreen: React.FC<SavedScreenProps> = ({ navigation }) => {
  const { listings, savedListingIds, toggleSaved, fetchListings, fetchSavedListings } = useMarketplaceStore();
  const { ranch, user } = useAuthStore();

  useEffect(() => {
    if (ranch?.id) {
      fetchListings(ranch.id);
    }
    if (user?.id) {
      fetchSavedListings(user.id);
    }
  }, [ranch?.id, user?.id, fetchListings, fetchSavedListings]);

  const savedListings = listings.filter(l => savedListingIds.includes(l.id));

  const renderSaved = ({ item }: { item: typeof listings[0] }) => (
    <PCard style={styles.savedCard} onPress={() => navigation.navigate('BrowseStack', { screen: 'ProductDetail', params: { id: item.id } } as any)}>
      <View style={styles.savedImage}>
        <Ionicons name="paw" size={32} color={Colors.primaryRust} />
      </View>
      <View style={styles.savedInfo}>
        <Text style={styles.productName}>{item.productName}</Text>
        <Text style={styles.ranchName}>{item.ranch?.name || 'Local Ranch'}</Text>
        <Text style={styles.productPrice}>GHS {item.price.toLocaleString()}</Text>
      </View>
      <TouchableOpacity style={styles.removeButton} onPress={() => {
        if (user?.id) {
          toggleSaved(item.id, user.id);
        }
      }}>
        <Ionicons name="trash-outline" size={20} color={Colors.dangerCrimson} />
      </TouchableOpacity>
    </PCard>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.charcoalInk} />
        </TouchableOpacity>
        <Text style={styles.title}>Saved Items</Text>
      </View>

      <FlatList
        data={savedListings}
        renderItem={renderSaved}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="heart-outline" size={64} color={Colors.softAsh} />
            <Text style={styles.emptyText}>Your wishlist is empty.</Text>
            <PButton 
              title="Explore Marketplace" 
              onPress={() => navigation.navigate('BrowseStack' as any)} 
              style={styles.exploreButton} 
            />
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.paleParchment,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.softAsh,
  },
  backButton: {
    marginRight: Spacing.md,
  },
  title: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: Typography.fontSize['2xl'],
    color: Colors.charcoalInk,
  },
  listContent: {
    padding: Spacing.xl,
  },
  savedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  savedImage: {
    width: 60,
    height: 60,
    borderRadius: Radius.md,
    backgroundColor: Colors.warmSand,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.lg,
  },
  savedInfo: {
    flex: 1,
  },
  productName: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: Typography.fontSize.base,
    color: Colors.charcoalInk,
  },
  ranchName: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.xs,
    color: Colors.mutedSienna,
    marginBottom: 4,
  },
  productPrice: {
    fontFamily: 'DMMono-Regular',
    fontSize: Typography.fontSize.sm,
    color: Colors.primaryRust,
    fontWeight: 'bold',
  },
  removeButton: {
    padding: Spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.base,
    color: Colors.mutedSienna,
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  exploreButton: {
    width: '100%',
  },
});
