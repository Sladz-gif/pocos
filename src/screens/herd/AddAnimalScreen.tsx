import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, Radius } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import { PInput, PButton, PChip, ImagePickerField } from '../../components/ui';
import { StackNavigationProp } from '@react-navigation/stack';
import { HerdStackParamList } from '../../navigation/types';
import { useLivestockStore } from '../../store/livestockStore';
import { useAuthStore } from '../../store/authStore';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { format } from 'date-fns';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

type AddAnimalScreenProps = {
  navigation: StackNavigationProp<HerdStackParamList, 'AddAnimal'>;
};

export const AddAnimalScreen: React.FC<AddAnimalScreenProps> = ({ navigation }) => {
  const { addAnimal, animals } = useLivestockStore();
  const { ranch } = useAuthStore();
  
  // Story 3.1: Auto-generated ID (AS-XXXX)
  const generateId = () => {
    const nextNum = animals.length + 1;
    return `AS-${nextNum.toString().padStart(3, '0')}`;
  };

  const [animalId, setAnimalId] = useState(generateId());
  const [breed, setBreed] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('female');
  const [healthStatus, setHealthStatus] = useState<'healthy' | 'sick' | 'pregnant'>('healthy');
  const [weight, setWeight] = useState('');
  const [birthDate, setBirthDate] = useState(new Date());
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [notes, setNotes] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const [isSpecialFeeding, setIsSpecialFeeding] = useState(false);
  const [specialFeedingName, setSpecialFeedingName] = useState('');
  const [isMedicated, setIsMedicated] = useState(false);
  const [medicationName, setMedicationName] = useState('');
  const [medicationDate, setMedicationDate] = useState(new Date());
  
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isMedDatePickerVisible, setMedDatePickerVisibility] = useState(false);
  const [isDueDatePickerVisible, setDueDatePickerVisibility] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    if (!animalId.trim()) {
      Alert.alert('Error', 'Animal ID is required');
      return;
    }

    if (!ranch?.id) {
      Alert.alert('Error', 'No ranch context found');
      return;
    }

    try {
      setIsSubmitting(true);
      await addAnimal({
        animalId: animalId.trim(),
        breed: breed.trim(),
        sex: gender,
        healthStatus,
        weight: weight ? parseFloat(weight) : undefined,
        birthDate: format(birthDate, 'yyyy-MM-dd'),
        dueDate: dueDate ? format(dueDate, 'yyyy-MM-dd') : undefined,
        image_url: imageUrl,
        isSpecialFeeding,
        specialFeedingName: isSpecialFeeding ? specialFeedingName : undefined,
        isMedicated,
        medicationName: isMedicated ? medicationName : undefined,
        medicationDate: isMedicated ? format(medicationDate, 'yyyy-MM-dd') : undefined,
      }, ranch.id);

      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add animal');
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
        <Text style={styles.title}>Add New Animal</Text>
        <TouchableOpacity onPress={handleSave} disabled={isSubmitting || !animalId.trim()}>
          <Text style={[styles.saveText, (isSubmitting || !animalId.trim()) && { opacity: 0.5 }]}>Save</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.photoSection}>
            <ImagePickerField 
              label="Animal Photo"
              value={imageUrl}
              onChange={setImageUrl}
              folder="livestock"
              size={160}
            />
          </View>

          <View style={styles.form}>
            <PInput 
              label="Animal ID / Tag Number" 
              placeholder="e.g. AS-001" 
              value={animalId}
              onChangeText={setAnimalId}
              monospace
            />
            <PInput 
              label="Breed" 
              placeholder="e.g. Brahman" 
              value={breed}
              onChangeText={setBreed}
            />
            
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Gender</Text>
              <View style={styles.chipRow}>
                <PChip 
                  label="Female" 
                  selected={gender === 'female'} 
                  onPress={() => setGender('female')} 
                />
                <PChip 
                  label="Male" 
                  selected={gender === 'male'} 
                  onPress={() => setGender('male')} 
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Health Status</Text>
              <View style={styles.chipRow}>
                <PChip 
                  label="Healthy" 
                  selected={healthStatus === 'healthy'} 
                  onPress={() => setHealthStatus('healthy')} 
                />
                <PChip 
                  label="Sick" 
                  selected={healthStatus === 'sick'} 
                  onPress={() => setHealthStatus('sick')} 
                />
                {gender === 'female' && (
                  <PChip 
                    label="Pregnant" 
                    selected={healthStatus === 'pregnant'} 
                    onPress={() => setHealthStatus('pregnant')} 
                  />
                )}
              </View>
            </View>

            {/* Story 3.1: Conditional Due Date field with animation */}
            {healthStatus === 'pregnant' && (
              <Animated.View entering={FadeIn} exiting={FadeOut}>
                <PInput 
                  label="Estimated Due Date" 
                  value={dueDate ? format(dueDate, 'MMMM d, yyyy') : ''}
                  placeholder="Select date"
                  onPress={() => setDueDatePickerVisibility(true)}
                  editable={false}
                />
              </Animated.View>
            )}

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <PInput 
                  label="Weight" 
                  placeholder="e.g. 450" 
                  keyboardType="numeric" 
                  value={weight}
                  onChangeText={setWeight}
                  suffix="kg" // Story 3.1: Weight suffix
                />
              </View>
            </View>

            <PInput 
              label="Date of Birth" 
              value={format(birthDate, 'MMMM d, yyyy')}
              onPress={() => setDatePickerVisibility(true)}
              editable={false}
            />

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Special Feeding</Text>
            <View style={styles.chipRow}>
              <PChip 
                label="No" 
                selected={!isSpecialFeeding} 
                onPress={() => setIsSpecialFeeding(false)} 
              />
              <PChip 
                label="Yes" 
                selected={isSpecialFeeding} 
                onPress={() => setIsSpecialFeeding(true)} 
              />
            </View>
          </View>

          {isSpecialFeeding && (
            <Animated.View entering={FadeIn} exiting={FadeOut}>
              <PInput 
                label="Feeding Name" 
                placeholder="e.g. High Protein Mix" 
                value={specialFeedingName}
                onChangeText={setSpecialFeedingName}
              />
            </Animated.View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Medication</Text>
            <View style={styles.chipRow}>
              <PChip 
                label="No" 
                selected={!isMedicated} 
                onPress={() => setIsMedicated(false)} 
              />
              <PChip 
                label="Yes" 
                selected={isMedicated} 
                onPress={() => setIsMedicated(true)} 
              />
            </View>
          </View>

          {isMedicated && (
            <Animated.View entering={FadeIn} exiting={FadeOut}>
              <PInput 
                label="Medication Name" 
                placeholder="e.g. Vitamin B12" 
                value={medicationName}
                onChangeText={setMedicationName}
              />
              <PInput 
                label="Date of Medication" 
                value={format(medicationDate, 'MMMM d, yyyy')}
                onPress={() => setMedDatePickerVisibility(true)}
                editable={false}
              />
              <View style={styles.warningBox}>
                <Ionicons name="alert-circle" size={16} color={Colors.primaryRust} />
                <Text style={styles.warningText}>
                  Note: Wear-off period is 28 days. Safe for consumption after {format(new Date(medicationDate.getTime() + 28 * 24 * 60 * 60 * 1000), 'MMMM d, yyyy')}.
                </Text>
              </View>
            </Animated.View>
          )}

          <PInput 
            label="Notes" 
            placeholder="Additional details..." 
            multiline 
            numberOfLines={4} 
            value={notes}
            onChangeText={setNotes}
          />
          
          <PButton 
            title={isSubmitting ? "Registering..." : "Register Animal"} 
            onPress={handleSave} 
            style={styles.submitButton}
            loading={isSubmitting}
            disabled={!animalId.trim()}
          />
        </View>
      </ScrollView>

      <DateTimePickerModal
        isVisible={isMedDatePickerVisible}
        mode="date"
        onConfirm={(date) => {
          setMedicationDate(date);
          setMedDatePickerVisibility(false);
        }}
        onCancel={() => setMedDatePickerVisibility(false)}
        date={medicationDate}
      />

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={(date) => {
          setBirthDate(date);
          setDatePickerVisibility(false);
        }}
        onCancel={() => setDatePickerVisibility(false)}
        date={birthDate}
      />

      <DateTimePickerModal
        isVisible={isDueDatePickerVisible}
        mode="date"
        onConfirm={(date) => {
          setDueDate(date);
          setDueDatePickerVisibility(false);
        }}
        onCancel={() => setDueDatePickerVisibility(false)}
        date={dueDate || new Date()}
      />
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
  photoSection: {
    padding: Spacing.xl,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginBottom: Spacing.md,
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
    color: Colors.mutedSienna,
    marginBottom: Spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    flexWrap: 'wrap',
  },
  row: {
    flexDirection: 'row',
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(193, 68, 14, 0.05)',
    padding: Spacing.md,
    borderRadius: Radius.md,
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  warningText: {
    flex: 1,
    fontFamily: 'DMSans-Medium',
    fontSize: 12,
    color: Colors.primaryRust,
    lineHeight: 18,
  },
  submitButton: {
    marginTop: Spacing.xl,
    marginBottom: Spacing['3xl'],
  },
});