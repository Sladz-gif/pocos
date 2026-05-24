import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Image, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, Radius } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import { PCard, PBadge, PChip, LoadingState } from '../../components/ui';
import { StackNavigationProp } from '@react-navigation/stack';
import { BrowseStackParamList } from '../../navigation/types';
import { useMarketplaceStore } from '../../store/marketplaceStore';
import { useAuthStore } from '../../store/authStore';
import { getCurrencySymbol, formatPrice } from '../../utils/currency';

type BrowseHomeScreenProps = {
  navigation: StackNavigationProp<BrowseStackParamList, 'BrowseHome'>;
  showAsPreview?: boolean;
};

const CATEGORIES = ['All', 'Live Cattle', 'Beef / Meat', 'Milk & Dairy', 'Feed & Hay', 'Other'];

export const BrowseHomeScreen: React.FC<BrowseHomeScreenProps> = ({ navigation, showAsPreview }) => {
  const { listings, fetchListings, featuredRanches, fetchFeaturedRanches, isLoading, cart } = useMarketplaceStore();
  const { ranch, userRole } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const isBuyer = userRole === 'buyer';

  useEffect(() => {
    // If we have a ranch context (like staff previewing), fetch that ranch's listings
    // Otherwise fetch all listings for the buyer marketplace
    fetchListings();
    fetchFeaturedRanches();
  }, [fetchListings, fetchFeaturedRanches]);

  const filteredListings = listings.filter(item => {
    if (item.status !== 'listed') return false;
    const matchesSearch = item.productName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleProductPress = (item: any) => {
    if (showAsPreview) {
      // In staff preview mode, we navigate to the store management version of the detail screen
      navigation.navigate('StoreListingDetail' as any, { id: item.id });
    } else {
      navigation.navigate('ProductDetail', { id: item.id });
    }
  };

  const renderProduct = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.productWrapper}
      onPress={() => handleProductPress(item)}
    >
      <PCard style={styles.productCard}>
        <View style={styles.productImageContainer}>
          {item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
          ) : (
            <Ionicons name="image-outline" size={32} color={Colors.mutedSienna} />
          )}
          {item.discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountBadgeText}>-{item.discount}%</Text>
            </View>
          )}
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.productCategory}>{item.category}</Text>
          <Text style={styles.productName} numberOfLines={1}>{item.productName}</Text>
          <Text style={styles.productRanch}>{item.ranch?.name || 'Local Ranch'}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.productPrice}>{formatPrice(item.price, item.ranch?.currency)}</Text>
            {item.discount > 0 && (
              <Text style={styles.originalPrice}>{getCurrencySymbol(item.ranch?.currency)}{(item.price / (1 - item.discount/100)).toFixed(0)}</Text>
            )}
          </View>
        </View>
      </PCard>
    </TouchableOpacity>
  );

  const renderFeaturedRanch = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.ranchCard} 
      onPress={() => {
        if (showAsPreview) {
          Alert.alert('Preview Mode', 'Ranch profiles are not available in preview mode.');
          return;
        }
        navigation.navigate('RanchProfile', { id: item.id });
      }}
    >
      <Image 
        source={{ uri: item.logo_url || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400' }} 
        style={styles.ranchImage} 
      />
      <View style={styles.ranchOverlay}>
        <Text style={styles.ranchName}>{item.name}</Text>
        <View style={styles.ranchLocationRow}>
          <Ionicons name="location" size={12} color="#FFFFFF" />
          <Text style={styles.ranchLocation}>{item.location}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={showAsPreview ? ['left', 'right', 'bottom'] : ['top', 'left', 'right', 'bottom']}>
      {isLoading ? (
        <LoadingState variant="grid" />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={{ flex: 1 }} />
          {isBuyer && (
            <TouchableOpacity 
              style={styles.cartButton} 
              onPress={() => navigation.navigate('Cart' as any)}
            >
              <Ionicons name="cart-outline" size={24} color={Colors.primaryRust} />
              {cart && cart.length > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cart.length}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.searchSection}>
          <Text style={styles.title}>Marketplace</Text>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={Colors.mutedSienna} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search cattle, meat, milk..."
              placeholderTextColor={Colors.mutedSienna}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <View style={styles.filterSection}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={CATEGORIES}
            renderItem={({ item }) => (
              <PChip 
                label={item} 
                selected={selectedCategory === item} 
                onPress={() => setSelectedCategory(item)}
              />
            )}
            keyExtractor={item => item}
            contentContainerStyle={styles.filterList}
          />
        </View>

        <View style={styles.featuredSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Ranches</Text>
            {!showAsPreview && (
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            )}
          </View>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={featuredRanches}
            renderItem={renderFeaturedRanch}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.featuredList}
            ListEmptyComponent={
              <View style={styles.emptyRanches}>
                <Text style={styles.emptyRanchesText}>No featured ranches today</Text>
              </View>
            }
          />
        </View>

        <View style={styles.productsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Listings</Text>
            {!showAsPreview && (
              <TouchableOpacity onPress={() => navigation.navigate('AllProducts' as any)}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            )}
          </View>
          <FlatList
            data={filteredListings}
            renderItem={renderProduct}
            keyExtractor={item => item.id}
            numColumns={2}
            scrollEnabled={false}
            contentContainerStyle={styles.listContent}
            columnWrapperStyle={styles.columnWrapper}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={48} color={Colors.softAsh} />
                <Text style={styles.emptyText}>No products found.</Text>
              </View>
            }
          />
        </View>
        </ScrollView>
      )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.softAsh,
  },
  locationText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 12,
    color: Colors.charcoalInk,
    marginHorizontal: 4,
  },
  cartButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.softAsh,
  },
  cartBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.primaryRust,
    width: 14,
    height: 14,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontFamily: 'DMSans-Bold',
  },
  searchSection: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },
  title: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: Typography.fontSize['3xl'],
    color: Colors.charcoalInk,
    marginBottom: Spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.md,
    height: 48,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.softAsh,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.sm,
    color: Colors.charcoalInk,
  },
  filterSection: {
    marginBottom: Spacing.lg,
  },
  filterList: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  featuredSection: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: Typography.fontSize.lg,
    color: Colors.charcoalInk,
  },
  seeAllText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 12,
    color: Colors.primaryRust,
  },
  featuredList: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  ranchCard: {
    width: 200,
    height: 120,
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  ranchImage: {
    width: '100%',
    height: '100%',
  },
  ranchOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.md,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  ranchName: {
    fontFamily: 'DMSans-Bold',
    fontSize: Typography.fontSize.sm,
    color: '#FFFFFF',
  },
  ranchLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  ranchLocation: {
    fontFamily: 'DMSans-Regular',
    fontSize: 10,
    color: '#FFFFFF',
    marginLeft: 4,
  },
  emptyRanches: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  emptyRanchesText: {
    fontFamily: 'DMSans-Regular',
    fontSize: 12,
    color: Colors.mutedSienna,
    fontStyle: 'italic',
  },
  productsSection: {
    paddingBottom: Spacing['4xl'],
  },
  listContent: {
    paddingHorizontal: Spacing.xl,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  productWrapper: {
    width: '48%',
    marginBottom: Spacing.md,
  },
  productCard: {
    padding: 0,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  productImageContainer: {
    height: 140,
    backgroundColor: Colors.softAsh,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: Spacing.xs,
    left: Spacing.xs,
    backgroundColor: Colors.primaryRust,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.xs,
  },
  discountBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'DMSans-Bold',
  },
  productInfo: {
    padding: Spacing.md,
  },
  productCategory: {
    fontFamily: 'DMSans-Medium',
    fontSize: 9,
    color: Colors.mutedSienna,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  productName: {
    fontFamily: 'DMSans-Bold',
    fontSize: Typography.fontSize.sm,
    color: Colors.charcoalInk,
    marginBottom: 2,
  },
  productRanch: {
    fontFamily: 'DMSans-Regular',
    fontSize: 10,
    color: Colors.mutedSienna,
    marginBottom: Spacing.sm,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  productPrice: {
    fontFamily: 'DMMono-Regular',
    fontSize: Typography.fontSize.sm,
    color: Colors.primaryRust,
    fontWeight: 'bold',
  },
  originalPrice: {
    fontFamily: 'DMMono-Regular',
    fontSize: 10,
    color: Colors.mutedSienna,
    textDecorationLine: 'line-through',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['4xl'],
  },
  emptyText: {
    fontFamily: 'DMSans-Medium',
    fontSize: Typography.fontSize.sm,
    color: Colors.mutedSienna,
    marginTop: Spacing.md,
  },
});
