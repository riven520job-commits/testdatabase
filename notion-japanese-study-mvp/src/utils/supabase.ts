import { createClient } from "@supabase/supabase-js";

// Publishable keys are designed for browser clients. Row access is protected by RLS.
const SUPABASE_URL = "https://iqbkizoojhcjeoabghvq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_UBILTYcAxnDMitdXDWCOoA_2ioS966t";
export const APP_URL = "https://riven520job-commits.github.io/testdatabase/";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
