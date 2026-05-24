import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, Radius } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import { PInput, PButton, PCard, PChip } from '../../components/ui';
import { StackNavigationProp } from '@react-navigation/stack';
import { AdminStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../store/authStore';

type OnboardStaffScreenProps = {
  navigation: StackNavigationProp<AdminStackParamList, 'OnboardStaff'>;
};

const ROLES = ['staff', 'store_manager', 'super_admin'];

export const OnboardStaffScreen: React.FC<OnboardStaffScreenProps> = ({ navigation }) => {
  const { onboardStaff, isLoading } = useAuthStore();
  const [name, setName] = useState('');
  const [role, setRole] = useState('staff');
  const [accessCode, setAccessCode] = useState('');

  // Auto-generate code on mount
  useEffect(() => {
    generateNewCode();
  }, []);

  const generateNewCode = () => {
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    const timestampPart = Date.now().toString(36).slice(-2).toUpperCase();
    setAccessCode(`STAFF-${randomPart}${timestampPart}`);
  };

  const handleOnboard = async () => {
    if (!name.trim() || !accessCode) return;
    
    try {
      await onboardStaff(name.trim(), role, accessCode);
      Alert.alert('Success', `Staff member ${name} onboarded with code ${accessCode}`);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to onboard staff member.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.charcoalInk} />
        </TouchableOpacity>
        <Text style={styles.title}>Onboard Staff</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.content}>
          <View style={styles.form}>
            <PInput 
              label="Staff Full Name" 
              placeholder="e.g. John Doe" 
              value={name}
              onChangeText={setName}
            />

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Role Assignment</Text>
              <View style={styles.chipRow}>
                {ROLES.map(r => (
                  <PChip 
                    key={r} 
                    label={r === 'super_admin' ? 'ADMIN' : r.replace('_', ' ').toUpperCase()} 
                    selected={role === r}
                    onPress={() => setRole(r)}
                  />
                ))}
              </View>
              <Text style={styles.roleDesc}>
                {role === 'staff' && 'Can manage livestock and tasks. No store or admin access.'}
                {role === 'store_manager' && 'Can manage livestock, tasks, and the ranch store.'}
                {role === 'super_admin' && 'Full access to all ranch operations and admin panel.'}
              </Text>
            </View>

            <View style={styles.codeSection}>
              <View style={styles.codeHeader}>
                <Text style={styles.sectionLabel}>Staff Access Code</Text>
                <TouchableOpacity onPress={generateNewCode}>
                  <Text style={styles.regenerateText}>Regenerate</Text>
                </TouchableOpacity>
              </View>
              <PInput 
                placeholder="e.g. AB1234 (Letters and Numbers)" 
                value={accessCode}
                onChangeText={setAccessCode}
                autoCapitalize="characters"
              />
              <Text style={styles.codeHint}>The staff member will use their name and this code to sign in.</Text>
            </View>

            <PButton 
              title="Confirm Onboarding" 
              onPress={handleOnboard} 
              style={styles.submitButton}
              disabled={!name || !accessCode}
              loading={isLoading}
            />
          </View>
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
  content: {
    flex: 1,
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
  form: {
    padding: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionLabel: {
    fontFamily: 'DMSans-Medium',
    fontSize: Typography.fontSize.sm,
    color: Colors.charcoalInk,
    marginBottom: Spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  roleDesc: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.xs,
    color: Colors.mutedSienna,
    lineHeight: 18,
  },
  codeSection: {
    marginBottom: Spacing['2xl'],
  },
  codeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  regenerateText: {
    fontFamily: 'DMSans-Bold',
    fontSize: Typography.fontSize.xs,
    color: Colors.primaryRust,
  },
  codeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.xl,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: Colors.primaryRust,
  },
  codeText: {
    fontFamily: 'DMMono-Medium',
    fontSize: 24,
    color: Colors.charcoalInk,
    letterSpacing: 2,
  },
  codeHint: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.xs,
    color: Colors.mutedSienna,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  submitButton: {
    marginTop: Spacing.xl,
    marginBottom: Spacing['4xl'],
  },
});
