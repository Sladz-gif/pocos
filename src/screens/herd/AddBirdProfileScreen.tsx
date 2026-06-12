import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, Radius } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import { PInput, PButton } from '../../components/ui';
import { StackNavigationProp } from '@react-navigation/stack';
import { HerdStackParamList } from '../../navigation/types';
import { useLivestockStore } from '../../store/livestockStore';
import { useAuthStore } from '../../store/authStore';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';

type AddBirdProfileScreenProps = {
  navigation: StackNavigationProp<HerdStackParamList, 'AddBirdProfile'>;
};

interface Cage {
  id: string;
  cageName: string;
  birdCount: string;
  feedingType: string;
  medicationName?: string;
  wearOffDate?: Date;
}

export const AddBirdProfileScreen: React.FC<AddBirdProfileScreenProps> = ({ navigation }) => {
  const { addAnimal } = useLivestockStore();
  const { ranch } = useAuthStore();
  
  const [profileName, setProfileName] = useState('');
  const [cages, setCages] = useState<Cage[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddCage = () => {
    const newCage: Cage = {
      id: uuidv4(),
      cageName: '',
      birdCount: '',
      feedingType: '',
    };
    setCages([...cages, newCage]);
  };

  const handleUpdateCage = (id: string, field: keyof Cage, value: string | Date | undefined) => {
    setCages(cages.map(cage => 
      cage.id === id ? { ...cage, [field]: value } : cage
    ));
  };

  const handleRemoveCage = (id: string) => {
    setCages(cages.filter(cage => cage.id !== id));
  };

  const handleSave = async () => {
    if (!profileName.trim()) {
      Alert.alert('Error', 'Profile name is required');
      return;
    }

    if (cages.length === 0) {
      Alert.alert('Error', 'Please add at least one cage/coup');
      return;
    }

    if (!ranch?.id) {
      Alert.alert('Error', 'No ranch context found');
      return;
    }

    // Validate cages
    for (const cage of cages) {
      if (!cage.cageName.trim()) {
        Alert.alert('Error', 'All cages must have a name');
        return;
      }
      if (!cage.birdCount.trim()) {
        Alert.alert('Error', 'All cages must have a bird count');
        return;
      }
      if (!cage.feedingType.trim()) {
        Alert.alert('Error', 'All cages must have a feeding type');
        return;
      }
    }

    try {
      setIsSubmitting(true);
      
      // Create the bird profile
      await addAnimal({
        animalId: profileName.trim(),
        breed: 'Bird',
        sex: 'female',
        healthStatus: 'healthy',
        animalType: 'bird',
      }, ranch.id);

      Alert.alert('Success', 'Bird profile created successfully');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCage = (cage: Cage) => (
    <View key={cage.id} style={styles.cageCard}>
      <View style={styles.cageHeader}>
        <Text style={styles.cageTitle}>Cage/Coup {cages.indexOf(cage) + 1}</Text>
        <TouchableOpacity onPress={() => handleRemoveCage(cage.id)}>
          <Ionicons name="trash-outline" size={20} color={Colors.primaryRust} />
        </TouchableOpacity>
      </View>

      <PInput
        label="Cage/Cage Name or Number"
        placeholder="e.g. Cage A-1"
        value={cage.cageName}
        onChangeText={(value) => handleUpdateCage(cage.id, 'cageName', value)}
      />

      <PInput
        label="Number of Birds"
        placeholder="e.g. 25"
        keyboardType="numeric"
        value={cage.birdCount}
        onChangeText={(value) => handleUpdateCage(cage.id, 'birdCount', value)}
      />

      <PInput
        label="Feeding Type"
        placeholder="e.g. Layer feed, Scratch"
        value={cage.feedingType}
        onChangeText={(value) => handleUpdateCage(cage.id, 'feedingType', value)}
      />

      <PInput
        label="Medication Name (Optional)"
        placeholder="e.g. Antibiotic X"
        value={cage.medicationName || ''}
        onChangeText={(value) => handleUpdateCage(cage.id, 'medicationName', value)}
      />

      {cage.medicationName && (
        <PInput
          label="Wear-off Date/Time (Optional)"
          value={cage.wearOffDate ? format(cage.wearOffDate, 'MMMM d, yyyy h:mm a') : ''}
          placeholder="Select date and time"
          onPress={() => {
            // Would need date picker implementation here
            Alert.alert('Info', 'Date picker would open here');
          }}
          editable={false}
        />
      )}
    </View>
  );

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

            <View style={styles.cagesSection}>
              <View style={styles.cagesHeader}>
                <Text style={styles.cagesTitle}>Cages/Coups</Text>
                <TouchableOpacity style={styles.addCageButton} onPress={handleAddCage}>
                  <Ionicons name="add" size={20} color="#FFFFFF" />
                  <Text style={styles.addCageText}>Add Cage</Text>
                </TouchableOpacity>
              </View>

              {cages.map(renderCage)}

              {cages.length === 0 && (
                <View style={styles.emptyCages}>
                  <Ionicons name="grid-outline" size={48} color={Colors.softAsh} />
                  <Text style={styles.emptyCagesText}>No cages added yet</Text>
                  <TouchableOpacity style={styles.addFirstCageButton} onPress={handleAddCage}>
                    <Text style={styles.addFirstCageText}>Add First Cage</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <PButton
              title={isSubmitting ? "Creating..." : "Create Profile"}
              onPress={handleSave}
              style={styles.submitButton}
              loading={isSubmitting}
              disabled={!profileName.trim() || cages.length === 0}
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
  cagesSection: {
    marginTop: Spacing.xl,
  },
  cagesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  cagesTitle: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: Typography.fontSize.lg,
    color: Colors.charcoalInk,
  },
  addCageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryRust,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    gap: Spacing.xs,
  },
  addCageText: {
    fontFamily: 'DMSans-Medium',
    fontSize: Typography.fontSize.sm,
    color: '#FFFFFF',
  },
  cageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.softAsh,
  },
  cageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  cageTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: Typography.fontSize.base,
    color: Colors.charcoalInk,
  },
  emptyCages: {
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
    borderWidth: 2,
    borderColor: Colors.softAsh,
    borderRadius: Radius.lg,
    borderStyle: 'dashed',
  },
  emptyCagesText: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.base,
    color: Colors.mutedSienna,
    marginTop: Spacing.md,
  },
  addFirstCageButton: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.primaryRust,
    borderRadius: Radius.md,
  },
  addFirstCageText: {
    fontFamily: 'DMSans-Medium',
    fontSize: Typography.fontSize.sm,
    color: '#FFFFFF',
  },
  submitButton: {
    marginTop: Spacing.xl,
    marginBottom: Spacing['3xl'],
  },
});
