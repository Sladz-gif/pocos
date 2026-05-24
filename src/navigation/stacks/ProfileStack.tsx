import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ProfileStackParamList } from '../types';
import { ConsumerProfileScreen } from '../../screens/marketplace/ConsumerProfileScreen';
import { DeliveryAddressesScreen } from '../../screens/marketplace/DeliveryAddressesScreen';
import { PaymentMethodsScreen } from '../../screens/marketplace/PaymentMethodsScreen';

const Stack = createStackNavigator<ProfileStackParamList>();

export const ProfileStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileHome" component={ConsumerProfileScreen} />
      <Stack.Screen name="DeliveryAddresses" component={DeliveryAddressesScreen} />
      <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
    </Stack.Navigator>
  );
};
