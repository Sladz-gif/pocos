import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, Radius } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import { PInput, PButton, ImagePickerField, PChip } from '../../components/ui';
import { StackNavigationProp } from '@react-navigation/stack';
import { AdminStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../store/authStore';

type ManageRanchProfileScreenProps = {
  navigation: StackNavigationProp<AdminStackParamList, 'ManageRanchProfile'>;
};

export const ManageRanchProfileScreen: React.FC<ManageRanchProfileScreenProps> = ({ navigation }) => {
  const { ranch, updateRanch, isLoading } = useAuthStore();
  
  const [form, setForm] = useState({
    name: '',
    location: '',
    description: '',
    contactEmail: '',
    contactPhone: '',
    website: '',
    currency: 'GHS',
    logo: '',
    coverImage: '',
  });

  useEffect(() => {
    if (ranch) {
      setForm({
        name: ranch.name || '',
        location: ranch.location || '',
        description: ranch.description || '',
        contactEmail: ranch.contactEmail || '',
        contactPhone: ranch.contactPhone || '',
        website: ranch.website || '',
        currency: ranch.currency || 'GHS',
        logo: ranch.logo || '',
        coverImage: ranch.coverImage || '',
      });
    }
  }, [ranch]);

  const currencies = [
    { label: 'GHS (₵)', value: 'GHS' },
    { label: 'USD ($)', value: 'USD' },
    { label: 'NGN (₦)', value: 'NGN' },
    { label: 'EUR (€)', value: 'EUR' },
    { label: 'GBP (£)', value: 'GBP' },
  ];

  const handleSave = async () => {
    if (!form.name.trim()) {
      return Alert.alert('Error', 'Ranch name is required');
    }

    try {
      await updateRanch(form);
      Alert.alert('Success', 'Ranch profile updated successfully.');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to update ranch profile.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.charcoalInk} />
        </TouchableOpacity>
        <Text style={styles.title}>Ranch Profile</Text>
        <TouchableOpacity onPress={handleSave} disabled={isLoading}>
          <Text style={[styles.saveText, isLoading && { opacity: 0.5 }]}>Save</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.mediaSection}>
            <Text style={styles.sectionLabel}>Branding</Text>
            <View style={styles.imagesRow}>
              <View style={{ flex: 1, marginRight: Spacing.md }}>
                <Text style={styles.fieldLabel}>Logo</Text>
                <ImagePickerField
                  value={form.logo}
                  onChange={(uri) => setForm({ ...form, logo: uri || '' })}
                  placeholder="Ranch Logo"
                  aspect={[1, 1]}
                  folder="logos"
                />
              </View>
              <View style={{ flex: 2 }}>
                <Text style={styles.fieldLabel}>Cover Image</Text>
                <ImagePickerField
                  value={form.coverImage}
                  onChange={(uri) => setForm({ ...form, coverImage: uri || '' })}
                  placeholder="Cover Photo"
                  aspect={[16, 9]}
                  folder="covers"
                />
              </View>
            </View>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.sectionLabel}>Basic Information</Text>
            <PInput
              label="Ranch Name"
              placeholder="e.g. Asante Farms"
              value={form.name}
              onChangeText={(text) => setForm({ ...form, name: text })}
            />
            <PInput
              label="Location"
              placeholder="e.g. Kumasi, Ashanti Region"
              value={form.location}
              onChangeText={(text) => setForm({ ...form, location: text })}
            />
            <PInput
              label="Description"
              placeholder="Tell buyers about your ranch, your history, and what you specialize in..."
              value={form.description}
              onChangeText={(text) => setForm({ ...form, description: text })}
              multiline
              numberOfLines={4}
              style={{ height: 100, textAlignVertical: 'top' }}
            />

            <View style={{ marginBottom: Spacing.xl }}>
              <Text style={{ 
                fontFamily: 'DMSans-Medium', 
                fontSize: Typography.fontSize.sm, 
                color: Colors.charcoalInk,
                marginBottom: Spacing.sm 
              }}>Ranch Currency</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm }}>
                {currencies.map((c) => (
                  <PChip
                    key={c.value}
                    label={c.label}
                    selected={form.currency === c.value}
                    onPress={() => setForm({ ...form, currency: c.value })}
                  />
                ))}
              </View>
            </View>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.sectionLabel}>Public Contact Info</Text>
            <PInput
              label="Contact Email"
              placeholder="e.g. info@asantefarms.com"
              value={form.contactEmail}
              onChangeText={(text) => setForm({ ...form, contactEmail: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <PInput
              label="Contact Phone"
              placeholder="e.g. +233 24 000 0000"
              value={form.contactPhone}
              onChangeText={(text) => setForm({ ...form, contactPhone: text })}
              keyboardType="phone-pad"
            />
            <PInput
              label="Website (Optional)"
              placeholder="e.g. www.asantefarms.com"
              value={form.website}
              onChangeText={(text) => setForm({ ...form, website: text })}
              keyboardType="url"
              autoCapitalize="none"
            />
          </View>

          <PButton
            title="Update Profile"
            onPress={handleSave}
            loading={isLoading}
            style={styles.submitButton}
          />
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
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
  saveText: {
    fontFamily: 'DMSans-Bold',
    fontSize: Typography.fontSize.base,
    color: Colors.primaryRust,
  },
  content: {
    flex: 1,
    padding: Spacing.xl,
  },
  mediaSection: {
    marginBottom: Spacing.xl,
  },
  sectionLabel: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: Typography.fontSize.lg,
    color: Colors.charcoalInk,
    marginBottom: Spacing.md,
  },
  imagesRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  fieldLabel: {
    fontFamily: 'DMSans-Medium',
    fontSize: Typography.fontSize.xs,
    color: Colors.mutedSienna,
    marginBottom: Spacing.xs,
  },
  formSection: {
    marginBottom: Spacing.xl,
  },
  submitButton: {
    marginTop: Spacing.md,
  },
});
