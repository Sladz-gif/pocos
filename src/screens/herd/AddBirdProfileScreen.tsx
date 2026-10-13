import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, Radius } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import { PInput, PButton } from '../../components/ui';
import { StackNavigationProp } from '@react-navigation/stack';
import { FlockStackParamList } from '../../navigation/types';
import { useProfileStore } from '../../store/profileStore';
import { useAuthStore } from '../../store/authStore';

type AddBirdProfileScreenProps = {
  navigation: StackNavigationProp<FlockStackParamList, 'AddBirdProfile'>;
};

export const AddBirdProfileScreen: React.FC<AddBirdProfileScreenProps> = ({ navigation }) => {
  const { addProfile } = useProfileStore();
  const { ranch } = useAuthStore();

  const [profileName, setProfileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    if (!profileName.trim()) {
      Alert.alert('Error', 'Profile name is required');
      return;
    }

    if (!ranch?.id) {
      Alert.alert('Error', 'No ranch context found');
      return;
    }

    try {
      setIsSubmitting(true);

      // Create the bird profile
      await addProfile({
        name: profileName.trim(),
        animalType: 'bird',
        ranchId: ranch.id,
      });

      Alert.alert('Success', 'Bird profile created successfully');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color={Colors.charcoalInk} />
        </TouchableOpacity>
        <Text style={styles.title}>Add Bird Profile</Text>
        <TouchableOpacity onPress={handleSave} disabled={isSubmitting}>
          <Text style={[styles.saveText, isSubmitting && { opacity: 0.5 }]}>Save</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            <PInput
              label="Profile Name"
              placeholder="e.g. Layer Flock A"
              value={profileName}
              onChangeText={setProfileName}
            />

            <PButton
              title={isSubmitting ? "Creating..." : "Create Profile"}
              onPress={handleSave}
              style={styles.submitButton}
              loading={isSubmitting}
              disabled={!profileName.trim()}
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
  saveText: {
    fontFamily: 'DMSans-Bold',
    fontSize: Typography.fontSize.base,
    color: Colors.primaryRust,
  },
  content: {
    flex: 1,
  },
  form: {
    padding: Spacing.xl,
  },
  submitButton: {
    marginTop: Spacing.xl,
    marginBottom: Spacing['3xl'],
  },
});
