import "server-only";
import { createClient } from "@supabase/supabase-js";

// Admin client using the SECRET service-role key. It BYPASSES all RLS rules,
// so it must NEVER reach the browser — the "server-only" import above makes the
// build fail if this file is ever imported into client code.
//
// Used for: the contractor's no-login /fix/<token> flow, and signing photo URLs.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
