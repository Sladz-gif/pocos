import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, Radius } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import { PCard, PBadge, PEmptyState } from '../../components/ui';
import { StackNavigationProp } from '@react-navigation/stack';
import { StoreStackParamList } from '../../navigation/types';
import { useMarketplaceStore } from '../../store/marketplaceStore';
import { useAuthStore } from '../../store/authStore';
import { formatDate } from '../../utils/date';

type OrdersScreenProps = {
  navigation: StackNavigationProp<StoreStackParamList, 'Orders'>;
};

export const OrdersScreen: React.FC<OrdersScreenProps> = ({ navigation }) => {
  const { orders, fetchRanchOrders, isLoading } = useMarketplaceStore();
  const { ranch } = useAuthStore();

  useEffect(() => {
    if (ranch?.id) {
      fetchRanchOrders(ranch.id);
    }
  }, [ranch?.id, fetchRanchOrders]);

  const renderOrder = ({ item }: { item: any }) => (
    <PCard style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Order #{item.id.substring(0, 8)}</Text>
        <PBadge 
          text={item.status} 
          variant={item.status === 'pending' ? 'warning' : item.status === 'shipped' ? 'info' : 'success'} 
        />
      </View>
      <View style={styles.orderInfo}>
        <Text style={styles.customerName}>{item.buyerName}</Text>
        <Text style={styles.orderDate}>{formatDate(item.orderDate)}</Text>
      </View>
      <View style={styles.orderFooter}>
        <Text style={styles.totalLabel}>Total Amount</Text>
        <Text style={styles.totalValue}>GHS {item.total}</Text>
      </View>
    </PCard>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.charcoalInk} />
        </TouchableOpacity>
        <Text style={styles.title}>Manage Orders</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={orders}
        renderItem={renderOrder}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !isLoading ? (
            <PEmptyState 
              title="No orders yet" 
              message="When customers buy your products, they will appear here."
              icon="receipt-outline"
            />
          ) : null
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.softAsh,
  },
  title: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: Typography.fontSize.xl,
    color: Colors.charcoalInk,
  },
  listContent: {
    padding: Spacing.xl,
  },
  orderCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  orderId: {
    fontFamily: 'DMMono-Regular',
    fontSize: Typography.fontSize.sm,
    color: Colors.mutedSienna,
  },
  orderInfo: {
    marginBottom: Spacing.md,
  },
  customerName: {
    fontFamily: 'DMSans-Bold',
    fontSize: Typography.fontSize.base,
    color: Colors.charcoalInk,
  },
  orderDate: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.xs,
    color: Colors.mutedSienna,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.softAsh,
  },
  totalLabel: {
    fontFamily: 'DMSans-Medium',
    fontSize: Typography.fontSize.xs,
    color: Colors.mutedSienna,
  },
  totalValue: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: Typography.fontSize.lg,
    color: Colors.primaryRust,
  },
});
