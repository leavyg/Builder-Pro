import { createBrowserClient } from "@supabase/ssr";

// Browser-side Supabase client. Uses the public "anon" key, so it is only ever
// allowed to do what the RLS policies permit. Safe to use in client components.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
