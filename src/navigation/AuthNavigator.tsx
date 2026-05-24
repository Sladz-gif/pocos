import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthStackParamList } from './types';
import { WelcomeScreen } from '../screens/auth/WelcomeScreen';
import { RanchLoginScreen } from '../screens/auth/RanchLoginScreen';
import { RanchOwnerLoginScreen } from '../screens/auth/RanchOwnerLoginScreen';
import { RanchOwnerSignUpScreen } from '../screens/auth/RanchOwnerSignUpScreen';
import { ConsumerSignUpScreen } from '../screens/auth/ConsumerSignUpScreen';
import { ConsumerSignInScreen } from '../screens/auth/ConsumerSignInScreen';

const Stack = createStackNavigator<AuthStackParamList>();

export const AuthNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="RanchLogin" component={RanchLoginScreen} />
      <Stack.Screen name="RanchOwnerLogin" component={RanchOwnerLoginScreen} />
      <Stack.Screen name="RanchOwnerSignUp" component={RanchOwnerSignUpScreen} />
      <Stack.Screen name="ConsumerSignUp" component={ConsumerSignUpScreen} />
      <Stack.Screen name="ConsumerSignIn" component={ConsumerSignInScreen} />
    </Stack.Navigator>
  );
};
