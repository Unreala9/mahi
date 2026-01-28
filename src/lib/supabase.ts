// Re-use the application's configured Supabase client so that
// Edge Function calls made via `supabase.functions.invoke` include
// the authenticated session (Authorization header) when available.
import { supabase as integrationsSupabase } from "@/integrations/supabase/client";

export const supabase = integrationsSupabase;
