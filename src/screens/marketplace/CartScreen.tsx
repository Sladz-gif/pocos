import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, Radius } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import { PButton, PCard, PEmptyState } from '../../components/ui';
import { StackNavigationProp } from '@react-navigation/stack';
import { BrowseStackParamList } from '../../navigation/types';
import { useMarketplaceStore } from '../../store/marketplaceStore';
import { useAuthStore } from '../../store/authStore';

type CartScreenProps = {
  navigation: StackNavigationProp<BrowseStackParamList, 'Cart'>;
};

export const CartScreen: React.FC<CartScreenProps> = ({ navigation }) => {
  const { cart, removeFromCart, updateCartQuantity, clearCart } = useMarketplaceStore();
  const { userRole } = useAuthStore();

  if (userRole !== 'buyer') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.charcoalInk} />
          </TouchableOpacity>
          <Text style={styles.title}>Cart</Text>
          <View style={{ width: 40 }} />
        </View>
        <PEmptyState 
          icon="lock-closed-outline"
          title="Access Restricted"
          message="Shopping cart features are only available for buyer accounts."
        />
      </SafeAreaView>
    );
  }

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    navigation.navigate('Checkout', { items: cart, total });
  };

  const renderItem = ({ item }: { item: any }) => (
    <PCard style={styles.cartItem}>
      <View style={styles.itemImageContainer}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
        ) : (
          <Ionicons name="cube-outline" size={32} color={Colors.mutedSienna} />
        )}
      </View>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={1}>{item.productName}</Text>
        <Text style={styles.itemRanch}>{item.ranch?.name || 'Local Ranch'}</Text>
        <Text style={styles.itemPrice}>GHS {item.price.toLocaleString()}</Text>
        
        <View style={styles.quantityRow}>
          <View style={styles.qtyControls}>
            <TouchableOpacity 
              style={styles.qtyBtn}
              onPress={() => item.quantity > 1 && updateCartQuantity(item.id, item.quantity - 1)}
            >
              <Ionicons name="remove" size={16} color={Colors.charcoalInk} />
            </TouchableOpacity>
            <Text style={styles.qtyValue}>{item.quantity}</Text>
            <TouchableOpacity 
              style={styles.qtyBtn}
              onPress={() => updateCartQuantity(item.id, item.quantity + 1)}
            >
              <Ionicons name="add" size={16} color={Colors.charcoalInk} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => removeFromCart(item.id)} style={styles.removeBtn}>
            <Ionicons name="trash-outline" size={20} color={Colors.dangerCrimson} />
          </TouchableOpacity>
        </View>
      </View>
    </PCard>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.charcoalInk} />
        </TouchableOpacity>
        <Text style={styles.title}>My Cart</Text>
        <TouchableOpacity onPress={() => cart.length > 0 && clearCart()}>
          <Text style={[styles.clearText, cart.length === 0 && { opacity: 0.5 }]}>Clear</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={cart}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <PEmptyState
            icon="cart-outline"
            title="Your cart is empty"
            message="Browse products and add them to your cart to see them here."
          />
        }
      />

      {cart.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>₵{total.toLocaleString()}</Text>
          </View>
          <PButton 
            title="Proceed to Checkout" 
            onPress={handleCheckout} 
            style={styles.checkoutBtn}
          />
        </View>
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
  clearText: {
    fontFamily: 'DMSans-Bold',
    fontSize: Typography.fontSize.sm,
    color: Colors.dangerCrimson,
  },
  listContent: {
    padding: Spacing.xl,
  },
  cartItem: {
    flexDirection: 'row',
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  itemImageContainer: {
    width: 80,
    height: 80,
    borderRadius: Radius.md,
    backgroundColor: Colors.softAsh,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  itemName: {
    fontFamily: 'DMSans-Bold',
    fontSize: Typography.fontSize.base,
    color: Colors.charcoalInk,
  },
  itemRanch: {
    fontFamily: 'DMSans-Regular',
    fontSize: 12,
    color: Colors.mutedSienna,
    marginBottom: 4,
  },
  itemPrice: {
    fontFamily: 'DMMono-Bold',
    fontSize: Typography.fontSize.sm,
    color: Colors.primaryRust,
    marginBottom: Spacing.sm,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  qtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.paleParchment,
    borderRadius: Radius.full,
    padding: 2,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.softAsh,
  },
  qtyValue: {
    fontFamily: 'DMMono-Bold',
    paddingHorizontal: Spacing.md,
    fontSize: 14,
    color: Colors.charcoalInk,
  },
  removeBtn: {
    padding: 4,
  },
  footer: {
    backgroundColor: '#FFFFFF',
    padding: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: Colors.softAsh,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  totalLabel: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.base,
    color: Colors.mutedSienna,
  },
  totalValue: {
    fontFamily: 'DMMono-Bold',
    fontSize: Typography.fontSize.xl,
    color: Colors.charcoalInk,
  },
  checkoutBtn: {
    width: '100%',
  },
});
