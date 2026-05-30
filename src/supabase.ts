// Thin shim re-exporting the Lovable-managed Supabase client so that
// repo modules importing `../supabase` continue to work.
import { supabase } from "@/integrations/supabase/client";

export { supabase };
export const isSupabaseEnabled = true;
export default supabase;
