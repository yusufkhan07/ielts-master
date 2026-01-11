import { createClient } from '@supabase/supabase-js';

// Create a single supabase client for interacting with your database
export const createSupabaseClient = (supabaseUrl: string, supabaseKey: string) => {
  return createClient(supabaseUrl, supabaseKey);
};

// Export types (will be generated from Supabase schema)
export type { Database } from './types';
