import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { HerdStackParamList } from '../types';
import { HerdScreen } from '../../screens/herd/HerdScreen';
import { AnimalDetailScreen } from '../../screens/herd/AnimalDetailScreen';
import { AddAnimalScreen } from '../../screens/herd/AddAnimalScreen';
import { AncestryTreeScreen } from '../../screens/herd/AncestryTreeScreen';
import { ProfileDetailScreen } from '../../screens/herd/ProfileDetailScreen';
import { BirdCountScreen } from '../../screens/herd/BirdCountScreen';
import { BirdCountHistoryScreen } from '../../screens/herd/BirdCountHistoryScreen';
import { AddBirdProfileScreen } from '../../screens/herd/AddBirdProfileScreen';
import { BirdProfileDetailScreen } from '../../screens/herd/BirdProfileDetailScreen';
import { CreateProfileScreen } from '../../screens/herd/CreateProfileScreen';
import { SelectAnimalTypeScreen } from '../../screens/herd/SelectAnimalTypeScreen';

const Stack = createStackNavigator<HerdStackParamList>();

export const HerdStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Herd" component={HerdScreen} />
      <Stack.Screen name="AnimalDetail" component={AnimalDetailScreen} />
      <Stack.Screen name="AddAnimal" component={AddAnimalScreen} />
      <Stack.Screen name="AncestryTree" component={AncestryTreeScreen} />
      <Stack.Screen name="ProfileDetail" component={ProfileDetailScreen} />
      <Stack.Screen name="BirdCount" component={BirdCountScreen} />
      <Stack.Screen name="BirdCountHistory" component={BirdCountHistoryScreen} />
      <Stack.Screen name="AddBirdProfile" component={AddBirdProfileScreen} />
      <Stack.Screen name="BirdProfileDetail" component={BirdProfileDetailScreen} />
      <Stack.Screen name="CreateProfile" component={CreateProfileScreen} />
      <Stack.Screen name="SelectAnimalType" component={SelectAnimalTypeScreen} />
    </Stack.Navigator>
  );
};
