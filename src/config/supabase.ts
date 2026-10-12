import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Read from Constants.expoConfig.extra for production builds
// Falls back to process.env for development
const SUPABASE_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

console.log('Supabase Initialization Check:');
console.log('URL defined:', !!SUPABASE_URL);
console.log('Key defined:', !!SUPABASE_ANON_KEY);
if (SUPABASE_URL) console.log('URL:', SUPABASE_URL);
if (SUPABASE_ANON_KEY) console.log('Key length:', SUPABASE_ANON_KEY.length);

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('CRITICAL: Supabase configuration missing! Check your .env file or app.json extra section.');
}

export const supabase = createClient(SUPABASE_URL || '', SUPABASE_ANON_KEY || '', {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      'Connection': 'keep-alive',
    },
  },
  db: {
    schema: 'public',
  },
});
