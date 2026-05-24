import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, Radius } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import { PCard, PBadge } from '../../components/ui';
import { useMarketplaceStore } from '../../store/marketplaceStore';
import { useAuthStore } from '../../store/authStore';
import { useChatStore } from '../../store/chatStore';

export const ConsumerOrdersScreen: React.FC<any> = ({ navigation }) => {
  const { orders, fetchBuyerOrders, isLoading } = useMarketplaceStore();
  const { user } = useAuthStore();
  const { getOrCreateDirectChannel, setActiveChannel, channels } = useChatStore();

  useEffect(() => {
    if (user?.id) {
      fetchBuyerOrders(user.id);
    }
  }, [user?.id]);

  const handleContactRanch = async (order: any) => {
    if (!order.ranch?.owner_id) {
      Alert.alert('Error', 'Ranch contact information not available.');
      return;
    }

    try {
      const otherUser = {
        id: order.ranch.owner_id,
        name: order.ranch.name,
      };

      const channelId = await getOrCreateDirectChannel(order.ranchId, user!.id, otherUser as any);
      
      if (channelId) {
        // Find the channel in store or use a temporary one
        const channel = channels.find(c => c.id === channelId) || {
          id: channelId,
          name: order.ranch.name,
          type: 'direct',
          participants: [user!.id, order.ranch.owner_id]
        };
        
        setActiveChannel(channel as any);
        navigation.navigate('Conversation', { id: channelId });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to start chat with ranch.');
    }
  };

  const renderOrder = ({ item }: { item: any }) => (
    <PCard style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View style={styles.ranchInfo}>
          <View style={styles.ranchIcon}>
            <Ionicons name="business" size={20} color={Colors.primaryRust} />
          </View>
          <View>
            <Text style={styles.ranchName}>{item.ranch?.name || 'Local Ranch'}</Text>
            <Text style={styles.orderDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
          </View>
        </View>
        <PBadge 
          text={item.status.toUpperCase()} 
          variant={
            item.status === 'delivered' ? 'success' : 
            item.status === 'pending' ? 'warning' : 'info'
          } 
        />
      </View>

      <View style={styles.orderBody}>
        <View style={styles.itemImageContainer}>
          {item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
          ) : (
            <Ionicons name="paw" size={24} color={Colors.softAsh} />
          )}
        </View>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.productName}</Text>
          <Text style={styles.itemQty}>Quantity: {item.quantity}</Text>
          <Text style={styles.itemPrice}>GHS {item.totalPrice.toLocaleString()}</Text>
        </View>
      </View>

      <View style={styles.orderFooter}>
        <TouchableOpacity style={styles.contactButton} onPress={() => handleContactRanch(item)}>
          <Ionicons name="chatbubble-ellipses-outline" size={18} color={Colors.primaryRust} />
          <Text style={styles.contactText}>Contact Ranch</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.detailsButton}>
          <Text style={styles.detailsText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </PCard>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Orders</Text>
      </View>

      <FlatList
        data={orders}
        renderItem={renderOrder}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={64} color={Colors.softAsh} />
            <Text style={styles.emptyText}>No orders found.</Text>
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
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.softAsh,
  },
  title: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: Typography.fontSize['2xl'],
    color: Colors.charcoalInk,
  },
  listContent: {
    padding: Spacing.xl,
  },
  orderCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    backgroundColor: '#FFFFFF',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  ranchInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ranchIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: Colors.warmSand,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  ranchName: {
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    backgroundColor: Colors.paleParchment,
    padding: Spacing.md,
    borderRadius: Radius.md,
  },
  itemImageContainer: {
    width: 50,
    height: 50,
    borderRadius: Radius.sm,
    backgroundColor: Colors.softAsh,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
    overflow: 'hidden',
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontFamily: 'DMSans-Bold',
    fontSize: Typography.fontSize.sm,
    color: Colors.charcoalInk,
  },
  itemQty: {
    fontFamily: 'DMSans-Regular',
    fontSize: 10,
    color: Colors.mutedSienna,
    marginTop: 2,
  },
  itemPrice: {
    fontFamily: 'DMMono-Regular',
    fontSize: Typography.fontSize.sm,
    color: Colors.primaryRust,
    marginTop: 4,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.softAsh,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.paleParchment,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.softAsh,
  },
  contactText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 11,
    color: Colors.primaryRust,
    marginLeft: 6,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontFamily: 'DMSans-Medium',
    fontSize: Typography.fontSize.base,
    color: Colors.mutedSienna,
    marginTop: Spacing.md,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Spacing.sm,
  },
  detailsText: {
    fontFamily: 'DMSans-Bold',
    fontSize: Typography.fontSize.sm,
    color: Colors.primaryRust,
    marginRight: 4,
  },
});
