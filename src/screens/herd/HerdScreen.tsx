import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, Radius } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import { PCard, PBadge, PChip, PInput, PButton } from '../../components/ui';
import { StackNavigationProp } from '@react-navigation/stack';
import { FlockStackParamList } from '../../navigation/types';
import { useLivestockStore } from '../../store/livestockStore';
import { useProfileStore } from '../../store/profileStore';
import { useAuthStore } from '../../store/authStore';
import { Animal } from '../../types/livestock';

type HerdScreenProps = {
  navigation: StackNavigationProp<FlockStackParamList, 'Flock'>;
};

const CATEGORIES = ['All', 'Birds'];

export const HerdScreen: React.FC<HerdScreenProps> = ({ navigation }) => {
  const { animals, fetchAnimals, setSelectedAnimal } = useLivestockStore();
  const { profiles, fetchProfiles } = useProfileStore();
  const { ranch } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    if (ranch?.id) {
      fetchAnimals(ranch.id);
      fetchProfiles(ranch.id);
    }
  }, [ranch?.id, fetchAnimals, fetchProfiles]);

  // Calculate total bird count from all profiles
  const totalBirdCount = profiles.reduce((total, profile) => {
    if (profile.animalType === 'bird') {
      let cages: any[] = [];
      if (profile.customFields) {
        const cagesField = profile.customFields.find((f: any) => f.key === 'cages');
        if (cagesField) {
          try {
            cages = JSON.parse(cagesField.value);
          } catch (e) {
            console.error('Error parsing cages:', e);
          }
        }
      }
      const cageBirdCount = cages.reduce((sum: number, cage: any) => sum + (parseInt(cage.birdCount) || 0), 0);
      return total + cageBirdCount;
    }
    return total;
  }, 0);

  const filteredAnimals = animals.filter(animal => {
    const matchesSearch = animal.animalId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         animal.tagNumber?.toLowerCase().includes(searchQuery.toLowerCase());
    return false; // No animals in poultry-only app
  });

  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch = profile.name?.toLowerCase().includes(searchQuery.toLowerCase());
    if (selectedCategory === 'All') return matchesSearch && profile.animalType === 'bird';
    if (selectedCategory === 'Birds') return matchesSearch && profile.animalType === 'bird';
    return false;
  });

  const renderProfile = ({ item }: { item: any }) => {
    let cages: any[] = [];
    if (item.customFields) {
      const cagesField = item.customFields.find((f: any) => f.key === 'cages');
      if (cagesField) {
        try {
          cages = JSON.parse(cagesField.value);
        } catch (e) {
          console.error('Error parsing cages:', e);
        }
      }
    }
    const cageBirdCount = cages.reduce((sum: number, cage: any) => sum + (parseInt(cage.birdCount) || 0), 0);

    return (
      <TouchableOpacity
        onPress={() => {
          navigation.navigate('BirdProfileDetail', { id: item.id });
        }}
      >
        <PCard style={styles.animalCard}>
          <View style={styles.animalInfo}>
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="egg-outline" size={30} color={Colors.primaryRust} />
            </View>
            <View style={styles.details}>
              <Text style={styles.animalName}>{item.name}</Text>
              <Text style={styles.breedText}>Bird Profile • {cageBirdCount} birds</Text>
            </View>
          </View>
          <View style={styles.profileActions}>
            <TouchableOpacity
              style={styles.actionIconSmall}
              onPress={(e) => {
                e.stopPropagation();
                navigation.navigate('BirdProfileDetail', { id: item.id });
              }}
            >
              <Ionicons name="create-outline" size={18} color={Colors.primaryRust} />
            </TouchableOpacity>
            <PBadge text="POULTRY" variant="info" />
          </View>
        </PCard>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My Flock</Text>
          <Text style={styles.subtitle}>{totalBirdCount} total birds</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.quickStatsButton}
            onPress={() => {
              if (profiles.length > 0) {
                navigation.navigate('BirdProfileDetail', { id: profiles[0].id });
              } else {
                Alert.alert('No Profiles', 'Please create a bird profile first');
              }
            }}
          >
            <Ionicons name="stats-chart" size={20} color={Colors.primarySurface} />
            <Text style={styles.quickStatsText}>Quick Stats</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('SelectAnimalType')}
          >
            <Ionicons name="add" size={24} color={Colors.primarySurface} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statsSection}>
        <TouchableOpacity
          style={styles.overallStatsCard}
          onPress={() => {
            if (profiles.length > 0) {
              navigation.navigate('BirdProfileDetail', { id: profiles[0].id });
            } else {
              Alert.alert('No Profiles', 'Please create a bird profile first');
            }
          }}
        >
          <Ionicons name="bar-chart-outline" size={24} color={Colors.primaryRust} />
          <View style={styles.statsCardText}>
            <Text style={styles.statsCardTitle}>Overall Stats</Text>
            <Text style={styles.statsCardSubtitle}>View population data</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.mutedSienna} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={Colors.mutedSienna} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by ID"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.mutedSienna}
          />
        </View>
      </View>

      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          renderItem={({ item }) => (
            <PChip
              label={item}
              selected={selectedCategory === item}
              onPress={() => setSelectedCategory(item)}
            />
          )}
          keyExtractor={item => item}
          contentContainerStyle={styles.filterList}
        />
      </View>

      <FlatList
        data={filteredProfiles}
        renderItem={renderProfile}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color={Colors.softAsh} />
            <Text style={styles.emptyText}>No bird profiles found</Text>
          </View>
        }
      />
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
  },
  title: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: Typography.fontSize['2xl'],
    color: Colors.charcoalInk,
  },
  subtitle: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.sm,
    color: Colors.mutedSienna,
  },
  animalMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  wearOffBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryRust,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
  },
  wearOffText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 10,
    color: Colors.primarySurface,
    textTransform: 'uppercase',
  },
  animalMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  genderText: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.sm,
    color: Colors.mutedSienna,
  },
  dot: {
    color: Colors.mutedSienna,
    fontSize: Typography.fontSize.sm,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  quickStatsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryRust,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    gap: Spacing.xs,
  },
  quickStatsText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 12,
    color: Colors.primarySurface,
  },
  statsSection: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },
  overallStatsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primarySurface,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statsCardText: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  statsCardTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 14,
    color: Colors.charcoalInk,
  },
  statsCardSubtitle: {
    fontFamily: 'DMSans-Regular',
    fontSize: 12,
    color: Colors.mutedSienna,
  },
  profileActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  actionIconSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.warmSand,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: Colors.primaryRust,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primarySurface,
    paddingHorizontal: Spacing.md,
    height: 48,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.base,
    color: Colors.charcoalInk,
  },
  filterContainer: {
    marginBottom: Spacing.md,
  },
  filterList: {
    paddingHorizontal: Spacing.xl,
  },
  listContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  animalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  animalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.warmSand,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.lg,
  },
  details: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.sm,
    marginBottom: 2,
  },
  animalName: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: Typography.fontSize.lg,
    color: Colors.charcoalInk,
  },
  animalId: {
    fontFamily: 'DMMono-Regular',
    fontSize: Typography.fontSize.xs,
    color: Colors.mutedSienna,
  },
  breedText: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.sm,
    color: Colors.mutedSienna,
    marginBottom: Spacing.sm,
  },
  tagRow: {
    flexDirection: 'row',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.base,
    color: Colors.mutedSienna,
    marginTop: Spacing.md,
  },
});
