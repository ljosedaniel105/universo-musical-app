import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'TU_URL_DE_SUPABASE';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'TU_CLAVE_ANON_DE_SUPABASE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
