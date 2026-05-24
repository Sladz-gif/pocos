import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, Radius } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import { PCard, PInput, PButton, PChip } from '../../components/ui';
import { StackNavigationProp } from '@react-navigation/stack';
import { StoreStackParamList } from '../../navigation/types';
import { useMarketplaceStore } from '../../store/marketplaceStore';
import { useAuthStore } from '../../store/authStore';

type AddDiscountScreenProps = {
  navigation: StackNavigationProp<StoreStackParamList, 'AddDiscount'>;
};

export const AddDiscountScreen: React.FC<AddDiscountScreenProps> = ({ navigation }) => {
  const { addDiscount } = useMarketplaceStore();
  const { ranch } = useAuthStore();
  
  const [form, setForm] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: '',
    minAmount: '',
    expiryDate: '',
  });

  const handleSave = async () => {
    if (!form.code || !form.value) {
      Alert.alert('Error', 'Please enter a code and value');
      return;
    }

    if (!ranch?.id) return;

    try {
      await addDiscount({
        code: form.code.toUpperCase(),
        type: form.type,
        value: parseFloat(form.value),
        minAmount: form.minAmount ? parseFloat(form.minAmount) : 0,
        expiryDate: form.expiryDate || null,
      }, ranch.id);
      
      Alert.alert('Success', 'Discount code created successfully.');
      navigation.goBack();
    } catch (error) {
      console.error('Failed to create discount:', error);
      Alert.alert('Error', 'Failed to create discount code.');
    }
  };

  const generateRandomCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setForm({ ...form, code });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.charcoalInk} />
        </TouchableOpacity>
        <Text style={styles.title}>New Discount</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <PCard style={styles.formCard}>
          <View style={styles.codeInputRow}>
            <PInput
              label="Promo Code"
              placeholder="e.g., SUMMER20"
              value={form.code}
              onChangeText={(text) => setForm({ ...form, code: text })}
              containerStyle={{ flex: 1, marginRight: Spacing.sm }}
            />
            <TouchableOpacity style={styles.generateBtn} onPress={generateRandomCode}>
              <Ionicons name="refresh-outline" size={20} color={Colors.primaryRust} />
              <Text style={styles.generateText}>Auto</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Discount Type</Text>
          <View style={styles.typeContainer}>
            <PChip 
              label="Percentage (%)" 
              selected={form.type === 'percentage'} 
              onPress={() => setForm({ ...form, type: 'percentage' })}
            />
            <PChip 
              label="Fixed Amount (GHS)" 
              selected={form.type === 'fixed'} 
              onPress={() => setForm({ ...form, type: 'fixed' })}
            />
          </View>

          <PInput
            label="Discount Value"
            placeholder={form.type === 'percentage' ? "e.g., 20" : "e.g., 50"}
            value={form.value}
            onChangeText={(text) => setForm({ ...form, value: text })}
            keyboardType="numeric"
            suffix={form.type === 'percentage' ? '%' : 'GHS'}
          />

          <PInput
            label="Minimum Order Amount (Optional)"
            placeholder="e.g., 200"
            value={form.minAmount}
            onChangeText={(text) => setForm({ ...form, minAmount: text })}
            keyboardType="numeric"
            suffix="GHS"
          />

          <PInput
            label="Expiry Date (Optional)"
            placeholder="YYYY-MM-DD"
            value={form.expiryDate}
            onChangeText={(text) => setForm({ ...form, expiryDate: text })}
          />
        </PCard>

        <PButton 
          title="Create Discount Code" 
          onPress={handleSave} 
          style={styles.saveBtn}
        />
        <View style={{ height: 40 }} />
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
    justifyContent: 'space-between',
    alignItems: 'center',
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
  content: {
    padding: Spacing.xl,
  },
  formCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  codeInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: Spacing.md,
  },
  generateBtn: {
    backgroundColor: Colors.warmSand,
    paddingHorizontal: Spacing.md,
    height: 52,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  generateText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 10,
    color: Colors.primaryRust,
    textTransform: 'uppercase',
  },
  label: {
    fontFamily: 'DMSans-Bold',
    fontSize: Typography.fontSize.sm,
    color: Colors.charcoalInk,
    marginBottom: Spacing.sm,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  saveBtn: {
    marginTop: Spacing.md,
  },
});
