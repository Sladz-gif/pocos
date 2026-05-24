import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts, PlayfairDisplay_700Bold, PlayfairDisplay_400Regular, PlayfairDisplay_500Medium, PlayfairDisplay_600SemiBold } from '@expo-google-fonts/playfair-display';
import { DMSans_400Regular, DMSans_500Medium, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { DMMono_400Regular, DMMono_500Medium } from '@expo-google-fonts/dm-mono';
import * as SplashScreen from 'expo-splash-screen';
import { StyleSheet } from 'react-native';

import { notificationService } from '../services/notificationService';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../config/supabase';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

interface RootProviderProps {
  children: React.ReactNode;
}

export const RootProvider: React.FC<RootProviderProps> = ({ children }) => {
  const [ready, setReady] = useState(false);
  const restoreSession = useAuthStore((s) => s.restoreSession);

  useEffect(() => {
    const init = async () => {
      // Diagnostic: Test Supabase connectivity
      try {
        const { error } = await supabase.from('ranch').select('count', { count: 'exact', head: true });
        if (error) {
          console.error('Supabase Connectivity Check Failed:', error.message);
        } else {
          console.log('Supabase Connectivity Check: SUCCESS');
        }
      } catch (e) {
        console.error('Supabase Connectivity Check: Network Error', e);
      }

      await notificationService.requestPermissions();
      await restoreSession();
      setReady(true);
    };
    init();
  }, [restoreSession]);

  const [fontsLoaded, fontError] = useFonts({
    'PlayfairDisplay-Regular': PlayfairDisplay_400Regular,
    'PlayfairDisplay-Medium': PlayfairDisplay_500Medium,
    'PlayfairDisplay-SemiBold': PlayfairDisplay_600SemiBold,
    'PlayfairDisplay-Bold': PlayfairDisplay_700Bold,
    'DMSans-Regular': DMSans_400Regular,
    'DMSans-Medium': DMSans_500Medium,
    'DMSans-Bold': DMSans_700Bold,
    'DMMono-Regular': DMMono_400Regular,
    'DMMono-Medium': DMMono_500Medium,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!ready || (!fontsLoaded && !fontError)) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        {children}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
