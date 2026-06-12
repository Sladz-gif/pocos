import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, Radius } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import { PCard } from '../../components/ui';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { HerdStackParamList } from '../../navigation/types';
import { useProfileStore } from '../../store/profileStore';
import { useLivestockStore } from '../../store/livestockStore';

type ProfileDetailScreenProps = {
  navigation: StackNavigationProp<HerdStackParamList, 'ProfileDetail'>;
  route: RouteProp<HerdStackParamList, 'ProfileDetail'>;
};

export const ProfileDetailScreen: React.FC<ProfileDetailScreenProps> = ({ navigation, route }) => {
  const { profiles } = useProfileStore();
  const { animals } = useLivestockStore();
  const profile = profiles.find(p => p.id === route.params.id);

  const [profileAnimals, setProfileAnimals] = useState(animals.filter(a => a.animalType === profile?.animalType));

  useEffect(() => {
    if (profile) {
      setProfileAnimals(animals.filter(a => a.animalType === profile.animalType));
    }
  }, [profile, animals]);

  const handleAddAnimal = () => {
    navigation.navigate('AddAnimal');
  };

  const handleAnimalPress = (animalId: string) => {
    navigation.navigate('AnimalDetail', { id: animalId });
  };

  const getAnimalTypeIcon = (type: string): keyof typeof Ionicons.glyphMap => {
    const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
      cattle: 'paw',
      sheep: 'cloud',
      goat: 'leaf',
      horse: 'paw',
      donkey: 'paw',
      bird: 'leaf',
    };
    return icons[type] || 'paw';
  };

  const getAnimalTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      cattle: '#8B4513',
      sheep: '#D3D3D3',
      goat: '#A0522D',
      horse: '#654321',
      donkey: '#696969',
      bird: '#FF6347',
    };
    return colors[type] || '#8B4513';
  };

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Profile not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.charcoalInk} />
        </TouchableOpacity>
        <Text style={styles.title}>{profile.name}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color={Colors.charcoalInk} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <PCard style={styles.profileInfo}>
          <View style={styles.infoRow}>
            <View style={[styles.iconContainer, { backgroundColor: getAnimalTypeColor(profile.animalType) + '20' }]}>
              <Ionicons name={getAnimalTypeIcon(profile.animalType)} size={32} color={getAnimalTypeColor(profile.animalType)} />
            </View>
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Type</Text>
              <Text style={styles.infoValue}>{profile.animalType.charAt(0).toUpperCase() + profile.animalType.slice(1)}</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{profileAnimals.length}</Text>
              <Text style={styles.statLabel}>Animals</Text>
            </View>
            {profile.customFields && profile.customFields.length > 0 && (
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{profile.customFields.length}</Text>
                <Text style={styles.statLabel}>Custom Fields</Text>
              </View>
            )}
          </View>

          {profile.customFields && profile.customFields.length > 0 && (
            <View style={styles.customFieldsSection}>
              <Text style={styles.customFieldsTitle}>Custom Fields</Text>
              {profile.customFields.map((field) => (
                <View key={field.id} style={styles.customFieldItem}>
                  <Text style={styles.customFieldLabel}>{field.label}</Text>
                  <Text style={styles.customFieldType}>{field.fieldType}</Text>
                </View>
              ))}
            </View>
          )}
        </PCard>

        {profile.animalType === 'bird' && (
          <TouchableOpacity
            style={styles.birdCountButton}
            onPress={() => navigation.navigate('BirdCount', { profileId: profile.id })}
          >
            <Ionicons name="bar-chart" size={24} color="#FFFFFF" />
            <View style={styles.birdCountButtonContent}>
              <Text style={styles.birdCountButtonTitle}>View Bird Counts</Text>
              <Text style={styles.birdCountButtonSubtitle}>Live tracking & history</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        )}

        <View style={styles.animalsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Animals</Text>
            <TouchableOpacity style={styles.addButton} onPress={handleAddAnimal}>
              <Ionicons name="add" size={20} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>

          {profileAnimals.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="paw-outline" size={48} color={Colors.softAsh} />
              <Text style={styles.emptyText}>No animals added yet</Text>
              <TouchableOpacity style={styles.addFirstButton} onPress={handleAddAnimal}>
                <Text style={styles.addFirstButtonText}>Add First Animal</Text>
              </TouchableOpacity>
            </View>
          ) : (
            profileAnimals.map((animal) => (
              <TouchableOpacity
                key={animal.id}
                style={styles.animalCard}
                onPress={() => handleAnimalPress(animal.id)}
              >
                <View style={styles.animalHeader}>
                  <Text style={styles.animalId}>{animal.animalId || animal.tagNumber || 'No ID'}</Text>
                  <Ionicons name="chevron-forward" size={20} color={Colors.mutedSienna} />
                </View>
                <View style={styles.animalDetails}>
                  <Text style={styles.animalBreed}>{animal.breed}</Text>
                  <Text style={styles.animalStatus}>{animal.healthStatus}</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
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
    borderBottomWidth: 1,
    borderBottomColor: Colors.softAsh,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: Typography.fontSize.xl,
    color: Colors.charcoalInk,
  },
  content: {
    flex: 1,
    padding: Spacing.xl,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.base,
    color: Colors.mutedSienna,
  },
  profileInfo: {
    marginBottom: Spacing.xl,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  infoText: {
    flex: 1,
  },
  infoLabel: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.sm,
    color: Colors.mutedSienna,
  },
  infoValue: {
    fontFamily: 'DMSans-Bold',
    fontSize: Typography.fontSize.lg,
    color: Colors.charcoalInk,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.softAsh,
    borderBottomWidth: 1,
    borderBottomColor: Colors.softAsh,
    marginBottom: Spacing.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: Typography.fontSize['2xl'],
    color: Colors.primaryRust,
  },
  statLabel: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.sm,
    color: Colors.mutedSienna,
  },
  customFieldsSection: {
    marginTop: Spacing.md,
  },
  customFieldsTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: Typography.fontSize.base,
    color: Colors.charcoalInk,
    marginBottom: Spacing.sm,
  },
  customFieldItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.softAsh,
  },
  customFieldLabel: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.sm,
    color: Colors.charcoalInk,
  },
  customFieldType: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.sm,
    color: Colors.mutedSienna,
  },
  animalsSection: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: Typography.fontSize.xl,
    color: Colors.charcoalInk,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryRust,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    gap: Spacing.xs,
  },
  addButtonText: {
    fontFamily: 'DMSans-Medium',
    fontSize: Typography.fontSize.sm,
    color: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
    borderWidth: 2,
    borderColor: Colors.softAsh,
    borderRadius: Radius.lg,
    borderStyle: 'dashed',
  },
  emptyText: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.base,
    color: Colors.mutedSienna,
    marginTop: Spacing.md,
  },
  addFirstButton: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.primaryRust,
    borderRadius: Radius.md,
  },
  addFirstButtonText: {
    fontFamily: 'DMSans-Medium',
    fontSize: Typography.fontSize.sm,
    color: '#FFFFFF',
  },
  animalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.softAsh,
  },
  animalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  animalId: {
    fontFamily: 'DMSans-Bold',
    fontSize: Typography.fontSize.lg,
    color: Colors.charcoalInk,
  },
  animalDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  animalBreed: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.sm,
    color: Colors.mutedSienna,
  },
  animalStatus: {
    fontFamily: 'DMSans-Medium',
    fontSize: Typography.fontSize.sm,
    color: Colors.primaryRust,
  },
  birdCountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryRust,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  birdCountButtonContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  birdCountButtonTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: Typography.fontSize.base,
    color: '#FFFFFF',
  },
  birdCountButtonSubtitle: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
  },
});
