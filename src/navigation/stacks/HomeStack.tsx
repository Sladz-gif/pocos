import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { HomeStackParamList } from '../types';
import { HomeScreen } from '../../screens/home/HomeScreen';
import { StaffActivityMonitorScreen } from '../../screens/home/StaffActivityMonitorScreen';

const Stack = createStackNavigator<HomeStackParamList>();

export const HomeStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="StaffActivityMonitor" component={StaffActivityMonitorScreen} />
    </Stack.Navigator>
  );
};
