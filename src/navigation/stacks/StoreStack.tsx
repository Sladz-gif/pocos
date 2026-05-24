import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { StoreStackParamList } from '../types';
import { StoreManageScreen } from '../../screens/store/StoreManageScreen';
import { StoreListingDetailScreen } from '../../screens/store/StoreListingDetailScreen';
import { AddListingScreen } from '../../screens/store/AddListingScreen';
import { OrdersScreen } from '../../screens/store/OrdersScreen';
import { DiscountsScreen } from '../../screens/store/DiscountsScreen';
import { AddDiscountScreen } from '../../screens/store/AddDiscountScreen';

// Stack for Store management features
const Stack = createStackNavigator<StoreStackParamList>();

export const StoreStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="StoreManage" component={StoreManageScreen} />
      <Stack.Screen name="StoreListingDetail" component={StoreListingDetailScreen} />
      <Stack.Screen name="AddListing" component={AddListingScreen} />
      <Stack.Screen name="Orders" component={OrdersScreen} />
      <Stack.Screen name="Discounts" component={DiscountsScreen} />
      <Stack.Screen name="AddDiscount" component={AddDiscountScreen} />
    </Stack.Navigator>
  );
};
