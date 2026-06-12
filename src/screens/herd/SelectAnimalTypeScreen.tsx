import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, Radius } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { HerdStackParamList } from '../../navigation/types';
import { AnimalType } from '../../types/livestock';

type SelectAnimalTypeScreenProps = {
  navigation: StackNavigationProp<HerdStackParamList, 'SelectAnimalType'>;
};

const ANIMAL_TYPES: { type: AnimalType; label: string; icon: string; color: string }[] = [
  { type: 'cattle', label: 'Cattle', icon: 'cow', color: '#8B4513' },
  { type: 'sheep', label: 'Sheep', icon: 'cloud', color: '#D3D3D3' },
  { type: 'goat', label: 'Goat', icon: 'triangle', color: '#A0522D' },
  { type: 'horse', label: 'Horse', icon: 'paw', color: '#654321' },
  { type: 'donkey', label: 'Donkey', icon: 'body', color: '#696969' },
  { type: 'bird', label: 'Bird', icon: 'egg', color: '#FF6347' },
];

export const SelectAnimalTypeScreen: React.FC<SelectAnimalTypeScreenProps> = ({ navigation }) => {
  const handleSelect = (type: AnimalType) => {
    if (type === 'bird') {
      navigation.navigate('AddBirdProfile');
    } else {
      navigation.navigate('AddAnimal', { animalType: type });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color={Colors.charcoalInk} />
        </TouchableOpacity>
        <Text style={styles.title}>Select Animal Type</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>Choose the type of animal you want to add</Text>

        <View style={styles.grid}>
          {ANIMAL_TYPES.map((item) => (
            <TouchableOpacity
              key={item.type}
              style={styles.typeCard}
              onPress={() => handleSelect(item.type)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
                <Ionicons name={item.icon as any} size={40} color={item.color} />
              </View>
              <Text style={styles.typeLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
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
  subtitle: {
    fontFamily: 'DMSans-Regular',
    fontSize: Typography.fontSize.base,
    color: Colors.mutedSienna,
    marginBottom: Spacing.xl,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  typeCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.softAsh,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  typeLabel: {
    fontFamily: 'DMSans-Medium',
    fontSize: Typography.fontSize.base,
    color: Colors.charcoalInk,
  },
});
