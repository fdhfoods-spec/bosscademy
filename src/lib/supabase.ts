import { createClient } from '@supabase/supabase-js';

// These should ideally come from environment variables.
// Using placeholders until the user provides the actual URL and Anon Key.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const IS_MOCK_SUPABASE = supabaseUrl.includes('placeholder');
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// For Admin pages only, to bypass RLS since Admin is a mock user without a real Supabase auth token.
// Note: In a production app, the Service Role Key should never be exposed to the client.
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey) 
  : supabase;
