import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { BrowseStackParamList } from '../types';
import { BrowseHomeScreen } from '../../screens/marketplace/BrowseHomeScreen';
import { ProductDetailScreen } from '../../screens/marketplace/ProductDetailScreen';
import { RanchProfileScreen } from '../../screens/marketplace/RanchProfileScreen';
import { AllProductsScreen } from '../../screens/marketplace/AllProductsScreen';
import { CartScreen } from '../../screens/marketplace/CartScreen';
import { CheckoutScreen } from '../../screens/marketplace/CheckoutScreen';

const Stack = createStackNavigator<BrowseStackParamList>();

export const BrowseStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="BrowseHome">
      <Stack.Screen name="BrowseHome" component={BrowseHomeScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="RanchProfile" component={RanchProfileScreen} />
      <Stack.Screen name="AllProducts" component={AllProductsScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
    </Stack.Navigator>
  );
};
