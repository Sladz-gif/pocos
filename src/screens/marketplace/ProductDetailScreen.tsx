import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, Platform, Dimensions, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, Radius } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import { PBadge, PButton, PCard, PInput } from '../../components/ui';
import { StackNavigationProp } from '@react-navigation/stack';
import { BrowseStackParamList } from '../../navigation/types';
import { RouteProp } from '@react-navigation/native';
import { useMarketplaceStore } from '../../store/marketplaceStore';
import { useLivestockStore } from '../../store/livestockStore';
import { useAuthStore } from '../../store/authStore';
import { formatPrice } from '../../utils/currency';

type ProductDetailScreenProps = {
  route: RouteProp<BrowseStackParamList, 'ProductDetail'>;
  navigation: StackNavigationProp<BrowseStackParamList, 'ProductDetail'>;
};

const { width, height } = Dimensions.get('window');

export const ProductDetailScreen: React.FC<ProductDetailScreenProps> = ({ route, navigation }) => {
  const { id } = route.params;
  const { listings, toggleSaved, savedListingIds, addToCart, fetchSavedListings } = useMarketplaceStore();
  const { animals, fetchAnimals } = useLivestockStore();
  const { user, userRole } = useAuthStore();
  const [isOrdering, setIsOrdering] = useState(false);
  const [showOrderSheet, setShowOrderSheet] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  const product = listings.find(l => l.id === id);

  useEffect(() => {
    if (product?.ranchId) {
      fetchAnimals(product.ranchId);
    }
    if (user?.id) {
      fetchSavedListings(user.id);
    }
  }, [product?.ranchId, user?.id, fetchAnimals, fetchSavedListings]);

  const isSaved = savedListingIds.includes(id);
  const isBuyer = userRole === 'buyer';
  const linkedAnimal = animals.find(a => a.id === product?.animalId);

  if (!product) return null;

  const handleAddToCart = () => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in as a buyer to add items to your cart.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => (navigation as any).navigate('Auth', { screen: 'ConsumerSignIn' }) }
      ]);
      return;
    }
    
    addToCart(product, quantity);
    Alert.alert('Added to Cart', `${product.productName} has been added to your cart.`, [
      { text: 'Continue Shopping', style: 'cancel' },
      { text: 'Go to Cart', onPress: () => navigation.navigate('Cart' as any) }
    ]);
  };

  const photos = product.photos?.length > 0 ? product.photos : (product.imageUrl ? [product.imageUrl] : []);

  const OrderBottomSheet = () => (
    <Modal
      visible={showOrderSheet}
      transparent
      animationType="slide"
      onRequestClose={() => setShowOrderSheet(false)}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity 
          style={styles.modalCloseArea} 
          activeOpacity={1} 
          onPress={() => setShowOrderSheet(false)} 
        />
        <View style={styles.bottomSheet}>
          <View style={styles.sheetHeader}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Order Options</Text>
          </View>

          <View style={styles.sheetBody}>
            <View style={styles.orderItemPreview}>
              <View style={styles.previewImageContainer}>
                {product.imageUrl ? (
                  <Image source={{ uri: product.imageUrl }} style={styles.previewImage} />
                ) : (
                  <Ionicons name="paw" size={24} color={Colors.softAsh} />
                )}
              </View>
              <View style={styles.previewInfo}>
                <Text style={styles.previewName}>{product.productName}</Text>
                <Text style={styles.previewPrice}>{formatPrice(product.price, product.ranch?.currency)} / {product.unit}</Text>
              </View>
            </View>

            <View style={styles.quantitySelector}>
              <Text style={styles.selectorLabel}>Quantity</Text>
              <View style={styles.selectorControls}>
                <TouchableOpacity 
                  style={styles.qtyBtn} 
                  onPress={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Ionicons name="remove" size={20} color={Colors.charcoalInk} />
                </TouchableOpacity>
                <Text style={styles.qtyValue}>{quantity}</Text>
                <TouchableOpacity 
                  style={styles.qtyBtn} 
                  onPress={() => setQuantity(Math.min(product.stock, quantity + 1))}
                >
                  <Ionicons name="add" size={20} color={Colors.charcoalInk} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.totalBreakdown}>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Subtotal</Text>
              <Text style={styles.breakdownValue}>{formatPrice(product.price * quantity, product.ranch?.currency)}</Text>
            </View>
          </View>

            <PButton 
              title="Add to Cart" 
              onPress={handleAddToCart} 
              loading={isOrdering}
              style={styles.confirmBtn}
            />
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <OrderBottomSheet />
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.charcoalInk} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerButton} onPress={() => {
          if (user?.id) {
            toggleSaved(product.id, user.id);
          } else {
            Alert.alert('Login Required', 'Please sign in to save items.');
          }
        }}>
          <Ionicons 
            name={isSaved ? "heart" : "heart-outline"} 
            size={24} 
            color={isSaved ? Colors.dangerCrimson : Colors.charcoalInk} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.imageSection}>
          {photos.length > 0 ? (
            <ScrollView 
              horizontal 
              pagingEnabled 
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => {
                const index = Math.round(e.nativeEvent.contentOffset.x / width);
                setActivePhotoIndex(index);
              }}
            >
              {photos.map((uri: string, index: number) => (
                <Image key={index} source={{ uri }} style={styles.productImage} />
              ))}
            </ScrollView>
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="image-outline" size={80} color={Colors.softAsh} />
            </View>
          )}
          {photos.length > 1 && (
            <View style={styles.pagination}>
              {photos.map((_: any, i: number) => (
                <View 
                  key={i} 
                  style={[styles.paginationDot, activePhotoIndex === i && styles.paginationDotActive]} 
                />
              ))}
            </View>
          )}
        </View>

        <View style={styles.mainInfo}>
          <View style={styles.categoryRow}>
            <Text style={styles.productCategory}>{product.category}</Text>
            {product.stock <= 5 && (
              <PBadge text={`Only ${product.stock} left`} variant="warning" />
            )}
          </View>
          
          <Text style={styles.productName}>{product.productName}</Text>
          
          <View style={styles.priceRow}>
            <Text style={styles.finalPrice}>{formatPrice(product.price, product.ranch?.currency)}</Text>
            {product.discount > 0 && (
              <View style={styles.discountRow}>
                <Text style={styles.originalPrice}>₵{(product.price / (1 - product.discount/100)).toFixed(0)}</Text>
                <PBadge text={`${product.discount}% OFF`} variant="success" />
              </View>
            )}
          </View>

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>
            {product.description || `This premium ${product.productName.toLowerCase()} is sourced directly from verified African ranches.`}
          </Text>

          {linkedAnimal && (
            <View style={styles.animalSection}>
              <Text style={styles.sectionTitle}>About this animal</Text>
              <PCard style={styles.animalCard}>
                <View style={styles.animalStatsRow}>
                  <View style={styles.animalStat}>
                    <Text style={styles.animalStatLabel}>Breed</Text>
                    <Text style={styles.animalStatValue}>{linkedAnimal.breed}</Text>
                  </View>
                  <View style={styles.animalStat}>
                    <Text style={styles.animalStatLabel}>Weight</Text>
                    <Text style={styles.animalStatValue}>{linkedAnimal.weight} kg</Text>
                  </View>
                  <View style={styles.animalStat}>
                    <Text style={styles.animalStatLabel}>Gender</Text>
                    <Text style={styles.animalStatValue}>{linkedAnimal.sex}</Text>
                  </View>
                </View>
                <View style={styles.animalInfoFooter}>
                  <Ionicons name="shield-checkmark" size={16} color={Colors.successMoss} />
                  <Text style={styles.animalVerifyText}>Live operational data from {linkedAnimal.animalId}</Text>
                </View>
              </PCard>
            </View>
          )}

          <PCard style={styles.sellerCard} onPress={() => navigation.navigate('RanchProfile', { id: product.ranchId })}>
            <View style={styles.sellerAvatar}>
              {product.ranch?.logo_url ? (
                <Image source={{ uri: product.ranch.logo_url }} style={{ width: 44, height: 44, borderRadius: 22 }} />
              ) : (
                <Ionicons name="business" size={24} color={Colors.primaryRust} />
              )}
            </View>
            <View style={styles.sellerInfo}>
              <Text style={styles.sellerName}>{product.ranch?.name || 'Local Ranch'}</Text>
              <Text style={styles.sellerLocation}>{product.ranch?.location || 'Ghana'}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.mutedSienna} />
          </PCard>
        </View>
      </ScrollView>

      {isBuyer && (
        <View style={styles.footer}>
          <View style={styles.footerPrice}>
            <Text style={styles.footerLabel}>Total</Text>
            <Text style={styles.footerValue}>₵{product.price.toLocaleString()}</Text>
          </View>
          <PButton 
            title="Add to Cart" 
            onPress={handleAddToCart} 
            style={styles.buyButton} 
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    position: 'absolute',
    top: Platform.OS === 'ios' ? 44 : 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
      android: { elevation: 3 },
    }),
  },
  content: {
    flex: 1,
  },
  imageSection: {
    width: width,
    height: width,
    backgroundColor: Colors.softAsh,
  },
  productImage: {
    width: width,
    height: width,
  },
  imagePlaceholder: {
    width: width,
    height: width,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pagination: {
    position: 'absolute',
    bottom: Spacing.lg,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  paginationDotActive: {
    backgroundColor: '#FFFFFF',
    width: 12,
  },
  mainInfo: {
    padding: Spacing.xl,
    backgroundColor: Colors.paleParchment,
    borderTopLeftRadius: Radius['3xl'],
    borderTopRightRadius: Radius['3xl'],
    marginTop: -Radius['3xl'],
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  productCategory: {
    fontFamily: 'DMSans-Medium',
    fontSize: 12,
    color: Colors.mutedSienna,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  productName: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: Typography.fontSize['3xl'],
    color: Colors.charcoalInk,
    marginBottom: Spacing.md,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  finalPrice: {
    fontFamily: 'DMMono-Regular',
    fontSize: Typography.fontSize['2xl'],
    color: Colors.primaryRust,
    fontWeight: 'bold',
  },
  discountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  originalPrice: {
    fontFamily: 'DMMono-Regular',
    fontSize: Typography.fontSize.sm,
    color: Colors.mutedSienna,
    textDecorationLine: 'line-through',
  },
  sectionTitle: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: Typography.fontSize.lg,
    color: Colors.charcoalInk,
    marginBottom: Spacing.sm,
  },
  description: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.base,
    color: Colors.mutedSienna,
    lineHeight: 24,
    marginBottom: Spacing.xl,
  },
  animalSection: {
    marginBottom: Spacing.xl,
  },
  animalCard: {
    padding: Spacing.lg,
    backgroundColor: '#FFFFFF',
  },
  animalStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  animalStat: {
    alignItems: 'center',
  },
  animalStatLabel: {
    fontFamily: 'DMSans-Regular',
    fontSize: 10,
    color: Colors.mutedSienna,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  animalStatValue: {
    fontFamily: 'DMSans-Bold',
    fontSize: Typography.fontSize.sm,
    color: Colors.charcoalInk,
  },
  animalInfoFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.softAsh,
  },
  animalVerifyText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 11,
    color: Colors.successMoss,
    marginLeft: 6,
  },
  sellerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: '#FFFFFF',
    marginBottom: Spacing['4xl'],
  },
  sellerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.warmSand,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.lg,
  },
  sellerInfo: {
    flex: 1,
  },
  sellerName: {
    fontFamily: 'DMSans-Bold',
    fontSize: Typography.fontSize.base,
    color: Colors.charcoalInk,
  },
  sellerLocation: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.xs,
    color: Colors.mutedSienna,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.xl,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: Colors.softAsh,
    paddingBottom: Platform.OS === 'ios' ? 34 : Spacing.xl,
  },
  footerPrice: {
    flex: 1,
  },
  footerLabel: {
    fontFamily: 'DMSans-Regular',
    fontSize: 10,
    color: Colors.mutedSienna,
    textTransform: 'uppercase',
  },
  footerValue: {
    fontFamily: 'DMMono-Regular',
    fontSize: Typography.fontSize.xl,
    color: Colors.charcoalInk,
    fontWeight: 'bold',
  },
  buyButton: {
    flex: 1.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCloseArea: {
    flex: 1,
  },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: Radius['3xl'],
    borderTopRightRadius: Radius['3xl'],
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: height * 0.8,
  },
  sheetHeader: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.softAsh,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.softAsh,
    marginBottom: Spacing.sm,
  },
  sheetTitle: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: Typography.fontSize.lg,
    color: Colors.charcoalInk,
  },
  sheetBody: {
    padding: Spacing.xl,
  },
  orderItemPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    padding: Spacing.md,
    backgroundColor: Colors.paleParchment,
    borderRadius: Radius.lg,
  },
  previewImageContainer: {
    width: 60,
    height: 60,
    borderRadius: Radius.md,
    backgroundColor: Colors.softAsh,
    overflow: 'hidden',
    marginRight: Spacing.md,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewInfo: {
    flex: 1,
  },
  previewName: {
    fontFamily: 'DMSans-Bold',
    fontSize: Typography.fontSize.base,
    color: Colors.charcoalInk,
  },
  previewPrice: {
    fontFamily: 'DMMono-Regular',
    fontSize: Typography.fontSize.sm,
    color: Colors.primaryRust,
    marginTop: 2,
  },
  quantitySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.softAsh,
  },
  selectorLabel: {
    fontFamily: 'DMSans-Bold',
    fontSize: Typography.fontSize.base,
    color: Colors.charcoalInk,
  },
  selectorControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.paleParchment,
    borderRadius: Radius.full,
    padding: 4,
  },
  qtyBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.softAsh,
  },
  qtyValue: {
    fontFamily: 'DMMono-Bold',
    fontSize: Typography.fontSize.base,
    color: Colors.charcoalInk,
    paddingHorizontal: Spacing.lg,
  },
  totalBreakdown: {
    marginBottom: Spacing.xl,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  breakdownLabel: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.sm,
    color: Colors.mutedSienna,
  },
  breakdownValue: {
    fontFamily: 'DMMono-Regular',
    fontSize: Typography.fontSize.sm,
    color: Colors.charcoalInk,
  },
  totalRow: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.softAsh,
  },
  totalLabel: {
    fontFamily: 'DMSans-Bold',
    fontSize: Typography.fontSize.base,
    color: Colors.charcoalInk,
  },
  totalAmount: {
    fontFamily: 'DMMono-Bold',
    fontSize: Typography.fontSize.lg,
    color: Colors.primaryRust,
  },
  confirmBtn: {
    marginTop: Spacing.md,
  },
});
