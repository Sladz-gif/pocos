import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { OrdersStackParamList } from '../types';
import { ConsumerOrdersScreen } from '../../screens/marketplace/ConsumerOrdersScreen';
import { ConversationScreen } from '../../screens/chat/ConversationScreen';

const Stack = createStackNavigator<OrdersStackParamList>();

export const OrdersStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="OrdersList" component={ConsumerOrdersScreen} />
      <Stack.Screen name="Conversation" component={ConversationScreen} />
    </Stack.Navigator>
  );
};
