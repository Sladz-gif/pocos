import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, Radius } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import { PCard, PChip, LoadingState } from '../../components/ui';
import { StackNavigationProp } from '@react-navigation/stack';
import { BrowseStackParamList } from '../../navigation/types';
import { useMarketplaceStore } from '../../store/marketplaceStore';
import { useAuthStore } from '../../store/authStore';

type AllProductsScreenProps = {
  navigation: StackNavigationProp<BrowseStackParamList, 'AllProducts'>;
};

const CATEGORIES = ['All', 'Live Cattle', 'Beef / Meat', 'Milk & Dairy', 'Feed & Hay', 'Other'];

export const AllProductsScreen: React.FC<AllProductsScreenProps> = ({ navigation }) => {
  const { listings, fetchListings, isLoading } = useMarketplaceStore();
  const { userRole } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const isBuyer = userRole === 'buyer';

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const filteredListings = listings.filter(item => {
    if (item.status !== 'listed') return false;
    const matchesSearch = item.productName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const renderProduct = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.productWrapper}
      onPress={() => navigation.navigate('ProductDetail', { id: item.id })}
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
            <Text style={styles.productPrice}>GHS {item.price.toLocaleString()}</Text>
          </View>
        </View>
      </PCard>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.charcoalInk} />
        </TouchableOpacity>
        <Text style={styles.title}>All Products</Text>
        {isBuyer ? (
          <TouchableOpacity onPress={() => navigation.navigate('Cart')} style={styles.cartButton}>
            <Ionicons name="cart-outline" size={24} color={Colors.primaryRust} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={Colors.mutedSienna} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
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

      {isLoading ? (
        <LoadingState variant="grid" />
      ) : (
        <FlatList
          data={filteredListings}
          renderItem={renderProduct}
          keyExtractor={item => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={48} color={Colors.softAsh} />
              <Text style={styles.emptyText}>No products found.</Text>
            </View>
          }
        />
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: Colors.softAsh,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: Typography.fontSize.xl,
    color: Colors.charcoalInk,
  },
  cartButton: {
    padding: 4,
  },
  searchSection: {
    padding: Spacing.xl,
    backgroundColor: '#FFFFFF',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.paleParchment,
    paddingHorizontal: Spacing.md,
    height: 48,
    borderRadius: Radius.lg,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.sm,
    color: Colors.charcoalInk,
  },
  filterSection: {
    backgroundColor: '#FFFFFF',
    paddingBottom: Spacing.md,
  },
  filterList: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  listContent: {
    padding: Spacing.xl,
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
  },
  productImageContainer: {
    height: 120,
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
    top: 8,
    left: 8,
    backgroundColor: Colors.primaryRust,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
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
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productPrice: {
    fontFamily: 'DMMono-Bold',
    fontSize: Typography.fontSize.sm,
    color: Colors.primaryRust,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Spacing['4xl'],
  },
  emptyText: {
    fontFamily: 'DMSans-Medium',
    fontSize: Typography.fontSize.sm,
    color: Colors.mutedSienna,
    marginTop: Spacing.md,
  },
});
