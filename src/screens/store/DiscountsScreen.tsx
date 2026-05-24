import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, Radius } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import { PCard, PBadge, PButton, PEmptyState, PModal } from '../../components/ui';
import { StackNavigationProp } from '@react-navigation/stack';
import { StoreStackParamList } from '../../navigation/types';
import { useMarketplaceStore } from '../../store/marketplaceStore';
import { useAuthStore } from '../../store/authStore';

type DiscountsScreenProps = {
  navigation: StackNavigationProp<StoreStackParamList, 'Discounts'>;
};

export const DiscountsScreen: React.FC<DiscountsScreenProps> = ({ navigation }) => {
  const { discounts, fetchDiscounts, isLoading, deleteDiscount } = useMarketplaceStore();
  const { ranch } = useAuthStore();
  
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [discountToDelete, setDiscountToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (ranch?.id) {
      fetchDiscounts(ranch.id);
    }
  }, [ranch?.id, fetchDiscounts]);

  const handleDelete = async () => {
    if (!discountToDelete) return;
    try {
      await deleteDiscount(discountToDelete);
      setIsDeleteModalVisible(false);
      setDiscountToDelete(null);
      Alert.alert('Success', 'Discount deleted successfully.');
    } catch (error) {
      Alert.alert('Error', 'Failed to delete discount.');
    }
  };

  const renderDiscount = ({ item }: { item: any }) => (
    <PCard style={styles.discountCard}>
      <View style={styles.discountHeader}>
        <View>
          <Text style={styles.discountCode}>{item.code}</Text>
          <Text style={styles.discountType}>{item.type} • {item.value}{item.type === 'percentage' ? '%' : ''} off</Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: Spacing.sm }}>
          <PBadge 
            text={item.status} 
            variant={item.status === 'active' ? 'success' : 'neutral'} 
          />
          <TouchableOpacity 
            onPress={() => {
              setDiscountToDelete(item.id);
              setIsDeleteModalVisible(true);
            }}
          >
            <Ionicons name="trash-outline" size={20} color={Colors.errorRed} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.discountFooter}>
        <Text style={styles.usageText}>Used {item.usage_count || 0} times</Text>
        <TouchableOpacity>
          <Text style={styles.editLink}>Edit</Text>
        </TouchableOpacity>
      </View>
    </PCard>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.charcoalInk} />
        </TouchableOpacity>
        <Text style={styles.title}>Promotions</Text>
        <TouchableOpacity onPress={() => navigation.navigate('AddDiscount' as any)}>
          <Ionicons name="add" size={24} color={Colors.primaryRust} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={discounts}
        renderItem={renderDiscount}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !isLoading ? (
            <PEmptyState 
              title="No active promotions" 
              message="Create discount codes to attract more buyers to your ranch store."
              icon="pricetag-outline"
            />
          ) : null
        }
      />

      {/* Delete Confirmation Modal */}
      <PModal
        visible={isDeleteModalVisible}
        onClose={() => setIsDeleteModalVisible(false)}
        title="Delete Discount"
      >
        <View style={styles.modalContent}>
          <Text style={styles.deleteText}>Are you sure you want to delete this discount code? This action cannot be undone.</Text>
          <View style={styles.modalButtons}>
            <PButton title="Cancel" variant="outline" onPress={() => setIsDeleteModalVisible(false)} style={{ flex: 1 }} />
            <PButton title="Delete" variant="danger" onPress={handleDelete} style={{ flex: 1 }} />
          </View>
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
    borderBottomWidth: 1,
    borderBottomColor: Colors.softAsh,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: Typography.fontSize.xl,
    color: Colors.charcoalInk,
  },
  listContent: {
    padding: Spacing.xl,
  },
  discountCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  discountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  discountCode: {
    fontFamily: 'DMMono-Regular',
    fontSize: Typography.fontSize.lg,
    color: Colors.charcoalInk,
    fontWeight: 'bold',
  },
  discountType: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.xs,
    color: Colors.mutedSienna,
    marginTop: 2,
  },
  discountFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.softAsh,
  },
  usageText: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.xs,
    color: Colors.mutedSienna,
  },
  editLink: {
    fontFamily: 'DMSans-Bold',
    fontSize: Typography.fontSize.sm,
    color: Colors.primaryRust,
  },
  modalContent: {
    padding: Spacing.md,
  },
  deleteText: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.base,
    color: Colors.charcoalInk,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
});
