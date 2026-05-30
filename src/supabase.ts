// Thin shim re-exporting the Lovable-managed Supabase client so that
// repo modules importing `../supabase` continue to work.
//
// We retype as `any` because this ported app expects custom tables
// (`profiles`, `exercises`, `habits`, `meals`, `todos`) that are not yet
// defined in the auto-generated `Database` types. The app gracefully falls
// back to local-storage demo mode when those tables are unavailable.
import { supabase as typedSupabase } from "@/integrations/supabase/client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase: any = typedSupabase;
export const isSupabaseEnabled = true;
export default supabase;
