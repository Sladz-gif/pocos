import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, Radius } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import { PButton, PCard, PInput } from '../../components/ui';
import { StackNavigationProp } from '@react-navigation/stack';
import { BrowseStackParamList } from '../../navigation/types';
import { RouteProp } from '@react-navigation/native';
import { useMarketplaceStore } from '../../store/marketplaceStore';
import { useAuthStore } from '../../store/authStore';

type CheckoutScreenProps = {
  route: RouteProp<BrowseStackParamList, 'Checkout'>;
  navigation: StackNavigationProp<BrowseStackParamList, 'Checkout'>;
};

export const CheckoutScreen: React.FC<CheckoutScreenProps> = ({ route, navigation }) => {
  const { items, total } = route.params;
  const { user } = useAuthStore();
  const { deliveryAddresses, paymentMethods, fetchDeliveryAddresses, fetchPaymentMethods, createOrder, clearCart } = useMarketplaceStore();

  useEffect(() => {
    if (user?.id) {
      fetchDeliveryAddresses(user.id);
      fetchPaymentMethods(user.id);
    }
  }, [user?.id, fetchDeliveryAddresses, fetchPaymentMethods]);

  const defaultAddress = deliveryAddresses.find(a => a.is_default) || deliveryAddresses[0];
  const defaultPayment = paymentMethods.find(m => m.is_default) || paymentMethods[0];

  const [isProcessing, setIsProcessing] = useState(false);

  const handlePay = async () => {
    if (!defaultAddress) {
      Alert.alert('Address Required', 'Please add a delivery address in your profile.');
      return;
    }
    if (!defaultPayment) {
      Alert.alert('Payment Required', 'Please add a payment method in your profile.');
      return;
    }

    setIsProcessing(true);
    try {
      for (const item of items) {
        await createOrder({
          buyerId: user!.id,
          listingId: item.id,
          quantity: item.quantity,
          total: item.price * item.quantity,
        }, item.ranchId);
      }
      
      clearCart();
      Alert.alert('Success', 'Your order has been placed successfully!', [
        { text: 'View Orders', onPress: () => navigation.navigate('OrdersStack' as any) },
        { text: 'Back to Home', onPress: () => navigation.navigate('BrowseHome') }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.charcoalInk} />
        </TouchableOpacity>
        <Text style={styles.title}>Checkout</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <PCard style={styles.summaryCard}>
            {defaultAddress ? (
              <View>
                <Text style={styles.addressLabel}>{defaultAddress.label}</Text>
                <Text style={styles.itemName}>{defaultAddress.street}</Text>
                <Text style={styles.itemName}>{defaultAddress.city}, {defaultAddress.region}</Text>
              </View>
            ) : (
              <TouchableOpacity onPress={() => navigation.navigate('ProfileStack' as any, { screen: 'DeliveryAddresses' })}>
                <Text style={styles.addText}>+ Add Delivery Address</Text>
              </TouchableOpacity>
            )}
          </PCard>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <PCard style={styles.summaryCard}>
            {defaultPayment ? (
              <View style={styles.paymentInfoRow}>
                <Ionicons 
                  name={defaultPayment.type === 'card' ? 'card-outline' : 'phone-portrait-outline'} 
                  size={20} 
                  color={Colors.primaryRust} 
                />
                <Text style={styles.paymentText}>
                  {defaultPayment.type === 'card' 
                    ? `${defaultPayment.provider} •••• ${defaultPayment.last_four}` 
                    : `${defaultPayment.provider} (${defaultPayment.phone_number})`}
                </Text>
              </View>
            ) : (
              <TouchableOpacity onPress={() => navigation.navigate('ProfileStack' as any, { screen: 'PaymentMethods' })}>
                <Text style={styles.addText}>+ Add Payment Method</Text>
              </TouchableOpacity>
            )}
          </PCard>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <PCard style={styles.summaryCard}>
            {items.map((item, index) => (
              <View key={item.id} style={[styles.itemRow, index > 0 && styles.itemDivider]}>
                <Text style={styles.itemName}>{item.quantity}x {item.productName}</Text>
                <Text style={styles.itemPrice}>₵{(item.price * item.quantity).toLocaleString()}</Text>
              </View>
            ))}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>₵{total.toLocaleString()}</Text>
            </View>
          </PCard>
        </View>

        <PButton 
          title={isProcessing ? "Processing..." : `Place Order (₵${total.toLocaleString()})`}
          onPress={handlePay}
          loading={isProcessing}
          style={styles.payBtn}
        />
      </ScrollView>
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
  content: {
    padding: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 16,
    color: Colors.charcoalInk,
    marginBottom: Spacing.md,
  },
  summaryCard: {
    padding: Spacing.lg,
  },
  addressLabel: {
    fontFamily: 'DMSans-Bold',
    fontSize: 14,
    color: Colors.primaryRust,
    marginBottom: 4,
  },
  paymentInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  addText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 14,
    color: Colors.primaryRust,
    textAlign: 'center',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  itemDivider: {
    borderTopWidth: 1,
    borderTopColor: Colors.softAsh,
    marginTop: Spacing.xs,
  },
  itemName: {
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    color: Colors.charcoalInk,
  },
  itemPrice: {
    fontFamily: 'DMMono-Medium',
    fontSize: 14,
    color: Colors.charcoalInk,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 2,
    borderTopColor: Colors.softAsh,
  },
  totalLabel: {
    fontFamily: 'DMSans-Bold',
    fontSize: 16,
    color: Colors.charcoalInk,
  },
  totalValue: {
    fontFamily: 'DMMono-Bold',
    fontSize: 18,
    color: Colors.primaryRust,
  },
  paymentGrid: {
    gap: Spacing.md,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: Spacing.lg,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.softAsh,
  },
  paymentOptionSelected: {
    borderColor: Colors.primaryRust,
    backgroundColor: 'rgba(139, 69, 19, 0.05)',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.softAsh,
    marginRight: Spacing.md,
  },
  radioSelected: {
    borderColor: Colors.primaryRust,
    backgroundColor: Colors.primaryRust,
  },
  paymentText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    color: Colors.charcoalInk,
  },
  cardForm: {
    padding: Spacing.lg,
  },
  payBtn: {
    marginTop: Spacing.md,
    marginBottom: Spacing['4xl'],
  },
});
