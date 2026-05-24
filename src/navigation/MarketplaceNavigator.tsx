import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MarketplaceTabParamList } from './types';
import { BrowseStack } from './stacks/BrowseStack';
import { ProfileStack } from './stacks/ProfileStack';
import { OrdersStack } from './stacks/OrdersStack';
import { SavedScreen } from '../screens/marketplace/SavedScreen';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants';

const Tab = createBottomTabNavigator<MarketplaceTabParamList>();

export const MarketplaceNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: Colors.primaryRust,
        tabBarInactiveTintColor: Colors.mutedSienna,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: Colors.softAsh,
          paddingTop: 8,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'cart';

          if (route.name === 'BrowseStack') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Saved') {
            iconName = focused ? 'heart' : 'heart-outline';
          } else if (route.name === 'OrdersStack') {
            iconName = focused ? 'receipt' : 'receipt-outline';
          } else if (route.name === 'ProfileStack') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen 
        name="BrowseStack" 
        component={BrowseStack} 
        options={{ title: 'Browse' }}
      />
      <Tab.Screen 
        name="Saved" 
        component={SavedScreen} 
        options={{ title: 'Saved' }}
      />
      <Tab.Screen 
        name="OrdersStack" 
        component={OrdersStack} 
        options={{ title: 'Orders' }}
      />
      <Tab.Screen 
        name="ProfileStack" 
        component={ProfileStack} 
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};
