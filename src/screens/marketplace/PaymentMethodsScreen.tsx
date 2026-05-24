import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, Radius } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import { PCard, PButton, PModal, PInput, PChip } from '../../components/ui';
import { StackNavigationProp } from '@react-navigation/stack';
import { ProfileStackParamList } from '../../navigation/types';
import { useMarketplaceStore } from '../../store/marketplaceStore';
import { useAuthStore } from '../../store/authStore';

type PaymentMethodsScreenProps = {
  navigation: StackNavigationProp<ProfileStackParamList, 'PaymentMethods'>;
};

export const PaymentMethodsScreen: React.FC<PaymentMethodsScreenProps> = ({ navigation }) => {
  const { user } = useAuthStore();
  const { paymentMethods, fetchPaymentMethods, addPaymentMethod, deletePaymentMethod } = useMarketplaceStore();

  useEffect(() => {
    if (user?.id) {
      fetchPaymentMethods(user.id);
    }
  }, [user?.id, fetchPaymentMethods]);

  const [showModal, setShowModal] = useState(false);
  const [methodType, setMethodType] = useState<'card' | 'momo'>('card');
  const [form, setForm] = useState({
    provider: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
    phoneNumber: '',
  });

  const handleAdd = () => {
    setForm({ provider: '', cardNumber: '', expiry: '', cvv: '', phoneNumber: '' });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Remove Payment Method', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Remove', 
        style: 'destructive', 
        onPress: async () => {
          try {
            await deletePaymentMethod(id);
          } catch (error) {
            Alert.alert('Error', 'Failed to remove payment method');
          }
        } 
      },
    ]);
  };

  const handleSave = async () => {
    if (methodType === 'card' && (!form.cardNumber || !form.expiry)) {
      return Alert.alert('Error', 'Please fill in card details');
    }
    if (methodType === 'momo' && !form.phoneNumber) {
      return Alert.alert('Error', 'Please provide phone number');
    }

    if (!user?.id) return;

    try {
      await addPaymentMethod({
        type: methodType,
        provider: methodType === 'card' ? 'Visa' : 'Mobile Money',
        last_four: methodType === 'card' ? form.cardNumber.slice(-4) : undefined,
        phone_number: methodType === 'momo' ? form.phoneNumber : undefined,
        is_default: paymentMethods.length === 0,
      }, user.id);
      setShowModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to add payment method');
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <PCard style={styles.methodCard}>
      <View style={styles.methodIcon}>
        <Ionicons 
          name={item.type === 'card' ? 'card-outline' : 'phone-portrait-outline'} 
          size={24} 
          color={Colors.primaryRust} 
        />
      </View>
      <View style={styles.methodInfo}>
        <Text style={styles.methodLabel}>
          {item.type === 'card' ? `${item.provider} •••• ${item.last_four}` : `${item.provider} (${item.phone_number})`}
        </Text>
        {item.is_default && <Text style={styles.defaultText}>Default</Text>}
      </View>
      <TouchableOpacity onPress={() => handleDelete(item.id)}>
        <Ionicons name="trash-outline" size={20} color={Colors.dangerCrimson} />
      </TouchableOpacity>
    </PCard>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.charcoalInk} />
        </TouchableOpacity>
        <Text style={styles.title}>Payment Methods</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={paymentMethods}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="card-outline" size={64} color={Colors.softAsh} />
            <Text style={styles.emptyText}>No payment methods added</Text>
          </View>
        }
      />

      <View style={styles.footer}>
        <PButton title="Add Payment Method" onPress={handleAdd} />
      </View>

      <PModal 
        visible={showModal} 
        onClose={() => setShowModal(false)}
        title="Add Payment Method"
      >
        <View style={styles.typeSelector}>
          <PChip 
            label="Credit/Debit Card" 
            selected={methodType === 'card'} 
            onPress={() => setMethodType('card')} 
          />
          <PChip 
            label="Mobile Money" 
            selected={methodType === 'momo'} 
            onPress={() => setMethodType('momo')} 
          />
        </View>

        {methodType === 'card' ? (
          <View>
            <PInput 
              label="Card Number"
              placeholder="0000 0000 0000 0000"
              keyboardType="numeric"
              value={form.cardNumber}
              onChangeText={text => setForm({ ...form, cardNumber: text })}
            />
            <View style={styles.modalRow}>
              <View style={{ flex: 1, marginRight: Spacing.md }}>
                <PInput 
                  label="Expiry"
                  placeholder="MM/YY"
                  value={form.expiry}
                  onChangeText={text => setForm({ ...form, expiry: text })}
                />
              </View>
              <View style={{ flex: 1 }}>
                <PInput 
                  label="CVV"
                  placeholder="123"
                  keyboardType="numeric"
                  secureTextEntry
                  value={form.cvv}
                  onChangeText={text => setForm({ ...form, cvv: text })}
                />
              </View>
            </View>
          </View>
        ) : (
          <View>
            <PInput 
              label="Mobile Money Number"
              placeholder="e.g. 0244 000 000"
              keyboardType="phone-pad"
              value={form.phoneNumber}
              onChangeText={text => setForm({ ...form, phoneNumber: text })}
            />
          </View>
        )}

        <PButton title="Add Method" onPress={handleSave} style={styles.modalButton} />
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
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: Colors.warmSand,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.lg,
  },
  methodInfo: {
    flex: 1,
  },
  methodLabel: {
    fontFamily: 'DMSans-Bold',
    fontSize: Typography.fontSize.base,
    color: Colors.charcoalInk,
  },
  defaultText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 12,
    color: Colors.successMoss,
    marginTop: 2,
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
  typeSelector: {
    flexDirection: 'row',
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  modalRow: {
    flexDirection: 'row',
  },
  modalButton: {
    marginTop: Spacing.xl,
  },
});
