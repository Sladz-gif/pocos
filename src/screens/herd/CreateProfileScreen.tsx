import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, Radius } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import { PInput, PButton } from '../../components/ui';
import { StackNavigationProp } from '@react-navigation/stack';
import { HerdStackParamList } from '../../navigation/types';
import { useProfileStore } from '../../store/profileStore';
import { useAuthStore } from '../../store/authStore';
import { AnimalType, CustomField } from '../../types/livestock';
import { v4 as uuidv4 } from 'uuid';

type CreateProfileScreenProps = {
  navigation: StackNavigationProp<HerdStackParamList, 'CreateProfile'>;
};

const ANIMAL_TYPES: { type: AnimalType; label: string }[] = [
  { type: 'cattle', label: 'Cattle' },
  { type: 'sheep', label: 'Sheep' },
  { type: 'goat', label: 'Goat' },
  { type: 'horse', label: 'Horse' },
  { type: 'donkey', label: 'Donkey' },
  { type: 'bird', label: 'Bird' },
];

export const CreateProfileScreen: React.FC<CreateProfileScreenProps> = ({ navigation }) => {
  const { addProfile } = useProfileStore();
  const { ranch } = useAuthStore();
  
  const [profileName, setProfileName] = useState('');
  const [selectedType, setSelectedType] = useState<AnimalType | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldType, setNewFieldType] = useState<'text' | 'number' | 'date' | 'boolean'>('text');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddCustomField = () => {
    if (!newFieldLabel.trim()) {
      Alert.alert('Error', 'Please enter a field label');
      return;
    }
    
    const newField: CustomField = {
      id: uuidv4(),
      label: newFieldLabel.trim(),
      fieldType: newFieldType,
      value: '',
    };
    
    setCustomFields([...customFields, newField]);
    setNewFieldLabel('');
    setNewFieldType('text');
  };

  const handleCustomFieldValueChange = (id: string, value: string | number | boolean) => {
    setCustomFields(customFields.map(field => 
      field.id === id ? { ...field, value } : field
    ));
  };

  const handleRemoveCustomField = (id: string) => {
    setCustomFields(customFields.filter(field => field.id !== id));
  };

  const handleSave = async () => {
    if (!profileName.trim()) {
      Alert.alert('Error', 'Profile name is required');
      return;
    }
    
    if (!selectedType) {
      Alert.alert('Error', 'Please select an animal type');
      return;
    }
    
    if (!ranch?.id) {
      Alert.alert('Error', 'No ranch context found');
      return;
    }

    try {
      setIsSubmitting(true);
      
      await addProfile({
        name: profileName.trim(),
        animalType: selectedType,
        ranchId: ranch.id,
        customFields,
      });

      Alert.alert('Success', 'Profile created successfully');
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
        <Text style={styles.title}>Create Profile</Text>
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
              placeholder="e.g. Poultry, Cattle Farm"
              value={profileName}
              onChangeText={setProfileName}
            />

            <Text style={styles.sectionTitle}>Animal Type</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setShowDropdown(!showDropdown)}
            >
              <Text style={styles.dropdownText}>
                {selectedType ? ANIMAL_TYPES.find(t => t.type === selectedType)?.label : 'Select animal type'}
              </Text>
              <Ionicons 
                name={showDropdown ? 'chevron-up' : 'chevron-down'} 
                size={20} 
                color={Colors.mutedSienna} 
              />
            </TouchableOpacity>

            {showDropdown && (
              <View style={styles.dropdownList}>
                {ANIMAL_TYPES.map((item) => (
                  <TouchableOpacity
                    key={item.type}
                    style={[
                      styles.dropdownItem,
                      selectedType === item.type && styles.dropdownItemSelected,
                    ]}
                    onPress={() => {
                      setSelectedType(item.type);
                      setShowDropdown(false);
                    }}
                  >
                    <Text style={[
                      styles.dropdownItemText,
                      selectedType === item.type && styles.dropdownItemTextSelected,
                    ]}>
                      {item.label}
                    </Text>
                    {selectedType === item.type && (
                      <Ionicons name="checkmark" size={20} color={Colors.primaryRust} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={styles.customFieldsSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Custom Fields</Text>
                <Text style={styles.sectionSubtitle}>Add extra fields for data you need to track</Text>
              </View>

              <View style={styles.addFieldContainer}>
                <View style={styles.fieldTitleInput}>
                  <Text style={styles.fieldTitleLabel}>Field Title</Text>
                  <PInput
                    placeholder="e.g. Vaccination Date"
                    value={newFieldLabel}
                    onChangeText={setNewFieldLabel}
                  />
                </View>
                
                <View style={styles.fieldTypeRow}>
                  <Text style={styles.fieldTypeLabel}>Field Type</Text>
                  <View style={styles.fieldTypeSelector}>
                    <TouchableOpacity
                      style={[styles.fieldTypeButton, newFieldType === 'text' && styles.fieldTypeButtonActive]}
                      onPress={() => setNewFieldType('text')}
                    >
                      <Text style={styles.fieldTypeText}>Text</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.fieldTypeButton, newFieldType === 'number' && styles.fieldTypeButtonActive]}
                      onPress={() => setNewFieldType('number')}
                    >
                      <Text style={styles.fieldTypeText}>Number</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.fieldTypeButton, newFieldType === 'date' && styles.fieldTypeButtonActive]}
                      onPress={() => setNewFieldType('date')}
                    >
                      <Text style={styles.fieldTypeText}>Date</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity style={styles.addFieldButton} onPress={handleAddCustomField}>
                  <Ionicons name="add" size={20} color="#FFFFFF" />
                  <Text style={styles.addButtonText}>Add Field</Text>
                </TouchableOpacity>
              </View>

              {customFields.map((field) => (
                <View key={field.id} style={styles.customFieldItem}>
                  <View style={styles.fieldHeader}>
                    <View style={styles.fieldTitleRow}>
                      <Text style={styles.fieldLabel}>{field.label}</Text>
                      <Text style={styles.fieldTypeBadge}>{field.fieldType}</Text>
                    </View>
                    <TouchableOpacity onPress={() => handleRemoveCustomField(field.id)}>
                      <Ionicons name="trash-outline" size={18} color={Colors.primaryRust} />
                    </TouchableOpacity>
                  </View>
                  {field.fieldType === 'text' && (
                    <PInput
                      placeholder={`Enter ${field.label}`}
                      value={field.value as string || ''}
                      onChangeText={(value) => handleCustomFieldValueChange(field.id, value)}
                    />
                  )}
                  {field.fieldType === 'number' && (
                    <PInput
                      placeholder={`Enter ${field.label}`}
                      value={field.value as string || ''}
                      onChangeText={(value) => handleCustomFieldValueChange(field.id, value)}
                      keyboardType="numeric"
                    />
                  )}
                  {field.fieldType === 'date' && (
                    <PInput
                      placeholder={`Enter ${field.label}`}
                      value={field.value as string || ''}
                      onChangeText={(value) => handleCustomFieldValueChange(field.id, value)}
                    />
                  )}
                  {field.fieldType === 'boolean' && (
                    <View style={styles.booleanSelector}>
                      <TouchableOpacity
                        style={[
                          styles.booleanOption,
                          field.value === true && styles.booleanOptionSelected,
                        ]}
                        onPress={() => handleCustomFieldValueChange(field.id, true)}
                      >
                        <Text style={[
                          styles.booleanOptionText,
                          field.value === true && styles.booleanOptionTextSelected,
                        ]}>Yes</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.booleanOption,
                          field.value === false && styles.booleanOptionSelected,
                        ]}
                        onPress={() => handleCustomFieldValueChange(field.id, false)}
                      >
                        <Text style={[
                          styles.booleanOptionText,
                          field.value === false && styles.booleanOptionTextSelected,
                        ]}>No</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))}
            </View>

            <PButton
              title={isSubmitting ? "Creating..." : "Create Profile"}
              onPress={handleSave}
              style={styles.submitButton}
              loading={isSubmitting}
              disabled={!profileName.trim() || !selectedType}
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
  sectionTitle: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: Typography.fontSize.lg,
    color: Colors.charcoalInk,
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  sectionSubtitle: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.sm,
    color: Colors.mutedSienna,
    marginBottom: Spacing.md,
  },
  sectionHeader: {
    marginBottom: Spacing.md,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.softAsh,
    marginBottom: Spacing.md,
  },
  dropdownText: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.base,
    color: Colors.charcoalInk,
  },
  dropdownList: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.softAsh,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.softAsh,
  },
  dropdownItemSelected: {
    backgroundColor: Colors.primaryRust + '10',
  },
  dropdownItemText: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.base,
    color: Colors.charcoalInk,
  },
  dropdownItemTextSelected: {
    fontFamily: 'DMSans-Medium',
    color: Colors.primaryRust,
  },
  customFieldsSection: {
    marginTop: Spacing.xl,
  },
  addFieldContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.softAsh,
    marginBottom: Spacing.md,
  },
  fieldTitleInput: {
    marginBottom: Spacing.md,
  },
  fieldTitleLabel: {
    fontFamily: 'DMSans-Medium',
    fontSize: Typography.fontSize.sm,
    color: Colors.charcoalInk,
    marginBottom: Spacing.xs,
  },
  fieldTypeRow: {
    marginBottom: Spacing.md,
  },
  fieldTypeLabel: {
    fontFamily: 'DMSans-Medium',
    fontSize: Typography.fontSize.sm,
    color: Colors.charcoalInk,
    marginBottom: Spacing.sm,
  },
  fieldTypeSelector: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  fieldTypeButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
    backgroundColor: Colors.softAsh,
  },
  fieldTypeButtonActive: {
    backgroundColor: Colors.primaryRust,
  },
  fieldTypeText: {
    fontFamily: 'DMSans-Medium',
    fontSize: Typography.fontSize.sm,
    color: Colors.charcoalInk,
  },
  addFieldButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryRust,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    gap: Spacing.xs,
  },
  addButtonText: {
    fontFamily: 'DMSans-Medium',
    fontSize: Typography.fontSize.sm,
    color: '#FFFFFF',
  },
  customFieldItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.softAsh,
  },
  fieldHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  fieldTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  fieldLabel: {
    fontFamily: 'DMSans-Medium',
    fontSize: Typography.fontSize.base,
    color: Colors.charcoalInk,
  },
  fieldTypeBadge: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.xs,
    color: Colors.mutedSienna,
    backgroundColor: Colors.softAsh,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
    textTransform: 'capitalize',
  },
  booleanSelector: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  booleanOption: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.sm,
    backgroundColor: Colors.softAsh,
    alignItems: 'center',
  },
  booleanOptionSelected: {
    backgroundColor: Colors.primaryRust,
  },
  booleanOptionText: {
    fontFamily: 'DMSans-Medium',
    fontSize: Typography.fontSize.sm,
    color: Colors.charcoalInk,
  },
  booleanOptionTextSelected: {
    color: '#FFFFFF',
  },
  submitButton: {
    marginTop: Spacing.xl,
    marginBottom: Spacing['3xl'],
  },
});
