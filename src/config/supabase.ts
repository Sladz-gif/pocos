import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

console.log('Supabase Initialization Check:');
console.log('URL defined:', !!SUPABASE_URL);
console.log('Key defined:', !!SUPABASE_ANON_KEY);
if (SUPABASE_URL) console.log('URL prefix:', SUPABASE_URL.substring(0, 15));

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('CRITICAL: Supabase configuration missing! Check your .env file.');
}

export const supabase = createClient(SUPABASE_URL || '', SUPABASE_ANON_KEY || '', {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
