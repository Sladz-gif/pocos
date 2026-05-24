import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, Radius } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import { PCard, PButton, PModal, PInput } from '../../components/ui';
import { StackNavigationProp } from '@react-navigation/stack';
import { ProfileStackParamList } from '../../navigation/types';
import { useMarketplaceStore } from '../../store/marketplaceStore';
import { useAuthStore } from '../../store/authStore';

type DeliveryAddressesScreenProps = {
  navigation: StackNavigationProp<ProfileStackParamList, 'DeliveryAddresses'>;
};

export const DeliveryAddressesScreen: React.FC<DeliveryAddressesScreenProps> = ({ navigation }) => {
  const { user } = useAuthStore();
  const { deliveryAddresses, fetchDeliveryAddresses, addDeliveryAddress, updateDeliveryAddress, deleteDeliveryAddress } = useMarketplaceStore();

  useEffect(() => {
    if (user?.id) {
      fetchDeliveryAddresses(user.id);
    }
  }, [user?.id, fetchDeliveryAddresses]);

  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any | null>(null);
  const [form, setForm] = useState({
    label: '',
    street: '',
    city: '',
    region: '',
  });

  const handleAdd = () => {
    setEditingAddress(null);
    setForm({ label: '', street: '', city: '', region: '' });
    setShowModal(true);
  };

  const handleEdit = (address: any) => {
    setEditingAddress(address);
    setForm({
      label: address.label,
      street: address.street,
      city: address.city,
      region: address.region,
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Address', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive', 
        onPress: async () => {
          try {
            await deleteDeliveryAddress(id);
          } catch (error) {
            Alert.alert('Error', 'Failed to delete address');
          }
        } 
      },
    ]);
  };

  const handleSave = async () => {
    if (!form.label || !form.street || !form.city) {
      return Alert.alert('Error', 'Please fill in all required fields');
    }

    if (!user?.id) return;

    try {
      if (editingAddress) {
        await updateDeliveryAddress(editingAddress.id, form);
      } else {
        await addDeliveryAddress({
          ...form,
          is_default: deliveryAddresses.length === 0,
        }, user.id);
      }
      setShowModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to save address');
    }
  };

  const setAsDefault = async (id: string) => {
    try {
      // Simple implementation: set all to false, then one to true
      // In a more complex app, this would be a single transaction or separate action
      for (const addr of deliveryAddresses) {
        if (addr.is_default) {
          await updateDeliveryAddress(addr.id, { is_default: false });
        }
      }
      await updateDeliveryAddress(id, { is_default: true });
    } catch (error) {
      Alert.alert('Error', 'Failed to update default address');
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <PCard style={styles.addressCard}>
      <View style={styles.addressHeader}>
        <View style={styles.labelRow}>
          <Text style={styles.addressLabel}>{item.label}</Text>
          {item.is_default && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultText}>Default</Text>
            </View>
          )}
        </View>
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => handleEdit(item)} style={styles.actionButton}>
            <Ionicons name="create-outline" size={20} color={Colors.mutedSienna} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.actionButton}>
            <Ionicons name="trash-outline" size={20} color={Colors.dangerCrimson} />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.addressText}>{item.street}</Text>
      <Text style={styles.addressText}>{item.city}, {item.region}</Text>
      {!item.is_default && (
        <TouchableOpacity onPress={() => setAsDefault(item.id)} style={styles.setDefaultButton}>
          <Text style={styles.setDefaultText}>Set as default</Text>
        </TouchableOpacity>
      )}
    </PCard>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.charcoalInk} />
        </TouchableOpacity>
        <Text style={styles.title}>Delivery Addresses</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={deliveryAddresses}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="location-outline" size={64} color={Colors.softAsh} />
            <Text style={styles.emptyText}>No addresses saved yet</Text>
          </View>
        }
      />

      <View style={styles.footer}>
        <PButton title="Add New Address" onPress={handleAdd} />
      </View>

      <PModal 
        visible={showModal} 
        onClose={() => setShowModal(false)}
        title={editingAddress ? 'Edit Address' : 'New Address'}
      >
        <PInput 
          label="Label (e.g. Home, Office)"
          value={form.label}
          onChangeText={text => setForm({ ...form, label: text })}
        />
        <PInput 
          label="Street Address"
          value={form.street}
          onChangeText={text => setForm({ ...form, street: text })}
        />
        <PInput 
          label="City"
          value={form.city}
          onChangeText={text => setForm({ ...form, city: text })}
        />
        <PInput 
          label="Region"
          value={form.region}
          onChangeText={text => setForm({ ...form, region: text })}
        />
        <PButton title="Save Address" onPress={handleSave} style={styles.modalButton} />
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: Colors.softAsh,
  },
  title: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: Typography.fontSize.xl,
    color: Colors.charcoalInk,
  },
  list: {
    padding: Spacing.xl,
  },
  addressCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressLabel: {
    fontFamily: 'DMSans-Bold',
    fontSize: Typography.fontSize.base,
    color: Colors.charcoalInk,
    marginRight: Spacing.sm,
  },
  defaultBadge: {
    backgroundColor: Colors.successMoss,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  defaultText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'DMSans-Bold',
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: Spacing.md,
  },
  addressText: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.sm,
    color: Colors.mutedSienna,
    marginBottom: 2,
  },
  setDefaultButton: {
    marginTop: Spacing.md,
    paddingVertical: 4,
  },
  setDefaultText: {
    fontFamily: 'DMSans-Bold',
    fontSize: Typography.fontSize.xs,
    color: Colors.primaryRust,
  },
  footer: {
    padding: Spacing.xl,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: Colors.softAsh,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    fontFamily: 'DMSans-Medium',
    fontSize: Typography.fontSize.base,
    color: Colors.mutedSienna,
    marginTop: Spacing.md,
  },
  modalButton: {
    marginTop: Spacing.xl,
  },
});
