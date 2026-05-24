import React from 'react';
import { RootProvider } from './providers/RootProvider';
import { RootNavigator } from './navigation/RootNavigator';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  return (
    <RootProvider>
      <StatusBar style="auto" />
      <RootNavigator />
    </RootProvider>
  );
}
