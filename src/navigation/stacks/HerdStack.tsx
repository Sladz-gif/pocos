import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { HerdStackParamList } from '../types';
import { HerdScreen } from '../../screens/herd/HerdScreen';
import { AnimalDetailScreen } from '../../screens/herd/AnimalDetailScreen';
import { AddAnimalScreen } from '../../screens/herd/AddAnimalScreen';
import { AncestryTreeScreen } from '../../screens/herd/AncestryTreeScreen';

const Stack = createStackNavigator<HerdStackParamList>();

export const HerdStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Herd" component={HerdScreen} />
      <Stack.Screen name="AnimalDetail" component={AnimalDetailScreen} />
      <Stack.Screen name="AddAnimal" component={AddAnimalScreen} />
      <Stack.Screen name="AncestryTree" component={AncestryTreeScreen} />
    </Stack.Navigator>
  );
};
