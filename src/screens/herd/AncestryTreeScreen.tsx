import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, Radius } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { HerdStackParamList } from '../../navigation/types';
import { RouteProp } from '@react-navigation/native';
import { useLivestockStore } from '../../store/livestockStore';
import { PBadge } from '../../components/ui';

type AncestryTreeScreenProps = {
  route: RouteProp<HerdStackParamList, 'AncestryTree'>;
  navigation: StackNavigationProp<HerdStackParamList, 'AncestryTree'>;
};

interface AncestorRow {
  relation: string;
  animalId: string;
  breed: string;
  gender: string;
  id: string | null;
}

export const AncestryTreeScreen: React.FC<AncestryTreeScreenProps> = ({ route, navigation }) => {
  const { id } = route.params;
  const { animals } = useLivestockStore();

  const selectedAnimal = animals.find(a => a.id === id);

  if (!selectedAnimal) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Animal not found</Text>
      </SafeAreaView>
    );
  }

  const findAnimal = (animalId?: string) => animals.find(a => a.id === animalId || a.animalId === animalId);

  const ancestors: AncestorRow[] = [];

  // Parents
  const mother = findAnimal(selectedAnimal.motherId);
  const father = findAnimal(selectedAnimal.fatherId);

  ancestors.push({
    relation: 'Mother',
    animalId: mother?.animalId || selectedAnimal.motherId || 'Unknown',
    breed: mother?.breed || 'N/A',
    gender: 'Female',
    id: mother?.id || null,
  });

  ancestors.push({
    relation: 'Father',
    animalId: father?.animalId || selectedAnimal.fatherId || 'Unknown',
    breed: father?.breed || 'N/A',
    gender: 'Male',
    id: father?.id || null,
  });

  // Grandparents
  if (mother) {
    const mMother = findAnimal(mother.motherId);
    const mFather = findAnimal(mother.fatherId);
    ancestors.push({
      relation: 'Maternal Grandmother',
      animalId: mMother?.animalId || mother.motherId || 'Unknown',
      breed: mMother?.breed || 'N/A',
      gender: 'Female',
      id: mMother?.id || null,
    });
    ancestors.push({
      relation: 'Maternal Grandfather',
      animalId: mFather?.animalId || mother.fatherId || 'Unknown',
      breed: mFather?.breed || 'N/A',
      gender: 'Male',
      id: mFather?.id || null,
    });
  }

  if (father) {
    const fMother = findAnimal(father.motherId);
    const fFather = findAnimal(father.fatherId);
    ancestors.push({
      relation: 'Paternal Grandmother',
      animalId: fMother?.animalId || father.motherId || 'Unknown',
      breed: fMother?.breed || 'N/A',
      gender: 'Female',
      id: fMother?.id || null,
    });
    ancestors.push({
      relation: 'Paternal Grandfather',
      animalId: fFather?.animalId || father.fatherId || 'Unknown',
      breed: fFather?.breed || 'N/A',
      gender: 'Male',
      id: fFather?.id || null,
    });
  }

  // Offspring
  const offspring = animals.filter(a => a.motherId === selectedAnimal.id || a.fatherId === selectedAnimal.id || a.motherId === selectedAnimal.animalId || a.fatherId === selectedAnimal.animalId);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.charcoalInk} />
        </TouchableOpacity>
        <Text style={styles.title}>Ancestry & Family</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ancestry Table</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.headerCell, { flex: 1.5 }]}>Relation</Text>
              <Text style={[styles.headerCell, { flex: 1 }]}>ID/Tag</Text>
              <Text style={[styles.headerCell, { flex: 1 }]}>Breed</Text>
            </View>
            {ancestors.map((ancestor, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.tableRow}
                onPress={() => ancestor.id && navigation.navigate('AnimalDetail', { id: ancestor.id })}
                disabled={!ancestor.id}
              >
                <Text style={[styles.cell, { flex: 1.5, fontFamily: 'DMSans-Bold' }]}>{ancestor.relation}</Text>
                <Text style={[styles.cell, { flex: 1, color: ancestor.id ? Colors.primaryRust : Colors.mutedSienna }]}>
                  {ancestor.animalId}
                </Text>
                <Text style={[styles.cell, { flex: 1 }]}>{ancestor.breed}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Offspring (Family Tree)</Text>
          {offspring.length > 0 ? (
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.headerCell, { flex: 1 }]}>ID/Tag</Text>
                <Text style={[styles.headerCell, { flex: 1 }]}>Breed</Text>
                <Text style={[styles.headerCell, { flex: 1 }]}>Gender</Text>
              </View>
              {offspring.map((child) => (
                <TouchableOpacity 
                  key={child.id} 
                  style={styles.tableRow}
                  onPress={() => navigation.navigate('AnimalDetail', { id: child.id })}
                >
                  <Text style={[styles.cell, { flex: 1, color: Colors.primaryRust }]}>{child.animalId}</Text>
                  <Text style={[styles.cell, { flex: 1 }]}>{child.breed}</Text>
                  <Text style={[styles.cell, { flex: 1 }]}>{child.sex}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>No offspring recorded.</Text>
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
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: Colors.softAsh,
  },
  title: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 20,
    color: Colors.charcoalInk,
  },
  content: {
    padding: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: Typography.fontSize.lg,
    color: Colors.charcoalInk,
    marginBottom: Spacing.md,
  },
  table: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: Colors.softAsh,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: Colors.warmSand,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.softAsh,
  },
  headerCell: {
    fontFamily: 'DMSans-Bold',
    fontSize: Typography.fontSize.xs,
    color: Colors.mutedSienna,
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.softAsh,
    alignItems: 'center',
  },
  cell: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.sm,
    color: Colors.charcoalInk,
  },
  emptyText: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.sm,
    color: Colors.mutedSienna,
    textAlign: 'center',
    padding: Spacing.xl,
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.md,
  },
  errorText: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.base,
    color: Colors.errorRed,
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
});
