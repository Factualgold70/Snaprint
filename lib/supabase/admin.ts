import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Service-role client for server-only cron/background jobs that need to act
// across all users (RLS is bypassed - never expose this client to the browser).
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
