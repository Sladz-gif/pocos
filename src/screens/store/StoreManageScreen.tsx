import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Switch, Image, Dimensions, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, Radius } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import { PCard, PBadge, PButton, PChip, BuyerPreviewBanner, PModal } from '../../components/ui';
import { StackNavigationProp } from '@react-navigation/stack';
import { StoreStackParamList } from '../../navigation/types';
import { useUIStore } from '../../store/uiStore';
import { useMarketplaceStore } from '../../store/marketplaceStore';
import { useAuthStore } from '../../store/authStore';
import { BrowseHomeScreen } from '../marketplace/BrowseHomeScreen';

type StoreManageScreenProps = {
  navigation: StackNavigationProp<StoreStackParamList, 'StoreManage'>;
};

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - Spacing.xl * 2 - Spacing.md) / 2;

export const StoreManageScreen: React.FC<StoreManageScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [view, setView] = useState<'listings' | 'orders' | 'discounts'>('listings');
  const [orderFilter, setOrderFilter] = useState<'pending' | 'fulfilled' | 'all'>('pending');
  const { isBuyerPreview, setBuyerPreview } = useUIStore();
  const { 
    listings, 
    fetchListings, 
    orders, 
    fetchRanchOrders, 
    discounts, 
    fetchDiscounts, 
    updateListing, 
    updateOrderStatus,
    deleteListing,
    deleteDiscount
  } = useMarketplaceStore();
  const { ranch } = useAuthStore();

  const [isDeleteListingModalVisible, setIsDeleteListingModalVisible] = useState(false);
  const [isDeleteDiscountModalVisible, setIsDeleteDiscountModalVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (ranch?.id) {
      fetchListings(ranch.id);
      fetchRanchOrders(ranch.id);
      fetchDiscounts(ranch.id);
    }
  }, [ranch?.id, fetchListings, fetchRanchOrders, fetchDiscounts]);

  const filteredOrders = useMemo(() => {
    if (orderFilter === 'all') return orders;
    if (orderFilter === 'pending') return orders.filter(o => o.status === 'pending');
    return orders.filter(o => o.status === 'delivered' || o.status === 'shipped');
  }, [orders, orderFilter]);

  const stats = useMemo(() => {
    const activeListings = listings.filter(l => l.status === 'listed').length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    
    // Calculate sales this month
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlySales = orders
      .filter(o => new Date(o.orderDate) >= firstDayOfMonth && o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.total, 0);

    return { activeListings, pendingOrders, monthlySales };
  }, [listings, orders]);

  if (isBuyerPreview) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <View style={[styles.previewStickyBanner, { paddingTop: insets.top + Spacing.sm }]}>
          <Text style={styles.previewStickyText}>Buyer View</Text>
          <TouchableOpacity 
            style={styles.exitPreviewButton}
            onPress={() => setBuyerPreview(false)}
          >
            <Text style={styles.exitPreviewText}>Exit Preview</Text>
          </TouchableOpacity>
        </View>
        <BrowseHomeScreen navigation={navigation as any} showAsPreview />
      </View>
    );
  }

  const handleToggleListing = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'listed' ? 'hidden' : 'listed';
    try {
      await updateListing(id, { status: newStatus });
    } catch (error) {
      console.error('Failed to toggle listing status:', error);
    }
  };

  const handleDeleteListing = async () => {
    if (!itemToDelete) return;
    try {
      await deleteListing(itemToDelete);
      setIsDeleteListingModalVisible(false);
      setItemToDelete(null);
      Alert.alert('Success', 'Listing deleted successfully.');
    } catch (error) {
      Alert.alert('Error', 'Failed to delete listing.');
    }
  };

  const handleDeleteDiscount = async () => {
    if (!itemToDelete) return;
    try {
      await deleteDiscount(itemToDelete);
      setIsDeleteDiscountModalVisible(false);
      setItemToDelete(null);
      Alert.alert('Success', 'Discount deleted successfully.');
    } catch (error) {
      Alert.alert('Error', 'Failed to delete discount.');
    }
  };

  const renderListing = ({ item }: { item: any }) => (
    <PCard style={styles.listingGridCard}>
      <TouchableOpacity 
        style={styles.listingCardContent}
        onPress={() => navigation.navigate('StoreListingDetail', { id: item.id })}
      >
        <View style={styles.listingGridImage}>
          {item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} style={styles.fullImage} />
          ) : (
            <Ionicons name="image-outline" size={32} color={Colors.mutedSienna} />
          )}
          <View style={styles.toggleOverlay}>
            <Switch
              value={item.status === 'listed'}
              onValueChange={() => handleToggleListing(item.id, item.status)}
              trackColor={{ false: Colors.softAsh, true: Colors.successMoss }}
              thumbColor="#FFFFFF"
              ios_backgroundColor={Colors.softAsh}
              style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
            />
          </View>
          <TouchableOpacity 
            style={styles.deleteOverlay}
            onPress={() => {
              setItemToDelete(item.id);
              setIsDeleteListingModalVisible(true);
            }}
          >
            <Ionicons name="trash-outline" size={16} color={Colors.errorRed} />
          </TouchableOpacity>
        </View>
        <View style={styles.listingGridInfo}>
          <Text style={styles.listingGridName} numberOfLines={1}>{item.productName}</Text>
          <Text style={styles.listingGridPrice}>GHS {item.price.toLocaleString()}</Text>
          <Text style={styles.listingGridCategory}>{item.category}</Text>
        </View>
      </TouchableOpacity>
    </PCard>
  );

  const renderOrder = ({ item }: { item: any }) => (
    <PCard style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.buyerName}>{item.buyerName}</Text>
          <Text style={styles.orderDate}>{new Date(item.orderDate).toLocaleDateString()}</Text>
        </View>
        <PBadge 
          text={item.status.toUpperCase()} 
          variant={
            item.status === 'pending' ? 'warning' : 
            item.status === 'delivered' ? 'success' : 'info'
          } 
        />
      </View>
      
      <View style={styles.orderBody}>
        <Text style={styles.orderItem}>{item.item} (x{item.quantity})</Text>
        <Text style={styles.orderTotal}>GHS {item.total.toLocaleString()}</Text>
      </View>

      <View style={styles.orderActions}>
        {item.status === 'pending' && (
          <>
            <TouchableOpacity 
              style={[styles.actionBtn, { borderColor: Colors.successMoss }]}
              onPress={() => updateOrderStatus(item.id, 'confirmed')}
            >
              <Text style={[styles.actionBtnText, { color: Colors.successMoss }]}>Confirm</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionBtn, { borderColor: Colors.dangerCrimson }]}
              onPress={() => updateOrderStatus(item.id, 'cancelled')}
            >
              <Text style={[styles.actionBtnText, { color: Colors.dangerCrimson }]}>Cancel</Text>
            </TouchableOpacity>
          </>
        )}
        {item.status === 'confirmed' && (
          <TouchableOpacity 
            style={[styles.actionBtn, { borderColor: Colors.infoBlue }]}
            onPress={() => updateOrderStatus(item.id, 'shipped')}
          >
            <Text style={[styles.actionBtnText, { color: Colors.infoBlue }]}>Dispatch</Text>
          </TouchableOpacity>
        )}
        {item.status === 'shipped' && (
          <TouchableOpacity 
            style={[styles.actionBtn, { borderColor: Colors.successMoss }]}
            onPress={() => updateOrderStatus(item.id, 'delivered')}
          >
            <Text style={[styles.actionBtnText, { color: Colors.successMoss }]}>Complete</Text>
          </TouchableOpacity>
        )}
      </View>
    </PCard>
  );

  const renderDiscount = ({ item }: { item: any }) => (
    <PCard style={styles.listingCard}>
      <View style={styles.listingInfo}>
        <Text style={styles.listingName}>{item.code}</Text>
        <Text style={styles.listingPrice}>{item.value}{item.type === 'percentage' ? '%' : ' GHS'} OFF</Text>
        <Text style={styles.subtitle}>{item.status} • Used {item.usage_count || 0} times</Text>
      </View>
      <View style={{ alignItems: 'flex-end', gap: Spacing.sm }}>
        <PBadge text={item.type} variant="neutral" />
        <TouchableOpacity 
          onPress={() => {
            setItemToDelete(item.id);
            setIsDeleteDiscountModalVisible(true);
          }}
        >
          <Ionicons name="trash-outline" size={20} color={Colors.errorRed} />
        </TouchableOpacity>
      </View>
    </PCard>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Ranch Store</Text>
          <Text style={styles.subtitle}>Manage your marketplace</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.previewButton}
            onPress={() => setBuyerPreview(true)}
          >
            <Ionicons name="eye-outline" size={20} color={Colors.primaryRust} />
            <Text style={styles.previewButtonText}>Buyer Preview</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => {
              if (view === 'listings') navigation.navigate('AddListing');
              else if (view === 'discounts') navigation.navigate('Discounts');
              else navigation.navigate('Orders');
            }}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.activeListings}</Text>
          <Text style={styles.statLabel}>Active Listings</Text>
        </View>
        <View style={[styles.statItem, styles.statBorder]}>
          <Text style={styles.statValue}>{stats.pendingOrders}</Text>
          <Text style={styles.statLabel}>Pending Orders</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>₵{stats.monthlySales.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Sales (Month)</Text>
        </View>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, view === 'listings' && styles.activeTab]}
          onPress={() => setView('listings')}
        >
          <Text style={[styles.tabText, view === 'listings' && styles.activeTabText]}>Listings</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, view === 'orders' && styles.activeTab]}
          onPress={() => setView('orders')}
        >
          <Text style={[styles.tabText, view === 'orders' && styles.activeTabText]}>Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, view === 'discounts' && styles.activeTab]}
          onPress={() => setView('discounts')}
        >
          <Text style={[styles.tabText, view === 'discounts' && styles.activeTabText]}>Discounts</Text>
        </TouchableOpacity>
      </View>

      {view === 'orders' && (
        <View style={styles.orderFilterRow}>
          <TouchableOpacity 
            style={[styles.orderFilterTab, orderFilter === 'pending' && styles.activeOrderFilter]}
            onPress={() => setOrderFilter('pending')}
          >
            <Text style={[styles.orderFilterText, orderFilter === 'pending' && styles.activeOrderFilterText]}>Pending</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.orderFilterTab, orderFilter === 'fulfilled' && styles.activeOrderFilter]}
            onPress={() => setOrderFilter('fulfilled')}
          >
            <Text style={[styles.orderFilterText, orderFilter === 'fulfilled' && styles.activeOrderFilterText]}>Fulfilled</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.orderFilterTab, orderFilter === 'all' && styles.activeOrderFilter]}
            onPress={() => setOrderFilter('all')}
          >
            <Text style={[styles.orderFilterText, orderFilter === 'all' && styles.activeOrderFilterText]}>All</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={view === 'listings' ? listings : view === 'orders' ? filteredOrders : discounts}
        renderItem={view === 'listings' ? renderListing : view === 'orders' ? renderOrder : renderDiscount}
        keyExtractor={item => item.id}
        numColumns={view === 'listings' ? 2 : 1}
        key={view === 'listings' ? 'grid' : 'list'}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={view === 'listings' ? styles.columnWrapper : undefined}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={48} color={Colors.softAsh} />
            <Text style={styles.emptyText}>No {view} found.</Text>
          </View>
        }
      />

      {/* Delete Listing Confirmation Modal */}
      <PModal
        visible={isDeleteListingModalVisible}
        onClose={() => setIsDeleteListingModalVisible(false)}
        title="Delete Listing"
      >
        <Text style={styles.deleteText}>Are you sure you want to delete this listing? This action cannot be undone.</Text>
        <View style={styles.modalButtons}>
          <PButton title="Cancel" variant="outline" onPress={() => setIsDeleteListingModalVisible(false)} style={{ flex: 1 }} />
          <PButton title="Delete" variant="danger" onPress={handleDeleteListing} style={{ flex: 1 }} />
        </View>
      </PModal>

      {/* Delete Discount Confirmation Modal */}
      <PModal
        visible={isDeleteDiscountModalVisible}
        onClose={() => setIsDeleteDiscountModalVisible(false)}
        title="Delete Discount"
      >
        <Text style={styles.deleteText}>Are you sure you want to delete this discount code?</Text>
        <View style={styles.modalButtons}>
          <PButton title="Cancel" variant="outline" onPress={() => setIsDeleteDiscountModalVisible(false)} style={{ flex: 1 }} />
          <PButton title="Delete" variant="danger" onPress={handleDeleteDiscount} style={{ flex: 1 }} />
        </View>
      </PModal>
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
    paddingVertical: Spacing.lg,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: Colors.softAsh,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center', 
  },
  previewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.paleParchment,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
    marginRight: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.softAsh,
  },
  previewButtonText: {
    color: Colors.primaryRust,
    fontFamily: 'DMSans-Medium', 
    fontSize: 12,
    marginLeft: Spacing.xs,
  },
  title: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: Typography.fontSize['2xl'],
    color: Colors.charcoalInk,
  },
  subtitle: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.sm,
    color: Colors.mutedSienna,
  },
  addButton: {
    backgroundColor: Colors.primaryRust,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: Spacing.xl,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.softAsh,
    marginVertical: Spacing.xl,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: Colors.softAsh,
  },
  statValue: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: Typography.fontSize.lg,
    color: Colors.charcoalInk,
  },
  statLabel: {
    fontFamily: 'DMSans-Regular',
    fontSize: 10,
    color: Colors.mutedSienna,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  tab: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
    backgroundColor: Colors.softAsh,
  },
  activeTab: {
    backgroundColor: Colors.deepPlum,
  },
  tabText: {
    fontFamily: 'DMSans-Medium',
    fontSize: Typography.fontSize.sm,
    color: Colors.mutedSienna,
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  listingGridCard: {
    width: COLUMN_WIDTH,
    marginBottom: Spacing.md,
    padding: 0,
    overflow: 'hidden',
  },
  listingCardContent: {
    flex: 1,
  },
  listingGridImage: {
    width: '100%',
    height: COLUMN_WIDTH,
    backgroundColor: Colors.softAsh,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  toggleOverlay: {
    position: 'absolute',
    top: Spacing.xs,
    right: Spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: Radius.full,
    padding: 2,
  },
  deleteOverlay: {
    position: 'absolute',
    top: Spacing.xs,
    left: Spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: Radius.full,
    padding: 6,
  },
  listingGridInfo: {
    padding: Spacing.sm,
  },
  listingGridName: {
    fontFamily: 'DMSans-Bold',
    fontSize: Typography.fontSize.sm,
    color: Colors.charcoalInk,
  },
  listingGridPrice: {
    fontFamily: 'DMMono-Regular',
    fontSize: Typography.fontSize.sm,
    color: Colors.primaryRust,
    marginTop: 2,
  },
  listingGridCategory: {
    fontFamily: 'DMSans-Regular',
    fontSize: 10,
    color: Colors.mutedSienna,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  listingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  listingInfo: {
    flex: 1,
  },
  listingName: {
    fontFamily: 'DMSans-Bold',
    fontSize: Typography.fontSize.base,
    color: Colors.charcoalInk,
  },
  listingPrice: {
    fontFamily: 'DMMono-Regular',
    fontSize: Typography.fontSize.sm,
    color: Colors.primaryRust,
    marginTop: 2,
  },
  orderFilterRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  orderFilterTab: {
    paddingVertical: 6,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.sm,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.softAsh,
  },
  activeOrderFilter: {
    borderColor: Colors.primaryRust,
    backgroundColor: Colors.paleParchment,
  },
  orderFilterText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 11,
    color: Colors.mutedSienna,
  },
  activeOrderFilterText: {
    color: Colors.primaryRust,
  },
  orderCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  buyerName: {
    fontFamily: 'DMSans-Bold',
    fontSize: Typography.fontSize.base,
    color: Colors.charcoalInk,
  },
  orderDate: {
    fontFamily: 'DMSans-Regular',
    fontSize: 10,
    color: Colors.mutedSienna,
    marginTop: 2,
  },
  orderBody: {
    marginBottom: Spacing.md,
  },
  orderItem: {
    fontFamily: 'DMSans-Medium',
    fontSize: Typography.fontSize.sm,
    color: Colors.charcoalInk,
  },
  orderTotal: {
    fontFamily: 'DMMono-Regular',
    fontSize: Typography.fontSize.sm,
    color: Colors.primaryRust,
    marginTop: 2,
  },
  orderActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.softAsh,
    paddingTop: Spacing.md,
  },
  actionBtn: {
    paddingVertical: 6,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  actionBtnText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing['4xl'],
  },
  emptyText: {
    fontFamily: 'DMSans-Medium',
    fontSize: Typography.fontSize.base,
    color: Colors.mutedSienna,
    marginTop: Spacing.md,
  },
  previewStickyBanner: {
    backgroundColor: Colors.primaryRust,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    zIndex: 100,
  },
  previewStickyText: {
    fontFamily: 'DMSans-Bold',
    fontSize: Typography.fontSize.sm,
    color: '#FFFFFF',
  },
  exitPreviewButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.md,
  },
  exitPreviewText: {
    color: '#FFFFFF',
    fontFamily: 'DMSans-Bold',
    fontSize: Typography.fontSize.xs,
  },
  deleteText: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.sm,
    color: Colors.charcoalInk,
    marginBottom: Spacing.xl,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
});
