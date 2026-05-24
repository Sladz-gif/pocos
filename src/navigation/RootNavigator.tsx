import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuthStore } from '../store/authStore';
import { AuthNavigator } from './AuthNavigator';
import { RanchNavigator } from './RanchNavigator';
import { MarketplaceNavigator } from './MarketplaceNavigator';
import { AdminNavigator } from './AdminNavigator';
import { RootStackParamList } from './types';

const RootStack = createStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  const { isAuthenticated, userRole } = useAuthStore();

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        ) : userRole === 'buyer' ? (
          <RootStack.Screen name="Marketplace" component={MarketplaceNavigator} />
        ) : (
          <>
            <RootStack.Screen name="RanchApp" component={RanchNavigator} />
            <RootStack.Screen 
              name="AdminModal" 
              component={AdminNavigator} 
              options={{ presentation: 'modal' }}
            />
          </>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};
