import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, Radius } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import { PCard, PBadge, PChip, PInput, PButton } from '../../components/ui';
import { StackNavigationProp } from '@react-navigation/stack';
import { HerdStackParamList } from '../../navigation/types';
import { useLivestockStore } from '../../store/livestockStore';
import { useProfileStore } from '../../store/profileStore';
import { useAuthStore } from '../../store/authStore';
import { Animal } from '../../types/livestock';

type HerdScreenProps = {
  navigation: StackNavigationProp<HerdStackParamList, 'Herd'>;
};

const CATEGORIES = ['All', 'Cattle', 'Calves', 'Bulls', 'Heifers', 'Birds'];

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

  const filteredAnimals = animals.filter(animal => {
    const matchesSearch = animal.animalId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         animal.tagNumber?.toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedCategory === 'All') return matchesSearch;
    if (selectedCategory === 'Cattle') return matchesSearch;
    if (selectedCategory === 'Bulls') return matchesSearch && animal.sex?.toLowerCase() === 'male';
    if (selectedCategory === 'Heifers') return matchesSearch && animal.sex?.toLowerCase() === 'female';
    if (selectedCategory === 'Calves') return matchesSearch && animal.age !== undefined && animal.age < 1;
    return matchesSearch;
  });

  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch = profile.name?.toLowerCase().includes(searchQuery.toLowerCase());
    if (selectedCategory === 'All') return matchesSearch && profile.animalType === 'bird';
    if (selectedCategory === 'Birds') return matchesSearch && profile.animalType === 'bird';
    return false;
  });

  const renderProfile = ({ item }: { item: any }) => (
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
            <Text style={styles.breedText}>{item.animalType} • Profile</Text>
          </View>
        </View>
        <PBadge text="POULTRY" variant="info" />
      </PCard>
    </TouchableOpacity>
  );

  const renderAnimal = ({ item }: { item: Animal }) => {
    const isWearOffActive = item.isMedicated && item.medicationDate && (
      (new Date().getTime() - new Date(item.medicationDate).getTime()) < (28 * 24 * 60 * 60 * 1000)
    );
    
    return (
      <TouchableOpacity 
        onPress={() => {
          setSelectedAnimal(item);
          navigation.navigate('AnimalDetail', { id: item.id });
        }}
      >
        <PCard style={styles.animalCard}>
          <View style={styles.animalInfo}>
            <View style={styles.animalMain}>
              <Text style={styles.animalId}>{item.animalId || item.tagNumber || 'No ID'}</Text>
              {isWearOffActive && (
                <View style={styles.wearOffBadge}>
                  <Ionicons name="time-outline" size={12} color="#FFFFFF" />
                  <Text style={styles.wearOffText}>Wear-off</Text>
                </View>
              )}
            </View>
            <View style={styles.animalMeta}>
              <Text style={styles.breedText}>{item.breed}</Text>
              <Text style={styles.dot}>•</Text>
              <Text style={styles.genderText}>{item.sex || 'Unknown'}</Text>
            </View>
          </View>
          <PBadge 
            text={(item.healthStatus || 'healthy').toUpperCase()} 
            variant={item.healthStatus === 'sick' ? 'error' : 'success'} 
          />
        </PCard>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My Herd</Text>
          <Text style={styles.subtitle}>{animals.length} animals registered</Text>
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('SelectAnimalType')}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
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
        data={selectedCategory === 'Birds' ? filteredProfiles : [...filteredAnimals, ...(selectedCategory === 'All' ? filteredProfiles : [])]}
        renderItem={({ item }) => 'sex' in item ? renderAnimal({ item }) : renderProfile({ item })}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color={Colors.softAsh} />
            <Text style={styles.emptyText}>No animals found</Text>
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
    color: '#FFFFFF',
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
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.md,
    height: 48,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.softAsh,
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
