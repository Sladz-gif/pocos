import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ChatStackParamList } from '../types';
import { ChatHomeScreen } from '../../screens/chat/ChatHomeScreen';
import { ConversationScreen } from '../../screens/chat/ConversationScreen';

const Stack = createStackNavigator<ChatStackParamList>();

export const ChatStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ChatHome" component={ChatHomeScreen} />
      <Stack.Screen name="Conversation" component={ConversationScreen} />
    </Stack.Navigator>
  );
};
